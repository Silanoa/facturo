// Moyens de paiement du vendeur (stockés dans profiles.momo jsonb, rétro-compatible : sans "type" = mobile money)
export const LINKS = ["Stripe", "PayPal", "Wise", "Paystack", "Flutterwave", "Kkiapay", "FedaPay", "Lemon Squeezy", "Revolut", "Autre"];
export const normPay = (arr = []) => (arr || []).map((m) => ({ type: m.type || "momo", ...m })).filter((m) =>
  m.type === "momo" ? m.number : m.type === "bank" ? (m.iban || m.account) : m.url);
export function payLines(m, lang = "fr") {
  if (m.type === "momo") return [m.op, m.number, m.name].filter(Boolean).join(" · ");
  if (m.type === "bank") return [m.bank, m.name, m.iban && `${lang === "en" ? "IBAN/Account" : "IBAN/Compte"} ${m.iban || m.account}`, m.swift && `SWIFT ${m.swift}`].filter(Boolean).join(" · ");
  return `${m.provider || "Lien"} · ${m.url}`;
}
export const safeUrl = (u = "") => /^https?:\/\//i.test(u) ? u : `https://${u}`;
