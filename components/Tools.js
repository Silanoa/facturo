"use client";
import { useState, useEffect } from "react";
import { inWords, fmt, CURRENCIES, curName } from "../lib/money";
import { COUNTRIES } from "../lib/countries";
import { useT } from "../lib/i18n";
const n = (v) => parseFloat(String(v).replace(/\s/g, "").replace(",", ".")) || 0;
export function VatCalc() {
  const { tr, lang } = useT(); const [mode, setMode] = useState("ht"); const [c, setC] = useState("EUR"); const [mt, setMt] = useState(false); useEffect(() => setMt(true), []);
  const def = 20; const [rows, setRows] = useState([{ amt: "1000", rate: def }]); const [multi, setMulti] = useState(false);
  const RATES = COUNTRIES.filter(x => x.vat > 0).map(x => [lang === "en" ? x.en : x.fr, x.vat]); const pc = (r) => lang === "en" ? `${r}%` : `${String(r).replace(".", ",")} %`;
  const opts = [...new Set([0, 5, 5.5, 7.5, 10, ...RATES.map(r => r[1])])].sort((x, y) => x - y);
  const calc = rows.map((r) => { const a = n(r.amt); const rt = n(r.rate); const ht = mode === "ht" ? a : a / (1 + rt / 100); return { rt, ht, tva: ht * rt / 100 }; });
  const ht = calc.reduce((x, r) => x + r.ht, 0), tva = calc.reduce((x, r) => x + r.tva, 0), ttc = ht + tva;
  const by = Object.entries(calc.reduce((o, r) => ({ ...o, [r.rt]: (o[r.rt] || 0) + r.tva }), {})).filter(([, v]) => v > 0);
  const up = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const RateIn = ({ r, i }) => { const known = opts.includes(n(r.rate)) && !r.custom; return (<div className="row" style={{ gap: 6 }}>
    <select value={known ? n(r.rate) : "x"} onChange={(e) => e.target.value === "x" ? up(i, "custom", true) : setRows(rows.map((x, j) => j === i ? { ...x, rate: +e.target.value, custom: false } : x))} aria-label={tr("Taux", "Rate")} style={{ flex: 1 }}>
      {opts.map(o => <option key={o} value={o}>{pc(o)}</option>)}<option value="x">{tr("Autre taux…", "Other rate…")}</option></select>
    {!known && <input className="mono" inputMode="decimal" style={{ width: 80 }} value={r.rate} onChange={(e) => up(i, "rate", e.target.value)} aria-label={tr("Taux personnalisé", "Custom rate")} />}</div>); };
  if (!mt) return <div className="panel tool" style={{ padding: 24, minHeight: 420 }} />;
  return (<div className="panel tool" style={{ padding: 24 }}>
    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
      <div className="seg"><button className={mode === "ht" ? "on" : ""} onClick={() => setMode("ht")}>{tr("Montants HT", "Net amounts")}</button><button className={mode === "ttc" ? "on" : ""} onClick={() => setMode("ttc")}>{tr("Montants TTC", "Gross amounts")}</button></div>
      <label className="row chk" style={{ margin: 0 }}><input type="checkbox" checked={multi} onChange={(e) => { setMulti(e.target.checked); if (!e.target.checked) setRows(rows.slice(0, 1)); }} />{tr("Plusieurs taux", "Several rates")}</label></div>
    {rows.map((r, i) => <div className="g3" key={i} style={{ gridTemplateColumns: multi ? "1.4fr 1.2fr auto" : "1.4fr 1.2fr 1fr", alignItems: "end" }}>
      <label className="f"><span>{multi ? `${tr("Ligne", "Line")} ${i + 1}` : tr("Montant", "Amount")} {mode === "ht" ? tr("HT", "net") : tr("TTC", "gross")}</span><input inputMode="decimal" className="mono" value={r.amt} onChange={(e) => up(i, "amt", e.target.value)} /></label>
      <div className="f"><span>{tr("Taux", "Rate")}</span>{RateIn({ r, i })}</div>
      {multi ? <button className="x" style={{ marginBottom: 16 }} disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))} aria-label={tr("Retirer", "Remove")}>×</button>
        : <label className="f"><span>{tr("Devise", "Currency")}</span><select value={c} onChange={(e) => setC(e.target.value)}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.code}</option>)}</select></label>}</div>)}
    {multi && <div className="row" style={{ gap: 10, marginBottom: 14 }}><button className="b s o" onClick={() => setRows([...rows, { amt: "", rate: rows[rows.length - 1].rate }])}>+ {tr("Ajouter une ligne", "Add a line")}</button>
      <select value={c} onChange={(e) => setC(e.target.value)} style={{ width: 110 }} aria-label={tr("Devise", "Currency")}>{CURRENCIES.map(x => <option key={x.code} value={x.code}>{x.code}</option>)}</select></div>}
    <div className="stats" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>{[[tr("Hors taxes", "Net"), ht], [by.length === 1 ? `${tr("TVA", "VAT")} ${pc(by[0][0])}` : tr("TVA", "VAT"), tva], [tr("Toutes taxes", "Gross"), ttc]].map(([l, v], i) => <div key={l}><div className="u">{l}</div><div className="mono" style={{ fontSize: i === 2 ? 26 : 22, fontWeight: 600, marginTop: 8, color: i === 2 ? "var(--carbon)" : "inherit" }}>{fmt(v, c, lang)}</div></div>)}</div>
    {by.length > 1 && <div className="mute" style={{ fontSize: 14, marginTop: 12 }}>{by.map(([r, v]) => <div key={r}>{tr("TVA", "VAT")} {pc(r)} : <b className="mono">{fmt(v, c, lang)}</b></div>)}</div>}
    <p className="mute" style={{ fontSize: 14, margin: "14px 0 0" }}>{tr("Calcul : TVA = HT × taux · TTC = HT × (1 + taux) · HT = TTC ÷ (1 + taux)", "Formula: VAT = net × rate · gross = net × (1 + rate) · net = gross ÷ (1 + rate)")}</p>
    <style dangerouslySetInnerHTML={{ __html: `@media(max-width:700px){.tool .g3,.tool .stats{grid-template-columns:1fr!important}.tool .stats>div{border-right:0!important;border-bottom:1px solid var(--line)}}` }} />
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
