"use client";
import { fmt, totals, inWords, KINDS, cur } from "../lib/money";
export default function DocPaper({ doc, profile }) {
  const t = totals(doc); const k = KINDS[doc.kind] || KINDS.invoice; const c = doc.client || {};
  const momo = (profile.momo || []).filter(m => m.number);
  const curName = { XOF: "francs CFA", XAF: "francs CFA", EUR: "euros", USD: "dollars US", NGN: "naira", GHS: "cedis", MAD: "dirhams", KES: "shillings kényans" }[doc.currency];
  return (<div className="doc" style={{"--accent": profile.accent || "#1F3A2E"}}>
    <div className="row">
      <div>
        <div style={{fontSize:17,fontWeight:800}}>{profile.business_name || "Votre entreprise"}</div>
        {profile.address && <div>{profile.address}</div>}
        {(profile.phone || profile.email) && <div>{[profile.phone, profile.email].filter(Boolean).join(" · ")}</div>}
        {profile.ifu && <div className="small">IFU / NINEA : {profile.ifu}</div>}
        {profile.rccm && <div className="small">RCCM : {profile.rccm}</div>}
      </div>
      <div style={{textAlign:"right"}}>
        <h2>{k.fr}</h2>
        <div><b>N° {doc.number}</b></div>
        <div>Date : {doc.issue_date ? new Date(doc.issue_date).toLocaleDateString("fr-FR") : ""}</div>
        {doc.due_date && doc.kind !== "receipt" && <div>{doc.kind === "quote" ? "Valable jusqu'au" : "Échéance"} : {new Date(doc.due_date).toLocaleDateString("fr-FR")}</div>}
      </div>
    </div>
    <div style={{marginTop:26,padding:"12px 14px",border:"1px solid #e5e0d6",borderRadius:8,maxWidth:340}}>
      <div className="small" style={{textTransform:"uppercase",letterSpacing:".06em"}}>{doc.kind === "receipt" ? "Reçu de" : "Facturé à"}</div>
      <b>{c.name || "—"}</b>{c.address && <div>{c.address}</div>}{c.phone && <div>{c.phone}</div>}{c.email && <div>{c.email}</div>}{c.tax_id && <div className="small">IFU / N° fiscal : {c.tax_id}</div>}
    </div>
    <table><thead><tr><th>Désignation</th><th className="r">Qté</th><th className="r">Prix unitaire</th><th className="r">Montant</th></tr></thead>
      <tbody>{(doc.items || []).map((i, n) => <tr key={n}><td>{i.label}</td><td className="r">{i.qty}</td><td className="r">{fmt(i.price, doc.currency)}</td><td className="r">{fmt((+i.qty||0)*(+i.price||0), doc.currency)}</td></tr>)}</tbody></table>
    <div className="tot">
      <div><span>Sous-total HT</span><span>{fmt(t.sub, doc.currency)}</span></div>
      {t.disc > 0 && <div><span>Remise</span><span>− {fmt(t.disc, doc.currency)}</span></div>}
      <div><span>{Number(doc.tax_rate) ? `TVA ${doc.tax_rate} %` : "TVA non applicable"}</span><span>{fmt(t.tax, doc.currency)}</span></div>
      <div className="g"><span>Total {Number(doc.tax_rate) ? "TTC" : ""}</span><span>{fmt(t.total, doc.currency)}</span></div>
    </div>
    <p style={{fontStyle:"italic",marginTop:14}}>{doc.kind === "receipt" ? "Reçu la somme de" : doc.kind === "quote" ? "Le présent devis s'élève à" : "Arrêtée la présente facture à la somme de"} {inWords(t.total)} {curName}{cur(doc.currency).decimals && Math.round((t.total % 1) * 100) ? ` et ${Math.round((t.total % 1) * 100)} centimes` : ""}.</p>
    {doc.kind === "receipt" && <p style={{fontWeight:800,color:"#2F7D4F",fontSize:14}}>✓ Paiement reçu — merci pour votre confiance.</p>}
    {doc.kind !== "receipt" && momo.length > 0 && <div className="pay"><b>Modes de paiement</b>{momo.map((m, i) => <div key={i}>{m.op} : <b>{m.number}</b>{m.name ? ` (${m.name})` : ""}</div>)}<div className="small" style={{marginTop:4}}>Merci d'indiquer « {doc.number} » en référence du paiement.</div></div>}
    {doc.notes && <p style={{whiteSpace:"pre-wrap",marginTop:16}}>{doc.notes}</p>}
    {profile.plan !== "pro" && <p className="small" style={{textAlign:"center",marginTop:28}}>Document créé avec Facturo</p>}
  </div>);
}
