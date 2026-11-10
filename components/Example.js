"use client";
import { useState } from "react";
import Link from "next/link";
import DocPaper from "./DocPaper";
// Page d'exemple : la même prestation vue en devis, facture (acompte reçu) et reçu.
const BASE = { fr: { currency: "XOF", lang: "fr", tax_rate: 0, discount: 0, client: { name: "Atlas Conseil SARL", address: "Plateau, Dakar" }, items: [{ label: "Identité visuelle (logo, couleurs, typographies)", qty: 1, price: 350000 }, { label: "Déclinaisons réseaux sociaux", qty: 6, price: 15000 }] },
  en: { currency: "EUR", lang: "en", tax_rate: 0, discount: 0, client: { name: "Northwind Ltd", address: "London, UK" }, items: [{ label: "Brand identity (logo, colours, type)", qty: 1, price: 1800 }, { label: "Social media templates", qty: 6, price: 60 }] } };
const PROF = { fr: { business_name: "Camille Martin — Design", address: "Dakar, Sénégal", country: "SN", phone: "+221 77 000 00 00", ifu: "007654321", template: "net", accent: "#2433D6", momo: [{ type: "momo", op: "Wave", number: "+221 77 000 00 00" }, { type: "bank", bank: "CBAO", iban: "SN08 SN01 0000 0000 0000 0000 0000" }], blocks: { signature: true } },
  en: { business_name: "Sam Taylor — Design", address: "Lisbon, Portugal", country: "PT", template: "net", accent: "#2433D6", momo: [{ type: "bank", bank: "Wise", iban: "BE71 9671 0000 1234", swift: "TRWIBEB1XXX", name: "Sam Taylor" }, { type: "link", provider: "PayPal", url: "paypal.me/samtaylordesign" }], blocks: { signature: true } } };
const T = { fr: { h: "Un exemple, trois documents.", p: "La même mission, du devis accepté au reçu de paiement. Tout est modifiable : modèle, couleurs, sections, mentions.", tabs: [["quote", "Devis", "Avant : le client accepte en ligne"], ["invoice", "Facture", "Après : acompte reçu, solde à payer"], ["receipt", "Reçu", "Une fois payé : la preuve"]], cta: "Faire la mienne", back: "← Accueil", home: "/", try: "/essai" },
  en: { h: "One example, three documents.", p: "The same job, from accepted quote to payment receipt. Everything is editable: template, colours, sections, legal lines.", tabs: [["quote", "Quote", "Before: the client accepts online"], ["invoice", "Invoice", "After: deposit received, balance due"], ["receipt", "Receipt", "Once paid: the proof"]], cta: "Make mine", back: "← Home", home: "/en", try: "/en/invoice-generator" } };
export default function Example({ lang = "fr" }) {
  const t = T[lang]; const en = lang === "en"; const [k, setK] = useState("invoice"); const b = BASE[lang];
  const total = b.items.reduce((a, i) => a + i.qty * i.price, 0); const dep = Math.round(total * 0.3);
  const docs = {
    quote: { ...b, kind: "quote", number: en ? "QUO-2026-0012" : "DEV-2026-0012", status: "accepted", issue_date: "2026-10-01", due_date: "2026-10-31", opts: { deposit: 30 }, notes: en ? "Two rounds of revisions included." : "Deux allers-retours de corrections inclus." },
    invoice: { ...b, kind: "invoice", number: en ? "INV-2026-0031" : "FAC-2026-0031", status: "partial", paid_amount: dep, issue_date: "2026-10-20", due_date: "2026-11-04", opts: { pay: true, ref: true } },
    receipt: { ...b, kind: "receipt", number: en ? "REC-2026-0019" : "REC-2026-0019", status: "paid", issue_date: "2026-11-03", opts: { paid_on: "2026-11-03", method: en ? "Bank transfer" : "Mobile Money", for: en ? "invoice INV-2026-0031" : "facture FAC-2026-0031" } } };
  return (<div className="wrap" style={{ padding: "34px 20px 80px" }}>
    <Link href={t.home} className="lnk" style={{ fontSize: 14, color: "var(--mute)" }}>{t.back}</Link>
    <div className="row" style={{ justifyContent: "space-between", alignItems: "end", flexWrap: "wrap", gap: 16, margin: "14px 0 22px" }}>
      <div><h1 style={{ fontSize: "clamp(36px,6vw,64px)", margin: 0 }}>{t.h}</h1><p className="mute" style={{ maxWidth: 560, fontSize: 17, margin: "10px 0 0" }}>{t.p}</p></div>
      <Link href={t.try} className="b k" style={{ minHeight: 52 }}>{t.cta} →</Link></div>
    <div className="extabs" role="tablist">{t.tabs.map(([id, l, d]) => <button key={id} role="tab" aria-selected={k === id} className={k === id ? "on" : ""} onClick={() => setK(id)}><b>{l}</b><span>{d}</span></button>)}</div>
    <div key={k} className="exdoc"><DocPaper doc={docs[k]} profile={PROF[lang]} /></div>
  </div>);
}
