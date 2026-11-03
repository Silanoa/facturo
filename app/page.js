import Landing from "../components/Landing";
export const metadata = { title: { absolute: "Bonova — Devis, factures et reçus en ligne" }, description: "Créez devis, factures et reçus en une minute et envoyez-les par WhatsApp, email ou PDF. Toutes devises, taxes et mentions selon votre pays. Gratuit, sans compte.", alternates: { canonical: "/", languages: { fr: "/", en: "/en", "x-default": "/" } }, openGraph: { locale: "fr_FR" } };
export default function Home() { return <Landing lang="fr" />; }
