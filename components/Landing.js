import Link from "next/link";
import { SiteNav, SiteFooter } from "./Brand";
import DocPaper from "./DocPaper";
import LiveDemo from "./LiveDemo";
import { FAQ } from "../lib/faq";
import { SITE } from "../lib/site";
const SAMPLE = { kind: "invoice", number: "FAC-2026-0042", status: "sent", currency: "XOF", tax_rate: 18, discount: 0, issue_date: "2026-11-02", due_date: "2026-11-17", lang: "fr",
  client: { name: "Atlas Conseil SARL", address: "Plateau, Dakar", tax_id: "NINEA 008123456" },
  items: [{ label: "Refonte du site web (5 pages)", qty: 1, price: 450000 }, { label: "Maintenance mensuelle", qty: 3, price: 35000 }, { label: "Rédaction de contenus", qty: 4, price: 20000 }] };
const SAMPLE_EN = { kind: "invoice", number: "INV-2026-0107", status: "paid", currency: "EUR", tax_rate: 0, discount: 0, issue_date: "2026-11-02", due_date: "2026-11-16", lang: "en",
  client: { name: "Northwind GmbH", address: "Berlin, Germany", tax_id: "DE301234567" }, items: [{ label: "Product design sprint (days)", qty: 5, price: 420 }, { label: "Prototype and handoff", qty: 1, price: 900 }] };
const P1 = { business_name: "Studio Martin", address: "Dakar, Sénégal", country: "SN", ifu: "007654321", rccm: "SN-DKR-2024-A-1234", template: "net", accent: "#1F3A5F", email: "contact@studiomartin.sn", momo: [{ type: "momo", op: "Wave", number: "+221 77 000 00 00" }, { type: "bank", bank: "CBAO", iban: "SN08 SN01 0015 2000 0000 0000 0000" }] };
const P2 = { business_name: "M. Laurent — Design", address: "Lisbon, Portugal", country: "PT", template: "atelier", accent: "#111110", momo: [{ type: "bank", bank: "Wise", iban: "BE71 9671 0000 1234", swift: "TRWIBEB1XXX", name: "M. Laurent" }, { type: "link", provider: "PayPal", url: "paypal.me/mlaurent" }] };
const ZONES = { fr: "Sénégal · Côte d'Ivoire · Bénin · Togo · Burkina Faso · Mali · Niger · Cameroun · Gabon · Congo · RD Congo · Guinée · Madagascar · Maroc · Tunisie · Nigeria · Ghana · Kenya · Afrique du Sud · France · Belgique · Suisse · Canada · Royaume-Uni · États-Unis",
  en: "Nigeria · Ghana · Kenya · South Africa · Rwanda · Uganda · Tanzania · Senegal · Côte d'Ivoire · Cameroon · Benin · Morocco · UK · France · Belgium · Switzerland · Canada · United States" };
