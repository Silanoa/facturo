import Link from "next/link";
import { SiteNav, SiteFooter } from "./Brand";
import { SITE } from "../lib/site";
const T = {
  fr: { crumb: "À propos", h1: "À propos de Bonova.", lead: "Bonova (bonova.app) est un générateur de devis, de factures et de reçus en ligne. Il s'adresse aux indépendants, aux artisans, aux commerçants et aux petites entreprises qui veulent un document propre en une minute, sans logiciel comptable.",
    s: [["Ce que fait Bonova", ["Créer un devis, une facture ou un reçu depuis un téléphone ou un ordinateur, en français ou en anglais.", "Appliquer la devise, le taux de TVA et les identifiants du pays : NINEA au Sénégal, NCC en Côte d'Ivoire, IFU au Bénin, RCCM, SIRET en France…", "Envoyer le document en PDF, par WhatsApp, par e-mail ou par lien.", "Afficher vos moyens de paiement : Mobile Money (Wave, Orange Money, MTN MoMo, Moov…), virement ou lien de paiement. Le client vous paie directement, Bonova ne prend aucune commission.", "Suivre les paiements, les acomptes et les relances depuis votre espace."]],
      ["Pour qui", ["Freelances et consultants, artisans, commerçants, agences et TPE. Bonova est pensé d'abord pour l'Afrique de l'Ouest et du Centre (zone FCFA), et fonctionne aussi en France, en Belgique, en Suisse, au Canada, au Royaume-Uni et aux États-Unis."]],
      ["Tarifs", ["Gratuit : devis, factures et reçus illimités, sans limite de durée. Le pied de page porte la mention « Fait avec Bonova ».", "Pro : 2 500 FCFA par mois, ou un abonnement annuel avec deux mois offerts. Signature et cachet, modèles personnalisés illimités, pied de page à votre nom. Hors zone FCFA, le prix s'affiche dans votre devise.", "Paiement Pro par Mobile Money. Pas de renouvellement automatique : vous prolongez quand vous le souhaitez."]],
      ["Ce que Bonova n'est pas", ["Bonova n'est pas un système de facturation certifié (e-MECeF au Bénin, FNE en Côte d'Ivoire, plateformes agréées en France). Si votre activité y est soumise, Bonova vous aide à préparer vos documents mais ne remplace pas la facture normalisée."]]],
    more: "Pour commencer", links: [["/outils/generateur-facture", "Générateur de facture gratuit"], ["/modele-de-facture", "Modèle de facture"], ["/outils/calcul-tva", "Calcul de TVA"], ["/outils/montant-en-lettres", "Montant en lettres"], ["/blog", "Guides"]],
    contact: "Suivre Bonova" },
  en: { crumb: "About", h1: "About Bonova.", lead: "Bonova (bonova.app) is an online quote, invoice and receipt maker. It is built for freelancers, tradespeople, shop owners and small businesses who want a clean document in a minute, without accounting software.",
    s: [["What Bonova does", ["Create a quote, invoice or receipt from a phone or computer, in English or French.", "Apply your country's currency, VAT rate and business IDs.", "Send the document as a PDF, by WhatsApp, by email or as a link.", "Show your payment details: Mobile Money, bank transfer or a payment link. Clients pay you directly; Bonova takes no fee.", "Track payments, deposits and reminders from your workspace."]],
      ["Who it's for", ["Freelancers and consultants, tradespeople, shops, agencies and small businesses. Bonova was designed first for West and Central Africa (CFA franc zone) and also works in France, Belgium, Switzerland, Canada, the UK and the US."]],
      ["Pricing", ["Free: unlimited quotes, invoices and receipts, with no time limit. The footer carries a “Made with Bonova” line.", "Pro: 2,500 FCFA a month, or a yearly plan with two months free. Signature and stamp, unlimited custom templates, your own footer. Outside the CFA zone the price is shown in your currency.", "No automatic renewal: you extend when you choose."]],
      ["What Bonova is not", ["Bonova is not a certified e-invoicing system (such as e-MECeF in Benin, FNE in Côte d'Ivoire or approved platforms in France). Where those apply, Bonova helps you prepare documents but does not replace the certified invoice."]]],
    more: "Get started", links: [["/en/invoice-generator", "Free invoice generator"], ["/en/tools/vat-calculator", "VAT calculator"], ["/en/tools/amount-in-words", "Amount in words"], ["/en/blog", "Guides"]],
    contact: "Follow Bonova" },
};
export default function About({ lang = "fr" }) {
  const t = T[lang]; const en = lang === "en"; const path = en ? "/en/about" : "/a-propos";
  const ld = [{ "@context": "https://schema.org", "@type": "AboutPage", name: t.h1.replace(/\.$/, ""), url: SITE.url + path, inLanguage: lang, about: { "@type": "Organization", name: "Bonova", alternateName: "Bonova App", url: SITE.url, logo: SITE.url + "/icon-512.png", description: t.lead, sameAs: ["https://x.com/bonovaapp", "https://www.linkedin.com/company/bonova-app"] } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: en ? "Home" : "Accueil", item: SITE.url + (en ? "/en" : "/") }, { "@type": "ListItem", position: 2, name: t.crumb, item: SITE.url + path }] }];
  return (<><SiteNav lang={lang} /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 120 }}>
    <p className="u"><Link href={en ? "/en" : "/"}>Bonova</Link> / {t.crumb}</p>
    <h1 style={{ fontSize: "clamp(44px,6.5vw,96px)", margin: "10px 0 16px" }}>{t.h1}</h1>
    <p className="mute" style={{ fontSize: 19, maxWidth: 720 }}>{t.lead}</p>
    <div className="prose" style={{ marginTop: 40 }}>
      {t.s.map(([h, ps]) => <section key={h}><h2>{h}</h2>{ps.length > 1 ? <ul>{ps.map((p) => <li key={p}>{p}</li>)}</ul> : <p>{ps[0]}</p>}</section>)}
      <h2>{t.more}</h2><p>{t.links.map(([p, l], i) => <span key={p}>{i ? " · " : ""}<Link href={p}>{l}</Link></span>)}</p>
      <h2>{t.contact}</h2><p><a href="https://x.com/bonovaapp" rel="me noopener" target="_blank">X (@bonovaapp)</a> · <a href="https://www.linkedin.com/company/bonova-app" rel="me noopener" target="_blank">LinkedIn</a></p>
    </div>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
  </main><SiteFooter lang={lang} /></>);
}
