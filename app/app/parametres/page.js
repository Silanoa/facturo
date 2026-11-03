"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../../lib/session";
import { useT } from "../../../lib/i18n";
import { CURRENCIES, curLabel } from "../../../lib/money";
import { COUNTRIES, country } from "../../../lib/countries";
import { TEMPLATES, ACCENTS, FONTS, DEFAULT_BLOCKS } from "../../../lib/templates";
import DocPaper from "../../../components/DocPaper";
import PayFields from "../../../components/PayFields";
import { TplMini } from "../../../components/Editor";
import { shrink, dominant, letterhead } from "../../../lib/img";
const SAMPLE = { kind: "invoice", number: "FAC-2026-0042", status: "sent", currency: "XOF", tax_rate: 18, discount: 0, issue_date: "2026-11-02", due_date: "2026-11-17", client: { name: "Atlas Conseil SARL", address: "Plateau, Dakar" }, items: [{ label: "Refonte du site web", qty: 1, price: 450000 }, { label: "Maintenance mensuelle", qty: 3, price: 35000 }] };
const LS = { month: process.env.NEXT_PUBLIC_LEMON_MONTH, year: process.env.NEXT_PUBLIC_LEMON_YEAR };
function Settings() {
  const s = useSession(); const sp = useSearchParams(); const { tr, lang, setLang } = useT(); const [tab, setTab] = useState(sp.get("t") || "profil");
  const [p, setP] = useState({ ...s.profile, blocks: { ...DEFAULT_BLOCKS, ...(s.profile.blocks || {}) }, momo: s.profile.momo || [] });
  const [busy, setBusy] = useState(false); const [pay, setPay] = useState(null);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v })); const setB = (k, v) => setP((x) => ({ ...x, blocks: { ...x.blocks, [k]: v } }));
  const pro = s.profile.plan === "pro"; const ct = country(p.country || "BJ");
  async function save() { setBusy(true);
    const { business_name, ifu, rccm, address, phone, email, currency, momo, accent, template, logo, font, blocks, footer, country: cc, doc_lang, letterhead: lhd } = p;
    const { error } = await supabase.from("profiles").update({ business_name, ifu, rccm, address, phone, email, currency, momo: (momo || []).filter(m => m.number || m.iban || m.url), accent, template, logo, font, blocks, footer, country: cc, doc_lang, lang, letterhead: lhd || null }).eq("id", s.user.id);
    setBusy(false); s.toast(error ? error.message : tr("Enregistré", "Saved")); if (!error) s.reload(); }
  async function feda(plan) { setPay(tr("Redirection vers FedaPay…", "Redirecting to FedaPay…")); const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ plan }) });
    const j = await r.json(); if (j.url) location.href = j.url; else setPay(j.error || tr("Paiement indisponible pour le moment.", "Payment unavailable right now.")); }
  const card = (plan) => { if (!LS[plan]) return setPay(tr("Le paiement par carte / PayPal arrive très bientôt. Utilisez Mobile Money en attendant.", "Card / PayPal checkout is coming very soon. Use Mobile Money meanwhile.")); location.href = `${LS[plan]}?checkout[email]=${encodeURIComponent(s.user.email)}&checkout[custom][user_id]=${s.user.id}`; };
  const preview = { ...p, plan: s.profile.plan };
  return (<div className="in">
    <div className="ph"><div><p className="u">{tr("Réglages", "Settings")}</p><h1>{tr("Mon activité", "My business")}</h1></div><button className="b k" onClick={save} disabled={busy}>{busy ? "…" : tr("Enregistrer", "Save")}</button></div>
    {sp.get("paid") === "1" && <div className="note ok" style={{ marginBottom: 16 }}><b>{tr("Paiement confirmé.", "Payment confirmed.")}</b> {tr("Bienvenue dans Bonova Pro.", "Welcome to Bonova Pro.")}</div>}
    {sp.get("paid") === "0" && <div className="note bad" style={{ marginBottom: 16 }}>{tr("Le paiement n'a pas abouti. Rien n'a été débité.", "Payment did not go through. Nothing was charged.")}</div>}
    <div className="seg" style={{ marginBottom: 20, maxWidth: "100%", overflowX: "auto" }}>{[["profil", tr("Activité", "Business")], ["modele", tr("Modèle", "Template")], ["offre", "Pro"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === "profil" && <div style={{ maxWidth: 760 }}>
      <div className="blk"><h3>{tr("Votre activité", "Your business")}</h3>
        <div className="g2"><label className="f"><span>{tr("Nom commercial", "Business name")}</span><input value={p.business_name || ""} onChange={(e) => set("business_name", e.target.value)} placeholder={tr("Ex. : Studio Martin", "E.g. Martin Studio")} /></label>
          <label className="f"><span>{tr("Pays", "Country")}</span><select value={p.country || "BJ"} onChange={(e) => { const c = country(e.target.value); setP((x) => ({ ...x, country: c.code, currency: c.cur })); }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{lang === "en" ? c.en : c.fr}</option>)}</select></label>
          <label className="f"><span>{ct.tax || tr("N° fiscal", "Tax ID")}</span><input value={p.ifu || ""} onChange={(e) => set("ifu", e.target.value)} /></label>
          <label className="f"><span>{ct.reg || tr("N° d'immatriculation", "Registration no.")}</span><input value={p.rccm || ""} onChange={(e) => set("rccm", e.target.value)} /></label>
          <label className="f"><span>{tr("Téléphone", "Phone")}</span><input type="tel" value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="f"><span>Email</span><input type="email" value={p.email || ""} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="f"><span>{tr("Devise par défaut", "Default currency")}</span><select value={p.currency || "XOF"} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{curLabel(c.code, lang)}</option>)}</select></label>
          <label className="f"><span>{tr("Langue des documents", "Document language")}</span><select value={p.doc_lang || "fr"} onChange={(e) => set("doc_lang", e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>
          <label className="f"><span>{tr("Langue de l'application", "App language")}</span><select value={lang} onChange={(e) => setLang(e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label></div>
        <label className="f" style={{ marginBottom: 0 }}><span>{tr("Adresse", "Address")}</span><input value={p.address || ""} onChange={(e) => set("address", e.target.value)} /></label></div>
      <div className="blk"><h3>{tr("Comment vos clients vous paient", "How clients pay you")}</h3><PayFields value={p.momo} onChange={(v) => set("momo", v)} />
        <p className="mute" style={{ fontSize: 13.5, margin: "12px 0 0" }}>{tr("L'argent va directement chez vous. Bonova ne prend aucune commission.", "Money goes straight to you. Bonova takes no cut.")}</p></div></div>}
    {tab === "modele" && <div className="ed">
      <div>
        <div className="blk"><h3>{tr("Modèle", "Template")}</h3>{p.letterhead && <p className="hint" style={{ marginTop: 0 }}>{tr("Avec un papier à en-tête, la facture utilise la mise en page Épurée par-dessus votre modèle.", "With a letterhead, the invoice uses the Clean layout on top of it.")}</p>}<div className="tpls">{TEMPLATES.map(x => <button type="button" key={x.id} className={(p.template || "net") === x.id ? "on" : ""} onClick={() => set("template", x.id)}><TplMini id={x.id} accent={p.accent} /><b style={{ display: "block" }}>{lang === "en" ? x.en : x.name}</b></button>)}</div></div>
        <div className="blk"><h3>Logo</h3><div className="row" style={{ flexWrap: "wrap" }}>
          {p.logo ? <img src={p.logo} alt="Logo" style={{ maxHeight: 56, maxWidth: 160, background: "#fff", padding: 6, border: "1px solid var(--line)" }} /> : <span className="mute" style={{ fontSize: 14 }}>{tr("Aucun logo", "No logo")}</span>}
          <label className="b s o" style={{ cursor: "pointer" }}>{tr("Choisir une image", "Choose an image")}<input type="file" accept="image/*" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (fl) { try { const src = await shrink(fl); const col = await dominant(src); setP((x) => ({ ...x, logo: src, ...(col ? { accent: col } : {}) })); if (col) s.toast(tr("Couleur reprise du logo", "Colour taken from your logo")); } catch { s.toast(tr("Image illisible", "Unreadable image")); } } }} /></label>
          {p.logo && <button className="lnk" onClick={() => set("logo", null)}>{tr("Retirer", "Remove")}</button>}</div></div>
        <div className="blk"><h3>{tr("Votre papier à en-tête", "Your own letterhead")}</h3>
          <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>{tr("Importez votre modèle existant (PDF ou image A4). Bonova écrit la facture par-dessus, dans la zone libre.", "Import your existing letterhead (PDF or A4 image). Bonova writes the invoice on top, in the free area.")}</p>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <label className="b s o" style={{ cursor: "pointer" }}>{p.letterhead ? tr("Remplacer", "Replace") : tr("Importer PDF ou image", "Import PDF or image")}<input type="file" accept="application/pdf,image/*" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (!fl) return; s.toast(tr("Import…", "Importing…")); try { const img = await letterhead(fl); setP((x) => ({ ...x, letterhead: img })); s.toast(tr("Papier à en-tête importé", "Letterhead imported")); } catch { s.toast(tr("Fichier illisible", "Unreadable file")); } e.target.value = ""; }} /></label>
            {p.letterhead && <button className="lnk" onClick={() => set("letterhead", null)}>{tr("Retirer", "Remove")}</button>}</div>
          {p.letterhead && <div className="g2" style={{ marginTop: 14 }}>
            <label className="f"><span>{tr("Marge haute (en-tête)", "Top margin (header)")} · {p.blocks.lh_top}%</span><input type="range" min="5" max="60" value={p.blocks.lh_top} onChange={(e) => setB("lh_top", +e.target.value)} /></label>
            <label className="f"><span>{tr("Marge basse (pied)", "Bottom margin (footer)")} · {p.blocks.lh_bottom}%</span><input type="range" min="3" max="40" value={p.blocks.lh_bottom} onChange={(e) => setB("lh_bottom", +e.target.value)} /></label></div>}
        </div>
        <div className="blk"><h3>{tr("Couleur", "Colour")}</h3><div className="row" style={{ gap: 10, flexWrap: "wrap" }}>{ACCENTS.map(a => <button key={a} className={`swatch ${p.accent === a ? "on" : ""}`} style={{ background: a }} onClick={() => set("accent", a)} aria-label={a} />)}
          <label className="swatch" style={{ display: "grid", placeItems: "center", background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)", position: "relative", overflow: "hidden" }}><input type="color" value={p.accent || "#111110"} onChange={(e) => set("accent", e.target.value)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} /></label></div></div>
        <div className="blk"><h3>{tr("Typographie", "Typeface")}</h3><div className="kinds">{Object.entries(FONTS).map(([k, v]) => <button key={k} className={(p.font || "grotesk") === k ? "on" : ""} onClick={() => set("font", k)} style={{ fontFamily: v.display }}>{v.name}</button>)}</div></div>
        <div className="blk"><h3>{tr("Blocs affichés", "Blocks")}</h3>
          {[["logo", "Logo", "Logo"], ["words", "Montant en lettres", "Amount in words"], ["pay", "Moyens de paiement", "Payment details"], ["notes", "Notes", "Notes"], ["signature", "Signature et cachet", "Signature"]].map(([k, f, e]) => <label key={k} className="row" style={{ padding: "7px 0", cursor: "pointer" }}><input type="checkbox" style={{ width: 18, minHeight: 18 }} checked={!!p.blocks[k]} onChange={(ev) => setB(k, ev.target.checked)} />{tr(f, e)}</label>)}</div>
        <div className="blk"><h3>{tr("Pied de page", "Footer")} {!pro && <span className="pill">Pro</span>}</h3>{pro ? <input value={p.footer || ""} onChange={(e) => set("footer", e.target.value)} placeholder={tr("Ex. : Merci de votre confiance.", "E.g. Thank you for your business.")} /> : <p className="hint" style={{ marginTop: 0 }}>{tr("Remplace la mention « Fait avec Bonova » par votre propre texte.", "Replaces the “Made with Bonova” line with your own text.")} <button type="button" className="lnk" onClick={() => setTab("offre")}>{tr("Voir Pro →", "See Pro →")}</button></p>}</div>
      </div>
      <div className="preview"><div className="sheet-stack"><DocPaper doc={{ ...SAMPLE, currency: p.currency || "XOF", tax_rate: ct.vat }} profile={preview} /></div></div></div>}
    {tab === "offre" && <div id="offre" style={{ maxWidth: 820 }}>
      {pro ? <div className="panel"><span className="pill paid">Pro</span><h2 style={{ fontSize: 44, margin: "12px 0 6px" }}>{tr("Merci.", "Thank you.")}</h2><p className="mute">{s.profile.pro_until ? `${tr("Actif jusqu'au", "Active until")} ${new Date(s.profile.pro_until).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}.` : ""}</p></div> :
      <div className="price p2" style={{ marginTop: 0 }}>
        <div><div className="u">{tr("Mensuel", "Monthly")}</div><div className="amt">{tr("2 500 F", "$4")}</div><div className="mute">{tr("FCFA / mois · ≈ 3,80 € · 4 $", "per month · or 2,500 FCFA")}</div>
          <ul><li>{tr("Sans mention Bonova", "No Bonova branding")}</li><li>{tr("Pied de page personnalisé", "Custom footer")}</li><li>{tr("Relances automatiques", "Automatic reminders")}</li><li>{tr("Résiliable en un clic", "Cancel in one click")}</li></ul>
          <div style={{ display: "grid", gap: 8 }}><button className="b full" onClick={() => feda("month")}>Mobile Money — 2 500 FCFA</button><button className="b o full" onClick={() => card("month")}>{tr("Carte ou PayPal — 4 $", "Card or PayPal — $4")}</button></div></div>
        <div className="hl"><div className="u" style={{ color: "#9DA7FF" }}>{tr("Annuel · 2 mois offerts", "Yearly · 2 months free")}</div><div className="amt">{tr("25 000 F", "$36")}</div><div className="mute">{tr("FCFA / an · ou 36 $", "per year · or 25,000 FCFA")}</div>
          <ul><li>{tr("Tout le mensuel", "Everything monthly")}</li><li>{tr("Un seul paiement par an", "One payment a year")}</li><li>{tr("Support WhatsApp prioritaire", "Priority WhatsApp support")}</li></ul>
          <div style={{ display: "grid", gap: 8 }}><button className="b k full" onClick={() => feda("year")}>Mobile Money — 25 000 FCFA</button><button className="b inv full" onClick={() => card("year")}>{tr("Carte ou PayPal — 36 $", "Card or PayPal — $36")}</button></div></div></div>}
      {pay && <p className="note" style={{ marginTop: 14 }}>{pay}</p>}
      <p className="mute" style={{ fontSize: 14, marginTop: 14 }}>{tr("Mobile Money et cartes en FCFA via FedaPay (MTN, Moov, Wave, Orange…). Carte et PayPal dans le monde entier via Lemon Squeezy. Mode test : aucun prélèvement réel.", "Mobile Money & cards in FCFA via FedaPay (MTN, Moov, Wave, Orange…). Card and PayPal worldwide via Lemon Squeezy. Test mode: no real charge.")}</p></div>}
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Settings /></Suspense>; }
