import About from "../../components/About";
export const metadata = { title: "À propos de Bonova : générateur de factures en ligne", description: "Bonova (bonova.app) est un générateur de devis, factures et reçus en ligne pour les indépendants et les petites entreprises, en Afrique de l'Ouest et ailleurs. Ce qu'il fait, pour qui, et ses tarifs.", alternates: { canonical: "/a-propos", languages: { fr: "/a-propos", en: "/en/about", "x-default": "/a-propos" } } };
export default function P() { return <About lang="fr" />; }
