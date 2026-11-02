"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { fmt, KINDS } from "../../../../lib/money";
import { effStatus, STATUS, shareText, waLink, publicUrl, daysLate } from "../../../../lib/share";
import { reminder, TONES } from "../../../../lib/reminders";
import DocPaper from "../../../../components/DocPaper";
import { ICopy, IDown, IBell, ILink } from "../../../../components/Icons";
const when = (x) => new Date(x).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
function View() {
  const { id } = useParams(); const s = useSession(); const r = useRouter(); const q = useSearchParams();
  const [doc, setDoc] = useState(null); const [tone, setTone] = useState("douce"); const [msg, setMsg] = useState(""); const [polish, setPolish] = useState(false);
  const load = () => supabase.from("documents").select("*").eq("id", id).single().then(({ data }) => setDoc(data));
  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (doc) setMsg(reminder(doc, s.profile, tone, publicUrl(doc))); }, [doc?.id, tone]);
  if (!doc) return <div className="u">Chargement</div>;
  const k = KINDS[doc.kind]; const st = effStatus(doc); const link = publicUrl(doc); const late = daysLate(doc);
  async function status(v) { await supabase.from("documents").update({ status: v, ...(v !== "paid" ? {} : {}) }).eq("id", id); s.toast(v === "paid" ? "Marquée payée" : "Statut mis à jour"); load(); }
  async function del() { if (!confirm("Supprimer définitivement ce document ?")) return; await supabase.from("documents").delete().eq("id", id); r.replace("/app/documents"); }
  const copy = async (t, m) => { try { await navigator.clipboard.writeText(t); s.toast(m); } catch { prompt("Copiez :", t); } };
  const send = () => { window.open(waLink(doc.client?.phone, shareText(doc, s.profile)), "_blank"); if (doc.status === "draft") status("sent"); };
  async function improve() { setPolish(true); const j = await fetch("/api/ai/reminder", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: msg, context: `${late} jours de retard` }) }).then(r => r.json()).catch(() => ({})); setPolish(false); if (j.engine === "ai") setMsg(j.text); else s.toast("Reformulation IA non activée — le modèle reste utilisable tel quel"); }
  return (<div className="in">
    <div className="ph np">
      <div><Link href="/app/documents" className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>← Documents</Link>
        <h1 style={{ marginTop: 6, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{k.fr} <span className="mono" style={{ fontSize: ".62em", fontWeight: 500 }}>{doc.number}</span> <span className={`pill ${st}`} style={{ fontFamily: "var(--f-body)", letterSpacing: 0 }}>{STATUS[st]}</span></h1>
        <p className="mute" style={{ margin: "6px 0 0" }}>{doc.client?.name || "Sans client"} · <b className="mono" style={{ color: "var(--ink)" }}>{fmt(doc.total, doc.currency)}</b>{doc.viewed_at && <> · vue le {when(doc.viewed_at)}</>}</p></div>
      <div className="row" style={{ flexWrap: "wrap" }}><button className="b o" onClick={() => { document.title = `${k.fr}-${doc.number}`; window.print(); }}><IDown width="17" height="17" /> PDF</button><button className="b wa" onClick={send}>Envoyer sur WhatsApp</button></div>
    </div>
    {q.get("new") && <div className="note ok np" style={{ marginBottom: 16 }}><b>C'est prêt.</b> Envoyez-la sur WhatsApp : votre client reçoit un lien pour voir la facture, la télécharger et payer par Mobile Money.</div>}
    {st === "declared" && <div className="note ok np" style={{ marginBottom: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }}><span><b>{doc.client?.name || "Le client"} indique avoir payé</b> le {when(doc.declared_paid_at)}{doc.declared_note ? <> — « {doc.declared_note} »</> : ""}. Vérifiez votre compte Mobile Money.</span><button className="b s" onClick={() => status("paid")}>Confirmer le paiement</button></div>}
    <div className="vgrid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 340px", gap: 24, alignItems: "start" }}>
      <DocPaper doc={doc} profile={s.profile} />
      <aside className="np" style={{ display: "grid", gap: 14 }}>
        {link && <div className="panel"><div className="u row" style={{ gap: 6 }}><ILink width="15" height="15" /> Lien de paiement</div>
          <div className="mono" style={{ fontSize: 13, margin: "10px 0 12px", wordBreak: "break-all", color: "var(--ink-2)" }}>{link.replace(/^https?:\/\//, "")}</div>
          <div className="row"><button className="b s o" onClick={() => copy(link, "Lien copié")}><ICopy width="16" height="16" /> Copier</button><a className="b s o" href={link} target="_blank" rel="noreferrer">Ouvrir</a></div>
          <p className="mute" style={{ fontSize: 13.5, margin: "12px 0 0" }}>{doc.viewed_at ? `Ouverte par le client le ${when(doc.viewed_at)}.` : "Pas encore ouverte par le client."}</p></div>}
        <div className="panel"><div className="u">Actions</div><div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {doc.kind === "invoice" && doc.status !== "paid" && <button className="b s" onClick={() => status("paid")}>Marquer payée</button>}
          {doc.kind === "invoice" && doc.status === "paid" && <Link className="b s" href={`/app/documents/nouveau?kind=receipt&from=${doc.id}`}>Émettre le reçu</Link>}
          {doc.kind === "quote" && doc.status !== "accepted" && <button className="b s o" onClick={() => status("accepted")}>Marquer accepté</button>}
          {doc.kind === "quote" && <Link className="b s k" href={`/app/documents/nouveau?kind=invoice&from=${doc.id}`}>Transformer en facture</Link>}
          <div className="row"><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?id=${doc.id}`}>Modifier</Link><Link className="b s o" style={{ flex: 1 }} href={`/app/documents/nouveau?kind=${doc.kind}&from=${doc.id}`}>Dupliquer</Link></div>
          <button className="lnk" style={{ color: "var(--kola)", justifySelf: "start", marginTop: 4, fontSize: 14 }} onClick={del}>Supprimer</button></div></div>
        {doc.kind === "invoice" && doc.status !== "paid" && doc.status !== "draft" && <div className="panel"><div className="u row" style={{ gap: 6 }}><IBell width="15" height="15" /> Relance{late ? ` · ${late} j de retard` : ""}</div>
          <div className="seg" style={{ margin: "12px 0" }}>{Object.entries(TONES).map(([v, l]) => <button key={v} className={tone === v ? "on" : ""} onClick={() => setTone(v)}>{l}</button>)}</div>
          <textarea rows={8} value={msg} onChange={(e) => setMsg(e.target.value)} style={{ fontSize: 14 }} />
          <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}><a className="b s wa" target="_blank" rel="noreferrer" href={waLink(doc.client?.phone, msg)}>Relancer sur WhatsApp</a><button className="b s o" onClick={improve} disabled={polish}>{polish ? "…" : "Personnaliser"}</button></div></div>}
      </aside>
    </div>
    <style>{`@media(max-width:1100px){.vgrid{grid-template-columns:1fr!important}}`}</style>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><View /></Suspense>; }
