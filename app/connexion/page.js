"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Brand";
import { useT } from "../../lib/i18n";
async function afterLogin(r, next) {
  let draft = null, prof = null; try { draft = JSON.parse(localStorage.getItem("bnv_draft") || localStorage.getItem("kola_draft") || "null"); prof = JSON.parse(localStorage.getItem("bnv_profile") || localStorage.getItem("kola_profile") || "null"); } catch {}
  if (prof) { const { data: u } = await supabase.auth.getUser(); const { data: cur } = await supabase.from("profiles").select("business_name").eq("id", u.user.id).single();
    if (!cur?.business_name) { const { business_name, phone, address, ifu, rccm, momo, template, accent, country, doc_lang } = prof; const lang = localStorage.getItem("lang") || "fr";
      await supabase.from("profiles").update({ business_name, phone, address, ifu, rccm, momo: (momo || []).filter(m => m.number || m.iban || m.url), currency: draft?.currency || prof.currency, template, accent, country, doc_lang: doc_lang || lang, lang }).eq("id", u.user.id); }
    localStorage.removeItem("bnv_profile"); localStorage.removeItem("kola_profile"); }
  else { const lang = localStorage.getItem("lang"); if (lang) { const { data: u } = await supabase.auth.getUser(); const { data: cur } = await supabase.from("profiles").select("business_name").eq("id", u.user.id).single(); if (!cur?.business_name) await supabase.from("profiles").update({ lang, doc_lang: lang, ...(lang === "en" ? { currency: "USD", country: "US" } : {}) }).eq("id", u.user.id); } }
  if (draft && (draft.items || []).some(i => +i.price)) return r.replace("/app/documents/nouveau?import=1");
  r.replace(next && next.startsWith("/app") ? next : "/app");
}
function Form() {
  const { tr } = useT();
  const sp = useSearchParams(); const r = useRouter(); const next = sp.get("next");
  const [mode, setMode] = useState(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  const fromTrial = sp.get("from") === "essai";
  useEffect(() => { supabase.auth.getSession().then(({ data }) => data.session && afterLogin(r, next)); }, []);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null); const em = email.trim().toLowerCase();
    if (mode === "signup") { const { error: e1 } = await supabase.rpc("register", { p_email: em, p_password: pw });
      if (e1) { setBusy(false); const m = e1.message; return setMsg(m.includes("TAKEN") ? tr("Un compte existe déjà avec cet email. Connectez-vous.", "An account already exists with this email. Log in.") : m.includes("INVALID") ? tr("Adresse email invalide.", "Invalid email address.") : m.includes("SHORT") ? tr("Mot de passe trop court : 6 caractères minimum.", "Password too short: 6 characters minimum.") : m.includes("RATE_LIMIT") ? tr("Trop d’inscriptions depuis votre connexion. Réessayez dans une heure.", "Too many sign-ups from your network. Try again in an hour.") : m); } }
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (error) { setBusy(false); return setMsg(error.message === "Invalid login credentials" ? tr("Email ou mot de passe incorrect.", "Wrong email or password.") : error.message); }
    afterLogin(r, next);
  }
  const su = mode === "signup";
  return (<div className="auth">
    <div className="auth-img"><span className="u" style={{ color: "#ffffffaa" }}>№ 0001</span><h2>{tr("Une facture.", "An invoice.")}<br />{tr("Envoyée.", "Sent.")}<br /><span className="serif">{tr("Payée.", "Paid.")}</span></h2><p className="mono" style={{ fontSize: 13, color: "#E4E7FF", margin: 0 }}>Mobile Money · IBAN · Stripe · PayPal · Wise</p></div>
    <div className="auth-f"><div style={{ width: "100%", maxWidth: 400 }}>
      <Logo /><h1 style={{ fontSize: 56, margin: "34px 0 10px" }}>{su ? (fromTrial ? tr("Gardez votre facture.", "Keep your invoice.") : tr("Créez votre espace.", "Create your space.")) : tr("Bon retour.", "Welcome back.")}</h1>
      <p className="mute" style={{ margin: "0 0 26px" }}>{su ? (fromTrial ? tr("Votre brouillon sera importé automatiquement. Gratuit, illimité.", "Your draft is imported automatically. Free, unlimited.") : tr("Gratuit, factures illimitées, sans carte bancaire.", "Free, unlimited invoices, no card.")) : tr("Retrouvez vos factures et ce qu'on vous doit.", "Your invoices and who owes you.")}</p>
      {msg && <div className="note bad" style={{ marginBottom: 16 }}>{msg}</div>}
      <form onSubmit={submit}>
        <label className="f"><span>Email</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("vous@exemple.com", "you@example.com")} /></label>
        <label className="f"><span>{tr("Mot de passe", "Password")}</span><input type="password" required minLength={6} autoComplete={su ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={tr("6 caractères minimum", "6 characters minimum")} /></label>
        <button className="b k full" disabled={busy} style={{ marginTop: 6 }}>{busy ? "…" : su ? tr("Créer mon compte", "Create my account") : tr("Se connecter", "Log in")}</button></form>
      <p className="mute" style={{ fontSize: 15, marginTop: 20 }}>{su ? tr("Déjà inscrit ? ", "Already have an account? ") : tr("Pas encore de compte ? ", "No account yet? ")}<button className="lnk" onClick={() => { setMode(su ? "login" : "signup"); setMsg(null); }}>{su ? tr("Se connecter", "Log in") : tr("Créer un compte", "Sign up")}</button></p>
      <p className="mute" style={{ fontSize: 14, marginTop: 12 }}><a href={tr("/essai", "/en/invoice-generator")}>{tr("Ou faites une facture sans compte →", "Or make an invoice without an account →")}</a></p>
      {!su && <p className="mute" style={{ fontSize: 13.5, marginTop: 28, borderTop: "1.5px solid var(--rule)", paddingTop: 16 }}>{tr("Pour visiter", "Demo account")} : <b>demo.facturo@gmail.com</b> / <b>Test1234!</b></p>}
    </div></div>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Form /></Suspense>; }
