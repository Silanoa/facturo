import { SiteNav, SiteFooter } from "./Brand";
import { SUPPORT } from "../lib/site";
const M = SUPPORT.email; const W = SUPPORT.wa ? SUPPORT.waLabel : "";
const C = {
  privacy: {
    fr: ["Politique de confidentialité", "Dernière mise à jour : 10 novembre 2026", [
      ["Responsable du traitement", `Les données sont traitées par Bonova, éditeur du site bonova.app. Contact : ${M}${W ? ` ou WhatsApp ${W}` : ""}.`],
      ["Ce que nous collectons", "Votre adresse e-mail de connexion, les informations de votre activité que vous saisissez (nom, adresse, identifiants fiscaux, logo, moyens de paiement), vos clients et vos documents, ainsi que l'historique de votre abonnement Pro. Sans compte, votre brouillon reste uniquement dans votre navigateur et ne nous est pas transmis."],
      ["Pourquoi", "Uniquement pour faire fonctionner Bonova : créer, envoyer et suivre vos documents, gérer votre abonnement et répondre à vos demandes d'aide. Nous ne vendons ni ne louons vos données, et n'affichons pas de publicité."],
      ["Documents partagés par lien", "Un document envoyé par lien est consultable par toute personne qui dispose de ce lien. Le lien est long et impossible à deviner, mais ne le publiez pas si le document est confidentiel."],
      ["Où sont les données", "Base de données hébergée par Supabase, site hébergé par Vercel. Les accès sont protégés par des règles par utilisateur : personne d'autre que vous ne lit vos documents, sauf le destinataire d'un lien de document."],
      ["Prestataires", "Supabase (base de données et connexion), Vercel (hébergement) et, pour l'abonnement Pro, le prestataire de paiement utilisé. Dans votre espace, la saisie rapide peut transmettre le texte que vous écrivez à un service d'analyse automatique (Groq ou Google Gemini) pour le transformer en lignes de document. Ces prestataires ne traitent vos données que pour fournir leur service à Bonova."],
      ["Cookies", "Seulement ce qui est nécessaire : session de connexion, langue et pays choisis. Le pays est estimé à partir de votre adresse IP pour afficher la bonne devise ; il n'est pas conservé. Aucun cookie publicitaire ni de mesure d'audience."],
      ["Durée de conservation", "Vos données sont conservées tant que votre compte existe. La suppression du compte efface définitivement le compte, les documents et les clients. Pensez à exporter vos données avant. Les messages envoyés au support sont conservés le temps nécessaire pour vous répondre."],
      ["Sécurité", "Les échanges avec Bonova sont chiffrés (HTTPS). Les mots de passe ne sont jamais stockés en clair."],
      ["Vos droits", `Vous pouvez accéder à vos données, les corriger, les exporter et supprimer votre compte à tout moment depuis Réglages › Sécurité et données. Pour toute autre demande : ${M}.`],
    ]],
    en: ["Privacy policy", "Last updated: 10 November 2026", [
      ["Data controller", `Data is processed by Bonova, publisher of bonova.app. Contact: ${M}${W ? ` or WhatsApp ${W}` : ""}.`],
      ["What we collect", "Your sign-in email, the business details you enter (name, address, tax IDs, logo, payment methods), your clients and your documents, and your Pro subscription history. Without an account, your draft stays only in your browser and is never sent to us."],
      ["Why", "Only to run Bonova: create, send and track your documents, manage your subscription and answer your support requests. We never sell or rent your data and show no ads."],
      ["Documents shared by link", "A document sent as a link can be viewed by anyone who has that link. Links are long and cannot be guessed, but do not publish one if the document is confidential."],
      ["Where data lives", "Database hosted by Supabase, site hosted by Vercel. Access is protected by per-user rules: nobody but you reads your documents, except the recipient of a document link."],
      ["Service providers", "Supabase (database and sign-in), Vercel (hosting) and, for the Pro subscription, the payment provider used. In your workspace, quick entry may send the text you type to an automated parsing service (Groq or Google Gemini) to turn it into document lines. These providers process your data only to provide their service to Bonova."],
      ["Cookies", "Only what is needed: sign-in session, chosen language and country. Your country is estimated from your IP address to show the right currency; it is not stored. No advertising or analytics cookies."],
      ["How long we keep data", "Your data is kept for as long as your account exists. Deleting your account permanently removes the account, documents and clients. Export your data first if you need it. Support messages are kept as long as needed to answer you."],
      ["Security", "Connections to Bonova are encrypted (HTTPS). Passwords are never stored in plain text."],
      ["Your rights", `You can access, correct and export your data and delete your account at any time in Settings › Security & data. For any other request: ${M}.`],
    ]],
  },
  terms: {
    fr: ["Conditions d'utilisation", "Dernière mise à jour : 10 novembre 2026", [
      ["Objet", "Ces conditions encadrent l'utilisation du site bonova.app et de l'application Bonova (le « service »). En créant un compte ou en utilisant le service, vous les acceptez."],
      ["Le service", "Bonova permet de créer des devis, factures et reçus, de les envoyer et de suivre leur paiement. L'offre gratuite est sans limite de durée ; l'offre Pro ajoute les fonctions décrites sur la page Tarifs."],
      ["Compte", "Un compte est lié à une adresse e-mail valide. Vous gardez votre mot de passe confidentiel et êtes responsable des documents émis depuis votre compte. Aucun compte n'est nécessaire pour créer un document sans l'enregistrer."],
      ["Utilisation acceptable", "Vous vous engagez à ne pas utiliser Bonova pour émettre des documents faux ou trompeurs, pour une activité illicite ou pour perturber le service. Un compte qui enfreint ces règles peut être suspendu, après information lorsque c'est possible."],
      ["Vos documents", "Vous êtes responsable du contenu de vos documents et de leur conformité aux règles de votre pays (mentions, taxes, facturation certifiée lorsqu'elle s'applique). Les guides publiés sur le site sont indicatifs."],
      ["Paiements de vos clients", "Vos clients vous paient directement, avec les moyens de paiement que vous indiquez. Bonova n'encaisse aucune somme pour votre compte et ne prélève aucune commission."],
      ["Abonnement Pro", "L'offre Pro est payée d'avance, pour un mois ou un an, au prix affiché sur la page Tarifs. Elle n'est pas renouvelée automatiquement. À son échéance, le compte repasse en offre gratuite et vos documents restent accessibles. Pour toute demande de remboursement, écrivez-nous."],
      ["Propriété", "Vos documents, vos données et votre logo vous appartiennent. Le site, l'application, leur code et la marque Bonova restent la propriété de Bonova."],
      ["Disponibilité et responsabilité", "Nous faisons le nécessaire pour que Bonova reste disponible et fiable, sans pouvoir garantir l'absence d'interruption. Dans les limites permises par la loi, Bonova n'est pas responsable des conséquences fiscales ou commerciales d'un document que vous émettez, ni des pertes indirectes liées à une interruption du service. Conservez vos PDF ou exportez régulièrement vos données."],
      ["Fin d'utilisation", "Vous pouvez supprimer votre compte à tout moment depuis Réglages › Sécurité et données. La suppression est définitive."],
      ["Évolution des conditions", "Ces conditions peuvent évoluer avec le service. La date de dernière mise à jour figure en haut de cette page ; en cas de changement important, les utilisateurs sont prévenus par e-mail."],
      ["Contact", `Pour toute question : ${M}${W ? ` ou WhatsApp ${W}` : ""}.`],
    ]],
    en: ["Terms of use", "Last updated: 10 November 2026", [
      ["Scope", "These terms govern the use of bonova.app and the Bonova application (the “service”). By creating an account or using the service, you accept them."],
      ["The service", "Bonova lets you create quotes, invoices and receipts, send them and track their payment. The free plan has no time limit; Pro adds the features listed on the Pricing page."],
      ["Account", "An account is tied to a valid email address. You keep your password confidential and are responsible for the documents issued from your account. No account is needed to create a document without saving it."],
      ["Acceptable use", "You agree not to use Bonova to issue false or misleading documents, for any unlawful activity or to disrupt the service. An account that breaks these rules may be suspended, with notice where possible."],
      ["Your documents", "You are responsible for your documents' content and their compliance with your country's rules (legal lines, taxes, certified invoicing where it applies). Guides published on the site are indicative."],
      ["Your clients' payments", "Your clients pay you directly, using the payment methods you show. Bonova does not collect money on your behalf and takes no commission."],
      ["Pro subscription", "Pro is paid in advance, for one month or one year, at the price shown on the Pricing page. It does not renew automatically. When it ends, the account returns to Free and your documents stay available. For any refund request, contact us."],
      ["Ownership", "Your documents, your data and your logo belong to you. The site, the application, their code and the Bonova brand remain the property of Bonova."],
      ["Availability and liability", "We work to keep Bonova available and reliable, but cannot guarantee it will never be interrupted. To the extent permitted by law, Bonova is not liable for the tax or business consequences of a document you issue, or for indirect losses caused by an interruption of the service. Keep your PDFs or export your data regularly."],
      ["Closing your account", "You can delete your account at any time in Settings › Security & data. Deletion is permanent."],
      ["Changes to these terms", "These terms may change as the service evolves. The date of the last update is shown at the top of this page; users are notified by email of any significant change."],
      ["Contact", `Questions: ${M}${W ? ` or WhatsApp ${W}` : ""}.`],
    ]],
  },
};
const LD = { privacy: { fr: "Quelles données Bonova collecte, pourquoi, combien de temps elles sont gardées et comment les exporter ou les supprimer.", en: "What data Bonova collects, why, how long it is kept and how to export or delete it." }, terms: { fr: "Conditions d'utilisation de Bonova : compte, offre gratuite et Pro, paiement, résiliation et responsabilités.", en: "Bonova terms of use: account, Free and Pro plans, payment, cancellation and liability." } };
export const legalMeta = (k, l) => ({ title: C[k][l][0], description: LD[k][l], alternates: { canonical: k === "privacy" ? (l === "en" ? "/en/privacy" : "/confidentialite") : (l === "en" ? "/en/terms" : "/conditions"), languages: k === "privacy" ? { fr: "/confidentialite", en: "/en/privacy" } : { fr: "/conditions", en: "/en/terms" } } });
export default function Legal({ k, lang }) {
  const [h, d, secs] = C[k][lang];
  return <><SiteNav lang={lang} /><main className="wrap legal"><p className="u">{d}</p><h1>{h}</h1>{secs.map(([t, x]) => <section key={t}><h2>{t}</h2><p>{x}</p></section>)}</main><SiteFooter lang={lang} /></>;
}
