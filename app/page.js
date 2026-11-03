import Landing from "../components/Landing";
export const metadata = { title: { absolute: "Bonova — Facture gratuite en ligne, sans inscription · Mobile Money, virement, PayPal" }, description: "Faites une facture en quelques secondes et envoyez-la par WhatsApp ou email. FCFA, naira, euro, dollar… Mentions OHADA, TVA UE. Payé par Mobile Money, virement, carte ou PayPal. Gratuit, sans compte, 0 % de commission.", alternates: { canonical: "/", languages: { fr: "/", en: "/en", "x-default": "/" } }, openGraph: { locale: "fr_FR" } };
export default function Home() { return <Landing lang="fr" />; }
