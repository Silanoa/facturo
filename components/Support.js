"use client";
import { useState, useRef, useEffect } from "react";
import { SUPPORT, waSupport, mailSupport } from "../lib/site";
import { kbMatch } from "../lib/kb";
const T = {
  fr: { btn: "Aide", h: "Aide Bonova", hi: "Choisissez un sujet ou posez votre question. Si la réponse ne suffit pas, écrivez-nous sur WhatsApp ou par email.", ph: "Votre question, par ex. « facturer sans TVA »", send: "Demander", no: "Je n'ai pas de réponse sûre. L'équipe peut vous répondre directement :", wa: "Écrire sur WhatsApp", mail: "Envoyer un email", team: "Contacter l'équipe", q: ["Facturer sans TVA", "Ajouter mon logo", "Marquer une facture payée", "Devis, facture ou reçu ?", "Télécharger en PDF"] },
  en: { btn: "Help", h: "Bonova Help", hi: "Pick a topic or ask your question. If the answer isn't enough, write to us on WhatsApp or by email.", ph: "Your question, e.g. “invoice without VAT”", send: "Ask", no: "I don't have a sure answer. The team can reply directly:", wa: "Message on WhatsApp", mail: "Send an email", team: "Contact the team", q: ["Invoice without VAT", "Add my logo", "Mark an invoice as paid", "Quote, invoice or receipt?", "Download as PDF"] },
};
export default function Support({ lang = "fr", hdr }) {
  const L = lang === "en" ? "en" : "fr"; const t = T[L]; const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState([]); const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, open]);
  useEffect(() => { const k = (e) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  async function ask(text) {
    const x = (text ?? q).trim(); if (!x) return; setQ(""); setMsgs((m) => [...m, { me: 1, t: x }]); setBusy(true);
    let a = null; try { const r = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: x, lang: L }) }); a = (await r.json()).a; } catch { a = kbMatch(x, L); }
    setBusy(false); setMsgs((m) => [...m, a ? { t: a } : { t: t.no, human: x }]);
  }
  return (<div className={`sup np ${hdr ? "hdr" : ""}`}>
    {open && <div className="sup-p" role="dialog" aria-label={t.h}>
      <div className="sup-h"><div><b>{t.h}</b><span>{SUPPORT.name}</span></div><button type="button" onClick={() => setOpen(false)} aria-label={L === "en" ? "Close" : "Fermer"}>×</button></div>
      <div className="sup-b">
        <p className="sup-m">{t.hi}</p>
        {!msgs.length && <div className="sup-q">{t.q.map((x) => <button type="button" key={x} onClick={() => ask(x)}>{x}</button>)}</div>}
        {msgs.map((m, i) => <div key={i} className={`sup-m ${m.me ? "me" : ""}`}>{m.t}{m.human && <div className="sup-c"><a className="b s wa" href={waSupport(m.human, L)} target="_blank" rel="noreferrer">{t.wa}</a><a className="b s o" href={mailSupport(m.human, L)}>{t.mail}</a></div>}</div>)}
        {busy && <div className="sup-m dots"><i /><i /><i /></div>}<div ref={end} />
      </div>
      <form className="sup-f" onSubmit={(e) => { e.preventDefault(); ask(); }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.ph} aria-label={t.ph} /><button className="b s" type="submit" disabled={!q.trim()}>{t.send}</button></form>
      <div className="sup-x"><span>{t.team}</span><a href={waSupport("", L)} target="_blank" rel="noreferrer">WhatsApp</a><a href={mailSupport("", L)}>Email</a></div>
    </div>}
    <button type="button" className={hdr ? "sup-l" : "sup-btn"} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t.h}>{open && !hdr ? "×" : t.btn}</button>
  </div>);
}
