"use client";
import { fmt, totals, inWords, KINDS, cur } from "../lib/money";
import { FONTS, DEFAULT_BLOCKS } from "../lib/templates";
const CUR_WORDS = { XOF: "francs CFA", XAF: "francs CFA", EUR: "euros", USD: "dollars US", NGN: "naira", GHS: "cedis", MAD: "dirhams", KES: "shillings kényans" };
const d8 = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";
export function wordsLine(doc, total) {
  const cents = cur(doc.currency).decimals ? Math.round((total % 1) * 100) : 0;
  const lead = doc.kind === "receipt" ? "Reçu la somme de" : doc.kind === "quote" ? "Le présent devis s'élève à" : "Arrêtée la présente facture à la somme de";
  return `${lead} ${inWords(Math.floor(total))} ${CUR_WORDS[doc.currency] || doc.currency}${cents ? ` et ${cents} centimes` : ""}.`;
}
export default function DocPaper({ doc, profile = {}, template }) {
  const tp = template || profile.template || "atelier"; const t = totals(doc); const k = KINDS[doc.kind] || KINDS.invoice; const c = doc.client || {};
  const B = { ...DEFAULT_BLOCKS, ...(profile.blocks || {}) }; const F = FONTS[profile.font] || FONTS.grotesk;
  const momo = (profile.momo || []).filter((m) => m.number);
  const style = { "--a": profile.accent || "#141210", "--pf": F.body, "--pfd": F.display };
  const From = ({ light }) => (<div>
    {B.logo && profile.logo && <img src={profile.logo} alt="" className="logo-img" style={{ marginBottom: 10 }} />}
    <div style={{ fontSize: 15, fontWeight: 700 }}>{profile.business_name || "Votre entreprise"}</div>
    {profile.address && <div>{profile.address}</div>}
    {(profile.phone || profile.email) && <div>{[profile.phone, profile.email].filter(Boolean).join(" · ")}</div>}
    {(profile.ifu || profile.rccm) && <div className="fine" style={light ? { color: "#ffffffaa" } : null}>{[profile.ifu && `IFU/NINEA ${profile.ifu}`, profile.rccm && `RCCM ${profile.rccm}`].filter(Boolean).join(" · ")}</div>}
  </div>);
  const To = () => (<div><div className="lbl">{doc.kind === "receipt" ? "Reçu de" : doc.kind === "quote" ? "Devis pour" : "Facturé à"}</div>
    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name || "Nom du client"}</div>{c.address && <div>{c.address}</div>}{c.phone && <div>{c.phone}</div>}{c.email && <div>{c.email}</div>}{c.tax_id && <div className="fine">IFU / N° fiscal {c.tax_id}</div>}</div>);
  const Meta = ({ light }) => (<div className={tp === "registre" ? "" : "r"} style={light ? { textAlign: "right" } : null}>
    <div className="lbl" style={light ? { color: "#ffffffaa" } : null}>N°</div><div className="nm" style={{ fontWeight: 600 }}>{doc.number}</div>
    <div className="lbl" style={{ marginTop: 8, ...(light ? { color: "#ffffffaa" } : {}) }}>Date</div><div>{d8(doc.issue_date)}</div>
    {doc.due_date && doc.kind !== "receipt" && <><div className="lbl" style={{ marginTop: 8, ...(light ? { color: "#ffffffaa" } : {}) }}>{doc.kind === "quote" ? "Valable jusqu'au" : "Échéance"}</div><div>{d8(doc.due_date)}</div></>}
  </div>);
  const Items = () => (<table style={{ marginTop: 26 }}><thead><tr><th>Désignation</th><th className="r">Qté</th><th className="r">P.U.</th><th className="r">Montant</th></tr></thead>
    <tbody>{(doc.items || []).filter(i => i.label || +i.price).map((i, n) => <tr key={n}><td>{i.label}</td><td className="r nm">{i.qty}</td><td className="r nm">{fmt(i.price, doc.currency)}</td><td className="r nm">{fmt((+i.qty || 0) * (+i.price || 0), doc.currency)}</td></tr>)}
      {!(doc.items || []).some(i => i.label || +i.price) && <tr><td colSpan={4} style={{ color: "#aaa" }}>Ajoutez une ligne…</td></tr>}</tbody></table>);
  const Totals = () => (<div className={`tot ${tp === "registre" ? "box" : ""}`} style={{ marginTop: 18 }}>
    <div><span>Sous-total HT</span><span className="nm">{fmt(t.sub, doc.currency)}</span></div>
    {t.disc > 0 && <div><span>Remise</span><span className="nm">− {fmt(t.disc, doc.currency)}</span></div>}
    <div><span>{+doc.tax_rate ? `TVA ${String(doc.tax_rate).replace(".", ",")} %` : "TVA non applicable"}</span><span className="nm">{fmt(t.tax, doc.currency)}</span></div>
    <div className="grand"><span>Total{+doc.tax_rate ? " TTC" : ""}</span><span className="nm">{fmt(t.total, doc.currency)}</span></div></div>);
  const Bottom = () => (<>
    {B.words && <p className="words">{wordsLine(doc, t.total)}</p>}
    {doc.kind !== "receipt" && B.pay && momo.length > 0 && <div className={`pay ${tp === "registre" ? "box" : ""}`} style={tp === "registre" ? { background: "none" } : null}><div className="lbl">Payer par Mobile Money</div>
      {momo.map((m, i) => <div key={i} style={{ marginTop: 3 }}>{m.op} · <b>{m.number}</b>{m.name ? ` — ${m.name}` : ""}</div>)}
      <div className="fine" style={{ marginTop: 6 }}>Référence à indiquer : {doc.number}{doc.public_token ? ` · Payer en ligne : ${typeof window !== "undefined" ? location.host : ""}/f/${doc.public_token}` : ""}</div></div>}
    {B.notes && doc.notes && <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{doc.notes}</p>}
    {B.signature && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}><div style={{ width: 200, borderTop: "1px solid #191714", paddingTop: 6, textAlign: "center" }} className="fine">Signature et cachet</div></div>}
    <div className="fine" style={{ marginTop: 26, display: "flex", justifyContent: "space-between", gap: 10 }}><span>{profile.footer || ""}</span>{profile.plan !== "pro" && <span>Créé avec Kola</span>}</div>
  </>);
  const stamp = doc.status === "paid" && doc.kind === "invoice" ? <div className="stamp">PAYÉE</div> : doc.kind === "receipt" ? <div className="stamp">REÇU</div> : null;
  if (tp === "marche") return (<div className="paper t-marche" style={style}>{stamp}
    <div className="band"><div><div className="title">{k.fr}</div><div style={{ marginTop: 14 }}><From light /></div></div><Meta light /></div>
    <div className="pad" style={{ paddingTop: 28 }}><To /><Items /><Totals /><Bottom /></div></div>);
  if (tp === "registre") return (<div className="paper t-registre" style={style}>{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #191714", paddingBottom: 10, marginBottom: 18 }}><span className="title">{k.fr} — {doc.number}</span><span>{d8(doc.issue_date)}</span></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div className="box"><div className="lbl">Émetteur</div><From /></div><div className="box"><To />{doc.due_date && doc.kind !== "receipt" && <div className="fine" style={{ marginTop: 6 }}>{doc.kind === "quote" ? "Valable jusqu'au" : "Échéance"} : {d8(doc.due_date)}</div>}</div></div>
    <Items /><Totals /><Bottom /></div></div>);
  if (tp === "sahel") return (<div className="paper t-sahel" style={style}><div className="edge" />{stamp}<div className="pad" style={{ paddingLeft: 58 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}><div className="title">{k.fr.toLowerCase()}.</div><Meta /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 34 }}><div><div className="lbl">De</div><From /></div><To /></div>
    <Items /><Totals /><Bottom /></div></div>);
  return (<div className="paper t-atelier" style={style}>{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexDirection: B.align === "right" ? "row-reverse" : "row" }}><From /><div className="r"><div className="title">{k.fr}</div></div></div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 30, paddingTop: 18, borderTop: "1px solid #eee7dc" }}><To /><Meta /></div>
    <Items /><Totals /><Bottom /></div></div>);
}
