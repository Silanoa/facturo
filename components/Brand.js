import Link from "next/link";
import NavAuth from "./NavAuth";
import LangSet from "./LangSet";
import Support from "./Support";
import { SUPPORT, waSupport, mailSupport } from "../lib/site";
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
      <NavAuth lang={lang} login={t.login} cta={`${t.cta} →`} tryHref={t.try} />
    </nav></div></header>);
}
export function SiteFooter({ lang = "fr" }) {
  const en = lang === "en"; const L = (h, t) => <Link href={h}>{t}</Link>;
  const cols = en ? [
    ["Product", [["/en/invoice-generator", "Make an invoice"], ["/en/example", "Invoice example"], ["/en#pricing", "Pricing"], ["/connexion?mode=signup", "Create a free account"]]],
    ["Free tools", [["/en/invoice-generator", "Invoice generator"], ["/en/tools/vat-calculator", "VAT calculator"], ["/en/tools/amount-in-words", "Amount in words"]]],
    ["Guides", [["/en/blog/how-to-invoice-international-clients-from-africa", "Invoicing clients abroad"], ["/en/blog/get-paid-mobile-money-invoice", "Getting paid by Mobile Money"], ["/en/blog/freelance-invoice-template-free", "Freelance invoice template"], ["/en/blog", "All guides →"]]],
  ] : [
    ["Produit", [["/essai", "Faire une facture"], ["/exemple", "Exemple de facture"], ["/#pricing", "Tarifs"], ["/connexion?mode=signup", "Créer un compte gratuit"]]],
    ["Outils gratuits", [["/outils/generateur-facture", "Générateur de facture"], ["/outils/calcul-tva", "Calcul de TVA"], ["/outils/montant-en-lettres", "Montant en lettres"], ["/modele-de-facture", "Modèle de facture"]]],
    ["Par pays", [["/facture-senegal", "Facture au Sénégal"], ["/facture-cote-divoire", "Facture en Côte d'Ivoire"], ["/facture-benin", "Facture au Bénin"], ["/logiciel-de-facturation", "Logiciel de facturation"]]],
    ["Guides", [["/blog/mentions-obligatoires-facture-ohada", "Mentions obligatoires (OHADA)"], ["/blog/facturer-client-etranger", "Facturer un client à l'étranger"], ["/blog/facture-freelance-france", "Facture freelance en France"], ["/blog", "Tous les guides →"]]],
  ];
  return (<footer className="foot"><div className="wrap">
    <div className="foot-big">bonova</div>
    <div className="cols">
      <div className="foot-about"><p>{en ? "Quotes, invoices and receipts for freelancers and small businesses. Get paid by Mobile Money, transfer, card or PayPal." : "Devis, factures et reçus pour les indépendants et les petites entreprises. Faites-vous payer par Mobile Money, virement, carte ou PayPal."}</p>
        <h4>{en ? "Help" : "Aide"}</h4>
        {SUPPORT.wa && <a href={waSupport("", lang)} target="_blank" rel="noreferrer">WhatsApp</a>}<a href={mailSupport("", lang)}>{SUPPORT.email}</a></div>
      {cols.map(([h, ls]) => <nav key={h} aria-label={h}><h4>{h}</h4>{ls.map(([u, t]) => <span key={u}>{L(u, t)}</span>)}</nav>)}
    </div>
    <div className="foot-bar">
      <span>© {new Date().getFullYear()} Bonova</span>
      {L(en ? "/en/privacy" : "/confidentialite", en ? "Privacy" : "Confidentialité")}
      {L(en ? "/en/terms" : "/conditions", en ? "Terms" : "Conditions d'utilisation")}
      <span className="foot-lng">{en ? <>{L("/", "Français")}<b>English</b></> : <><b>Français</b>{L("/en", "English")}</>}</span>
    </div>
    <p className="fine-print">{en ? "Tax information in guides is indicative: always check with your tax office or an accountant." : "Les informations fiscales des guides sont indicatives : vérifiez toujours auprès de votre administration fiscale ou d'un comptable."}</p>
  </div><Support lang={lang} /></footer>);
}
