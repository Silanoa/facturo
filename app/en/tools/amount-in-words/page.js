import Link from "next/link";
import ToolSeo from "../../../../components/ToolSeo";
import { SiteNav, SiteFooter } from "../../../../components/Brand";
import { Words } from "../../../../components/Tools";
import { eurToXof, fmt, cfaWords } from "../../../../lib/money";
export const metadata = { title: "Amount in words converter, and euros to CFA francs", description: "Convert any number to words for invoices and cheques, in any currency, and convert euros to CFA francs in figures and words at the fixed rate of 655.957. Free.", alternates: { canonical: "/en/tools/amount-in-words", languages: { fr: "/outils/montant-en-lettres", en: "/en/tools/amount-in-words", "x-default": "/outils/montant-en-lettres" } } };
const EUR = [1000, 2000, 5000, 10000, 100000, 500000];
const eur = (v) => "€" + new Intl.NumberFormat("en-US").format(v);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export default function P() { return (<><SiteNav lang="en" /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/en/tools" style={{ textDecoration: "none" }}>Tools</Link> / Amount in words</p><h1 style={{ fontSize: "clamp(40px,6vw,76px)", margin: "10px 0 14px" }}>Your amount, in words.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 660, marginBottom: 26 }}>Useful on invoices, cheques and contracts. Works in any currency, and converts euros to CFA francs in figures and in words.</p>
  <div style={{ maxWidth: 860 }}><Words /></div>
  <div className="prose" style={{ marginTop: 50 }}>
    <h2>Euros to CFA francs</h2>
    <p>The CFA franc is pegged to the euro at a fixed rate: <b>€1 = 655.957 FCFA</b>, for both the West African (XOF) and Central African (XAF) CFA franc. Multiply the euro amount by 655.957 and round to the nearest franc. The rate does not move; only your bank's or transfer service's fees change what you actually receive.</p>
    <div style={{ overflowX: "auto" }}><table><thead><tr><th>Euros</th><th>CFA francs</th><th>In words</th></tr></thead>
      <tbody>{EUR.map((v) => { const x = eurToXof(v); return <tr key={v}><td className="mono" style={{ whiteSpace: "nowrap" }}>{eur(v)}</td><td className="mono" style={{ whiteSpace: "nowrap" }}>{fmt(x, "XOF", "en")}</td><td>{cap(cfaWords(x, "en"))}</td></tr>; })}</tbody></table></div>
    <p>The amount in words is added automatically to every <Link href="/en/invoice-generator">invoice made with Bonova</Link>. To work out the tax first, use the <Link href="/en/tools/vat-calculator">VAT calculator</Link>.</p></div>
  <ToolSeo lang="en" path="/en/tools/amount-in-words" name="Amount in words" description="Convert a number to words for invoices and cheques, and euros to CFA francs." crumbs={[["Tools", "/en/tools"]]} faq={[
    ["How do I write an amount in words on an invoice?", "Write the whole amount followed by the currency, then the cents: “one thousand two hundred fifty dollars and fifty cents”."],
    ["How do I convert euros to CFA francs?", "Multiply the euro amount by 655.957, the fixed rate between the euro and the CFA franc, then round to the nearest franc. For example, €2,000 × 655.957 = 1,311,914 FCFA."],
    ["Is the rate the same for the Central African CFA franc?", "Yes. The West African (XOF) and Central African (XAF) CFA francs share the same peg to the euro: €1 = 655.957 FCFA. The two currencies are not interchangeable, though."],
    ["Which currencies are supported?", "US dollars, euros, pounds, CFA francs, naira and other currencies, with cents where the currency uses them."],
  ]} />
</main><SiteFooter lang="en" /></>); }
