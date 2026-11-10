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
  quote: ["Avant le travail", "Propose un prix au client.", "Before the work", "Proposes a price."],
  invoice: ["Après le travail", "Demande le paiement.", "After the work", "Requests payment."],
  receipt: ["Après paiement", "Confirme une somme reçue.", "After payment", "Confirms money received."],
};
// Dictée. Si la transcription serveur est configurée (GROQ_API_KEY) : MediaRecorder + Whisper, tous navigateurs.
// Sinon : reconnaissance vocale du navigateur (Chrome, Edge, Safari). Bouton masqué si aucune des deux n'est possible.
const MIC_MAX = 60;
const MIC_TXT = {
  fr: { idle: "Dicter", rec: "Arrêter", busy: "Transcription…", denied: "Accès au micro refusé. Autorisez-le dans les réglages du navigateur, puis réessayez.", nomic: "Aucun micro détecté.", busymic: "Le micro est utilisé par une autre application.", empty: "Rien n'a été entendu. Réessayez en parlant plus près du micro.", short: "Enregistrement trop court. Maintenez la dictée au moins une seconde.", limit: "Durée maximale atteinte (1 min). La dictée a été arrêtée.", big: "Enregistrement trop long. Limitez-vous à une minute.", rate: "Trop de dictées en peu de temps. Réessayez dans une minute.", net: "Connexion impossible. Vérifiez votre réseau et réessayez.", fail: "La transcription n'a pas abouti. Réessayez ou saisissez le texte.", https: "La dictée nécessite une page sécurisée (https).", unsup: "La dictée n'est pas disponible sur ce navigateur." },
  en: { idle: "Dictate", rec: "Stop", busy: "Transcribing…", denied: "Microphone access denied. Allow it in your browser settings, then try again.", nomic: "No microphone found.", busymic: "The microphone is in use by another app.", empty: "Nothing was heard. Try again, closer to the microphone.", short: "Recording too short. Speak for at least a second.", limit: "Maximum length reached (1 min). Dictation stopped.", big: "Recording too long. Keep it under one minute.", rate: "Too many dictations in a short time. Try again in a minute.", net: "Connection failed. Check your network and try again.", fail: "Transcription failed. Try again or type the text.", https: "Dictation needs a secure (https) page.", unsup: "Dictation isn't available in this browser." },
};
function pickMime() {
  const M = window.MediaRecorder; if (!M?.isTypeSupported) return "";
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus", "audio/ogg"].find((t) => { try { return M.isTypeSupported(t); } catch { return false; } }) || "";
}
function Mic({ onText, onDone, lang }) {
  const en = lang === "en"; const T = MIC_TXT[en ? "en" : "fr"];
  const [ok, setOk] = useState(false); const [st, setSt] = useState("idle"); const [sec, setSec] = useState(0); const [err, setErr] = useState("");
  const R = useRef({});
  useEffect(() => {
    let live = true;
    const sr = !!(window.SpeechRecognition || window.webkitSpeechRecognition); const rec = !!(window.MediaRecorder && navigator.mediaDevices?.getUserMedia);
    const fallback = () => live && setOk(sr ? "speech" : false);
    if (rec) fetch("/api/ai/transcribe").then((r) => r.json()).then((j) => j.ok ? live && setOk("server") : fallback()).catch(fallback); else fallback();
    return () => { live = false; cleanup(); };
  }, []);
  function cleanup() { const r = R.current; clearInterval(r.tick); clearTimeout(r.cap); try { r.stream?.getTracks().forEach((t) => t.stop()); } catch {} r.stream = null; if (r.sr) { try { r.sr.onend = null; r.sr.abort(); } catch {} r.sr = null; } }
  async function send(blob, dur) {
    if (dur < 0.8 || blob.size < 800) { setSt("idle"); return setErr(T.short); }
    setSt("busy");
    try {
      const type = (blob.type || "audio/webm").split(";")[0];
      const r = await fetch(`/api/ai/transcribe?lang=${en ? "en" : "fr"}`, { method: "POST", headers: { "content-type": type }, body: blob });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429) setErr(T.rate); else if (r.status === 413) setErr(T.big); else if (!r.ok) setErr(T.fail);
      else if (!j.text) setErr(T.empty);
      else { onText?.(j.text); onDone?.(j.text); }
    } catch { setErr(T.net); }
    setSt("idle");
  }
  function startSpeech() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; let sr;
    try { sr = new SR(); } catch { return setErr(T.unsup); }
    const r = R.current; r.sr = sr; r.t0 = Date.now(); r.hitCap = false; let final = "", last = "", failed = false;
    sr.lang = en ? "en-US" : "fr-FR"; sr.interimResults = true; sr.maxAlternatives = 1; sr.continuous = !/Android|iPhone|iPad/i.test(navigator.userAgent);
    // Texte reconstruit à chaque résultat : évite les doublons sur Android.
    sr.onresult = (e) => { let f = "", i2 = ""; for (let i = 0; i < e.results.length; i++) { const x = e.results[i][0].transcript.trim(); if (e.results[i].isFinal) f += (f ? " " : "") + x; else i2 += (i2 ? " " : "") + x; } final = f; last = (f + (i2 ? " " + i2 : "")).trim(); if (last) onText?.(last); };
    sr.onerror = (e) => { failed = true; const c = e.error; setErr(c === "not-allowed" || c === "service-not-allowed" ? T.denied : c === "audio-capture" ? T.nomic : c === "no-speech" ? T.empty : c === "network" ? T.net : c === "aborted" ? "" : T.fail); };
    let ended = false; sr.onend = () => { if (ended) return; ended = true; const txt = (final || last).trim(); r.sr = null; cleanup(); setSt("idle"); if (r.hitCap) setErr(T.limit); if (txt) onDone?.(txt); else if (!failed) setErr(T.empty); };
    try { sr.start(); } catch { r.sr = null; return setErr(T.unsup); }
    setSec(0); setSt("rec");
    r.tick = setInterval(() => setSec(Math.floor((Date.now() - r.t0) / 1000)), 250);
    r.cap = setTimeout(() => { r.hitCap = true; stop(); }, MIC_MAX * 1000);
  }
  async function start() {
    setErr("");
    if (!window.isSecureContext) return setErr(T.https);
    if (ok === "speech") return startSpeech();
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }); }
    catch (e) { const n = e?.name; return setErr(n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError" ? T.denied : n === "NotFoundError" || n === "OverconstrainedError" || n === "DevicesNotFoundError" ? T.nomic : n === "NotReadableError" || n === "AbortError" ? T.busymic : T.unsup); }
    let mr; const mime = pickMime();
    try { mr = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 }); }
    catch { try { mr = new MediaRecorder(stream); } catch { stream.getTracks().forEach((t) => t.stop()); return setErr(T.unsup); } }
    const r = R.current; r.stream = stream; r.mr = mr; r.chunks = []; r.t0 = Date.now(); r.hitCap = false;
    mr.ondataavailable = (e) => { if (e.data?.size) r.chunks.push(e.data); };
    mr.onerror = () => { cleanup(); setSt("idle"); setErr(T.fail); };
    mr.onstop = () => { const dur = (Date.now() - r.t0) / 1000; cleanup(); const blob = new Blob(r.chunks, { type: mr.mimeType || mime || "audio/webm" }); r.chunks = []; if (r.hitCap) setErr(T.limit); send(blob, dur); };
    try { mr.start(1000); } catch { cleanup(); return setErr(T.unsup); }
    setSec(0); setSt("rec");
    r.tick = setInterval(() => setSec(Math.floor((Date.now() - r.t0) / 1000)), 250);
    r.cap = setTimeout(() => { r.hitCap = true; stop(); }, MIC_MAX * 1000);
  }
  function stop() {
    const r = R.current;
    if (r.sr) { clearTimeout(r.cap); clearInterval(r.tick); setSt("busy"); const sr = r.sr; try { sr.stop(); } catch { cleanup(); setSt("idle"); return; } setTimeout(() => { if (R.current.sr === sr) { const h = sr.onend; h && h(); } }, 5000); return; }
    try { if (r.mr && r.mr.state !== "inactive") r.mr.stop(); } catch { cleanup(); setSt("idle"); }
  }
  if (!ok) return null;
  const mm = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const icon = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>;
  return <span className="mic-w">
    {err && st === "idle" && <em className="mic-err" role="status">{err}</em>}
    <button type="button" className={`mic ${st === "rec" ? "on" : ""}`} disabled={st === "busy"} aria-pressed={st === "rec"} data-state={st}
      onClick={() => st === "rec" ? stop() : st === "idle" && start()}>
      {st === "rec" ? <><i className="rec" /><span className="mono">{mm(sec)} / 1:00</span> · {T.rec}</> : st === "busy" ? <>{T.busy}</> : <>{icon}{T.idle}</>}
    </button>
  </span>;
}
function Tip({ children }) { return <span className="tip" tabIndex={0} role="note">?<span className="tip-b">{children}</span></span>; }
export default function Editor({ doc, setDoc, profile, setProfile, clients = [], onNumber, compact, account }) {
  const { tr, lang } = useT(); const st = profile.settings || {};
  const [view, setView] = useState("edit"); const [ai, setAi] = useState(""); const [aiBusy, setAiBusy] = useState(false); const [aiMsg, setAiMsg] = useState(null); const [more, setMore] = useState(false); const [perLine, setPerLine] = useState(() => (doc.items || []).some((i) => i.tax !== undefined && i.tax !== ""));
  const set = (k, v) => setDoc((d) => ({ ...d, [k]: v })); const setO = (k, v) => setDoc((d) => ({ ...d, opts: { pay: true, ref: true, link: true, ...(d.opts || {}), [k]: v } }));
  const setItem = (i, k, v) => setDoc((d) => ({ ...d, items: d.items.map((it, n) => n === i ? { ...it, [k]: v } : it) }));
  const setClient = (k, v) => setDoc((d) => ({ ...d, client: { ...d.client, [k]: v } }));
  const t = totals(doc); const dl = docLang(doc, profile); const ct = country(profile.country || "ZZ"); const O = { pay: true, ref: true, link: true, ...(doc.opts || {}) };
  const vatOn = +doc.tax_rate > 0 || (perLine && doc.items.some((i) => +i.tax > 0)); const vatName = ct.r === "ca" ? tr("TPS/TVH", "GST/HST") : ct.r === "us" ? tr("Taxe de vente", "Sales tax") : tr("TVA", "VAT");
  const rates = useMemo(() => { const r = [{ name: tr("Taux normal", "Standard"), rate: ct.vat || 0 }, ...(st.tax_rates || [])].filter((x) => +x.rate > 0); const seen = new Set(); return r.filter((x) => !seen.has(+x.rate) && seen.add(+x.rate)); }, [ct.code, st.tax_rates, lang]);
  const guess = useMemo(() => ai.trim().length > 4 ? parseDraft(ai) : null, [ai]);
  const K = doc.kind;
  async function draft(text = ai) {
    if (!text.trim()) return; setAiBusy(true); setAiMsg(null);
    let j = {}; try { const r = await fetch("/api/ai/draft", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text }) }); j = await r.json(); } catch { j = parseDraft(text); }
    setAiBusy(false);
    if (!j.items?.length) return setAiMsg({ bad: 1, t: tr("Aucun prix trouvé. Indiquez un montant, par ex. « logo à 150 000 ».", "No price found. Include an amount, e.g. “logo at 500”.") });
    setDoc((d) => { const kind = j.kind || d.kind; const keep = d.items.filter((i) => i.label || +i.price); return { ...d, kind, client: { ...d.client, ...Object.fromEntries(Object.entries(j.client || {}).filter(([, v]) => v)) }, items: [...keep, ...j.items.map(i => ({ label: i.label, qty: i.qty, price: i.price }))], currency: j.currency || d.currency, tax_rate: j.tax_rate ?? d.tax_rate, due_date: j.due_days ? plus(j.due_days) : d.due_date, status: kind === "receipt" ? "paid" : d.status }; });
    if (j.kind && onNumber) onNumber(j.kind);
    setAi(""); setAiMsg({ t: j.items.length > 1 ? tr(`${j.items.length} lignes ajoutées. Vérifiez-les ci-dessous.`, `${j.items.length} lines added. Check them below.`) : tr("Ligne ajoutée. Vérifiez-la ci-dessous.", "Line added. Check it below.") });
    setTimeout(() => document.querySelector(".lines-blk")?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 60);
  }
  const setKind = (k) => setDoc((d) => ({ ...d, kind: k, status: k === "receipt" ? "paid" : (d.status === "paid" ? "draft" : d.status), due_date: k === "receipt" ? null : (d.due_date || plus(k === "quote" ? (+st.quote_days || 30) : (+st.due_days || 15))), notes: d.notes && d.notes !== (st.notes || {})[d.kind] ? d.notes : ((st.notes || {})[k] || "") }));
  const dueChips = [[0, tr("À réception", "On receipt")], [7, tr("7 jours", "7 days")], [15, tr("15 jours", "15 days")], [30, tr("30 jours", "30 days")]];
  const form = (<div>
    <div className="blk">
      <div className="kseg" role="radiogroup" aria-label={tr("Type de document", "Document type")}>{["quote", "invoice", "receipt"].map((k, i) => { const h = KIND_HELP[k]; return <button type="button" role="radio" aria-checked={K === k} key={k} className={K === k ? "on" : ""} onClick={() => { setKind(k); onNumber && onNumber(k); }}>
        <span className="ks-n">{i + 1}</span><span className="ks-t"><b>{kindName(k, lang)}</b><small>{lang === "en" ? h[2] : h[0]} · {lang === "en" ? h[3] : h[1]}</small></span></button>; })}</div>
    </div>
    <div className="quick np">
      <div className="quick-h"><label htmlFor="q">{tr("Saisie rapide", "Quick entry")}</label><Mic lang={lang} onText={(x) => { setAi(x); setAiMsg(null); }} onDone={(x) => draft(x)} /></div>
      <textarea id="q" rows={2} value={ai} onChange={(e) => { setAi(e.target.value); setAiMsg(null); }} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) draft(); }} placeholder={tr("Ex. : création d'un logo 150 000 et 3 jours de formation à 60 000 pour Atlas Conseil, à payer sous 15 jours", "E.g. logo design 900 and 3 days of training at 400 for Northwind Ltd, due in 14 days")} />
      {guess?.items?.length > 0 && !aiMsg && <div className="q-prev" aria-live="polite">{guess.items.map((i, n) => <span key={n}>{i.qty > 1 ? `${i.qty} × ` : ""}{i.label}{+i.price ? <b className="mono"> {fmt(i.price, guess.currency || doc.currency, dl)}</b> : null}</span>)}{guess.client?.name && <span className="q-c">{tr("Client", "Client")} : {guess.client.name}</span>}</div>}
      <div className="quick-f"><span className={aiMsg?.bad ? "bad" : aiMsg ? "ok" : ""}>{aiMsg ? aiMsg.t : tr("Écrivez ou dictez ce que vous facturez. Les lignes sont ajoutées au document, vous pourrez les corriger.", "Type or dictate what you're billing. Lines are added to the document; you can edit them.")}</span>
        <button type="button" className="b s inv" onClick={() => draft()} disabled={aiBusy || !ai.trim()}>{aiBusy ? tr("Analyse…", "Reading…") : guess?.items?.length ? tr(`Ajouter ${guess.items.length > 1 ? `les ${guess.items.length} lignes` : "la ligne"}`, `Add ${guess.items.length > 1 ? `${guess.items.length} lines` : "line"}`) : tr("Ajouter au document", "Add to document")}</button></div>
    </div>
    <div className="blk">
      <h3>{K === "receipt" ? tr("Reçu de (client)", "Received from") : tr("Client", "Client")} {clients.length > 0 && <select className="inl" value="" onChange={(e) => { const c = clients.find(x => x.id === e.target.value); if (c) set("client", { name: c.name, email: c.email, phone: c.phone, address: c.address, tax_id: c.tax_id }); }}><option value="">{tr("Mes clients…", "My clients…")}</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}</h3>
      <label className="f"><span>{tr("Nom ou entreprise", "Name or company")}</span><input value={doc.client.name || ""} onChange={(e) => setClient("name", e.target.value)} placeholder={tr("Ex. : Atlas Conseil", "E.g. Northwind Ltd")} autoComplete="off" /></label>
      <div className="g2">
        <label className="f"><span>WhatsApp / {tr("tél.", "phone")}</span><input type="tel" inputMode="tel" value={doc.client.phone || ""} onChange={(e) => setClient("phone", e.target.value)} placeholder={tr("Pour l'envoi WhatsApp", "For WhatsApp sending")} /></label>
        <label className="f"><span>Email</span><input type="email" value={doc.client.email || ""} onChange={(e) => setClient("email", e.target.value)} /></label>
      </div>
    </div>
    <div className="blk lines-blk">
      <h3>{tr("Lignes", "Lines")} <span className="mono">{fmt(t.sub, doc.currency, dl)}</span></h3>
      {doc.items.map((it, i) => (<div className={`line ${perLine && vatOn ? "tx" : ""}`} key={i}>
        <input className="lbl-in" placeholder={tr("Désignation", "Description")} value={it.label} onChange={(e) => setItem(i, "label", e.target.value)} aria-label={tr("Désignation", "Description")} />
        <input type="number" inputMode="decimal" min="0" step="any" value={it.qty} onChange={(e) => setItem(i, "qty", e.target.value)} aria-label={tr("Quantité", "Quantity")} />
        <input type="number" inputMode="decimal" min="0" step="any" placeholder={tr("Prix", "Price")} value={it.price} onChange={(e) => setItem(i, "price", e.target.value)} aria-label={tr("Prix unitaire", "Unit price")} className="mono" />
        {perLine && vatOn && <select aria-label={tr("Taux de la ligne", "Line rate")} value={it.tax ?? ""} onChange={(e) => setItem(i, "tax", e.target.value === "" ? undefined : +e.target.value)}><option value="">{String(doc.tax_rate)} %</option><option value="0">0 %</option>{rates.filter(r => +r.rate !== +doc.tax_rate).map(r => <option key={r.rate} value={r.rate}>{r.rate} %</option>)}</select>}
        <button type="button" className="x" aria-label={tr("Supprimer la ligne", "Remove line")} onClick={() => set("items", doc.items.length > 1 ? doc.items.filter((_, n) => n !== i) : [{ label: "", qty: 1, price: "" }])}>×</button></div>))}
      <button type="button" className="b s o" onClick={() => set("items", [...doc.items, { label: "", qty: 1, price: "" }])}>+ {tr("Ajouter une ligne", "Add a line")}</button>
      <div className="g2" style={{ marginTop: 16 }}>
        <label className="f"><span>{tr("Devise", "Currency")} <Tip>{tr("Devise de votre pays par défaut. Modifiable pour un client étranger.", "Your country's currency by default. Change it for a foreign client.")}</Tip></span><select value={doc.currency} onChange={(e) => set("currency", e.target.value)}>{CURRENCIES.map(c => <option key={c.code} value={c.code}>{curLabel(c.code, lang)}</option>)}</select></label>
        <div className="f"><span>{vatName} <Tip>{tr("Non assujetti : laissez désactivé. La mention d'exonération est ajoutée au document.", "Not VAT-registered: leave off. The exemption line is added to the document.")}</Tip></span>
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
    {K === "invoice" && <div className="blk"><h3>{tr("Sur la facture", "On the invoice")} <Tip>{tr("Facultatif. Une facture peut ne comporter ni moyens de paiement ni référence.", "Optional. An invoice can have no payment details or reference.")}</Tip></h3>
      <label className="row chk"><input type="checkbox" checked={O.pay} onChange={(e) => setO("pay", e.target.checked)} />{tr("Afficher mes moyens de paiement", "Show my payment details")}</label>
      <label className="row chk"><input type="checkbox" checked={O.ref} onChange={(e) => setO("ref", e.target.checked)} />{tr("Afficher la référence de paiement", "Show the payment reference")}</label>
      {account && <label className="row chk"><input type="checkbox" checked={O.link} onChange={(e) => setO("link", e.target.checked)} />{tr("Inclure le lien en ligne dans le message", "Include the online link in the message")}</label>}</div>}
    <div className="blk">
      <button type="button" className="more" onClick={() => setMore(!more)} aria-expanded={more}><span>{tr("Plus d'options : numéro, date, remise, notes", "More options: number, date, discount, notes")}</span><span className="mono">{more ? "−" : "+"}</span></button>
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
    <TplPick doc={doc} setO={setO} profile={profile} setProfile={setProfile} account={account} />
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
function TplPick({ doc, setO, profile, setProfile, account }) {
  const { tr, lang } = useT(); const mine = (profile.settings || {}).templates || []; const look = (doc.opts || {}).look; const pro = profile.plan === "pro";
  const cur = account ? (look ? (look.lh_ref || look.name || look.template) : "__def") : (profile.template || "net");
  const pick = (id, l) => account ? setO("look", l) : setProfile({ ...profile, template: id });
  const base = (id) => ({ template: id, accent: profile.accent, font: profile.font, blocks: profile.blocks });
  return (<div className="blk"><h3>{tr("Modèle", "Template")}</h3>
    <div className="tpls">
      {account && <button type="button" className={cur === "__def" ? "on" : ""} onClick={() => pick(null, undefined)}><TplMini id={profile.template || "net"} accent={profile.accent} />{tr("Mon modèle", "My default")}</button>}
      {account && mine.map((t) => <button type="button" key={"m" + t.name} className={cur === t.name ? "on" : ""} onClick={() => { const { letterhead, ...rest } = t; pick(t.name, { ...rest, name: t.name, ...(letterhead ? { lh_ref: t.name } : {}) }); }}><TplMini id={t.template || "net"} accent={t.accent} />{t.name}</button>)}
      {TEMPLATES.map((x) => <button type="button" key={x.id} className={cur === x.id && (!account || (look && !look.name)) ? "on" : ""} onClick={() => pick(x.id, base(x.id))}><TplMini id={x.id} accent={profile.accent} />{lang === "en" ? x.en : x.name}</button>)}
    </div>
    {account ? <p className="tpl-note">{pro ? tr("Pro : modèles personnalisés illimités.", "Pro: unlimited custom templates.") : mine.length ? tr("Offre gratuite : 1 modèle personnalisé (utilisé). Pro : illimité.", "Free plan: 1 custom template (used). Pro: unlimited.") : tr("Offre gratuite : 1 modèle personnalisé disponible.", "Free plan: 1 custom template available.")} <a href="/app/parametres?t=modele">{mine.length ? tr("Gérer mes modèles", "Manage templates") : tr("Créer mon modèle", "Create my template")}</a></p>
      : <p className="tpl-note">{tr("Logo, couleurs et modèle personnalisé : disponibles avec un compte gratuit.", "Logo, colours and a custom template: available with a free account.")} <a href="/connexion?mode=signup&from=modele">{tr("Créer un compte", "Create an account")}</a></p>}
  </div>);
}
export function TplMini({ id, accent = "#111110" }) {
  const a = accent;
  if (id === "net") return <div className="mini" style={{ padding: 7 }}><div style={{ display: "flex", justifyContent: "space-between" }}><div style={{ height: 5, width: 22, background: "#222" }} /><div style={{ height: 5, width: 16, background: "#bbb" }} /></div><div style={{ marginTop: 7, height: 9, background: `${a}22`, borderLeft: `2px solid ${a}` }} /><div style={{ marginTop: 6, height: 2, background: "#ddd" }} /><div style={{ marginTop: 4, height: 2, background: "#eee" }} /></div>;
  if (id === "marche") return <div className="mini"><div style={{ background: a, height: 22 }} /><div style={{ margin: 6, height: 4, background: "#ddd", width: "60%" }} /><div style={{ margin: 6, height: 4, background: "#eee" }} /></div>;
  if (id === "registre") return <div className="mini" style={{ padding: 5 }}><div style={{ border: "1.5px solid #222", height: "100%", backgroundImage: "linear-gradient(#222 1px,transparent 1px)", backgroundSize: "100% 10px" }} /></div>;
  if (id === "sahel") return <div className="mini"><div style={{ margin: "8px 10px", fontSize: 15, fontWeight: 300, color: a }}>invoice.</div></div>;
  return <div className="mini"><div style={{ margin: "8px 8px 4px", height: 6, width: 36, background: a, marginLeft: "auto" }} /><div style={{ margin: 8, height: 3, background: "#ddd" }} /><div style={{ margin: 8, height: 3, background: "#eee" }} /></div>;
}
