"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useSession } from "../../lib/session";
import { fmt, KINDS } from "../../lib/money";
import { effStatus, STATUS, daysLate, waLink, initials, avColor, publicUrl } from "../../lib/share";
import { reminder } from "../../lib/reminders";
import { insights } from "../../lib/insights";
import { IPlus, IBell, ISpark } from "../../components/Icons";
const M = ["jan", "fév", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];
export default function Dash() {
  const { profile, user } = useSession(); const [docs, setDocs] = useState(null);
  useEffect(() => { supabase.from("documents").select("*").order("issue_date", { ascending: false }).then(({ data }) => setDocs(data || [])); }, []);
  const cur = profile.currency || "XOF";
  const k = useMemo(() => {
    if (!docs) return null; const inv = docs.filter(d => d.kind === "invoice" && d.currency === cur);
    const open = inv.filter(d => d.status !== "paid" && d.status !== "draft"); const late = open.filter(d => daysLate(d) > 0);
    const now = new Date(); const ym = (d) => d.slice(0, 7); const thisM = now.toISOString().slice(0, 7);
    const paidM = inv.filter(d => d.status === "paid" && ym((d.paid_at || d.issue_date)) === thisM).reduce((a, d) => a + +d.total, 0);
    const months = [...Array(6)].map((_, i) => { const x = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const key = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; return { key, l: M[x.getMonth()], v: inv.filter(d => ym(d.issue_date) === key).reduce((a, d) => a + +d.total, 0) }; });
    const monthDocs = docs.filter(d => ym(d.issue_date) === thisM).length;
    return { open, late, openSum: open.reduce((a, d) => a + +d.total, 0), lateSum: late.reduce((a, d) => a + +d.total, 0), paidM, months, max: Math.max(1, ...months.map(m => m.v)), monthDocs };
  }, [docs, cur]);
  const ins = useMemo(() => docs ? insights(docs, cur) : [], [docs]);
  const hello = (profile.business_name || "").trim();
  if (!docs) return <div className="u">Chargement</div>;
  if (!docs.length) return (<div className="in" style={{ maxWidth: 620 }}>
    <p className="u">Bienvenue{hello ? `, ${hello}` : ""}</p>
    <h1 style={{ fontSize: "clamp(38px,6vw,64px)", margin: "10px 0 16px" }}>Votre première facture, <span style={{ color: "var(--kola)" }}>maintenant.</span></h1>
    <p style={{ fontSize: 18, color: "var(--ink-2)" }}>Décrivez la vente en une phrase, Kola remplit les lignes. Ensuite, envoyez le lien par WhatsApp : votre client voit le montant et vos numéros Mobile Money.</p>
    <div className="row" style={{ marginTop: 24, flexWrap: "wrap" }}><Link href="/app/documents/nouveau" className="b k"><IPlus width="18" height="18" /> Créer une facture</Link><Link href="/app/parametres" className="b o">Compléter mon profil</Link></div>
    {!profile.business_name && <p className="note" style={{ marginTop: 28 }}>Ajoutez le nom de votre activité, votre IFU/NINEA et vos numéros Mobile Money dans <Link href="/app/parametres">Réglages</Link> : ils apparaîtront sur chaque facture.</p>}
  </div>);
  return (<div className="in">
    <div className="ph"><div><p className="u" style={{ margin: "0 0 6px" }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}</p><h1>{hello ? `Bonjour, ${hello.split(" ")[0]}` : "Bonjour"}</h1></div>
      <Link href="/app/documents/nouveau" className="b k np" style={{ color: "#fff" }}><IPlus width="18" height="18" /> Nouvelle facture</Link></div>
    <div className="stats">
      <div><div className="u">À encaisser</div><Big v={k.openSum} c={cur} /><div className="mute" style={{ marginTop: 6, fontSize: 14.5 }}>{k.open.length} facture{k.open.length > 1 ? "s" : ""} ouverte{k.open.length > 1 ? "s" : ""}{k.late.length ? <> · <span style={{ color: "var(--kola)", fontWeight: 600 }}>{k.late.length} en retard</span></> : ""}</div></div>
      <div><div className="u">Encaissé ce mois</div><div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 12 }}>{fmt(k.paidM, cur)}</div></div>
      <div><div className="u">Ce mois</div><div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 12 }}>{k.monthDocs}{profile.plan !== "pro" && <span className="mute" style={{ fontSize: 15 }}> / 10</span>}</div><div className="mute" style={{ fontSize: 13.5 }}>documents{profile.plan !== "pro" && " gratuits"}</div></div>
    </div>
    <div className="dgrid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 22, marginTop: 26 }}>
      <section>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}><h2 style={{ fontSize: 24 }}>Qui vous doit</h2><Link href="/app/documents?f=open" className="lnk" style={{ fontSize: 14 }}>Tout voir</Link></div>
        {k.open.length === 0 ? <div className="list" style={{ padding: 22 }}><b>Tout est encaissé.</b> <span className="mute">Aucune facture en attente.</span></div> :
        <div className="list">{k.open.slice(0, 6).map(d => { const late = daysLate(d); const st = effStatus(d);
          return (<div className="li" key={d.id}>
            <span className="av" style={{ background: avColor(d.client?.name) }}>{initials(d.client?.name)}</span>
            <Link href={`/app/documents/${d.id}`} className="grow" style={{ textDecoration: "none" }}><div className="t">{d.client?.name || "Sans nom"}</div><div className="s">{d.number} · {st === "declared" ? <span style={{ color: "var(--leaf)", fontWeight: 600 }}>paiement signalé</span> : late ? <span style={{ color: "var(--kola)", fontWeight: 600 }}>{late} j de retard</span> : d.due_date ? `échéance ${new Date(d.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : "envoyée"}{d.viewed_at ? " · vue" : ""}</div></Link>
            <div className="amt">{fmt(d.total, d.currency)}</div>
            {d.client?.phone && <a className="b s o np" title="Relancer sur WhatsApp" aria-label="Relancer sur WhatsApp" target="_blank" rel="noreferrer" href={waLink(d.client.phone, reminder(d, profile, late > 14 ? "ferme" : "douce", publicUrl(d)))} style={{ padding: "0 10px" }}><IBell width="17" height="17" /></a>}
          </div>); })}</div>}
        <h2 style={{ fontSize: 24, margin: "30px 0 12px" }}>Derniers documents</h2>
        <div className="list">{docs.slice(0, 5).map(d => { const st = effStatus(d); return (<Link className="li" key={d.id} href={`/app/documents/${d.id}`}>
          <div className="grow"><div className="t">{d.client?.name || "Sans nom"}</div><div className="s">{KINDS[d.kind].fr} {d.number}</div></div>
          <span className={`pill ${st}`}>{STATUS[st] || st}</span><div className="amt" style={{ minWidth: 110 }}>{fmt(d.total, d.currency)}</div></Link>); })}</div>
      </section>
      <aside>
        <div className="panel"><div className="u">Facturé — 6 derniers mois</div>
          <div className="bars" style={{ marginBottom: 26 }}>{k.months.map((m, i) => <div key={m.key} className={i === 5 ? "cur" : ""} style={{ height: `${Math.max(3, m.v / k.max * 100)}%` }} title={fmt(m.v, cur)}><span>{m.l}</span></div>)}</div></div>
        {ins.length > 0 && <div className="panel" style={{ marginTop: 16 }}><div className="u row" style={{ gap: 6, color: "var(--indigo)" }}><ISpark width="15" height="15" /> Ce que disent vos chiffres</div>
          {ins.map((x, i) => <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : 0, padding: "14px 0 2px" }}><b style={{ display: "block", fontSize: 15.5 }}>{x.t}</b><span className="mute" style={{ fontSize: 14 }}>{x.s}</span></div>)}</div>}
        {profile.plan !== "pro" && k.monthDocs >= 7 && <div className="note" style={{ marginTop: 16 }}>Il vous reste {Math.max(0, 10 - k.monthDocs)} document{10 - k.monthDocs > 1 ? "s" : ""} gratuit{10 - k.monthDocs > 1 ? "s" : ""} ce mois. <Link href="/app/parametres?t=offre">Passer à Pro</Link></div>}
      </aside>
    </div>
    <style>{`@media(max-width:900px){.dgrid{grid-template-columns:1fr!important}}`}</style>
  </div>);
}
function Big({ v, c }) { const f = fmt(v, c); const m = f.match(/^(.*\d)\s(\D+)$/); return <div className="big" style={{ marginTop: 10 }}>{m ? m[1] : f}{m && <small>{m[2]}</small>}</div>; }
