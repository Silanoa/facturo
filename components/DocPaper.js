"use client";
import { fmt, totals, inWords, kindName, cur, curName } from "../lib/money";
import { FONTS, DEFAULT_BLOCKS, DEFAULT_TPL } from "../lib/templates";
import { normPay, payLines } from "../lib/pay";
import { country, legalLines } from "../lib/countries";
export const docLang = (doc = {}, profile = {}) => doc.lang || profile.doc_lang || "fr";
export function wordsLine(doc, total, lang = "fr") {
  const cents = cur(doc.currency).decimals ? Math.round((total % 1) * 100) : 0;
  const cn = (curName(doc.currency, lang) || doc.currency).toLowerCase();
  if (lang === "en") { const lead = doc.kind === "receipt" ? "Received the sum of" : doc.kind === "quote" ? "This quote amounts to" : "This invoice amounts to";
    return `${lead} ${inWords(Math.floor(total), "en")} ${cn}${cents ? ` and ${cents} cents` : ""}.`; }
  const lead = doc.kind === "receipt" ? "Reçu la somme de" : doc.kind === "quote" ? "Le présent devis s'élève à" : "Arrêtée la présente facture à la somme de";
  const w = doc.currency === "XOF" || doc.currency === "XAF" ? "francs CFA" : cn;
  return `${lead} ${inWords(Math.floor(total))} ${w}${cents ? ` et ${cents} centimes` : ""}.`;
}
export default function DocPaper({ doc, profile = {}, template }) {
  const lang = docLang(doc, profile); const en = lang === "en"; const tr = (f, e) => (en ? e : f);
  const lh = !template && profile.letterhead; const tp = lh ? "net" : (template || profile.template || DEFAULT_TPL); const t = totals(doc); const c = doc.client || {}; const kn = kindName(doc.kind, lang);
  const B = { ...DEFAULT_BLOCKS, ...(profile.blocks || {}) }; const F = FONTS[profile.font] || FONTS.grotesk;
  const pays = normPay(profile.momo); const ct = country(profile.country || "BJ");
  const money = (v) => fmt(v, doc.currency, lang);
  const style = { "--a": profile.accent || "#111110", "--pf": F.body, "--pfd": F.display };
  const d8 = (d) => d ? new Date(d).toLocaleDateString(en ? "en-GB" : "fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";
  const taxL = ct.tax || "Tax ID";
  const From = ({ light, bare }) => (<div>
    {!bare && B.logo && profile.logo && <img src={profile.logo} alt="" className="logo-img" style={{ marginBottom: 10 }} />}
    {!bare && <div style={{ fontSize: 15, fontWeight: 700 }}>{profile.business_name || tr("Votre entreprise", "Your business")}</div>}
    {profile.address && <div>{profile.address}</div>}
    {(profile.phone || profile.email) && <div>{[profile.phone, profile.email].filter(Boolean).join(" · ")}</div>}
    {(profile.ifu || profile.rccm) && <div className="fine" style={light ? { color: "#ffffffaa" } : null}>{[profile.ifu && `${taxL} ${profile.ifu}`, profile.rccm && `${ct.reg || "Reg."} ${profile.rccm}`].filter(Boolean).join(" · ")}</div>}
  </div>);
  const To = () => (<div><div className="lbl">{doc.kind === "receipt" ? tr("Reçu de", "Received from") : doc.kind === "quote" ? tr("Devis pour", "Quote for") : tr("Facturé à", "Bill to")}</div>
    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name || tr("Nom du client", "Client name")}</div>{c.address && <div>{c.address}</div>}{c.phone && <div>{c.phone}</div>}{c.email && <div>{c.email}</div>}{c.tax_id && <div className="fine">{tr("N° fiscal", "Tax ID")} {c.tax_id}</div>}</div>);
  const Meta = ({ light }) => { const ls = light ? { color: "#ffffffaa" } : {}; return (<div className={tp === "registre" ? "" : "r"} style={light ? { textAlign: "right" } : null}>
    <div className="lbl" style={ls}>{tr("N°", "No.")}</div><div className="nm" style={{ fontWeight: 600 }}>{doc.number}</div>
    <div className="lbl" style={{ marginTop: 8, ...ls }}>Date</div><div>{d8(doc.issue_date)}</div>
    {doc.due_date && doc.kind !== "receipt" && <><div className="lbl" style={{ marginTop: 8, ...ls }}>{doc.kind === "quote" ? tr("Valable jusqu'au", "Valid until") : tr("Échéance", "Due date")}</div><div>{d8(doc.due_date)}</div></>}
  </div>); };
  const items = (doc.items || []).filter(i => i.label || +i.price);
  const Items = () => (<table style={{ marginTop: 26 }}><thead><tr><th>{tr("Désignation", "Description")}</th><th className="r">{tr("Qté", "Qty")}</th><th className="r">{tr("P.U.", "Unit")}</th><th className="r">{tr("Montant", "Amount")}</th></tr></thead>
    <tbody>{items.map((i, n) => <tr key={n}><td>{i.label}</td><td className="r nm">{i.qty}</td><td className="r nm">{money(i.price)}</td><td className="r nm">{money((+i.qty || 0) * (+i.price || 0))}</td></tr>)}
      {!items.length && <tr><td colSpan={4} style={{ color: "#aaa" }}>{tr("Ajoutez une ligne…", "Add a line…")}</td></tr>}</tbody></table>);
  const vatName = ct.r === "ca" ? tr("TPS/TVH", "GST/HST") : ct.r === "us" ? tr("Taxe", "Sales tax") : tr("TVA", "VAT");
  const Totals = () => (<div className={`tot ${tp === "registre" ? "box" : ""}`} style={{ marginTop: 18 }}>
    <div><span>{tr("Sous-total HT", "Subtotal")}</span><span className="nm">{money(t.sub)}</span></div>
    {t.disc > 0 && <div><span>{tr("Remise", "Discount")}</span><span className="nm">− {money(t.disc)}</span></div>}
    {+doc.tax_rate > 0 && <div><span>{`${vatName} ${String(doc.tax_rate).replace(".", en ? "." : ",")} %`}</span><span className="nm">{money(t.tax)}</span></div>}
    <div className="grand"><span>{tr("Total", "Total")}{+doc.tax_rate ? tr(" TTC", "") : ""}</span><span className="nm">{money(t.total)}</span></div></div>);
  const legal = legalLines(profile, doc, lang);
  const Bottom = () => (<>
    {B.words && <p className="words">{wordsLine(doc, t.total, lang)}</p>}
    {doc.kind !== "receipt" && B.pay && pays.length > 0 && <div className={`pay ${tp === "registre" ? "box" : ""}`}><div className="lbl">{tr("Modes de paiement", "How to pay")}</div>
      {pays.map((m, i) => <div key={i} style={{ marginTop: 3, wordBreak: "break-word" }}>{m.type === "momo" ? <>{m.op} · <b>{m.number}</b>{m.name ? ` — ${m.name}` : ""}</> : m.type === "bank" ? <>{tr("Virement", "Bank transfer")} · <b>{payLines(m, lang)}</b></> : <>{m.provider} · <b>{m.url.replace(/^https?:\/\//, "")}</b></>}</div>)}
      <div className="fine" style={{ marginTop: 6 }}>{tr("Référence à indiquer", "Payment reference")} : {doc.number}{doc.public_token ? ` · ${tr("Payer en ligne", "Pay online")} : ${typeof window !== "undefined" ? location.host : ""}/f/${doc.public_token}` : ""}</div></div>}
    {B.notes && doc.notes && <p style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{doc.notes}</p>}
    {B.signature && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 30 }}><div style={{ width: 200, borderTop: "1px solid #191714", paddingTop: 6, textAlign: "center" }} className="fine">{tr("Signature et cachet", "Signature")}</div></div>}
    {legal.length > 0 && <div className="fine" style={{ marginTop: 18 }}>{legal.map((l, i) => <div key={i}>{l}</div>)}</div>}
    <div className="fine" style={{ marginTop: 18, display: "flex", justifyContent: "space-between", gap: 10 }}><span>{profile.footer || ""}</span>{profile.plan !== "pro" && <span>{tr("Fait avec Bonova", "Made with Bonova")}</span>}</div>
  </>);
  const stamp = doc.status === "paid" && doc.kind === "invoice" ? <div className="stamp">{tr("PAYÉE", "PAID")}</div> : doc.kind === "receipt" ? <div className="stamp">{tr("REÇU", "RECEIVED")}</div> : doc.status === "accepted" ? <div className="stamp">{tr("ACCEPTÉ", "ACCEPTED")}</div> : null;
  if (tp === "net") {
    const due = doc.kind === "receipt" ? tr("Montant reçu", "Amount received") : doc.kind === "quote" ? tr("Montant du devis", "Quote total") : doc.status === "paid" ? tr("Montant réglé", "Amount paid") : tr("Montant dû", "Amount due");
    const lstyle = lh ? { ...style, backgroundImage: `url(${profile.letterhead})` } : style;
    return (<div className={`paper t-net ${lh ? "lh" : ""}`} style={lstyle}>{stamp}<div className="pad" style={lh ? { paddingTop: `${B.lh_top}%`, paddingBottom: `${B.lh_bottom}%` } : null}>
      {!lh && <div className="n-top"><div className="n-id">{B.logo && profile.logo && <img src={profile.logo} alt="" className="logo-img" />}<div className="n-bn">{profile.business_name || tr("Votre entreprise", "Your business")}</div></div>
        <div className="n-kind"><div className="title">{kn}</div><div className="nm">{doc.number}</div></div></div>}
      {lh && <div className="n-kind lhk"><div className="title">{kn}</div><div className="nm">{doc.number}</div></div>}
      <div className="n-grid">
        <div>{(lh || profile.address || profile.phone || profile.email || profile.ifu || profile.rccm) && <div className="lbl">{tr("Émetteur", "From")}</div>}{lh ? <><div style={{ fontWeight: 700 }}>{profile.business_name}</div><From bare /></> : <From bare />}</div>
        <To />
        <div><div className="lbl">{tr("Date d'émission", "Issue date")}</div><div>{d8(doc.issue_date)}</div>{doc.due_date && doc.kind !== "receipt" && <><div className="lbl" style={{ marginTop: 10 }}>{doc.kind === "quote" ? tr("Valable jusqu'au", "Valid until") : tr("Échéance", "Due date")}</div><div>{d8(doc.due_date)}</div></>}</div>
      </div>
      <div className="n-due"><span>{due}{doc.due_date && doc.kind === "invoice" && doc.status !== "paid" && <em>{tr("à régler avant le", "due by")} {d8(doc.due_date)}</em>}</span><b className="nm">{money(t.total)}</b></div>
      <Items /><Totals /><Bottom /></div></div>);
  }
  if (tp === "marche") return (<div className="paper t-marche" style={style}>{stamp}
    <div className="band"><div><div className="title">{kn}</div><div style={{ marginTop: 14 }}><From light /></div></div><Meta light /></div>
    <div className="pad" style={{ paddingTop: 28 }}><To /><Items /><Totals /><Bottom /></div></div>);
  if (tp === "registre") return (<div className="paper t-registre" style={style}>{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #191714", paddingBottom: 10, marginBottom: 18, gap: 10 }}><span className="title">{kn} — {doc.number}</span><span>{d8(doc.issue_date)}</span></div>
    <div className="pg2"><div className="box"><div className="lbl">{tr("Émetteur", "From")}</div><From /></div><div className="box"><To />{doc.due_date && doc.kind !== "receipt" && <div className="fine" style={{ marginTop: 6 }}>{doc.kind === "quote" ? tr("Valable jusqu'au", "Valid until") : tr("Échéance", "Due")} : {d8(doc.due_date)}</div>}</div></div>
    <Items /><Totals /><Bottom /></div></div>);
  if (tp === "sahel") return (<div className="paper t-sahel" style={style}>{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}><div className="title">{kn.toLowerCase()}.</div><Meta /></div>
    <div className="pg2" style={{ marginTop: 34 }}><div><div className="lbl">{tr("De", "From")}</div><From /></div><To /></div>
    <Items /><Totals /><Bottom /></div></div>);
  return (<div className="paper t-atelier" style={style}>{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexDirection: B.align === "right" ? "row-reverse" : "row" }}><From /><div className="r"><div className="title">{kn}</div></div></div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 30, paddingTop: 18, borderTop: "1px solid #e6e3dc" }}><To /><Meta /></div>
    <Items /><Totals /><Bottom /></div></div>);
}
