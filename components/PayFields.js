"use client";
import { OPERATORS } from "../lib/money";
import { LINKS } from "../lib/pay";
import { useT } from "../lib/i18n";
// Éditeur des moyens de paiement : Mobile Money, virement / IBAN, lien de paiement (Stripe, PayPal, Wise, Paystack…)
export default function PayFields({ value = [], onChange }) {
  const { tr } = useT(); const list = (value || []).map((m) => ({ type: m.type || "momo", ...m }));
  const up = (i, k, v) => onChange(list.map((m, n) => (n === i ? { ...m, [k]: v } : m)));
  const add = (type) => onChange([...list, type === "momo" ? { type, op: "MTN MoMo", number: "" } : type === "bank" ? { type, bank: "", iban: "", swift: "", name: "" } : { type, provider: "PayPal", url: "" }]);
  return (<div className="payf">
    {list.map((m, i) => (<div className="payf-row" key={i}>
      <span className="payf-k">{m.type === "momo" ? "Mobile Money" : m.type === "bank" ? tr("Virement", "Bank") : tr("Lien", "Link")}</span>
      {m.type === "momo" && <div className="g2"><select aria-label="Opérateur" value={m.op} onChange={(e) => up(i, "op", e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select>
        <input type="tel" inputMode="tel" placeholder="+229 01 …" value={m.number || ""} onChange={(e) => up(i, "number", e.target.value)} aria-label={tr("Numéro", "Number")} /></div>}
      {m.type === "bank" && <div className="g2"><input placeholder={tr("Banque", "Bank name")} value={m.bank || ""} onChange={(e) => up(i, "bank", e.target.value)} /><input placeholder={tr("Titulaire", "Account holder")} value={m.name || ""} onChange={(e) => up(i, "name", e.target.value)} />
        <input className="mono" placeholder="IBAN / RIB / Account no." value={m.iban || ""} onChange={(e) => up(i, "iban", e.target.value)} /><input className="mono" placeholder="SWIFT / BIC / Sort code" value={m.swift || ""} onChange={(e) => up(i, "swift", e.target.value)} /></div>}
      {m.type === "link" && <div className="g2"><select value={m.provider} onChange={(e) => up(i, "provider", e.target.value)} aria-label="Service">{LINKS.map((o) => <option key={o}>{o}</option>)}</select>
        <input type="url" placeholder={m.provider === "PayPal" ? "paypal.me/votrenom" : "https://…"} value={m.url || ""} onChange={(e) => up(i, "url", e.target.value)} aria-label="URL" /></div>}
      <button type="button" className="x" aria-label={tr("Retirer", "Remove")} onClick={() => onChange(list.filter((_, n) => n !== i))}>×</button>
    </div>))}
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}><button type="button" className="b s o" onClick={() => add("momo")}>+ Mobile Money</button><button type="button" className="b s o" onClick={() => add("bank")}>+ {tr("Virement / IBAN", "Bank / IBAN")}</button><button type="button" className="b s o" onClick={() => add("link")}>+ Stripe, PayPal, Wise…</button></div>
  </div>);
}
