import { fmt } from "./money";
const d = (x) => new Date(x).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
export const TONES = { douce: "Cordiale", ferme: "Ferme", finale: "Dernier rappel" };
export function reminder(doc, profile = {}, tone = "douce", link = "") {
  const who = (doc.client?.name || "").split(" ")[0] ? doc.client.name : "";
  const amt = fmt(doc.total, doc.currency); const late = doc.due_date && new Date(doc.due_date) < new Date();
  const momo = (profile.momo || []).filter(m => m.number).map(m => `• ${m.op} : ${m.number}`).join("\n");
  const pay = [momo && `\nVous pouvez régler par :\n${momo}`, link && `\nOu directement ici : ${link}`].filter(Boolean).join("\n");
  const sig = profile.business_name ? `\n\n${profile.business_name}` : "";
  if (tone === "ferme") return `Bonjour ${who},\n\nSauf erreur de notre part, la facture ${doc.number} de *${amt}*${doc.due_date ? ` arrivée à échéance le ${d(doc.due_date)}` : ""} n'est pas encore réglée.\nMerci de procéder au paiement dans les 48 heures, ou de me dire si quelque chose bloque.${pay}${sig}`;
  if (tone === "finale") return `Bonjour ${who},\n\nMalgré nos précédents messages, la facture ${doc.number} de *${amt}* reste impayée${doc.due_date ? ` depuis le ${d(doc.due_date)}` : ""}.\nSans règlement d'ici 5 jours, nous serons contraints de suspendre nos prestations et d'engager une procédure de recouvrement. Nous préférons évidemment trouver une solution ensemble : un paiement en plusieurs fois est possible.${pay}${sig}`;
  return `Bonjour ${who},\n\nJ'espère que vous allez bien. Petit rappel amical concernant la facture ${doc.number} de *${amt}*${doc.due_date ? (late ? `, prévue pour le ${d(doc.due_date)}` : `, à régler avant le ${d(doc.due_date)}`) : ""}.${pay}\n\nMerci beaucoup !${sig}`;
}
