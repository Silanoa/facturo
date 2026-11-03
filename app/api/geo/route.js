import { NextResponse } from "next/server";
import { COUNTRIES } from "../../../lib/countries";
export const dynamic = "force-dynamic";
// Pays du visiteur (en-tête Vercel), pour préremplir devise, TVA et moyens de paiement. Rien n'est stocké.
export function GET(req) {
  const c = (req.headers.get("x-vercel-ip-country") || "").toUpperCase();
  return NextResponse.json({ country: COUNTRIES.some((x) => x.code === c) ? c : null, raw: c || null });
}
