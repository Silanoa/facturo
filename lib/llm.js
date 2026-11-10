// IA optionnelle sur offres gratuites : Groq (GROQ_API_KEY) ou Google Gemini (GEMINI_API_KEY).
// Sans clé, l'application utilise l'analyse locale (lib/parse.js) : rien ne casse.
export const hasLLM = () => !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
const GM = () => [process.env.GEMINI_MODEL || "gemini-3.1-flash-lite", "gemini-flash-lite-latest"];
// Clé refusée par Google : on n'insiste pas pendant 10 min (évite des appels inutiles).
let badUntil = 0, readyAt = 0, ready = false;
const authFail = (st, body) => st === 401 || st === 403 || (st === 400 && /api key/i.test(body));
// Vérification gratuite (lecture des métadonnées du modèle, sans consommer de quota), mise en cache 10 min.
export async function geminiReady() {
  if (!process.env.GEMINI_API_KEY || Date.now() < badUntil) return false;
  if (Date.now() - readyAt < 600000) return ready;
  try { const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GM()[0]}`, { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY }, signal: AbortSignal.timeout(3000) }); ready = r.ok; if (!r.ok) console.error("gemini check", r.status); } catch { return false; }
  readyAt = Date.now(); return ready;
}
// Appel Gemini avec repli sur un second modèle (quota, modèle retiré). Lève une erreur { status } si tout échoue.
export async function gemini(parts, system, gen = {}, timeout = 20000) {
  if (Date.now() < badUntil) throw { status: 503 };
  let last = { status: 502 };
  for (const model of [...new Set(GM())]) {
    let r; try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts }], generationConfig: { temperature: 0, ...gen } }), signal: AbortSignal.timeout(timeout) });
    } catch { last = { status: 504 }; continue; }
    if (r.ok) { const j = await r.json().catch(() => ({})); return (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").trim(); }
    const body = (await r.text().catch(() => "")).slice(0, 300); last = { status: r.status }; console.error("gemini", model, r.status, body.slice(0, 200));
    if (authFail(r.status, body)) { badUntil = Date.now() + 600000; ready = false; readyAt = Date.now(); break; }
    if (r.status === 400) break;
  }
  throw last;
}
export async function llm(system, user, json = false) {
  if (process.env.GROQ_API_KEY) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", temperature: 0.2, messages: [{ role: "system", content: system }, { role: "user", content: user }], ...(json ? { response_format: { type: "json_object" } } : {}) }) });
    const j = await r.json(); return j.choices?.[0]?.message?.content || "";
  }
  if (process.env.GEMINI_API_KEY) return gemini([{ text: user }], system, json ? { responseMimeType: "application/json" } : {}, 3500);
  return "";
}
