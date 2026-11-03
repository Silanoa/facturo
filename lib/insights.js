import { fmt } from "./money";
import { effStatus, daysLate } from "./share";
// "Insights" clients calculés localement : délai moyen de paiement, encours, meilleurs clients, retards.
export function clientStats(docs) {
  const by = {};
  for (const d of docs) { if (d.kind !== "invoice") continue; const n = (d.client?.name || "Sans nom").trim(); const c = (by[n] ||= { name: n, phone: d.client?.phone, billed: 0, paid: 0, open: 0, late: 0, delays: [], count: 0, last: d.issue_date, currency: d.currency });
    c.count++; c.billed += +d.total || 0; if (d.status === "paid") { c.paid += +d.total || 0; if (d.paid_at && d.issue_date) c.delays.push(Math.max(0, (new Date(d.paid_at) - new Date(d.issue_date)) / 864e5)); }
    else if (d.status !== "draft") { c.open += +d.total || 0; if (daysLate(d) > 0) c.late++; }
    if (d.issue_date > c.last) c.last = d.issue_date; if (!c.phone && d.client?.phone) c.phone = d.client.phone; }
  return Object.values(by).map(c => ({ ...c, avgDays: c.delays.length ? Math.round(c.delays.reduce((a, b) => a + b, 0) / c.delays.length) : null }));
}
export function insights(docs, currency = "XOF", lang = "fr") {
  const en = lang === "en";
  const st = clientStats(docs); const out = [];
  const inv = docs.filter(d => d.kind === "invoice"); const paid = inv.filter(d => d.status === "paid" && d.paid_at);
  if (paid.length >= 2) { const a = Math.round(paid.reduce((s, d) => s + (new Date(d.paid_at) - new Date(d.issue_date)) / 864e5, 0) / paid.length); out.push({ k: "delay", t: en ? `Clients pay you in ${a} day${a > 1 ? "s" : ""} on average.` : `Vos clients paient en ${a} jour${a > 1 ? "s" : ""} en moyenne.`, s: a > 15 ? (en ? "Asking for a 30–50% deposit upfront cuts this sharply." : "Demander un acompte de 30 à 50 % à la commande réduit fortement ce délai.") : (en ? "Good pace. Keep sending the payment link on delivery." : "C'est un bon rythme. Continuez à envoyer le lien de paiement dès la livraison.") }); }
  const top = [...st].sort((a, b) => b.billed - a.billed)[0]; const tot = st.reduce((s, c) => s + c.billed, 0);
  if (top && tot && st.length >= 2) { const pc = Math.round(top.billed / tot * 100); out.push({ k: "top", t: en ? `${top.name} is ${pc}% of your revenue.` : `${top.name} représente ${pc} % de votre chiffre.`, s: pc > 50 ? (en ? "Watch the dependency: one slow payer can block your cash flow." : "Attention à la dépendance : un seul client qui tarde à payer peut bloquer votre trésorerie.") : `${fmt(top.billed, top.currency, lang)} — ${top.count} ${en ? "invoice" : "facture"}${top.count > 1 ? "s" : ""}.` }); }
  const slow = st.filter(c => c.late > 0).sort((a, b) => b.open - a.open)[0];
  if (slow) out.push({ k: "late", t: en ? `${slow.name} owes you ${fmt(slow.open, slow.currency, lang)}.` : `${slow.name} vous doit ${fmt(slow.open, slow.currency)}.`, s: en ? `${slow.late} overdue. A polite reminder on the due date doubles the odds of being paid that week.` : `${slow.late} facture${slow.late > 1 ? "s" : ""} en retard. Une relance WhatsApp polie le jour même de l'échéance double les chances d'être payé dans la semaine.` });
  const quotes = docs.filter(d => d.kind === "quote" && d.status === "sent"); if (quotes.length) out.push({ k: "quote", t: en ? `${quotes.length} quote${quotes.length > 1 ? "s" : ""} awaiting an answer.` : `${quotes.length} devis en attente de réponse.`, s: en ? "A quote followed up within 3 days is far more likely to be accepted." : "Un devis relancé sous 3 jours a bien plus de chances d'être accepté." });
  return out;
}
