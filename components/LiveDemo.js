"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseDraft } from "../lib/parse";
import { fmt } from "../lib/money";
const EX = {
  fr: "Facture pour Hôtel Les Cocotiers : 12 uniformes à 18 500 et livraison 5 000, sous 15 jours",
  en: "Invoice Acme Studio Ltd: logo design 1,200 and 3 social templates at 150, due in 14 days",
};
export default function LiveDemo({ lang = "fr" }) {
  const en = lang === "en"; const r = useRouter(); const [txt, setTxt] = useState(EX[lang]);
  const d = useMemo(() => parseDraft(txt), [txt]); const c = d.currency || (en ? "USD" : "XOF");
  const total = (d.items || []).reduce((a, i) => a + i.qty * i.price, 0) * (1 + (d.tax_rate || 0) / 100);
  const go = () => { localStorage.setItem("bnv_seed", JSON.stringify({ client: d.client, items: d.items.length ? d.items : undefined, currency: c, kind: d.kind || "invoice", tax_rate: d.tax_rate || 0 })); localStorage.removeItem("bnv_draft"); r.push(en ? "/en/invoice-generator" : "/essai"); };
  return (<div className="live" id="demo">
    <div className="live-in"><label htmlFor="live" className="u" style={{ display: "block" }}>{en ? "① Write what you did" : "① Écrivez ce que vous avez fait"}</label>
      <textarea id="live" rows={2} value={txt} onChange={(e) => setTxt(e.target.value)} aria-label={en ? "Describe the job" : "Décrivez la prestation"} /></div>
    <div className="live-doc" aria-live="polite">
      <div className="row" style={{ justifyContent: "space-between" }}><span className="u" style={{ margin: 0 }}>{en ? "② Your invoice" : "② Votre facture"}</span><span className="stub">№ {en ? "INV" : "FAC"}-2026-0001</span></div>
      <div style={{ fontWeight: 700, margin: "6px 0 8px" }}>{d.client?.name || (en ? "Client" : "Client")}</div>
      <table><tbody>{(d.items || []).slice(0, 4).map((i, n) => <tr key={n}><td>{i.qty > 1 ? `${i.qty} × ` : ""}{i.label}</td><td className="r">{fmt(i.qty * i.price, c, lang)}</td></tr>)}
        {!d.items?.length && <tr><td className="mute">{en ? "Add an amount, e.g. “website 900”" : "Ajoutez un montant, ex. « site 300 000 »"}</td><td /></tr>}</tbody></table>
      <div className="live-tot"><span className="u" style={{ margin: 0 }}>Total</span><b>{fmt(total, c, lang)}</b></div>
    </div>
    <div className="live-acts"><button className="b k" onClick={go}>{en ? "③ Send it — no account →" : "③ L'envoyer — sans compte →"}</button><button className="b o" onClick={go}>PDF</button></div>
  </div>);
}
