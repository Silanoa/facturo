import { KB } from "./faq";
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
const STOP = new Set("le la les un une des de du et ou a au aux en est je j mon ma mes comment quoi que qui pour sur avec pas ne the a an to of and or is i my how what do does can it in on for with not".split(" "));
// Recherche locale : meilleur score de mots communs entre la question et (question + réponse) de la base.
export function kbMatch(q, lang = "fr") {
  const w = norm(q).split(/\s+/).filter((x) => x.length > 1 && !STOP.has(x));
  let best = null, score = 0;
  for (const [k, a] of KB[lang] || KB.fr) {
    const kk = norm(k), aa = norm(a);
    const s = w.reduce((n, x) => n + (kk.includes(x) ? 3 : 0) + (aa.includes(x) ? 1 : 0), 0);
    if (s > score) { score = s; best = a; }
  }
  return score >= 3 ? best : null;
}
