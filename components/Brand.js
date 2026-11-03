import Link from "next/link";
import LangSet from "./LangSet";
// Marque : un talon de carnet à souches (ticket perforé). Le "souche" = la preuve qu'on garde.
export function Mark({ size = 24, c = "currentColor" }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M2 3h20v6.2a2.8 2.8 0 000 5.6V21H2v-6.2a2.8 2.8 0 000-5.6z" fill={c} /><path d="M8.5 6.5v11" stroke="var(--paper,#F2F0EA)" strokeWidth="1.4" strokeDasharray="1.6 1.6" /></svg>);
}
export function Logo({ href = "/", light }) {
  return <Link href={href} className="logo" aria-label="Bonova" style={light ? { color: "var(--paper)" } : null}><Mark />bonova</Link>;
}
const T = {
  fr: { tools: "Outils", blog: "Guides", price: "Tarifs", login: "Connexion", cta: "Faire une facture", home: "/", try: "/essai", other: ["/en", "EN"] },
  en: { tools: "Tools", blog: "Guides", price: "Pricing", login: "Log in", cta: "Make an invoice", home: "/en", try: "/en/invoice-generator", other: ["/", "FR"] },
};
export function SiteNav({ lang = "fr" }) {
  const t = T[lang];
  return (<header className="nav"><div className="wrap nav-in">
    <LangSet l={lang} />
    <Logo href={t.home} />
    <nav className="links">
      <Link href={lang === "en" ? "/en/tools" : "/outils"} className="hide">{t.tools}</Link>
      <Link href={lang === "en" ? "/en/blog" : "/blog"} className="hide">{t.blog}</Link>
      <Link href={`${t.home === "/" ? "" : t.home}/#pricing`} className="hide">{t.price}</Link>
      <Link href={t.other[0]} hrefLang={t.other[1].toLowerCase()} className="lng">{t.other[1]}</Link>
      <Link href="/connexion" className="hide-s">{t.login}</Link>
      <Link href={t.try} className="b s">{t.cta} →</Link>
    </nav></div></header>);
}
export function SiteFooter({ lang = "fr" }) {
  const en = lang === "en";
  return (<footer className="foot"><div className="wrap">
    <div className="foot-big">bonova</div>
    <div className="cols">
      <div><p style={{ maxWidth: 340, margin: 0 }}>{en ? "Invoices, quotes and receipts for independent workers — in Africa and everywhere else. Get paid by Mobile Money, bank transfer, card or PayPal." : "Factures, devis et reçus pour les indépendants — en Afrique et partout ailleurs. Encaissez par Mobile Money, virement, carte ou PayPal."}</p></div>
      <div><h4>{en ? "Product" : "Produit"}</h4><Link href={en ? "/en/invoice-generator" : "/essai"}>{en ? "Make an invoice" : "Faire une facture"}</Link><Link href={en ? "/en#pricing" : "/#pricing"}>{en ? "Pricing" : "Tarifs"}</Link><Link href="/connexion">{en ? "Log in" : "Connexion"}</Link><Link href={en ? "/" : "/en"}>{en ? "Français" : "English"}</Link></div>
      <div><h4>{en ? "Free tools" : "Outils gratuits"}</h4>{en ? <><Link href="/en/invoice-generator">Invoice generator</Link><Link href="/en/tools/vat-calculator">VAT calculator</Link><Link href="/en/tools/amount-in-words">Amount in words</Link></> : <><Link href="/outils/generateur-facture">Générateur de facture</Link><Link href="/outils/calcul-tva">Calcul TVA</Link><Link href="/outils/montant-en-lettres">Montant en lettres</Link></>}</div>
      <div><h4>{en ? "Guides" : "Guides"}</h4>{en ? <><Link href="/en/blog/how-to-invoice-international-clients-from-africa">Invoicing clients abroad</Link><Link href="/en/blog/get-paid-mobile-money-invoice">Mobile Money invoices</Link><Link href="/en/blog/freelance-invoice-template-free">Free invoice template</Link><Link href="/en/blog">All guides</Link></> : <><Link href="/blog/mentions-obligatoires-facture-ohada">Mentions OHADA</Link><Link href="/blog/facturer-client-etranger">Facturer un client à l'étranger</Link><Link href="/blog/facture-freelance-france">Facture freelance en France</Link><Link href="/blog">Tous les guides</Link></>}</div>
    </div>
    <p className="fine-print">© 2026 Bonova. {en ? "Tax information in guides is indicative: always check with your tax office or an accountant." : "Les informations fiscales des guides sont indicatives : vérifiez toujours auprès de votre administration fiscale ou d'un comptable."}</p>
  </div></footer>);
}
