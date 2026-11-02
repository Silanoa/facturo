"use client";
import { useEffect, useRef, useState } from "react";
import { CURRENCIES, KINDS, totals, fmt } from "../lib/money";
import { TEMPLATES } from "../lib/templates";
import DocPaper from "./DocPaper";
import { ISpark } from "./Icons";
export const today = () => new Date().toISOString().slice(0, 10);
export const plus = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
export const blankDoc = (kind = "invoice", currency = "XOF") => ({ kind, status: kind === "receipt" ? "paid" : "draft", client: {}, items: [{ label: "", qty: 1, price: "" }], currency, tax_rate: 0, discount: 0, issue_date: today(), due_date: kind === "receipt" ? null : plus(kind === "quote" ? 30 : 15), notes: "" });
const VAT = [["0", "Pas de TVA"], ["18", "18 % — UEMOA"], ["19", "19 % — Niger"], ["19.25", "19,25 % — Cameroun"], ["7.5", "7,5 % — Nigeria"], ["15", "15 % — Ghana"], ["20", "20 % — France, Maroc"]];
function Mic({ onText }) {
  const [on, setOn] = useState(false); const rec = useRef(null);
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return null;
  return <button type="button" className="b s o" style={{ color: "#fff", borderColor: on ? "var(--ochre)" : "#ffffff55", background: on ? "#E0A52633" : "transparent" }} onClick={() => {
    if (on) { rec.current?.stop(); return; }
    const r = new SR(); r.lang = "fr-FR"; r.interimResults = false; r.continuous = false; rec.current = r;
    r.onresult = (e) => onText(Array.from(e.results).map(x => x[0].transcript).join(" ")); r.onend = () => setOn(false); r.onerror = () => setOn(false); r.start(); setOn(true);
  }}>{on ? "● J'écoute…" : "Dicter"}</button>;
}
export default function Editor({ doc, setDoc, profile, setProfile, clients = [], onNumber, compact }) {
  const [view, setView] = useState("edit"); const [ai, setAi] = useState(""); const [aiBusy, setAiBusy] = useState(false); const [aiMsg, setAiMsg] = useState(null);
  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v }));
  const setItem = (i, k, v) => setDoc((d) => ({ ...d, items: d.items.map((it, n) => n === i ? { ...it, [k]: v } : it) }));
  const setClient = (k, v) => setDoc((d) => ({ ...d, client: { ...d.client, [k]: v } }));
  const t = totals(doc);
  async function draft() {
    if (!ai.trim()) return; setAiBusy(true); setAiMsg(null);
    const r = await fetch("/api/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: ai }) }); const j = await r.json(); setAiBusy(false);
    if (!j.items?.length) return setAiMsg("Je n'ai pas trouvé de montant. Essayez : « 2 sacs de riz à 45 000 pour Mme Ebuka ».");
    setDoc((d) => { const kind = j.kind || d.kind; return { ...d, kind, client: { ...d.client, ...j.client }, items: j.items.map(i => ({ label: i.label, qty: i.qty, price: i.price })), currency: j.currency || d.currency, tax_rate: j.tax_rate ?? d.tax_rate, due_date: j.due_days ? plus(j.due_days) : d.due_date, status: kind === "receipt" ? "paid" : d.status }; });
    if (j.kind && onNumber) onNumber(j.kind);
    setAiMsg(`${j.items.length} ligne${j.items.length > 1 ? "s" : ""} ajoutée${j.items.length > 1 ? "s" : ""}. Vérifiez puis ajustez si besoin.`);
  }
  const form = (<div>
    <div className="ai np">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}><span className="u row" style={{ gap: 6 }}><ISpark width="16" height="16" /> Décrivez la vente</span><Mic onText={(x) => setAi((a) => (a ? a + " " : "") + x)} /></div>
      <textarea rows={2} value={ai} onChange={(e) => setAi(e.target.value)} placeholder="Ex. : facture pour Awa Diop, robe brodée 35 000 et 2 pagnes à 7 500, payable sous 7 jours" />
      <div className="row" style={{ justifyContent: "space-between", marginTop: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13.5, color: "#C9CFE3" }}>{aiMsg || "Ou collez le message WhatsApp du client."}</span>
        <button type="button" className="b s" style={{ background: "#fff", color: "var(--indigo)", borderColor: "#fff" }} onClick={draft} disabled={aiBusy}>{aiBusy ? "Analyse…" : "Remplir la facture"}</button></div>
    </div>
    <div className="blk">
      <h3>Document</h3>
      <div className="kinds" style={{ marginBottom: 14 }}>{Object.entries(KINDS).map(([k, v]) => <button type="button" key={k} className={doc.kind === k ? "on" : ""} onClick={() => { set("kind", k); if (k === "receipt") set("status", "paid"); onNumber && onNumber(k); }}>{v.fr}</button>)}</div>
      <div className="g2">
        <label className="f"><span>Numéro</span><input className="mono" value={doc.number || ""} onChange={(e) => set("number", e.target.value)} /></label>
        <label className="f"><span>Devise</span><select value={doc.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}</select></label>
        <label className="f"><span>Date</span><input type="date" value={doc.issue_date || ""} onChange={(e) => set("issue_date", e.target.value)} /></label>
        {doc.kind !== "receipt" && <label className="f"><span>{doc.kind === "quote" ? "Valable jusqu'au" : "À payer avant le"}</span><input type="date" value={doc.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></label>}
      </div>
    </div>
    <div className="blk">
      <h3>Client {clients.length > 0 && <select style={{ width: "auto", minHeight: 34, padding: "4px 10px", fontSize: 14, textTransform: "none", letterSpacing: 0 }} value="" onChange={(e) => { const c = clients.find(x => x.id === e.target.value); if (c) set("client", { name: c.name, email: c.email, phone: c.phone, address: c.address, tax_id: c.tax_id }); }}><option value="">Mes clients…</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</h3>
      <label className="f"><span>Nom ou entreprise</span><input value={doc.client.name || ""} onChange={(e) => setClient("name", e.target.value)} placeholder="Awa Diop" autoComplete="off" /></label>
      <div className="g2">
        <label className="f"><span>WhatsApp</span><input type="tel" inputMode="tel" value={doc.client.phone || ""} onChange={(e) => setClient("phone", e.target.value)} placeholder="+229 01 …" /></label>
        <label className="f"><span>IFU / NINEA <span className="mute">(optionnel)</span></span><input value={doc.client.tax_id || ""} onChange={(e) => setClient("tax_id", e.target.value)} /></label>
      </div>
      {!compact && <div className="g2"><label className="f"><span>Email</span><input type="email" value={doc.client.email || ""} onChange={(e) => setClient("email", e.target.value)} /></label><label className="f"><span>Adresse</span><input value={doc.client.address || ""} onChange={(e) => setClient("address", e.target.value)} /></label></div>}
    </div>
    <div className="blk">
      <h3>Lignes <span className="mono" style={{ textTransform: "none", letterSpacing: 0, color: "var(--ink)" }}>{fmt(t.sub, doc.currency)}</span></h3>
      {doc.items.map((it, i) => (<div className="line" key={i}>
        <input className="lbl-in" placeholder="Désignation" value={it.label} onChange={(e) => setItem(i, "label", e.target.value)} aria-label="Désignation" />
        <input type="number" inputMode="decimal" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} aria-label="Quantité" />
        <input type="number" inputMode="decimal" min="0" step="any" placeholder="Prix" value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} aria-label="Prix unitaire" className="mono" />
        <button type="button" className="x" aria-label="Supprimer la ligne" onClick={() => set("items", doc.items.length > 1 ? doc.items.filter((_, n) => n !== i) : [{ label: "", qty: 1, price: "" }])}>×</button></div>))}
      <button type="button" className="b s o" onClick={() => set("items", [...doc.items, { label: "", qty: 1, price: "" }])}>+ Ligne</button>
      <div className="g2" style={{ marginTop: 16 }}>
        <label className="f"><span>TVA</span><select value={String(doc.tax_rate)} onChange={(e) => set("tax_rate", e.target.value)}>{VAT.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></label>
        <label className="f"><span>Remise ({doc.currency})</span><input type="number" inputMode="decimal" min="0" value={doc.discount || ""} onChange={(e) => set("discount", e.target.value)} placeholder="0" /></label>
      </div>
      <label className="f" style={{ marginBottom: 0 }}><span>Note pour le client</span><textarea rows={2} value={doc.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder="Acompte de 50 % à la commande. Merci pour votre confiance." /></label>
    </div>
    {setProfile && <div className="blk"><h3>Modèle</h3><div className="tpls">{TEMPLATES.map(x => <button type="button" key={x.id} className={(profile.template || "atelier") === x.id ? "on" : ""} onClick={() => setProfile({ ...profile, template: x.id })}><TplMini id={x.id} accent={profile.accent} />{x.name}</button>)}</div></div>}
  </div>);
  return (<>
    <div className="np" style={{ marginBottom: 14 }}><div className="seg mob-only"><button type="button" className={view === "edit" ? "on" : ""} onClick={() => setView("edit")}>Saisie</button><button type="button" className={view === "prev" ? "on" : ""} onClick={() => setView("prev")}>Aperçu</button></div></div>
    <div className="ed" data-view={view}>
      <div className="ed-form">{form}</div>
      <div className="preview ed-prev"><DocPaper doc={doc} profile={profile} /></div>
    </div>
    <div className="totbar np"><span><span style={{ fontSize: 12, opacity: .7, display: "block" }}>Total</span><b className="mono" style={{ fontSize: 18 }}>{fmt(t.total, doc.currency)}</b></span>
      <button type="button" className="b s" style={{ background: "var(--paper)", color: "var(--ink)" }} onClick={() => setView(view === "edit" ? "prev" : "edit")}>{view === "edit" ? "Voir l'aperçu" : "Modifier"}</button></div>
  </>);
}
export function TplMini({ id, accent = "#141210" }) {
  const a = accent;
  if (id === "marche") return <div className="mini"><div style={{ background: a, height: 22 }} /><div style={{ margin: 6, height: 4, background: "#ddd", width: "60%" }} /><div style={{ margin: 6, height: 4, background: "#eee" }} /></div>;
  if (id === "registre") return <div className="mini" style={{ padding: 5 }}><div style={{ border: "1.5px solid #222", height: "100%", backgroundImage: "linear-gradient(#222 1px,transparent 1px)", backgroundSize: "100% 10px" }} /></div>;
  if (id === "sahel") return <div className="mini"><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 5, background: `repeating-linear-gradient(180deg,${a} 0 8px,#E0A526 8px 11px)` }} /><div style={{ margin: "8px 10px", fontSize: 15, fontWeight: 300, color: a }}>facture.</div></div>;
  return <div className="mini"><div style={{ margin: "8px 8px 4px", height: 6, width: 36, background: a, marginLeft: "auto" }} /><div style={{ margin: 8, height: 3, background: "#ddd" }} /><div style={{ margin: 8, height: 3, background: "#eee" }} /></div>;
}
