"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import { useSession } from "../../../../lib/session";
import { useT } from "../../../../lib/i18n";
import { fmt, KINDS } from "../../../../lib/money";
import DocPaper from "../../../../components/DocPaper";
export default function View() {
  const { id } = useParams(); const s = useSession(); const r = useRouter(); const { t } = useT();
  const [doc, setDoc] = useState(null);
  const load = () => supabase.from("documents").select("*").eq("id", id).single().then(({ data }) => setDoc(data));
  useEffect(() => { load(); }, [id]);
  if (!doc) return <p className="muted">Chargement…</p>;
  const k = KINDS[doc.kind];
  async function status(st) { await supabase.from("documents").update({ status: st }).eq("id", id); load(); }
  async function del() { if (!confirm("Supprimer ce document ?")) return; await supabase.from("documents").delete().eq("id", id); r.replace("/app/documents"); }
  function wa() {
    const momo = (s.profile.momo || []).filter(m => m.number).map(m => `• ${m.op} : ${m.number}${m.name ? ` (${m.name})` : ""}`).join("\n");
    const lines = [`Bonjour ${doc.client?.name || ""},`, "",
      doc.kind === "receipt" ? `Voici votre reçu ${doc.number} d'un montant de *${fmt(doc.total, doc.currency)}*. Merci pour votre paiement !`
      : doc.kind === "quote" ? `Voici notre devis ${doc.number} d'un montant de *${fmt(doc.total, doc.currency)}*${doc.due_date ? `, valable jusqu'au ${new Date(doc.due_date).toLocaleDateString("fr-FR")}` : ""}.`
      : `Voici la facture ${doc.number} d'un montant de *${fmt(doc.total, doc.currency)}*${doc.due_date ? `, à régler avant le ${new Date(doc.due_date).toLocaleDateString("fr-FR")}` : ""}.`,
      ...(doc.kind === "invoice" && momo ? ["", "Vous pouvez payer par Mobile Money :", momo, `Référence : ${doc.number}`] : []),
      "", "Le PDF est joint à ce message.", "", s.profile.business_name || ""];
    const phone = (doc.client?.phone || "").replace(/[^\d]/g, "");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
    if (doc.status === "draft") status("sent");
  }
  return (<>
    <div className="head noprint">
      <div><Link href="/app/documents" className="muted">← {t("docs")}</Link><h1 style={{marginTop:6}}>{k.fr} {doc.number} <span className={`tag ${doc.status}`} style={{verticalAlign:"middle"}}>{t(doc.status)}</span></h1></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button className="btn" onClick={() => { document.title = `${k.fr}-${doc.number}`; window.print(); }}>{t("print")}</button>
        <button className="btn wa" onClick={wa}>{t("wa")}</button>
      </div></div>
    <div className="card noprint" style={{marginBottom:18,display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
      <span className="muted" style={{marginRight:6}}>Actions :</span>
      {doc.kind === "invoice" && doc.status !== "paid" && <button className="btn sm" onClick={() => status("paid")}>Marquer payée</button>}
      {doc.kind === "invoice" && doc.status === "paid" && <Link className="btn sm" href={`/app/documents/nouveau?kind=receipt&from=${doc.id}`}>Émettre le reçu</Link>}
      {doc.kind === "quote" && doc.status !== "accepted" && <button className="btn sm" onClick={() => status("accepted")}>Marquer accepté</button>}
      {doc.kind === "quote" && <Link className="btn sm clay" href={`/app/documents/nouveau?kind=invoice&from=${doc.id}`}>Transformer en facture</Link>}
      <Link className="btn ghost sm" href={`/app/documents/nouveau?kind=${doc.kind}&from=${doc.id}`}>Dupliquer</Link>
      <Link className="btn ghost sm" href={`/app/documents/nouveau?id=${doc.id}`}>Modifier</Link>
      <button className="btn ghost sm" style={{marginLeft:"auto",color:"var(--warn)",borderColor:"var(--warn)"}} onClick={del}>Supprimer</button>
    </div>
    <DocPaper doc={doc} profile={s.profile}/>
    <p className="muted noprint" style={{textAlign:"center",fontSize:13}}>Astuce : dans la fenêtre d'impression, choisissez « Enregistrer au format PDF ».</p>
  </>);
}
