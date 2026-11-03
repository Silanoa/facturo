"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { fmt, kindName } from "../../../lib/money";
import { opShort, waLink } from "../../../lib/share";
import { normPay, safeUrl } from "../../../lib/pay";
import { trOf } from "../../../lib/i18n";
import DocPaper from "../../../components/DocPaper";
import { Mark } from "../../../components/Brand";
import { ICopy, IDown } from "../../../components/Icons";
export default function Pub() {
  const { token } = useParams(); const [d, setD] = useState(undefined); const [show, setShow] = useState(false); const [copied, setCopied] = useState(null); const [note, setNote] = useState(""); const [decl, setDecl] = useState(false); const [sent, setSent] = useState(false); const [acc, setAcc] = useState(false);
  useEffect(() => { supabase.rpc("get_public_doc", { p_token: token }).then(({ data }) => setD(data || null)); }, [token]);
  if (d === undefined) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">bonova</span></div>;
  const nl = typeof navigator !== "undefined" && /^en/i.test(navigator.language) ? "en" : "fr";
  if (!d) { const t = trOf(nl); return <div className="pub" style={{ paddingTop: 80 }}><h1 style={{ fontSize: 44 }}>{t("Document introuvable.", "Document not found.")}</h1><p className="mute">{t("Le lien est peut-être incomplet.", "The link may be incomplete.")}</p></div>; }
  const { doc, profile } = d; const L = doc.lang || profile.doc_lang || "fr"; const tr = trOf(L); const loc = L === "en" ? "en-GB" : "fr-FR";
  const kn = kindName(doc.kind, L); const paid = doc.status === "paid"; const pay = normPay(profile.momo);
  const momo = pay.filter(m => m.type === "momo"), bank = pay.filter(m => m.type === "bank"), links = pay.filter(m => m.type === "link");
  const late = !paid && doc.due_date && new Date(doc.due_date) < new Date();
  const accepted = acc || doc.status === "accepted" || doc.accepted_at;
  const copy = async (t, i) => { try { await navigator.clipboard.writeText(String(t).replace(/\s/g, "")); } catch {} setCopied(i); setTimeout(() => setCopied(null), 1800); };
  async function declare() { setDecl(true); const { data } = await supabase.rpc("declare_paid", { p_token: token, p_note: note }); setDecl(false); if (data !== false) setSent(true); }
  async function accept() { const { error } = await supabase.rpc("accept_quote", { p_token: token }); if (!error) setAcc(true); }
  const date = (x, o) => new Date(x).toLocaleDateString(loc, o || { day: "numeric", month: "long", year: "numeric" });
  const Row = ({ i, tag, main, sub, val }) => (<div className="payrow"><span className="op">{tag}</span>
    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: "clamp(14px,4.2vw,17px)", fontWeight: 650, fontVariantNumeric: "tabular-nums", overflowWrap: "anywhere", whiteSpace: String(main).length < 22 ? "nowrap" : "normal" }}>{main}</div>{sub && <div className="mute" style={{ fontSize: 13.5 }}>{sub}</div>}</div>
    <button className="b s o" onClick={() => copy(val || main, i)}>{copied === i ? tr("Copié", "Copied") : <><ICopy width="15" height="15" /> {tr("Copier", "Copy")}</>}</button></div>);
  return (<div lang={L} style={{ minHeight: "100vh" }}>
    <div className="pub np">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 22, borderBottom: "1.5px solid var(--ink)", paddingBottom: 12 }}>
        <div className="row" style={{ gap: 10, minWidth: 0 }}>{profile.logo && <img src={profile.logo} alt="" style={{ height: 34, maxWidth: 110, objectFit: "contain" }} />}<b style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{profile.business_name}</b></div>
        <span className="mono mute" style={{ fontSize: 13 }}>{doc.number}</span></div>
      <p className="u" style={{ margin: 0 }}>{kn}{doc.client?.name ? ` · ${tr("pour", "for")} ${doc.client.name}` : ""}</p>
      <div className="big" style={{ margin: "10px 0 8px", fontSize: "clamp(44px,12vw,72px)" }}>{fmt(doc.total, doc.currency, L)}</div>
      <p style={{ margin: "0 0 22px", fontSize: 16 }}>{paid ? <span className="pill paid">{tr("Payée — merci", "Paid — thank you")}</span>
        : doc.kind === "quote" ? (accepted ? <span className="pill accepted">{tr("Devis accepté", "Quote accepted")}</span> : <span className="mute">{tr("Valable jusqu'au", "Valid until")} {doc.due_date ? date(doc.due_date) : "—"}</span>)
        : doc.due_date ? <span style={{ color: late ? "var(--late)" : "var(--ink-2)", fontWeight: late ? 600 : 400 }}>{late ? tr("À régler depuis le", "Was due on") : tr("À régler avant le", "Due by")} {date(doc.due_date)}</span> : null}</p>
      {doc.kind === "quote" && !accepted && <button className="b k full" style={{ marginBottom: 18 }} onClick={accept}>{tr("Accepter le devis", "Accept this quote")}</button>}
      {doc.kind === "quote" && acc && <div className="note ok" style={{ marginBottom: 18 }}>{tr(`Merci. ${profile.business_name || "Le prestataire"} est prévenu.`, `Thanks. ${profile.business_name || "The provider"} has been notified.`)}</div>}
      {doc.kind === "invoice" && !paid && <div className="paybox">
        <div style={{ padding: "14px 16px" }}><b>{tr("Comment payer", "How to pay")}</b><div className="mute" style={{ fontSize: 14 }}>{pay.length ? tr("Choisissez un moyen ci-dessous.", "Pick a method below.") : tr(`Réglez directement auprès de ${profile.business_name || "votre fournisseur"}.`, `Pay ${profile.business_name || "your provider"} directly.`)} {tr("Référence", "Reference")} : <span className="mono">{doc.number}</span></div></div>
        {links.map((m, i) => <div className="payrow" key={"l" + i}><a className="b k full" href={safeUrl(m.url)} target="_blank" rel="noreferrer nofollow">{tr("Payer", "Pay")} {fmt(doc.total, doc.currency, L)} · {m.provider || tr("en ligne", "online")} →</a></div>)}
        {momo.map((m, i) => <Row key={"m" + i} i={"m" + i} tag={opShort(m.op)} main={m.number} sub={[m.op, m.name].filter(Boolean).join(" · ")} />)}
        {bank.map((m, i) => <Row key={"b" + i} i={"b" + i} tag={tr("BANQUE", "BANK")} main={m.iban || m.account} sub={[m.bank, m.name, m.swift && `SWIFT ${m.swift}`].filter(Boolean).join(" · ")} />)}
        <div className="payrow" style={{ display: "block" }}>{sent || doc.declared_paid_at ? <div className="note ok"><b>{tr(`Merci, ${profile.business_name || "le vendeur"} est prévenu.`, `Thanks, ${profile.business_name || "the seller"} has been notified.`)}</b></div> :
          <><label className="f" style={{ marginBottom: 10 }}><span>{tr("Déjà payé ? Référence de la transaction (facultatif)", "Already paid? Transaction reference (optional)")}</span><input value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} /></label>
          <button className="b full" onClick={declare} disabled={decl}>{decl ? "…" : tr("J'ai payé", "I've paid")}</button></>}</div>
      </div>}
      <div className="row" style={{ margin: "18px 0", flexWrap: "wrap" }}>
        <button className="b o" style={{ flex: 1 }} onClick={() => setShow(!show)}>{show ? tr("Masquer le détail", "Hide details") : tr("Voir le document", "View document")}</button>
        <button className="b o" style={{ flex: 1 }} onClick={() => { setShow(true); document.title = `${kn}-${doc.number}`; setTimeout(() => window.print(), 100); }}><IDown width="16" height="16" /> PDF</button>
        {profile.phone && <a className="b wa" style={{ flex: "1 1 100%" }} href={waLink(profile.phone, tr(`Bonjour, je vous écris au sujet de ${kn.toLowerCase()} ${doc.number}.`, `Hello, I'm writing about ${kn.toLowerCase()} ${doc.number}.`))} target="_blank" rel="noreferrer">{tr("Écrire à", "Message")} {profile.business_name || "—"}</a>}
      </div>
    </div>
    <div style={{ display: show ? "block" : "none", padding: "0 12px 30px" }} className="pubdoc"><div style={{ maxWidth: 820, margin: "0 auto" }}><DocPaper doc={doc} profile={profile} /></div></div>
    {profile.plan !== "pro" && <a href={L === "en" ? "/en" : "/"} className="np" style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", fontSize: 13.5, color: "var(--mute)", padding: "20px 0 40px", textDecoration: "none" }}><Mark size={18} /> {tr("Fait avec Bonova — factures gratuites, sans compte", "Made with Bonova — free invoices, no sign-up")}</a>}
    <style>{`@media print{.pubdoc{display:block!important;padding:0!important}}`}</style>
  </div>);
}
