import { KBX, kbSearch } from "../../../lib/kb";
import { hasLLM, llm } from "../../../lib/llm";
const hits = new Map();
function limited(ip) { const now = Date.now(), w = (hits.get(ip) || []).filter((t) => now - t < 60000); w.push(now); hits.set(ip, w); if (hits.size > 5000) hits.clear(); return w.length > 20; }
export async function POST(req) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "x";
  if (limited(ip)) return Response.json({ a: null, rl: 1 }, { status: 429 });
  let q = "", lang = "fr", path = "", hist = [];
  try { ({ q = "", lang = "fr", path = "", hist = [] } = await req.json()); } catch {}
  q = String(q).slice(0, 600); lang = lang === "en" ? "en" : "fr"; path = String(path).slice(0, 80);
  if (!q.trim()) return Response.json({ a: null });
  const r = kbSearch(q, lang, 3); const top = r[0]?.e; const rel = r.slice(1).map((x) => x.e.id);
  if (top && r[0].s >= 3) return Response.json({ id: top.id, a: top.a[lang], href: top.href?.[lang], rel: [...new Set([...rel, ...top.rel])].slice(0, 3), src: "kb" });
  if (hasLLM()) {
    try {
      const kb = KBX.map((e) => `- ${e.q[lang]}: ${e.a[lang]}`).join("\n");
      const h = (Array.isArray(hist) ? hist : []).slice(-4).map((m) => `${m.me ? "User" : "Assistant"}: ${String(m.t).slice(0, 300)}`).join("\n");
      const sys = `You are Bonova's support assistant. Bonova is a free invoicing web app for freelancers and small businesses. The user is on page "${path}". Answer in ${lang === "en" ? "English" : "French"}, in 1-3 short, friendly sentences, using ONLY the facts below. Never invent features or prices. If not covered, reply exactly: HUMAN.\n${kb}\n\nRecent conversation:\n${h}`;
      const a = (await llm(sys, q)).trim();
      if (a && !/^HUMAN/.test(a)) return Response.json({ a, rel: r.map((x) => x.e.id).slice(0, 3), src: "llm" });
      return Response.json({ a: null, rel: r.map((x) => x.e.id) });
    } catch {}
  }
  if (top) return Response.json({ id: top.id, a: top.a[lang], href: top.href?.[lang], rel: [...new Set([...rel, ...top.rel])].slice(0, 3), src: "kb" });
  return Response.json({ a: null });
}
