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
  title: { default: "Bonova — Free invoice maker for freelancers · Facture gratuite", template: "%s · Bonova" },
  description: "Make an invoice in seconds and send it by WhatsApp or email. Get paid by Mobile Money, bank transfer, card or PayPal. No account needed. Créez une facture en quelques secondes, sans inscription.",
  applicationName: "Bonova",
  manifest: "/manifest.webmanifest",
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }], apple: "/apple-touch-icon.png", shortcut: "/favicon.ico" },
  openGraph: { type: "website", siteName: "Bonova", url: "/" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};
export const viewport = { themeColor: "#2433D6", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }) {
  return (<html lang="fr" className={`${display.variable} ${mono.variable} ${serif.variable} ${ui.variable}`} style={{ "--f-body": "var(--f-display)" }}><body><LangProvider>{children}</LangProvider></body></html>);
}