const C = {
  fr: { k: "Facturation pour indépendants et prestataires de services", h: ["Facturez.", "Encaissez."], hs: "sans perdre de temps.", lead: "Créez une facture, un devis ou un reçu en une minute, avec la bonne devise, la bonne TVA et les mentions de votre pays. Envoyez-le par WhatsApp ou email, et suivez le paiement.",
    cta: "Créer une facture", demo: "Voir l'exemple", meta: ["Sans inscription", "0 % de commission", "Français / English"],
    s1: "Fonctionnement", s1h: "Créer, envoyer, encaisser.", steps: [["Créer", "Décrivez la prestation ou remplissez les lignes. Devise, TVA et mentions légales sont préréglées selon votre pays."], ["Envoyer", "Un PDF ou un lien vers la facture, partagé par WhatsApp ou email. Votre client la lit sur son téléphone, sans rien installer."], ["Encaisser", "Vos coordonnées de paiement figurent sur la facture. Le client indique qu'il a payé, vous confirmez : la facture passe en « Payée »."]],
    zones: "Pays pris en charge",
    s2: "Paiements", s2h: "Les moyens de paiement de vos clients.", rails: [["Mobile Money", "Wave, Orange Money, MTN MoMo, Moov, M-Pesa, Airtel… Votre numéro s'affiche avec la référence à indiquer.", "Afrique"], ["Virement", "IBAN, RIB, SWIFT ou sort code pour les clients en Europe, au Canada ou ailleurs.", "SEPA · SWIFT"], ["Carte et PayPal", "Ajoutez votre lien Stripe, PayPal, Wise, Paystack ou FedaPay : un bouton « Payer » apparaît sur la facture.", "Vos comptes"]],
    s4: "Le document", s4h: "Une facture qui inspire confiance.", s4p: "Cinq modèles sobres, votre logo et votre couleur, ou votre propre papier à en-tête importé en image ou en PDF. Mentions obligatoires, montant en lettres et coordonnées de paiement inclus.",
    s5: "Tarifs", s5h: "Gratuit pour commencer.", plans: [["Gratuit", "0", "sans limite de durée", ["Factures, devis et reçus illimités", "PDF, WhatsApp, email, lien", "Mention « Fait avec Bonova »"], "Commencer"], ["Pro", "2 500 F", "FCFA / mois · environ 4 € ou 4 $", ["Sans mention Bonova", "Relances automatiques", "Pied de page, export CSV", "Mobile Money, carte ou PayPal"], "Passer à Pro"], ["Pro annuel", "25 000 F", "FCFA / an · 2 mois offerts", ["Tout Pro", "Support prioritaire"], "Choisir l'annuel"]],
    s6: "Questions", end: ["Votre prochaine facture,", "en une minute."] },
  en: { k: "Invoicing for freelancers and independent service providers", h: ["Invoice.", "Get paid."], hs: "without the paperwork.", lead: "Create an invoice, quote or receipt in a minute, with the right currency, the right VAT and your country's legal lines. Send it by WhatsApp or email, and track the payment.",
    cta: "Create an invoice", demo: "See the example", meta: ["No sign-up", "0% fees", "English / Français"],
    s1: "How it works", s1h: "Create, send, get paid.", steps: [["Create", "Describe the job or fill in the lines. Currency, VAT and legal lines are preset for your country."], ["Send", "A PDF or a link to the invoice, shared by WhatsApp or email. Your client reads it on their phone, nothing to install."], ["Get paid", "Your payment details are on the invoice. The client marks it as paid, you confirm: the invoice moves to “Paid”."]],
    zones: "Supported countries",
    s2: "Payments", s2h: "The way your clients pay.", rails: [["Mobile Money", "M-Pesa, MTN MoMo, Airtel, Orange Money, Wave… Your number shows with the payment reference.", "Africa"], ["Bank transfer", "IBAN, SWIFT, sort code or routing number for clients in Europe, North America or anywhere.", "SEPA · SWIFT"], ["Card and PayPal", "Add your Stripe, PayPal, Wise, Paystack or Flutterwave link: a “Pay” button appears on the invoice.", "Your accounts"]],
    s4: "The document", s4h: "An invoice that looks the part.", s4p: "Five restrained templates, your logo and colour, or your own letterhead imported as an image or PDF. Required legal lines, amount in words and payment details included.",
    s5: "Pricing", s5h: "Free to start.", plans: [["Free", "$0", "no time limit", ["Unlimited invoices, quotes, receipts", "PDF, WhatsApp, email, link", "“Made with Bonova” line"], "Start"], ["Pro", "$4", "per month · or 2,500 FCFA", ["No Bonova branding", "Automatic reminders", "Custom footer, CSV export", "Card, PayPal or Mobile Money"], "Go Pro"], ["Pro yearly", "$36", "per year · 3 months free", ["Everything in Pro", "Priority support"], "Choose yearly"]],
    s6: "Questions", end: ["Your next invoice,", "in a minute."] },
};
export default function Landing({ lang = "fr" }) {
  const t = C[lang]; const en = lang === "en"; const tryH = en ? "/en/invoice-generator" : "/essai";
  const ld = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Bonova", applicationCategory: "BusinessApplication", operatingSystem: "Web, Android, iOS", url: SITE.url + (en ? "/en" : "/"), inLanguage: lang,
    offers: [{ "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" }, { "@type": "Offer", price: "4", priceCurrency: "USD", name: "Pro monthly" }] },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ[lang].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }];
  return (<div lang={lang}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <SiteNav lang={lang} />
    <main>
      <div className="wrap"><section className="hero">
        <div className="hero-l in">
          <p className="u" style={{ color: "var(--ink)" }}>{t.k}</p>
          <h1>{t.h[0]}<br />{t.h[1]}<span className="serif">{t.hs}</span></h1>
          <div><p className="lead">{t.lead}</p>
            <div className="row" style={{ marginTop: 26, flexWrap: "wrap" }}><Link href={tryH} className="b k" style={{ minHeight: 56, padding: "0 26px", fontSize: 16 }}>{t.cta} →</Link><a href="#demo" className="b o" style={{ minHeight: 56 }}>{t.demo}</a></div></div>
        </div>
        <div className="hero-r in" style={{ animationDelay: ".08s" }}>
          <div className="hero-meta">{t.meta.map((m) => <span key={m}>■ {m}</span>)}</div>
          <LiveDemo lang={lang} />
        </div>
      </section></div>
      <section className="wrap sec"><div className="sec-h"><p className="u">01 — {t.s1}</p><h2>{t.s1h}</h2></div>
        <div className="steps">{t.steps.map(([h, p], i) => <div key={h}><span className="n">0{i + 1}</span><h3>{h}</h3><p className="mute">{p}</p></div>)}</div>
        <div className="zones"><span className="u">{t.zones}</span><p>{ZONES[lang]}</p></div></section>
      <div className="perf" aria-hidden="true" />
      <section className="wrap sec"><div className="sec-h"><p className="u">02 — {t.s2}</p><h2>{t.s2h}</h2></div>
        <div className="rails">{t.rails.map(([h, p, m], i) => <div key={h} className={i === 0 ? "hl" : ""}><h3>{h}</h3><div><p>{p}</p><span className="mono">{m}</span></div></div>)}</div></section>
      <section style={{ background: "var(--ink)", color: "var(--paper)" }}><div className="wrap sec split">
        <div><p className="u" style={{ color: "#ffffff88" }}>03 — {t.s4}</p><h2 style={{ fontSize: "clamp(44px,6.4vw,96px)" }}>{t.s4h}</h2><p style={{ fontSize: 18, color: "#ffffffbb", maxWidth: 480, marginTop: 20 }}>{t.s4p}</p>
          <Link href={tryH} className="b inv" style={{ marginTop: 14 }}>{t.cta} →</Link></div>
        <div className="tshow" aria-hidden="true"><div className="tsc a"><DocPaper doc={en ? SAMPLE_EN : SAMPLE} profile={en ? P2 : P1} /></div><div className="tsc b"><DocPaper doc={en ? SAMPLE : SAMPLE_EN} profile={en ? P1 : P2} /></div></div>
      </div></section>
      <section className="wrap sec" id="pricing"><div className="sec-h"><p className="u">04 — {t.s5}</p><h2>{t.s5h}</h2></div>
        <div className="price">{t.plans.map(([n, a, s, li, c], i) => <div key={n} className={i === 1 ? "hl" : ""}><div className="u" style={i === 1 ? { color: "#9DA7FF" } : null}>{n}</div><div className="amt">{a}</div><div className="mute">{s}</div><ul>{li.map((x) => <li key={x}>{x}</li>)}</ul>
          <Link href={i ? "/connexion?mode=signup&plan=pro" : tryH} className={`b full ${i === 1 ? "k" : "o"}`}>{c}</Link></div>)}</div></section>
      <section className="wrap sec" style={{ paddingTop: 0 }}><div className="sec-h"><p className="u">05 — {t.s6}</p><div className="faq">{FAQ[lang].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
      <section className="bigcta"><div className="wrap sec"><h2>{t.end[0]}<br /><span className="serif" style={{ color: "#fff" }}>{t.end[1]}</span></h2><Link href={tryH} className="b" style={{ marginTop: 34, minHeight: 60, padding: "0 30px", fontSize: 17 }}>{t.cta} →</Link></div></section>
    </main>
    <SiteFooter lang={lang} />
  </div>);
}
