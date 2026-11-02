import Link from "next/link";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import Trial from "../../../components/Trial";
export const metadata = { title: "Générateur de facture gratuit en FCFA, sans inscription", description: "Créez une facture, un devis ou un reçu en ligne : TVA 18 %, IFU, RCCM, montant en lettres, PDF et envoi WhatsApp. Gratuit et sans compte.", alternates: { canonical: "/outils/generateur-facture" } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 140 }}>
  <p className="u np"><Link href="/outils" style={{ textDecoration: "none" }}>Outils</Link> / Générateur de facture</p><h1 className="np" style={{ fontSize: "clamp(36px,5vw,60px)", margin: "10px 0 14px" }}>Générateur de facture gratuit.</h1>
  <p className="mute np" style={{ fontSize: 18, maxWidth: 680, marginBottom: 26 }}>Remplissez, téléchargez le PDF ou envoyez sur WhatsApp. Vos données restent sur votre téléphone tant que vous ne créez pas de compte.</p>
  <Trial heading={false} />
  <div className="prose np" style={{ marginTop: 60 }}><h2>Ce que contient votre facture</h2><ul><li>Vos coordonnées, IFU ou NINEA, RCCM</li><li>Un numéro unique (FAC-2026-0001…)</li><li>Les lignes avec quantité et prix unitaire</li><li>La TVA au taux choisi, le total TTC et le montant en lettres</li><li>Vos numéros Mobile Money pour être payé plus vite</li></ul>
    <p>Pour savoir quelles mentions sont obligatoires, lisez notre guide <Link href="/blog/mentions-obligatoires-facture-ohada">mentions obligatoires d'une facture en zone OHADA</Link>.</p></div>
</main><SiteFooter /></>); }
