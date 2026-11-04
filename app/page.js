import Landing from "../components/Landing";
export const metadata = { title: { absolute: "Bonova — Générateur de facture gratuit : devis, factures et reçus en ligne" }, description: "Bonova (bonova.app) : créez une facture, un devis ou un reçu en ligne en une minute et envoyez-le par WhatsApp, e-mail ou PDF. FCFA, TVA, Mobile Money. Gratuit, sans inscription.", alternates: { canonical: "/", languages: { fr: "/", en: "/en", "x-default": "/" } }, openGraph: { locale: "fr_FR" } };
export default function Home() { return <Landing lang="fr" />; }
