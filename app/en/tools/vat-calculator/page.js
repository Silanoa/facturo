import Link from "next/link";
import ToolSeo from "../../../../components/ToolSeo";
import { SiteNav, SiteFooter } from "../../../../components/Brand";
import { VatCalc } from "../../../../components/Tools";
export const metadata = { title: "VAT calculator: net, VAT and gross (UK 20%, EU, Africa, Canada)", description: "Free VAT calculator: add or remove VAT at the UK, EU, African or Canadian rate. Net ↔ gross instantly.", alternates: { canonical: "/en/tools/vat-calculator", languages: { fr: "/outils/calcul-tva", en: "/en/tools/vat-calculator" } } };
export default function P() { return (<><SiteNav lang="en" /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/en/tools" style={{ textDecoration: "none" }}>Tools</Link> / VAT</p><h1 style={{ fontSize: "clamp(40px,6vw,76px)", margin: "10px 0 14px" }}>VAT calculator.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Enter an amount, pick a rate: net, VAT and gross appear instantly.</p>
  <div style={{ maxWidth: 860 }}><VatCalc /></div>
  <div className="prose" style={{ marginTop: 50 }}><h2>The formulas</h2><p><b>VAT</b> = net × rate. <b>Gross</b> = net × (1 + rate). <b>Net</b> = gross ÷ (1 + rate). Example at 20%: £1,000 net → £200 VAT → £1,200 gross.</p>
    <p>Rates are indicative standard rates as of November 2026; reduced rates exist in most countries. In the US there is no VAT; sales tax depends on the state.</p>
    <p>Need a full invoice with VAT? <Link href="/en/invoice-generator">Use the free Bonova invoice generator</Link>.</p></div>
  <ToolSeo lang="en" path="/en/tools/vat-calculator" name="VAT calculator" description="Free VAT calculator: net, VAT and gross at any rate." crumbs={[["Tools", "/en/tools"]]} faq={[["How do I add VAT to a net price?", "Multiply the net price by (1 + rate). At 20%, 100 net becomes 120 gross."], ["How do I remove VAT from a gross price?", "Divide the gross price by (1 + rate). At 20%, 120 gross ÷ 1.2 = 100 net. Taking 20% off the gross gives the wrong figure."]]} />
</main><SiteFooter lang="en" /></>); }
