"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { fmt, KINDS, kindName } from "../../../../lib/money";
import { effStatus, statusName, shareText, waLink, mailLink, publicUrl, daysLate, balance, docOpts } from "../../../../lib/share";
import { reminder, reminderSubject, TONES } from "../../../../lib/reminders";
import { useT } from "../../../../lib/i18n";
import DocPaper, { PAY_METHODS } from "../../../../components/DocPaper";
import { ICopy, IDown, IBell, ILink } from "../../../../components/Icons";
const when = (x, l) => new Date(x).toLocaleString(l === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function View() {
  const { id } = useParams(); const s = useSession(); const r = useRouter(); const q = useSearchParams(); const { tr, lang } = useT();
  const [doc, setDoc] = useState(null); const [tone, setTone] = useState("douce"); const [msg, setMsg] = useState(""); const [polish, setPolish] = useState(false);
  const load = () => supabase.from("documents").select("*").eq("id", id).single().then(({ data }) => setDoc(data));
  const [live, setLive] = useState(false); const [pay, setPay] = useState(null);
  useEffect(() => { load();
    // Temps réel : le client accepte un devis ou déclare un paiement → la page se met à jour seule.
    const ch = supabase.channel(`doc-${id}-${Math.random().toString(36).slice(2, 7)}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "documents", filter: `id=eq.${id}` }, (p) => {
      setDoc((d) => ({ ...d, ...p.new })); })
      .subscribe((x) => setLive(x === "SUBSCRIBED"));
    const poll = setInterval(() => { if (document.visibilityState === "visible") load(); }, 20000);
    const vis = () => document.visibilityState === "visible" && load(); document.addEventListener("visibilitychange", vis);
    return () => { supabase.removeChannel(ch); clearInterval(poll); document.removeEventListener("visibilitychange", vis); }; }, [id]);
  useEffect(() => { if (doc) setMsg(reminder(doc, s.profile, tone, publicUrl(doc), doc.lang || s.profile.doc_lang)); }, [doc?.id, tone]);
  if (!doc) return <div className="u">…</div>;
  const k = { fr: kindName(doc.kind, lang) }; const dl = doc.lang || s.profile.doc_lang || "fr"; const st = effStatus(doc); const link = publicUrl(doc); const late = daysLate(doc);
  async function status(v, extra = {}) { const { data, error } = await supabase.from("documents").update({ status: v, ...extra }).eq("id", id).select().single();
    if (error) return s.toast(error.message, "err"); setDoc(data); setPay(null); s.toast(v === "paid" ? (doc.kind === "quote" ? tr("Statut mis à jour", "Status updated") : tr("Marquée payée", "Marked paid")) : tr("Statut mis à jour", "Status updated")); }
  const addPay = () => { const amt = +pay.amount || 0; if (amt <= 0) return; const paid = (+doc.paid_amount || 0) + amt; const payments = [...(doc.payments || []), { amount: amt, date: pay.date, method: pay.method }];
    status(paid >= +doc.total ? "paid" : "partial", { paid_amount: paid, payments, paid_at: paid >= +doc.total ? new Date(pay.date).toISOString() : null }); };
  const M = PAY_METHODS[lang === "en" ? "en" : "fr"]; const bal = balance(doc);
  // Changements de statut cohérents : pas de paiement fantôme, confirmation avant d'annuler.
  function setSt(v) {
    if (v === doc.status) return; const paidAmt = +doc.paid_amount || 0;
    if (v === "partial") return setPay({ amount: "", date: new Date().toISOString().slice(0, 10), method: M[0] });
    if (v === "paid" && isI) return status("paid", { paid_amount: +doc.total, paid_at: new Date().toISOString(), payments: +doc.total - paidAmt > 0 ? [...(doc.payments || []), { amount: +doc.total - paidAmt, date: new Date().toISOString().slice(0, 10), method: "", mark: true }] : (doc.payments || []) });
    if (v === "sent" && isI && paidAmt > 0) { if (!confirm(tr("Repasser en « Non payée » efface les paiements enregistrés sur cette facture. Continuer ?", "Setting it back to “Unpaid” clears the payments recorded on this invoice. Continue?"))) return; return status("sent", { paid_amount: 0, payments: [], paid_at: null }); }
    if (v === "cancelled") { const msg = isQ ? tr("Annuler ce devis ? Le client ne pourra plus l'accepter.", "Cancel this quote? The client will no longer be able to accept it.") : paidAmt > 0 ? tr(`Cette facture a déjà reçu ${fmt(paidAmt, doc.currency, lang)}. Une fois annulée, elle n'est plus due ; le paiement reste dans l'historique. Pour rembourser, émettez un document séparé. Annuler la facture ?`, `This invoice has already received ${fmt(paidAmt, doc.currency, lang)}. Once cancelled it is no longer due; the payment stays in the history. Cancel it?`) : tr("Annuler cette facture ? Elle restera dans vos documents avec la mention « Annulée ».", "Cancel this invoice? It stays in your documents marked “Cancelled”."); if (!confirm(msg)) return; }
    status(v);
  }
  async function del() { if (!confirm(tr("Supprimer définitivement ce document ?", "Delete this document permanently?"))) return; await supabase.from("documents").delete().eq("id", id); r.replace("/app/documents"); }
  const copy = async (t, m) => { try { await navigator.clipboard.writeText(t); s.toast(m); } catch { prompt("Copy:", t); } };
  const send = () => { window.open(waLink(doc.client?.phone, shareText(doc, s.profile, dl)), "_blank"); if (doc.status === "draft") status("sent"); };
  const isQ = doc.kind === "quote", isI = doc.kind === "invoice", isR = doc.kind === "receipt";
  async function improve() { setPolish(true); const j = await fetch("/api/ai/reminder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: msg, context: `${late} days late` }) }).then(r => r.json()).catch(() => ({})); setPolish(false); if (j.engine === "ai") setMsg(j.text); else s.toast(tr("Reformulation IA non activée", "AI rewrite not enabled")); }
  return (<div className="in">
    <div className="ph np">
      <div><Link href="/app/documents" className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>← Documents</Link>
        <h1 style={{ marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{k.fr} <span className="mono" style={{ fontSize: ".62em", fontWeight: 500 }}>{doc.number}</span> <span className={`pill ${st}`} style={{ fontFamily: "var(--f-body)", letterSpacing: 0 }}>{statusName(st, lang, doc.kind)}</span></h1>
        <p className="mute" style={{ margin: "6px 0 0" }}>{doc.client?.name || "—"} · <b className="mono" style={{ color: "var(--ink)" }}>{fmt(doc.total, doc.currency, lang)}</b>{doc.status === "partial" && <> · {tr("reste", "due")} <b className="mono">{fmt(bal, doc.currency, lang)}</b></>}{doc.viewed_at && <> · {tr("vue le", "viewed")} {when(doc.viewed_at, lang)}</>}{live && <span className="live-ind" title={tr("Mise à jour en direct", "Live updates")}> · <i />{tr("en direct", "live")}</span>}</p></div>
      <div className="row" style={{ flexWrap: "wrap" }}><button className="b o" onClick={() => { document.title = `${doc.number}`; window.print(); }}><IDown width="17" height="17" /> PDF</button><a className="b o" href={mailLink(doc.client?.email, `${kindName(doc.kind, dl)} ${doc.number}${s.profile.business_name ? ` — ${s.profile.business_name}` : ""}`, shareText(doc, s.profile, dl))} onClick={() => doc.status === "draft" && status("sent")}>Email</a><button className="b wa" onClick={send}>{tr("Envoyer sur WhatsApp", "Send on WhatsApp")}</button></div>
    </div>
    {q.get("new") && <div className="note ok np" style={{ marginBottom: 16 }}><b>{tr("C'est prêt.", "Ready.")}</b> {isQ ? tr("Envoyez-le par WhatsApp ou email. Votre client peut l'accepter en ligne ; vous le verrez ici sans recharger.", "Send it by WhatsApp or email. Your client can accept it online; you'll see it here without reloading.") : isR ? tr("Le reçu est la preuve du paiement. Partagez-le ou téléchargez le PDF.", "The receipt is proof of payment. Share it or download the PDF.") : tr("Envoyez-la par WhatsApp, email ou en PDF. Vous changez vous-même le statut quand vous êtes payé.", "Send it by WhatsApp, email or as a PDF. You update the status yourself once paid.")}</div>}
    {doc.declared_paid_at && !['paid','cancelled'].includes(doc.status) && <div className="note ok np" style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}><span><b>{doc.client?.name || tr("Le client", "The client")} {tr("indique avoir payé", "says they paid")}</b> {when(doc.declared_paid_at, lang)}{doc.declared_note ? <> — « {doc.declared_note} »</> : ""}. {tr("Vérifiez votre compte.", "Check your account.")}</span><div className="row"><button className="b s" onClick={() => status("paid", { paid_amount: +doc.total, paid_at: new Date().toISOString(), payments: +doc.total - (+doc.paid_amount || 0) > 0 ? [...(doc.payments || []), { amount: +doc.total - (+doc.paid_amount || 0), date: new Date().toISOString().slice(0, 10), method: "", mark: true }] : (doc.payments || []) })}>{tr("Confirmer le paiement", "Confirm payment")}</button><button className="b s o" onClick={() => status(doc.status === "partial" ? "partial" : "sent", { declared_paid_at: null, declared_note: null })}>{tr("Pas encore reçu", "Not received yet")}</button></div></div>}
    <div className="vgrid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "start" }}>
      <div className="sheet-stack"><DocPaper doc={doc} profile={s.profile} /></div>
      <aside className="np" style={{ display: "grid", gap: 14 }}>
        {link && docOpts(doc).link !== false && <div className="panel"><div className="u row" style={{ gap: 6 }}><ILink width="15" height="15" /> {isQ ? tr("Lien du devis", "Quote link") : isR ? tr("Lien du reçu", "Receipt link") : tr("Lien de la facture", "Invoice link")}</div>
          <div className="mono" style={{ fontSize: 13, margin: "10px 0 12px", wordBreak: "break-all", color: "var(--ink-2)" }}>{link.replace(/^https?:\/\//, "")}</div>
          <div className="row"><button className="b s o" onClick={() => copy(link, tr("Lien copié", "Link copied"))}><ICopy width="16" height="16" /> {tr("Copier", "Copy")}</button><a className="b s o" href={link} target="_blank" rel="noreferrer">{tr("Ouvrir", "Open")}</a></div>
          <p className="mute" style={{ fontSize: 13.5, margin: "12px 0 0" }}>{isQ && doc.accepted_at ? `${tr("Accepté en ligne le", "Accepted online on")} ${when(doc.accepted_at, lang)}.` : doc.viewed_at ? `${isI ? tr("Ouverte par le client le", "Opened by the client on") : tr("Ouvert par le client le", "Opened by the client on")} ${when(doc.viewed_at, lang)}.` : isI ? tr("Pas encore ouverte par le client.", "Not opened by the client yet.") : tr("Pas encore ouvert par le client.", "Not opened by the client yet.")}</p></div>}
        <div className="panel"><div className="u">{tr("Statut", "Status")}</div>
          {!isR && <div className="stgrid">{(isQ ? [["sent", tr("Envoyé", "Sent")], ["accepted", tr("Accepté", "Accepted")], ["declined", tr("Refusé", "Declined")], ["cancelled", tr("Annulé", "Cancelled")]]
            : [["sent", tr("Non payée", "Unpaid")], ["partial", tr("Partielle", "Part paid")], ["paid", tr("Payée", "Paid")], ["cancelled", tr("Annulée", "Cancelled")]]).map(([v, l]) =>
            <button key={v} aria-pressed={doc.status === v} className={`stb ${v} ${doc.status === v ? "on" : ""}`} onClick={() => setSt(v)}>{l}</button>)}</div>}
          {isI && st === "late" && <p className="hint" style={{ margin: "8px 0 0" }}>{tr(`En retard de ${late} j — l'échéance est dépassée.`, `${late} days overdue.`)}</p>}
          {isQ && doc.status === "invoiced" && <p className="hint" style={{ margin: "8px 0 0" }}>{tr("Ce devis a été transformé en facture.", "This quote was converted to an invoice.")}</p>}
          {isR && <p className="hint" style={{ margin: "8px 0 0" }}>{tr("Un reçu atteste un paiement déjà reçu : il est toujours « payé ».", "A receipt proves a payment already received: it is always “paid”.")}</p>}
          {pay && <div className="paybox"><div className="g2"><label className="f"><span>{tr("Montant reçu", "Amount received")}</span><input type="number" inputMode="decimal" autoFocus value={pay.amount} placeholder={String(bal)} onChange={(e) => setPay({ ...pay, amount: e.target.value })} /></label>
            <label className="f"><span>Date</span><input type="date" value={pay.date} onChange={(e) => setPay({ ...pay, date: e.target.value })} /></label></div>
            <label className="f"><span>{tr("Moyen", "Method")}</span><select value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>{M.map((m) => <option key={m}>{m}</option>)}</select></label>
            <div className="row"><button className="b s" onClick={addPay}>{tr("Enregistrer le paiement", "Record payment")}</button><button className="b s o" onClick={() => setPay(null)}>{tr("Annuler", "Cancel")}</button></div></div>}
          {isI && (doc.payments || []).length > 0 && <ul className="paylog">{doc.payments.map((p, i) => <li key={i}><span>{new Date(p.date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR")}{p.method ? ` · ${p.method}` : p.mark ? ` · ${tr("Marquée payée", "Marked paid")}` : ""}</span><b className="mono">{fmt(p.amount, doc.currency, lang)}</b></li>)}</ul>}
          {isI && ["sent", "partial", "draft"].includes(doc.status) && !pay && <button className="lnk" style={{ fontSize: 14, marginTop: 10 }} onClick={() => setPay({ amount: "", date: new Date().toISOString().slice(0, 10), method: M[0] })}>+ {tr("Enregistrer un paiement reçu", "Record a payment received")}</button>}
        </div>
        <div className="panel"><div className="u">Actions</div><div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {isI && ["paid", "partial"].includes(doc.status) && <Link className="b s" href={`/app/documents/nouveau?kind=receipt&from=${doc.id}`}>{doc.status === "partial" ? tr("Reçu pour l'acompte", "Receipt for the deposit") : tr("Émettre le reçu", "Issue receipt")}</Link>}
          {isQ && doc.status !== "invoiced" && <Link className={`b s ${doc.status === "accepted" ? "" : "o"}`} href={`/app/documents/nouveau?kind=invoice&from=${doc.id}`}>{tr("Transformer en facture", "Convert to invoice")}</Link>}
          <div className="row"><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?id=${doc.id}`}>{tr("Modifier", "Edit")}</Link><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?kind=${doc.kind}&from=${doc.id}`}>{tr("Dupliquer", "Duplicate")}</Link></div>
          <button className="lnk" style={{ color: "var(--late)", justifySelf: "start", marginTop: 4, fontSize: 14 }} onClick={del}>{tr("Supprimer", "Delete")}</button></div></div>
        {isI && ["sent", "partial"].includes(doc.status) && <div className="panel"><div className="u row" style={{ gap: 6 }}><IBell width="15" height="15" /> {tr("Relance", "Reminder")}{late ? ` · ${late} ${tr("j de retard", "days late")}` : ""}</div>
          <div className="seg" style={{ margin: "12px 0" }}>{Object.entries(TONES).map(([v, l]) => <button key={v} className={tone === v ? "on" : ""} onClick={() => setTone(v)}>{lang === "en" ? l[1] : l[0]}</button>)}</div>
          <textarea rows={8} value={msg} onChange={(e) => setMsg(e.target.value)} style={{ fontSize: 14 }} />
          <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}><a className="b s wa" target="_blank" rel="noreferrer" href={waLink(doc.client?.phone, msg)}>{tr("Relancer sur WhatsApp", "Remind on WhatsApp")}</a><a className="b s o" href={mailLink(doc.client?.email, reminderSubject(doc, tone, dl), msg)}>Email</a></div></div>}
      </aside>
    </div>
    <style dangerouslySetInnerHTML={{ __html: `@media(max-width:1100px){.vgrid{grid-template-columns:1fr!important}}` }} />
  </div>);
}
export default function Page() { return <Suspense fallback={null}><View /></Suspense>; }
