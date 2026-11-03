import Link from "next/link";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import Trial from "../../../components/Trial";
import { LangProvider } from "../../../lib/i18n";
export const metadata = { title: "Générateur de facture gratuit, sans inscription", description: "Créez une facture, un devis ou un reçu en ligne : toutes devises, TVA, IFU, RCCM, SIRET, montant en lettres, PDF et envoi WhatsApp. Gratuit et sans compte.", alternates: { canonical: "/outils/generateur-facture", languages: { fr: "/outils/generateur-facture", en: "/en/invoice-generator" } } };
export default function P() { return (<><SiteNav /><main className="wrap" style={{ paddingTop: 30, paddingBottom: 140 }}>
  <p className="u np"><Link href="/outils">Outils</Link> / Générateur de facture</p><h1 className="np" style={{ fontSize: "clamp(48px,7vw,104px)", margin: "10px 0 14px" }}>Générateur de facture gratuit.</h1>
  <p className="mute np" style={{ fontSize: 18, maxWidth: 680, marginBottom: 26 }}>Remplissez, téléchargez le PDF ou envoyez sur WhatsApp. Vos données restent sur votre téléphone tant que vous ne créez pas de compte.</p>
  <LangProvider initial="fr"><Trial heading={false} /></LangProvider>
  <div className="prose np" style={{ marginTop: 60 }}><h2>Ce que contient votre facture</h2><ul><li>Vos coordonnées et identifiants (IFU, NINEA, RCCM, SIRET, n° de TVA…)</li><li>Un numéro unique (FAC-2026-0001…)</li><li>Les lignes avec quantité et prix unitaire</li><li>La TVA au taux de votre pays, le total et le montant en lettres</li><li>Vos moyens de paiement : Mobile Money, IBAN, lien Stripe ou PayPal</li></ul>
    <p>Voir aussi : <Link href="/blog/mentions-obligatoires-facture-ohada">mentions obligatoires en zone OHADA</Link> · <Link href="/blog/facture-freelance-france">facture freelance en France</Link>.</p></div>
</main><SiteFooter /></>); }
