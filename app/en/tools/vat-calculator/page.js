import Link from "next/link";
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
</main><SiteFooter lang="en" /></>); }
