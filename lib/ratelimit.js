// Limiteur partagé (table privée Supabase via rl_hit), repli en mémoire si la base ne répond pas.
import { createHash } from "crypto";
const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm";
const M = new Map();
export async function limited(req, key, max = 20, sec = 60) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "x";
  const k = key + ":" + createHash("sha256").update(ip + "bnv").digest("hex").slice(0, 24);
  try {
    const r = await fetch(`${SB}/rest/v1/rpc/rl_hit`, { method: "POST", headers: { apikey: KEY, authorization: `Bearer ${KEY}`, "content-type": "application/json" }, body: JSON.stringify({ p_key: k, p_max: max, p_sec: sec }), cache: "no-store", signal: AbortSignal.timeout(1500) });
    if (r.ok) return (await r.json()) === true;
  } catch {}
  const now = Date.now(); const w = (M.get(k) || []).filter((t) => now - t < sec * 1000); w.push(now); M.set(k, w); if (M.size > 10000) M.clear(); return w.length > max;
}
export const tooMany = () => Response.json({ error: "RATE_LIMIT" }, { status: 429, headers: { "retry-after": "60" } });
