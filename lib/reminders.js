import { fmt } from "./money";
import { normPay, payLines } from "./pay";
export const TONES = { douce: ["Cordiale", "Friendly"], ferme: ["Ferme", "Firm"], finale: ["Dernier rappel", "Final notice"] };
export function reminder(doc, profile = {}, tone = "douce", link = "", lang = profile.doc_lang || "fr") {
  const en = lang === "en"; const who = doc.client?.name || ""; const amt = fmt(doc.total, doc.currency, lang);
  const d = (x) => new Date(x).toLocaleDateString(en ? "en-GB" : "fr-FR", { day: "numeric", month: "long" });
  const late = doc.due_date && new Date(doc.due_date) < new Date();
  const p = normPay(profile.momo).map((m) => `• ${payLines(m, lang)}`).join("\n");
  const pay = [p && (en ? `\nYou can pay by:\n${p}` : `\nVous pouvez régler par :\n${p}`), link && (en ? `\nOr right here: ${link}` : `\nOu directement ici : ${link}`)].filter(Boolean).join("\n");
  const sig = profile.business_name ? `\n\n${profile.business_name}` : "";
  if (en) {
    if (tone === "ferme") return `Hello ${who},\n\nUnless I'm mistaken, invoice ${doc.number} for *${amt}*${doc.due_date ? ` (due ${d(doc.due_date)})` : ""} is still unpaid.\nPlease settle it within 48 hours, or let me know if something is blocking.${pay}${sig}`;
    if (tone === "finale") return `Hello ${who},\n\nDespite previous reminders, invoice ${doc.number} for *${amt}* remains unpaid${doc.due_date ? ` since ${d(doc.due_date)}` : ""}.\nWithout payment within 5 days I will have to pause work and start recovery. I'd much rather find a solution together — a payment plan is possible.${pay}${sig}`;
    return `Hello ${who},\n\nHope you're well. A friendly reminder about invoice ${doc.number} for *${amt}*${doc.due_date ? (late ? `, which was due ${d(doc.due_date)}` : `, due ${d(doc.due_date)}`) : ""}.${pay}\n\nThanks a lot!${sig}`;
  }
  if (tone === "ferme") return `Bonjour ${who},\n\nSauf erreur de notre part, la facture ${doc.number} de *${amt}*${doc.due_date ? ` arrivée à échéance le ${d(doc.due_date)}` : ""} n'est pas encore réglée.\nMerci de procéder au paiement dans les 48 heures, ou de me dire si quelque chose bloque.${pay}${sig}`;
  if (tone === "finale") return `Bonjour ${who},\n\nMalgré nos précédents messages, la facture ${doc.number} de *${amt}* reste impayée${doc.due_date ? ` depuis le ${d(doc.due_date)}` : ""}.\nSans règlement d'ici 5 jours, nous serons contraints de suspendre nos prestations et d'engager une procédure de recouvrement. Un paiement en plusieurs fois est possible.${pay}${sig}`;
  return `Bonjour ${who},\n\nJ'espère que vous allez bien. Petit rappel amical concernant la facture ${doc.number} de *${amt}*${doc.due_date ? (late ? `, prévue pour le ${d(doc.due_date)}` : `, à régler avant le ${d(doc.due_date)}`) : ""}.${pay}\n\nMerci beaucoup !${sig}`;
}
