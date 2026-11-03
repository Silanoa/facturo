"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { useDocs } from "../../lib/data";
import { useSession } from "../../lib/session";
import { fmt, KINDS, kindName } from "../../lib/money";
import { effStatus, statusName, daysLate, waLink, initials, avColor, publicUrl } from "../../lib/share";
import { reminder } from "../../lib/reminders";
import { useT } from "../../lib/i18n";
import { insights } from "../../lib/insights";
import { IPlus, IBell, ISpark } from "../../components/Icons";

export default function Dash() {
  const { profile, user } = useSession(); const [docs, setDocs] = useDocs(); const { tr, lang } = useT(); const loc = lang === "en" ? "en-GB" : "fr-FR";
  const cur = profile.currency || "XOF";
  const k = useMemo(() => {
    if (!docs) return null; const inv = docs.filter(d => d.kind === "invoice" && d.currency === cur);
    const open = inv.filter(d => !["paid", "draft", "cancelled"].includes(d.status)); const late = profile.settings?.n_due === false ? [] : open.filter(d => daysLate(d) > 0 && !d.declared_paid_at);
    const now = new Date(); const ym = (d) => d.slice(0, 7); const thisM = now.toISOString().slice(0, 7);
    const paidM = inv.filter(d => d.status === "paid" && ym((d.paid_at || d.issue_date)) === thisM).reduce((a, d) => a + +d.total, 0);
    const months = [...Array(6)].map((_, i) => { const x = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const key = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`; return { key, l: x.toLocaleDateString(loc, { month: "short" }).replace(".", ""), v: inv.filter(d => ym(d.issue_date) === key).reduce((a, d) => a + +d.total, 0) }; });
    const monthDocs = docs.filter(d => ym(d.issue_date) === thisM).length;
    return { open, late, openSum: open.reduce((a, d) => a + +d.total, 0), lateSum: late.reduce((a, d) => a + +d.total, 0), paidM, months, max: Math.max(1, ...months.map(m => m.v)), monthDocs };
  }, [docs, cur, lang]);
  const ins = useMemo(() => docs ? insights(docs, cur, lang) : [], [docs, lang]);
  const hello = (profile.business_name || "").trim();
  if (!docs) return <div className="u">…</div>;
  if (!docs.length) return (<div className="in" style={{ maxWidth: 620 }}>
    <p className="u">{tr("Bienvenue", "Welcome")}{hello ? `, ${hello}` : ""}</p>
    <h1 style={{ fontSize: "clamp(38px,6vw,64px)", margin: "10px 0 16px" }}>{tr("Votre première facture.", "Your first invoice.")} <span className="serif" style={{ color: "var(--carbon)" }}>{tr("Maintenant.", "Now.")}</span></h1>
    <p style={{ fontSize: 18, color: "var(--ink-2)" }}>{tr("Décrivez la vente en une phrase, Bonova remplit les lignes. Envoyez le lien par WhatsApp ou email : votre client voit le montant et comment vous payer.", "Describe the job in one sentence, Bonova fills the lines. Send the link by WhatsApp or email: your client sees the amount and how to pay you.")}</p>
    <div className="row" style={{ marginTop: 24, flexWrap: "wrap" }}><Link href="/app/documents/nouveau" className="b k"><IPlus width="18" height="18" /> {tr("Créer une facture", "Create an invoice")}</Link><Link href="/app/parametres" className="b o">{tr("Compléter mon profil", "Complete my profile")}</Link></div>
    {!profile.business_name && <p className="note" style={{ marginTop: 28 }}>{tr("Ajoutez votre activité, n° fiscal et moyens de paiement dans ", "Add your business, tax ID and payment details in ")}<Link href="/app/parametres">{tr("Réglages", "Settings")}</Link>.</p>}
  </div>);
  return (<div className="in">
    <div className="ph"><div><p className="u" style={{ margin: "0 0 6px" }}>{new Date().toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long" })}</p><h1>{tr("Bonjour", "Hello")}</h1>{hello && <p className="mute" style={{ margin: "8px 0 0" }}>{hello}</p>}</div>
      <Link href="/app/documents/nouveau" className="b k np mob-only" ><IPlus width="18" height="18" /> {tr("Nouvelle facture", "New invoice")}</Link></div>
    <div className="stats">
      <div><div className="u">{tr("À encaisser", "Outstanding")}</div><Big v={k.openSum} c={cur} /><div className="mute" style={{ marginTop: 6, fontSize: 14.5 }}>{k.open.length} {k.open.length > 1 ? tr("factures ouvertes", "open invoices") : tr("facture ouverte", "open invoice")}{k.late.length ? <> · <span style={{ color: "var(--late)", fontWeight: 600 }}>{k.late.length} {tr("en retard", "late")}</span></> : ""}</div></div>
      <div><div className="u">{tr("Encaissé ce mois", "Paid this month")}</div><div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 12 }}>{fmt(k.paidM, cur)}</div></div>
      <div><div className="u">{tr("Ce mois", "This month")}</div><div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 12 }}>{k.monthDocs}</div><div className="mute" style={{ fontSize: 13.5 }}>documents</div></div>
    </div>
    <div className="dgrid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.25fr) minmax(0,1fr)", gap: 22, marginTop: 26 }}>
      <section>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}><h2 style={{ fontSize: 24 }}>{tr("Qui vous doit", "Who owes you")}</h2><Link href="/app/documents?f=open" className="lnk" style={{ fontSize: 14 }}>{tr("Tout voir", "See all")}</Link></div>
        {k.open.length === 0 ? <div className="list" style={{ padding: 22 }}><b>{tr("Tout est encaissé.", "All paid.")}</b></div> :
        <div className="list">{k.open.slice(0, 6).map(d => { const late = daysLate(d); const st = effStatus(d);
          return (<div className="li" key={d.id}>
            <span className="av" style={{ background: avColor(d.client?.name) }}>{initials(d.client?.name)}</span>
            <Link href={`/app/documents/${d.id}`} className="grow" style={{ textDecoration: "none" }}><div className="t">{d.client?.name || "—"}</div><div className="s">{d.number} · {st === "declared" ? <span style={{ color: "var(--paid)", fontWeight: 600 }}>{tr("paiement signalé", "payment reported")}</span> : late ? <span style={{ color: "var(--late)", fontWeight: 600 }}>{late} {tr("j de retard", "days late")}</span> : d.due_date ? `${tr("échéance", "due")} ${new Date(d.due_date).toLocaleDateString(loc, { day: "numeric", month: "short" })}` : tr("envoyée", "sent")}{d.viewed_at ? tr(" · vue", " · viewed") : ""}</div></Link>
            <div className="amt">{fmt(d.total, d.currency)}</div>
            {d.client?.phone && <a className="b s o np" title={tr("Relancer", "Remind")} aria-label={tr("Relancer", "Remind")} target="_blank" rel="noreferrer" href={waLink(d.client.phone, reminder(d, profile, late > 14 ? "ferme" : "douce", publicUrl(d), d.lang || profile.doc_lang))} style={{ padding: "0 10px" }}><IBell width="17" height="17" /></a>}
          </div>); })}</div>}
        <h2 style={{ fontSize: 24, margin: "30px 0 12px" }}>{tr("Derniers documents", "Recent documents")}</h2>
        <div className="list">{docs.slice(0, 5).map(d => { const st = effStatus(d); return (<Link className="li" key={d.id} href={`/app/documents/${d.id}`}>
          <div className="grow"><div className="t">{d.client?.name || "—"}</div><div className="s">{kindName(d.kind, lang)} {d.number}</div></div>
          <span className={`pill ${st}`}>{statusName(st, lang, d.kind)}</span><div className="amt" style={{ minWidth: 110 }}>{fmt(d.total, d.currency)}</div></Link>); })}</div>
      </section>
      <aside>
        <div className="panel"><div className="u">{tr("Facturé — 6 derniers mois", "Billed — last 6 months")}</div>
          <div className="bars" style={{ marginBottom: 26 }}>{k.months.map((m, i) => <div key={m.key} className={i === 5 ? "cur" : ""} style={{ height: `${Math.max(3, m.v / k.max * 100)}%` }} title={fmt(m.v, cur)}><span>{m.l}</span></div>)}</div></div>
        {ins.length > 0 && <div className="panel" style={{ marginTop: 16 }}><div className="u row" style={{ gap: 6, color: "var(--carbon)" }}>{tr("Ce que disent vos chiffres", "What your numbers say")}</div>
          {ins.map((x, i) => <div key={i} style={{ borderTop: i ? "1px solid var(--line)" : 0, padding: "14px 0 2px" }}><b style={{ display: "block", fontSize: 15.5 }}>{x.t}</b><span className="mute" style={{ fontSize: 14 }}>{x.s}</span></div>)}</div>}
        
      </aside>
    </div>
    <style>{`@media(max-width:900px){.dgrid{grid-template-columns:1fr!important}}`}</style>
  </div>);
}
function Big({ v, c }) { const f = fmt(v, c); const m = f.match(/^(.*\d)\s(\D+)$/); return <div className="big" style={{ marginTop: 10 }}>{m ? m[1] : f}{m && <small> {m[2]}</small>}</div>; }
