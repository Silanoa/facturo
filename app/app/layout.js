"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { S } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n";
import { Logo } from "../../components/Brand";
import Support from "../../components/Support";
import { IHome, IDoc, IUsers, ISet, IPlus, IOut, IShield } from "../../components/Icons";
export default function AppLayout({ children }) {
  const r = useRouter(); const p = usePathname(); const [s, setS] = useState(null); const [toast, setToast] = useState(null); const [menu, setMenu] = useState(null); const { tr, setLang, lang } = useT();
  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return r.replace("/connexion?next=" + encodeURIComponent(p));
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    const pro = prof?.plan === "pro" && (!prof.pro_until || new Date(prof.pro_until) > new Date());
    if (prof?.lang && !localStorage.getItem("lang")) setLang(prof.lang);
    setS({ user: data.session.user, profile: { ...(prof || {}), plan: pro ? "pro" : "free" }, reload: load, toast: (m) => { setToast(m); setTimeout(() => setToast(null), 2600); } });
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { setMenu(null); }, [p]);
  if (!s) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">bonova</span></div>;
  const on = (h) => (h === "/app" ? p === h : p.startsWith(h) && !(h === "/app/documents" && p === "/app/documents/nouveau"));
  const nav = [["/app", tr("Accueil", "Home"), IHome], ["/app/documents", "Documents", IDoc], ["/app/clients", "Clients", IUsers], ["/app/parametres", tr("Réglages", "Settings"), ISet]];
  return (<S.Provider value={s}><div className="shell">
    <aside className="side np">
      <Logo href="/app" />
      <div className="ws"><button className="ws-b" onClick={() => setMenu(menu === "ws" ? null : "ws")} aria-expanded={menu === "ws"}>
        {s.profile.logo ? <img src={s.profile.logo} alt="" className="ws-av" /> : <span className="ws-av">{(s.profile.business_name || s.user.email || "?").trim()[0].toUpperCase()}</span>}
        <span className="ws-t"><b>{s.profile.business_name || tr("Mon activité", "My business")}</b><span>{s.profile.plan === "pro" ? "Pro" : tr("Gratuit", "Free")} · {s.user.email}</span></span><span className="ws-c" aria-hidden>⌄</span></button>
        {menu === "ws" && <div className="ws-m" onClick={() => setMenu(null)}>
          <Link href="/app/parametres?t=profil">{tr("Infos de l'activité", "Business details")}</Link><Link href="/app/parametres?t=modele">{tr("Modèle et logo", "Template & logo")}</Link><Link href="/app/parametres?t=paiement">{tr("Moyens de paiement", "Payment details")}</Link>
          <button onClick={() => setLang(lang === "en" ? "fr" : "en")}>{lang === "en" ? "Passer en français" : "Switch to English"}</button>
          <button onClick={async () => { await supabase.auth.signOut(); r.replace("/"); }}><IOut width="15" height="15" /> {tr("Déconnexion", "Sign out")}</button></div>}</div>
      <div className="new-w"><Link href="/app/documents/nouveau" className="b k new"><IPlus width="17" height="17" /> {tr("Nouvelle facture", "New invoice")}</Link>
        <button className="b k new-more" aria-label={tr("Autre document", "Other document")} onClick={() => setMenu(menu === "new" ? null : "new")}>⌄</button>
        {menu === "new" && <div className="ws-m" style={{ top: "100%" }} onClick={() => setMenu(null)}><Link href="/app/documents/nouveau?kind=quote">{tr("Nouveau devis", "New quote")}</Link><Link href="/app/documents/nouveau?kind=receipt">{tr("Nouveau reçu", "New receipt")}</Link></div>}</div>
      <nav className="snav">{nav.map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
        {s.profile.role === "admin" && <Link href="/app/admin" className={on("/app/admin") ? "on" : ""}><IShield />Admin</Link>}</nav>
      <div style={{ flex: 1 }} />
      {s.profile.plan !== "pro" && <Link href="/app/parametres?t=offre" className="pro-c"><b>Bonova Pro</b><span>{tr("Votre marque seule sur vos documents, relances automatiques.", "Only your brand on documents, automatic reminders.")}</span><em>{tr("2 500 F / mois →", "$4 / month →")}</em></Link>}
    </aside>
    {menu && <div className="ws-x" onClick={() => setMenu(null)} />}
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
