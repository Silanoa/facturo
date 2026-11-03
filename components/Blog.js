import Link from "next/link";
import { SiteNav, SiteFooter } from "./Brand";
import { allPosts, getPost } from "../lib/posts";
import { SITE } from "../lib/site";
const T = { fr: { base: "/blog", g: "Guides", h: "Facturer juste, se faire payer vite.", min: "min de lecture", upd: "Mis à jour le", toc: "Dans ce guide", more: "À lire aussi", cta: "Faites votre facture en 40 secondes.", cs: "Mentions légales de votre pays, TVA, montant en lettres, Mobile Money, IBAN, PayPal. Sans compte.", go: "Faire une facture →", try: "/essai", loc: "fr-FR" },
  en: { base: "/en/blog", g: "Guides", h: "Invoice right. Get paid fast.", min: "min read", upd: "Updated", toc: "In this guide", more: "Read next", cta: "Make your invoice in 40 seconds.", cs: "Your country's legal lines, VAT, Mobile Money, IBAN, PayPal or Stripe link. No sign-up.", go: "Make an invoice →", try: "/en/invoice-generator", loc: "en-GB" } };
const d = (x, l) => new Date(x).toLocaleDateString(T[l].loc, { day: "numeric", month: "long", year: "numeric" });
export function BlogIndex({ lang = "fr" }) { const t = T[lang]; const posts = allPosts(lang); const [first, ...rest] = posts;
  return (<><SiteNav lang={lang} /><main className="wrap sec" style={{ paddingTop: 40 }}>
    <p className="u">§ {t.g}</p><h1 style={{ fontSize: "clamp(44px,7vw,104px)", maxWidth: 1000, margin: "12px 0 40px" }}>{t.h}</h1>
    {first && <Link href={`${t.base}/${first.slug}`} className="feat" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 40, textDecoration: "none", borderTop: "1.5px solid var(--ink)", padding: "28px 0 40px" }}>
      <div><span className="pill">{first.tag}</span><h2 style={{ fontSize: "clamp(30px,4vw,52px)", margin: "16px 0 0" }}>{first.title}</h2></div>
      <div><p style={{ fontSize: 19, color: "var(--ink-2)", marginTop: 0 }}>{first.description}</p><span className="mute mono" style={{ fontSize: 13 }}>{d(first.date, lang)} · {first.read} {t.min}</span></div></Link>}
    <div className="cards">{rest.map(p => <Link key={p.slug} href={`${t.base}/${p.slug}`}><span className="u" style={{ color: "var(--carbon)" }}>{p.tag}</span><h3>{p.title}</h3><p className="mute" style={{ margin: "0 0 10px", fontSize: 15 }}>{p.description}</p><span className="mute mono" style={{ fontSize: 12.5 }}>{p.read} {t.min}</span></Link>)}</div>
    <style>{`@media(max-width:900px){.feat{grid-template-columns:minmax(0,1fr)!important;gap:10px!important}}`}</style>
  </main><SiteFooter lang={lang} /></>); }
export function postMeta(slug, lang) { const p = getPost(slug, lang); if (!p) return {}; const t = T[lang];
  return { title: p.title, description: p.description, alternates: { canonical: `${t.base}/${p.slug}` }, openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, url: `${t.base}/${p.slug}` } }; }
export function BlogPost({ slug, lang = "fr" }) { const t = T[lang]; const p = getPost(slug, lang); if (!p) return null; const more = allPosts(lang).filter(x => x.slug !== p.slug).slice(0, 3);
  const ld = [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, inLanguage: lang, author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } }, mainEntityOfPage: `${SITE.url}${t.base}/${p.slug}` },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: t.g, item: `${SITE.url}${t.base}` }, { "@type": "ListItem", position: 2, name: p.title, item: `${SITE.url}${t.base}/${p.slug}` }] }];
  return (<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><SiteNav lang={lang} />
    <main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
      <p className="u"><Link href={t.base} style={{ textDecoration: "none" }}>{t.g}</Link> / {p.tag}</p>
      <h1 style={{ fontSize: "clamp(36px,5.5vw,72px)", maxWidth: 980, margin: "14px 0 18px" }}>{p.title}</h1>
      <p className="mute mono" style={{ marginBottom: 40, fontSize: 13 }}>{t.upd} {d(p.date, lang)} · {p.read} {t.min}</p>
      <div className="art" style={{ display: "grid", gridTemplateColumns: "minmax(0,720px) minmax(0,1fr)", gap: 60, alignItems: "start" }}>
        <article className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        <aside style={{ position: "sticky", top: 24 }} className="art-side">
          {p.toc.length > 1 && <div style={{ marginBottom: 26 }}><div className="u" style={{ marginBottom: 10 }}>{t.toc}</div>{p.toc.map(x => <div key={x} style={{ fontSize: 14.5, padding: "6px 0", borderTop: "1px solid var(--line)" }}>{x}</div>)}</div>}
          <div style={{ background: "var(--carbon)", color: "#fff", padding: 22 }}><b style={{ fontSize: 26, fontFamily: "var(--f-display)", textTransform: "uppercase", fontStretch: "62%", lineHeight: 1 }}>{t.cta}</b><p style={{ color: "#D5D9FF", fontSize: 14.5 }}>{t.cs}</p><Link href={t.try} className="b inv full">{t.go}</Link></div></aside></div>
      {more.length > 0 && <section style={{ marginTop: 70 }}><p className="u">{t.more}</p><div className="cards" style={{ marginTop: 14 }}>{more.map(x => <Link key={x.slug} href={`${t.base}/${x.slug}`}><span className="u" style={{ color: "var(--carbon)" }}>{x.tag}</span><h3>{x.title}</h3></Link>)}</div></section>}
    </main><SiteFooter lang={lang} />
    <style>{`@media(max-width:1000px){.art{grid-template-columns:minmax(0,1fr)!important}.art-side{position:static!important}}`}</style></>);
}
