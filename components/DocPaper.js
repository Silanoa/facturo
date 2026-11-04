"use client";
import { fmt, totals, inWords, kindName, cur, curName, lineRate } from "../lib/money";
import { FONTS, DEFAULT_TPL, blocksOf } from "../lib/templates";
import { normPay, payLines } from "../lib/pay";
import { country, legalLines } from "../lib/countries";
export const docLang = (doc = {}, profile = {}) => doc.lang || profile.doc_lang || "fr";
export function wordsLine(doc, total, lang = "fr") {
  const cents = cur(doc.currency).decimals ? Math.round((total % 1) * 100) : 0;
  const cn = (curName(doc.currency, lang) || doc.currency).toLowerCase();
  if (lang === "en") { const lead = doc.kind === "receipt" ? "Received the sum of" : doc.kind === "quote" ? "This quote amounts to" : "This invoice amounts to";
    return `${lead} ${inWords(Math.floor(total), "en")} ${cn}${cents ? ` and ${cents} cents` : ""}.`; }
  const lead = doc.kind === "receipt" ? "Reçu la somme de" : doc.kind === "quote" ? "Le présent devis s'élève à la somme de" : "Arrêtée la présente facture à la somme de";
  const w = doc.currency === "XOF" || doc.currency === "XAF" ? "francs CFA" : cn;
  return `${lead} ${inWords(Math.floor(total))} ${w}${cents ? ` et ${cents} centimes` : ""}.`;
}
export const PAY_METHODS = { fr: ["Mobile Money", "Espèces", "Virement", "Carte", "Chèque", "PayPal", "Autre"], en: ["Mobile Money", "Cash", "Bank transfer", "Card", "Cheque", "PayPal", "Other"] };
export default function DocPaper({ doc, profile: prof0 = {}, template }) {
  // Un document peut porter sa propre apparence (modèle choisi à la création).
  const look = (doc.opts || {}).look; const profile = look ? { ...prof0, ...look, letterhead: look.lh_ref ? (((prof0.settings || {}).templates || []).find((x) => x.name === look.lh_ref) || {}).letterhead || null : null } : prof0;
  const lang = docLang(doc, profile); const en = lang === "en"; const tr = (f, e) => (en ? e : f);
  const lh = !template && profile.letterhead; const tp = lh ? "net" : (template || profile.template || DEFAULT_TPL); const t = totals(doc); const c = doc.client || {};
  const B = blocksOf(profile); const O = { pay: true, ref: true, ...(doc.opts || {}) }; const F = FONTS[profile.font] || FONTS.grotesk;
  const K = doc.kind || "invoice"; const kn = (K === "invoice" && B.title) || kindName(K, lang);
  const pays = normPay(profile.momo); const ct = country(profile.country);
  const money = (v) => fmt(v, doc.currency, lang);
  const style = { "--a": profile.accent || "#111110", "--pf": F.body, "--pfd": F.display, "--ls": `${B.logo_size || 56}px`, fontSize: `${(12.5 * (B.scale || 100)) / 100}px` };
  const d8 = (d) => d ? new Date(d).toLocaleDateString(en ? "en-GB" : "fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "";
  const taxL = ct.tax || "Tax ID"; const paid = +doc.paid_amount || 0; const rest = Math.max(0, t.total - paid);
  const isPaid = K === "invoice" && doc.status === "paid"; const partial = K === "invoice" && ["partial", "sent", "draft"].includes(doc.status || "draft") && paid > 0;
  const logo = B.logo && profile.logo ? <img src={profile.logo} alt="" className="logo-img" /> : null;
  const From = ({ light, bare }) => (<div>
    {!bare && logo && <div style={{ marginBottom: 10 }}>{logo}</div>}
    {!bare && <div style={{ fontSize: "1.2em", fontWeight: 700 }}>{profile.business_name || tr("Votre nom ou activité", "Your name or business")}</div>}
    {profile.address && <div>{profile.address}</div>}
    {(profile.phone || profile.email) && <div>{[profile.phone, profile.email].filter(Boolean).join(" · ")}</div>}
    {(profile.ifu || profile.rccm) && <div className="fine" style={light ? { color: "#ffffffaa" } : null}>{[profile.ifu && `${taxL} ${profile.ifu}`, profile.rccm && `${ct.reg || "Reg."} ${profile.rccm}`].filter(Boolean).join(" · ")}</div>}
  </div>);
  const toLbl = K === "receipt" ? tr("Reçu de", "Received from") : K === "quote" ? tr("Proposé à", "Prepared for") : tr("Facturé à", "Bill to");
  const To = () => (<div><div className="lbl">{toLbl}</div>
    <div style={{ fontWeight: 700, fontSize: "1.1em" }}>{c.name || tr("Nom du client", "Client name")}</div>{c.address && <div>{c.address}</div>}{c.phone && <div>{c.phone}</div>}{c.email && <div>{c.email}</div>}{B.client_tax && c.tax_id && <div className="fine">{tr("N° fiscal", "Tax ID")} {c.tax_id}</div>}</div>);
  const dateRows = () => { const r = [[K === "receipt" ? tr("Date du paiement", "Payment date") : tr("Date d'émission", "Issue date"), d8(K === "receipt" ? (O.paid_on || doc.issue_date) : doc.issue_date)]];
    if (K === "invoice" && doc.due_date) r.push([tr("Échéance", "Due date"), d8(doc.due_date)]);
    if (K === "quote" && doc.due_date) r.push([tr("Valable jusqu'au", "Valid until"), d8(doc.due_date)]);
    if (K === "receipt" && O.method) r.push([tr("Mode de paiement", "Payment method"), O.method]);
    if (K === "receipt" && O.for) r.push([tr("En règlement de", "In payment of"), O.for]);
    if (K === "invoice" && O.po) r.push([tr("Réf. commande", "PO number"), O.po]); return r; };
  const Dates = ({ light }) => <div>{dateRows().map(([l, v], i) => <div key={l} style={i ? { marginTop: 8 } : null}><div className="lbl" style={light ? { color: "#ffffffaa" } : null}>{l}</div><div>{v}</div></div>)}</div>;
  const items = (doc.items || []).filter(i => i.label || +i.price);
  const multi = new Set(items.map((i) => lineRate(doc, i))).size > 1;
  const pc = (r) => `${String(r).replace(".", en ? "." : ",")} %`;
  const sigImg = profile.plan === "pro" && (profile.settings || prof0?.settings || {}).sign_img; const SigL = sigImg ? <img className="sig-img" src={sigImg} alt="" /> : <div className="sigline" />;
  const Items = () => (<table className="items"><thead><tr><th>{tr("Désignation", "Description")}</th><th className="r">{tr("Qté", "Qty")}</th><th className="r">{tr("P.U.", "Unit")}</th>{multi && <th className="r">{tr("TVA", "VAT")}</th>}<th className="r">{tr("Montant", "Amount")}</th></tr></thead>
    <tbody>{items.map((i, n) => <tr key={n}><td>{i.label}{i.desc && <div className="fine">{i.desc}</div>}</td><td className="r nm">{i.qty}</td><td className="r nm">{money(i.price)}</td>{multi && <td className="r nm">{pc(lineRate(doc, i))}</td>}<td className="r nm">{money((+i.qty || 0) * (+i.price || 0))}</td></tr>)}
      {!items.length && <tr><td colSpan={5} style={{ color: "#aaa" }}>{tr("Ajoutez une ligne…", "Add a line…")}</td></tr>}</tbody></table>);
  const vatName = ct.r === "ca" ? tr("TPS/TVH", "GST/HST") : ct.r === "us" ? tr("Taxe", "Sales tax") : tr("TVA", "VAT");
  const Totals = () => (<div className={`tot ${tp === "registre" ? "box" : ""}`}>
    {(t.tax > 0 || t.disc > 0) && <div><span>{tr("Sous-total HT", "Subtotal")}</span><span className="nm">{money(t.sub)}</span></div>}
    {t.disc > 0 && <div><span>{tr("Remise", "Discount")}</span><span className="nm">− {money(t.disc)}</span></div>}
    {t.taxes.map((x) => <div key={x.rate}><span>{`${vatName} ${pc(x.rate)}`}</span><span className="nm">{money(x.amount)}</span></div>)}
    <div className="grand"><span>{K === "receipt" ? tr("Total reçu", "Total received") : tr("Total", "Total")}{t.tax > 0 ? tr(" TTC", "") : ""}</span><span className="nm">{money(t.total)}</span></div>
    {partial && <><div><span>{tr("Déjà réglé", "Paid to date")}</span><span className="nm">− {money(paid)}</span></div><div className="rest"><span>{tr("Reste à payer", "Balance due")}</span><span className="nm">{money(rest)}</span></div></>}</div>);
  const legal = B.legal ? legalLines(profile, doc, lang) : [];
  const S = {
    parties: () => tp === "net" ? null : null,
    items: () => <Items key="items" />,
    totals: () => <Totals key="totals" />,
    words: () => B.words ? <p key="words" className="words">{wordsLine(doc, t.total, lang)}</p> : null,
    pay: () => K === "invoice" && !isPaid && B.pay && O.pay && pays.length > 0 ? <div key="pay" className={`pay ${tp === "registre" ? "box" : ""}`}><div className="lbl">{tr("Modes de paiement", "Payment details")}</div>
      {pays.map((m, i) => <div key={i} style={{ marginTop: 3, wordBreak: "break-word" }}>{m.type === "momo" ? <>{m.op} · <b>{m.number}</b>{m.name ? ` — ${m.name}` : ""}</> : m.type === "bank" ? <>{tr("Virement", "Bank transfer")} · <b>{payLines(m, lang)}</b></> : <>{m.provider} · <b>{m.url.replace(/^https?:\/\//, "")}</b></>}</div>)}
      {(B.ref && O.ref) && <div className="fine" style={{ marginTop: 6 }}>{tr("Référence à indiquer", "Payment reference")} : {doc.number}{O.link !== false && doc.public_token ? ` · ${tr("Payer en ligne", "Pay online")} : ${typeof window !== "undefined" ? location.host : ""}/f/${doc.public_token}` : ""}</div>}</div> : null,
    notes: () => { const dep = K === "quote" && +O.deposit > 0 ? tr(`Acompte de ${O.deposit} % à la commande, soit ${money(t.total * O.deposit / 100)}.`, `Deposit of ${O.deposit}% on acceptance: ${money(t.total * O.deposit / 100)}.`) : "";
      return (B.notes && doc.notes) || dep ? <div key="notes" className="notes"><div className="lbl">{K === "quote" ? tr("Conditions", "Terms") : tr("Notes", "Notes")}</div>{dep && <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{dep}</p>}{B.notes && doc.notes && <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{doc.notes}</p>}</div> : null; },
    signature: () => K === "quote" ? <div key="sig" className="sigs"><div><div className="lbl">{tr("Bon pour accord", "Accepted by the client")}</div><div className="fine">{tr("Date, nom et signature du client", "Date, name and signature")}</div><div className="sigline" /></div>{B.signature && <div><div className="lbl">{tr("Pour l'émetteur", "For the issuer")}</div><div className="fine">&nbsp;</div>{SigL}</div>}</div>
      : K === "receipt" ? <div key="sig" className="sigs one"><div><div className="lbl">{tr("Pour acquit", "Received by")}</div><div className="fine">{profile.business_name || ""}</div>{SigL}</div></div>
      : B.signature ? <div key="sig" className="sigs one"><div><div className="lbl">{tr("Signature et cachet", "Signature")}</div><div className="fine">&nbsp;</div>{SigL}</div></div> : null,
    legal: () => legal.length > 0 ? <div key="legal" className="fine legal">{legal.map((l, i) => <div key={i}>{l}</div>)}</div> : null,
  };
  const body = (parties) => B.order.map((k) => k === "parties" ? (parties ? <div key="parties">{parties}</div> : null) : S[k]());
  // En impression (hors fond importé), le pied de page passe dans la marge basse de chaque page, à côté de « Page x / y ».
  const footTxt = [profile.footer || "", profile.plan !== "pro" ? tr("Fait avec Bonova", "Made with Bonova") : ""].filter(Boolean).join("  ·  ").replace(/[\r\n]+/g, " ").replace(/[<>\\]/g, "").slice(0, 180);
  const pageCss = !(!template && profile.letterhead) ? <style dangerouslySetInnerHTML={{ __html: `@media print{@page{@bottom-left{content:${JSON.stringify(String(footTxt || "")).replace(/[<>]/g, (c) => c === "<" ? "\\3c " : "\\3e ")};font:8pt/1.2 system-ui,sans-serif;color:#8a847b;padding-left:14mm}}.paper .pfoot{display:none!important}}` }} /> : null;
  const foot = <div className="fine pfoot"><span>{profile.footer || ""}</span>{profile.plan !== "pro" && <span>{tr("Fait avec Bonova", "Made with Bonova")}</span>}</div>;
  const stamp = isPaid ? <div className="stamp">{tr("PAYÉE", "PAID")}</div> : K === "receipt" ? <div className="stamp">{tr("PAYÉ", "PAID")}</div> : K === "quote" && doc.status === "accepted" ? <div className="stamp">{tr("ACCEPTÉ", "ACCEPTED")}</div> : K === "quote" && doc.status === "declined" ? <div className="stamp no">{tr("REFUSÉ", "DECLINED")}</div> : doc.status === "cancelled" ? <div className="stamp no">{tr("ANNULÉE", "CANCELLED")}</div> : partial ? <div className="stamp part">{tr("ACOMPTE REÇU", "PART PAID")}</div> : null;
  const cls = `paper k-${K} t-${tp} lp-${B.logo_pos || "left"}`;
  if (tp === "net") {
    const due = K === "receipt" ? tr("Montant reçu", "Amount received") : K === "quote" ? tr("Montant du devis", "Quote total") : isPaid ? tr("Montant réglé", "Amount paid") : partial ? tr("Reste à payer", "Balance due") : tr("Montant dû", "Amount due");
    const lstyle = lh ? { ...style, backgroundImage: `url(${profile.letterhead})` } : style;
    const hasFrom = lh || profile.address || profile.phone || profile.email || profile.ifu || profile.rccm;
    // Fond importé : en impression, le fond est répété sur chaque page (img fixe) et les marges haut/bas du modèle sont réservées sur chaque page (thead/tfoot répétés).
    const lht = `${(210 * (+B.lh_top || 0)) / 100}mm`, lhb = `${(210 * (+B.lh_bottom || 0)) / 100}mm`;
    const wrapLh = (inner) => lh ? <table className="lhw"><thead><tr><td><div className="lhsp" style={{ height: lht }} /></td></tr></thead><tfoot><tr><td><div className="lhsp" style={{ height: lhb }} /></td></tr></tfoot><tbody><tr><td>{inner}</td></tr></tbody></table> : inner;
    return (<div className={`${cls} ${lh ? "lh" : ""}`} style={lstyle}>{pageCss}{lh && <><img className="lhbg" src={profile.letterhead} alt="" /><style dangerouslySetInnerHTML={{ __html: `@media print{@page{margin:0}}` }} /></>}{stamp}<div className="pad" style={lh ? { paddingTop: `${B.lh_top}%`, paddingBottom: `${B.lh_bottom}%` } : null}>{wrapLh(<>
      {!lh && <div className="n-top"><div className="n-id">{logo}<div className="n-bn">{profile.business_name || tr("Votre nom ou activité", "Your name or business")}</div></div>
        <div className="n-kind"><div className="title">{kn}</div><div className="nm">{doc.number}</div></div></div>}
      {lh && <div className="n-kind lhk"><div className="title">{kn}</div><div className="nm">{doc.number}</div></div>}
      {body(<><div className="n-grid">
        <div>{hasFrom && <div className="lbl">{tr("Émetteur", "From")}</div>}{lh && <div style={{ fontWeight: 700 }}>{profile.business_name}</div>}<From bare /></div>
        <To /><Dates /></div>
      <div className="n-due"><span>{due}{K === "invoice" && doc.due_date && !isPaid && <em>{tr("à régler avant le", "due by")} {d8(doc.due_date)}</em>}{K === "quote" && doc.due_date && <em>{tr("offre valable jusqu'au", "valid until")} {d8(doc.due_date)}</em>}{K === "receipt" && O.method && <em>{tr("par", "by")} {O.method}</em>}</span><b className="nm">{money(partial ? rest : t.total)}</b></div></>)}
      {foot}</>)}</div></div>);
  }
  if (tp === "marche") return (<div className={cls} style={style}>{pageCss}{stamp}
    <div className="band"><div>{logo && <div className="band-logo">{logo}</div>}<div className="title">{kn}</div><div className="nm" style={{ marginTop: 6, opacity: .8 }}>{doc.number}</div><div style={{ marginTop: 14 }}><From light /></div></div><div style={{ textAlign: "right" }}><Dates light /></div></div>
    <div className="pad" style={{ paddingTop: 28 }}>{body(<To />)}{foot}</div></div>);
  if (tp === "registre") return (<div className={cls} style={style}>{pageCss}{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1.5px solid #191714", paddingBottom: 10, marginBottom: 18, gap: 10, alignItems: "center" }}>{logo}<span className="title">{kn} — {doc.number}</span><span>{d8(doc.issue_date)}</span></div>
    {body(<div className="pg2"><div className="box"><div className="lbl">{tr("Émetteur", "From")}</div><From bare /><div style={{ fontWeight: 700 }}>{profile.business_name}</div></div><div className="box"><To /><div style={{ marginTop: 8 }}><Dates /></div></div></div>)}{foot}</div></div>);
  if (tp === "sahel") return (<div className={cls} style={style}>{pageCss}{stamp}<div className="pad">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}><div><div className="title">{kn.toLowerCase()}.</div><div className="nm" style={{ marginTop: 8 }}>{doc.number}</div></div><Dates /></div>
    {body(<div className="pg2" style={{ marginTop: 34 }}><div><div className="lbl">{tr("De", "From")}</div><From /></div><To /></div>)}{foot}</div></div>);
  return (<div className={cls} style={style}>{pageCss}{stamp}<div className="pad">
    <div className="at-top"><From /><div className="r"><div className="title">{kn}</div><div className="nm" style={{ marginTop: 4 }}>{doc.number}</div></div></div>
    {body(<div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 30, paddingTop: 18, borderTop: "1px solid #e6e3dc" }}><To /><div className="r"><Dates /></div></div>)}{foot}</div></div>);
}
