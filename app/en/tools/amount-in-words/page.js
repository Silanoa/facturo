import Link from "next/link";
import ToolSeo from "../../../../components/ToolSeo";
import { SiteNav, SiteFooter } from "../../../../components/Brand";
import { Words } from "../../../../components/Tools";
export const metadata = { title: "Amount in words converter (USD, EUR, GBP, NGN…)", description: "Convert any number to words for invoices and cheques: “one thousand two hundred fifty dollars and fifty cents”. Free.", alternates: { canonical: "/en/tools/amount-in-words", languages: { fr: "/outils/montant-en-lettres", en: "/en/tools/amount-in-words" } } };
export default function P() { return (<><SiteNav lang="en" /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/en/tools" style={{ textDecoration: "none" }}>Tools</Link> / Amount in words</p><h1 style={{ fontSize: "clamp(40px,6vw,76px)", margin: "10px 0 14px" }}>Your amount, in words.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Useful on invoices, cheques and contracts. Works in any currency.</p>
  <div style={{ maxWidth: 860 }}><Words /></div>
  <div className="prose" style={{ marginTop: 50 }}><p>The amount in words is added automatically to every <Link href="/en/invoice-generator">invoice made with Bonova</Link>.</p></div>
  <ToolSeo lang="en" path="/en/tools/amount-in-words" name="Amount in words" description="Convert a number to words for invoices and cheques." crumbs={[["Tools", "/en/tools"]]} faq={[["How do I write an amount in words on an invoice?", "Write the whole amount followed by the currency, then the cents: “one thousand two hundred fifty dollars and fifty cents”."], ["Which currencies are supported?", "US dollars, euros, pounds, CFA francs, naira and other currencies, with cents where the currency uses them."]]} />
</main><SiteFooter lang="en" /></>); }
