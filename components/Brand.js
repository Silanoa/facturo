import Link from "next/link";
// La noix de kola : offerte pour sceller un accord. Fendue en deux = deux parties, un engagement.
export function Mark({ size = 26, c = "#B8321A", seam = "#141210" }) {
  return (<svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3c9.5 0 15 7.6 15 17s-5.5 17-15 17S5 29.4 5 20 10.5 3 20 3z" fill={c}/><path d="M20 5.5c-3.4 5-3.4 24 0 29" stroke={seam} strokeWidth="2.6" fill="none" strokeLinecap="round"/></svg>);
}
export function Logo({ href = "/", light }) {
  return <Link href={href} className="logo" aria-label="Kola, accueil" style={light ? { color: "var(--paper)" } : null}><Mark seam={light ? "#F3EFE6" : "#141210"} />kola</Link>;
}
export function SiteNav() {
  return (<header className="wrap nav">
    <Logo />
    <nav className="links">
      <Link href="/outils" className="hide">Outils gratuits</Link>
      <Link href="/blog" className="hide">Guides</Link>
      <Link href="/#tarifs" className="hide">Tarifs</Link>
      <Link href="/connexion">Connexion</Link>
      <Link href="/essai" className="b s k">Essayer</Link>
    </nav></header>);
}
export function SiteFooter() {
  return (<footer className="foot"><div className="wrap">
    <div className="cols">
      <div><Logo /><p className="mute" style={{ maxWidth: 320, marginTop: 14 }}>Factures, devis et reçus pour les indépendants et petites entreprises d'Afrique et de la diaspora. Pensé pour l'Afrique de l'Ouest et du Centre.</p></div>
      <div><h4>Produit</h4><Link href="/essai">Faire une facture</Link><Link href="/#tarifs">Tarifs</Link><Link href="/connexion">Connexion</Link><Link href="/en">English</Link></div>
      <div><h4>Outils gratuits</h4><Link href="/outils/generateur-facture">Générateur de facture</Link><Link href="/outils/calcul-tva">Calcul TVA 18 %</Link><Link href="/outils/montant-en-lettres">Montant en lettres</Link></div>
      <div><h4>Guides</h4><Link href="/blog/mentions-obligatoires-facture-ohada">Mentions OHADA</Link><Link href="/blog/modele-facture-benin">Facture au Bénin</Link><Link href="/blog/facture-auto-entrepreneur-senegal">Facture au Sénégal</Link><Link href="/blog">Tous les guides</Link></div>
    </div>
    <p className="mute" style={{ marginTop: 36, fontSize: 13 }}>© 2026 Kola. Les informations fiscales des guides sont données à titre indicatif : vérifiez toujours auprès de votre administration fiscale ou d'un comptable.</p>
  </div></footer>);
}
