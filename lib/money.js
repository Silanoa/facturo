import { COUNTRIES } from "./countries";
const NAMES = { XOF:["Franc CFA UEMOA","West African CFA franc"], XAF:["Franc CFA CEMAC","Central African CFA franc"], EUR:["Euro","Euro"], USD:["Dollar US","US dollar"], GBP:["Livre sterling","Pound sterling"], CAD:["Dollar canadien","Canadian dollar"], CHF:["Franc suisse","Swiss franc"], NGN:["Naira","Naira"], GHS:["Cedi","Cedi"], KES:["Shilling kényan","Kenyan shilling"], ZAR:["Rand","Rand"], MAD:["Dirham marocain","Moroccan dirham"] };
const EXTRA = ["EUR","USD","GBP","CAD","CHF"];
const AFR = [...new Set(COUNTRIES.filter(c => !["FR","BE","LU","CH","GB","US","CA","ZZ"].includes(c.code)).map(c => c.cur))];
const dec = (code) => { try { return new Intl.NumberFormat("en", { style: "currency", currency: code }).resolvedOptions().maximumFractionDigits; } catch { return 2; } };
const ZERO = new Set(["XOF","XAF","GNF","KMF","RWF","BIF","DJF","UGX","JPY","MGA","CDF"]);
const build = (code) => ({ code, decimals: ZERO.has(code) ? 0 : dec(code), symbol: code === "XOF" || code === "XAF" ? "FCFA" : code });
export const CURRENCIES = [...new Set(["XOF","XAF",...AFR,...EXTRA])].map(build);
export const cur = (c) => CURRENCIES.find((x) => x.code === c) || build(c || "XOF");
export function curName(code, lang = "fr") {
  if (NAMES[code]) return NAMES[code][lang === "en" ? 1 : 0];
  try { return new Intl.DisplayNames([lang], { type: "currency" }).of(code); } catch { return code; }
}
export const curLabel = (code, lang) => `${code} — ${curName(code, lang)}`;
export function fmt(n, c = "XOF", lang = "fr") {
  const k = cur(c); const loc = lang === "en" ? "en-US" : "fr-FR";
  if (k.symbol === "FCFA") return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(Number(n) || 0).replace(/\u202f|\u00a0/g, " ") + " FCFA";
  try { return new Intl.NumberFormat(loc, { style: "currency", currency: k.code, minimumFractionDigits: k.decimals, maximumFractionDigits: k.decimals }).format(Number(n) || 0).replace(/\u202f|\u00a0/g, " "); }
  catch { return `${Number(n) || 0} ${k.code}`; }
}
export function totals(doc) {
  const sub = (doc.items || []).reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const disc = Math.min(sub, Number(doc.discount) || 0); const base = sub - disc;
  const tax = base * ((Number(doc.tax_rate) || 0) / 100); return { sub, disc, base, tax, total: base + tax };
}
// Montant en lettres — FR
const U = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
function lt100(n){ if(n<17) return U[n]; if(n<20) return "dix-"+U[n-10];
  const T={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante",8:"quatre-vingt"}; let t=Math.floor(n/10),u=n%10;
  if(t===7||t===9){ const b=t===7?"soixante":"quatre-vingt"; const r=10+u; return b+(r===11&&t===7?" et ":"-")+lt100(r); }
  if(u===0) return T[t]+(t===8?"s":""); if(u===1&&t!==8) return T[t]+" et un"; return T[t]+"-"+U[u]; }
function lt1000(n){ const c=Math.floor(n/100),r=n%100; let s=""; if(c) s=(c>1?U[c]+" ":"")+"cent"+(c>1&&r===0?"s":""); if(r) s+=(s?" ":"")+lt100(r); return s||"zéro"; }
function frWords(n){ n=Math.round(Math.abs(n)); if(n===0) return "zéro"; let s="";
  for(const [v,w] of [[1e9,"milliard"],[1e6,"million"],[1e3,"mille"]]){ const q=Math.floor(n/v); if(q){ if(w==="mille") s+=(q===1?"":lt1000(q).replace(/(cent|vingt)s$/,"$1")+" ")+"mille "; else s+=lt1000(q)+" "+w+(q>1?"s":"")+" "; n%=v; } }
  if(n) s+=lt1000(n); return s.trim(); }
// EN
const E = ["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
const ET = ["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function e1000(n){ const h=Math.floor(n/100), r=n%100; let s=h?E[h]+" hundred":""; if(r) s+=(s?" ":"")+(r<20?E[r]:ET[Math.floor(r/10)]+(r%10?"-"+E[r%10]:"")); return s; }
function enWords(n){ n=Math.round(Math.abs(n)); if(!n) return "zero"; let s="";
  for(const [v,w] of [[1e9,"billion"],[1e6,"million"],[1e3,"thousand"]]){ const q=Math.floor(n/v); if(q){ s+=e1000(q)+" "+w+" "; n%=v; } }
  if(n) s+=e1000(n); return s.trim(); }
export const inWords = (n, lang = "fr") => lang === "en" ? enWords(n) : frWords(n);
export const KINDS = { invoice: { fr: "Facture", en: "Invoice", prefix: "FAC", pre_en: "INV" }, quote: { fr: "Devis", en: "Quote", prefix: "DEV", pre_en: "QUO" }, receipt: { fr: "Reçu", en: "Receipt", prefix: "REC", pre_en: "REC" } };
export const kindName = (k, lang = "fr") => (KINDS[k] || KINDS.invoice)[lang === "en" ? "en" : "fr"];
export const OPERATORS = ["MTN MoMo", "Moov Money", "Orange Money", "Wave", "Airtel Money", "M-Pesa", "Celtiis Cash", "Free Money", "Vodafone Cash", "AirtelTigo Money", "EcoCash", "T-Money", "Flooz", "Mixx by Yas"];
