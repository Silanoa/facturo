import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteNav, SiteFooter } from "../../../components/Brand";
import { allPosts, getPost } from "../../../lib/posts";
import { SITE } from "../../../lib/site";
export const dynamicParams = false;
export function generateStaticParams() { return allPosts().map(p => ({ slug: p.slug })); }
export function generateMetadata({ params }) { const p = getPost(params.slug); if (!p) return {};
  return { title: p.title, description: p.description, alternates: { canonical: `/blog/${p.slug}` }, openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, url: `/blog/${p.slug}` } }; }
const d = (x) => new Date(x).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export default function Post({ params }) {
  const p = getPost(params.slug); if (!p) notFound(); const more = allPosts().filter(x => x.slug !== p.slug).slice(0, 3);
  const ld = [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date, inLanguage: "fr", author: { "@type": "Organization", name: "Kola" }, publisher: { "@type": "Organization", name: "Kola", logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } }, mainEntityOfPage: `${SITE.url}/blog/${p.slug}`, image: `${SITE.url}/blog/${p.slug}/opengraph-image` },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Guides", item: `${SITE.url}/blog` }, { "@type": "ListItem", position: 2, name: p.title, item: `${SITE.url}/blog/${p.slug}` }] }];
  return (<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><SiteNav />
    <main className="wrap" style={{ paddingTop: 30, paddingBottom: 60 }}>
      <p className="u"><Link href="/blog" style={{ textDecoration: "none" }}>Guides</Link> / {p.tag}</p>
      <h1 style={{ fontSize: "clamp(34px,5vw,62px)", maxWidth: 940, margin: "14px 0 18px" }}>{p.title}</h1>
      <p className="mute" style={{ marginBottom: 40 }}>Mis à jour le {d(p.date)} · {p.read} min de lecture</p>
      <div className="art" style={{ display: "grid", gridTemplateColumns: "minmax(0,720px) 1fr", gap: 60, alignItems: "start" }}>
        <article className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        <aside style={{ position: "sticky", top: 24 }} className="art-side">
          {p.toc.length > 1 && <div style={{ marginBottom: 26 }}><div className="u" style={{ marginBottom: 10 }}>Dans ce guide</div>{p.toc.map(t => <div key={t} style={{ fontSize: 14.5, padding: "5px 0", borderTop: "1px solid var(--line)" }}>{t}</div>)}</div>}
          <div style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: 18, padding: 22 }}><b style={{ fontSize: 19, fontFamily: "var(--f-display)" }}>Faites votre facture en 40 secondes.</b><p style={{ color: "#B3ACA2", fontSize: 14.5 }}>Mentions OHADA, TVA, montant en lettres, lien de paiement Mobile Money. Sans compte.</p><Link href="/essai" className="b k full">Essayer Kola</Link></div></aside></div>
      <section style={{ marginTop: 70 }}><p className="u">À lire aussi</p><div className="cards" style={{ marginTop: 14 }}>{more.map(x => <Link key={x.slug} href={`/blog/${x.slug}`}><span className="u" style={{ color: "var(--kola)" }}>{x.tag}</span><h3>{x.title}</h3></Link>)}</div></section>
    </main><SiteFooter />
    <style>{`@media(max-width:1000px){.art{grid-template-columns:1fr!important}.art-side{position:static!important}}`}</style></>);
}
