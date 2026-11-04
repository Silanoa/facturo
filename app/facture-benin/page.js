import Link from "next/link";
import SeoLanding from "../../components/SeoLanding";
export const metadata = { title: "Faire une facture au Bénin : IFU, RCCM, TVA 18 %", description: "Créez une facture pour le Bénin : IFU, RCCM, TVA à 18 %, montant en FCFA et en lettres. Envoi WhatsApp, paiement MTN MoMo ou Moov Money. Gratuit, sans compte.", alternates: { canonical: "/facture-benin" } };
export default function P() { return <SeoLanding path="/facture-benin" crumb="Facture au Bénin" h1="Faire une facture au Bénin." lead="Une facture en FCFA avec votre IFU, votre RCCM et la TVA à 18 %. Remplissez-la ci-dessous, puis téléchargez le PDF ou envoyez-la sur WhatsApp."
  sections={[
    ["Les mentions à faire figurer", <ul><li>Nom ou raison sociale, adresse et contacts</li><li>Identifiant fiscal unique (IFU) et numéro RCCM</li><li>Identité et IFU du client professionnel</li><li>Numéro, date, désignation, quantités, prix unitaires</li><li>TVA à 18 % si vous y êtes assujetti, total TTC</li><li>Moyens et conditions de paiement</li></ul>],
    ["Et les factures normalisées (e-MECeF) ?", <p>Au Bénin, les assujettis concernés doivent émettre des factures normalisées via le système e-MECeF de la DGI. Bonova ne remplace pas ce dispositif ; il sert à préparer vos devis, factures pro forma et factures commerciales, et à suivre les paiements. <Link href="/blog/modele-facture-benin">Voir notre modèle de facture pour le Bénin</Link>.</p>],
    ["Paiement", <p>Ajoutez MTN MoMo, Moov Money ou Celtiis Cash, ou un compte bancaire : votre client voit tout de suite comment payer.</p>],
  ]}
  faq={[["Bonova fonctionne-t-il sans connexion permanente ?", "Il faut une connexion pour envoyer et synchroniser. Le générateur sans compte garde votre brouillon sur votre appareil."], ["Puis-je mettre mon logo ?", "Oui, sur l'offre gratuite comme sur Pro."]]}
  related={[["/facture-senegal", "Facture au Sénégal"], ["/facture-cote-divoire", "Facture en Côte d'Ivoire"], ["/modele-de-facture", "Modèle de facture"]]} />; }
