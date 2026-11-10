import { fmt, kindName } from "./money";
import { normPay, payLines } from "./pay";
export const OP_COLORS = { "MTN MoMo": ["#FFCB05", "#111"], "Moov Money": ["#0065B3", "#fff"], "Orange Money": ["#FF7900", "#111"], Wave: ["#1DC8FF", "#08263a"], "Celtiis Cash": ["#E30613", "#fff"], "Airtel Money": ["#E40000", "#fff"], "Free Money": ["#CD1E25", "#fff"], "M-Pesa": ["#4CAF50", "#fff"] };
export const opShort = (op = "") => ({ "MTN MoMo": "MTN", "Moov Money": "MOOV", "Orange Money": "OM", Wave: "WAVE", "Celtiis Cash": "CELT", "Airtel Money": "AIR", "Free Money": "FREE", "M-Pesa": "MPESA" }[op] || op.slice(0, 4).toUpperCase());
export const waNumber = (p) => (p || "").replace(/[^\d]/g, "").replace(/^00/, "");
export const origin = () => (typeof window !== "undefined" ? window.location.origin : "");
export const publicUrl = (doc) => doc.public_token ? `${origin()}/f/${doc.public_token}` : "";
const dl = (d, lang) => new Date(d).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
// Options d'affichage par document (opts) : pay = moyens de paiement, ref = référence de paiement, link = lien en ligne.
export const docOpts = (doc = {}) => ({ pay: true, ref: true, link: true, ...(doc.opts || {}) });
export const balance = (doc = {}) => Math.max(0, (+doc.total || 0) - (+doc.paid_amount || 0));
export function shareText(doc, profile = {}, lang = profile.doc_lang || "fr") {
  const en = lang === "en"; const o = docOpts(doc); const link = o.link ? publicUrl(doc) : ""; const who = doc.client?.name ? ` ${doc.client.name}` : "";
  const pay = o.pay ? normPay(profile.momo).map((m) => `• ${payLines(m, lang)}`).join("\n") : "";
  const amt = fmt(doc.total, doc.currency, lang); const sig = profile.business_name ? `\n${profile.business_name}` : "";
  const L = [];
  if (doc.kind === "quote") {
    L.push(en ? `Hello${who},\n\nPlease find attached quote ${doc.number} for ${amt}${doc.due_date ? `, valid until ${dl(doc.due_date, lang)}` : ""}.` : `Bonjour${who},\n\nVeuillez trouver ci-joint le devis ${doc.number} d'un montant de ${amt}${doc.due_date ? `, valable jusqu'au ${dl(doc.due_date, lang)}` : ""}.`);
    if (link) L.push(en ? `You can review and accept it online: ${link}` : `Vous pouvez le consulter et l'accepter en ligne : ${link}`);
    L.push(en ? "I remain available for any questions or adjustments." : "Je reste à votre disposition pour toute question ou ajustement.");
  } else if (doc.kind === "receipt") {
    L.push(en ? `Hello${who},\n\nThank you for your payment of ${amt}. Please find attached receipt ${doc.number} as proof of payment.` : `Bonjour${who},\n\nJe vous remercie pour votre règlement de ${amt}. Veuillez trouver ci-joint le reçu ${doc.number}, qui en vaut justificatif.`);
    if (link) L.push(en ? `Online copy: ${link}` : `Copie en ligne : ${link}`);
  } else {
    L.push(en ? `Hello${who},\n\nPlease find attached invoice ${doc.number} for ${amt}${doc.due_date ? `, payable by ${dl(doc.due_date, lang)}` : ""}.` : `Bonjour${who},\n\nVeuillez trouver ci-joint la facture ${doc.number} d'un montant de ${amt}${doc.due_date ? `, payable avant le ${dl(doc.due_date, lang)}` : ""}.`);
    if (link) L.push(en ? `View and download: ${link}` : `Consultable et téléchargeable ici : ${link}`);
    if (pay) L.push(en ? `Payment details:\n${pay}` : `Coordonnées de paiement :\n${pay}`);
    if (o.ref) L.push(en ? `Please quote reference ${doc.number} with your payment.` : `Merci d'indiquer la référence ${doc.number} lors du paiement.`);
    L.push(en ? "Please let me know if you have any questions." : "Je reste à votre disposition pour toute question.");
  }
  L.push((en ? "Kind regards," : "Cordialement,") + sig);
  return L.join("\n\n");
}
export const waLink = (phone, text) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
export const mailLink = (email, subject, text) => `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.replace(/\*/g, ""))}`;
export function daysLate(doc) { if (!doc.due_date || ["paid", "cancelled", "draft"].includes(doc.status) || doc.kind !== "invoice") return 0; return Math.max(0, Math.floor((Date.now() - new Date(doc.due_date + "T23:59:59")) / 864e5)); }
export function effStatus(doc) {
  if (doc.kind === "receipt") return "paid";
  if (doc.status === "paid" || doc.status === "cancelled") return doc.status;
  if (doc.kind === "quote") { if (["accepted", "declined", "invoiced"].includes(doc.status)) return doc.status; if (doc.due_date && doc.status === "sent" && new Date(doc.due_date + "T23:59:59") < new Date()) return "expired"; return doc.status; }
  if (doc.declared_paid_at) return "declared";
  if (doc.status !== "draft" && daysLate(doc) > 0) return "late";
  return doc.status;
}
const ST = { fr: { draft: "Brouillon", sent: "En attente", partial: "Payée en partie", paid: "Payée", late: "En retard", accepted: "Accepté", declined: "Refusé", declared: "Paiement signalé", cancelled: "Annulée", invoiced: "Facturé", expired: "Expiré" }, en: { draft: "Draft", sent: "Awaiting payment", partial: "Partly paid", paid: "Paid", late: "Overdue", accepted: "Accepted", declined: "Declined", declared: "Payment reported", cancelled: "Cancelled", invoiced: "Invoiced", expired: "Expired" } };
const QS = { fr: { sent: "Envoyé", draft: "Brouillon", cancelled: "Annulé" }, en: { sent: "Sent" } };
export const statusName = (s, lang = "fr", kind) => (kind === "quote" && QS[lang === "en" ? "en" : "fr"][s]) || (kind === "receipt" && s === "paid" ? (lang === "en" ? "Issued" : "Émis") : kind === "receipt" && s === "cancelled" && lang !== "en" ? "Annulé" : ST[lang === "en" ? "en" : "fr"][s] || s);
export const STATUS = ST.fr;
export const initials = (n = "") => n.split(/\s+/).filter(w => !/^(m|mme|mr|mrs|dr|la|le|sarl|sa|ltd)\.?$/i.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
export const avColor = () => "transparent";
