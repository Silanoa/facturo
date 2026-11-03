"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENCIES, KINDS, totals, fmt, curLabel, kindName } from "../lib/money";
import { TEMPLATES } from "../lib/templates";
import { country } from "../lib/countries";
import { parseDraft } from "../lib/parse";
import { useT } from "../lib/i18n";
import DocPaper, { docLang, PAY_METHODS } from "./DocPaper";
export const today = () => new Date().toISOString().slice(0, 10);
export const plus = (n, from) => { const x = from ? new Date(from) : new Date(); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
export const blankDoc = (kind = "invoice", currency = "XOF", st = {}) => ({ kind, status: kind === "receipt" ? "paid" : "draft", client: {}, items: [{ label: "", qty: 1, price: "" }], currency, tax_rate: st.vat_default ? (+st.vat_rate || 0) : 0, discount: 0, issue_date: today(), due_date: kind === "receipt" ? null : plus(kind === "quote" ? (+st.quote_days || 30) : (+st.due_days || 15)), notes: (st.notes || {})[kind] || "", opts: { pay: st.show_pay !== false, ref: st.show_ref !== false, link: true } });
export const KIND_HELP = {
  invoice: ["Demande de paiement pour un travail fait ou vendu.", "Asks to be paid for work done or goods sold."],
  quote: ["Proposition de prix avant de commencer. Une fois acceptée, transformez-la en facture.", "A price proposal before you start. Once accepted, turn it into an invoice."],
  receipt: ["Preuve qu'un paiement a déjà été reçu. Rien à payer.", "Proof that a payment was already received. Nothing to pay."],
};
// Dictée : Web Speech API (Chrome, Edge, Safari). Masquée si le navigateur ne la gère pas.
function Mic({ onText, onDone, lang }) {
  const [on, setOn] = useState(false); const [err, setErr] = useState(""); const [ok, setOk] = useState(false); const rec = useRef(null); const base = useRef("");
  useEffect(() => { setOk(!!(window.SpeechRecognition || window.webkitSpeechRecognition)); }, []);
  if (!ok) return null; const en = lang === "en";
  const start = () => {
    setErr(""); const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const r = new SR();
    r.lang = en ? "en-US" : "fr-FR"; r.interimResults = true; r.continuous = true; r.maxAlternatives = 1; rec.current = r; base.current = "";
    let final = "";
    r.onresult = (e) => { let interim = ""; for (let i = e.resultIndex; i < e.results.length; i++) { const x = e.results[i][0].transcript; if (e.results[i].isFinal) final += (final ? " " : "") + x.trim(); else interim += x; } onText((final + (interim ? " " + interim : "")).trim()); };
    r.onerror = (e) => { setErr(e.error === "not-allowed" || e.error === "service-not-allowed" ? (en ? "Microphone blocked: allow it in your browser settings." : "Micro bloqué : autorisez-le dans les réglages du navigateur.") : e.error === "no-speech" ? (en ? "Nothing heard. Try again, closer to the mic." : "Rien entendu. Réessayez, plus près du micro.") : e.error === "network" ? (en ? "Dictation needs an internet connection." : "La dictée a besoin d'internet.") : (en ? "Dictation unavailable on this browser." : "Dictée indisponible sur ce navigateur.")); setOn(false); };
    r.onend = () => { setOn(false); if (final.trim()) onDone?.(final.trim()); };
    try { r.start(); setOn(true); } catch { setErr(en ? "Dictation unavailable." : "Dictée indisponible."); }
  };
  return <span className="mic-w"><button type="button" className={`mic ${on ? "on" : ""}`} onClick={() => on ? rec.current?.stop() : start()} aria-pressed={on}>{on ? <><i className="rec" />{en ? "Stop" : "Arrêter"}</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>{en ? "Dictate" : "Dicter"}</>}</button>{err && <em className="mic-err" role="status">{err}</em>}</span>;
}
function Tip({ children }) { return <span className="tip" tabIndex={0} role="note">?<span className="tip-b">{children}</span></span>; }
export default function Editor({ doc, setDoc, profile, setProfile, clients = [], onNumber, compact, account }) {
  const { tr, lang } = useT(); const st = profile.settings || {};
  const [view, setView] = useState("edit"); const [ai, setAi] = useState(""); const [aiBusy, setAiBusy] = useState(false); const [aiMsg, setAiMsg] = useState(null); const [more, setMore] = useState(false); const [perLine, setPerLine] = useState(() => (doc.items || []).some((i) => i.tax !== undefined && i.tax !== ""));
  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v })); const setO = (k, v) => setDoc((d) => ({ ...d, opts: { pay: true, ref: true, link: true, ...(d.opts || {}), [k]: v } }));
  const setItem = (i, k, v) => setDoc((d) => ({ ...d, items: d.items.map((it, n) => n === i ? { ...it, [k]: v } : it) }));
  const setClient = (k, v) => setDoc((d) => ({ ...d, client: { ...d.client, [k]: v } }));
  const t = totals(doc); const dl = docLang(doc, profile); const ct = country(profile.country || "BJ"); const O = { pay: true, ref: true, link: true, ...(doc.opts || {}) };
  const vatOn = +doc.tax_rate > 0 || (perLine && doc.items.some((i) => +i.tax > 0)); const vatName = ct.r === "ca" ? tr("TPS/TVH", "GST/HST") : ct.r === "us" ? tr("Taxe de vente", "Sales tax") : tr("TVA", "VAT");
  const rates = useMemo(() => { const r = [{ name: tr("Taux normal", "Standard"), rate: ct.vat || 0 }, ...(st.tax_rates || [])].filter((x) => +x.rate > 0); const seen = new Set(); return r.filter((x) => !seen.has(+x.rate) && seen.add(+x.rate)); }, [ct.code, st.tax_rates, lang]);
  const guess = useMemo(() => ai.trim().length > 4 ? parseDraft(ai) : null, [ai]);
  const K = doc.kind;
  async function draft(text = ai) {
    if (!text.trim()) return; setAiBusy(true); setAiMsg(null);
    let j = {}; try { const r = await fetch("/api/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }); j = await r.json(); } catch { j = parseDraft(text); }
    setAiBusy(false);
    if (!j.items?.length) return setAiMsg({ bad: 1, t: tr("Aucun montant reconnu. Indiquez un prix, par ex. « logo 150 000 et 2 affiches à 40 000 pour Atlas Conseil ».", "No amount recognised. Include a price, e.g. “logo 500 and 2 posters at 80 for Acme Ltd”.") });
    setDoc((d) => { const kind = j.kind || d.kind; const keep = d.items.filter((i) => i.label || +i.price); return { ...d, kind, client: { ...d.client, ...Object.fromEntries(Object.entries(j.client || {}).filter(([, v]) => v)) }, items: [...keep, ...j.items.map(i => ({ label: i.label, qty: i.qty, price: i.price }))], currency: j.currency || d.currency, tax_rate: j.tax_rate ?? d.tax_rate, due_date: j.due_days ? plus(j.due_days) : d.due_date, status: kind === "receipt" ? "paid" : d.status }; });
    if (j.kind && onNumber) onNumber(j.kind);
    setAi(""); setAiMsg({ t: tr(`${j.items.length} ligne(s) ajoutée(s) ci-dessous. Vérifiez les prix.`, `${j.items.length} line(s) added below. Check the prices.`) });
  }
  const setKind = (k) => setDoc((d) => ({ ...d, kind: k, status: k === "receipt" ? "paid" : (d.status === "paid" ? "draft" : d.status), due_date: k === "receipt" ? null : (d.due_date || plus(k === "quote" ? (+st.quote_days || 30) : (+st.due_days || 15))), notes: d.notes && d.notes !== (st.notes || {})[d.kind] ? d.notes : ((st.notes || {})[k] || "") }));
  const dueChips = [[0, tr("À réception", "On receipt")], [7, tr("7 jours", "7 days")], [15, tr("15 jours", "15 days")], [30, tr("30 jours", "30 days")]];
  const form = (<div>
    <div className="blk">
      <div className="kinds" role="tablist">{Object.keys(KINDS).map((k) => <button type="button" role="tab" aria-selected={K === k} key={k} className={K === k ? "on" : ""} onClick={() => { setKind(k); onNumber && onNumber(k); }}>{kindName(k, lang)}</button>)}</div>
      <p className="kind-help">{KIND_HELP[K][lang === "en" ? 1 : 0]}</p>
    </div>
    <div className="quick np">
      <div className="quick-h"><label htmlFor="q">{tr("Décrivez la prestation", "Describe the job")} <span className="mute">· {tr("facultatif", "optional")}</span></label><Mic lang={lang} onText={setAi} onDone={(x) => draft(x)} /></div>
      <textarea id="q" rows={2} value={ai} onChange={(e) => { setAi(e.target.value); setAiMsg(null); }} placeholder={tr("Ex. : logo 150 000 et 2 affiches à 40 000 pour Atlas Conseil, à 15 jours", "E.g. logo 500 and 2 posters at 80 for Acme Ltd, due in 14 days")} />
      <div className="quick-f"><span className={aiMsg?.bad ? "bad" : ""}>{aiMsg ? aiMsg.t : guess?.items?.length ? tr(`Détecté : ${guess.items.map((i) => `${i.qty > 1 ? i.qty + " × " : ""}${i.label}`).join(", ")}`, `Found: ${guess.items.map((i) => `${i.qty > 1 ? i.qty + " × " : ""}${i.label}`).join(", ")}`) : tr("Bonova crée les lignes, le client et l'échéance à partir de votre phrase.", "Bonova turns your sentence into lines, client and due date.")}</span>
        <button type="button" className="b s inv" onClick={() => draft()} disabled={aiBusy || !ai.trim()}>{aiBusy ? "…" : tr("Créer les lignes", "Create lines")}</button></div>
    </div>
    <div className="blk">
      <h3>{K === "receipt" ? tr("Reçu de (client)", "Received from") : tr("Client", "Client")} {clients.length > 0 && <select className="inl" value="" onChange={(e) => { const c = clients.find(x => x.id === e.target.value); if (c) set("client", { name: c.name, email: c.email, phone: c.phone, address: c.address, tax_id: c.tax_id }); }}><option value="">{tr("Mes clients…", "My clients…")}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</h3>
      <label className="f"><span>{tr("Nom ou entreprise", "Name or company")}</span><input value={doc.client.name || ""} onChange={(e) => setClient("name", e.target.value)} placeholder={tr("Ex. : Atlas Conseil", "E.g. Northwind Ltd")} autoComplete="off" /></label>
      <div className="g2">
        <label className="f"><span>WhatsApp / {tr("tél.", "phone")}</span><input type="tel" inputMode="tel" value={doc.client.phone || ""} onChange={(e) => setClient("phone", e.target.value)} placeholder={tr("Pour l'envoi WhatsApp", "For WhatsApp sending")} /></label>
        <label className="f"><span>Email</span><input type="email" value={doc.client.email || ""} onChange={(e) => setClient("email", e.target.value)} /></label>
      </div>
    </div>
    <div className="blk">
      <h3>{tr("Lignes", "Lines")} <span className="mono">{fmt(t.sub, doc.currency, dl)}</span></h3>
      {doc.items.map((it, i) => (<div className={`line ${perLine && vatOn ? "tx" : ""}`} key={i}>
        <input className="lbl-in" placeholder={tr("Désignation", "Description")} value={it.label} onChange={(e) => setItem(i, "label", e.target.value)} aria-label={tr("Désignation", "Description")} />
        <input type="number" inputMode="decimal" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} aria-label={tr("Quantité", "Quantity")} />
        <input type="number" inputMode="decimal" min="0" step="any" placeholder={tr("Prix", "Price")} value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} aria-label={tr("Prix unitaire", "Unit price")} className="mono" />
        {perLine && vatOn && <select aria-label={tr("Taux de la ligne", "Line rate")} value={it.tax ?? ""} onChange={(e) => setItem(i, "tax", e.target.value === "" ? undefined : +e.target.value)}><option value="">{String(doc.tax_rate)} %</option><option value="0">0 %</option>{rates.filter(r => +r.rate !== +doc.tax_rate).map(r => <option key={r.rate} value={r.rate}>{r.rate} %</option>)}</select>}
        <button type="button" className="x" aria-label={tr("Supprimer la ligne", "Remove line")} onClick={() => set("items", doc.items.length > 1 ? doc.items.filter((_, n) => n !== i) : [{ label: "", qty: 1, price: "" }])}>×</button></div>))}
      <button type="button" className="b s o" onClick={() => set("items", [...doc.items, { label: "", qty: 1, price: "" }])}>+ {tr("Ajouter une ligne", "Add a line")}</button>
      <div className="g2" style={{ marginTop: 16 }}>
        <label className="f"><span>{tr("Devise", "Currency")} <Tip>{tr(`Réglée selon votre pays (${lang === "en" ? ct.en : ct.fr}). Changez-la pour un client étranger.`, `Set from your country (${ct.en}). Change it for a foreign client.`)}</Tip></span><select value={doc.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{curLabel(c.code, lang)}</option>)}</select></label>
        <div className="f"><span>{vatName} <Tip>{tr("Laissez désactivé si vous n'êtes pas assujetti : la mention légale de votre pays s'ajoute seule.", "Leave off if you're not VAT-registered: your country's legal line is added for you.")}</Tip></span>
          <div className="vat"><label className="tog"><input type="checkbox" checked={vatOn} onChange={(e) => { set("tax_rate", e.target.checked ? (rates[0]?.rate || 10) : 0); if (!e.target.checked) { setPerLine(false); set("items", doc.items.map(({ tax, ...r }) => r)); } }} /><span>{vatOn ? tr("Appliquée", "Charged") : tr("Non appliquée", "Not charged")}</span></label>
            {vatOn && <span className="vat-r"><select value={rates.some(r => +r.rate === +doc.tax_rate) ? doc.tax_rate : "x"} onChange={(e) => e.target.value !== "x" && set("tax_rate", +e.target.value)} aria-label={tr("Taux", "Rate")}>{rates.map(r => <option key={r.rate} value={r.rate}>{r.rate} %{r.name ? ` · ${r.name}` : ""}</option>)}<option value="x">{tr("Autre taux…", "Other rate…")}</option></select>
              {!rates.some(r => +r.rate === +doc.tax_rate) && <><input type="number" inputMode="decimal" min="0" max="50" step="any" value={doc.tax_rate} onChange={(e) => set("tax_rate", e.target.value)} aria-label={tr("Taux personnalisé", "Custom rate")} />%</>}</span>}</div>
          {vatOn && <label className="row chk"><input type="checkbox" checked={perLine} onChange={(e) => { setPerLine(e.target.checked); if (!e.target.checked) set("items", doc.items.map(({ tax, ...r }) => r)); }} />{tr("Plusieurs taux (un taux par ligne)", "Several rates (one per line)")}</label>}</div>
      </div>
    </div>
    {K === "invoice" && <div className="blk"><h3>{tr("Échéance", "Payment due")}</h3><div className="chips">{dueChips.map(([n, l]) => <button type="button" key={n} className={doc.due_date === plus(n, doc.issue_date || today()) ? "on" : ""} onClick={() => set("due_date", plus(n, doc.issue_date || today()))}>{l}</button>)}<input type="date" value={doc.due_date || ""} onChange={(e) => set("due_date", e.target.value)} aria-label={tr("Date d'échéance", "Due date")} /></div></div>}
    {K === "quote" && <div className="blk"><h3>{tr("Validité et acompte", "Validity & deposit")}</h3><div className="g2">
      <label className="f"><span>{tr("Valable jusqu'au", "Valid until")}</span><input type="date" value={doc.due_date || ""} onChange={(e) => set("due_date", e.target.value)} /></label>
      <label className="f"><span>{tr("Acompte à la commande", "Deposit on acceptance")} (%)</span><input type="number" min="0" max="100" inputMode="numeric" value={O.deposit || ""} placeholder="0" onChange={(e) => { const v = +e.target.value || 0; setO("deposit", v); }} /></label></div>
      {+O.deposit > 0 && <p className="hint" style={{ marginTop: 0 }}>{tr(`Acompte de ${O.deposit} % : ${fmt(t.total * O.deposit / 100, doc.currency, dl)}, indiqué dans les conditions.`, `Deposit ${O.deposit}%: ${fmt(t.total * O.deposit / 100, doc.currency, dl)}, shown in the terms.`)}</p>}</div>}
    {K === "receipt" && <div className="blk"><h3>{tr("Paiement reçu", "Payment received")}</h3><div className="g2">
      <label className="f"><span>{tr("Date du paiement", "Payment date")}</span><input type="date" value={O.paid_on || doc.issue_date || ""} onChange={(e) => setO("paid_on", e.target.value)} /></label>
      <label className="f"><span>{tr("Mode de paiement", "Payment method")}</span><select value={O.method || ""} onChange={(e) => setO("method", e.target.value)}><option value="">—</option>{PAY_METHODS[lang === "en" ? "en" : "fr"].map(m => <option key={m}>{m}</option>)}</select></label>
      <label className="f" style={{ gridColumn: "1/-1" }}><span>{tr("En règlement de (facture n°, objet…)", "In payment of (invoice no., purpose…)")}</span><input value={O.for || ""} onChange={(e) => setO("for", e.target.value)} placeholder={tr("Ex. : facture FAC-2026-0012", "E.g. invoice INV-2026-0012")} /></label></div></div>}
    {K === "invoice" && <div className="blk"><h3>{tr("Sur la facture", "On the invoice")} <Tip>{tr("Une facture simple, sans moyens de paiement ni référence, est tout à fait possible. Vous marquerez vous-même le paiement ensuite.", "A plain invoice without payment details or reference is fine. You'll mark the payment yourself later.")}</Tip></h3>
      <label className="row chk"><input type="checkbox" checked={O.pay} onChange={(e) => setO("pay", e.target.checked)} />{tr("Afficher mes moyens de paiement", "Show my payment details")}</label>
      <label className="row chk"><input type="checkbox" checked={O.ref} onChange={(e) => setO("ref", e.target.checked)} />{tr("Afficher la référence de paiement", "Show the payment reference")}</label>
      {account && <label className="row chk"><input type="checkbox" checked={O.link} onChange={(e) => setO("link", e.target.checked)} />{tr("Inclure le lien en ligne dans le message", "Include the online link in the message")}</label>}</div>}
    <div className="blk">
      <button type="button" className="more" onClick={() => setMore(!more)} aria-expanded={more}><span>{tr("Numéro, dates, remise, notes", "Number, dates, discount, notes")}</span><span className="mono">{more ? "−" : "+"}</span></button>
      {more && <div style={{ marginTop: 14 }}>
        <div className="g2">
          <label className="f"><span>{tr("Numéro", "Number")}</span><input className="mono" value={doc.number || ""} onChange={(e) => set("number", e.target.value)} /></label>
          <label className="f"><span>{tr("Langue du document", "Document language")}</span><select value={dl} onChange={(e) => set("lang", e.target.value)}><option value="fr">Français</option><option value="en">English</option></select></label>
          <label className="f"><span>{tr("Date d'émission", "Issue date")}</span><input type="date" value={doc.issue_date || ""} onChange={(e) => set("issue_date", e.target.value)} /></label>
          <label className="f"><span>{tr("Remise", "Discount")} ({doc.currency})</span><input type="number" inputMode="decimal" min="0" value={doc.discount || ""} onChange={(e) => set("discount", e.target.value)} placeholder="0" /></label>
          <label className="f"><span>{tr("N° fiscal du client", "Client tax ID")}</span><input value={doc.client.tax_id || ""} onChange={(e) => setClient("tax_id", e.target.value)} /></label>
          {K === "invoice" && <label className="f"><span>{tr("Réf. commande client", "Client PO number")}</span><input value={O.po || ""} onChange={(e) => setO("po", e.target.value)} /></label>}
        </div>
        <label className="f"><span>{tr("Adresse du client", "Client address")}</span><input value={doc.client.address || ""} onChange={(e) => setClient("address", e.target.value)} /></label>
        <label className="f" style={{ marginBottom: 0 }}><span>{K === "quote" ? tr("Conditions", "Terms") : tr("Note pour le client", "Note to client")}</span><textarea rows={2} value={doc.notes || ""} onChange={(e) => set("notes", e.target.value)} placeholder={K === "quote" ? tr("Ex. : délai de réalisation 3 semaines après acceptation.", "E.g. delivery within 3 weeks of acceptance.") : tr("Ex. : merci pour votre confiance.", "E.g. thank you for your business.")} /></label>
      </div>}
    </div>
    {setProfile && <div className="blk"><h3>{tr("Modèle", "Template")} <span className="mute" style={{ fontWeight: 400, fontSize: 13, textTransform: "none", letterSpacing: 0 }}>{tr("· couleurs, typo et vos propres modèles avec un compte gratuit", "· colours, fonts and your own templates with a free account")}</span></h3><div className="tpls">{TEMPLATES.map(x => <button type="button" key={x.id} className={(profile.template || "net") === x.id ? "on" : ""} onClick={() => setProfile({ ...profile, template: x.id })}><TplMini id={x.id} accent={profile.accent} />{lang === "en" ? x.en : x.name}</button>)}</div></div>}
  </div>);
  return (<>
    <div className="ed" data-view={view}>
      <div className="ed-form">{form}</div>
      <div className="preview ed-prev"><div className="sheet-stack"><DocPaper doc={doc} profile={profile} /></div></div>
    </div>
    <div className="totbar np"><span><span className="tb-l">{kindName(K, lang)} · Total</span><b className="mono">{fmt(t.total, doc.currency, dl)}</b></span>
      <button type="button" className="b s inv" onClick={() => { setView(view === "edit" ? "prev" : "edit"); scrollTo({ top: 0, behavior: "smooth" }); }}>{view === "edit" ? tr("Aperçu", "Preview") : tr("Modifier", "Edit")}</button></div>
  </>);
}
export function TplMini({ id, accent = "#111110" }) {
  const a = accent;
  if (id === "net") return <div className="mini" style={{ padding: 7 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ height: 5, width: 22, background: "#222" }} /><div style={{ height: 5, width: 16, background: "#bbb" }} /></div><div style={{ marginTop: 7, height: 9, background: `${a}22`, borderLeft: `2px solid ${a}` }} /><div style={{ marginTop: 6, height: 2, background: "#ddd" }} /><div style={{ marginTop: 4, height: 2, background: "#eee" }} /></div>;
  if (id === "marche") return <div className="mini"><div style={{ background: a, height: 22 }} /><div style={{ margin: 6, height: 4, background: "#ddd", width: "60%" }} /><div style={{ margin: 6, height: 4, background: "#eee" }} /></div>;
  if (id === "registre") return <div className="mini" style={{ padding: 5 }}><div style={{ border: "1.5px solid #222", height: "100%", backgroundImage: "linear-gradient(#222 1px,transparent 1px)", backgroundSize: "100% 10px" }} /></div>;
  if (id === "sahel") return <div className="mini"><div style={{ margin: "8px 10px", fontSize: 15, fontWeight: 300, color: a }}>invoice.</div></div>;
  return <div className="mini"><div style={{ margin: "8px 8px 4px", height: 6, width: 36, background: a, marginLeft: "auto" }} /><div style={{ margin: 8, height: 3, background: "#ddd" }} /><div style={{ margin: 8, height: 3, background: "#eee" }} /></div>;
}
