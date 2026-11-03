// Limiteur simple en mémoire (par instance serverless) : suffisant contre les rafales.
const B = new Map();
export function limited(req, key, max = 20, ms = 60000) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "x"; const k = key + ":" + ip; const now = Date.now();
  const w = (B.get(k) || []).filter((t) => now - t < ms); w.push(now); B.set(k, w); if (B.size > 10000) B.clear(); return w.length > max;
}
export const tooMany = () => Response.json({ error: "RATE_LIMIT" }, { status: 429, headers: { "retry-after": "60" } });
