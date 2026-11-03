import { fmt, kindName } from "./money";
import { normPay, payLines } from "./pay";
export const OP_COLORS = { "MTN MoMo": ["#FFCB05", "#111"], "Moov Money": ["#0065B3", "#fff"], "Orange Money": ["#FF7900", "#111"], Wave: ["#1DC8FF", "#08263a"], "Celtiis Cash": ["#E30613", "#fff"], "Airtel Money": ["#E40000", "#fff"], "Free Money": ["#CD1E25", "#fff"], "M-Pesa": ["#4CAF50", "#fff"] };
export const opShort = (op = "") => ({ "MTN MoMo": "MTN", "Moov Money": "MOOV", "Orange Money": "OM", Wave: "WAVE", "Celtiis Cash": "CELT", "Airtel Money": "AIR", "Free Money": "FREE", "M-Pesa": "MPESA" }[op] || op.slice(0, 4).toUpperCase());
export const waNumber = (p) => (p || "").replace(/[^\d]/g, "").replace(/^00/, "");
export const origin = () => (typeof window !== "undefined" ? window.location.origin : "");
export const publicUrl = (doc) => doc.public_token ? `${origin()}/f/${doc.public_token}` : "";
const dl = (d, lang) => new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long" });
export function shareText(doc, profile = {}, lang = profile.doc_lang || "fr") {
  const en = lang === "en"; const link = publicUrl(doc); const k = kindName(doc.kind, lang).toLowerCase();
  const pay = normPay(profile.momo).map((m) => `• ${payLines(m, lang)}`).join("\n");
  const amt = `*${fmt(doc.total, doc.currency, lang)}*`;
  const head = en ? `Hello ${doc.client?.name || ""},\n\nHere is your ${k} ${doc.number}: ${amt}` : `Bonjour ${doc.client?.name || ""},\n\nVoici ${doc.kind === "quote" ? "votre devis" : doc.kind === "receipt" ? "votre reçu" : "votre facture"} ${doc.number} : ${amt}`;
  const due = doc.due_date && doc.kind === "invoice" ? (en ? `, due ${dl(doc.due_date, lang)}.` : `, à régler avant le ${dl(doc.due_date, lang)}.`) : ".";
  return [head + due, link && (en ? `\nView & download: ${link}` : `\nVoir et télécharger : ${link}`),
    doc.kind === "invoice" && pay && (en ? `\nHow to pay:\n${pay}\nReference: ${doc.number}` : `\nPour payer :\n${pay}\nRéférence : ${doc.number}`),
    `\n${en ? "Thank you!" : "Merci !"}${profile.business_name ? `\n${profile.business_name}` : ""}`].filter(Boolean).join("\n");
}
export const waLink = (phone, text) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
export const mailLink = (email, subject, text) => `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.replace(/\*/g, ""))}`;
export function daysLate(doc) { if (!doc.due_date || doc.status === "paid") return 0; return Math.max(0, Math.floor((Date.now() - new Date(doc.due_date)) / 864e5)); }
export function effStatus(doc) { if (doc.status === "paid") return "paid"; if (doc.declared_paid_at) return "declared"; if (doc.kind === "invoice" && doc.status !== "draft" && daysLate(doc) > 0) return "late"; return doc.status; }
const ST = { fr: { draft: "Brouillon", sent: "Envoyée", paid: "Payée", late: "En retard", accepted: "Accepté", declined: "Refusé", declared: "Paiement signalé" }, en: { draft: "Draft", sent: "Sent", paid: "Paid", late: "Overdue", accepted: "Accepted", declined: "Declined", declared: "Payment reported" } };
export const statusName = (s, lang = "fr") => ST[lang === "en" ? "en" : "fr"][s] || s;
export const STATUS = ST.fr;
export const initials = (n = "") => n.split(/\s+/).filter(w => !/^(m|mme|mr|mrs|dr|la|le|sarl|sa|ltd)\.?$/i.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
export const avColor = () => "transparent";
