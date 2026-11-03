"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { S } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n";
import { Logo } from "../../components/Brand";
import Support from "../../components/Support";
import { IHome, IDoc, IUsers, ISet, IPlus, IOut } from "../../components/Icons";
export default function AppLayout({ children }) {
  const r = useRouter(); const p = usePathname(); const [s, setS] = useState(null); const [toast, setToast] = useState(null); const { tr, setLang, lang } = useT();
  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return r.replace("/connexion?next=" + encodeURIComponent(p));
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    const pro = prof?.plan === "pro" && (!prof.pro_until || new Date(prof.pro_until) > new Date());
    if (prof?.lang && !localStorage.getItem("lang")) setLang(prof.lang);
    setS({ user: data.session.user, profile: { ...(prof || {}), plan: pro ? "pro" : "free" }, reload: load, toast: (m) => { setToast(m); setTimeout(() => setToast(null), 2600); } });
  }
  useEffect(() => { load(); }, []);
  if (!s) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">bonova</span></div>;
  const on = (h) => (h === "/app" ? p === h : p.startsWith(h) && !(h === "/app/documents" && p === "/app/documents/nouveau"));
  const nav = [["/app", tr("Accueil", "Home"), IHome], ["/app/documents", "Documents", IDoc], ["/app/clients", "Clients", IUsers], ["/app/parametres", tr("Réglages", "Settings"), ISet]];
  return (<S.Provider value={s}><div className="shell">
    <aside className="side np">
      <Logo href="/app" />
      <Link href="/app/documents/nouveau" className="b k new"><IPlus width="18" height="18" /> {tr("Nouvelle facture", "New invoice")}</Link>
      {nav.map(([h, l, I], i) => <Link key={h} href={h} className={on(h) ? "on" : ""}><span className="ix">0{i + 1}</span>{l}</Link>)}
      <div style={{ flex: 1, borderTop: "1px solid var(--line)" }} />
      {s.profile.plan !== "pro" && <Link href="/app/parametres?t=offre" className="pro"><b style={{ display: "block", fontSize: 14 }}>Bonova Pro →</b><span style={{ fontSize: 13, color: "var(--ink-2)" }}>{tr("Sans mention Bonova, relances auto. 2 500 F/mois", "No Bonova branding, auto reminders. $4/mo")}</span></Link>}
      <div style={{ padding: "8px 18px", fontSize: 13, color: "var(--mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.profile.business_name || s.user.email}</div>
      <div className="row" style={{ padding: "0 18px 4px", justifyContent: "space-between" }}>
        <button className="lng" style={{ background: "none", cursor: "pointer" }} onClick={() => setLang(lang === "en" ? "fr" : "en")}>{lang === "en" ? "FR" : "EN"}</button>
        <button className="lnk" style={{ fontSize: 14, display: "flex", gap: 6, alignItems: "center", textDecoration: "none" }} onClick={async () => { await supabase.auth.signOut(); r.replace("/"); }}><IOut width="16" height="16" />{tr("Déconnexion", "Sign out")}</button></div>
    </aside>
    <main className="main">{children}</main>
    <nav className="tabbar np" aria-label="Navigation">
      {nav.slice(0, 2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
      <Link href="/app/documents/nouveau" className="plus" aria-label={tr("Nouvelle facture", "New invoice")}><span className="c"><IPlus /></span></Link>
      {nav.slice(2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
    </nav>
    {!p.startsWith("/app/documents/nouveau") && <Support lang={lang} />}
    {toast && <div className="toast">{toast}</div>}
  </div></S.Provider>);
}
