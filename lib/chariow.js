import crypto from "crypto";
import { sb } from "./fedapay";
// Chariow : Mobile Money (Wave, Orange Money, Free Money, MTN, Moov) en XOF, versements sur Wave.
// Les produits « service » ne passent pas par l'API de checkout : on redirige vers la page produit de la boutique, e-mail prérempli,
// puis la Pulse « successful.sale » active Pro en rattachant l'acheteur par son e-mail (après relecture de la vente via l'API).
export const CHARIOW_API = "https://api.chariow.com/v1";
export const CHARIOW_STORE = process.env.CHARIOW_STORE_URL || "https://yxtvdnpy.mychariow.online";
export const CH_PLANS = { month: { id: () => process.env.CHARIOW_PRODUCT_MONTH || "prd_2y7n2nto", amount: 2500, months: 1 }, year: { id: () => process.env.CHARIOW_PRODUCT_YEAR || "prd_203cyosz", amount: 25000, months: 12 } };
export const chariowOn = () => !!process.env.CHARIOW_API_KEY;
export async function chariow(path) {
  const r = await fetch(CHARIOW_API + path, { headers: { authorization: `Bearer ${process.env.CHARIOW_API_KEY}`, accept: "application/json" }, cache: "no-store" });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw Object.assign(new Error(j.message || `Chariow ${r.status}`), { status: r.status }); return j.data || j;
}
export function checkoutUrl(plan, { email, first, last, country }) {
  const q = new URLSearchParams(); if (email) q.set("email", email); if (first) q.set("first_name", first); if (last) q.set("last_name", last); if (country) q.set("country", country);
  return `${CHARIOW_STORE}/${CH_PLANS[plan].id()}/checkout?${q}`;
}
// Signature Pulse : x-chariow-signature = "sha256=" + HMAC-SHA256(corps brut, secret whsec_…).
export function pulseSigOk(raw, header, secret) {
  if (!secret || !header) return false; const dig = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
  return header.length === dig.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(dig));
}
const monthsOf = (pid) => Object.values(CH_PLANS).find((p) => p.id() === pid);
// Relit la vente chez Chariow (jamais sur la foi du webhook seul), rattache l'utilisateur et active Pro de façon idempotente.
export async function confirmSale(saleId, hintUser) {
  const s = await chariow(`/sales/${encodeURIComponent(saleId)}`);
  if (s.status !== "completed") return { ok: false, why: "status" };
  const P = monthsOf(s.product?.id); if (!P) return { ok: false, why: "product" };
  const amt = +(s.amount?.value ?? 0); const cur = String(s.amount?.currency || "XOF").toUpperCase();
  if (cur === "XOF" && amt + (+(s.discount_amount?.value ?? 0)) < P.amount) return { ok: false, why: "amount" };
  const c = sb(); const email = s.customer?.email || ""; const tx = `chariow_${s.id}`;
  let uid = s.custom_metadata?.user_id || hintUser || null;
  if (!uid && email) { const { data } = await c.rpc("user_by_email", { p_email: email, p_secret: process.env.APP_SECRET }); uid = data || null; }
  if (!uid) { console.warn("chariow: no user for sale", s.id, email); await c.rpc("log_unmatched_payment", { p_secret: process.env.APP_SECRET, p_tx: tx, p_email: email, p_amount: amt, p_currency: cur, p_product: s.product?.name || s.product?.id }); return { ok: true, unmatched: true }; }
  const { data, error } = await c.rpc("grant_pro", { p_user: uid, p_secret: process.env.APP_SECRET, p_tx: tx, p_months: P.months, p_amount: amt, p_currency: cur, p_method: "chariow" });
  return error ? { ok: false, why: error.message } : { ok: true, result: data };
}
