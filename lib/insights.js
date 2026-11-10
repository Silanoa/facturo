import { fmt, paidOf, balanceOf } from "./money";
import { effStatus, daysLate } from "./share";
// "Insights" clients calculés localement : délai moyen de paiement, encours, meilleurs clients, retards.
export function clientStats(docs) {
  const by = {};
  for (const d of docs) { if (d.kind !== "invoice") continue; const n = (d.client?.name || "Sans nom").trim(); const c = (by[n] ||= { name: n, phone: d.client?.phone, billed: 0, paid: 0, open: 0, late: 0, delays: [], count: 0, last: d.issue_date, currency: d.currency });
    c.count++; c.billed += +d.total || 0; if (d.status !== "draft" && d.status !== "cancelled") c.paid += paidOf(d); if (d.status === "paid") { if (d.paid_at && d.issue_date) c.delays.push(Math.max(0, (new Date(d.paid_at) - new Date(d.issue_date)) / 864e5)); }
    else if (d.status !== "draft" && d.status !== "cancelled") { c.open += balanceOf(d); if (daysLate(d) > 0) c.late++; }
    if (d.issue_date > c.last) c.last = d.issue_date; if (!c.phone && d.client?.phone) c.phone = d.client.phone; }
  return Object.values(by).map(c => ({ ...c, avgDays: c.delays.length ? Math.round(c.delays.reduce((a, b) => a + b, 0) / c.delays.length) : null }));
}
export function insights(docs, currency = "XOF", lang = "fr") {
  const en = lang === "en";
  const st = clientStats(docs); const out = [];
  const inv = docs.filter(d => d.kind === "invoice"); const paid = inv.filter(d => d.status === "paid" && d.paid_at);
  if (paid.length >= 2) { const a = Math.round(paid.reduce((s, d) => s + (new Date(d.paid_at) - new Date(d.issue_date)) / 864e5, 0) / paid.length); out.push({ k: "delay", t: en ? `Clients pay you in ${a} day${a > 1 ? "s" : ""} on average.` : `Vos clients paient en ${a} jour${a > 1 ? "s" : ""} en moyenne.`, s: a > 15 ? (en ? "For larger jobs, a deposit on order means part of the money comes in before you start." : "Pour les gros montants, un acompte à la commande vous fait encaisser une partie avant de commencer.") : (en ? "Good pace. Keep sending the payment link on delivery." : "C'est un bon rythme. Continuez à envoyer le lien de paiement dès la livraison.") }); }
  const top = [...st].sort((a, b) => b.billed - a.billed)[0]; const tot = st.reduce((s, c) => s + c.billed, 0);
  if (top && tot && st.length >= 2) { const pc = Math.round(top.billed / tot * 100); out.push({ k: "top", t: en ? `${top.name} is ${pc}% of your revenue.` : `${top.name} représente ${pc} % de votre chiffre.`, s: pc > 50 ? (en ? "Watch the dependency: one slow payer can block your cash flow." : "Attention à la dépendance : un seul client qui tarde à payer peut bloquer votre trésorerie.") : `${fmt(top.billed, top.currency, lang)} — ${top.count} ${en ? "invoice" : "facture"}${top.count > 1 ? "s" : ""}.` }); }
  const slow = st.filter(c => c.late > 0).sort((a, b) => b.open - a.open)[0];
  if (slow) out.push({ k: "late", t: en ? `${slow.name} owes you ${fmt(slow.open, slow.currency, lang)}.` : `${slow.name} vous doit ${fmt(slow.open, slow.currency, lang)}.`, s: en ? `${slow.late} overdue. The invoice's “Remind on WhatsApp” button prepares a polite message with the link.` : `${slow.late} facture${slow.late > 1 ? "s" : ""} en retard. Le bouton « Relancer sur WhatsApp » de la facture prépare un message poli avec le lien.` });
  const quotes = docs.filter(d => d.kind === "quote" && d.status === "sent"); if (quotes.length) out.push({ k: "quote", t: en ? `${quotes.length} quote${quotes.length > 1 ? "s" : ""} awaiting an answer.` : `${quotes.length} devis en attente de réponse.`, s: en ? "A short follow-up with the link lets the client accept it online." : "Une courte relance avec le lien permet au client de l'accepter en ligne." });
  return out;
}
