"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useT } from "../../../lib/i18n";
import { fmt, KINDS } from "../../../lib/money";
export default function Docs() {
  const { t } = useT(); const [docs, setDocs] = useState(null); const [f, setF] = useState("all"); const [q, setQ] = useState("");
  useEffect(() => { supabase.from("documents").select("*").order("created_at", { ascending: false }).then(({ data }) => setDocs(data || [])); }, []);
  function csv() {
    const rows = [["Numero","Type","Statut","Client","Date","Devise","Total"], ...docs.map(d => [d.number, KINDS[d.kind].fr, d.status, d.client?.name || "", d.issue_date, d.currency, d.total])];
    const b = new Blob(["\ufeff" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(";")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "facturo-export.csv"; a.click();
  }
  const list = (docs || []).filter(d => (f === "all" || d.kind === f) && (!q || (d.number + " " + (d.client?.name || "")).toLowerCase().includes(q.toLowerCase())));
  return (<>
    <div className="head"><h1>{t("docs")}</h1><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      {docs?.length > 0 && <button className="btn ghost" onClick={csv}>Export CSV</button>}
      <Link href="/app/documents/nouveau?kind=receipt" className="btn ghost">{t("newRec")}</Link>
      <Link href="/app/documents/nouveau?kind=quote" className="btn ghost">{t("newQuote")}</Link>
      <Link href="/app/documents/nouveau" className="btn clay">{t("newInv")}</Link></div></div>
    <div className="card">
      <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap"}}>
        {[["all","Tous"],["invoice","Factures"],["quote","Devis"],["receipt","Reçus"]].map(([k,l]) => <button key={k} onClick={() => setF(k)} className={`btn sm ${f === k ? "" : "ghost"}`}>{l}</button>)}
        <input placeholder="Rechercher un numéro ou un client…" value={q} onChange={e => setQ(e.target.value)} style={{maxWidth:300,marginLeft:"auto"}}/>
      </div>
      {!docs ? <p className="muted">Chargement…</p> : list.length === 0 ? <p className="muted">Rien à afficher.</p> :
      <table className="list"><thead><tr><th>Numéro</th><th>Type</th><th>Client</th><th>Date</th><th>Statut</th><th style={{textAlign:"right"}}>Total</th></tr></thead>
        <tbody>{list.map(d => <tr key={d.id}><td><Link href={`/app/documents/${d.id}`}><b>{d.number}</b></Link></td><td>{KINDS[d.kind].fr}</td><td>{d.client?.name}</td><td>{new Date(d.issue_date).toLocaleDateString("fr-FR")}</td><td><span className={`tag ${d.status}`}>{t(d.status)}</span></td><td style={{textAlign:"right"}}>{fmt(d.total, d.currency)}</td></tr>)}</tbody></table>}
    </div></>);
}
