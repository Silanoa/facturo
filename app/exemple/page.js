import { SiteNav, SiteFooter } from "../../components/Brand";
import Example from "../../components/Example";
export const metadata = { title: "Exemple de devis, facture et reçu", description: "Voyez à quoi ressemblent un devis, une facture avec acompte et un reçu faits avec Bonova.", alternates: { canonical: "/exemple", languages: { fr: "/exemple", en: "/en/example" } } };
export default function Page() { return <><SiteNav lang="fr" /><main><Example lang="fr" /></main><SiteFooter lang="fr" /></>; }
