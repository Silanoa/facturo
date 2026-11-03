import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm";
// Webhook Lemon Squeezy (carte bancaire + PayPal, 135+ pays, merchant of record : gère la TVA mondiale).
export async function POST(req) {
  const secret = process.env.LEMON_WEBHOOK_SECRET; if (!secret) return NextResponse.json({ ok: false }, { status: 503 });
  const raw = await req.text(); const sig = req.headers.get("x-signature") || "";
  const dig = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (sig.length !== dig.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(dig))) return NextResponse.json({ ok: false }, { status: 401 });
  const j = JSON.parse(raw); const ev = j.meta?.event_name; const uid = j.meta?.custom_data?.user_id;
  if (!uid || !["order_created", "subscription_created", "subscription_payment_success"].includes(ev)) return NextResponse.json({ ok: true, skipped: true });
  const yearly = /year|annu/i.test(JSON.stringify(j.data?.attributes?.variant_name || j.data?.attributes?.first_order_item?.variant_name || ""));
  const { error } = await createClient(SB_URL, SB_KEY).rpc("activate_pro", { p_user: uid, p_secret: process.env.APP_SECRET, p_tx: `ls_${j.data?.id}_${ev}`, p_days: yearly ? 366 : 31 });
  return NextResponse.json({ ok: !error });
}
