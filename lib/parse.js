// Analyse locale (sans IA payante) d'une description libre → brouillon de facture.
// Ex. : "Facture pour Mme Ebuka : 2 sacs de riz à 45 000, livraison 5000, TVA 18%"
const NUMW = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, douze: 12, quinze: 15, vingt: 20, trente: 30, cent: 100, one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10 };
function money(s) {
  if (!s) return NaN; s = s.toLowerCase().replace(/\s|\u202f|\u00a0/g, "");
  let m = s.match(/^([\d.,]+)(k|mille|m|millions?|mil)?/); if (!m) return NaN;
  let n = m[1]; if (/^\d{1,3}([.,]\d{3})+$/.test(n)) n = n.replace(/[.,]/g, ""); else n = n.replace(",", ".");
  let v = parseFloat(n); const suf = m[2] || "";
  if (suf === "k" || suf === "mille" || suf === "mil") v *= 1000; else if (suf.startsWith("m")) v *= 1e6; return v;
}
export function detectCurrency(t) {
  t = t.toLowerCase();
  if (/naira|₦|\bngn\b/.test(t)) return "NGN"; if (/cedi|gh₵|\bghs\b/.test(t)) return "GHS"; if (/€|euro|\beur\b/.test(t)) return "EUR";
  if (/£|\bgbp\b|pound/.test(t)) return "GBP"; if (/\bcad\b|c\$/.test(t)) return "CAD"; if (/\brand\b|\bzar\b/.test(t)) return "ZAR"; if (/\bchf\b/.test(t)) return "CHF";
  if (/\$|dollar|\busd\b/.test(t)) return "USD"; if (/\bxaf\b|cameroun|gabon|douala|yaound/.test(t)) return "XAF"; if (/dirham|\bmad\b/.test(t)) return "MAD"; if (/shilling|\bkes\b|ksh/.test(t)) return "KES";
  return null;
}
export function parseDraft(text) {
  const raw = (text || "").trim(); const out = { client: {}, items: [] }; if (!raw) return out;
  const cur = detectCurrency(raw); if (cur) out.currency = cur;
  const tva = raw.match(/(?:tva|vat|tax)\s*(?:de\s*)?(\d+(?:[.,]\d+)?)\s*%/i) || raw.match(/(\d+(?:[.,]\d+)?)\s*%\s*(?:de\s*)?(?:tva|vat|tax)/i); if (tva) out.tax_rate = parseFloat(tva[1].replace(",", "."));
  if (/sans\s+tva|hors\s+tva|pas\s+de\s+tva|no\s+vat|non\s+assujetti/i.test(raw)) out.tax_rate = 0;
  if (/\bdevis\b|\bquote\b|\bproforma\b/i.test(raw)) out.kind = "quote"; else if (/\breçu\b|\brecu\b|\breceipt\b|a pay[ée]|déjà payé/i.test(raw)) out.kind = "receipt";
  const cl = raw.match(/(?:pour|à l'attention de|client\s*:?|for|to)\s+((?:m(?:me|lle|r|\.)?\.?\s+|madame\s+|monsieur\s+|dr\.?\s+|la\s+société\s+|l'entreprise\s+|la\s+|le\s+)?[A-ZÀ-Ý][\wÀ-ÿ'’.-]*(?:\s+(?:[A-ZÀ-Ý][\wÀ-ÿ'’.-]*|SARL|SA|SAS|&|et|de|du))*)/);
  if (cl) out.client.name = cl[1].replace(/\s+(et|de|du)$/i, "").replace(/^(la société|l'entreprise|la|le)\s+/i, "").trim();
  const ph = raw.match(/(\+?\d[\d\s]{7,16}\d)/); if (ph && ph[1].replace(/\D/g, "").length >= 8 && !/\d{3}\s?000/.test(ph[1])) out.client.phone = ph[1].trim();
  const due = raw.match(/(?:sous|dans|à)\s+(\d+)\s+jours/i) || raw.match(/within\s+(\d+)\s+days/i); if (due) out.due_days = +due[1];
  let body = raw.replace(/tva[^,;\n]*%/ig, "").replace(/(sans|hors|pas de)\s+tva|no vat|non assujetti/ig, "").replace(/(payable\s+)?(sous|dans|within)\s+\d+\s+(jours|days)/ig, "").replace(cl ? cl[0] : "§§", "");
  if (ph) body = body.replace(ph[1], "");
  const parts = body.split(/[\n;+]|,(?!\d{3})|\bet\b|\band\b|\bplus\b/i).map(s => s.replace(/^[\s:–-]+/, "")).map(s => s.trim()).filter(Boolean);
  const AMT = "([\\d][\\d\\s.,]*(?:k|mille|m|millions?)?)";
  for (let p of parts) {
    p = p.replace(/^(facture|devis|reçu|recu|invoice|quote)\s*(?:de|pour|:)?\s*/i, "").replace(/\b(fcfa|cfa|f\s?cfa|francs?|xof|xaf|ngn|naira|cedis?|ghs|euros?|€|\$|usd|dollars?|£|gbp|cad|zar|chf|kes)\b/ig, "").trim();
    if (!p) continue;
    let m = p.match(new RegExp(`^(\\d+(?:[.,]\\d+)?|${Object.keys(NUMW).join("|")})\\s*(?:x\\s*)?(.+?)\\s+(?:à|a|at|@|de|pour|chacun[e]?\\s+à|par|x)\\s*${AMT}\\s*(?:l'unité|chacun[e]?|each|pièce|piece|\\/u)?\\s*$`, "i"));
    if (m) { const q = NUMW[m[1].toLowerCase()] || parseFloat(m[1].replace(",", ".")); out.items.push({ label: cap(m[2]), qty: q, price: money(m[3]) }); continue; }
    m = p.match(new RegExp(`^(.+?)\\s*(?::|=|à|a|pour|de|at|-)?\\s*${AMT}\\s*$`, "i"));
    if (m && !isNaN(money(m[2])) && money(m[2]) > 0) { const lbl = m[1].replace(/\s+(à|a|de|pour|at)$/i, "");
      const q = lbl.match(/^(\d+)\s+(.+)/); if (q && +q[1] < 1000) out.items.push({ label: cap(q[2]), qty: +q[1], price: money(m[2]) / 1 });
      else out.items.push({ label: cap(lbl), qty: 1, price: money(m[2]) }); }
  }
  out.items = out.items.filter(i => i.label && i.label.length > 1 && i.price > 0);
  return out;
}
const cap = (s) => { s = s.trim().replace(/^(de|des|du|d')\s*/i, ""); return s.charAt(0).toUpperCase() + s.slice(1); };
