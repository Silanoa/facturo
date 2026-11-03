import Link from "next/link";
import { SiteNav, SiteFooter } from "./Brand";
import DocPaper from "./DocPaper";
import LiveDemo from "./LiveDemo";
import { FAQ } from "../lib/faq";
import { SITE } from "../lib/site";
const SAMPLE = { kind: "invoice", number: "FAC-2026-0042", status: "sent", currency: "XOF", tax_rate: 18, discount: 0, issue_date: "2026-11-02", due_date: "2026-11-17", lang: "fr",
  client: { name: "Hôtel Les Cocotiers", address: "Haie Vive, Cotonou", tax_id: "3202400112233" },
  items: [{ label: "Identité visuelle (logo + charte)", qty: 1, price: 350000 }, { label: "Déclinaisons réseaux sociaux", qty: 6, price: 15000 }, { label: "Impression menus", qty: 1, price: 40000 }] };
const SAMPLE_EN = { kind: "invoice", number: "INV-2026-0107", status: "paid", currency: "EUR", tax_rate: 0, discount: 0, issue_date: "2026-11-02", due_date: "2026-11-16", lang: "en",
  client: { name: "Nordlicht GmbH", address: "Berlin, Germany", tax_id: "DE301234567" }, items: [{ label: "Product design sprint", qty: 5, price: 420 }, { label: "Prototype & handoff", qty: 1, price: 900 }] };
