import Link from "next/link";
import { SiteNav, SiteFooter } from "./Brand";
import Trial from "./Trial";
import { LangProvider } from "../lib/i18n";
import { SITE } from "../lib/site";
// Pages d'atterrissage FR : contenu réel (mentions, TVA, étapes) + générateur utilisable directement.
export default function SeoLanding({ path, crumb, h1, lead, sections = [], faq = [], related = [], tool = true }) {
  const ld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Bonova", item: SITE.url + "/" }, { "@type": "ListItem", position: 2, name: crumb, item: SITE.url + path }] },
    faq.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) } : null,
  ].filter(Boolean);
  return (<><SiteNav lang="fr" /><main className="wrap seo" style={{ paddingTop: 30, paddingBottom: 120 }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    <p className="u np"><Link href="/">Bonova</Link> / {crumb}</p>
    <h1 className="np" style={{ fontSize: "clamp(40px,6vw,84px)", margin: "10px 0 14px" }}>{h1}</h1>
    <p className="mute np" style={{ fontSize: 18, maxWidth: 720, marginBottom: 24 }}>{lead}</p>
    {tool ? <LangProvider initial="fr"><Trial heading={false} /></LangProvider> : <p><Link href="/essai" className="b k">Créer une facture gratuitement</Link></p>}
    <div className="prose np" style={{ marginTop: 56, maxWidth: 760 }}>
      {sections.map(([h, body]) => <section key={h}><h2>{h}</h2>{body}</section>)}
      {faq.length > 0 && <section><h2>Questions fréquentes</h2>{faq.map(([q, a]) => <details key={q} className="seo-q"><summary>{q}</summary><p>{a}</p></details>)}</section>}
      {related.length > 0 && <p className="mute">Voir aussi : {related.map(([h, t], i) => <span key={h}>{i ? " · " : ""}<Link href={h}>{t}</Link></span>)}</p>}
    </div></main><SiteFooter lang="fr" /></>);
}
