"use client";
import { useEffect, useRef, useState } from "react";
import { detectCountry } from "../../lib/geo";
import { clearUserState, bindUser } from "../../lib/clear";
import { country as countryOf } from "../../lib/countries";
import { proPrice } from "../../lib/pricing";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { S } from "../../lib/session";
import { supabase } from "../../lib/supabase";
import { useT } from "../../lib/i18n";
import { Logo } from "../../components/Brand";
import Support from "../../components/Support";
import { IHome, IDoc, IUsers, ISet, IPlus, IOut, IShield } from "../../components/Icons";
export default function AppLayout({ children }) {
  const r = useRouter(); const p = usePathname(); const [s, setS] = useState(null); const [toast, setToast] = useState(null); const [menu, setMenu] = useState(null); const [ban, setBan] = useState(null); const { tr, setLang, lang } = useT();
  async function load() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return r.replace("/connexion?next=" + encodeURIComponent(p));
    const { data: prof } = await supabase.from("profiles").select("*").eq("id", data.session.user.id).single();
    const pro = prof?.plan === "pro" && (!prof.pro_until || new Date(prof.pro_until) > new Date());
    bindUser(data.session.user.id);
    // Le profil fait foi : langue, pays, devise et TVA viennent du compte, jamais du navigateur d'un autre compte.
    if (prof?.lang && !localStorage.getItem("lang")) setLang(prof.lang);
    // Géolocalisation seulement pour un profil sans pays (nouveau compte) ; un pays déjà choisi n'est jamais écrasé.
    if (prof && !prof.country) detectCountry().then(async (cc) => { const c = countryOf(cc || (prof.lang === "en" ? "US" : "SN")); const upd = { country: c.code, currency: prof.currency || c.cur, settings: { ...(prof.settings || {}), cc_ok: 1 } };
      await supabase.from("profiles").update(upd).eq("id", prof.id).is("country", null); setS((x) => x && ({ ...x, profile: { ...x.profile, ...upd } })); });
    setS({ user: data.session.user, profile: { ...(prof || {}), plan: pro ? "pro" : "free" }, reload: load, toast: pushToast });
  }
  const tid = useRef(0);
  function pushToast(m, type, href) { if (!m) return; const t = type || (/erreur|error|échec|failed|invalid|impossible/i.test(String(m)) ? "err" : "ok"); const id = ++tid.current; setToast({ m: String(m), t, href, id }); setTimeout(() => setToast((x) => (x && x.id === id ? null : x)), t === "err" ? 6000 : href ? 7000 : 3000); }
  // Langue : suivie dans le profil pour la retrouver sur tout appareil.
  useEffect(() => { if (s && s.profile.id && s.profile.lang !== lang) { supabase.from("profiles").update({ lang }).eq("id", s.profile.id).then(() => {}); setS((x) => x && ({ ...x, profile: { ...x.profile, lang } })); } }, [lang, s?.profile?.id]);
  // Alertes en direct, sur toutes les pages : ouverture, acceptation/refus de devis, paiement signalé.
  const known = useRef(null);
  useEffect(() => { if (!s?.user?.id) return; let ch; (async () => {
    const { data } = await supabase.from("documents").select("id,status,viewed_at,declared_paid_at").eq("user_id", s.user.id); known.current = Object.fromEntries((data || []).map((d) => [d.id, d]));
    ch = supabase.channel(`alerts-${s.user.id}-${Math.random().toString(36).slice(2, 7)}`).on("postgres_changes", { event: "UPDATE", schema: "public", table: "documents", filter: `user_id=eq.${s.user.id}` }, ({ new: n }) => {
      const o = known.current?.[n.id] || {}; known.current = { ...known.current, [n.id]: n }; const N = s.profile.settings || {}; const who = n.client?.name || n.number; const href = `/app/documents/${n.id}`;
      if (n.status !== o.status && (n.status === "accepted" || n.status === "declined") && N.n_quote !== false) pushToast(n.status === "accepted" ? tr(`${who} a accepté le devis ${n.number}`, `${who} accepted quote ${n.number}`) : tr(`${who} a refusé le devis ${n.number}`, `${who} declined quote ${n.number}`), n.status === "accepted" ? "ok" : "info", href);
      else if (n.declared_paid_at && !o.declared_paid_at && N.n_paid !== false) pushToast(tr(`${who} indique avoir payé ${n.number}`, `${who} says they paid ${n.number}`), "ok", href);
      else if (n.viewed_at && !o.viewed_at && N.n_viewed !== false) pushToast(tr(`${who} a ouvert ${n.number}`, `${who} opened ${n.number}`), "info", href);
    }).subscribe(); })();
    return () => { ch && supabase.removeChannel(ch); }; }, [s?.user?.id]);
  useEffect(() => { load(); supabase.from("app_config").select("value").eq("key", "banner").maybeSingle().then(({ data }) => { const b = data?.value; if (b?.on && (b.fr || b.en)) setBan(b); }); }, []);
  useEffect(() => { setMenu(null); }, [p]);
  useEffect(() => { if (!menu) return; const f = (e) => { if (!e.target.closest?.("[data-menu]")) setMenu(null); }; const k = (e) => e.key === "Escape" && setMenu(null);
    document.addEventListener("pointerdown", f); document.addEventListener("keydown", k); return () => { document.removeEventListener("pointerdown", f); document.removeEventListener("keydown", k); }; }, [menu]);
  if (!s) return <div style={{ display: "grid", placeItems: "center", height: "100vh" }}><span className="u">bonova</span></div>;
  const on = (h) => (h === "/app" ? p === h : p.startsWith(h) && !(h === "/app/documents" && p === "/app/documents/nouveau"));
  const nav = [["/app", tr("Accueil", "Home"), IHome], ["/app/documents", "Documents", IDoc], ["/app/clients", "Clients", IUsers], ["/app/parametres", tr("Réglages", "Settings"), ISet]];
  return (<S.Provider value={s}><div className="shell">
    <aside className="side np">
      <Logo href="/app" />
      <div className="ws" data-menu><button className="ws-b" onClick={() => setMenu(menu === "ws" ? null : "ws")} aria-expanded={menu === "ws"}>
        {s.profile.logo ? <img src={s.profile.logo} alt="" className="ws-av" /> : <span className="ws-av">{(s.profile.business_name || s.user.email || "?").trim()[0].toUpperCase()}</span>}
        <span className="ws-t"><b>{s.profile.business_name || tr("Mon espace", "My workspace")}</b><span><i className={`ws-plan ${s.profile.plan === "pro" ? "pro" : ""}`}>{s.profile.plan === "pro" ? "Pro" : tr("Gratuit", "Free")}</i></span></span><svg className="ws-c" width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M5 6l3-3 3 3M5 10l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        {menu === "ws" && <div className="ws-m" role="menu" onClick={() => setMenu(null)}>
          <div className="ws-me"><b>{s.profile.business_name || tr("Mon espace", "My workspace")}</b><span>{s.user.email}</span></div><hr />
          <Link role="menuitem" href="/app/parametres?t=profil">{tr("Coordonnées", "Details")}</Link><Link role="menuitem" href="/app/parametres?t=modele">{tr("Apparence des documents", "Document design")}</Link><Link role="menuitem" href="/app/parametres?t=paiement">{tr("Moyens de paiement", "Payment methods")}</Link><Link role="menuitem" href="/app/parametres?t=offre">{tr("Abonnement", "Subscription")}{s.profile.plan !== "pro" && <em className="ws-up">Pro</em>}</Link>
          <hr /><button role="menuitem" onClick={() => setLang(lang === "en" ? "fr" : "en")}>{lang === "en" ? "Français" : "English"}</button>
          <button role="menuitem" onClick={async () => { await supabase.auth.signOut(); clearUserState(); r.replace("/"); }}><IOut width="15" height="15" /> {tr("Se déconnecter", "Sign out")}</button></div>}</div>
      <div className="new-w" data-menu><Link href="/app/documents/nouveau" className="b k new"><IPlus width="17" height="17" /> {tr("Nouvelle facture", "New invoice")}</Link>
        <button className="b k new-more" aria-expanded={menu === "new"} aria-label={tr("Autre document", "Other document")} onClick={() => setMenu(menu === "new" ? null : "new")}>⌄</button>
        {menu === "new" && <div className="ws-m" role="menu" onClick={() => setMenu(null)}><Link role="menuitem" href="/app/documents/nouveau?kind=invoice"><b>{tr("Facture", "Invoice")}</b><small>{tr("Demander un paiement", "Request payment")}</small></Link><Link role="menuitem" href="/app/documents/nouveau?kind=quote"><b>{tr("Devis", "Quote")}</b><small>{tr("Proposer un prix", "Propose a price")}</small></Link><Link role="menuitem" href="/app/documents/nouveau?kind=receipt"><b>{tr("Reçu", "Receipt")}</b><small>{tr("Confirmer un paiement reçu", "Confirm a payment")}</small></Link></div>}</div>
      <nav className="snav">{nav.map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
        {s.profile.role === "admin" && <Link href="/app/admin" className={on("/app/admin") ? "on" : ""}><IShield />Admin</Link>}</nav>
      <div style={{ flex: 1 }} />
      {s.profile.plan !== "pro" && <Link href="/app/parametres?t=offre" className="pro-c"><b>Bonova Pro</b><span>{tr("Modèles illimités, signature et cachet, sans mention Bonova.", "Unlimited templates, signature and stamp, no Bonova line.")}</span><em>{proPrice(s.profile.country, lang).month} {tr("/ mois", "/ month")}</em></Link>}
    </aside>
    <main className="main">{ban && (() => { const t = (lang === "en" ? ban.en : ban.fr) || ban.fr || ban.en; let seen = null; try { seen = localStorage.getItem("bnv_ban"); } catch {} return seen === t ? null : <div className="app-banner np" role="status"><span>{t}</span><button aria-label={tr("Fermer", "Close")} onClick={() => { try { localStorage.setItem("bnv_ban", t); } catch {} setBan(null); }}>×</button></div>; })()}{children}</main>
    <nav className="tabbar np" aria-label="Navigation">
      {nav.slice(0, 2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
      <Link href="/app/documents/nouveau" className="plus" aria-label={tr("Nouvelle facture", "New invoice")}><span className="c"><IPlus /></span></Link>
      {nav.slice(2).map(([h, l, I]) => <Link key={h} href={h} className={on(h) ? "on" : ""}><I />{l}</Link>)}
    </nav>
    {!p.startsWith("/app/documents/nouveau") && <Support lang={lang} />}
    {toast && <div className={`toast ${toast.t}`} role={toast.t === "err" ? "alert" : "status"}><i aria-hidden>{toast.t === "err" ? "!" : toast.t === "info" ? "i" : "✓"}</i><span>{toast.m}</span>{toast.href && p !== toast.href && <Link href={toast.href} onClick={() => setToast(null)}>{tr("Voir", "View")}</Link>}<button aria-label={tr("Fermer", "Close")} onClick={() => setToast(null)}>×</button></div>}
  </div></S.Provider>);
}
