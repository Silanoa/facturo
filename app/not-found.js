import Link from "next/link";
import { SiteNav, SiteFooter } from "../components/Brand";
export const metadata = { title: "Page introuvable", robots: { index: false } };
export default function NotFound() {
  return (<><SiteNav lang="fr" /><main className="wrap" style={{ padding: "80px 20px 120px", maxWidth: 720 }}>
    <p className="u">Erreur 404</p>
    <h1 style={{ margin: "10px 0 16px", fontSize: "clamp(40px,6vw,72px)" }}>Page introuvable.</h1>
    <p className="mute" style={{ fontSize: 18, margin: 0 }}>Cette page n'existe pas ou a été déplacée.</p>
    <p lang="en" className="mute" style={{ fontSize: 15, margin: "6px 0 0" }}>This page does not exist or has moved.</p>
    <div className="row" style={{ gap: 12, marginTop: 28, flexWrap: "wrap" }}><Link href="/" className="b k">Retour à l'accueil</Link><Link href="/essai" className="b o">Faire une facture</Link><Link href="/en" hrefLang="en" className="b o">English</Link></div>
  </main><SiteFooter lang="fr" /></>);
}
