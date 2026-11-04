import Link from "next/link";
import ToolSeo from "../../../components/ToolSeo";
import { LangProvider } from "../../../lib/i18n";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { VatCalc } from "../../../components/Tools";
import { RATES } from "../../../lib/vat";
export const metadata = { title: "Calcul TVA en ligne : HT, TVA et TTC (18 %, 20 %…)", description: "Calculez la TVA gratuitement : passez du HT au TTC ou du TTC au HT au taux de votre pays (18 % au Sénégal, en Côte d'Ivoire et au Bénin, 20 % en France). Formules et exemples.", alternates: { canonical: "/outils/calcul-tva", languages: { fr: "/outils/calcul-tva", en: "/en/tools/vat-calculator", "x-default": "/outils/calcul-tva" } } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
  <p className="u"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / TVA</p><h1 style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Calcul de TVA : HT, TVA et TTC.</h1>
  <p className="mute" style={{ fontSize: 18, maxWidth: 640, marginBottom: 26 }}>Entrez un montant et un taux. Le HT, la TVA et le TTC s'affichent.</p>
  <div style={{ maxWidth: 860 }}><LangProvider initial="fr"><VatCalc /></LangProvider></div>
  <div className="prose" style={{ marginTop: 50 }}><h2>Taux normaux de TVA, Afrique de l'Ouest et du Centre</h2>
    <table><thead><tr><th>Pays</th><th>Taux normal</th></tr></thead><tbody>{RATES.map(([c, r]) => <tr key={c}><td>{c}</td><td className="mono">{String(r).replace(".", ",")} %</td></tr>)}</tbody></table>
    <p>Les taux varient selon les pays et les produits. Vérifiez le taux applicable auprès de votre administration fiscale.</p>
    <h2>Les formules</h2><p><b>TVA</b> = montant HT × taux. <b>TTC</b> = HT + TVA = HT × (1 + taux). <b>HT</b> = TTC ÷ (1 + taux). Exemple à 20 % : 1 000 HT → 200 de TVA → 1 200 TTC.</p>
    <p>Pour une facture complète avec TVA et montant en lettres, <Link href="/essai">utilisez le générateur Bonova</Link>, gratuit.</p></div>
  <ToolSeo path="/outils/calcul-tva" name="Calcul de TVA" description="Calculatrice de TVA gratuite : HT, TVA et TTC au taux de votre choix." crumbs={[["Outils", "/outils"]]} faq={[["Comment calculer la TVA à partir d'un montant HT ?", "Multipliez le montant HT par le taux. À 18 %, 100 000 F HT donnent 18 000 F de TVA, soit 118 000 F TTC."], ["Comment retrouver le HT à partir du TTC ?", "Divisez le TTC par (1 + taux). À 18 %, 118 000 F TTC ÷ 1,18 = 100 000 F HT. Ne retirez pas simplement 18 % du TTC : le résultat serait faux."], ["Quel est le taux de TVA au Sénégal, en Côte d'Ivoire et au Bénin ?", "Le taux normal est de 18 % dans ces trois pays, comme dans la plupart des pays de l'UEMOA. Des taux réduits ou des exonérations existent pour certains produits : vérifiez auprès de votre administration fiscale."], ["La TVA doit-elle figurer sur ma facture ?", "Si vous êtes assujetti, la facture doit indiquer le montant HT, le taux, le montant de TVA et le TTC. Si vous ne l'êtes pas, indiquez la mention d'exonération qui s'applique dans votre pays."]]} />
</main><SiteFooter /></>); }
