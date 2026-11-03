import "./globals.css";
import { Archivo, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { LangProvider } from "../lib/i18n";
import { SITE } from "../lib/site";
const display = Archivo({ subsets: ["latin"], variable: "--f-display", axes: ["wdth"], display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--f-mono", weight: ["400", "500", "600", "700"], display: "swap" });
const serif = Newsreader({ subsets: ["latin"], variable: "--f-serif", style: ["italic", "normal"], display: "swap" });
export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Bonova — Free invoice maker for freelancers · Facture gratuite", template: "%s · Bonova" },
  description: "Make an invoice in seconds and send it by WhatsApp or email. Get paid by Mobile Money, bank transfer, card or PayPal. No account needed. Créez une facture en quelques secondes, sans inscription.",
  applicationName: "Bonova",
  openGraph: { type: "website", siteName: "Bonova", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export const viewport = { themeColor: "#F1EFE8", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="fr" className={`${display.variable} ${mono.variable} ${serif.variable}`} style={{ "--f-body": "var(--f-display)" }}><body><LangProvider>{children}</LangProvider></body></html>);
}
