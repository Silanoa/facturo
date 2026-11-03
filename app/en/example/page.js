import { SiteNav, SiteFooter } from "../../../components/Brand";
import Example from "../../../components/Example";
export const metadata = { title: "Example quote, invoice and receipt", description: "See what a quote, an invoice with a deposit and a receipt look like with Bonova.", alternates: { canonical: "/en/example", languages: { fr: "/exemple", en: "/en/example" } } };
export default function Page() { return <><SiteNav lang="en" /><main><Example lang="en" /></main><SiteFooter lang="en" /></>; }
