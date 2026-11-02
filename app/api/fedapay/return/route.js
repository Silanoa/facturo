import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { feda, PLANS } from "../../../../lib/fedapay";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm";
// FedaPay redirige ici avec ?id=...&status=... — on revérifie TOUJOURS côté serveur.
export async function GET(req) {
  const u = new URL(req.url); const id = u.searchParams.get("id"); const back = (ok) => NextResponse.redirect(`${u.origin}/app/parametres?t=offre&paid=${ok ? 1 : 0}`);
  if (!id || !process.env.FEDAPAY_SECRET_KEY) return back(false);
  try {
    const j = await feda(`/transactions/${id}`); const tx = j["v1/transaction"] || j.transaction || j;
    if (tx.status !== "approved") return back(false);
    const meta = tx.custom_metadata || {}; const P = PLANS[meta.plan] || PLANS.month;
    if (!meta.user_id || +tx.amount < P.amount) return back(false);
    const { error } = await createClient(SB_URL, SB_KEY).rpc("activate_pro", { p_user: meta.user_id, p_secret: process.env.APP_SECRET, p_tx: String(id), p_days: P.days });
    return back(!error);
  } catch { return back(false); }
}
