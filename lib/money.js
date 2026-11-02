export const CURRENCIES = [
  { code: "XOF", label: "Franc CFA UEMOA (XOF)", symbol: "FCFA", decimals: 0, region: "Bénin, Sénégal, Côte d'Ivoire, Togo, Mali, Burkina, Niger" },
  { code: "XAF", label: "Franc CFA CEMAC (XAF)", symbol: "FCFA", decimals: 0, region: "Cameroun, Gabon, Congo, Tchad, RCA" },
  { code: "NGN", label: "Naira (NGN)", symbol: "₦", decimals: 2, region: "Nigeria" },
  { code: "GHS", label: "Cedi (GHS)", symbol: "GH₵", decimals: 2, region: "Ghana" },
  { code: "MAD", label: "Dirham (MAD)", symbol: "DH", decimals: 2, region: "Maroc" },
  { code: "KES", label: "Shilling (KES)", symbol: "KSh", decimals: 2, region: "Kenya" },
  { code: "EUR", label: "Euro (EUR)", symbol: "€", decimals: 2, region: "Europe / diaspora" },
  { code: "USD", label: "Dollar US (USD)", symbol: "$", decimals: 2, region: "International" },
];
export const cur = (c) => CURRENCIES.find((x) => x.code === c) || CURRENCIES[0];
export function fmt(n, c = "XOF") {
  const k = cur(c);
  const s = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: k.decimals, maximumFractionDigits: k.decimals }).format(Number(n) || 0).replace(/\u202f|\u00a0/g, " ");
  return k.code === "USD" ? `$${s}` : `${s} ${k.symbol}`;
}
export function totals(doc) {
  const sub = (doc.items || []).reduce((a, i) => a + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const disc = Math.min(sub, Number(doc.discount) || 0);
  const base = sub - disc;
  const tax = base * ((Number(doc.tax_rate) || 0) / 100);
  return { sub, disc, base, tax, total: base + tax };
}
// Montant en lettres (FR) — obligatoire en pratique sur beaucoup de factures OHADA
const U = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize"];
function lt100(n){ if(n<17) return U[n]; if(n<20) return "dix-"+U[n-10];
  const T={2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante",8:"quatre-vingt"};
  let t=Math.floor(n/10),u=n%10;
  if(t===7||t===9){ const b=t===7?"soixante":"quatre-vingt"; const r=10+u; return b+(r===11&&t===7?" et ":"-")+lt100(r); }
  if(u===0) return T[t]+(t===8?"s":""); if(u===1&&t!==8) return T[t]+" et un"; return T[t]+"-"+U[u]; }
function lt1000(n){ const c=Math.floor(n/100),r=n%100; let s="";
  if(c) s=(c>1?U[c]+" ":"")+"cent"+(c>1&&r===0?"s":""); if(r) s+=(s?" ":"")+lt100(r); return s||"zéro"; }
export function inWords(n){ n=Math.round(Math.abs(n)); if(n===0) return "zéro";
  const parts=[[1e9,"milliard"],[1e6,"million"],[1e3,"mille"]]; let s="";
  for(const [v,w] of parts){ const q=Math.floor(n/v); if(q){ if(w==="mille") s+=(q===1?"":lt1000(q)+" ")+"mille "; else s+=lt1000(q)+" "+w+(q>1?"s":"")+" "; n%=v; } }
  if(n) s+=lt1000(n); return s.trim(); }
export const KINDS = { invoice: { fr: "Facture", en: "Invoice", prefix: "FAC" }, quote: { fr: "Devis", en: "Quote", prefix: "DEV" }, receipt: { fr: "Reçu", en: "Receipt", prefix: "REC" } };
export const OPERATORS = ["MTN MoMo", "Moov Money", "Orange Money", "Wave", "Celtiis Cash", "Airtel Money", "Free Money", "M-Pesa"];
