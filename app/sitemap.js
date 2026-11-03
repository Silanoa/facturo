import { allPosts } from "../lib/posts";
import { SITE } from "../lib/site";
export default function sitemap() {
  const u = (p) => `${SITE.url}${p}`; const now = new Date("2026-11-03");
  const pair = (fr, en, priority = 0.8) => [fr, en].map(p => ({ url: u(p), lastModified: now, changeFrequency: "monthly", priority, alternates: { languages: { fr: u(fr), en: u(en), "x-default": u(fr) } } }));
  return [
    ...pair("/", "/en", 1), ...pair("/essai", "/en/invoice-generator", 0.9),
    ...pair("/outils", "/en/tools"), ...pair("/outils/calcul-tva", "/en/tools/vat-calculator"), ...pair("/outils/montant-en-lettres", "/en/tools/amount-in-words"),
    { url: u("/outils/generateur-facture"), lastModified: now, priority: 0.8 },
    ...pair("/blog", "/en/blog", 0.7),
    ...allPosts("fr").map(p => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly", priority: 0.6 })),
    ...allPosts("en").map(p => ({ url: u(`/en/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly", priority: 0.6 })),
  ];
}
