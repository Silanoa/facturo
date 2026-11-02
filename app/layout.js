import "./globals.css";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono, Fraunces } from "next/font/google";
import { LangProvider } from "../lib/i18n";
import { SITE } from "../lib/site";
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Instrument_Sans({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--f-mono", weight: ["400", "500", "600"], display: "swap" });
const serif = Fraunces({ subsets: ["latin"], variable: "--f-serif", display: "swap" });
export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Kola — Factures, devis et reçus payés par Mobile Money", template: "%s · Kola" },
  description: "Créez une facture en FCFA en 30 secondes depuis votre téléphone, envoyez-la sur WhatsApp et faites-vous payer par MTN MoMo, Moov, Orange Money ou Wave. Mentions OHADA incluses. Gratuit pour commencer.",
  applicationName: "Kola",
  openGraph: { type: "website", siteName: "Kola", locale: "fr_FR", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export const viewport = { themeColor: "#F3EFE6", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="fr" className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable}`}><body><LangProvider>{children}</LangProvider></body></html>);
}
