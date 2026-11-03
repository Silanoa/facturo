"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Brand";
import { useT } from "../../lib/i18n";
import { SUPPORT, waSupport } from "../../lib/site";
async function afterLogin(r, next) {
  let draft = null, prof = null; try { draft = JSON.parse(localStorage.getItem("bnv_draft") || localStorage.getItem("kola_draft") || "null"); prof = JSON.parse(localStorage.getItem("bnv_profile") || localStorage.getItem("kola_profile") || "null"); } catch {}
  if (prof) { const { data: u } = await supabase.auth.getUser(); const { data: cur } = await supabase.from("profiles").select("business_name").eq("id", u.user.id).single();
    if (!cur?.business_name) { const { business_name, phone, address, ifu, rccm, momo, template, accent, country, doc_lang, logo } = prof; const lang = localStorage.getItem("lang") || "fr";
      await supabase.from("profiles").update({ business_name, phone, address, ifu, rccm, momo: (momo || []).filter(m => m.number || m.iban || m.url), currency: draft?.currency || prof.currency, template, accent, country, doc_lang: doc_lang || lang, lang, ...(logo ? { logo } : {}) }).eq("id", u.user.id); }
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
    if (mode === "forgot") { const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: location.origin + "/reinitialiser" }); setBusy(false);
      return setMsg(error ? { bad: 1, t: /rate|seconds/i.test(error.message) ? tr("Trop de demandes. Réessayez dans quelques minutes.", "Too many requests. Try again in a few minutes.") : error.message } : { t: tr("Si un compte existe pour cette adresse, un lien de réinitialisation vient d'être envoyé. Pensez à vérifier les spams.", "If an account exists for this address, a reset link has been sent. Check your spam folder.") }); }
    if (mode === "signup") { const { error: e1 } = await supabase.rpc("register", { p_email: em, p_password: pw });
      if (e1) { setBusy(false); const m = e1.message; return setMsg(m.includes("TAKEN") ? tr("Un compte existe déjà avec cet email. Connectez-vous.", "An account already exists with this email. Log in.") : m.includes("INVALID") ? tr("Adresse email invalide.", "Invalid email address.") : m.includes("SHORT") ? tr("Mot de passe trop court : 6 caractères minimum.", "Password too short: 6 characters minimum.") : m.includes("RATE_LIMIT") ? tr("Trop d’inscriptions depuis votre connexion. Réessayez dans une heure.", "Too many sign-ups from your network. Try again in an hour.") : m); } }
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (error) { setBusy(false); return setMsg(error.message === "Invalid login credentials" ? tr("Email ou mot de passe incorrect.", "Wrong email or password.") : error.message); }
    afterLogin(r, next);
  }
  const su = mode === "signup"; const fg = mode === "forgot"; const note = msg && (typeof msg === "string" ? { bad: 1, t: msg } : msg);
  return (<div className="auth">
    <div className="auth-img"><span className="u" style={{ color: "#ffffffaa" }}>№ 0001</span><h2>{tr("Une facture.", "An invoice.")}<br />{tr("Envoyée.", "Sent.")}<br /><span className="serif">{tr("Payée.", "Paid.")}</span></h2><p className="mono" style={{ fontSize: 13, color: "#E4E7FF", margin: 0 }}>Mobile Money · IBAN · Stripe · PayPal · Wise</p></div>
    <div className="auth-f"><div style={{ width: "100%", maxWidth: 400 }}>
      <Logo /><h1 style={{ fontSize: 56, margin: "34px 0 10px" }}>{fg ? tr("Mot de passe oublié", "Forgot password") : su ? (fromTrial ? tr("Gardez votre facture.", "Keep your invoice.") : tr("Créez votre espace.", "Create your space.")) : tr("Bon retour.", "Welcome back.")}</h1>
      <p className="mute" style={{ margin: "0 0 26px" }}>{fg ? tr("Indiquez votre email : nous vous envoyons un lien pour choisir un nouveau mot de passe.", "Enter your email and we'll send you a link to choose a new password.") : su ? (fromTrial ? tr("Votre brouillon sera importé automatiquement. Gratuit, illimité.", "Your draft is imported automatically. Free, unlimited.") : tr("Gratuit, factures illimitées, sans carte bancaire.", "Free, unlimited invoices, no card.")) : tr("Retrouvez vos factures et ce qu'on vous doit.", "Your invoices and who owes you.")}</p>
      {note && <div className={`note ${note.bad ? "bad" : "ok"}`} style={{ marginBottom: 16 }}>{note.t}</div>}
      <form onSubmit={submit}>
        <label className="f"><span>Email</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("vous@exemple.com", "you@example.com")} /></label>
        {!fg && <label className="f"><span>{tr("Mot de passe", "Password")}</span><input type="password" required minLength={6} autoComplete={su ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder={tr("6 caractères minimum", "6 characters minimum")} /></label>}
        <button className="b k full" disabled={busy} style={{ marginTop: 6 }}>{busy ? "…" : fg ? tr("Envoyer le lien", "Send the link") : su ? tr("Créer mon compte", "Create my account") : tr("Se connecter", "Log in")}</button></form>
      {mode === "login" && <p style={{ margin: "12px 0 0", fontSize: 14 }}><button type="button" className="lnk" onClick={() => { setMode("forgot"); setMsg(null); }}>{tr("Mot de passe oublié ?", "Forgot password?")}</button></p>}
      {fg && <p className="mute" style={{ fontSize: 14, marginTop: 16 }}>{tr("Pas reçu ? Écrivez-nous sur ", "Nothing received? Message us on ")}<a href={waSupport(tr("Bonjour, je n'arrive pas à réinitialiser mon mot de passe Bonova.", "Hi, I can't reset my Bonova password."))} target="_blank" rel="noopener">WhatsApp</a>{tr(" ou à ", " or at ")}<a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a>.</p>}
      <p className="mute" style={{ fontSize: 15, marginTop: 20 }}>{fg ? <button className="lnk" onClick={() => { setMode("login"); setMsg(null); }}>{tr("← Retour à la connexion", "← Back to log in")}</button> : null}{fg ? null : <>{su ? tr("Déjà inscrit ? ", "Already have an account? ") : tr("Pas encore de compte ? ", "No account yet? ")}<button className="lnk" onClick={() => { setMode(su ? "login" : "signup"); setMsg(null); }}>{su ? tr("Se connecter", "Log in") : tr("Créer un compte", "Sign up")}</button></>}</p>
      <p className="mute" style={{ fontSize: 14, marginTop: 12 }}><a href={tr("/essai", "/en/invoice-generator")}>{tr("Ou faites une facture sans compte →", "Or make an invoice without an account →")}</a></p>
      {!su && <p className="mute" style={{ fontSize: 13.5, marginTop: 28, borderTop: "1.5px solid var(--rule)", paddingTop: 16 }}>{tr("Pour visiter", "Demo account")} : <b>demo.facturo@gmail.com</b> / <b>Test1234!</b></p>}
    </div></div>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Form /></Suspense>; }
