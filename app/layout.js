import "./globals.css";
import { Archivo, IBM_Plex_Mono, Newsreader, Inter } from "next/font/google";
import { LangProvider } from "../lib/i18n";
import { SITE } from "../lib/site";
const display = Archivo({ subsets: ["latin"], variable: "--f-display", axes: ["wdth"], display: "swap" });
const ui = Inter({ subsets: ["latin"], variable: "--f-ui", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--f-mono", weight: ["400", "500", "600", "700"], display: "swap" });
const serif = Newsreader({ subsets: ["latin"], variable: "--f-serif", style: ["italic", "normal"], display: "swap" });
export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Bonova — Générateur de facture, devis et reçus en ligne", template: "%s · Bonova" },
  description: "Créez vos devis, factures et reçus en une minute et envoyez-les par WhatsApp, email ou PDF. Paiement par Mobile Money, virement, carte ou PayPal. Sans inscription.",
  applicationName: "Bonova",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }, { url: "/favicon-48.png", sizes: "48x48", type: "image/png" }, { url: "/favicon-96.png", sizes: "96x96", type: "image/png" }, { url: "/icon-192.png", sizes: "192x192", type: "image/png" }], apple: "/apple-touch-icon.png", shortcut: "/favicon.ico" },
  openGraph: { type: "website", siteName: "Bonova" },
  keywords: ["générateur de facture", "facture en ligne", "logiciel de facturation", "devis", "reçu", "Bonova", "invoice generator", "Sénégal", "Côte d'Ivoire", "Bénin", "Mobile Money"],
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export const viewport = { themeColor: "#2433D6", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="fr" className={`${display.variable} ${mono.variable} ${serif.variable} ${ui.variable}`} style={{ "--f-body": "var(--f-display)" }}><body><LangProvider>{children}</LangProvider></body></html>);
}
