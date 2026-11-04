import Link from "next/link";
import { SITE } from "../lib/site";
// Bloc SEO commun aux outils : FAQ visible, liens internes et données structurées.
const ALL = {
  fr: [["/outils/generateur-facture", "Générateur de facture"], ["/outils/calcul-tva", "Calcul de TVA"], ["/outils/montant-en-lettres", "Montant en lettres"], ["/modele-de-facture", "Modèle de facture"], ["/logiciel-de-facturation", "Logiciel de facturation"], ["/facture-senegal", "Facture au Sénégal"], ["/facture-cote-divoire", "Facture en Côte d'Ivoire"], ["/facture-benin", "Facture au Bénin"], ["/a-propos", "À propos de Bonova"]],
  en: [["/en/invoice-generator", "Invoice generator"], ["/en/tools/vat-calculator", "VAT calculator"], ["/en/tools/amount-in-words", "Amount in words"], ["/en/blog", "Invoicing guides"], ["/en/about", "About Bonova"]],
};
export default function ToolSeo({ lang = "fr", path, name, description, faq = [], crumbs = [], app = true }) {
  const en = lang === "en"; const url = SITE.url + path;
  const ld = [
    app && { "@context": "https://schema.org", "@type": "WebApplication", name: `${name} · Bonova`, url, description, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: lang, isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "XOF" }, publisher: { "@type": "Organization", name: "Bonova", url: SITE.url } },
    faq.length && { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [[en ? "Home" : "Accueil", en ? "/en" : "/"], ...crumbs, [name, path]].map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, item: SITE.url + p })) },
  ].filter(Boolean);
  const links = ALL[en ? "en" : "fr"].filter(([p]) => p !== path);
  return (<>
    {faq.length > 0 && <section className="prose np" style={{ marginTop: 50 }}><h2>{en ? "Frequently asked questions" : "Questions fréquentes"}</h2>
      {faq.map(([q, a]) => <details key={q} className="seo-q"><summary>{q}</summary><p>{a}</p></details>)}</section>}
    <nav className="prose np" style={{ marginTop: 40 }} aria-label={en ? "Related tools" : "Outils et guides liés"}><h2>{en ? "Also on Bonova" : "Aussi sur Bonova"}</h2>
      <p>{links.map(([p, l], i) => <span key={p}>{i ? " · " : ""}<Link href={p}>{l}</Link></span>)}</p></nav>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
  </>);
}
