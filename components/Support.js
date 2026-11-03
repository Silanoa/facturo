"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SUPPORT, waSupport, mailSupport } from "../lib/site";
import { kbSearch, kbById, kbSuggest } from "../lib/kb";
const T = {
  fr: { btn: "Aide", h: "Assistant Bonova", st: "Répond tout de suite · équipe sous 24 h", hi: "Bonjour 👋 Je réponds aux questions sur Bonova. Choisissez un sujet ou écrivez la vôtre.", ph: "Écrivez votre question…", send: "Envoyer", no: "Je n'ai pas de réponse sûre à ça. Un membre de l'équipe peut vous répondre :", wa: "WhatsApp", mail: "Email", team: "Parler à une personne", go: "Ouvrir", ok: "Ça m'aide", ko: "Pas vraiment", thx: "Merci !", more: "Voir aussi", reset: "Recommencer", close: "Fermer", rl: "Trop de questions d'un coup, réessayez dans une minute." },
  en: { btn: "Help", h: "Bonova assistant", st: "Instant answers · team within 24 h", hi: "Hi 👋 I answer questions about Bonova. Pick a topic or type your own.", ph: "Type your question…", send: "Send", no: "I don't have a sure answer to that. Someone from the team can reply:", wa: "WhatsApp", mail: "Email", team: "Talk to a person", go: "Open", ok: "That helps", ko: "Not really", thx: "Thanks!", more: "See also", reset: "Start over", close: "Close", rl: "Too many questions at once, try again in a minute." },
};
const KEY = "bnv_sup";
export default function Support({ lang = "fr", hdr }) {
  const L = lang === "en" ? "en" : "fr"; const t = T[L]; const path = usePathname() || "";
  const [open, setOpen] = useState(false); const [msgs, setMsgs] = useState([]); const [q, setQ] = useState(""); const [busy, setBusy] = useState(false); const end = useRef(null); const inp = useRef(null);
  useEffect(() => { try { const s = JSON.parse(sessionStorage.getItem(KEY) || "[]"); if (Array.isArray(s)) setMsgs(s.slice(-30)); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-30))); } catch {} }, [msgs]);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); if (open) setTimeout(() => inp.current?.focus(), 50); }, [msgs, open]);
  useEffect(() => { const k = (e) => e.key === "Escape" && setOpen(false); addEventListener("keydown", k); return () => removeEventListener("keydown", k); }, []);
  const transcript = () => msgs.filter((m) => m.me).map((m) => "• " + m.t).join("\n");
  async function ask(text, id) {
    const x = (text ?? q).trim(); if (!x || busy) return; setQ(""); const hist = msgs.slice(-4); setMsgs((m) => [...m, { me: 1, t: x }]); setBusy(true);
    let r = null;
    if (id) { const e = kbById(id); r = { id, a: e.a[L], href: e.href?.[L], rel: e.rel }; await new Promise((ok) => setTimeout(ok, 250)); }
    else { try { const res = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ q: x, lang: L, path, hist }) }); r = await res.json(); if (res.status === 429) r = { a: t.rl, rl: 1 }; } catch { const h = kbSearch(x, L, 3); r = h[0] ? { id: h[0].e.id, a: h[0].e.a[L], href: h[0].e.href?.[L], rel: h.slice(1).map((y) => y.e.id) } : { a: null }; } }
    setBusy(false); setMsgs((m) => [...m, r?.a ? { t: r.a, href: r.href, rel: (r.rel || []).filter((y) => y !== r.id && kbById(y)).slice(0, 3), fb: !r.rl } : { t: t.no, human: x, rel: (r?.rel || []).filter(kbById).slice(0, 2) }]);
  }
  const fb = (i, v) => setMsgs((m) => m.map((y, j) => (j === i ? { ...y, fb: 0, voted: v, human: v === "ko" ? (m[i - 1]?.t || "") : y.human } : y)));
  const chips = kbSuggest(path, L);
  return (<div className={`sup np ${hdr ? "hdr" : ""}`}>
    {open && <div className="sup-p" role="dialog" aria-label={t.h}>
      <div className="sup-h"><span className="sup-av" aria-hidden><img src="/icon.svg" alt="" width="34" height="34" /></span><div className="sup-ht"><b>{t.h}</b><span><i className="sup-on" />{t.st}</span></div>
        {msgs.length > 0 && <button type="button" className="sup-ic" onClick={() => setMsgs([])} title={t.reset} aria-label={t.reset}>↺</button>}
        <button type="button" className="sup-ic" onClick={() => setOpen(false)} aria-label={t.close}>×</button></div>
      <div className="sup-b" aria-live="polite">
        <div className="sup-m bot">{t.hi}</div>
        {!msgs.length && <div className="sup-q">{chips.map((e) => <button type="button" key={e.id} onClick={() => ask(e.q[L], e.id)}>{e.q[L]}</button>)}</div>}
        {msgs.map((m, i) => m.me ? <div key={i} className="sup-m me">{m.t}</div> : <div key={i} className="sup-m bot">
          <div>{m.t}</div>
          {m.href && <a className="sup-go" href={m.href}>{t.go} →</a>}
          {m.human != null && <div className="sup-c"><a className="sup-h1 wa" href={waSupport((m.human || "") + (transcript() ? "\n\n" + transcript() : ""), L)} target="_blank" rel="noreferrer">{t.wa}</a><a className="sup-h1" href={mailSupport((m.human || "") + (transcript() ? "\n\n" + transcript() : ""), L)}>{t.mail}</a></div>}
          {m.fb ? <div className="sup-fb"><button type="button" onClick={() => fb(i, "ok")}>👍 {t.ok}</button><button type="button" onClick={() => fb(i, "ko")}>👎 {t.ko}</button></div> : m.voted === "ok" ? <div className="sup-fb"><span>{t.thx}</span></div> : null}
          {m.rel?.length > 0 && i === msgs.length - 1 && <div className="sup-q rel"><small>{t.more}</small>{m.rel.map((id) => { const e = kbById(id); return <button type="button" key={id} onClick={() => ask(e.q[L], id)}>{e.q[L]}</button>; })}</div>}
        </div>)}
        {busy && <div className="sup-m bot dots" aria-label="…"><i /><i /><i /></div>}<div ref={end} />
      </div>
      <form className="sup-f" onSubmit={(e) => { e.preventDefault(); ask(); }}><input ref={inp} value={q} maxLength={600} onChange={(e) => setQ(e.target.value)} placeholder={t.ph} aria-label={t.ph} /><button className="sup-s" type="submit" disabled={!q.trim() || busy} aria-label={t.send}>↑</button></form>
      <div className="sup-x"><span>{t.team} · {SUPPORT.name}</span><span><a href={waSupport(transcript(), L)} target="_blank" rel="noreferrer">WhatsApp</a> · <a href={mailSupport(transcript(), L)}>Email</a></span></div>
    </div>}
    <button type="button" className={hdr ? "sup-l" : "sup-btn"} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={t.h}>{open && !hdr ? "×" : <><img className="sup-ic" src="/icon.svg" alt="" width="24" height="24" aria-hidden />{t.btn}</>}</button>
  </div>);
}
