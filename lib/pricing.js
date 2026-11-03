// Prix Pro par devise. Un seul prix affiché, dans la devise du pays. Pas de conversion approximative.
import { country } from "./countries";
const P = {
  XOF: [2500, 25000], XAF: [2500, 25000], NGN: [4500, 45000], GHS: [60, 600], KES: [500, 5000], ZAR: [69, 690], MAD: [39, 390], TND: [12, 120],
  RWF: [5000, 50000], UGX: [15000, 150000], TZS: [10000, 100000], CDF: [10000, 100000], GNF: [35000, 350000], MGA: [18000, 180000],
  EUR: [4.9, 49], CHF: [4.9, 49], GBP: [3.9, 39], USD: [4.9, 49], CAD: [6.9, 69],
};
export const MOMO_CUR = ["XOF"]; // FedaPay encaisse le Mobile Money en XOF (UEMOA) ; XAF → carte / PayPal
export function proPrice(code, lang = "fr") {
  const c = country(code); const cur = P[c.cur] ? c.cur : "USD"; const [m, y] = P[cur];
  const f = (n) => new Intl.NumberFormat(lang === "en" ? "en-US" : "fr-FR", { style: "currency", currency: cur, currencyDisplay: cur === "XOF" || cur === "XAF" ? "code" : ["USD", "EUR", "GBP", "NGN"].includes(cur) ? "narrowSymbol" : "symbol", maximumFractionDigits: n % 1 ? 2 : 0 }).format(n).replace(/XOF|XAF/, "FCFA").replace(/\u202f/g, " ");
  return { cur, month: f(m), year: f(y), monthOfYear: f(m >= 100 ? Math.round(y / 12) : Math.round((y / 12) * 100) / 100), momo: MOMO_CUR.includes(cur) };
}
