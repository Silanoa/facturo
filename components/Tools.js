"use client";
import { useState } from "react";
import { inWords, fmt, CURRENCIES } from "../lib/money";
import { RATES } from "../lib/vat";
const n = (v) => parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
export function VatCalc() {
  const [amt, setAmt] = useState("100000"); const [rate, setRate] = useState(18); const [mode, setMode] = useState("ht"); const [c, setC] = useState("XOF");
  const a = n(amt); const ht = mode === "ht" ? a : a / (1 + rate / 100); const tva = ht * rate / 100; const ttc = ht + tva;
  return (<div className="panel tool" style={{ padding: 24 }}>
    <div className="seg" style={{ marginBottom: 16 }}><button className={mode === "ht" ? "on" : ""} onClick={() => setMode("ht")}>J'ai le montant HT</button><button className={mode === "ttc" ? "on" : ""} onClick={() => setMode("ttc")}>J'ai le montant TTC</button></div>
    <div className="g3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr" }}>
      <label className="f"><span>Montant {mode.toUpperCase()}</span><input inputMode="decimal" className="mono" value={amt} onChange={(e) => setAmt(e.target.value)} /></label>
      <label className="f"><span>Taux</span><select value={rate} onChange={(e) => setRate(+e.target.value)}>{[...new Set(RATES.map(r => r[1]))].sort((x, y) => x - y).map(r => <option key={r} value={r}>{String(r).replace(".", ",")} % — {RATES.filter(x => x[1] === r).map(x => x[0]).slice(0, 3).join(", ")}</option>)}</select></label>
      <label className="f"><span>Devise</span><select value={c} onChange={(e) => setC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.code}</option>)}</select></label></div>
    <div className="stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>{[["Hors taxes", ht], [`TVA ${String(rate).replace(".", ",")} %`, tva], ["Toutes taxes", ttc]].map(([l, v], i) => <div key={l}><div className="u">{l}</div><div className="mono" style={{ fontSize: i === 2 ? 26 : 22, fontWeight: 600, marginTop: 8, color: i === 2 ? "var(--kola)" : "inherit" }}>{fmt(v, c)}</div></div>)}</div>
    <p className="mute" style={{ fontSize: 14, margin: "14px 0 0" }}>Calcul : TVA = HT × {String(rate).replace(".", ",")} % · TTC = HT × {String(1 + rate / 100).replace(".", ",")}{mode === "ttc" && ` · HT = TTC ÷ ${String(1 + rate / 100).replace(".", ",")}`}</p>
    <style>{`@media(max-width:700px){.tool .g3,.tool .stats{grid-template-columns:1fr!important}.tool .stats>div{border-right:0!important;border-bottom:1px solid var(--line)}}`}</style>
  </div>);
}
const CW = { XOF: ["franc CFA", "francs CFA"], XAF: ["franc CFA", "francs CFA"], EUR: ["euro", "euros"], USD: ["dollar", "dollars"], NGN: ["naira", "naira"], GHS: ["cedi", "cedis"], MAD: ["dirham", "dirhams"], KES: ["shilling", "shillings"] };
export function wordsFor(v, c) { const x = n(v); const i = Math.floor(x); const cents = Math.round((x - i) * 100); const [s, p] = CW[c] || CW.XOF;
  const w = inWords(i); const unit = (/(million|milliard)s?$/.test(w) ? "de " : "") + (i > 1 ? p : s);
  return `${w} ${unit}${cents ? ` et ${inWords(cents)} centime${cents > 1 ? "s" : ""}` : ""}`; }
export function Words() {
  const [v, setV] = useState("519200"); const [c, setC] = useState("XOF"); const [ok, setOk] = useState(false);
  const w = wordsFor(v, c); const full = `Arrêtée la présente facture à la somme de ${w}.`;
  return (<div className="panel tool" style={{ padding: 24 }}>
    <div className="g2" style={{ gridTemplateColumns: "1.6fr 1fr" }}><label className="f"><span>Montant en chiffres</span><input inputMode="decimal" className="mono" style={{ fontSize: 22 }} value={v} onChange={(e) => setV(e.target.value)} /></label>
      <label className="f"><span>Devise</span><select value={c} onChange={(e) => setC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.label}</option>)}</select></label></div>
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 14, padding: 18 }}><div className="u">En lettres</div><p className="d" style={{ fontSize: "clamp(22px,3vw,30px)", margin: "10px 0 0", lineHeight: 1.15, fontWeight: 600 }}>{w.charAt(0).toUpperCase() + w.slice(1)}</p></div>
    <div className="row" style={{ marginTop: 14, flexWrap: "wrap" }}><button className="b s" onClick={async () => { try { await navigator.clipboard.writeText(full); } catch {} setOk(true); setTimeout(() => setOk(false), 1600); }}>{ok ? "Copié" : "Copier la formule complète"}</button><span className="mute" style={{ fontSize: 14 }}>« {full} »</span></div>
  </div>);
}
