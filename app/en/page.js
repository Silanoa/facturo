import Link from "next/link";
import { Logo, SiteFooter } from "../../components/Brand";
export const metadata = { title: { absolute: "Kola — Invoices that get paid, with Mobile Money" }, description: "Create an invoice in under a minute in FCFA, naira, cedi or euro, send it on WhatsApp with a Mobile Money payment link, and see who still owes you. Free.", alternates: { canonical: "/en", languages: { fr: "/", en: "/en", "x-default": "/" } }, openGraph: { locale: "en_US" } };
export default function En() { return (<div lang="en"><header className="wrap nav"><Logo href="/en" /><nav className="links"><Link href="/" className="hide">Français</Link><Link href="/connexion">Sign in</Link><Link href="/essai" className="b s k">Try it</Link></nav></header>
  <main><section className="wrap hero"><div className="in"><p className="u" style={{ margin: "0 0 22px" }}>Invoices · quotes · receipts — FCFA, naira, cedi, euro</p>
    <h1>The invoice that gets <span className="sq">paid</span><span className="k">.</span></h1>
    <p className="lead">Describe the sale in one sentence. Kola drafts a clean, OHADA-ready invoice and sends it on WhatsApp with your Mobile Money numbers. Your client pays, you get notified.</p>
    <div className="row" style={{ flexWrap: "wrap" }}><Link href="/essai" className="b k" style={{ minHeight: 54, padding: "0 26px" }}>Make an invoice now</Link><Link href="/connexion" className="b o" style={{ minHeight: 54 }}>See the demo</Link></div>
    <p className="mute" style={{ fontSize: 14, marginTop: 16 }}>No account, no card. 10 free documents every month. The app interface is in French for now.</p></div>
    <div className="hero-photo in"><img src="/img/tailor.webp" alt="A tailor in her workshop in Cotonou, phone in hand" /></div></section>
  <section className="wrap sec"><div className="steps">
    <div><span className="n">01</span><h3>Say it.</h3><p className="mute">Type or dictate: “3 bags of cement at 9,500 naira for Tunde Bakare”. Lines, VAT and total fill in.</p></div>
    <div><span className="n">02</span><h3>Send it.</h3><p className="mute">WhatsApp opens with the message ready. Your client gets a link, not a PDF lost in the chat.</p></div>
    <div><span className="n">03</span><h3>Get paid.</h3><p className="mute">They copy your MoMo number, pay, tap “I've paid”. You see who opened, who paid, who still owes.</p></div></div></section>
  <section className="wrap sec" style={{ paddingTop: 0 }}><h2>Pricing</h2><div className="price">
    <div><div className="u">Free</div><div className="amt">0</div><ul><li>10 documents a month</li><li>4 templates, logo, colours</li><li>Payment link and WhatsApp</li></ul><Link href="/essai" className="b o full">Start</Link></div>
    <div className="hl"><div className="u" style={{ color: "var(--ochre)" }}>Pro</div><div className="amt">2,500 F</div><div className="mute">per month (≈ €3.80)</div><ul><li>Unlimited documents</li><li>No Kola branding</li><li>Custom footer</li></ul><Link href="/connexion?mode=signup" className="b k full">Go Pro</Link></div>
    <div><div className="u">Pro yearly</div><div className="amt">25,000 F</div><div className="mute">2 months free</div><ul><li>Everything in Pro</li><li>Priority WhatsApp support</li></ul><Link href="/connexion?mode=signup" className="b o full">Choose yearly</Link></div></div></section></main><SiteFooter /></div>); }
