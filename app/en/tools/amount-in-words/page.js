import Link from "next/link";
import ToolSeo from "../../../../components/ToolSeo";
import { SiteNav, SiteFooter } from "../../../../components/Brand";
import { Words } from "../../../../components/Tools";
import { eurToXof, fmt, cfaWords, amountWords, inWords } from "../../../../lib/money";
export const metadata = { title: "Amount in words converter for invoices and cheques", description: "Write any amount in words for invoices, cheques and contracts: US dollars, pounds, euros, CFA francs, naira and more. Free, with a ready-to-copy line. Includes euro to CFA franc conversion.", alternates: { canonical: "/en/tools/amount-in-words", languages: { fr: "/outils/montant-en-lettres", en: "/en/tools/amount-in-words", "x-default": "/outils/montant-en-lettres" } } };
const COMMON = [[250, "USD"], [1250.5, "USD"], [12000, "USD"], [3400, "GBP"], [1500, "EUR"], [150000, "NGN"], [500000, "XOF"]];
const EUR = [500, 1000, 2000, 5000, 10000];
const eur = (v) => "€" + new Intl.NumberFormat("en-US").format(v);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const words = (v, c) => { const i = Math.floor(v); const ct = Math.round((v - i) * 100); return cap(amountWords(i, c, "en") + (ct ? ` and ${inWords(ct, "en")} cent${ct === 1 ? "" : "s"}` : "")); };
export default function P() { return (<><SiteNav lang="en" /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/en/tools" style={{ textDecoration: "none" }}>Tools</Link> / Amount in words</p><h1 style={{ fontSize: "clamp(40px,6vw,76px)", margin: "10px 0 14px" }}>Amount in words.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 660, marginBottom: 26 }}>For invoices, cheques and contracts, in any currency: US dollars, pounds, euros, CFA francs, naira and more. Type an amount to get it in words, with cents. A second tab converts euros to CFA francs.</p>
  <div style={{ maxWidth: 860 }}><Words /></div>
  <div className="prose" style={{ marginTop: 50 }}>
    <h2>Common amounts in words</h2>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>In figures</th><th>In words</th></tr></thead>
      <tbody>{COMMON.map(([v, c]) => <tr key={c + v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(v, c, "en")}</td><td>{words(v, c)}</td></tr>)}</tbody></table></div>
    <h2>On an invoice, a cheque or a contract</h2>
    <ul><li><b>Invoice</b>: “Amount due: one thousand two hundred fifty US dollars and fifty cents ($1,250.50).”</li><li><b>Cheque</b>: write the amount in words on the line and the figures in the box. If the two differ, the amount in words generally prevails.</li><li><b>Contract</b>: the amount in words followed by the figures in brackets, for example “the sum of three thousand four hundred pounds sterling (£3,400)”.</li></ul>
    <p>British usage often adds “and” after hundred (“one hundred and fifty”); American usage leaves it out. Both are correct, as long as you stay consistent.</p>
    <h2>Euros to CFA francs</h2>
    <p>The CFA franc is pegged to the euro at a fixed rate: <b>€1 = 655.957 FCFA</b>, for both the West African (XOF) and Central African (XAF) CFA franc. Multiply the euro amount by 655.957 and round to the nearest franc. The “Euros → CFA francs” tab does the maths and writes the result in words.</p>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>Euros</th><th>CFA francs</th><th>In words</th></tr></thead>
      <tbody>{EUR.map((v) => { const x = eurToXof(v); return <tr key={v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{eur(v)}</td><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(x, "XOF", "en")}</td><td>{cap(cfaWords(x, "en"))}</td></tr>; })}</tbody></table></div>
    <p>The amount in words is added automatically to every <Link href="/en/invoice-generator">invoice made with Bonova</Link>. To work out the tax first, use the <Link href="/en/tools/vat-calculator">VAT calculator</Link>.</p></div>
  <ToolSeo lang="en" path="/en/tools/amount-in-words" name="Amount in words" description="Convert a number to words for invoices, cheques and contracts, in any currency." crumbs={[["Tools", "/en/tools"]]} faq={[
    ["How do I write an amount in words on an invoice?", "Write the whole amount followed by the currency, then the cents, and repeat the figures in brackets: “one thousand two hundred fifty US dollars and fifty cents ($1,250.50)”."],
    ["How do I write a cheque amount in words?", "Write the amount in words on the line, with the currency, and the figures in the box. If they differ, the amount in words generally prevails."],
    ["Should I write “and” after hundred?", "Both forms are correct: British English usually says “one hundred and fifty”, American English “one hundred fifty”. Pick one and use it throughout the document."],
    ["Which currencies are supported?", "US and Canadian dollars, euros, pounds sterling, Swiss francs, CFA francs (XOF and XAF), naira, cedis, Kenyan shillings, rand, dirhams and other currencies, with cents where the currency uses them."],
    ["How do I convert euros to CFA francs?", "Multiply the euro amount by 655.957, the fixed rate between the euro and the CFA franc (XOF and XAF), then round to the nearest franc. For example, €2,000 = 1,311,914 FCFA."],
  ]} />
</main><SiteFooter lang="en" /></>); }
