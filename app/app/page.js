"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/session";
import { useT } from "../../lib/i18n";
import { fmt, KINDS } from "../../lib/money";
export default function Dash() {
  const s = useSession(); const { t } = useT(); const [docs, setDocs] = useState(null);
  useEffect(() => { supabase.from("documents").select("*").order("created_at", { ascending: false }).then(({ data }) => setDocs(data || [])); }, []);
  if (!docs) return <p className="muted">Chargement…</p>;
  const c = s.profile.currency || "XOF";
  const inv = docs.filter(d => d.kind === "invoice" && d.currency === c);
  const paid = inv.filter(d => d.status === "paid").reduce((a, d) => a + +d.total, 0);
  const pend = inv.filter(d => d.status === "sent").reduce((a, d) => a + +d.total, 0);
  const m0 = new Date(); m0.setDate(1); m0.setHours(0,0,0,0);
  const month = docs.filter(d => new Date(d.created_at) >= m0).length;
  const months = [...Array(6)].map((_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 5 + i, 1); return d; });
  const series = months.map(d => inv.filter(x => { const y = new Date(x.issue_date); return x.status === "paid" && y.getMonth() === d.getMonth() && y.getFullYear() === d.getFullYear(); }).reduce((a, x) => a + +x.total, 0));
  const max = Math.max(1, ...series);
  return (<>
    <div className="head"><div><span className="eyebrow">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</span><h1>Bonjour{s.profile.business_name ? `, ${s.profile.business_name}` : ""}</h1></div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Link href="/app/documents/nouveau?kind=quote" className="btn ghost">{t("newQuote")}</Link><Link href="/app/documents/nouveau" className="btn clay">{t("newInv")}</Link></div></div>
    {!s.profile.business_name && <div className="alert">Complétez <Link href="/app/parametres"><b>votre entreprise</b></Link> (nom, IFU/NINEA, numéros Mobile Money) : ces informations apparaîtront sur chaque document.</div>}
    <div className="kpis">
      <div className="card kpi"><span className="muted">{t("collected")}</span><div className="v">{fmt(paid, c)}</div></div>
      <div className="card kpi"><span className="muted">{t("pending")}</span><div className="v" style={{color:"var(--warn)"}}>{fmt(pend, c)}</div></div>
      <div className="card kpi"><span className="muted">Documents {t("thisMonth")}</span><div className="v">{month}{s.profile.plan !== "pro" && <span className="muted" style={{fontSize:15}}> / 10</span>}</div></div>
      <div className="card kpi"><span className="muted">Clients facturés</span><div className="v">{new Set(docs.map(d => d.client?.name).filter(Boolean)).size}</div></div>
    </div>
    <div className="grid2" style={{gridTemplateColumns:"1fr 1.4fr"}}>
      <div className="card"><b>Encaissements — 6 derniers mois</b><div className="bar" style={{marginBottom:24}}>{series.map((v, i) => <div key={i} style={{height: `${(v / max) * 100}%`}} title={fmt(v, c)}><span>{months[i].toLocaleDateString("fr-FR", { month: "short" })}</span></div>)}</div></div>
      <div className="card"><div style={{display:"flex",justifyContent:"space-between"}}><b>Derniers documents</b><Link href="/app/documents" className="muted">Tout voir →</Link></div>
        {docs.length === 0 ? <p className="muted">Aucun document pour l'instant. Votre première facture prend moins de deux minutes.</p> :
        <table className="list"><tbody>{docs.slice(0, 6).map(d => <tr key={d.id}><td><Link href={`/app/documents/${d.id}`}><b>{d.number}</b></Link><div className="muted" style={{fontSize:13}}>{KINDS[d.kind].fr} · {d.client?.name}</div></td><td><span className={`tag ${d.status}`}>{t(d.status)}</span></td><td style={{textAlign:"right"}}>{fmt(d.total, d.currency)}</td></tr>)}</tbody></table>}
      </div>
    </div></>);
}
