import Trial from "../../components/Trial";
import { Logo } from "../../components/Brand";
import Link from "next/link";
export const metadata = { title: "Créer une facture gratuite, sans inscription", description: "Faites une facture, un devis ou un reçu en moins d'une minute : FCFA, naira, euro, TVA, montant en lettres, PDF et envoi WhatsApp. Gratuit, sans compte.", alternates: { canonical: "/essai" } };
export default function Page() {
  return (<><header className="wrap nav np"><Logo /><Link href="/connexion" className="lnk" style={{ color: "var(--ink)" }}>Se connecter</Link></header>
    <main className="wrap" style={{ paddingBottom: 140 }}><Trial /></main></>);
}
