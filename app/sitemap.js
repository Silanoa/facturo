import { allPosts } from "../lib/posts";
import { SITE } from "../lib/site";
export default function sitemap() {
  const u = (p) => `${SITE.url}${p}`; const now = new Date("2026-11-02");
  return [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1, alternates: { languages: { fr: u("/"), en: u("/en") } } },
    { url: u("/en"), lastModified: now, changeFrequency: "monthly", priority: 0.7, alternates: { languages: { fr: u("/"), en: u("/en") } } },
    { url: u("/essai"), lastModified: now, priority: 0.9 },
    ...["/outils", "/outils/generateur-facture", "/outils/calcul-tva", "/outils/montant-en-lettres"].map(p => ({ url: u(p), lastModified: now, changeFrequency: "monthly", priority: 0.8 })),
    { url: u("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...allPosts().map(p => ({ url: u(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly", priority: 0.6 })),
  ];
}
