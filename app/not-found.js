import Link from "next/link";
export const metadata = { title: "Page introuvable", robots: { index: false } };
export default function NotFound() {
  return (<main className="wrap" style={{ padding: "90px 20px", maxWidth: 640 }}>
    <p className="mute" style={{ fontFamily: "var(--f-mono)", fontSize: 13 }}>404</p>
    <h1 style={{ margin: "8px 0 14px" }}>Page introuvable</h1>
    <p>Cette page n'existe pas ou a été déplacée. <span lang="en" className="mute">This page does not exist or has moved.</span></p>
    <div className="row" style={{ gap: 12, marginTop: 24, flexWrap: "wrap" }}><Link href="/" className="b k">Accueil</Link><Link href="/en" className="b o">English home</Link><Link href="/essai" className="b o">Faire une facture</Link></div>
  </main>);
}
