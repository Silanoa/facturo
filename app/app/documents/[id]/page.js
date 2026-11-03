"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { fmt, KINDS, kindName } from "../../../../lib/money";
import { effStatus, statusName, shareText, waLink, mailLink, publicUrl, daysLate } from "../../../../lib/share";
import { reminder, TONES } from "../../../../lib/reminders";
import { useT } from "../../../../lib/i18n";
import DocPaper from "../../../../components/DocPaper";
import { ICopy, IDown, IBell, ILink } from "../../../../components/Icons";
const when = (x, l) => new Date(x).toLocaleString(l === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function View() {
  const { id } = useParams(); const s = useSession(); const r = useRouter(); const q = useSearchParams(); const { tr, lang } = useT();
  const [doc, setDoc] = useState(null); const [tone, setTone] = useState("douce"); const [msg, setMsg] = useState(""); const [polish, setPolish] = useState(false);
  const load = () => supabase.from("documents").select("*").eq("id", id).single().then(({ data }) => setDoc(data));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (doc) setMsg(reminder(doc, s.profile, tone, publicUrl(doc), doc.lang || s.profile.doc_lang)); }, [doc?.id, tone]);
  if (!doc) return <div className="u">…</div>;
  const k = { fr: kindName(doc.kind, lang) }; const dl = doc.lang || s.profile.doc_lang || "fr"; const st = effStatus(doc); const link = publicUrl(doc); const late = daysLate(doc);
  async function status(v) { await supabase.from("documents").update({ status: v, ...(v !== "paid" ? {} : {}) }).eq("id", id); s.toast(v === "paid" ? tr("Marquée payée", "Marked paid") : tr("Statut mis à jour", "Status updated")); load(); }
  async function del() { if (!confirm(tr("Supprimer définitivement ce document ?", "Delete this document permanently?"))) return; await supabase.from("documents").delete().eq("id", id); r.replace("/app/documents"); }
  const copy = async (t, m) => { try { await navigator.clipboard.writeText(t); s.toast(m); } catch { prompt("Copy:", t); } };
  const send = () => { window.open(waLink(doc.client?.phone, shareText(doc, s.profile, dl)), "_blank"); if (doc.status === "draft") status("sent"); };
  async function improve() { setPolish(true); const j = await fetch("/api/ai/reminder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: msg, context: `${late} days late` }) }).then(r => r.json()).catch(() => ({})); setPolish(false); if (j.engine === "ai") setMsg(j.text); else s.toast(tr("Reformulation IA non activée", "AI rewrite not enabled")); }
  return (<div className="in">
    <div className="ph np">
      <div><Link href="/app/documents" className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>← Documents</Link>
        <h1 style={{ marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{k.fr} <span className="mono" style={{ fontSize: ".62em", fontWeight: 500 }}>{doc.number}</span> <span className={`pill ${st}`} style={{ fontFamily: "var(--f-body)", letterSpacing: 0 }}>{statusName(st, lang)}</span></h1>
        <p className="mute" style={{ margin: "6px 0 0" }}>{doc.client?.name || "—"} · <b className="mono" style={{ color: "var(--ink)" }}>{fmt(doc.total, doc.currency)}</b>{doc.viewed_at && <> · {tr("vue le", "viewed")} {when(doc.viewed_at, lang)}</>}</p></div>
      <div className="row" style={{ flexWrap: "wrap" }}><button className="b o" onClick={() => { document.title = `${doc.number}`; window.print(); }}><IDown width="17" height="17" /> PDF</button><a className="b o" href={mailLink(doc.client?.email, `${kindName(doc.kind, dl)} ${doc.number}`, shareText(doc, s.profile, dl))} onClick={() => doc.status === "draft" && status("sent")}>Email</a><button className="b wa" onClick={send}>{tr("Envoyer sur WhatsApp", "Send on WhatsApp")}</button></div>
    </div>
    {q.get("new") && <div className="note ok np" style={{ marginBottom: 16 }}><b>{tr("C'est prêt.", "Ready.")}</b> {tr("Envoyez-la par WhatsApp ou email : votre client reçoit un lien pour la voir, la télécharger et vous payer.", "Send it by WhatsApp or email: your client gets a link to view, download and pay.")}</div>}
    {st === "declared" && <div className="note ok np" style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}><span><b>{doc.client?.name || tr("Le client", "The client")} {tr("indique avoir payé", "says they paid")}</b> {when(doc.declared_paid_at, lang)}{doc.declared_note ? <> — « {doc.declared_note} »</> : ""}. {tr("Vérifiez votre compte.", "Check your account.")}</span><button className="b s" onClick={() => status("paid")}>{tr("Confirmer le paiement", "Confirm payment")}</button></div>}
    <div className="vgrid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "start" }}>
      <div className="sheet-stack"><DocPaper doc={doc} profile={s.profile} /></div>
      <aside className="np" style={{ display: "grid", gap: 14 }}>
        {link && <div className="panel"><div className="u row" style={{ gap: 6 }}><ILink width="15" height="15" /> {tr("Lien de paiement", "Payment link")}</div>
          <div className="mono" style={{ fontSize: 13, margin: "10px 0 12px", wordBreak: "break-all", color: "var(--ink-2)" }}>{link.replace(/^https?:\/\//, "")}</div>
          <div className="row"><button className="b s o" onClick={() => copy(link, tr("Lien copié", "Link copied"))}><ICopy width="16" height="16" /> {tr("Copier", "Copy")}</button><a className="b s o" href={link} target="_blank" rel="noreferrer">{tr("Ouvrir", "Open")}</a></div>
          <p className="mute" style={{ fontSize: 13.5, margin: "12px 0 0" }}>{doc.viewed_at ? `${tr("Ouverte par le client le", "Opened by client on")} ${when(doc.viewed_at, lang)}.` : tr("Pas encore ouverte par le client.", "Not opened by the client yet.")}</p></div>}
        <div className="panel"><div className="u">Actions</div><div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {doc.kind === "invoice" && doc.status !== "paid" && <button className="b s" onClick={() => status("paid")}>{tr("Marquer payée", "Mark as paid")}</button>}
          {doc.kind === "invoice" && doc.status === "paid" && <Link className="b s" href={`/app/documents/nouveau?kind=receipt&from=${doc.id}`}>{tr("Émettre le reçu", "Issue receipt")}</Link>}
          {doc.kind === "quote" && doc.status !== "accepted" && <button className="b s o" onClick={() => status("accepted")}>{tr("Marquer accepté", "Mark accepted")}</button>}
          {doc.kind === "quote" && <Link className="b s k" href={`/app/documents/nouveau?kind=invoice&from=${doc.id}`}>{tr("Transformer en facture", "Convert to invoice")}</Link>}
          <div className="row"><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?id=${doc.id}`}>{tr("Modifier", "Edit")}</Link><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?kind=${doc.kind}&from=${doc.id}`}>{tr("Dupliquer", "Duplicate")}</Link></div>
          <button className="lnk" style={{ color: "var(--late)", justifySelf: "start", marginTop: 4, fontSize: 14 }} onClick={del}>{tr("Supprimer", "Delete")}</button></div></div>
        {doc.kind === "invoice" && doc.status !== "paid" && doc.status !== "draft" && <div className="panel"><div className="u row" style={{ gap: 6 }}><IBell width="15" height="15" /> {tr("Relance", "Reminder")}{late ? ` · ${late} ${tr("j de retard", "days late")}` : ""}</div>
          <div className="seg" style={{ margin: "12px 0" }}>{Object.entries(TONES).map(([v, l]) => <button key={v} className={tone === v ? "on" : ""} onClick={() => setTone(v)}>{lang === "en" ? l[1] : l[0]}</button>)}</div>
          <textarea rows={8} value={msg} onChange={(e) => setMsg(e.target.value)} style={{ fontSize: 14 }} />
          <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}><a className="b s wa" target="_blank" rel="noreferrer" href={waLink(doc.client?.phone, msg)}>{tr("Relancer sur WhatsApp", "Remind on WhatsApp")}</a><a className="b s o" href={mailLink(doc.client?.email, `${tr("Rappel", "Reminder")} ${doc.number}`, msg)}>Email</a></div></div>}
      </aside>
    </div>
    <style>{`@media(max-width:1100px){.vgrid{grid-template-columns:1fr!important}}`}</style>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><View /></Suspense>; }
