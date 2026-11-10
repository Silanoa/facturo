"use client";
import Link from "next/link";
import { useCountry } from "../lib/geo";
import { proPrice } from "../lib/pricing";
import { country } from "../lib/countries";
// Tarifs dans la devise du pays (profil si connecté, sinon pays détecté).
const L = {
  fr: { free: "Gratuit", pro: "Pro", forever: "Sans limite de durée", m: "par mois", y: "par an", ym: (x) => `soit ${x} par mois`, save: "2 mois offerts",
    fl: ["Devis, factures et reçus illimités", "PDF, WhatsApp, email et lien en ligne", "Suivi des paiements et relances WhatsApp", "Logo, couleurs et 1 modèle personnalisé", "Export CSV de vos données"], fn: "Mention « Fait avec Bonova » en pied de page",
    pl: ["Tout ce qui est dans Gratuit", "Modèles personnalisés illimités", "Signature et cachet sur vos documents", "Sans mention Bonova, pied de page à votre nom", "Page de paiement à votre seule marque", "Support prioritaire"],
    start: "Commencer gratuitement", go: "Passer à Pro", month: "Mensuel", year: "Annuel", shown: (c) => `Prix pour : ${c}.`, momo: "Paiement par Mobile Money.", card: "Paiement par carte ou PayPal.", cancel: "Sans engagement ni renouvellement automatique." },
  en: { free: "Free", pro: "Pro", forever: "No time limit", m: "per month", y: "per year", ym: (x) => `${x} per month`, save: "2 months free",
    fl: ["Unlimited quotes, invoices and receipts", "PDF, WhatsApp, email and online link", "Payment tracking and WhatsApp reminders", "Logo, colours and 1 custom template", "CSV export of your data"], fn: "“Made with Bonova” line in the footer",
    pl: ["Everything in Free", "Unlimited custom templates", "Signature and stamp on your documents", "No Bonova line, your own footer", "Payment page with only your brand", "Priority support"],
    start: "Start for free", go: "Go Pro", month: "Monthly", year: "Yearly", shown: (c) => `Prices for: ${c}.`, momo: "Pay by Mobile Money.", card: "Pay by card or PayPal.", cancel: "No commitment, no automatic renewal." },
};
// Carte / PayPal (Lemon Squeezy) seulement quand le paiement est configuré.
const CARD = !!process.env.NEXT_PUBLIC_LEMON_MONTH;
// current : "free" | "month" | "year" | "life" (espace connecté). Un abonné garde l'accès aux offres : prolonger ou passer à l'annuel.
const CUR = {
  fr: { cur: "Votre offre actuelle", incl: "Inclus dans votre offre", base: "Offre de base", extM: "Prolonger d'un mois", extY: "Prolonger d'un an", toY: "Passer à l'annuel", stack: "Les jours restants sont conservés." },
  en: { cur: "Your current plan", incl: "Included in your plan", base: "Base plan", extM: "Add one month", extY: "Add one year", toY: "Switch to yearly", stack: "Remaining days are kept." },
};
export default function Pricing({ lang = "fr", cc: fixed, tryHref = "/essai", onBuy, current }) {
  const k = CUR[lang === "en" ? "en" : "fr"]; const pro = ["month", "year", "life"].includes(current);
  const t = L[lang === "en" ? "en" : "fr"]; const det = useCountry(); const cc = fixed || det; const P0 = proPrice(cc || "US", lang); const P = cc ? P0 : { ...P0, month: "…", year: "…", monthOfYear: "…" }; const c = country(cc || "US");
  const cta = (plan, cls, label) => current === "life" ? <span className="pz-cur">{k.incl}</span> : onBuy ? <button className={cls} onClick={() => onBuy(plan, P)}>{label}</button> : <Link href={`/connexion?mode=signup&plan=${plan}`} className={cls}>{label}</Link>;
  const lbl = (plan) => !pro ? t.go : plan === "month" ? k.extM : current === "year" ? k.extY : k.toY;
  const badge = (on) => on ? <span className="pz-now">{k.cur}</span> : null;
  return (<div className="pz">
    <div className={`pz-c ${current === "free" ? "on" : ""}`}><div className="pz-n">{t.free}{badge(current === "free")}</div><div className="pz-a">0</div><div className="pz-s">{t.forever}</div>
      <ul>{t.fl.map((x) => <li key={x}>{x}</li>)}<li className="no">{t.fn}</li></ul>
      {onBuy ? <span className="pz-cur">{pro ? k.base : k.cur}</span> : <Link href={tryHref} className="b o full">{t.start}</Link>}</div>
    <div className={`pz-c ${current === "month" || current === "life" ? "on" : !pro ? "hl" : ""}`}><div className="pz-n">{t.pro} · {t.month}{badge(current === "month" || current === "life")}</div><div className="pz-a">{P.month}</div><div className="pz-s">{t.m}</div>
      <ul>{t.pl.map((x) => <li key={x}>{x}</li>)}</ul>{cta("month", pro ? "b o full" : "b k full", lbl("month"))}</div>
    <div className={`pz-c ${current === "year" ? "on" : current === "month" ? "hl" : ""}`}><div className="pz-n">{t.pro} · {t.year} <span className="pz-tag">{t.save}</span>{badge(current === "year")}</div><div className="pz-a">{P.year}</div><div className="pz-s">{t.y} · {t.ym(P.monthOfYear)}</div>
      <ul><li>{lang === "en" ? "Everything in Pro monthly" : "Tout ce qui est dans Pro mensuel"}</li><li>{lang === "en" ? "One payment a year" : "Un seul paiement par an"}</li></ul>{cta("year", current === "month" ? "b k full" : "b o full", lbl("year"))}</div>
    <p className="pz-f">{cc && t.shown(lang === "en" ? c.en : c.fr)} {P.momo ? t.momo : CARD ? t.card : ""} {pro && current !== "life" ? k.stack : t.cancel}</p>
  </div>);
}
