import { limited, tooMany } from "../../../../lib/ratelimit";
import { NextResponse } from "next/server";
import { parseDraft } from "../../../../lib/parse";
import { llm, hasLLM } from "../../../../lib/llm";
const SYS = `Tu transformes la description d'une vente (français, anglais, pidgin, wolof ou fon mélangés possibles) en brouillon de facture JSON.
Réponds UNIQUEMENT en JSON: {"kind":"invoice|quote|receipt","client":{"name":"","phone":""},"items":[{"label":"","qty":1,"price":0}],"currency":"XOF|XAF|NGN|GHS|EUR|USD|MAD|KES|null","tax_rate":number|null,"due_days":number|null}
Règles: prix unitaire en nombre (45 000 -> 45000, 9k -> 9000). Ne pas inventer de lignes. Libellés courts avec majuscule.`;
export async function POST(req) {
  if (limited(req, "ai", 15)) return tooMany();
  const { text } = await req.json().catch(() => ({})); if (!text || text.length > 2000) return NextResponse.json({ error: "Texte vide ou trop long." }, { status: 400 });
  const local = parseDraft(text);
  if (hasLLM()) {
    try { const j = JSON.parse((await llm(SYS, text, true)).replace(/^```json|```$/g, ""));
      if (Array.isArray(j.items) && j.items.length) return NextResponse.json({ ...local, ...Object.fromEntries(Object.entries(j).filter(([, v]) => v !== null && v !== "")), client: { ...local.client, ...(j.client || {}) }, engine: "ai" });
    } catch {}
  }
  return NextResponse.json({ ...local, engine: "local" });
}
