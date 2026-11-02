"use client";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Brand";
async function afterLogin(r, next) {
  let draft = null, prof = null; try { draft = JSON.parse(localStorage.getItem("kola_draft") || "null"); prof = JSON.parse(localStorage.getItem("kola_profile") || "null"); } catch {}
  if (prof) { const { data: u } = await supabase.auth.getUser(); const { data: cur } = await supabase.from("profiles").select("business_name").eq("id", u.user.id).single();
    if (!cur?.business_name) { const { business_name, phone, address, ifu, rccm, momo, currency, template, accent } = prof; await supabase.from("profiles").update({ business_name, phone, address, ifu, rccm, momo: (momo || []).filter(m => m.number), currency, template, accent }).eq("id", u.user.id); }
    localStorage.removeItem("kola_profile"); }
  if (draft && (draft.items || []).some(i => +i.price)) return r.replace("/app/documents/nouveau?import=1");
  r.replace(next && next.startsWith("/app") ? next : "/app");
}
function Form() {
  const sp = useSearchParams(); const r = useRouter(); const next = sp.get("next");
  const [mode, setMode] = useState(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState(""); const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  const fromTrial = sp.get("from") === "essai";
  useEffect(() => { supabase.auth.getSession().then(({ data }) => data.session && afterLogin(r, next)); }, []);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null); const em = email.trim().toLowerCase();
    if (mode === "signup") { const { error: e1 } = await supabase.rpc("register", { p_email: em, p_password: pw });
      if (e1) { setBusy(false); const m = e1.message; return setMsg(m.includes("TAKEN") ? "Un compte existe déjà avec cet email. Connectez-vous." : m.includes("INVALID") ? "Adresse email invalide." : m.includes("SHORT") ? "Mot de passe trop court : 6 caractères minimum." : m); } }
    const { error } = await supabase.auth.signInWithPassword({ email: em, password: pw });
    if (error) { setBusy(false); return setMsg(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message); }
    afterLogin(r, next);
  }
  const su = mode === "signup";
  return (<div className="auth">
    <div className="auth-img"><img src="/img/tailor.webp" alt="Couturière dans son atelier à Cotonou" /><p className="quote" style={{ color: "#fff", position: "absolute", left: 36, right: 36, bottom: 40, fontSize: 34 }}>Une facture claire, un lien, vos numéros Mobile Money. Le reste suit.</p></div>
    <div className="auth-f"><div style={{ width: "100%", maxWidth: 400 }}>
      <Logo /><h1 style={{ fontSize: 40, margin: "34px 0 8px" }}>{su ? (fromTrial ? "Gardez votre facture." : "Créez votre espace.") : "Bon retour."}</h1>
      <p className="mute" style={{ margin: "0 0 26px" }}>{su ? (fromTrial ? "Votre brouillon sera importé automatiquement. 10 documents offerts chaque mois." : "Gratuit, 10 documents par mois, sans carte bancaire.") : "Retrouvez vos factures et ce qu'on vous doit."}</p>
      {msg && <div className="note bad" style={{ marginBottom: 16 }}>{msg}</div>}
      <form onSubmit={submit}>
        <label className="f"><span>Email</span><input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" /></label>
        <label className="f"><span>Mot de passe</span><input type="password" required minLength={6} autoComplete={su ? "new-password" : "current-password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="6 caractères minimum" /></label>
        <button className="b k full" disabled={busy} style={{ marginTop: 6 }}>{busy ? "Un instant…" : su ? "Créer mon compte" : "Se connecter"}</button></form>
      <p className="mute" style={{ fontSize: 15, marginTop: 20 }}>{su ? "Déjà inscrit ? " : "Pas encore de compte ? "}<button className="lnk" onClick={() => { setMode(su ? "login" : "signup"); setMsg(null); }}>{su ? "Se connecter" : "Créer un compte"}</button></p>
      {!su && <p className="mute" style={{ fontSize: 13.5, marginTop: 28, borderTop: "1px solid var(--line)", paddingTop: 16 }}>Pour visiter : <b>demo.facturo@gmail.com</b> / <b>Test1234!</b></p>}
    </div></div>
  </div>);
}
export default function Page() { return <Suspense fallback={null}><Form /></Suspense>; }
