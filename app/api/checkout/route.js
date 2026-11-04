import { limited, tooMany } from "../../../lib/ratelimit";
import { NextResponse } from "next/server";
import { feda, PLANS, sb } from "../../../lib/fedapay";
import { proPrice } from "../../../lib/pricing";
import { chariowOn, checkoutUrl, CH_PLANS } from "../../../lib/chariow";
// Mobile Money : Chariow par défaut. FedaPay reste disponible (MOMO_PROVIDER=fedapay) une fois un IFU obtenu.
const useFeda = () => process.env.MOMO_PROVIDER === "fedapay" && !!process.env.FEDAPAY_SECRET_KEY;
export async function POST(req) {
  if (await limited(req, "checkout", 10)) return tooMany();
  const body = await req.json().catch(() => ({})); const en = body.lang === "en"; const m = (fr, e) => (en ? e : fr);
  if (!(useFeda() || chariowOn()) || !process.env.APP_SECRET) return NextResponse.json({ error: m("Le paiement Mobile Money sera activé très bientôt. Écrivez-nous pour passer Pro dès maintenant.", "Mobile Money payment is coming very soon. Contact us to upgrade to Pro right now.") }, { status: 503 });
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
  const c = sb(token); const { data: { user } } = await c.auth.getUser(token);
  if (!user) return NextResponse.json({ error: m("Session expirée. Reconnectez-vous.", "Session expired. Please sign in again.") }, { status: 401 });
  const plan = PLANS[body.plan] ? body.plan : "month"; const P = PLANS[plan];
  const { data: prof } = await c.from("profiles").select("country, business_name").eq("id", user.id).single();
  if (!proPrice(prof?.country || "BJ").momo) return NextResponse.json({ error: m("Le Mobile Money n'est disponible qu'en zone FCFA UEMOA. Payez par carte ou PayPal.", "Mobile Money is only available in the WAEMU CFA zone. Please pay by card or PayPal.") }, { status: 400 });
  if (!useFeda()) {
    const parts = String(prof?.business_name || user.user_metadata?.full_name || user.user_metadata?.name || "").trim().split(/\s+/).filter(Boolean);
    return NextResponse.json({ url: checkoutUrl(CH_PLANS[plan] ? plan : "month", { email: user.email, first: parts[0], last: parts.slice(1).join(" ") || undefined, country: prof?.country }), provider: "chariow" });
  }
  const origin = new URL(req.url).origin;
  try {
    const tx = await feda("/transactions", { method: "POST", body: JSON.stringify({ description: P.label, amount: P.amount, currency: { iso: "XOF" },
      callback_url: `${origin}/api/fedapay/return`, customer: { email: user.email }, custom_metadata: { user_id: user.id, plan } }) });
    const id = tx["v1/transaction"]?.id || tx.transaction?.id;
    const tk = await feda(`/transactions/${id}/token`, { method: "POST" });
    return NextResponse.json({ url: tk.url });
  } catch (e) { return NextResponse.json({ error: m("Paiement Mobile Money indisponible, réessayez dans un instant.", "Mobile Money payment unavailable, please retry shortly.") + " (" + e.message + ")" }, { status: 502 }); }
}
