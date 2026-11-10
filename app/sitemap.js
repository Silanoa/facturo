import { allPosts } from "../lib/posts";
import { SITE } from "../lib/site";
export default function sitemap() {
  const u = (p) => `${SITE.url}${p === "/" ? "" : p}`; const D = (x) => new Date(x);
  const pair = (fr, en, priority = 0.8, date = "2026-11-04") => [fr, en].map(p => ({ url: u(p), lastModified: D(date), changeFrequency: "monthly", priority, alternates: { languages: { fr: u(fr), en: u(en), "x-default": u(fr) } } }));
  const NEW = "2026-11-10";
  return [
    ...pair("/", "/en", 1, NEW), ...pair("/outils/generateur-facture", "/en/invoice-generator", 0.9, NEW), ...pair("/a-propos", "/en/about", 0.7), ...pair("/exemple", "/en/example", 0.6),
    ...pair("/outils", "/en/tools"), ...pair("/outils/calcul-tva", "/en/tools/vat-calculator", 0.8, NEW), ...pair("/outils/montant-en-lettres", "/en/tools/amount-in-words", 0.9, NEW),
    ...["/logiciel-de-facturation", "/modele-de-facture", "/facture-senegal", "/facture-cote-divoire", "/facture-benin"].map((p) => ({ url: u(p), lastModified: D("2026-11-04"), changeFrequency: "monthly", priority: 0.8 })),
    ...pair("/blog", "/en/blog", 0.7, NEW), ...pair("/confidentialite", "/en/privacy", 0.3, NEW), ...pair("/conditions", "/en/terms", 0.3, NEW),
    ...allPosts("fr").map(p => ({ url: u(`/blog/${p.slug}`), lastModified: D(p.updated || p.date), changeFrequency: "monthly", priority: 0.6 })),
    ...allPosts("en").map(p => ({ url: u(`/en/blog/${p.slug}`), lastModified: D(p.updated || p.date), changeFrequency: "monthly", priority: 0.6 })),
  ];
}
