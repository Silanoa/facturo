import "./globals.css";
import { Fraunces, Manrope } from "next/font/google";
import { LangProvider } from "../lib/i18n";
const serif = Fraunces({ subsets: ["latin"], variable: "--serif", axes: ["opsz"] });
const sans = Manrope({ subsets: ["latin"], variable: "--sans" });
export const metadata = {
  title: "Facturo — Factures, devis et reçus pour l'Afrique et le monde",
  description: "Créez des factures professionnelles en FCFA, Naira, Cedi, Euro ou Dollar. Mentions OHADA, Mobile Money, envoi WhatsApp et PDF en un clic.",
  openGraph: { title: "Facturo", description: "La facturation pensée pour l'Afrique francophone, anglophone et sa diaspora." },
};
export default function RootLayout({ children }) {
  return (<html lang="fr"><body className={`${serif.variable} ${sans.variable}`}><LangProvider>{children}</LangProvider></body></html>);
}
