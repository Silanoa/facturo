import { SiteNav, SiteFooter } from "./Brand";
import { SUPPORT } from "../lib/site";
const C = {
  privacy: {
    fr: ["Confidentialité", "Dernière mise à jour : 10 novembre 2026", [
      ["Ce que nous collectons", "Votre email de connexion, les informations de votre activité que vous saisissez (nom, adresse, logo, moyens de paiement), vos clients et vos documents. Sans compte, votre brouillon reste uniquement dans votre navigateur."],
      ["Pourquoi", "Uniquement pour faire fonctionner Bonova : créer, envoyer et suivre vos documents. Nous ne vendons ni ne louons vos données, et n'affichons pas de publicité."],
      ["Où sont les données", "Base de données hébergée par Supabase, site hébergé par Vercel. Les accès sont protégés par des règles par utilisateur : personne d'autre que vous ne lit vos documents, sauf le client qui reçoit le lien d'un document."],
      ["Cookies", "Seulement ce qui est nécessaire : session de connexion, langue et pays choisis. Aucun cookie publicitaire."],
      ["Durée de conservation", "Vos données sont conservées tant que votre compte existe. La suppression du compte efface définitivement le compte, les documents et les clients. Pensez à exporter vos données avant."],
      ["Prestataires", "Supabase (base de données et connexion), Vercel (hébergement du site) et, pour l'abonnement Pro, le prestataire de paiement utilisé (Mobile Money ou carte). Ils ne traitent vos données que pour fournir leur service à Bonova."],
      ["Sécurité", "Les échanges avec Bonova sont chiffrés (HTTPS). Les mots de passe ne sont jamais stockés en clair."],
      ["Vos droits", "Vous pouvez exporter vos données et supprimer votre compte à tout moment depuis Réglages › Sécurité et données. Pour toute question : " + SUPPORT.email + "."],
    ]],
    en: ["Privacy", "Last updated: 10 November 2026", [
      ["What we collect", "Your sign-in email, the business details you enter (name, address, logo, payment methods), your clients and your documents. Without an account, your draft stays only in your browser."],
      ["Why", "Only to run Bonova: create, send and track your documents. We never sell or rent your data and show no ads."],
      ["Where data lives", "Database hosted by Supabase, site hosted by Vercel. Access is protected by per-user rules: nobody but you reads your documents, except the client who receives a document link."],
      ["Cookies", "Only what is needed: sign-in session, chosen language and country. No advertising cookies."],
      ["How long we keep data", "Your data is kept for as long as your account exists. Deleting your account permanently removes the account, documents and clients. Export your data first if you need it."],
      ["Service providers", "Supabase (database and sign-in), Vercel (website hosting) and, for the Pro subscription, the payment provider used (Mobile Money or card). They process your data only to provide their service to Bonova."],
      ["Security", "Connections to Bonova are encrypted (HTTPS). Passwords are never stored in plain text."],
      ["Your rights", "Export your data and delete your account at any time in Settings › Security & data. Questions: " + SUPPORT.email + "."],
    ]],
  },
  terms: {
    fr: ["Conditions d'utilisation", "Dernière mise à jour : 10 novembre 2026", [
      ["Le service", "Bonova permet de créer des devis, factures et reçus et de les partager. L'offre gratuite est sans limite de durée ; l'offre Pro ajoute des fonctions décrites sur la page Tarifs."],
      ["Compte", "Un compte est lié à une adresse e-mail. Vous êtes responsable de l'accès à votre compte et des documents émis depuis celui-ci. Le compte n'est pas nécessaire pour créer un document sans l'enregistrer."],
      ["Votre responsabilité", "Vous êtes responsable du contenu de vos documents et de leur conformité aux règles de votre pays (mentions, taxes). Les guides sont indicatifs."],
      ["Paiements", "Les paiements de vos clients se font directement vers vos moyens de paiement (Mobile Money, virement, carte, PayPal). Bonova n'encaisse pas d'argent pour vous."],
      ["Abonnement Pro", "Sans engagement. Si vous arrêtez, votre compte repasse en gratuit et vos documents restent accessibles."],
      ["Disponibilité", "Nous faisons le nécessaire pour que Bonova reste disponible et fiable, sans pouvoir garantir l'absence totale d'interruption. Conservez vos PDF ou exportez régulièrement vos données."],
      ["Évolution des conditions", "Ces conditions peuvent évoluer avec le service. La date de dernière mise à jour figure en haut de cette page."],
      ["Contact", "Pour toute question : " + SUPPORT.email + "."],
    ]],
    en: ["Terms of use", "Last updated: 10 November 2026", [
      ["The service", "Bonova lets you create and share quotes, invoices and receipts. The free plan has no time limit; Pro adds the features listed on the Pricing page."],
      ["Account", "An account is tied to an email address. You are responsible for access to your account and for the documents issued from it. No account is needed to create a document without saving it."],
      ["Your responsibility", "You are responsible for your documents' content and their compliance with your country's rules (legal lines, taxes). Guides are indicative."],
      ["Payments", "Your clients pay you directly through your own payment methods (Mobile Money, transfer, card, PayPal). Bonova does not collect money on your behalf."],
      ["Pro subscription", "No commitment. If you stop, your account returns to Free and your documents stay available."],
      ["Availability", "We work to keep Bonova available and reliable, but cannot guarantee it will never be interrupted. Keep your PDFs or export your data regularly."],
      ["Changes to these terms", "These terms may change as the service evolves. The date of the last update is shown at the top of this page."],
      ["Contact", "Questions: " + SUPPORT.email + "."],
    ]],
  },
};
const LD = { privacy: { fr: "Quelles données Bonova collecte, pourquoi, combien de temps elles sont gardées et comment les exporter ou les supprimer.", en: "What data Bonova collects, why, how long it is kept and how to export or delete it." }, terms: { fr: "Conditions d'utilisation de Bonova : compte, offre gratuite et Pro, paiement, résiliation et responsabilités.", en: "Bonova terms of use: account, Free and Pro plans, payment, cancellation and liability." } };
export const legalMeta = (k, l) => ({ title: C[k][l][0], description: LD[k][l], alternates: { canonical: k === "privacy" ? (l === "en" ? "/en/privacy" : "/confidentialite") : (l === "en" ? "/en/terms" : "/conditions"), languages: k === "privacy" ? { fr: "/confidentialite", en: "/en/privacy" } : { fr: "/conditions", en: "/en/terms" } } });
export default function Legal({ k, lang }) {
  const [h, d, secs] = C[k][lang];
  return <><SiteNav lang={lang} /><main className="wrap legal"><p className="u">{d}</p><h1>{h}</h1>{secs.map(([t, x]) => <section key={t}><h2>{t}</h2><p>{x}</p></section>)}</main><SiteFooter lang={lang} /></>;
}
