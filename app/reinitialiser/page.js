"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Brand";
import { useT } from "../../lib/i18n";
export default function Page() {
  const { tr } = useT(); const r = useRouter();
  const [ready, setReady] = useState(false); const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((ev, s) => { if (s && (ev === "PASSWORD_RECOVERY" || ev === "SIGNED_IN" || ev === "INITIAL_SESSION")) setReady(true); });
    const code = new URLSearchParams(location.search).get("code");
    if (code) supabase.auth.exchangeCodeForSession(code).then(({ error }) => error ? setMsg({ bad: 1, t: tr("Lien expiré ou déjà utilisé. Redemandez un lien.", "Link expired or already used. Request a new one.") }) : setReady(true));
    else supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); else setTimeout(() => supabase.auth.getSession().then(({ data }) => data.session ? setReady(true) : setMsg({ bad: 1, t: tr("Lien expiré ou invalide. Redemandez un lien.", "Link expired or invalid. Request a new one.") })), 1500); });
    return () => sub.subscription.unsubscribe();
  }, []);
  async function submit(e) { e.preventDefault(); if (pw !== pw2) return setMsg({ bad: 1, t: tr("Les deux mots de passe ne correspondent pas.", "The passwords don't match.") });
    setBusy(true); const { error } = await supabase.auth.updateUser({ password: pw }); setBusy(false);
    if (error) return setMsg({ bad: 1, t: error.message }); setMsg({ t: tr("Mot de passe modifié. Redirection…", "Password updated. Redirecting…") }); setTimeout(() => r.replace("/app"), 1200); }
  return (<div className="auth"><div className="auth-img"><h2>{tr("Nouveau", "New")}<br /><span className="serif">{tr("mot de passe.", "password.")}</span></h2></div>
    <div className="auth-f"><div style={{ width: "100%", maxWidth: 400 }}><Logo />
      <h1 style={{ fontSize: 48, margin: "34px 0 10px" }}>{tr("Choisissez un mot de passe", "Choose a password")}</h1>
      {msg && <div className={`note ${msg.bad ? "bad" : "ok"}`} style={{ marginBottom: 16 }}>{msg.t}</div>}
      <form onSubmit={submit}>
        <label className="f"><span>{tr("Nouveau mot de passe", "New password")}</span><input type="password" required minLength={6} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={tr("6 caractères minimum", "6 characters minimum")} /></label>
        <label className="f"><span>{tr("Confirmer", "Confirm")}</span><input type="password" required minLength={6} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} /></label>
        <button className="b k full" disabled={busy || !ready}>{busy ? "…" : ready ? tr("Enregistrer", "Save") : tr("Vérification du lien…", "Checking link…")}</button></form>
      <p className="mute" style={{ fontSize: 14, marginTop: 18 }}><a href="/connexion">{tr("← Retour à la connexion", "← Back to log in")}</a></p>
    </div></div></div>);
}
