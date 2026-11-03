import Link from "next/link";
import Pricing from "./Pricing";
import { SiteNav, SiteFooter } from "./Brand";
import DocPaper from "./DocPaper";
import LiveDemo from "./LiveDemo";
import Reveal from "./Reveal";
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
  fr: { k: "Pour les indépendants et les petites entreprises", h: ["Facturez", "en une minute."], hs: "Faites-vous payer plus vite.", lead: "Créez vos devis, factures et reçus en une minute. Devise, taxes et mentions légales sont réglées selon votre pays. Envoyez par WhatsApp, email ou PDF et suivez les paiements.",
    cta: "Faire ma première facture", demo: "Voir un exemple", meta: ["Sans compte", "Sans commission", "Français / English"],
    s1: "Fonctionnement", s1h: "Trois étapes.", steps: [["Décrire", "Saisissez ou dictez la prestation. Les lignes, le total et l'échéance se remplissent."], ["Envoyer", "En PDF, par WhatsApp, par email ou par lien. Votre client n'a rien à installer."], ["Suivre", "Payée, partielle, en retard : le statut et le solde sont à jour. Un devis accepté en ligne s'affiche aussitôt."]],
    zones: "Pays pris en charge",
    s2: "Paiements", s2h: "Vos moyens de paiement sur le document.", rails: [["Mobile Money", "Votre numéro et l'opérateur, avec la référence de la facture."], ["Virement bancaire", "IBAN ou numéro de compte, et BIC/SWIFT."], ["Lien de paiement", "PayPal, Stripe, Wise ou autre : un bouton « Payer » s'affiche sur la facture."], ["Aucun", "Tout est facultatif. Vous pouvez émettre une facture sans coordonnées de paiement."]],
    s3: "Devis, facture, reçu", s3h: "Trois documents, trois rôles.", docs: [["Devis", "Avant le travail", "Vous proposez un prix. Le client l'accepte ou le refuse en ligne. Un clic le transforme en facture."], ["Facture", "Après le travail", "Vous demandez le paiement avec une échéance. Acomptes et paiements partiels sont déduits du solde."], ["Reçu", "Une fois payé", "La preuve de paiement : montant, date, moyen de paiement et facture concernée."]],
    s4: "Le document", s4h: "Vos documents, à votre image.", s4p: "Cinq modèles, votre logo, vos couleurs et votre police. Vous pouvez aussi importer votre papier à en-tête. Gratuit : 1 modèle personnalisé enregistré. Pro : illimité.",
    s5: "Tarifs", s5h: "Gratuit pour commencer.", plans: [["Gratuit", "0", "sans limite de durée", ["Devis, factures et reçus illimités", "PDF, WhatsApp, email, lien", "Mention « Fait avec Bonova »"], "Commencer"], ["Pro", "2 500 F", "FCFA / mois · environ 4 € ou 4 $", ["Sans mention Bonova", "Signature et cachet", "Pied de page personnalisé", "Mobile Money, carte ou PayPal"], "Passer à Pro"], ["Pro annuel", "25 000 F", "FCFA / an · 2 mois offerts", ["Tout Pro", "Support prioritaire"], "Choisir l'annuel"]],
    s6: "Questions", end: ["Votre prochaine facture,", "dans une minute."] },
  en: { k: "For freelancers and small businesses", h: ["Invoice", "in a minute."], hs: "Get paid faster.", lead: "Create quotes, invoices and receipts in a minute. Currency, tax and legal lines follow your country. Send by WhatsApp, email or PDF and track payments.",
    cta: "Make my first invoice", demo: "See an example", meta: ["No account", "No fees", "English / Français"],
    s1: "How it works", s1h: "Three steps.", steps: [["Describe", "Type or dictate the job. Lines, total and due date fill in."], ["Send", "As a PDF, by WhatsApp, email or link. Your client installs nothing."], ["Track", "Paid, part paid, overdue: status and balance stay current. A quote accepted online shows up instantly."]],
    zones: "Supported countries",
    s2: "Payments", s2h: "Your payment details on the document.", rails: [["Mobile Money", "Your number and operator, with the invoice reference."], ["Bank transfer", "IBAN or account number, plus BIC/SWIFT."], ["Payment link", "PayPal, Stripe, Wise or other: a “Pay” button appears on the invoice."], ["None", "Everything is optional. You can issue an invoice with no payment details."]],
    s3: "Quote, invoice, receipt", s3h: "Three documents, three jobs.", docs: [["Quote", "Before the work", "You propose a price. The client accepts or declines online. One click turns it into an invoice."], ["Invoice", "After the work", "You request payment with a due date. Deposits and part payments are deducted from the balance."], ["Receipt", "Once paid", "Proof of payment: amount, date, method and the invoice it settles."]],
    s4: "The document", s4h: "Your documents, your look.", s4p: "Five templates, your logo, colours and font. You can also import your letterhead. Free: 1 saved custom template. Pro: unlimited.",
    s5: "Pricing", s5h: "Free to start.", plans: [["Free", "$0", "no time limit", ["Unlimited quotes, invoices, receipts", "PDF, WhatsApp, email, link", "“Made with Bonova” line"], "Start"], ["Pro", "$4", "per month · or 2,500 FCFA", ["No Bonova branding", "Signature and stamp", "Custom footer", "Card, PayPal or Mobile Money"], "Go Pro"], ["Pro yearly", "$36", "per year · 3 months free", ["Everything in Pro", "Priority support"], "Choose yearly"]],
    s6: "Questions", end: ["Your next invoice,", "a minute from now."] },
};
export default function Landing({ lang = "fr" }) {
  const t = C[lang]; const en = lang === "en"; const tryH = en ? "/en/invoice-generator" : "/essai";
  const ld = [{ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Bonova", applicationCategory: "BusinessApplication", operatingSystem: "Web, Android, iOS", url: SITE.url + (en ? "/en" : "/"), inLanguage: lang,
    offers: [{ "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" }, { "@type": "Offer", price: "4.9", priceCurrency: "USD", name: "Pro monthly" }] },
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
            <div className="row" style={{ marginTop: 26, flexWrap: "wrap" }}><Link href={tryH} className="b k" style={{ minHeight: 56, padding: "0 26px", fontSize: 16 }}>{t.cta} →</Link><Link href={en ? "/en/example" : "/exemple"} className="b o" style={{ minHeight: 56 }}>{t.demo}</Link></div></div>
        </div>
        <div className="hero-r in" style={{ animationDelay: ".08s" }}>
          <div className="hero-meta">{t.meta.map((m) => <span key={m}>■ {m}</span>)}</div>
          <LiveDemo lang={lang} />
        </div>
      </section></div>
      <section className="wrap sec"><div className="sec-h"><p className="u">01 — {t.s1}</p><h2>{t.s1h}</h2></div>
        <div className="steps">{t.steps.map(([h, p], i) => <div key={h} className="rv" style={{ transitionDelay: `${i * 80}ms` }}><span className="n">0{i + 1}</span><h3>{h}</h3><p className="mute">{p}</p></div>)}</div>
        <div className="zones"><span className="u">{t.zones}</span><p>{ZONES[lang]}</p></div></section>
      <div className="perf" aria-hidden="true" />
      <section className="wrap sec"><div className="sec-h"><p className="u">02 — {t.s2}</p><h2>{t.s2h}</h2></div>
        <div className="rails r4">{t.rails.map(([h, p], i) => <div key={h} className={`rv ${i === 3 ? "nil" : ""}`} style={{ transitionDelay: `${i * 70}ms` }}><span className="n mono">0{i + 1}</span><h3>{h}</h3><p>{p}</p></div>)}</div></section>
      <section className="wrap sec" style={{ paddingTop: 0 }}><div className="sec-h"><p className="u">03 — {t.s3}</p><h2>{t.s3h}</h2></div>
        <div className="kdocs">{t.docs.map(([h, w, p], i) => <div key={h} className={`rv k${i}`} style={{ transitionDelay: `${i * 80}ms` }}><span className="u">{w}</span><h3>{h}</h3><p className="mute">{p}</p>{i < 2 && <span className="arr" aria-hidden>→</span>}</div>)}</div></section>
      <section style={{ background: "var(--ink)", color: "var(--paper)" }}><div className="wrap sec split">
        <div><p className="u" style={{ color: "#ffffff88" }}>04 — {t.s4}</p><h2 style={{ fontSize: "clamp(44px,6.4vw,96px)" }}>{t.s4h}</h2><p style={{ fontSize: 18, color: "#ffffffbb", maxWidth: 480, marginTop: 20 }}>{t.s4p}</p>
          <Link href={tryH} className="b inv" style={{ marginTop: 14 }}>{t.cta} →</Link></div>
        <div className="tshow" aria-hidden="true"><div className="tsc a"><DocPaper doc={en ? SAMPLE_EN : SAMPLE} profile={en ? P2 : P1} /></div><div className="tsc b"><DocPaper doc={en ? SAMPLE : SAMPLE_EN} profile={en ? P1 : P2} /></div></div>
      </div></section>
      <section className="wrap sec" id="pricing"><div className="sec-h"><p className="u">05 — {t.s5}</p><h2>{t.s5h}</h2></div>
        <Pricing lang={lang} tryHref={tryH} /></section>
      <section className="wrap sec" style={{ paddingTop: 0 }}><div className="sec-h"><p className="u">06 — {t.s6}</p><div className="faq">{FAQ[lang].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
      <section className="bigcta"><div className="wrap sec"><h2>{t.end[0]}<br /><span className="serif" style={{ color: "#fff" }}>{t.end[1]}</span></h2><Link href={tryH} className="b" style={{ marginTop: 34, minHeight: 60, padding: "0 30px", fontSize: 17 }}>{t.cta} →</Link></div></section>
    </main>
    <Reveal />
    <SiteFooter lang={lang} />
  </div>);
}
