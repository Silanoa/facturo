import { fmt } from "./money";
import { normPay, payLines } from "./pay";
import { docOpts, balance, publicUrl } from "./share";
// Trois niveaux, ton professionnel : rappel courtois, relance ferme, dernier rappel avant recouvrement.
export const TONES = { douce: ["Rappel courtois", "Polite reminder"], ferme: ["Relance", "Follow-up"], finale: ["Dernier rappel", "Final notice"] };
export function reminder(doc, profile = {}, tone = "douce", link = publicUrl(doc), lang = profile.doc_lang || "fr") {
  const en = lang === "en"; const o = docOpts(doc); const who = doc.client?.name ? ` ${doc.client.name}` : "";
  const d = (x) => new Date(x).toLocaleDateString(en ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const rest = balance(doc); const partial = +doc.paid_amount > 0;
  const amt = fmt(rest, doc.currency, lang); const tot = fmt(doc.total, doc.currency, lang);
  const late = doc.due_date && new Date(doc.due_date + "T23:59:59") < new Date();
  const days = late ? Math.floor((Date.now() - new Date(doc.due_date + "T23:59:59")) / 864e5) : 0;
  const what = partial ? (en ? `the remaining balance of ${amt} on invoice ${doc.number} (total ${tot})` : `le solde de ${amt} restant dû sur la facture ${doc.number} (montant total ${tot})`) : (en ? `invoice ${doc.number} for ${amt}` : `la facture ${doc.number} d'un montant de ${amt}`);
  const pay = o.pay ? normPay(profile.momo).map((m) => `• ${payLines(m, lang)}`).join("\n") : "";
  const tail = [link && o.link && (en ? `Invoice online: ${link}` : `Facture en ligne : ${link}`), pay && (en ? `Payment details:\n${pay}` : `Coordonnées de paiement :\n${pay}`), o.ref && (en ? `Reference: ${doc.number}` : `Référence à indiquer : ${doc.number}`)].filter(Boolean).join("\n\n");
  const sig = `${en ? "Kind regards," : "Cordialement,"}${profile.business_name ? `\n${profile.business_name}` : ""}`;
  const already = en ? "If payment has already been made, please disregard this message." : "Si le règlement a déjà été effectué, merci de ne pas tenir compte de ce message.";
  let body;
  if (en) {
    if (tone === "ferme") body = `Unless I am mistaken, ${what}${doc.due_date ? `, due on ${d(doc.due_date)}` : ""}, has not been settled yet.\nI would be grateful if you could arrange payment within 7 days, or let me know the expected payment date.`;
    else if (tone === "finale") body = `Despite my previous reminders, ${what} remains unpaid${doc.due_date ? ` since ${d(doc.due_date)}${days ? ` (${days} days)` : ""}` : ""}.\nWithout payment within 8 days, I will have to apply the late-payment terms and start recovery proceedings. I remain open to agreeing on a payment schedule.`;
    else body = late ? `I am writing about ${what}, which was due on ${d(doc.due_date)}.\nCould you confirm when payment is planned?` : `This is a reminder that ${what}${doc.due_date ? ` is due on ${d(doc.due_date)}` : " is awaiting payment"}.`;
    return `Hello${who},\n\n${body}\n\n${tail ? tail + "\n\n" : ""}${tone === "finale" ? "" : already + "\n\n"}${sig}`;
  }
  if (tone === "ferme") body = `Sauf erreur de ma part, ${what}${doc.due_date ? `, échue le ${d(doc.due_date)}` : ""}, n'a pas encore été réglée.\nJe vous remercie de bien vouloir procéder au règlement sous 7 jours, ou de m'indiquer la date de paiement prévue.`;
  else if (tone === "finale") body = `Malgré mes précédentes relances, ${what} reste impayée${doc.due_date ? ` depuis le ${d(doc.due_date)}${days ? ` (${days} jours)` : ""}` : ""}.\nÀ défaut de règlement sous 8 jours, je serai contraint d'appliquer les conditions de retard prévues et d'engager une procédure de recouvrement. Je reste ouvert à la mise en place d'un échéancier.`;
  else body = late ? `Je reviens vers vous au sujet de ${what}, arrivée à échéance le ${d(doc.due_date)}.\nPourriez-vous me confirmer la date de règlement prévue ?` : `Je me permets de vous rappeler que ${what}${doc.due_date ? ` arrive à échéance le ${d(doc.due_date)}` : " est en attente de règlement"}.`;
  return `Bonjour${who},\n\n${body}\n\n${tail ? tail + "\n\n" : ""}${tone === "finale" ? "" : already + "\n\n"}${sig}`;
}
export const reminderSubject = (doc, tone, lang = "fr") => lang === "en" ? `${tone === "finale" ? "Final notice" : "Reminder"} — invoice ${doc.number}` : `${tone === "finale" ? "Dernier rappel" : "Rappel"} — facture ${doc.number}`;
