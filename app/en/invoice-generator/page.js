import Link from "next/link";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import Trial from "../../../components/Trial";
import { LangProvider } from "../../../lib/i18n";
import ToolSeo from "../../../components/ToolSeo";
export const metadata = { title: "Free Invoice Generator — No Sign-up, Any Currency", description: "Create an invoice, quote or receipt in seconds. Any currency, VAT/sales tax, amount in words, PDF download, send by WhatsApp or email. Free, no account.", alternates: { canonical: "/en/invoice-generator", languages: { fr: "/outils/generateur-facture", en: "/en/invoice-generator", "x-default": "/outils/generateur-facture" } } };
const FAQ = [["Is the Bonova invoice generator free?", "Yes. Create and download as many invoices, quotes and receipts as you like, with no account and no card. Pro adds signature, stamp and more templates, and removes the “Made with Bonova” line."], ["Do I need an account?", "No. Fill in the form and download the PDF. Your data stays in your browser. A free account only keeps your documents and clients and tracks payments."], ["Which currencies are supported?", "US dollars, euros, pounds, CFA francs, naira, cedis and most other currencies, with VAT or sales tax for your country."]];
export default function Page() { return (<><SiteNav lang="en" /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 140 }}>
  <p className="u np"><Link href="/en/tools">Tools</Link> / Invoice generator</p><h1 className="np" style={{ fontSize: "clamp(48px,7vw,104px)", margin: "10px 0 14px" }}>Free invoice generator, no sign-up.</h1>
  <p className="mute np" style={{ fontSize: 18, maxWidth: 680, marginBottom: 26 }}>Fill in the form, then download the PDF or send it by WhatsApp or email. Without an account, your data stays on your device.</p>
  <LangProvider initial="en"><Trial heading={false} /></LangProvider>
  <ToolSeo lang="en" path="/en/invoice-generator" name="Invoice generator" description="Free online invoice generator: invoice, quote or receipt as a PDF, no sign-up." crumbs={[["Tools", "/en/tools"]]} faq={FAQ} />
</main><SiteFooter lang="en" /></>); }
