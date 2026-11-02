import { fmt, KINDS } from "./money";
export const OP_COLORS = { "MTN MoMo": ["#FFCB05", "#1a1a1a"], "Moov Money": ["#0065B3", "#fff"], "Orange Money": ["#FF7900", "#fff"], Wave: ["#1DC8FF", "#08263a"], "Celtiis Cash": ["#E30613", "#fff"], "Airtel Money": ["#E40000", "#fff"], "Free Money": ["#CD1E25", "#fff"], "M-Pesa": ["#4CAF50", "#fff"] };
export const opShort = (op) => ({ "MTN MoMo": "MTN", "Moov Money": "MOOV", "Orange Money": "OM", Wave: "WAVE", "Celtiis Cash": "CELT", "Airtel Money": "AIR", "Free Money": "FREE", "M-Pesa": "MPESA" }[op] || op.slice(0, 4).toUpperCase());
export const waNumber = (p) => (p || "").replace(/[^\d]/g, "").replace(/^00/, "");
export const origin = () => (typeof window !== "undefined" ? window.location.origin : "");
export const publicUrl = (doc) => doc.public_token ? `${origin()}/f/${doc.public_token}` : "";
export function shareText(doc, profile = {}) {
  const k = KINDS[doc.kind]?.fr || "Facture"; const link = publicUrl(doc);
  const momo = (profile.momo || []).filter(m => m.number).map(m => `• ${m.op} : ${m.number}`).join("\n");
  const head = `Bonjour ${doc.client?.name || ""},\n\nVoici ${doc.kind === "quote" ? "votre devis" : doc.kind === "receipt" ? "votre reçu" : "votre facture"} ${doc.number} : *${fmt(doc.total, doc.currency)}*`;
  return [head + (doc.due_date && doc.kind === "invoice" ? `, à régler avant le ${new Date(doc.due_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}.` : "."),
    link && `\nVoir et télécharger : ${link}`, doc.kind === "invoice" && momo && `\nPaiement Mobile Money :\n${momo}\nRéférence : ${doc.number}`, `\nMerci !${profile.business_name ? `\n${profile.business_name}` : ""}`].filter(Boolean).join("\n");
}
export const waLink = (phone, text) => `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(text)}`;
export function daysLate(doc) { if (!doc.due_date || doc.status === "paid") return 0; return Math.max(0, Math.floor((Date.now() - new Date(doc.due_date)) / 864e5)); }
export function effStatus(doc) { if (doc.status === "paid") return "paid"; if (doc.declared_paid_at) return "declared"; if (doc.kind === "invoice" && doc.status !== "draft" && daysLate(doc) > 0) return "late"; return doc.status; }
export const STATUS = { draft: "Brouillon", sent: "Envoyée", paid: "Payée", late: "En retard", accepted: "Accepté", declined: "Refusé", declared: "Paiement signalé" };
export const initials = (n = "") => n.split(/\s+/).filter(w => !/^(m|mme|mr|dr|la|le|sarl|sa)\.?$/i.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const AVC = ["#F6DED5", "#DEE3F0", "#F7EACB", "#DDEBDF", "#EAE4D7"];
export const avColor = (n = "") => AVC[[...n].reduce((a, c) => a + c.charCodeAt(0), 0) % AVC.length];
