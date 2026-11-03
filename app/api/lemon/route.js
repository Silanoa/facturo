import { NextResponse } from "next/server";
import crypto from "crypto";
import { sb } from "../../../lib/fedapay";
// Webhook Lemon Squeezy (carte + PayPal, merchant of record).
// Achat initial → order_created (clé = commande). Renouvellements → subscription_payment_success avec billing_reason ≠ initial (clé = facture).
// subscription_created n'active rien (sinon triple prolongation au 1er achat). Annulation : l'accès court jusqu'à la fin de la période payée,
// puis la tâche horaire expire_pro repasse en gratuit. Remboursement → on retire la période.
const ACT = ["order_created", "subscription_payment_success"]; const REF = ["order_refunded", "subscription_payment_refunded"];
function planOf(j) {
  const a = j.data?.attributes || {}; const vid = String(a.variant_id || a.first_order_item?.variant_id || "");
  if (process.env.LEMON_VARIANT_YEAR && vid === String(process.env.LEMON_VARIANT_YEAR)) return 12;
  if (process.env.LEMON_VARIANT_MONTH && vid === String(process.env.LEMON_VARIANT_MONTH)) return 1;
  const p = j.meta?.custom_data?.plan; if (p === "year") return 12; if (p === "month") return 1;
  return /year|annu|an\b/i.test(String(a.variant_name || a.first_order_item?.variant_name || "")) ? 12 : 1;
}
export async function POST(req) {
  const secret = process.env.LEMON_WEBHOOK_SECRET; if (!secret || !process.env.APP_SECRET) return NextResponse.json({ ok: false }, { status: 503 });
  const raw = await req.text(); const sig = req.headers.get("x-signature") || "";
  const dig = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  if (sig.length !== dig.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(dig))) return NextResponse.json({ ok: false }, { status: 401 });
  let j; try { j = JSON.parse(raw); } catch { return NextResponse.json({ ok: false }, { status: 400 }); }
  const ev = j.meta?.event_name; const uid = j.meta?.custom_data?.user_id; const a = j.data?.attributes || {}; const id = j.data?.id;
  if (!uid || !id) return NextResponse.json({ ok: true, skipped: "no user" });
  const months = planOf(j); const c = sb();
  if (ACT.includes(ev)) {
    if (ev === "order_created" && a.status && a.status !== "paid") return NextResponse.json({ ok: true, skipped: "unpaid" });
    if (ev === "subscription_payment_success" && (a.billing_reason === "initial" || a.status && a.status !== "paid")) return NextResponse.json({ ok: true, skipped: "initial" });
    const tx = ev === "order_created" ? `ls_order_${id}` : `ls_inv_${id}`;
    const { data, error } = await c.rpc("grant_pro", { p_user: uid, p_secret: process.env.APP_SECRET, p_tx: tx, p_months: months, p_amount: a.total != null ? a.total / 100 : null, p_currency: a.currency || null, p_method: "lemon" });
    return NextResponse.json({ ok: !error, result: data }, { status: error ? 500 : 200 });
  }
  if (REF.includes(ev)) {
    const tx = ev === "order_refunded" ? `ls_refund_order_${id}` : `ls_refund_inv_${id}`;
    const { data, error } = await c.rpc("revoke_pro", { p_user: uid, p_secret: process.env.APP_SECRET, p_tx: tx, p_months: months });
    return NextResponse.json({ ok: !error, result: data }, { status: error ? 500 : 200 });
  }
  return NextResponse.json({ ok: true, skipped: ev });
}
