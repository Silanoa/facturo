import { NextResponse } from "next/server";
import { llm, hasLLM } from "../../../../lib/llm";
// Reformule une relance pour la rendre personnelle (si une clé IA gratuite est configurée).
export async function POST(req) {
  const { text, context } = await req.json().catch(() => ({})); if (!text) return NextResponse.json({ error: "vide" }, { status: 400 });
  if (!hasLLM()) return NextResponse.json({ text, engine: "template" });
  try { const out = await llm("Tu réécris des messages WhatsApp de relance de paiement pour des petites entreprises africaines. Garde TOUS les montants, numéros, références et liens à l'identique. Ton humain, poli, concis, pas d'emoji excessif. Réponds avec le message seul.", `Contexte: ${context || ""}\n\nMessage:\n${text}`);
    return NextResponse.json({ text: out.trim() || text, engine: "ai" }); } catch { return NextResponse.json({ text, engine: "template" }); }
}
