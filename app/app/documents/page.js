"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { fmt, KINDS, kindName } from "../../../lib/money";
import { effStatus, statusName, initials, avColor } from "../../../lib/share";
import { useT } from "../../../lib/i18n";
import { IPlus } from "../../../components/Icons";
const F = [["all", "Tout", "All"], ["open", "À encaisser", "Outstanding"], ["late", "En retard", "Late"], ["invoice", "Factures", "Invoices"], ["quote", "Devis", "Quotes"], ["receipt", "Reçus", "Receipts"]];
function Docs() {
  const sp = useSearchParams(); const { tr, lang } = useT(); const [docs, setDocs] = useState(null); const [f, setF] = useState(sp.get("f") || "all"); const [q, setQ] = useState("");
  useEffect(() => { supabase.from("documents").select("*").order("issue_date", { ascending: false }).order("number", { ascending: false }).then(({ data }) => setDocs(data || [])); }, []);
  function csv() {
    const rows = [["Numéro", "Type", "Statut", "Client", "Date", "Échéance", "Devise", "Total"], ...docs.map(d => [d.number, kindName(d.kind, lang), statusName(effStatus(d), lang), d.client?.name || "", d.issue_date, d.due_date || "", d.currency, d.total])];
    const b = new Blob(["\ufeff" + rows.map(r => r.map(x => `"${String(x ?? "").replace(/"/g, '""')}"`).join(";")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `bonova-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  }
  const match = (d) => { const s = effStatus(d); if (f === "open") return d.kind === "invoice" && !["paid", "draft"].includes(d.status); if (f === "late") return s === "late"; if (f === "all") return true; return d.kind === f; };
  const list = (docs || []).filter(d => match(d) && (!q || `${d.number} ${d.client?.name || ""}`.toLowerCase().includes(q.toLowerCase())));
  const sum = list.filter(d => d.kind === "invoice").reduce((a, d) => ({ ...a, [d.currency]: (a[d.currency] || 0) + +d.total }), {});
  return (<div className="in">
    <div className="ph"><h1>Documents</h1><div className="row" style={{ flexWrap: "wrap" }}>
      {docs?.length > 0 && <button className="b o s" onClick={csv}>Export CSV</button>}
      <Link href="/app/documents/nouveau?kind=quote" className="b o s">{tr("Devis", "Quote")}</Link><Link href="/app/documents/nouveau?kind=receipt" className="b o s">{tr("Reçu", "Receipt")}</Link>
      <Link href="/app/documents/nouveau" className="b k s"><IPlus width="16" height="16" /> {tr("Facture", "Invoice")}</Link></div></div>
    <div className="row" style={{ flexWrap: "wrap", marginBottom: 14, justifyContent: "space-between" }}>
      <div className="kinds" style={{ overflowX: "auto", flexWrap: "nowrap", maxWidth: "100%" }}>{F.map(([k, fr, en]) => <button key={k} className={f === k ? "on" : ""} onClick={() => setF(k)} style={{ whiteSpace: "nowrap" }}>{tr(fr, en)}</button>)}</div>
      <input placeholder={tr("Numéro ou client", "Number or client")} value={q} onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 260 }} aria-label="Search" /></div>
    {!docs ? <div className="u">…</div> : list.length === 0 ? <div className="list" style={{ padding: 28 }}><b>{tr("Rien ici pour l'instant.", "Nothing here yet.")}</b></div> :
      <div className="list">{list.map(d => { const st = effStatus(d); return (<Link className="li" key={d.id} href={`/app/documents/${d.id}`}>
        <span className="av" style={{ background: avColor(d.client?.name) }}>{initials(d.client?.name)}</span>
        <div className="grow"><div className="t">{d.client?.name || "—"}</div><div className="s"><span className="mono">{d.number}</span> · {kindName(d.kind, lang)} · {new Date(d.issue_date).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "short" })}</div></div>
        <span className={`pill ${st}`}>{statusName(st, lang)}</span><div className="amt" style={{ minWidth: 120 }}>{fmt(d.total, d.currency)}</div></Link>); })}</div>}
    {Object.keys(sum).length > 0 && <p className="mute" style={{ textAlign: "right", fontSize: 14 }}>{tr("Total factures affichées :", "Invoices total:")} {Object.entries(sum).map(([c, v]) => <b key={c} className="mono" style={{ color: "var(--ink)", marginLeft: 8 }}>{fmt(v, c)}</b>)}</p>}
    <style>{`@media(max-width:600px){.li .pill{display:none}}`}</style>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Docs /></Suspense>; }
