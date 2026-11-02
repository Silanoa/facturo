"use client";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
function Form() {
  const sp = useSearchParams(); const r = useRouter();
  const [mode, setMode] = useState(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null); const [busy, setBusy] = useState(false);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => data.session && r.replace("/app")); }, [r]);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setMsg(null);
    const fn = mode === "signup" ? supabase.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + "/app" } }) : supabase.auth.signInWithPassword({ email, password: pw });
    const { data, error } = await fn; setBusy(false);
    if (error) return setMsg({ bad: true, t: error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect." : error.message });
    if (mode === "signup" && !data.session) return setMsg({ t: "Compte créé. Ouvrez l'email de confirmation que nous venons d'envoyer, puis revenez vous connecter." });
    r.replace("/app");
  }
  return (<div className="pattern" style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20}}>
    <div style={{width:"100%",maxWidth:420}}>
      <Link href="/" className="logo" style={{justifyContent:"center",marginBottom:22}}><i>F</i>Facturo</Link>
      <form className="card" onSubmit={submit}>
        <h1 style={{fontSize:28,margin:"0 0 6px"}}>{mode === "signup" ? "Créer votre espace" : "Bon retour"}</h1>
        <p className="muted" style={{marginTop:0}}>{mode === "signup" ? "10 documents offerts chaque mois, sans carte." : "Connectez-vous pour retrouver vos factures."}</p>
        {msg && <div className={msg.bad ? "alert" : "ok"}>{msg.t}</div>}
        <div className="field"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@entreprise.com"/></div>
        <div className="field"><label>Mot de passe</label><input type="password" required minLength={6} value={pw} onChange={e=>setPw(e.target.value)} placeholder="6 caractères minimum"/></div>
        <button className="btn" style={{width:"100%",justifyContent:"center"}} disabled={busy}>{busy ? "Un instant…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}</button>
        <p className="muted" style={{textAlign:"center",fontSize:14,marginBottom:0}}>
          {mode === "signup" ? "Déjà inscrit ? " : "Pas encore de compte ? "}
          <a href="#" onClick={e=>{e.preventDefault();setMode(mode==="signup"?"login":"signup");setMsg(null);}} style={{color:"var(--clay)",fontWeight:700}}>{mode === "signup" ? "Se connecter" : "Créer un compte"}</a></p>
      </form>
    </div></div>);
}
export default function Page() { return <Suspense><Form/></Suspense>; }
