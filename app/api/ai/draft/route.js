import { limited, tooMany } from "../../../../lib/ratelimit";
import { NextResponse } from "next/server";
import { parseDraft } from "../../../../lib/parse";
import { llm, hasLLM } from "../../../../lib/llm";
const SYS = `Tu transformes la description d'une vente (français, anglais, pidgin, wolof ou fon mélangés possibles) en brouillon de facture JSON.
Réponds UNIQUEMENT en JSON: {"kind":"invoice|quote|receipt","client":{"name":"","phone":""},"items":[{"label":"","qty":1,"price":0}],"currency":"XOF|XAF|NGN|GHS|EUR|USD|MAD|KES|null","tax_rate":number|null,"due_days":number|null}
Règles: "price" est le prix UNITAIRE, "qty" la quantité : "40 produits à 6 000" -> qty 40, price 6000 (jamais price 240000). "3 jours de formation à 60 000" -> qty 3, price 60000. Ne divise un montant par la quantité que si le texte dit explicitement "au total", "en tout" ou "pour l'ensemble". Nombres sans espaces (45 000 -> 45000, 9k -> 9000). Ne pas inventer de lignes. Libellés courts avec majuscule.`;
const TOTAL = /au total|en tout|pour l'ensemble|in total|altogether/i;
export async function POST(req) {
  if (await limited(req, "ai", 15)) return tooMany();
  const { text } = await req.json().catch(() => ({})); if (!text || text.length > 2000) return NextResponse.json({ error: "Texte vide ou trop long." }, { status: 400 });
  const local = parseDraft(text);
  if (hasLLM()) {
    try { const j = JSON.parse((await llm(SYS, text, true)).replace(/^```json|```$/g, ""));
      if (Array.isArray(j.items) && j.items.length) {
        // Le modèle ne doit pas inventer ce qui n'a pas été dit : type, devise, TVA, échéance seulement s'ils sont mentionnés.
        const said = { kind: /devis|quote|re[çc]u|receipt|facture|invoice|pay[ée]|paid/i, currency: /fcfa|cfa|xof|xaf|f\b|francs?|€|euros?|\$|dollars?|usd|eur|naira|ngn|cedis?|ghs|dirhams?|mad|dh\b|kes|shillings?/i, tax_rate: /tva|vat|tax|%/i, due_days: /jours?|days?|semaines?|weeks?|mois|months?|[ée]ch[ée]ance|due|sous \d/i };
        const ai = Object.fromEntries(Object.entries(j).filter(([k, v]) => v !== null && v !== "" && (!said[k] || local[k] != null || said[k].test(text))));
        const client = { ...local.client, ...Object.fromEntries(Object.entries(j.client || {}).filter(([, v]) => v)) };
        const items = j.items.filter((i) => i && i.label).map((i) => ({ label: String(i.label).slice(0, 200), qty: +i.qty > 0 ? +i.qty : 1, price: +i.price || 0 }));
        // Garde-fou : si le modèle a mis le total de la ligne à la place du prix unitaire, on reprend l'analyse locale.
        if (local.items.length === items.length) items.forEach((it, n) => { const l = local.items[n]; if (l.qty > 1 && it.qty === l.qty && (it.price === l.price * l.qty || (!TOTAL.test(text) && Math.abs(it.price * l.qty - l.price) < 1))) it.price = l.price; });
        if (items.length) return NextResponse.json({ ...local, ...ai, items, client, engine: "ai" });
      }
    } catch {}
  }
  return NextResponse.json({ ...local, engine: "local" });
}