const P1 = { business_name: "Studio Awa", address: "Akpakpa, Cotonou", country: "BJ", ifu: "0202412345678", rccm: "RB/COT/24 A 12345", template: "atelier", momo: [{ type: "momo", op: "MTN MoMo", number: "+229 01 97 11 22 33" }, { type: "link", provider: "PayPal", url: "paypal.me/studioawa" }] };
const P2 = { business_name: "Kwame Mensah Design", address: "Accra · Lisbon", country: "PT", template: "marche", accent: "#2433D6", momo: [{ type: "bank", bank: "Wise", iban: "BE71 9671 0000 1234", swift: "TRWIBEB1XXX", name: "K. Mensah" }, { type: "link", provider: "Stripe", url: "buy.stripe.com/kmd" }] };
const C = {
  fr: { k: "Factures · devis · reçus — 54 pays d'Afrique et le reste du monde", h: ["Une facture.", "Envoyée."], hs: "en quelques secondes.", lead: "Écrivez ce que vous avez fait. Bonova en fait une facture propre, dans la bonne devise et avec les bonnes mentions, puis l'envoie par WhatsApp ou email. Sans compte. Sans commission.",
    cta: "Faire une facture", demo: "Essayer en direct", meta: ["Sans inscription", "0 % de commission", "FR / EN"],
    s1: "Comment", s1h: "Trois gestes. Pas un de plus.", steps: [["Écrivez", "« Logo 350 000 et 6 visuels à 15 000 pour l'Hôtel Les Cocotiers. » Lignes, TVA, total : c'est rempli. Dictée vocale incluse."], ["Envoyez", "PDF, WhatsApp, email ou lien. Votre client reçoit une vraie facture, dans sa langue, lisible sur téléphone."], ["Encaissez", "Il paie par Mobile Money, virement, carte ou PayPal — directement chez vous. Il appuie sur « J'ai payé », vous confirmez."]],
    s2: "Paiement", s2h: "Soyez payé par n'importe qui, n'importe où.", rails: [["Mobile Money", "MTN, Moov, Orange, Wave, Airtel, M-Pesa… Votre numéro, copiable en un geste.", "24 opérateurs"], ["Virement", "IBAN, RIB, SWIFT, sort code. Pour les clients en Europe, en Amérique, partout.", "SEPA · SWIFT"], ["Carte", "Collez votre lien Stripe, Paystack, Flutterwave, Kkiapay ou FedaPay. Le bouton « Payer » apparaît.", "Vos comptes"], ["PayPal · Wise", "Pour la diaspora et les clients à l'étranger. Aucun intermédiaire de plus.", "0 % Bonova"]],
    s3: "Pourquoi", s3h: "Ce que les autres font payer, ou oublient.", cmpH: ["", "Apps de facturation classiques", "Bonova"], cmp: [["Faire et envoyer une facture sans compte", "Rarement", "Oui, en 3 gestes"], ["Nombre de factures gratuites", "Souvent 3 à 10 par mois", "Illimité"], ["Commission sur vos paiements", "Jusqu'à 2,9 % + frais", "0 %"], ["Mobile Money", "Absent", "Natif"], ["FCFA, naira, cedi… + euro, dollar", "Partiel", "Toutes les devises"], ["Mentions OHADA, TVA UE, UK, US, Canada", "Un seul pays", "Selon votre pays"], ["Envoi WhatsApp", "Non", "Oui"], ["Résiliation", "Parcours du combattant", "Un clic"]],
    s4: "Le document", s4h: "Une facture qu'on a envie de payer.", s4p: "Quatre modèles sobres, votre logo, votre couleur. Montant en lettres, mentions légales de votre pays, moyens de paiement en bas de page. En français ou en anglais, au choix du document.",
    s5: "Tarifs", s5h: "Gratuit. Vraiment.", plans: [["Gratuit", "0", "pour toujours", ["Factures, devis, reçus illimités", "PDF, WhatsApp, email, lien", "Toutes devises, FR / EN", "Mention « Fait avec Bonova »"], "Commencer"], ["Pro", "2 500 F", "FCFA / mois · ≈ 3,80 € · 4 $", ["Sans mention Bonova", "Relances automatiques", "Votre pied de page, export CSV", "Payable par Mobile Money, carte, PayPal"], "Passer à Pro"], ["Pro annuel", "25 000 F", "FCFA / an · 2 mois offerts", ["Tout Pro", "Support prioritaire WhatsApp"], "Choisir l'annuel"]],
    s6: "Questions", end: ["Votre prochaine facture", "part dans 30 secondes."] },
  en: { k: "Invoices · quotes · receipts — for 54 African countries and the rest of the world", h: ["An invoice.", "Sent."], hs: "in seconds.", lead: "Write what you did. Bonova turns it into a clean invoice in the right currency with the right legal lines, then sends it by WhatsApp or email. No account. No fees.",
    cta: "Make an invoice", demo: "Try it live", meta: ["No sign-up", "0% fees", "EN / FR"],
    s1: "How", s1h: "Three moves. Not one more.", steps: [["Write", "“Logo design 1,200 and 3 social templates at 150 for Acme Studio.” Lines, tax, total: filled in. Voice dictation included."], ["Send", "PDF, WhatsApp, email or link. Your client gets a real invoice, in their language, readable on a phone."], ["Get paid", "They pay by Mobile Money, bank transfer, card or PayPal — straight to you. They tap “I've paid”, you confirm."]],
    s2: "Payments", s2h: "Get paid by anyone, anywhere.", rails: [["Mobile Money", "MTN, Moov, Orange, Wave, Airtel, M-Pesa… your number, copyable in one tap.", "24 operators"], ["Bank transfer", "IBAN, SWIFT, sort code, routing. For clients in Europe, the Americas, anywhere.", "SEPA · SWIFT"], ["Card", "Paste your Stripe, Paystack, Flutterwave, Kkiapay or FedaPay link. A “Pay” button appears.", "Your accounts"], ["PayPal · Wise", "For diaspora and overseas clients. No extra middleman.", "0% Bonova"]],
    s3: "Why", s3h: "What others charge for, or forget.", cmpH: ["", "Typical invoicing apps", "Bonova"], cmp: [["Make & send an invoice with no account", "Rarely", "Yes, in 3 moves"], ["Free invoices", "Often 3–10 a month", "Unlimited"], ["Cut of your payments", "Up to 2.9% + fees", "0%"], ["Mobile Money", "Missing", "Built in"], ["CFA, naira, cedi… + euro, dollar", "Partial", "Every currency"], ["OHADA, EU VAT, UK, US, Canada rules", "One country", "Per your country"], ["Send on WhatsApp", "No", "Yes"], ["Cancelling", "An obstacle course", "One click"]],
    s4: "The document", s4h: "An invoice people want to pay.", s4p: "Four restrained templates, your logo, your colour. Amount in words, your country's legal lines, payment details at the bottom. In English or French, per document.",
    s5: "Pricing", s5h: "Free. Really.", plans: [["Free", "$0", "forever", ["Unlimited invoices, quotes, receipts", "PDF, WhatsApp, email, link", "Every currency, EN / FR", "“Made with Bonova” line"], "Start"], ["Pro", "$4", "per month · or 2,500 FCFA", ["No Bonova branding", "Automatic reminders", "Your footer, CSV export", "Pay by card, PayPal or Mobile Money"], "Go Pro"], ["Pro yearly", "$36", "per year · 3 months free", ["Everything in Pro", "Priority WhatsApp support"], "Choose yearly"]],
    s6: "Questions", end: ["Your next invoice", "goes out in 30 seconds."] },
};
const TICK = ["XOF Cotonou", "NGN Lagos", "GHS Accra", "KES Nairobi", "XAF Douala", "MAD Casablanca", "ZAR Johannesburg", "EUR Paris", "GBP London", "CAD Montréal", "USD New York", "XOF Dakar", "RWF Kigali", "EGP Cairo", "EUR Bruxelles", "TZS Dar es Salaam"];
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
      <div className="tick" aria-hidden="true"><div>{[...TICK, ...TICK].map((x, i) => <span key={i}><b>{x.slice(0, 3)}</b>{x.slice(4)}</span>)}</div></div>
      <section className="wrap sec"><div className="sec-h"><p className="u">§ 01 — {t.s1}</p><h2>{t.s1h}</h2></div>
        <div className="steps">{t.steps.map(([h, p], i) => <div key={h}><span className="n">0{i + 1}</span><h3>{h}.</h3><p className="mute">{p}</p></div>)}</div></section>
      <div className="perf" aria-hidden="true" />
      <section className="wrap sec"><div className="sec-h"><p className="u">§ 02 — {t.s2}</p><h2>{t.s2h}</h2></div>
        <div className="rails">{t.rails.map(([h, p, m], i) => <div key={h} className={i === 0 ? "hl" : ""}><h3>{h}</h3><div><p>{p}</p><span className="mono">{m}</span></div></div>)}</div></section>
      <section className="wrap sec" style={{ paddingTop: 0 }}><div className="sec-h"><p className="u">§ 03 — {t.s3}</p><h2>{t.s3h}</h2></div>
        <div className="cmp-w"><table className="cmp"><thead><tr>{t.cmpH.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{t.cmp.map(([a, b, c]) => <tr key={a}><td>{a}</td><td className="mute">{b}</td><td className="us">{c}</td></tr>)}</tbody></table></div></section>
      <section style={{ background: "var(--ink)", color: "var(--paper)" }}><div className="wrap sec split">
        <div><p className="u" style={{ color: "#ffffff88" }}>§ 04 — {t.s4}</p><h2 style={{ fontSize: "clamp(44px,6.4vw,96px)" }}>{t.s4h}</h2><p style={{ fontSize: 18, color: "#ffffffbb", maxWidth: 480, marginTop: 20 }}>{t.s4p}</p>
          <Link href={tryH} className="b inv" style={{ marginTop: 14 }}>{t.cta} →</Link></div>
        <div className="tshow" aria-hidden="true"><div className="tsc a"><DocPaper doc={en ? SAMPLE_EN : SAMPLE} profile={en ? P2 : P1} /></div><div className="tsc b"><DocPaper doc={en ? SAMPLE : SAMPLE_EN} profile={en ? P1 : P2} /></div></div>
      </div></section>
      <section className="wrap sec" id="pricing"><div className="sec-h"><p className="u">§ 05 — {t.s5}</p><h2>{t.s5h}</h2></div>
        <div className="price">{t.plans.map(([n, a, s, li, c], i) => <div key={n} className={i === 1 ? "hl" : ""}><div className="u" style={i === 1 ? { color: "#9DA7FF" } : null}>{n}</div><div className="amt">{a}</div><div className="mute">{s}</div><ul>{li.map((x) => <li key={x}>{x}</li>)}</ul>
          <Link href={i ? "/connexion?mode=signup&plan=pro" : tryH} className={`b full ${i === 1 ? "k" : "o"}`}>{c}</Link></div>)}</div></section>
      <section className="wrap sec" style={{ paddingTop: 0 }}><div className="sec-h"><p className="u">§ 06 — {t.s6}</p><div className="faq">{FAQ[lang].map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
      <section className="bigcta"><div className="wrap sec"><h2>{t.end[0]}<br /><span className="serif" style={{ color: "#fff" }}>{t.end[1]}</span></h2><Link href={tryH} className="b" style={{ marginTop: 34, minHeight: 60, padding: "0 30px", fontSize: 17 }}>{t.cta} →</Link></div></section>
    </main>
    <SiteFooter lang={lang} />
  </div>);
}
