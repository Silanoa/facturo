"use client";
import Link from "next/link";
import { useCountry } from "../lib/geo";
import { proPrice } from "../lib/pricing";
import { country } from "../lib/countries";
// Tarifs dans la devise du pays (profil si connecté, sinon pays détecté).
const L = {
  fr: { free: "Gratuit", pro: "Pro", forever: "Sans limite de durée", m: "par mois", y: "par an", ym: (x) => `soit ${x} par mois`, save: "2 mois offerts",
    fl: ["Devis, factures et reçus illimités", "PDF, WhatsApp, email et lien en ligne", "Suivi des paiements et relances", "1 modèle personnalisé"], fn: "Mention « Fait avec Bonova » en pied de page",
    pl: ["Tout ce qui est dans Gratuit", "Modèles personnalisés illimités", "Sans mention Bonova, pied de page à votre nom", "Relances programmées", "Support prioritaire"],
    start: "Commencer gratuitement", go: "Passer à Pro", month: "Mensuel", year: "Annuel", shown: (c) => `Prix pour : ${c}.`, momo: "Mobile Money, carte ou PayPal.", card: "Carte ou PayPal.", cancel: "Sans engagement, résiliable à tout moment." },
  en: { free: "Free", pro: "Pro", forever: "No time limit", m: "per month", y: "per year", ym: (x) => `${x} per month`, save: "2 months free",
    fl: ["Unlimited quotes, invoices and receipts", "PDF, WhatsApp, email and online link", "Payment tracking and reminders", "1 custom template"], fn: "“Made with Bonova” line in the footer",
    pl: ["Everything in Free", "Unlimited custom templates", "No Bonova line, your own footer", "Scheduled reminders", "Priority support"],
    start: "Start for free", go: "Go Pro", month: "Monthly", year: "Yearly", shown: (c) => `Prices for: ${c}.`, momo: "Mobile Money, card or PayPal.", card: "Card or PayPal.", cancel: "No commitment, cancel any time." },
};
export default function Pricing({ lang = "fr", cc: fixed, tryHref = "/essai", onBuy }) {
  const t = L[lang === "en" ? "en" : "fr"]; const det = useCountry(); const cc = fixed || det || (lang === "en" ? "US" : "SN"); const P = proPrice(cc, lang); const c = country(cc);
  const cta = (plan, cls, label) => onBuy ? <button className={cls} onClick={() => onBuy(plan, P)}>{label}</button> : <Link href={`/connexion?mode=signup&plan=${plan}`} className={cls}>{label}</Link>;
  return (<div className="pz">
    <div className="pz-c"><div className="pz-n">{t.free}</div><div className="pz-a">0</div><div className="pz-s">{t.forever}</div>
      <ul>{t.fl.map((x) => <li key={x}>{x}</li>)}<li className="no">{t.fn}</li></ul>
      {onBuy ? <span className="pz-cur">{lang === "en" ? "Your current plan" : "Votre offre actuelle"}</span> : <Link href={tryHref} className="b o full">{t.start}</Link>}</div>
    <div className="pz-c hl"><div className="pz-n">{t.pro} · {t.month}</div><div className="pz-a">{P.month}</div><div className="pz-s">{t.m}</div>
      <ul>{t.pl.map((x) => <li key={x}>{x}</li>)}</ul>{cta("month", "b k full", t.go)}</div>
    <div className="pz-c"><div className="pz-n">{t.pro} · {t.year} <span className="pz-tag">{t.save}</span></div><div className="pz-a">{P.year}</div><div className="pz-s">{t.y} · {t.ym(P.monthOfYear)}</div>
      <ul>{t.pl.slice(0, 1).map((x) => <li key={x}>{x}</li>)}<li>{lang === "en" ? "One payment a year" : "Un seul paiement par an"}</li></ul>{cta("year", "b o full", t.go)}</div>
    <p className="pz-f">{t.shown(lang === "en" ? c.en : c.fr)} {P.momo ? t.momo : t.card} {t.cancel}</p>
  </div>);
}
