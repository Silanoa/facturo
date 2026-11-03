"use client";
import { useState } from "react";
import { inWords, fmt, CURRENCIES, curName } from "../lib/money";
import { COUNTRIES } from "../lib/countries";
import { useT } from "../lib/i18n";
const n = (v) => parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
export function VatCalc() {
  const { tr, lang } = useT(); const [amt, setAmt] = useState(lang === "en" ? "1000" : "100000"); const [rate, setRate] = useState(lang === "en" ? 20 : 18); const [mode, setMode] = useState("ht"); const [c, setC] = useState(lang === "en" ? "GBP" : "XOF");
  const RATES = COUNTRIES.filter(x => x.vat > 0).map(x => [lang === "en" ? x.en : x.fr, x.vat]); const pc = (r) => lang === "en" ? `${r}%` : `${String(r).replace(".", ",")} %`;
  const a = n(amt); const ht = mode === "ht" ? a : a / (1 + rate / 100); const tva = ht * rate / 100; const ttc = ht + tva;
  return (<div className="panel tool" style={{ padding: 24 }}>
    <div className="seg" style={{ marginBottom: 16 }}><button className={mode === "ht" ? "on" : ""} onClick={() => setMode("ht")}>{tr("J'ai le montant HT", "I have the net amount")}</button><button className={mode === "ttc" ? "on" : ""} onClick={() => setMode("ttc")}>{tr("J'ai le montant TTC", "I have the gross amount")}</button></div>
    <div className="g3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
      <label className="f"><span>{tr("Montant", "Amount")} {mode === "ht" ? tr("HT", "net") : tr("TTC", "gross")}</span><input inputMode="decimal" className="mono" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
      <label className="f"><span>{tr("Taux", "Rate")}</span><select value={rate} onChange={(e) => setRate(+e.target.value)}>{[...new Set(RATES.map(r => r[1]))].sort((x, y) => x - y).map(r => <option key={r} value={r}>{pc(r)} — {RATES.filter(x => x[1] === r).map(x => x[0]).slice(0, 3).join(", ")}</option>)}</select></label>
      <label className="f"><span>{tr("Devise", "Currency")}</span><select value={c} onChange={(e) => setC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.code}</option>)}</select></label></div>
    <div className="stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>{[[tr("Hors taxes", "Net"), ht], [`${tr("TVA", "VAT")} ${pc(rate)}`, tva], [tr("Toutes taxes", "Gross"), ttc]].map(([l, v], i) => <div key={l}><div className="u">{l}</div><div className="mono" style={{ fontSize: i === 2 ? 26 : 22, fontWeight: 600, marginTop: 8, color: i === 2 ? "var(--carbon)" : "inherit" }}>{fmt(v, c, lang)}</div></div>)}</div>
    <p className="mute" style={{ fontSize: 14, margin: "14px 0 0" }}>{tr("Calcul : TVA = HT ×", "Formula: VAT = net ×")} {pc(rate)} · {tr("TTC = HT ×", "gross = net ×")} {1 + rate / 100}</p>
    <style>{`@media(max-width:700px){.tool .g3,.tool .stats{grid-template-columns:1fr!important}.tool .stats>div{border-right:0!important;border-bottom:1px solid var(--line)}}`}</style>
  </div>);
}
const CW = { XOF: ["franc CFA", "francs CFA"], XAF: ["franc CFA", "francs CFA"], EUR: ["euro", "euros"], USD: ["dollar", "dollars"], NGN: ["naira", "naira"], GHS: ["cedi", "cedis"], MAD: ["dirham", "dirhams"], KES: ["shilling", "shillings"] };
export function wordsFor(v, c, lang = "fr") { const x = n(v); const i = Math.floor(x); const cents = Math.round((x - i) * 100);
  if (lang === "en") { const nm = curName(c, "en"); return `${inWords(i, "en")} ${nm}${cents ? ` and ${inWords(cents, "en")} cents` : ""}`; }
  const [s, p] = CW[c] || [curName(c, "fr"), curName(c, "fr")];
  const w = inWords(i); const unit = (/(million|milliard)s?$/.test(w) ? "de " : "") + (i > 1 ? p : s);
  return `${w} ${unit}${cents ? ` et ${inWords(cents)} centime${cents > 1 ? "s" : ""}` : ""}`; }
export function Words() {
  const { tr, lang } = useT(); const [v, setV] = useState(lang === "en" ? "1250.50" : "519200"); const [c, setC] = useState(lang === "en" ? "USD" : "XOF"); const [ok, setOk] = useState(false);
  const w = wordsFor(v, c, lang); const full = lang === "en" ? `Amount due: ${w}.` : `Arrêtée la présente facture à la somme de ${w}.`;
  return (<div className="panel tool" style={{ padding: 24 }}>
    <div className="g2" style={{ gridTemplateColumns: "1.6fr 1fr" }}><label className="f"><span>{tr("Montant en chiffres", "Amount in figures")}</span><input inputMode="decimal" className="mono" style={{ fontSize: 22 }} value={v} onChange={(e) => setV(e.target.value)} /></label>
      <label className="f"><span>{tr("Devise", "Currency")}</span><select value={c} onChange={(e) => setC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.code} — {curName(x.code, lang)}</option>)}</select></label></div>
    <div style={{ background: "#fff", border: "1px solid var(--line)", padding: 18 }}><div className="u">{tr("En lettres", "In words")}</div><p className="d" style={{ fontSize: "clamp(22px,3vw,30px)", margin: "10px 0 0", lineHeight: 1.15, fontWeight: 600 }}>{w.charAt(0).toUpperCase() + w.slice(1)}</p></div>
    <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}><button className="b s" onClick={async () => { try { await navigator.clipboard.writeText(full); } catch {} setOk(true); setTimeout(() => setOk(false), 1600); }}>{ok ? tr("Copié", "Copied") : tr("Copier la formule complète", "Copy")}</button><span className="mute" style={{ fontSize: 14 }}>« {full} »</span></div>
  </div>);
}
