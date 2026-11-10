"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Editor, { blankDoc } from "./Editor";
import { shrink, dominant } from "../lib/img";
import PayFields from "./PayFields";
import { totals, kindName } from "../lib/money";
import { COUNTRIES, country } from "../lib/countries";
import { shareText, waLink, mailLink } from "../lib/share";
import { useT } from "../lib/i18n";
import { docLang } from "./DocPaper";
import { detectCountry, rememberCountry } from "../lib/geo";
const get = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
export default function Trial({ heading = true, country: forced = null }) {
  const { tr, lang } = useT();
  const [logoErr, setLogoErr] = useState(null); const [doc, setDoc] = useState(null); const [p, setP] = useState(null); const [open, setOpen] = useState(false); const [copied, setCopied] = useState(false); const [warn, setWarn] = useState(false); const [resumed, setResumed] = useState(false);
  const restart = () => { localStorage.removeItem("bnv_draft"); localStorage.removeItem("bnv_draft_at"); setResumed(false); setDoc({ ...blankDoc(doc.kind, doc.currency), number: doc.number }); };
  useEffect(() => {
    const at = +localStorage.getItem("bnv_draft_at") || 0; const d0 = get("bnv_draft"); const d = d0 && Date.now() - at < 12 * 3600e3 && ((d0.items || []).some((i) => i.label || +i.price) || d0.client?.name) ? d0 : null; if (!d) { localStorage.removeItem("bnv_draft"); localStorage.removeItem("kola_draft"); } setResumed(!!d); const pr = get("bnv_profile") || get("kola_profile");
    const seed = get("bnv_seed"); if (seed) localStorage.removeItem("bnv_seed");
    const en = lang === "en";
    const fc = forced ? country(forced) : null;
    const base = d || { ...blankDoc("invoice", fc ? fc.cur : en ? "USD" : "XOF"), number: `${en ? "INV" : "FAC"}-${new Date().getFullYear()}-0001` };
    setDoc(seed ? { ...base, ...seed, client: { ...base.client, ...(seed.client || {}) } } : base);
    // Sans compte, la langue du document suit celle de la page (le profil local peut venir de l'autre langue).
    setP(fc ? { ...(pr || { template: "net", accent: "#1F3A5F", momo: [] }), doc_lang: lang, country: fc.code, auto: 1 } : pr ? { ...pr, doc_lang: lang } : { template: "net", accent: "#1F3A5F", country: en ? "US" : "SN", doc_lang: lang, momo: [], auto: 1 });
    if (!fc && (!pr || pr.auto !== 0)) detectCountry().then((cc) => { if (!cc) return; const c = country(cc);
      setP((x) => (x && x.auto !== 0 ? { ...x, country: cc, auto: 1 } : x)); setDoc((x) => (x && (!d || !x.items.some((i) => +i.price > 0)) ? { ...x, currency: c.cur } : x)); });
  }, []);
  useEffect(() => { if (doc) { localStorage.setItem("bnv_draft", JSON.stringify(doc)); localStorage.setItem("bnv_draft_at", String(Date.now())); } }, [doc]);
  useEffect(() => { if (p) { localStorage.setItem("bnv_profile", JSON.stringify(p)); localStorage.setItem("bnv_profile_at", String(Date.now())); } }, [p]);
  if (!doc || !p) return <div style={{ minHeight: 600 }} />;
  const ready = doc.items.some(i => +i.price > 0); const set = (k, v) => setP({ ...p, [k]: v });
  const dl = docLang(doc, p); const full = { ...doc, total: totals(doc).total }; const text = shareText(full, p, dl);
  const subject = `${kindName(doc.kind, dl)} ${doc.number}${p.business_name ? ` — ${p.business_name}` : ""}`;
  const pdf = () => { document.title = `${kindName(doc.kind, dl)}-${doc.number}`; window.print(); };
  const copy = async () => { try { await navigator.clipboard.writeText(text.replace(/\*/g, "")); } catch {} setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const guard = (e) => { if (ready) return true; e?.preventDefault?.(); setWarn(true); const el = document.querySelector(".lbl-in"); el?.scrollIntoView({ block: "center", behavior: "smooth" }); el?.focus?.({ preventScroll: true }); return false; };
  const Actions = ({ cls = "" }) => (<div className={`acts ${cls}`}>
    <a className="b wa" target="_blank" rel="noreferrer" href={waLink(doc.client?.phone, text)} onClick={guard}>WhatsApp</a>
    <button type="button" className="b" onClick={(e) => guard(e) && pdf()}>PDF</button>
    <a className="b o" href={mailLink(doc.client?.email, subject, text)} onClick={guard}>Email</a>
    <button type="button" className="b o" onClick={(e) => guard(e) && copy()}>{copied ? tr("Copié", "Copied") : tr("Copier le texte", "Copy text")}</button>
  </div>);
  return (<div>
    {heading && <div className="ph np"><div><p className="u">{tr("Gratuit · sans compte", "Free · no account")}</p><h1 className="ph-t">{tr("Nouvelle facture", "New invoice")}</h1></div><div className="desk-only"><Actions /></div></div>}
    {resumed && <div className="note np resumed"><span>{tr("Votre brouillon précédent a été repris.", "Your previous draft was restored.")}</span><button type="button" className="lnk" onClick={restart}>{tr("Repartir de zéro", "Start over")}</button></div>}
    <div className="blk np prof">
      <div className="prof-h"><div className="prof-av">{p.logo ? <img src={p.logo} alt="" /> : (p.business_name || "?").trim()[0]?.toUpperCase()}</div>
        <div className="prof-t"><b>{p.business_name || tr("Votre entreprise", "Your business")}</b><span>{p.business_name ? [country(p.country)[lang === "en" ? "en" : "fr"], (p.momo || []).length ? (p.momo.length > 1 ? tr(`${p.momo.length} moyens de paiement`, `${p.momo.length} payment methods`) : tr("1 moyen de paiement", "1 payment method")) : null].filter(Boolean).join(" · ") : tr("Nom, logo, pays et moyens de paiement. Facultatif.", "Name, logo, country and payment details. Optional.")}</span></div>
        <button type="button" className="b s o" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? tr("Fermer", "Close") : p.business_name ? tr("Modifier", "Edit") : tr("Renseigner", "Add details")}</button></div>
      {open && <div style={{ marginTop: 14 }}>
        <div className="g2"><label className="f"><span>{tr("Nom de l'activité", "Business name")}</span><input value={p.business_name || ""} onChange={(e) => set("business_name", e.target.value)} placeholder={tr("Ex. : Studio Martin", "E.g. Martin Studio")} /></label>
          <label className="f"><span>{tr("Pays", "Country")}</span><select value={p.country || "ZZ"} onChange={(e) => { const c = country(e.target.value); setP({ ...p, country: c.code, auto: 0 }); rememberCountry(c.code); setDoc({ ...doc, currency: c.cur, tax_rate: +doc.tax_rate > 0 ? (c.vat || doc.tax_rate) : 0 }); }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === "en" ? c.en : c.fr}</option>)}</select></label>
          <label className="f"><span>{tr("Téléphone / email", "Phone / email")}</span><input value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="f"><span>{country(p.country).tax} <span className="mute">({tr("optionnel", "optional")})</span></span><input value={p.ifu || ""} onChange={(e) => set("ifu", e.target.value)} /></label></div>
        <div className="f"><span>Logo <span className="mute">({tr("facultatif", "optional")})</span></span><div className="row" style={{ gap: 12, alignItems: "center" }}>
          {p.logo && <img src={p.logo} alt="Logo" style={{ maxHeight: 44, maxWidth: 140, background: "#fff", padding: 4, border: "1px solid var(--line)" }} />}
          <label className="b s o" style={{ cursor: "pointer" }}>{p.logo ? tr("Changer", "Change") : tr("Ajouter un logo", "Add a logo")}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,application/pdf,.svg,.pdf" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (fl) { try { const src = await shrink(fl); const col = await dominant(src); setP((x) => ({ ...x, logo: src, ...(col ? { accent: col } : {}) })); setLogoErr(null); } catch { setLogoErr(tr("Image illisible. Formats : PNG, JPG, SVG ou PDF, 12 Mo max.", "Unreadable image. Use PNG, JPG, SVG or PDF, 12 MB max.")); } e.target.value = ""; } }} /></label>{logoErr && <span className="hint bad" role="alert">{logoErr}</span>}
          {p.logo && <button type="button" className="lnk" onClick={() => set("logo", null)}>{tr("Retirer", "Remove")}</button>}</div></div>
        <label className="f"><span>{tr("Adresse", "Address")}</span><input value={p.address || ""} onChange={(e) => set("address", e.target.value)} /></label>
        <div className="f"><span>{tr("Comment vous payer", "How clients pay you")}</span><PayFields value={p.momo} country={p.country} onChange={(v) => set("momo", v)} /></div></div>}
    </div>
    <Editor doc={doc} setDoc={setDoc} profile={p} setProfile={setP} compact />
    <div className="sendbar np">{warn && !ready && <p className="hint bad" role="alert">{tr("Ajoutez au moins une ligne avec un prix pour envoyer.", "Add at least one line with a price to send.")}</p>}<Actions cls="big" /></div>
    {ready && <div className="upsell np">
      <div><b>{tr("Enregistrez ce document", "Save this document")}</b><span>{tr("Avec un compte gratuit : historique, lien en ligne, suivi des paiements et votre modèle.", "With a free account: history, online link, payment tracking and your template.")}</span></div>
      <Link className="b" href="/connexion?mode=signup&from=essai">{tr("Créer un compte", "Create an account")}</Link></div>}
  </div>);
}
