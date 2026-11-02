"use client";
import { useEffect, useState } from "react";
import { S } from "../../lib/session";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n";
export default function AppLayout({ children }) {
  const r = useRouter(); const p = usePathname(); const { t, lang, setLang } = useT();
  const [s, setS] = useState(null);
  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return r.replace("/connexion");
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    setS({ user: data.session.user, profile: prof || {}, reload: load });
  }
  useEffect(() => { load(); }, []);
  if (!s) return <div style={{display:"grid",placeItems:"center",height:"100vh"}} className="muted">Chargement…</div>;
  const nav = [["/app", t("dash")], ["/app/documents", t("docs")], ["/app/clients", t("clients")], ["/app/parametres", t("settings")]];
  return (<S.Provider value={s}><div className="shell">
    <aside className="side noprint">
      <Link href="/app" className="logo"><i>F</i>Facturo</Link>
      {nav.map(([h, l]) => <Link key={h} href={h} className={(h === "/app" ? p === h : p.startsWith(h)) ? "on" : ""}>{l}</Link>)}
      <div className="grow"/>
      <div style={{padding:"8px 12px",fontSize:12.5,color:"#B9C6BC"}}>{s.profile.plan === "pro" ? "Plan Pro" : "Plan Découverte"}<br/>{s.user.email}</div>
      <button className="link" onClick={() => setLang(lang === "fr" ? "en" : "fr")}>{lang === "fr" ? "English" : "Français"}</button>
      <button className="link" onClick={async () => { await supabase.auth.signOut(); r.replace("/"); }}>{t("logout")}</button>
    </aside>
    <main className="main">{children}</main></div></S.Provider>);
}
