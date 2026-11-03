"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";
// Connecté : accès direct à l'application au lieu de « Connexion ».
export default function NavAuth({ lang = "fr", login, cta, tryHref }) {
  const [u, setU] = useState(null);
  useEffect(() => { supabase.auth.getSession().then(({ data }) => setU(data.session?.user || null)); const { data: l } = supabase.auth.onAuthStateChange((_, s) => setU(s?.user || null)); return () => l?.subscription?.unsubscribe(); }, []);
  if (u) return (<><Link href="/app/documents/nouveau" className="hide-s">{lang === "en" ? "New invoice" : "Nouvelle facture"}</Link><Link href="/app" className="b s">{lang === "en" ? "Open the app" : "Ouvrir l'app"} →</Link></>);
  return (<><Link href="/connexion" className="hide-s">{login}</Link><Link href={tryHref} className="b s">{cta}</Link></>);
}
