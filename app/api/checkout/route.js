import { limited, tooMany } from "../../../lib/ratelimit";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { feda, PLANS } from "../../../lib/fedapay";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm";
export async function POST(req) {
  if (await limited(req, "checkout", 10)) return tooMany();
  if (!process.env.FEDAPAY_SECRET_KEY) return NextResponse.json({ error: "Le paiement en ligne sera activé très bientôt. En attendant, écrivez-nous sur WhatsApp pour passer Pro." }, { status: 503 });
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const { data: { user } } = await createClient(SB_URL, SB_KEY).auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Session expirée." }, { status: 401 });
  const { plan = "month" } = await req.json().catch(() => ({})); const P = PLANS[plan] || PLANS.month;
  const origin = new URL(req.url).origin;
  try {
    const tx = await feda("/transactions", { method: "POST", body: JSON.stringify({ description: P.label, amount: P.amount, currency: { iso: "XOF" },
      callback_url: `${origin}/api/fedapay/return`, customer: { email: user.email }, custom_metadata: { user_id: user.id, plan } }) });
    const id = tx["v1/transaction"]?.id || tx.transaction?.id;
    const tk = await feda(`/transactions/${id}/token`, { method: "POST" });
    return NextResponse.json({ url: tk.url });
  } catch (e) { return NextResponse.json({ error: "FedaPay : " + e.message }, { status: 502 }); }
}
