import { KB } from "../../../lib/faq";
import { kbMatch } from "../../../lib/kb";
import { hasLLM, llm } from "../../../lib/llm";
export async function POST(req) {
  let q = "", lang = "fr";
  try { ({ q = "", lang = "fr" } = await req.json()); } catch {}
  q = String(q).slice(0, 600); lang = lang === "en" ? "en" : "fr";
  if (!q.trim()) return Response.json({ a: null });
  const local = kbMatch(q, lang);
  if (hasLLM()) {
    try {
      const kb = (KB[lang]).map(([k, a]) => `- ${k}: ${a}`).join("\n");
      const sys = `You are Bonova's support assistant. Bonova is a free invoicing web app for freelancers (invoices, quotes, receipts; PDF; WhatsApp/email; Mobile Money, bank, PayPal payment details; Pro plan 2,500 FCFA/month). Answer in ${lang === "en" ? "English" : "French"}, in 1-3 short sentences, plainly, using ONLY the facts below. If the answer is not covered, reply exactly: HUMAN.\n${kb}`;
      const a = (await llm(sys, q)).trim();
      if (a && !/^HUMAN/.test(a)) return Response.json({ a, src: "llm" });
      return Response.json({ a: null });
    } catch {}
  }
  return Response.json({ a: local, src: "kb" });
}
