"use client";
import { OPERATORS } from "../lib/money";
import { LINKS } from "../lib/pay";
import { opsFor, prefersBank, dialFor } from "../lib/countries";
import { useT } from "../lib/i18n";
// Moyens de paiement : Mobile Money, virement, lien de paiement. Tous facultatifs.
export default function PayFields({ value = [], onChange, country }) {
  const { tr } = useT(); const list = (value || []).map((m) => ({ type: m.type || "momo", ...m }));
  const up = (i, k, v) => onChange(list.map((m, n) => (n === i ? { ...m, [k]: v } : m)));
  const add = (type, op) => onChange([...list, type === "momo" ? { type, op: op || opsFor(country)[0] || "MTN MoMo", number: "" } : type === "bank" ? { type, bank: "", iban: "", swift: "", name: "" } : { type, provider: "PayPal", url: "" }]);
  const sug = opsFor(country).filter((o) => !list.some((m) => m.op === o)); const ops = [...new Set([...opsFor(country), ...OPERATORS])];
  const bank = <button type="button" className="b s o" onClick={() => add("bank")}>+ {tr("Compte bancaire", "Bank account")}</button>;
  return (<div className="payf">
    {!list.length && <p className="hint" style={{ marginTop: 0 }}>{tr("Facultatif. Ajoutez ce que vos clients utilisent ; ces coordonnées s'affichent sur la facture.", "Optional. Add what your clients use; these details appear on the invoice.")}</p>}
    {list.map((m, i) => (<div className="payf-row" key={i}>
      <span className="payf-k">{m.type === "momo" ? "Mobile Money" : m.type === "bank" ? tr("Banque", "Bank") : tr("Lien de paiement", "Payment link")}</span>
      {m.type === "momo" && <div className="g2"><select aria-label={tr("Opérateur", "Operator")} value={m.op} onChange={(e) => up(i, "op", e.target.value)}>{ops.map((o) => <option key={o}>{o}</option>)}</select>
        <input type="tel" inputMode="tel" placeholder={`${dialFor(country)} …`} value={m.number || ""} onChange={(e) => up(i, "number", e.target.value)} aria-label={tr("Numéro", "Number")} /></div>}
      {m.type === "bank" && <div className="g2"><input placeholder={tr("Banque", "Bank name")} value={m.bank || ""} onChange={(e) => up(i, "bank", e.target.value)} /><input placeholder={tr("Titulaire du compte", "Account holder")} value={m.name || ""} onChange={(e) => up(i, "name", e.target.value)} />
        <input className="mono" placeholder={tr("IBAN, RIB ou n° de compte", "IBAN or account number")} value={m.iban || ""} onChange={(e) => up(i, "iban", e.target.value)} /><input className="mono" placeholder={tr("BIC / SWIFT (facultatif)", "BIC / SWIFT / sort code (optional)")} value={m.swift || ""} onChange={(e) => up(i, "swift", e.target.value)} /></div>}
      {m.type === "link" && <div className="g2"><select value={m.provider} onChange={(e) => up(i, "provider", e.target.value)} aria-label="Service">{LINKS.map((o) => <option key={o}>{o}</option>)}</select>
        <input type="url" placeholder={m.provider === "PayPal" ? "paypal.me/…" : "https://…"} value={m.url || ""} onChange={(e) => up(i, "url", e.target.value)} aria-label="URL" /></div>}
      <button type="button" className="x" aria-label={tr("Retirer", "Remove")} onClick={() => onChange(list.filter((_, n) => n !== i))}>×</button>
    </div>))}
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      {prefersBank(country) && bank}
      {sug.slice(0, 3).map((o) => <button key={o} type="button" className="b s o" onClick={() => add("momo", o)}>+ {o}</button>)}
      {!sug.length && !prefersBank(country) && <button type="button" className="b s o" onClick={() => add("momo")}>+ Mobile Money</button>}
      {!prefersBank(country) && bank}
      <button type="button" className="b s o" onClick={() => add("link")}>+ {tr("Lien PayPal, Stripe…", "PayPal, Stripe link…")}</button></div>
  </div>);
}
