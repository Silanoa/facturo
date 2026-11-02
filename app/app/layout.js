"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { S } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Brand";
import { IHome, IDoc, IUsers, ISet, IPlus, IOut } from "../../components/Icons";
export default function AppLayout({ children }) {
  const r = useRouter(); const p = usePathname(); const [s, setS] = useState(null); const [toast, setToast] = useState(null);
  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return r.replace("/connexion?next=" + encodeURIComponent(p));
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    const pro = prof?.plan === "pro" && (!prof.pro_until || new Date(prof.pro_until) > new Date());
    setS({ user: data.session.user, profile: { ...(prof || {}), plan: pro ? "pro" : "free" }, reload: load, toast: (m) => { setToast(m); setTimeout(() => setToast(null), 2600); } });
  }
  useEffect(() => { load(); }, []);
  if (!s) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">Chargement</span></div>;
  const on = (h) => (h === "/app" ? p === h : p.startsWith(h) && !(h === "/app/documents" && p === "/app/documents/nouveau"));
  const nav = [["/app", "Accueil", IHome], ["/app/documents", "Documents", IDoc], ["/app/clients", "Clients", IUsers], ["/app/parametres", "Réglages", ISet]];
  return (<S.Provider value={s}><div className="shell">
    <aside className="side np">
      <Logo href="/app" />
      <Link href="/app/documents/nouveau" className="b k new" style={{ justifyContent: "center", color: "#fff" }}><IPlus width="18" height="18" /> Nouvelle facture</Link>
      {nav.map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
      <div style={{ flex: 1 }} />
      {s.profile.plan !== "pro" && <Link href="/app/parametres?t=offre" style={{ display: "block", background: "var(--ochre-bg)", borderRadius: 12, padding: 14, marginBottom: 10 }}><b style={{ display: "block", fontSize: 14 }}>Passer à Pro</b><span style={{ fontSize: 13, color: "var(--ink-2)" }}>Illimité, sans mention Kola — 2 500 FCFA/mois</span></Link>}
      <div style={{ padding: "8px 12px", fontSize: 13, color: "var(--mute)", overflow: "hidden", textOverflow: "ellipsis" }}>{s.profile.business_name || s.user.email}</div>
      <button onClick={async () => { await supabase.auth.signOut(); r.replace("/"); }}><IOut />Déconnexion</button>
    </aside>
    <main className="main">{children}</main>
    <nav className="tabbar np" aria-label="Navigation">
      {nav.slice(0, 2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
      <Link href="/app/documents/nouveau" className="plus" aria-label="Nouvelle facture"><span className="c"><IPlus /></span></Link>
      {nav.slice(2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
    </nav>
    {toast && <div className="toast">{toast}</div>}
  </div></S.Provider>);
}
