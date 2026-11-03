"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Editor, { blankDoc } from "./Editor";
import PayFields from "./PayFields";
import { totals, kindName } from "../lib/money";
import { COUNTRIES, country } from "../lib/countries";
import { shareText, waLink, mailLink } from "../lib/share";
import { useT } from "../lib/i18n";
import { docLang } from "./DocPaper";
const get = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
export default function Trial({ heading = true }) {
  const { tr, lang } = useT();
  const [doc, setDoc] = useState(null); const [p, setP] = useState(null); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false);
  useEffect(() => {
    const d = get("bnv_draft") || get("kola_draft"); const pr = get("bnv_profile") || get("kola_profile");
    const seed = get("bnv_seed"); if (seed) localStorage.removeItem("bnv_seed");
    const en = lang === "en";
    const base = d || { ...blankDoc("invoice", en ? "USD" : "XOF"), number: `${en ? "INV" : "FAC"}-${new Date().getFullYear()}-0001` };
    setDoc(seed ? { ...base, ...seed, client: { ...base.client, ...(seed.client || {}) } } : base);
    setP(pr || { template: "atelier", accent: "#111110", country: en ? "US" : "BJ", doc_lang: lang, momo: [] });
  }, []);
  useEffect(() => { if (doc) localStorage.setItem("bnv_draft", JSON.stringify(doc)); }, [doc]);
  useEffect(() => { if (p) localStorage.setItem("bnv_profile", JSON.stringify(p)); }, [p]);
  if (!doc || !p) return <div style={{ minHeight: 600 }} />;
  const ready = doc.items.some(i => +i.price > 0); const set = (k, v) => setP({ ...p, [k]: v });
  const dl = docLang(doc, p); const full = { ...doc, total: totals(doc).total }; const text = shareText(full, p, dl);
  const subject = `${kindName(doc.kind, dl)} ${doc.number}${p.business_name ? ` — ${p.business_name}` : ""}`;
  const pdf = () => { document.title = `${kindName(doc.kind, dl)}-${doc.number}`; window.print(); };
  const copy = async () => { try { await navigator.clipboard.writeText(text.replace(/\*/g, "")); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const Actions = ({ cls = "" }) => (<div className={`acts ${cls}`}>
    <button className="b" disabled={!ready} onClick={pdf}>{tr("PDF ↓", "PDF ↓")}</button>
    <a className={`b wa ${ready ? "" : "dis"}`} target="_blank" rel="noreferrer" href={ready ? waLink(doc.client?.phone, text) : undefined}>WhatsApp</a>
    <a className={`b o ${ready ? "" : "dis"}`} href={ready ? mailLink(doc.client?.email, subject, text) : undefined}>Email</a>
    <button className="b o" disabled={!ready} onClick={copy}>{copied ? tr("Copié", "Copied") : tr("Copier", "Copy")}</button>
  </div>);
  return (<div>
    {heading && <div className="ph np"><div><p className="u">{tr("Sans compte · gratuit · rien n'est envoyé sans vous", "No account · free · nothing is sent without you")}</p><h1 className="ph-t">{tr("Faites votre facture.", "Make your invoice.")}</h1></div><Actions /></div>}
    <div className="blk np prof">
      <button type="button" className="more" onClick={() => setOpen(!open)} aria-expanded={open}><span>{p.business_name ? `${tr("De", "From")} : ${p.business_name}` : tr("Vos coordonnées et moyens de paiement", "Your details & how you get paid")}</span><span className="mono">{open ? "−" : "+"}</span></button>
      {open && <div style={{ marginTop: 14 }}>
        <div className="g2"><label className="f"><span>{tr("Nom de l'activité", "Business name")}</span><input value={p.business_name || ""} onChange={(e) => set("business_name", e.target.value)} placeholder="Studio Awa" /></label>
          <label className="f"><span>{tr("Pays", "Country")}</span><select value={p.country || "BJ"} onChange={(e) => { const c = country(e.target.value); setP({ ...p, country: c.code }); setDoc({ ...doc, currency: c.cur, tax_rate: doc.tax_rate }); }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === "en" ? c.en : c.fr}</option>)}</select></label>
          <label className="f"><span>{tr("Téléphone / email", "Phone / email")}</span><input value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="f"><span>{country(p.country).tax} <span className="mute">({tr("optionnel", "optional")})</span></span><input value={p.ifu || ""} onChange={(e) => set("ifu", e.target.value)} /></label></div>
        <label className="f"><span>{tr("Adresse", "Address")}</span><input value={p.address || ""} onChange={(e) => set("address", e.target.value)} /></label>
        <div className="f"><span>{tr("Comment vous payer", "How clients pay you")}</span><PayFields value={p.momo} onChange={(v) => set("momo", v)} /></div></div>}
    </div>
    <Editor doc={doc} setDoc={setDoc} profile={p} setProfile={setP} compact />
    <div className="sendbar np"><Actions cls="big" /></div>
    {ready && <div className="upsell np">
      <div><b>{tr("Envoyez un lien au lieu d'un PDF.", "Send a link instead of a PDF.")}</b><span>{tr("Votre client paie depuis le lien, vous savez quand il l'a ouvert. Compte gratuit, 20 secondes.", "Your client pays from the link, you see when they opened it. Free account, 20 seconds.")}</span></div>
      <Link className="b" href="/connexion?mode=signup&from=essai">{tr("Enregistrer gratuitement →", "Save it free →")}</Link></div>}
  </div>);
}
