import Link from "next/link";
import { SiteNav, SiteFooter } from "../../components/Brand";
export const metadata = { title: "Outils de facturation gratuits", description: "Générateur de facture, calcul de TVA et montant en lettres. Gratuit, sans inscription.", alternates: { canonical: "/outils" } };
const T = [["/outils/generateur-facture", "Générateur de facture", "Facture, devis ou reçu en PDF, dans votre devise, sans compte."], ["/outils/calcul-tva", "Calcul de TVA", "Passez du HT au TTC, au taux de votre choix."], ["/outils/montant-en-lettres", "Montant en lettres", "Écrivez un montant en toutes lettres."]];
export default function P() { return (<><SiteNav /><main className="wrap sec" style={{ paddingTop: 40 }}><p className="u">Gratuit, sans inscription</p><h1 style={{ fontSize: "clamp(40px,6vw,76px)", maxWidth: 900, margin: "12px 0 40px" }}>Outils de facturation.</h1>
  <div className="cards">{T.map(([h, t, d], i) => <Link key={h} href={h}><span className="mono" style={{ color: "var(--carbon)", fontSize: 14 }}>0{i + 1}</span><h3>{t}</h3><p className="mute" style={{ margin: 0 }}>{d}</p></Link>)}</div></main><SiteFooter /></>); }
