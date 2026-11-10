// Dictée : audio enregistré dans le navigateur (MediaRecorder) -> transcription Groq Whisper, sinon Gemini (audio en ligne).
import { limited, tooMany } from "../../../../lib/ratelimit";
import { gemini, geminiReady } from "../../../../lib/llm";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const MAX = 3 * 1024 * 1024; // ~60 s, même en AAC Safari
const EXT = { "audio/webm": "webm", "audio/mp4": "mp4", "audio/x-m4a": "m4a", "audio/aac": "m4a", "audio/ogg": "ogg", "audio/wav": "wav", "audio/mpeg": "mp3" };
const PROMPT = { fr: "Facture, devis, reçu. Création d'un logo à 150 000 francs CFA, trois jours de formation à 60 000, pour Atlas Conseil, à payer sous 15 jours.", en: "Invoice, quote, receipt. Logo design at 900 dollars, three days of training at 400 each, for Northwind Ltd, due in 14 days." };
// Phrases que Whisper invente sur du silence.
const JUNK = /(sous-titr|amara\.org|merci d'avoir regard|abonnez-vous|thanks for watching|thank you for watching|subscribe to)/i;
const j = (b, s = 200) => Response.json(b, { status: s, headers: { "cache-control": "no-store" } });
const has = () => !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
const GSYS = { fr: "Tu transcris un enregistrement audio dicté pour une facture. Réponds uniquement par la transcription mot pour mot, en français, sans commentaire, sans guillemets, sans traduction. Écris les montants et quantités en chiffres. N'ajoute rien qui n'a pas été dit. N'invente jamais de contenu : si l'audio est silencieux, inaudible ou ne contient que du bruit, réponds exactement : <vide>", en: "You transcribe an audio recording dictated for an invoice. Reply only with the verbatim transcription, in English, with no comment, no quotes, no translation. Write amounts and quantities in digits. Add nothing that was not said. Never make up content: if the audio is silent, inaudible or only noise, reply exactly: <empty>" };
export async function GET() { return j({ ok: !!process.env.GROQ_API_KEY || await geminiReady() }); }
export async function POST(req) {
  if (!has()) return j({ error: "UNAVAILABLE" }, 503);
  if (await limited(req, "stt", 8, 60) || await limited(req, "stt-h", 60, 3600) || await limited({ headers: new Headers() }, "stt-day-all", 900, 86400)) return tooMany(); // dernier : plafond global pour rester dans l'offre gratuite
  const len = +(req.headers.get("content-length") || 0); if (len > MAX) return j({ error: "TOO_LARGE" }, 413);
  const type = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!EXT[type]) return j({ error: "BAD_TYPE" }, 415);
  const buf = await req.arrayBuffer().catch(() => null);
  if (!buf || buf.byteLength < 800) return j({ error: "EMPTY" }, 400);
  if (buf.byteLength > MAX) return j({ error: "TOO_LARGE" }, 413);
  const lang = new URL(req.url).searchParams.get("lang") === "en" ? "en" : "fr";
  if (!process.env.GROQ_API_KEY) {
    let text; try { text = await gemini([{ inline_data: { mime_type: type === "audio/x-m4a" ? "audio/mp4" : type, data: Buffer.from(buf).toString("base64") } }], GSYS[lang], { maxOutputTokens: 700 }, 13000); }
    catch (e) { return e.status === 429 ? tooMany() : j({ error: "UPSTREAM" }, 502); }
    text = (text || "").replace(/^["«»“”\s]+|["«»“”\s]+$/g, "").replace(/\s+/g, " ").trim();
    if (!text || /^<(vide|empty)>$/i.test(text) || JUNK.test(text) && text.length < 80) return j({ text: "" });
    return j({ text: text.slice(0, 2000) });
  }
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type }), "dictee." + EXT[type]);
  fd.append("model", process.env.GROQ_STT_MODEL || "whisper-large-v3-turbo");
  fd.append("language", lang); fd.append("temperature", "0"); fd.append("response_format", "verbose_json"); fd.append("prompt", PROMPT[lang]);
  let r; try { r = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", { method: "POST", headers: { authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: fd, signal: AbortSignal.timeout(25000) }); } catch { return j({ error: "UPSTREAM" }, 502); }
  if (r.status === 429) return tooMany();
  if (!r.ok) { console.error("stt", r.status, (await r.text().catch(() => "")).slice(0, 300)); return j({ error: "UPSTREAM" }, 502); }
  const o = await r.json().catch(() => ({}));
  const segs = Array.isArray(o.segments) ? o.segments.filter((s) => !(s.no_speech_prob > 0.6 && s.avg_logprob < -0.8)).map((s) => s.text) : [o.text || ""];
  const text = segs.join(" ").replace(/\s+/g, " ").trim();
  if (!text || JUNK.test(text) && text.length < 80) return j({ text: "" });
  return j({ text: text.slice(0, 2000) });
}
