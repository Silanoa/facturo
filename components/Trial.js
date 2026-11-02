"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Editor, { blankDoc } from "./Editor";
import { OPERATORS, totals } from "../lib/money";
import { shareText, waLink } from "../lib/share";
import { IDown } from "./Icons";
export default function Trial({ heading = true }) {
  const [doc, setDoc] = useState(null); const [p, setP] = useState(null); const [open, setOpen] = useState(false);
  useEffect(() => { let d, pr; try { d = JSON.parse(localStorage.getItem("kola_draft") || "null"); pr = JSON.parse(localStorage.getItem("kola_profile") || "null"); } catch {}
    setDoc(d || { ...blankDoc(), number: `FAC-${new Date().getFullYear()}-0001` }); setP(pr || { template: "atelier", accent: "#141210", momo: [{ op: "MTN MoMo", number: "" }] }); }, []);
  useEffect(() => { if (doc) localStorage.setItem("kola_draft", JSON.stringify(doc)); }, [doc]);
  useEffect(() => { if (p) localStorage.setItem("kola_profile", JSON.stringify(p)); }, [p]);
  if (!doc || !p) return <div style={{ minHeight: 600 }} />;
  const ready = doc.items.some(i => +i.price > 0); const set = (k, v) => setP({ ...p, [k]: v });
  return (<div>
    {heading && <div className="ph np"><div><p className="u" style={{ margin: "0 0 8px" }}>Sans inscription · rien n'est envoyé tant que vous ne le décidez pas</p><h1 style={{ fontSize: "clamp(32px,5vw,52px)" }}>Faites votre facture.</h1></div>
      <div className="row" style={{ flexWrap: "wrap" }}><button className="b o" disabled={!ready} onClick={() => { document.title = `Facture-${doc.number}`; window.print(); }}><IDown width="17" height="17" /> PDF</button>
        <a className={`b wa ${ready ? "" : "dis"}`} target="_blank" rel="noreferrer" href={ready ? waLink(doc.client?.phone, shareText({ ...doc, total: totals(doc).total }, p)) : undefined}>WhatsApp</a>
        <Link className="b k" href="/connexion?mode=signup&from=essai">Enregistrer</Link></div></div>}
    <div className="blk np" style={{ marginBottom: 14 }}>
      <button type="button" onClick={() => setOpen(!open)} style={{ all: "unset", cursor: "pointer", display: "flex", justifyContent: "space-between", width: "100%" }}><b>{p.business_name ? `De : ${p.business_name}` : "Vos informations (nom, IFU, Mobile Money)"}</b><span className="mono" style={{ color: "var(--kola)" }}>{open ? "–" : "+"}</span></button>
      {open && <div style={{ marginTop: 14 }}>
        <div className="g2"><label className="f"><span>Nom de l'activité</span><input value={p.business_name || ""} onChange={(e) => set("business_name", e.target.value)} placeholder="Atelier Sèmè Design" /></label>
          <label className="f"><span>Téléphone</span><input type="tel" value={p.phone || ""} onChange={(e) => set("phone", e.target.value)} /></label>
          <label className="f"><span>IFU / NINEA</span><input value={p.ifu || ""} onChange={(e) => set("ifu", e.target.value)} /></label>
          <label className="f"><span>Adresse</span><input value={p.address || ""} onChange={(e) => set("address", e.target.value)} placeholder="Akpakpa, Cotonou" /></label></div>
        <div className="g2"><label className="f" style={{ marginBottom: 0 }}><span>Mobile Money</span><select value={p.momo?.[0]?.op || "MTN MoMo"} onChange={(e) => set("momo", [{ ...(p.momo?.[0] || {}), op: e.target.value }])}>{OPERATORS.map(o => <option key={o}>{o}</option>)}</select></label>
          <label className="f" style={{ marginBottom: 0 }}><span>Numéro</span><input type="tel" value={p.momo?.[0]?.number || ""} onChange={(e) => set("momo", [{ ...(p.momo?.[0] || { op: "MTN MoMo" }), number: e.target.value }])} placeholder="+229 01 …" /></label></div></div>}
    </div>
    <Editor doc={doc} setDoc={setDoc} profile={p} setProfile={setP} compact />
    {ready && <div className="panel np in" style={{ marginTop: 20, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", flexWrap: "wrap", background: "var(--ink)", color: "var(--paper)", border: 0 }}>
      <div><b style={{ fontSize: 18 }}>Envoyez un lien de paiement au lieu d'un PDF.</b><div style={{ color: "#B3ACA2", fontSize: 14.5 }}>Votre client voit la facture, copie votre numéro MoMo, vous prévient quand il a payé. Gratuit.</div></div>
      <Link className="b k" href="/connexion?mode=signup&from=essai">Créer mon compte gratuit</Link></div>}
    <style>{`.b.dis{opacity:.45;pointer-events:none}`}</style>
  </div>);
}
