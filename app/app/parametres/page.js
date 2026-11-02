"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../../lib/session";
import { CURRENCIES, OPERATORS } from "../../../lib/money";
import { TEMPLATES, ACCENTS, FONTS, DEFAULT_BLOCKS } from "../../../lib/templates";
import { SAMPLE } from "../../../lib/sample";
import DocPaper from "../../../components/DocPaper";
import { TplMini } from "../../../components/Editor";
const BLOCKS = [["logo", "Logo"], ["words", "Montant en lettres"], ["pay", "Bloc Mobile Money"], ["notes", "Notes"], ["signature", "Signature et cachet"]];
function shrink(file) { return new Promise((res, rej) => { const img = new Image(); const r = new FileReader(); r.onload = () => { img.onload = () => { const s = Math.min(1, 360 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL(file.type === "image/png" || file.type === "image/svg+xml" ? "image/png" : "image/jpeg", .85)); }; img.onerror = rej; img.src = r.result; }; r.readAsDataURL(file); }); }
function Settings() {
  const s = useSession(); const sp = useSearchParams(); const [tab, setTab] = useState(sp.get("t") || "profil");
  const [p, setP] = useState({ ...s.profile, blocks: { ...DEFAULT_BLOCKS, ...(s.profile.blocks || {}) }, momo: s.profile.momo?.length ? s.profile.momo : [{ op: "MTN MoMo", number: "", name: "" }] });
  const [busy, setBusy] = useState(false); const [pay, setPay] = useState(null);
  const set = (k, v) => setP((x) => ({ ...x, [k]: v })); const setB = (k, v) => setP((x) => ({ ...x, blocks: { ...x.blocks, [k]: v } }));
  const pro = s.profile.plan === "pro";
  async function save() { setBusy(true);
    const { business_name, ifu, rccm, address, phone, email, currency, momo, accent, template, logo, font, blocks, footer } = p;
    const { error } = await supabase.from("profiles").update({ business_name, ifu, rccm, address, phone, email, currency, momo: momo.filter(m => m.number), accent, template, logo, font, blocks, footer }).eq("id", s.user.id);
    setBusy(false); s.toast(error ? error.message : "Enregistré"); if (!error) s.reload(); }
  async function upgrade(plan) { setPay("Redirection vers FedaPay…"); const { data } = await supabase.auth.getSession();
    const r = await fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session.access_token}` }, body: JSON.stringify({ plan }) });
    const j = await r.json(); if (j.url) location.href = j.url; else setPay(j.error || "Paiement indisponible pour le moment."); }
  const preview = { ...p, plan: s.profile.plan };
  return (<div className="in">
    <div className="ph"><h1>Réglages</h1><button className="b k" onClick={save} disabled={busy}>{busy ? "…" : "Enregistrer"}</button></div>
    {sp.get("paid") === "1" && <div className="note ok" style={{ marginBottom: 16 }}><b>Paiement confirmé.</b> Bienvenue dans Kola Pro.</div>}
    {sp.get("paid") === "0" && <div className="note bad" style={{ marginBottom: 16 }}>Le paiement n'a pas abouti. Rien n'a été débité.</div>}
    <div className="seg" style={{ marginBottom: 20 }}>{[["profil", "Entreprise"], ["modele", "Modèle de facture"], ["offre", "Offre"]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
    {tab === "profil" && <div style={{ maxWidth: 720 }}>
      <div className="blk"><h3>Votre activité</h3>
        <div className="g2"><label className="f"><span>Nom commercial</span><input value={p.business_name || ""} onChange={(e) => set("business_name", e.target.value)} placeholder="Atelier Sèmè Design" /></label>
          <label className="f"><span>Téléphone</span><input type="tel" value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="f"><span>IFU / NINEA / NIU</span><input value={p.ifu || ""} onChange={(e) => set("ifu", e.target.value)} /></label>
          <label className="f"><span>RCCM</span><input value={p.rccm || ""} onChange={(e) => set("rccm", e.target.value)} placeholder="RB/COT/24 A 12345" /></label>
          <label className="f"><span>Email</span><input type="email" value={p.email || ""} onChange={(e) => set("email", e.target.value)} /></label>
          <label className="f"><span>Devise par défaut</span><select value={p.currency || "XOF"} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}</select></label></div>
        <label className="f" style={{ marginBottom: 0 }}><span>Adresse</span><input value={p.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="Quartier, ville, pays" /></label></div>
      <div className="blk"><h3>Comment vos clients vous paient</h3>
        {p.momo.map((m, i) => <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.2fr 36px", gap: 8, marginBottom: 8 }} className="momo">
          <select value={m.op} onChange={(e) => set("momo", p.momo.map((x, n) => n === i ? { ...x, op: e.target.value } : x))}>{OPERATORS.map(o => <option key={o}>{o}</option>)}<option>Virement bancaire</option></select>
          <input placeholder="Numéro ou IBAN" value={m.number} onChange={(e) => set("momo", p.momo.map((x, n) => n === i ? { ...x, number: e.target.value } : x))} />
          <input placeholder="Titulaire" value={m.name || ""} onChange={(e) => set("momo", p.momo.map((x, n) => n === i ? { ...x, name: e.target.value } : x))} />
          <button type="button" className="x" aria-label="Retirer" onClick={() => set("momo", p.momo.filter((_, n) => n !== i))}>×</button></div>)}
        <button type="button" className="b s o" onClick={() => set("momo", [...p.momo, { op: "Wave", number: "", name: "" }])}>+ Moyen de paiement</button></div>
      <style>{`@media(max-width:700px){.momo{grid-template-columns:1fr 1fr 36px!important}.momo input:last-of-type{grid-column:1/3}}`}</style></div>}
    {tab === "modele" && <div className="ed">
      <div>
        <div className="blk"><h3>Modèle</h3><div className="tpls">{TEMPLATES.map(x => <button type="button" key={x.id} className={(p.template || "atelier") === x.id ? "on" : ""} onClick={() => set("template", x.id)}><TplMini id={x.id} accent={p.accent} /><b style={{ display: "block" }}>{x.name}</b><span className="mute" style={{ fontSize: 12 }}>{x.hint}</span></button>)}</div></div>
        <div className="blk"><h3>Logo</h3><div className="row" style={{ flexWrap: "wrap" }}>
          {p.logo ? <img src={p.logo} alt="Logo" style={{ maxHeight: 56, maxWidth: 160, background: "#fff", padding: 6, borderRadius: 8, border: "1px solid var(--line)" }} /> : <span className="mute" style={{ fontSize: 14 }}>Aucun logo</span>}
          <label className="b s o" style={{ cursor: "pointer" }}>Choisir une image<input type="file" accept="image/*" hidden onChange={async (e) => { const fl = e.target.files?.[0]; if (fl) { try { set("logo", await shrink(fl)); } catch { s.toast("Image illisible"); } } }} /></label>
          {p.logo && <button className="lnk" onClick={() => set("logo", null)}>Retirer</button>}</div></div>
        <div className="blk"><h3>Couleur</h3><div className="row" style={{ flexWrap: "wrap", gap: 10 }}>{ACCENTS.map(a => <button key={a} className={`swatch ${p.accent === a ? "on" : ""}`} style={{ background: a }} onClick={() => set("accent", a)} aria-label={a} />)}
          <label className="swatch" style={{ display: "grid", placeItems: "center", background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)", position: "relative", overflow: "hidden" }} title="Couleur personnalisée"><input type="color" value={p.accent || "#141210"} onChange={(e) => set("accent", e.target.value)} style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer" }} /></label></div></div>
        <div className="blk"><h3>Typographie</h3><div className="kinds">{Object.entries(FONTS).map(([k, v]) => <button key={k} className={(p.font || "grotesk") === k ? "on" : ""} onClick={() => set("font", k)} style={{ fontFamily: v.display }}>{v.name}</button>)}</div></div>
        <div className="blk"><h3>Blocs affichés</h3>
          {BLOCKS.map(([k, l]) => <label key={k} className="row" style={{ padding: "7px 0", cursor: "pointer" }}><input type="checkbox" checked={!!p.blocks[k]} onChange={(e) => setB(k, e.target.checked)} />{l}</label>)}
          {(p.template || "atelier") === "atelier" && <div className="row" style={{ marginTop: 8 }}><span style={{ fontSize: 14 }}>En-tête</span><div className="seg"><button className={p.blocks.align !== "right" ? "on" : ""} onClick={() => setB("align", "left")}>Logo à gauche</button><button className={p.blocks.align === "right" ? "on" : ""} onClick={() => setB("align", "right")}>à droite</button></div></div>}</div>
        <div className="blk"><h3>Pied de page {!pro && <span className="pill">Pro</span>}</h3><input value={p.footer || ""} disabled={!pro} onChange={(e) => set("footer", e.target.value)} placeholder={pro ? "Ex. : Pénalités de retard : 1 % par mois. Merci de votre confiance." : "Disponible avec Kola Pro"} />
          {!pro && <p className="mute" style={{ fontSize: 13.5, margin: "8px 0 0" }}>En Pro, la mention « Créé avec Kola » disparaît.</p>}</div>
      </div>
      <div className="preview"><DocPaper doc={SAMPLE} profile={preview} /></div></div>}
    {tab === "offre" && <div id="offre" style={{ maxWidth: 760 }}>
      {pro ? <div className="panel"><span className="pill paid">Pro actif</span><h2 style={{ fontSize: 30, margin: "12px 0 6px" }}>Merci de faire confiance à Kola.</h2><p className="mute">Documents illimités{s.profile.pro_until ? ` jusqu'au ${new Date(s.profile.pro_until).toLocaleDateString("fr-FR")}` : ""}.</p></div> :
      <div className="price p2" style={{ marginTop: 0 }}>
        <div><div className="u">Mensuel</div><div className="amt">2 500 <small style={{ fontSize: 16 }}>FCFA</small></div><div className="mute">par mois, sans engagement</div>
          <ul><li>Documents illimités</li><li>Sans mention Kola</li><li>Pied de page personnalisé</li><li>Relances et liens de paiement illimités</li></ul><button className="b full" onClick={() => upgrade("month")}>Payer 2 500 FCFA</button></div>
        <div className="hl"><div className="u" style={{ color: "var(--ochre)" }}>Annuel · 2 mois offerts</div><div className="amt">25 000 <small style={{ fontSize: 16 }}>FCFA</small></div><div className="mute">soit 2 083 FCFA/mois</div>
          <ul><li>Tout le mensuel</li><li>Un seul paiement par an</li><li>Support WhatsApp prioritaire</li><li>&nbsp;</li></ul><button className="b k full" onClick={() => upgrade("year")}>Payer 25 000 FCFA</button></div></div>}
      {pay && <p className="note" style={{ marginTop: 14 }}>{pay}</p>}
      <p className="mute" style={{ fontSize: 14, marginTop: 14 }}>Paiement sécurisé par FedaPay : MTN MoMo, Moov Money, Wave, Orange Money ou carte. Environnement de test : aucun prélèvement réel.</p></div>}
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Settings /></Suspense>; }
