// IA optionnelle sur offres gratuites : Groq (GROQ_API_KEY) ou Google Gemini (GEMINI_API_KEY).
// Sans clé, l'application utilise l'analyse locale (lib/parse.js) : rien ne casse.
export const hasLLM = () => !!(process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY);
export async function llm(system, user, json = false) {
  if (process.env.GROQ_API_KEY) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: JSON.stringify({ model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", temperature: 0.2, messages: [{ role: "system", content: system }, { role: "user", content: user }], ...(json ? { response_format: { type: "json_object" } } : {}) }) });
    const j = await r.json(); return j.choices?.[0]?.message?.content || "";
  }
  if (process.env.GEMINI_API_KEY) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: "application/json" } : {}) } }) });
    const j = await r.json(); return j.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  return "";
}
