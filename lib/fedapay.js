export const FEDA_ENV = process.env.FEDAPAY_ENV === "live" ? "live" : "sandbox";
export const FEDA_API = FEDA_ENV === "live" ? "https://api.fedapay.com/v1" : "https://sandbox-api.fedapay.com/v1";
export const PLANS = { month: { amount: 2500, days: 31, label: "Bonova Pro — 1 mois" }, year: { amount: 25000, days: 366, label: "Bonova Pro — 1 an" } };
export async function feda(path, init = {}) {
  const r = await fetch(FEDA_API + path, { ...init, headers: { "content-type": "application/json", authorization: `Bearer ${process.env.FEDAPAY_SECRET_KEY}`, ...(init.headers || {}) }, cache: "no-store" });
  const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.message || `FedaPay ${r.status}`); return j;
}
