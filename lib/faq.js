export const FAQ = {
  fr: [
    ["Faut-il créer un compte ?", "Non. Vous faites la facture, téléchargez le PDF et l'envoyez par WhatsApp ou email sans inscription. Le compte (gratuit) sert seulement à garder l'historique, envoyer un lien de paiement suivi et relancer."],
    ["C'est vraiment gratuit ?", "Oui : factures, devis et reçus illimités, sans carte bancaire, sans limite de durée. Bonova Pro retire la mention « Fait avec Bonova » et ajoute vos relances automatiques, votre pied de page et l'export comptable."],
    ["Bonova prend-il une commission sur mes paiements ?", "Jamais. Vos clients vous paient directement : Mobile Money, virement / IBAN, ou votre propre lien Stripe, PayPal, Wise, Paystack, Flutterwave, Kkiapay ou FedaPay. Bonova ne touche pas l'argent."],
    ["Dans quels pays ça marche ?", "Bonova est pensé pour les indépendants d'Afrique de l'Ouest et centrale (zone OHADA, FCFA), du Maghreb, du Nigeria, du Ghana, du Kenya, d'Afrique du Sud, de France, de Belgique, de Suisse, du Canada, du Royaume-Uni et des États-Unis. Pour chaque pays : devise, taux de TVA par défaut et mentions obligatoires."],
    ["Mes factures sont-elles conformes ?", "Bonova affiche les mentions attendues selon votre pays. Il ne remplace pas les dispositifs de facture normalisée certifiés (MECeF au Bénin, FNE en Côte d'Ivoire) ni la facturation électronique obligatoire là où elle s'applique : vérifiez avec votre comptable."],
    ["Comment payer Pro ?", "Par Mobile Money (MTN, Moov, Orange, Wave…), carte bancaire ou PayPal. Résiliable en un clic, sans engagement."],
  ],
  en: [
    ["Do I need an account?", "No. Make the invoice, download the PDF and send it by WhatsApp or email without signing up. A free account only keeps your history, gives you a tracked payment link and reminders."],
    ["Is it really free?", "Yes: unlimited invoices, quotes and receipts, no card, no time limit. Bonova Pro removes the “Made with Bonova” line and adds automatic reminders, your own footer and accounting export."],
    ["Does Bonova take a cut of my payments?", "Never. Clients pay you directly: Mobile Money, bank transfer / IBAN, or your own Stripe, PayPal, Wise, Paystack, Flutterwave, Kkiapay or FedaPay link. Bonova never touches the money."],
    ["Which countries?", "Bonova is built for freelancers in West and Central Africa (OHADA, CFA franc), North Africa, Nigeria, Ghana, Kenya, South Africa, France, Belgium, Switzerland, Canada, the UK and the US. For each country: currency, default VAT rate and the required legal lines."],
    ["Are my invoices compliant?", "Bonova shows the details expected in your country. It does not replace certified e-invoicing systems (e.g. MECeF in Benin, FNE in Côte d'Ivoire) or mandatory e-invoicing where it applies — check with your accountant."],
    ["How do I pay for Pro?", "Mobile Money (MTN, Moov, Orange, Wave…), card or PayPal. Cancel in one click, no commitment."],
  ],
};
export const FAQ_FR = FAQ.fr;
// Base de connaissances du support (chatbot) : FAQ + questions pratiques. [mots-clés, réponse]
export const KB = {
  fr: [...FAQ.fr.map(([q, a]) => [q, a]),
    ["TVA taxe taux 18 20 désactiver activer pas de TVA", "Dans l'éditeur, la case « Appliquer la TVA » est préréglée selon votre pays. Si vous n'êtes pas assujetti, laissez-la décochée : la mention légale correcte s'ajoute toute seule. Le taux reste modifiable."],
    ["PDF télécharger imprimer enregistrer", "Bouton « PDF » : choisissez « Enregistrer au format PDF » dans la fenêtre d'impression. Sur téléphone : Partager → Imprimer → PDF, ou Enregistrer en PDF."],
    ["logo couleur modèle papier en-tête importer template personnaliser", "Réglages → Modèle : choisissez un modèle, ajoutez votre logo (la couleur est reprise automatiquement) ou importez votre propre papier à en-tête (image ou PDF) : Bonova écrit la facture par-dessus."],
    ["whatsapp envoyer client lien email", "Bouton WhatsApp : le message et le lien de la facture sont prêts, il vous reste à choisir le contact. Avec un compte gratuit, le client reçoit un lien où il voit la facture et vos moyens de paiement."],
    ["mobile money orange wave mtn moov numéro paiement", "Ajoutez vos numéros Mobile Money dans « Vos coordonnées » (ou Réglages). Ils s'affichent en bas de la facture avec la référence à indiquer. L'argent arrive directement chez vous."],
    ["numéro numérotation facture FAC", "Les numéros se suivent automatiquement (FAC-2026-0001, 0002…). Vous pouvez le modifier dans « Plus d'options »."],
    ["devis convertir accepter", "Envoyez un devis : votre client peut l'accepter depuis le lien. Vous le transformez ensuite en facture en un clic."],
    ["mot de passe oublié connexion compte", "Écrivez-nous sur WhatsApp ou par email avec l'adresse de votre compte : nous vous aidons à le récupérer."],
    ["annuler résilier abonnement pro rembourser", "Pro est sans engagement. Écrivez-nous sur WhatsApp ou par email pour arrêter ou demander un remboursement."]],
  en: [...FAQ.en.map(([q, a]) => [q, a]),
    ["vat tax rate disable enable no vat", "In the editor, the “Charge VAT” box is preset for your country. If you're not VAT-registered, leave it unticked: the correct legal line is added for you. The rate stays editable."],
    ["pdf download print save", "Tap “PDF” and choose “Save as PDF” in the print window. On a phone: Share → Print → PDF."],
    ["logo colour color template letterhead import custom", "Settings → Template: pick a template, add your logo (its colour is picked up automatically) or import your own letterhead (image or PDF): Bonova writes the invoice on top of it."],
    ["whatsapp send client link email", "The WhatsApp button prepares the message and invoice link; you just pick the contact. With a free account, the client gets a link showing the invoice and how to pay you."],
    ["mobile money m-pesa mtn orange wave number payment", "Add your Mobile Money numbers under “Your details” (or Settings). They appear at the bottom of the invoice with the payment reference. Money goes straight to you."],
    ["number numbering invoice INV", "Numbers follow automatically (INV-2026-0001, 0002…). You can edit it under “More options”."],
    ["quote convert accept", "Send a quote: your client can accept it from the link, then you turn it into an invoice in one tap."],
    ["password forgot login account", "Message us on WhatsApp or by email with your account address and we'll help you get back in."],
    ["cancel subscription pro refund", "Pro has no commitment. Message us on WhatsApp or by email to stop it or ask for a refund."]],
};
