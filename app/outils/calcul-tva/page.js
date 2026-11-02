import Link from "next/link";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { VatCalc } from "../../../components/Tools";
import { RATES } from "../../../lib/vat";
export const metadata = { title: "Calcul TVA 18 % en ligne : HT, TVA et TTC (UEMOA, CEMAC)", description: "Calculez la TVA à 18 % (Bénin, Sénégal, Côte d'Ivoire, Togo…), 19 % (Niger), 19,25 % (Cameroun), 7,5 % (Nigeria). Passage HT ↔ TTC instantané, gratuit.", alternates: { canonical: "/outils/calcul-tva" } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / TVA</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Calcul de TVA, HT et TTC.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Entrez un montant, choisissez le taux de votre pays : le hors-taxes, la TVA et le TTC s'affichent tout de suite.</p>
  <div style={{ maxWidth: 860 }}><VatCalc /></div>
  <div className="prose" style={{ marginTop: 50 }}><h2>Taux normaux de TVA, Afrique de l'Ouest et du Centre</h2>
    <table><thead><tr><th>Pays</th><th>Taux normal</th></tr></thead><tbody>{RATES.map(([c, r]) => <tr key={c}><td>{c}</td><td className="mono">{String(r).replace(".", ",")} %</td></tr>)}</tbody></table>
    <p>Dans l'UEMOA, une directive communautaire encadre le taux normal entre 15 et 20 % ; la plupart des États ont retenu 18 %. Des taux réduits existent pour certains produits (par exemple 10 % sur certaines activités au Sénégal ou en Côte d'Ivoire). Taux donnés à titre indicatif au 1ᵉʳ novembre 2026 : vérifiez auprès de votre administration fiscale.</p>
    <h2>Les formules</h2><p><b>TVA</b> = montant HT × taux. <b>TTC</b> = HT + TVA = HT × (1 + taux). <b>HT</b> = TTC ÷ (1 + taux). Exemple à 18 % : 100 000 F HT → 18 000 F de TVA → 118 000 F TTC.</p>
    <p>Pour une facture complète avec TVA et montant en lettres, <Link href="/essai">utilisez le générateur Kola</Link>, gratuit.</p></div>
</main><SiteFooter /></>); }
