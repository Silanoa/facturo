import { NextResponse } from "next/server";
import { COUNTRIES } from "../../../lib/countries";
export const dynamic = "force-dynamic";
// Pays du visiteur : en-tête IP de Vercel, sinon région de la langue du navigateur. Rien n'est stocké.
const ok = (c) => (c && COUNTRIES.some((x) => x.code === c) ? c : null);
export function GET(req) {
  const ip = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const al = (req.headers.get("accept-language") || "").split(",").map((x) => (/-([A-Za-z]{2})\b/.exec(x) || [])[1]).filter(Boolean).map((x) => x.toUpperCase());
  const country = ok(ip) || (ip && ip !== "XX" ? "ZZ" : null) || al.map(ok).find(Boolean) || null;
  return NextResponse.json({ country, ip: ip || null, source: ok(ip) ? "ip" : country ? "lang" : null }, { headers: { "cache-control": "no-store" } });
}
