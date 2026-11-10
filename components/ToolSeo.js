import Link from "next/link";
import { SITE } from "../lib/site";
import { getPost } from "../lib/posts";
// Bloc SEO commun aux outils : FAQ visible, liens internes et données structurées.
const ALL = {
  fr: [["/outils/generateur-facture", "Générateur de facture"], ["/outils/calcul-tva", "Calcul de TVA"], ["/outils/montant-en-lettres", "Montant en lettres"], ["/modele-de-facture", "Modèle de facture"]],
  en: [["/en/invoice-generator", "Invoice generator"], ["/en/tools/vat-calculator", "VAT calculator"], ["/en/tools/amount-in-words", "Amount in words"]],
};
// Guides liés à chaque outil (maillage interne outil → article).
const GUIDES = {
  "/outils/generateur-facture": ["mentions-obligatoires-facture-ohada", "numerotation-facture", "devis-facture-proforma"],
  "/outils/calcul-tva": ["tva-uemoa-18", "facture-cameroun-tva-19-25", "facture-freelance-france"],
  "/outils/montant-en-lettres": ["facturer-client-etranger", "mentions-obligatoires-facture-ohada", "tva-uemoa-18"],
  "/en/invoice-generator": ["invoice-without-account", "freelance-invoice-template-free", "get-paid-mobile-money-invoice"],
  "/en/tools/vat-calculator": ["how-to-invoice-international-clients-from-africa", "freelance-invoice-template-free"],
  "/en/tools/amount-in-words": ["how-to-invoice-international-clients-from-africa", "get-paid-mobile-money-invoice"],
};
export default function ToolSeo({ lang = "fr", path, name, description, faq = [], crumbs = [], app = true }) {
  const en = lang === "en"; const url = SITE.url + path;
  const ld = [
    app && { "@context": "https://schema.org", "@type": "WebApplication", name: `${name} · Bonova`, url, description, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "XOF" }, publisher: { "@type": "Organization", name: "Bonova", url: SITE.url } },
    faq.length && { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [[en ? "Home" : "Accueil", en ? "/en" : "/"], ...crumbs, [name, path]].map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: SITE.url + p })) },
  ].filter(Boolean);
  const links = ALL[en ? "en" : "fr"].filter(([p]) => p !== path);
  const guides = (GUIDES[path] || []).map((g) => [g, getPost(g, lang)]).filter(([, x]) => x);
  return (<>
    {faq.length > 0 && <section className="prose np" style={{ marginTop: 50 }}><h2>{en ? "Frequently asked questions" : "Questions fréquentes"}</h2>
      {faq.map(([q, a]) => <details key={q} className="seo-q"><summary>{q}</summary><p>{a}</p></details>)}</section>}
    {guides.length > 0 && <nav className="prose np" style={{ marginTop: 40 }} aria-label={en ? "Related guides" : "Guides utiles"}><h2>{en ? "Related guides" : "Guides utiles"}</h2>
      <ul>{guides.map(([g, x]) => <li key={g}><Link href={`${en ? "/en/blog" : "/blog"}/${g}`}>{x.title}</Link></li>)}</ul></nav>}
    <p className="mute np" style={{ marginTop: 28, fontSize: 15 }}>{en ? "Other free tools: " : "Autres outils gratuits : "}{links.map(([p, l], i) => <span key={p}>{i ? " · " : ""}<Link href={p}>{l}</Link></span>)}</p>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
  </>);
}
