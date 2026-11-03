"use client";
import { useRef, useState } from "react";
import { CURRENCIES, KINDS, totals, fmt, curLabel, kindName } from "../lib/money";
import { TEMPLATES } from "../lib/templates";
import { country } from "../lib/countries";
import { useT } from "../lib/i18n";
import DocPaper, { docLang } from "./DocPaper";
export const today = () => new Date().toISOString().slice(0, 10);
export const plus = (n) => { const x = new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
export const blankDoc = (kind = "invoice", currency = "XOF") => ({ kind, status: kind === "receipt" ? "paid" : "draft", client: {}, items: [{ label: "", qty: 1, price: "" }], currency, tax_rate: 0, discount: 0, issue_date: today(), due_date: kind === "receipt" ? null : plus(kind === "quote" ? 30 : 15), notes: "" });
const COMMON = [0, 5, 7.5, 8.1, 10, 13, 14, 15, 16, 18, 19, 19.25, 20, 21, 22, 23];
function Mic({ onText, lang }) {
  const [on, setOn] = useState(false); const rec = useRef(null);
  const SR = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
  if (!SR) return null;
  return <button type="button" className={`mic ${on ? "on" : ""}`} onClick={() => {
    if (on) { rec.current?.stop(); return; }
    const r = new SR(); r.lang = lang === "en" ? "en-US" : "fr-FR"; r.interimResults = false; rec.current = r;
    r.onresult = (e) => onText(Array.from(e.results).map(x => x[0].transcript).join(" ")); r.onend = () => setOn(false); r.onerror = () => setOn(false); r.start(); setOn(true);
  }}>{on ? (lang === "en" ? "● Listening" : "● J'écoute") : (lang === "en" ? "Dictate" : "Dicter")}</button>;
}
export default function Editor({ doc, setDoc, profile, setProfile, clients = [], onNumber, compact }) {
  const { tr, lang } = useT();
  const [view, setView] = useState("edit"); const [ai, setAi] = useState(""); const [aiBusy, setAiBusy] = useState(false); const [aiMsg, setAiMsg] = useState(null); const [more, setMore] = useState(false);
  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v }));
  const setItem = (i, k, v) => setDoc((d) => ({ ...d, items: d.items.map((it, n) => n === i ? { ...it, [k]: v } : it) }));
  const setClient = (k, v) => setDoc((d) => ({ ...d, client: { ...d.client, [k]: v } }));
  const t = totals(doc); const dl = docLang(doc, profile); const ct = country(profile.country || "BJ");
  const rates = [...new Set([ct.vat, ...COMMON, +doc.tax_rate || 0])].sort((a, b) => a - b);
  async function draft() {
    if (!ai.trim()) return; setAiBusy(true); setAiMsg(null);
    let j = {}; try { const r = await fetch("/api/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: ai }) }); j = await r.json(); } catch {}
    setAiBusy(false);
    if (!j.items?.length) return setAiMsg(tr("Aucun montant trouvé. Essayez : « logo 150 000 et 2 affiches à 25 000 pour Awa Diop ».", "No amount found. Try: “logo design 500 and 2 posters at 80 for Acme Ltd”."));
    setDoc((d) => { const kind = j.kind || d.kind; return { ...d, kind, client: { ...d.client, ...j.client }, items: j.items.map(i => ({ label: i.label, qty: i.qty, price: i.price })), currency: j.currency || d.currency, tax_rate: j.tax_rate ?? d.tax_rate, due_date: j.due_days ? plus(j.due_days) : d.due_date, status: kind === "receipt" ? "paid" : d.status }; });
    if (j.kind && onNumber) onNumber(j.kind);
    setAiMsg(tr(`${j.items.length} ligne(s) ajoutée(s). Vérifiez, puis envoyez.`, `${j.items.length} line(s) added. Check, then send.`));
  }
  const form = (<div>
    <div className="quick np">
      <div className="quick-h"><label htmlFor="q">{tr("Écrivez ce que vous avez fait", "Write what you did")}</label><Mic lang={lang} onText={(x) => setAi((a) => (a ? a + " " : "") + x)} /></div>
      <textarea id="q" rows={2} value={ai} onChange={(e) => setAi(e.target.value)} placeholder={tr("Facture pour Awa Diop : site vitrine 350 000 et 2 mois de maintenance à 25 000, sous 7 jours", "Invoice Acme Ltd: website 1,200 and 2 months maintenance at 90, due in 14 days")} />
      <div className="quick-f"><span>{aiMsg || tr("Ou remplissez les lignes ci-dessous.", "Or fill in the lines below.")}</span>
        <button type="button" className="b s inv" onClick={draft} disabled={aiBusy}>{aiBusy ? "…" : tr("Remplir →", "Fill in →")}</button></div>
    </div>
    <div className="blk">
      <div className="kinds" role="tablist">{Object.keys(KINDS).map((k) => <button type="button" key={k} className={doc.kind === k ? "on" : ""} onClick={() => { set("kind", k); if (k === "receipt") set("status", "paid"); onNumber && onNumber(k); }}>{kindName(k, lang)}</button>)}</div>
    </div>
    <div className="blk">
      <h3>{tr("Client", "Client")} {clients.length > 0 && <select className="inl" value="" onChange={(e) => { const c = clients.find(x => x.id === e.target.value); if (c) set("client", { name: c.name, email: c.email, phone: c.phone, address: c.address, tax_id: c.tax_id }); }}><option value="">{tr("Mes clients…", "My clients…")}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</h3>
      <label className="f"><span>{tr("Nom ou entreprise", "Name or company")}</span><input value={doc.client.name || ""} onChange={(e) => setClient("name", e.target.value)} placeholder="Awa Diop" autoComplete="off" /></label>
      <div className="g2">
        <label className="f"><span>WhatsApp / {tr("tél.", "phone")}</span><input type="tel" inputMode="tel" value={doc.client.phone || ""} onChange={(e) => setClient("phone", e.target.value)} placeholder="+229 01 …" /></label>
        <label className="f"><span>Email</span><input type="email" value={doc.client.email || ""} onChange={(e) => setClient("email", e.target.value)} /></label>
      </div>
    </div>
    <div className="blk">
      <h3>{tr("Lignes", "Lines")} <span className="mono">{fmt(t.sub, doc.currency, dl)}</span></h3>
      {doc.items.map((it, i) => (<div className="line" key={i}>
        <input className="lbl-in" placeholder={tr("Désignation", "Description")} value={it.label} onChange={(e) => setItem(i, "label", e.target.value)} aria-label={tr("Désignation", "Description")} />
        <input type="number" inputMode="decimal" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} aria-label={tr("Quantité", "Quantity")} />
        <input type="number" inputMode="decimal" min="0" step="any" placeholder={tr("Prix", "Price")} value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} aria-label={tr("Prix unitaire", "Unit price")} className="mono" />
        <button type="button" className="x" aria-label={tr("Supprimer la ligne", "Remove line")} onClick={() => set("items", doc.items.length > 1 ? doc.items.filter((_, n) => n !== i) : [{ label: "", qty: 1, price: "" }])}>×</button></div>))}
      <button type="button" className="b s o" onClick={() => set("items", [...doc.items, { label: "", qty: 1, price: "" }])}>+ {tr("Ligne", "Line")}</button>
      <div className="g2" style={{ marginTop: 16 }}>
        <label className="f"><span>{tr("Devise", "Currency")}</span><select value={doc.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{curLabel(c.code, lang)}</option>)}</select></label>
        <label className="f"><span>{ct.r === "ca" ? "GST/HST" : tr("TVA", "VAT / tax")}</span><select value={String(+doc.tax_rate || 0)} onChange={(e) => set("tax_rate", e.target.value)}>{rates.map(v => <option key={v} value={String(v)}>{v ? `${v} %${v === ct.vat ? ` — ${lang === "en" ? ct.en : ct.fr}` : ""}` : tr("Pas de TVA", "No VAT / tax")}</option>)}</select></label>
      </div>
    </div>
    <div className="blk">
      <button type="button" className="more" onClick={() => setMore(!more)} aria-expanded={more}>{more ? "−" : "+"} {tr("Dates, numéro, remise, note, langue", "Dates, number, discount, note, language")}</button>
      {more && <div style={{ marginTop: 14 }}>
        <div className="g2">
          <label className="f"><span>{tr("Numéro", "Number")}</span><input className="mono" value={doc.number || ""} onChange={(e) => set("number", e.target.value)} /></label>
          <label className="f"><span>{tr("Langue du document", "Document language")}</span><select value={dl} onChange={(e) => set("lang", e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>
          <label className="f"><span>Date</span><input type="date" value={doc.issue_date || ""} onChange={(e) => set("issue_date", e.target.value)} /></label>
          {doc.kind !== "receipt" && <label className="f"><span>{doc.kind === "quote" ? tr("Valable jusqu'au", "Valid until") : tr("À payer avant le", "Due date")}</span><input type="date" value={doc.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></label>}
          <label className="f"><span>{tr("Remise", "Discount")} ({doc.currency})</span><input type="number" inputMode="decimal" min="0" value={doc.discount || ""} onChange={(e) => set("discount", e.target.value)} placeholder="0" /></label>
          <label className="f"><span>{tr("N° fiscal du client", "Client tax ID")}</span><input value={doc.client.tax_id || ""} onChange={(e) => setClient("tax_id", e.target.value)} /></label>
        </div>
        {!compact && <label className="f"><span>{tr("Adresse du client", "Client address")}</span><input value={doc.client.address || ""} onChange={(e) => setClient("address", e.target.value)} /></label>}
        <label className="f" style={{ marginBottom: 0 }}><span>{tr("Note pour le client", "Note to client")}</span><textarea rows={2} value={doc.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder={tr("Acompte de 50 % à la commande. Merci !", "50% deposit on order. Thank you!")} /></label>
      </div>}
    </div>
    {setProfile && <div className="blk"><h3>{tr("Modèle", "Template")}</h3><div className="tpls">{TEMPLATES.map(x => <button type="button" key={x.id} className={(profile.template || "atelier") === x.id ? "on" : ""} onClick={() => setProfile({ ...profile, template: x.id })}><TplMini id={x.id} accent={profile.accent} />{lang === "en" ? x.en : x.name}</button>)}</div></div>}
  </div>);
  return (<>
    <div className="np mob-only" style={{ marginBottom: 14 }}><div className="seg"><button type="button" className={view === "edit" ? "on" : ""} onClick={() => setView("edit")}>{tr("Saisie", "Edit")}</button><button type="button" className={view === "prev" ? "on" : ""} onClick={() => setView("prev")}>{tr("Aperçu", "Preview")}</button></div></div>
    <div className="ed" data-view={view}>
      <div className="ed-form">{form}</div>
      <div className="preview ed-prev"><div className="sheet-stack"><DocPaper doc={doc} profile={profile} /></div></div>
    </div>
    <div className="totbar np"><span><span className="tb-l">Total</span><b className="mono">{fmt(t.total, doc.currency, dl)}</b></span>
      <button type="button" className="b s inv" onClick={() => setView(view === "edit" ? "prev" : "edit")}>{view === "edit" ? tr("Aperçu", "Preview") : tr("Modifier", "Edit")}</button></div>
  </>);
}
export function TplMini({ id, accent = "#111110" }) {
  const a = accent;
  if (id === "marche") return <div className="mini"><div style={{ background: a, height: 22 }} /><div style={{ margin: 6, height: 4, background: "#ddd", width: "60%" }} /><div style={{ margin: 6, height: 4, background: "#eee" }} /></div>;
  if (id === "registre") return <div className="mini" style={{ padding: 5 }}><div style={{ border: "1.5px solid #222", height: "100%", backgroundImage: "linear-gradient(#222 1px,transparent 1px)", backgroundSize: "100% 10px" }} /></div>;
  if (id === "sahel") return <div className="mini"><div style={{ margin: "8px 10px", fontSize: 15, fontWeight: 300, color: a }}>invoice.</div></div>;
  return <div className="mini"><div style={{ margin: "8px 8px 4px", height: 6, width: 36, background: a, marginLeft: "auto" }} /><div style={{ margin: 8, height: 3, background: "#ddd" }} /><div style={{ margin: 8, height: 3, background: "#eee" }} /></div>;
}
