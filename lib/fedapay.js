import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
export const FEDA_ENV = process.env.FEDAPAY_ENV === "live" ? "live" : "sandbox";
export const FEDA_API = FEDA_ENV === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
// Prix encaissés en XOF (même grille que lib/pricing.js). Durée en mois calendaires.
export const PLANS = { month: { amount: 2500, months: 1, label: "Bonova Pro — 1 mois" }, year: { amount: 25000, months: 12, label: "Bonova Pro — 1 an" } };
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ijwpcogwdfwtivwawuee.supabase.co";
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_U4F62VbFS2LFsgs8n4ohEg_rtG1rSkm";
export const sb = (token) => createClient(SB_URL, SB_KEY, token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : undefined);
export async function feda(path, init = {}) {
  const r = await fetch(FEDA_API + path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`, ...(init.headers || {}) }, cache: "no-store" });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.message || `FedaPay ${r.status}`); return j;
}
// Vérifie une transaction auprès de FedaPay (jamais sur la foi du navigateur ou du webhook) puis active Pro, de façon idempotente.
export function checkTx(tx) {
  if (!tx || tx.status !== "approved") return { ok: false, why: "status" };
  const meta = tx.custom_metadata || {}; const P = PLANS[meta.plan];
  const cur = (tx.currency && (tx.currency.iso || tx.currency.code)) || tx.currency_iso || "XOF";
  if (!P || !meta.user_id) return { ok: false, why: "meta" };
  if (String(cur).toUpperCase() !== "XOF" || +tx.amount < P.amount) return { ok: false, why: "amount" };
  return { ok: true, uid: meta.user_id, P, amount: +tx.amount };
}
export async function confirmTx(id) {
  const j = await feda(`/transactions/${id}`); const tx = j["v1/transaction"] || j.transaction || j;
  const c = checkTx(tx); if (!c.ok) return c;
  const { data, error } = await sb().rpc("grant_pro", { p_user: c.uid, p_secret: process.env.APP_SECRET, p_tx: `feda_${id}`, p_months: c.P.months, p_amount: c.amount, p_currency: "XOF", p_method: "fedapay" });
  return error ? { ok: false, why: error.message } : { ok: true, result: data };
}
// Signature FedaPay : en-tête X-FEDAPAY-SIGNATURE « t=…,s=… », HMAC-SHA256 de « t.payload ».
export function fedaSigOk(raw, header, secret, tol = 300) {
  if (!secret || !header) return false; const p = Object.fromEntries(String(header).split(",").map((x) => x.trim().split("=")));
  if (!p.t || !p.s || Math.abs(Date.now() / 1000 - +p.t) > tol) return false;
  const dig = crypto.createHmac("sha256", secret).update(`${p.t}.${raw}`).digest("hex");
  return p.s.length === dig.length && crypto.timingSafeEqual(Buffer.from(p.s), Buffer.from(dig));
}
