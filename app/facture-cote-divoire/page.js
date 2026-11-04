import Link from "next/link";
import SeoLanding from "../../components/SeoLanding";
export const metadata = { title: "Faire une facture en Côte d'Ivoire : NCC, RCCM, TVA 18 %", description: "Créez une facture pour la Côte d'Ivoire : NCC, RCCM, régime d'imposition, TVA à 18 %, montant en FCFA. Envoi WhatsApp, paiement Mobile Money. Gratuit, sans compte.", alternates: { canonical: "/facture-cote-divoire" } };
export default function P() { return <SeoLanding country="CI" path="/facture-cote-divoire" crumb="Facture en Côte d'Ivoire" h1="Faire une facture en Côte d'Ivoire." lead="Une facture en FCFA avec votre NCC, votre RCCM et la TVA à 18 %. Remplissez-la ci-dessous et envoyez-la en PDF ou sur WhatsApp."
  sections={[
    ["Les mentions à faire figurer", <ul><li>Raison sociale, adresse et contacts</li><li>Numéro de compte contribuable (NCC) et RCCM</li><li>Régime d'imposition et centre des impôts de rattachement</li><li>Identité du client</li><li>Numéro, date, désignation, quantités, prix unitaires</li><li>TVA à 18 % le cas échéant, total TTC et conditions de paiement</li></ul>],
    ["Et la facture normalisée électronique (FNE) ?", <p>La DGI généralise la facture normalisée électronique (FNE) pour les entreprises concernées. Bonova ne délivre pas de FNE : si votre régime l'impose, elle reste obligatoire. Bonova vous sert à établir et suivre vos devis, factures pro forma et factures commerciales. <Link href="/blog/facture-cote-divoire">Lire notre guide sur la facture en Côte d'Ivoire</Link>.</p>],
    ["Paiement", <p>Indiquez Orange Money, MTN MoMo, Moov Money, Wave ou un virement : ces informations apparaissent sur la facture, avec la référence à rappeler.</p>],
  ]}
  faq={[["Puis-je faire un devis avant la facture ?", "Oui. Le client peut accepter le devis en ligne, puis vous le transformez en facture sans tout ressaisir."], ["Le montant en lettres est-il ajouté ?", "Oui, automatiquement : « Arrêtée la présente facture à la somme de … francs CFA »."]]}
  related={[["/facture-senegal", "Facture au Sénégal"], ["/facture-benin", "Facture au Bénin"], ["/logiciel-de-facturation", "Logiciel de facturation"]]} />; }
