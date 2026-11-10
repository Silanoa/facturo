import { COUNTRIES } from "./countries";
const NAMES = { XOF:["Franc CFA UEMOA","West African CFA franc"], XAF:["Franc CFA CEMAC","Central African CFA franc"], EUR:["Euro","Euro"], USD:["Dollar US","US dollar"], GBP:["Livre sterling","Pound sterling"], CAD:["Dollar canadien","Canadian dollar"], CHF:["Franc suisse","Swiss franc"], NGN:["Naira","Naira"], GHS:["Cedi","Cedi"], KES:["Shilling kényan","Kenyan shilling"], ZAR:["Rand","Rand"], MAD:["Dirham marocain","Moroccan dirham"], TND:["Dinar tunisien","Tunisian dinar"], CDF:["Franc congolais","Congolese franc"], GNF:["Franc guinéen","Guinean franc"], MGA:["Ariary malgache","Malagasy ariary"], RWF:["Franc rwandais","Rwandan franc"], UGX:["Shilling ougandais","Ugandan shilling"], TZS:["Shilling tanzanien","Tanzanian shilling"] };
const EXTRA = ["EUR","USD","GBP","CAD","CHF"];
const AFR = [...new Set(COUNTRIES.filter(c => !["FR","BE","LU","CH","GB","US","CA","ZZ"].includes(c.code)).map(c => c.cur))];
const dec = (code) => { try { return new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits; } catch { return 2; } };
const ZERO = new Set(["XOF","XAF","GNF","KMF","RWF","BIF","DJF","UGX","JPY","MGA","CDF"]);
const build = (code) => ({ code, decimals: ZERO.has(code) ? 0 : dec(code), symbol: code === "XOF" || code === "XAF" ? "FCFA" : code });
export const CURRENCIES = [...new Set(["XOF","XAF",...AFR,...EXTRA])].map(build);
export const cur = (c) => CURRENCIES.find((x) => x.code === c) || build(c || "XOF");
export function curName(code, lang = "fr") {
  if (NAMES[code]) return NAMES[code][lang === "en" ? 1 : 0];
  try { const x = new Intl.DisplayNames([lang], { type: "currency" }).of(code); return x.charAt(0).toUpperCase() + x.slice(1).toLowerCase(); } catch { return code; }
}
export const curLabel = (code, lang) => `${code} — ${curName(code, lang)}`;
const CODE_ONLY = new Set(["RWF"]);
export function fmt(n, c = "XOF", lang = "fr") {
  const k = cur(c); const loc = lang === "en" ? "en-US" : "fr-FR";
  // FCFA : toujours « 330 000 FCFA » (usage de la zone franc), en français comme en anglais.
  if (k.symbol === "FCFA") return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Number(n) || 0).replace(/\u202f|\u00a0/g, " ") + " FCFA";
  // Symbole courant (« 2 100,00 £ », « 2 100,00 $ », « ₦2,100.00 ») plutôt que les variantes « £GB », « $US », « $CA » ; code ISO quand le symbole court serait ambigu (RWF).
  try { return new Intl.NumberFormat(loc, { style: "currency", currency: k.code, currencyDisplay: CODE_ONLY.has(k.code) ? "code" : "narrowSymbol", minimumFractionDigits: k.decimals, maximumFractionDigits: k.decimals }).format(Number(n) || 0).replace(/\u202f|\u00a0/g, " "); }
  catch { return `${Number(n) || 0} ${k.code}`; }
}
// Paiements réellement enregistrés : acomptes et paiements partiels inclus.
const pays = (d) => (Array.isArray(d.payments) ? d.payments : []).filter((p) => +p.amount > 0);
export const paidOf = (d) => { const t = +d.total || 0; if (d.status === "paid") return t; return Math.min(t, Math.max(+d.paid_amount || 0, pays(d).reduce((a, p) => a + +p.amount, 0))); };
export const balanceOf = (d) => Math.max(0, (+d.total || 0) - paidOf(d));
// Montant encaissé pendant le mois « AAAA-MM » : chaque paiement à sa date ; le solde d'une facture marquée payée sans détail compte au mois du paiement.
export function paidIn(d, ym) {
  const ps = pays(d); let v = ps.filter((p) => String(p.date || "").slice(0, 7) === ym).reduce((a, p) => a + +p.amount, 0);
  if (d.status === "paid") { const rest = (+d.total || 0) - ps.reduce((a, p) => a + +p.amount, 0); if (rest > 0 && String(d.paid_at || d.issue_date || "").slice(0, 7) === ym) v += rest; }
  return v;
}
// Taux par ligne (item.tax) possibles : plusieurs taux sur un même document. Sinon le taux du document s'applique.
export const lineRate = (doc, it) => (it.tax === undefined || it.tax === null || it.tax === "" ? Number(doc.tax_rate) || 0 : Number(it.tax) || 0);
export function totals(doc) {
  const items = doc.items || []; const sub = items.reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const disc = Math.min(sub, Number(doc.discount) || 0); const base = sub - disc; const k = sub ? base / sub : 0;
  const by = {}; for (const i of items) { const r = lineRate(doc, i); const v = (Number(i.qty) || 0) * (Number(i.price) || 0) * k; if (r && v) by[r] = (by[r] || 0) + v * r / 100; }
  const taxes = Object.entries(by).map(([r, v]) => ({ rate: +r, amount: v })).sort((x, y) => y.rate - x.rate);
  const tax = taxes.reduce((a, x) => a + x.amount, 0); return { sub, disc, base, tax, taxes, total: base + tax };
}
// Montant en lettres — FR
const U = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
function lt100(n){ if(n<17) return U[n]; if(n<20) return "dix-"+U[n-10];
  const T={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante",8:"quatre-vingt"}; let t=Math.floor(n/10),u=n%10;
  if(t===7||t===9){ const b=t===7?"soixante":"quatre-vingt"; const r=10+u; return b+(r===11&&t===7?" et ":"-")+lt100(r); }
  if(u===0) return T[t]+(t===8?"s":""); if(u===1&&t!==8) return T[t]+" et un"; return T[t]+"-"+U[u]; }
function lt1000(n){ const c=Math.floor(n/100),r=n%100; let s=""; if(c) s=(c>1?U[c]+" ":"")+"cent"+(c>1&&r===0?"s":""); if(r) s+=(s?" ":"")+lt100(r); return s||"zéro"; }
function frWords(n){ n=Math.round(Math.abs(n)); if(n===0) return "zéro"; let s="";
  for(const [v,w] of [[1e9,"milliard"],[1e6,"million"],[1e3,"mille"]]){ const q=Math.floor(n/v); if(q){ if(w==="mille") s+=(q===1?"":lt1000(q).replace(/(cent|vingt)s$/,"$1")+" ")+"mille "; else s+=(q<1000?lt1000(q):frWords(q))+" "+w+(q>1?"s":"")+" "; n%=v; } }
  if(n) s+=lt1000(n); return s.trim(); }
// EN
const E = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const ET = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function e1000(n){ const h=Math.floor(n/100), r=n%100; let s=h?E[h]+" hundred":""; if(r) s+=(s?" ":"")+(r<20?E[r]:ET[Math.floor(r/10)]+(r%10?"-"+E[r%10]:"")); return s; }
function enWords(n){ n=Math.round(Math.abs(n)); if(!n) return "zero"; let s="";
  for(const [v,w] of [[1e9,"billion"],[1e6,"million"],[1e3,"thousand"]]){ const q=Math.floor(n/v); if(q){ s+=(q<1000?e1000(q):enWords(q))+" "+w+" "; n%=v; } }
  if(n) s+=e1000(n); return s.trim(); }
// Parité fixe euro / franc CFA (UEMOA et CEMAC) : 1 EUR = 655,957 FCFA.
export const EUR_XOF = 655.957;
export const eurToXof = (eur) => Math.round((Number(eur) || 0) * EUR_XOF);
export const inWords = (n, lang = "fr") => lang === "en" ? enWords(n) : frWords(n);
export const KINDS = { invoice: { fr: "Facture", en: "Invoice", prefix: "FAC", pre_en: "INV" }, quote: { fr: "Devis", en: "Quote", prefix: "DEV", pre_en: "QUO" }, receipt: { fr: "Reçu", en: "Receipt", prefix: "REC", pre_en: "REC" } };
export const kindName = (k, lang = "fr") => (KINDS[k] || KINDS.invoice)[lang === "en" ? "en" : "fr"];
export const OPERATORS = ["MTN MoMo", "Moov Money", "Orange Money", "Wave", "Airtel Money", "M-Pesa", "Celtiis Cash", "Free Money", "Vodafone Cash", "AirtelTigo Money", "EcoCash", "T-Money", "Flooz", "Mixx by Yas"];
// Montant en francs CFA, en lettres (« deux millions de francs CFA », "two million CFA francs").
export function cfaWords(x, lang = "fr") { return amountWords(x, "XOF", lang); }
// Unité monétaire en toutes lettres, accordée (« trois mille euros », "two thousand US dollars").
const UNIT = {
  fr: { XOF: ["franc CFA", "francs CFA"], XAF: ["franc CFA", "francs CFA"], EUR: ["euro", "euros"], USD: ["dollar US", "dollars US"], CAD: ["dollar canadien", "dollars canadiens"], GBP: ["livre sterling", "livres sterling"], CHF: ["franc suisse", "francs suisses"], NGN: ["naira", "naira"], GHS: ["cedi", "cedis"], MAD: ["dirham", "dirhams"], KES: ["shilling kényan", "shillings kényans"], ZAR: ["rand", "rands"], TND: ["dinar tunisien", "dinars tunisiens"], CDF: ["franc congolais", "francs congolais"], GNF: ["franc guinéen", "francs guinéens"], MGA: ["ariary", "ariary"], RWF: ["franc rwandais", "francs rwandais"], UGX: ["shilling ougandais", "shillings ougandais"], TZS: ["shilling tanzanien", "shillings tanzaniens"] },
  en: { XOF: ["CFA franc", "CFA francs"], XAF: ["CFA franc", "CFA francs"], EUR: ["euro", "euros"], USD: ["US dollar", "US dollars"], CAD: ["Canadian dollar", "Canadian dollars"], GBP: ["pound sterling", "pounds sterling"], CHF: ["Swiss franc", "Swiss francs"], NGN: ["naira", "naira"], GHS: ["cedi", "cedis"], MAD: ["dirham", "dirhams"], KES: ["Kenyan shilling", "Kenyan shillings"], ZAR: ["rand", "rand"], TND: ["Tunisian dinar", "Tunisian dinars"], CDF: ["Congolese franc", "Congolese francs"], GNF: ["Guinean franc", "Guinean francs"], MGA: ["ariary", "ariary"], RWF: ["Rwandan franc", "Rwandan francs"], UGX: ["Ugandan shilling", "Ugandan shillings"], TZS: ["Tanzanian shilling", "Tanzanian shillings"] },
};
export function unitWords(code, i, lang = "fr") { const L = lang === "en" ? "en" : "fr"; const u = UNIT[L][code]; const many = L === "en" ? i !== 1 : i > 1;
  if (u) return u[many ? 1 : 0]; const nm = curName(code, L).toLowerCase(); return many && /(franc|dollar|shilling|dinar|dirham|peso|pound)$/.test(nm) ? nm + "s" : nm; }
// Montant entier + unité : « un million de francs CFA », "one million CFA francs".
export function amountWords(i, code, lang = "fr") { const n = Math.round(Math.abs(Number(i) || 0)); const w = inWords(n, lang);
  return lang === "en" ? `${w} ${unitWords(code, n, "en")}` : `${w} ${/(million|milliard)s?$/.test(w) ? "de " : ""}${unitWords(code, n, "fr")}`; }
