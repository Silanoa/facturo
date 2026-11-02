"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { fmt, KINDS } from "../../../lib/money";
import { OP_COLORS, opShort, waLink } from "../../../lib/share";
import DocPaper from "../../../components/DocPaper";
import { Mark } from "../../../components/Brand";
import { ICopy, IDown } from "../../../components/Icons";
export default function Pub() {
  const { token } = useParams(); const [d, setD] = useState(undefined); const [show, setShow] = useState(false); const [copied, setCopied] = useState(null); const [note, setNote] = useState(""); const [decl, setDecl] = useState(false); const [sent, setSent] = useState(false);
  useEffect(() => { supabase.rpc("get_public_doc", { p_token: token }).then(({ data }) => setD(data || null)); }, [token]);
  if (d === undefined) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">Chargement</span></div>;
  if (!d) return <div className="pub" style={{ paddingTop: 80 }}><h1 style={{ fontSize: 34 }}>Document introuvable.</h1><p className="mute">Le lien est peut-être incomplet. Demandez-le à nouveau à votre fournisseur.</p></div>;
  const { doc, profile } = d; const k = KINDS[doc.kind]; const paid = doc.status === "paid"; const momo = (profile.momo || []).filter(m => m.number);
  const late = !paid && doc.due_date && new Date(doc.due_date) < new Date();
  const copy = async (t, i) => { try { await navigator.clipboard.writeText(t.replace(/\s/g, "")); } catch {} setCopied(i); setTimeout(() => setCopied(null), 1800); };
  async function declare() { setDecl(true); const { data } = await supabase.rpc("declare_paid", { p_token: token, p_note: note }); setDecl(false); if (data !== false) setSent(true); }
  return (<div style={{ minHeight: "100vh" }}>
    <div className="pub np">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 22 }}>
        <div className="row" style={{ gap: 10 }}>{profile.logo ? <img src={profile.logo} alt="" style={{ height: 36, maxWidth: 120, objectFit: "contain" }} /> : <span className="av" style={{ background: "var(--ink)", color: "var(--paper)" }}>{(profile.business_name || "?")[0]}</span>}<b>{profile.business_name}</b></div>
        <span className="mono mute" style={{ fontSize: 13 }}>{doc.number}</span></div>
      <p className="u" style={{ margin: 0 }}>{k.fr}{doc.client?.name ? ` pour ${doc.client.name}` : ""}</p>
      <div className="big" style={{ margin: "10px 0 8px", fontSize: "clamp(44px,12vw,64px)" }}>{fmt(doc.total, doc.currency)}</div>
      <p style={{ margin: "0 0 22px", fontSize: 16 }}>{paid ? <span className="pill paid">Payée — merci</span> : doc.kind === "quote" ? <span className="mute">Devis valable jusqu'au {doc.due_date ? new Date(doc.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : "—"}</span> : doc.due_date ? <span style={{ color: late ? "var(--kola)" : "var(--ink-2)", fontWeight: late ? 600 : 400 }}>À régler {late ? "depuis" : "avant"} le {new Date(doc.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span> : null}</p>
      {doc.kind === "invoice" && !paid && momo.length > 0 && <div className="paybox">
        <div style={{ padding: "14px 16px" }}><b>Payer par Mobile Money</b><div className="mute" style={{ fontSize: 14 }}>Envoyez le montant au numéro ci-dessous. Référence : <span className="mono">{doc.number}</span></div></div>
        {momo.map((m, i) => { const [bg, fg] = OP_COLORS[m.op] || ["#141210", "#fff"]; return (<div className="payrow" key={i}>
          <span className="op" style={{ background: bg, color: fg }}>{opShort(m.op)}</span>
          <div style={{ flex: 1, minWidth: 0 }}><div className="mono" style={{ fontSize: 17, fontWeight: 600 }}>{m.number}</div><div className="mute" style={{ fontSize: 13.5 }}>{m.op}{m.name ? ` · ${m.name}` : ""}</div></div>
          <button className="b s o" onClick={() => copy(m.number, i)}>{copied === i ? "Copié" : <><ICopy width="15" height="15" /> Copier</>}</button></div>); })}
        <div className="payrow" style={{ display: "block" }}>{sent || doc.declared_paid_at ? <div className="note ok"><b>Merci, {profile.business_name || "le vendeur"} est prévenu.</b> Votre reçu vous sera envoyé après vérification.</div> :
          <><label className="f" style={{ marginBottom: 10 }}><span>Déjà payé ? Indiquez la référence de la transaction (facultatif)</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. : ID 8834512, envoyé depuis le 97…" maxLength={280} /></label>
          <button className="b k full" onClick={declare} disabled={decl}>{decl ? "…" : "J'ai payé"}</button></>}</div>
      </div>}
      <div className="row" style={{ margin: "18px 0", flexWrap: "wrap" }}>
        <button className="b o" style={{ flex: 1 }} onClick={() => setShow(!show)}>{show ? "Masquer le détail" : "Voir le document"}</button>
        <button className="b o" style={{ flex: 1 }} onClick={() => { setShow(true); document.title = `${k.fr}-${doc.number}`; setTimeout(() => window.print(), 100); }}><IDown width="16" height="16" /> PDF</button>
        {profile.phone && <a className="b wa" style={{ flex: "1 1 100%" }} href={waLink(profile.phone, `Bonjour, je vous écris au sujet de la ${k.fr.toLowerCase()} ${doc.number}.`)} target="_blank" rel="noreferrer">Écrire à {profile.business_name || "l'émetteur"}</a>}
      </div>
    </div>
    <div style={{ display: show ? "block" : "none", padding: "0 12px 30px" }} className="pubdoc"><DocPaper doc={doc} profile={profile} /></div>
    {profile.plan !== "pro" && <a href="/" className="np" style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", fontSize: 13.5, color: "var(--mute)", padding: "20px 0 40px", textDecoration: "none" }}><Mark size={18} /> Facture créée avec Kola — gratuit pour les indépendants</a>}
    <style>{`@media print{.pubdoc{display:block!important;padding:0!important}}`}</style>
  </div>);
}
