"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";
import { useSession } from "../../../lib/session";
import { useT } from "../../../lib/i18n";
import { fmt, kindName } from "../../../lib/money";
import { statusName, effStatus } from "../../../lib/share";
// Administration : réservée au rôle « admin » (vérifié côté base par is_admin()).
export default function Admin() {
  const s = useSession(); const { tr, lang } = useT(); const [d, setD] = useState(null); const [pays, setPays] = useState([]); const [err, setErr] = useState(null);
  const [tab, setTab] = useState("users"); const [q, setQ] = useState(""); const loc = lang === "en" ? "en-GB" : "fr-FR";
  const load = async () => { const [{ data, error }, p] = await Promise.all([supabase.rpc("admin_overview"), supabase.rpc("admin_payments")]); if (error) return setErr(error.message); setD(data); setPays(p.data || []); };
  useEffect(() => { if (s.profile.role === "admin") load(); }, []);
  const users = useMemo(() => (d?.list_users || []).filter(u => !q || `${u.email} ${u.business_name || ""} ${u.country || ""}`.toLowerCase().includes(q.toLowerCase())), [d, q]);
  const docs = useMemo(() => (d?.list_docs || []).filter(x => !q || `${x.number} ${x.client || ""} ${x.owner}`.toLowerCase().includes(q.toLowerCase())), [d, q]);
  if (s.profile.role !== "admin") return <div className="in"><h1>{tr("Accès réservé", "Restricted")}</h1><p className="mute">{tr("Cette page est réservée aux administrateurs.", "This page is for administrators only.")}</p><Link className="b o" href="/app">{tr("Retour", "Back")}</Link></div>;
  if (err) return <div className="in"><div className="note bad">{err}</div></div>;
  if (!d) return <div className="u">…</div>;
  const act = async (fn, args, msg) => { if (msg && !confirm(msg)) return; const { error } = await supabase.rpc(fn, args); s.toast(error ? error.message : tr("Fait", "Done")); load(); };
  const dt = (x) => x ? new Date(x).toLocaleDateString(loc, { day: "numeric", month: "short", year: "2-digit" }) : "—";
  const sum = (o) => Object.entries(o || {}).map(([c, v]) => fmt(v, c)).join(" · ") || "—";
  return (<div className="in">
    <div className="ph"><div><p className="u">Admin</p><h1>{tr("Vue d'ensemble", "Overview")}</h1></div><button className="b o" onClick={load}>{tr("Actualiser", "Refresh")}</button></div>
    <div className="kpis adm">{[[tr("Utilisateurs", "Users"), d.users, `+${d.users_7d} ${tr("sur 7 j", "in 7d")}`], ["Pro", d.pro, d.users ? `${Math.round((d.pro / d.users) * 100)} %` : ""], ["Documents", d.docs, `+${d.docs_30d} ${tr("sur 30 j", "in 30d")}`], [tr("Paiements Pro", "Pro payments"), pays.length, ""]].map(([l, v, sub]) => <div key={l} className="kpi"><span className="u">{l}</span><b>{v}</b><span className="mute">{sub}</span></div>)}</div>
    <div className="panel" style={{ margin: "14px 0" }}><div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}><span><span className="u">{tr("Facturé", "Invoiced")}</span> <b className="mono">{sum(d.invoiced)}</b></span><span><span className="u">{tr("Encaissé", "Collected")}</span> <b className="mono">{sum(d.paid)}</b></span></div></div>
    <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
      <div className="stabs" style={{ margin: 0, border: 0 }}>{[["users", tr("Utilisateurs", "Users")], ["docs", "Documents"], ["pay", tr("Abonnements", "Subscriptions")]].map(([k, l]) => <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>)}</div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Rechercher…", "Search…")} style={{ maxWidth: 260 }} /></div>
    <div className="tbl-w">
      {tab === "users" && <table className="tbl"><thead><tr><th>Email</th><th>{tr("Activité", "Business")}</th><th>{tr("Pays", "Country")}</th><th>Docs</th><th>{tr("Offre", "Plan")}</th><th>{tr("Inscrit", "Joined")}</th><th>{tr("Vu", "Seen")}</th><th /></tr></thead>
        <tbody>{users.map(u => <tr key={u.id}><td>{u.email}{u.role === "admin" && <span className="pill" style={{ marginLeft: 6 }}>admin</span>}</td><td>{u.business_name || "—"}</td><td>{u.country || "—"}</td><td className="mono">{u.docs}</td>
          <td>{u.plan === "pro" ? <span className="pill paid">Pro{u.pro_until ? ` · ${dt(u.pro_until)}` : ""}</span> : tr("Gratuit", "Free")}</td><td>{dt(u.created_at)}</td><td>{dt(u.last_sign_in_at)}</td>
          <td><div className="row" style={{ gap: 4, justifyContent: "flex-end", flexWrap: "nowrap" }}>
            {u.plan === "pro" ? <button className="b s o" onClick={() => act("admin_set_plan", { p_user: u.id, p_plan: "free", p_days: 0 }, tr("Repasser en gratuit ?", "Downgrade to free?"))}>{tr("Retirer Pro", "Remove Pro")}</button> : <button className="b s o" onClick={() => { const n = prompt(tr("Offrir Pro combien de jours ?", "Grant Pro for how many days?"), "30"); if (n) act("admin_set_plan", { p_user: u.id, p_plan: "pro", p_days: +n || 30 }); }}>{tr("Offrir Pro", "Grant Pro")}</button>}
            {u.id !== s.user.id && <button className="b s o" onClick={() => act("admin_set_role", { p_user: u.id, p_role: u.role === "admin" ? "user" : "admin" }, u.role === "admin" ? tr("Retirer le rôle admin ?", "Remove admin role?") : tr("Donner le rôle admin ?", "Make admin?"))}>{u.role === "admin" ? tr("Retirer admin", "Unadmin") : "Admin"}</button>}
            {u.id !== s.user.id && <button className="x" title={tr("Supprimer", "Delete")} onClick={() => act("admin_delete_user", { p_user: u.id }, `${tr("Supprimer définitivement", "Permanently delete")} ${u.email} ${tr("et tous ses documents ?", "and all their documents?")}`)}>×</button>}</div></td></tr>)}</tbody></table>}
      {tab === "docs" && <table className="tbl"><thead><tr><th>{tr("Numéro", "Number")}</th><th>Type</th><th>{tr("Statut", "Status")}</th><th>Client</th><th>{tr("Compte", "Account")}</th><th>Total</th><th>{tr("Créé", "Created")}</th><th /></tr></thead>
        <tbody>{docs.map(x => <tr key={x.id}><td className="mono">{x.public_token ? <a href={`/f/${x.public_token}`} target="_blank" rel="noreferrer">{x.number}</a> : x.number}</td><td>{kindName(x.kind, lang)}</td><td><span className={`pill ${effStatus(x)}`}>{statusName(effStatus(x), lang, x.kind)}</span></td><td>{x.client || "—"}</td><td>{x.owner}</td>
          <td className="mono">{fmt(x.total, x.currency)}{+x.paid_amount > 0 && +x.paid_amount < +x.total ? <div className="mute" style={{ fontSize: 12 }}>{tr("réglé", "paid")} {fmt(x.paid_amount, x.currency)}</div> : null}</td><td>{dt(x.created_at)}</td>
          <td><button className="x" title={tr("Supprimer", "Delete")} onClick={() => act("admin_delete_doc", { p_doc: x.id }, `${tr("Supprimer", "Delete")} ${x.number} ?`)}>×</button></td></tr>)}</tbody></table>}
      {tab === "pay" && (pays.length ? <table className="tbl"><thead><tr><th>Date</th><th>Email</th><th>{tr("Prestataire", "Provider")}</th><th>Transaction</th><th>{tr("Pro jusqu'au", "Pro until")}</th></tr></thead>
        <tbody>{pays.map(x => <tr key={x.tx}><td>{dt(x.created_at)}</td><td>{x.email || "—"}</td><td>{x.provider}</td><td className="mono" style={{ fontSize: 12 }}>{x.tx}</td><td>{dt(x.pro_until)}</td></tr>)}</tbody></table>
        : <p className="mute" style={{ padding: 20 }}>{tr("Aucun paiement d'abonnement pour l'instant. Ils apparaîtront ici dès que FedaPay ou Lemon Squeezy confirment un paiement.", "No subscription payments yet.")}</p>)}
    </div>
  </div>);
}
