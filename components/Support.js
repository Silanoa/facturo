"use client";
import { useState, useRef, useEffect } from "react";
import { SUPPORT, waSupport } from "../lib/site";
import { kbMatch } from "../lib/kb";
const T = {
  fr: { btn: "Aide", h: "Une question ?", hi: "Posez votre question : TVA, PDF, modèle, paiement… Réponse immédiate, ou un humain sur WhatsApp.", ph: "Ex. : comment enlever la TVA ?", send: "Envoyer", no: "Je n'ai pas la réponse exacte. Écrivez-nous, on répond vite :", wa: "WhatsApp", mail: "Email", q: ["Comment enlever la TVA ?", "Ajouter mon logo", "Télécharger en PDF", "Être payé par Mobile Money"] },
  en: { btn: "Help", h: "Got a question?", hi: "Ask about VAT, PDF, templates, payments… Instant answer, or a human on WhatsApp.", ph: "E.g. how do I remove VAT?", send: "Send", no: "I don't have the exact answer. Message us, we reply fast:", wa: "WhatsApp", mail: "Email", q: ["How do I remove VAT?", "Add my logo", "Download as PDF", "Get paid by Mobile Money"] },
};
export default function Support({ lang = "fr", hdr }) {
  const t = T[lang === "en" ? "en" : "fr"]; const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState([]); const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [msgs, open]);
  async function ask(text) {
    const x = (text ?? q).trim(); if (!x) return; setQ(""); setMsgs((m) => [...m, { me: 1, t: x }]); setBusy(true);
    let a = null; try { const r = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: x, lang }) }); a = (await r.json()).a; } catch { a = kbMatch(x, lang); }
    setBusy(false); setMsgs((m) => [...m, a ? { t: a } : { t: t.no, human: x }]);
  }
  return (<div className={`sup np ${hdr ? "hdr" : ""}`}>
    {open && <div className="sup-p" role="dialog" aria-label={t.h}>
      <div className="sup-h"><b>{t.h}</b><button type="button" onClick={() => setOpen(false)} aria-label="Fermer">×</button></div>
      <div className="sup-b">
        <p className="sup-m">{t.hi}</p>
        {!msgs.length && <div className="sup-q">{t.q.map((x) => <button type="button" key={x} onClick={() => ask(x)}>{x}</button>)}</div>}
        {msgs.map((m, i) => <div key={i} className={`sup-m ${m.me ? "me" : ""}`}>{m.t}{m.human && <div className="sup-c"><a className="b s wa" href={waSupport(m.human)} target="_blank" rel="noreferrer">{t.wa}</a><a className="b s o" href={`mailto:${SUPPORT.email}?subject=${encodeURIComponent("Bonova")}&body=${encodeURIComponent(m.human)}`}>{t.mail}</a></div>}</div>)}
        {busy && <div className="sup-m">…</div>}<div ref={end} />
      </div>
      <form className="sup-f" onSubmit={(e) => { e.preventDefault(); ask(); }}><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.ph} aria-label={t.ph} /><button className="b s" type="submit">{t.send}</button></form>
      <div className="sup-x"><a href={waSupport()} target="_blank" rel="noreferrer">WhatsApp {SUPPORT.waLabel}</a><a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a></div>
    </div>}
    <button type="button" className={hdr ? "sup-l" : "sup-btn"} onClick={() => setOpen(!open)} aria-expanded={open}>{open && !hdr ? "×" : t.btn}</button>
  </div>);
}
