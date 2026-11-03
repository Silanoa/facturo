import Link from "next/link";
import { LangProvider } from "../../../lib/i18n";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { VatCalc } from "../../../components/Tools";
import { RATES } from "../../../lib/vat";
export const metadata = { title: "Calcul de TVA en ligne : HT, TVA et TTC", description: "Calculez la TVA et passez du HT au TTC, au taux de votre choix. Gratuit.", alternates: { canonical: "/outils/calcul-tva" } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / TVA</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Calcul de TVA, HT et TTC.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Entrez un montant et un taux. Le HT, la TVA et le TTC s'affichent.</p>
  <div style={{ maxWidth: 860 }}><LangProvider initial="fr"><VatCalc /></LangProvider></div>
  <div className="prose" style={{ marginTop: 50 }}><h2>Taux normaux de TVA, Afrique de l'Ouest et du Centre</h2>
    <table><thead><tr><th>Pays</th><th>Taux normal</th></tr></thead><tbody>{RATES.map(([c, r]) => <tr key={c}><td>{c}</td><td className="mono">{String(r).replace(".", ",")} %</td></tr>)}</tbody></table>
    <p>Les taux varient selon les pays et les produits. Vérifiez le taux applicable auprès de votre administration fiscale.</p>
    <h2>Les formules</h2><p><b>TVA</b> = montant HT × taux. <b>TTC</b> = HT + TVA = HT × (1 + taux). <b>HT</b> = TTC ÷ (1 + taux). Exemple à 20 % : 1 000 HT → 200 de TVA → 1 200 TTC.</p>
    <p>Pour une facture complète avec TVA et montant en lettres, <Link href="/essai">utilisez le générateur Bonova</Link>, gratuit.</p></div>
</main><SiteFooter /></>); }
