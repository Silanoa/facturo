import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const dynamic = "force-dynamic";
// Indique seulement si chaque service est configuré (jamais les valeurs). Réservé aux admins.
export async function GET(req) {
  const tok = (req.headers.get("authorization") || "").replace(/^Bearer /, "");
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm", { global: { headers: { Authorization: `Bearer ${tok}` } } });
  const [{ data }, { data: u }] = await Promise.all([sb.rpc("is_admin"), sb.auth.getUser(tok)]); const AE = (process.env.ADMIN_EMAIL || "").toLowerCase(); if (!data || (AE && (u?.user?.email || "").toLowerCase() !== AE)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const e = process.env;
  return NextResponse.json({ fedapay: !!e.FEDAPAY_SECRET_KEY, lemon: !!(e.NEXT_PUBLIC_LEMON_MONTH && e.LEMON_WEBHOOK_SECRET), support_email: !!e.NEXT_PUBLIC_SUPPORT_EMAIL, support_wa: !!e.NEXT_PUBLIC_SUPPORT_WA, admin_email: !!e.ADMIN_EMAIL, llm: !!(e.GROQ_API_KEY || e.GEMINI_API_KEY) }, { headers: { "cache-control": "no-store" } });
}
