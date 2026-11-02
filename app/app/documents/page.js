"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { fmt, KINDS } from "../../../lib/money";
import { effStatus, STATUS, initials, avColor } from "../../../lib/share";
import { IPlus } from "../../../components/Icons";
const F = [["all", "Tout"], ["open", "À encaisser"], ["late", "En retard"], ["invoice", "Factures"], ["quote", "Devis"], ["receipt", "Reçus"]];
function Docs() {
  const sp = useSearchParams(); const [docs, setDocs] = useState(null); const [f, setF] = useState(sp.get("f") || "all"); const [q, setQ] = useState("");
  useEffect(() => { supabase.from("documents").select("*").order("issue_date", { ascending: false }).order("number", { ascending: false }).then(({ data }) => setDocs(data || [])); }, []);
  function csv() {
    const rows = [["Numéro", "Type", "Statut", "Client", "Date", "Échéance", "Devise", "Total"], ...docs.map(d => [d.number, KINDS[d.kind].fr, STATUS[effStatus(d)], d.client?.name || "", d.issue_date, d.due_date || "", d.currency, d.total])];
    const b = new Blob(["\ufeff" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(";")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `kola-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }
  const match = (d) => { const s = effStatus(d); if (f === "open") return d.kind === "invoice" && !["paid", "draft"].includes(d.status); if (f === "late") return s === "late"; if (f === "all") return true; return d.kind === f; };
  const list = (docs || []).filter(d => match(d) && (!q || `${d.number} ${d.client?.name || ""}`.toLowerCase().includes(q.toLowerCase())));
  const sum = list.filter(d => d.kind === "invoice").reduce((a, d) => ({ ...a, [d.currency]: (a[d.currency] || 0) + +d.total }), {});
  return (<div className="in">
    <div className="ph"><h1>Documents</h1><div className="row" style={{ flexWrap: "wrap" }}>
      {docs?.length > 0 && <button className="b o s" onClick={csv}>Export CSV</button>}
      <Link href="/app/documents/nouveau?kind=quote" className="b o s">Devis</Link><Link href="/app/documents/nouveau?kind=receipt" className="b o s">Reçu</Link>
      <Link href="/app/documents/nouveau" className="b k s"><IPlus width="16" height="16" /> Facture</Link></div></div>
    <div className="row" style={{ flexWrap: "wrap", marginBottom: 14, justifyContent: "space-between" }}>
      <div className="kinds" style={{ overflowX: "auto", flexWrap: "nowrap", maxWidth: "100%" }}>{F.map(([k, l]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)} style={{ whiteSpace: "nowrap" }}>{l}</button>)}</div>
      <input placeholder="Numéro ou client" value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} aria-label="Rechercher" /></div>
    {!docs ? <div className="u">Chargement</div> : list.length === 0 ? <div className="list" style={{ padding: 28 }}><b>Rien ici pour l'instant.</b> <span className="mute">{docs.length ? "Essayez un autre filtre." : "Créez votre première facture en moins d'une minute."}</span></div> :
      <div className="list">{list.map(d => { const st = effStatus(d); return (<Link className="li" key={d.id} href={`/app/documents/${d.id}`}>
        <span className="av" style={{ background: avColor(d.client?.name) }}>{initials(d.client?.name)}</span>
        <div className="grow"><div className="t">{d.client?.name || "Sans nom"}</div><div className="s"><span className="mono">{d.number}</span> · {KINDS[d.kind].fr} · {new Date(d.issue_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div></div>
        <span className={`pill ${st}`}>{STATUS[st]}</span><div className="amt" style={{ minWidth: 120 }}>{fmt(d.total, d.currency)}</div></Link>); })}</div>}
    {Object.keys(sum).length > 0 && <p className="mute" style={{ textAlign: "right", fontSize: 14 }}>Total factures affichées : {Object.entries(sum).map(([c, v]) => <b key={c} className="mono" style={{ color: "var(--ink)", marginLeft: 8 }}>{fmt(v, c)}</b>)}</p>}
    <style>{`@media(max-width:600px){.li .pill{display:none}}`}</style>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Docs /></Suspense>; }
