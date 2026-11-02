import Link from "next/link";
import { SiteNav, SiteFooter } from "../../components/Brand";
import { allPosts } from "../../lib/posts";
export const metadata = { title: "Guides : facturer et se faire payer en Afrique", description: "Mentions OHADA, TVA 18 %, facture au Bénin, au Sénégal, en Côte d'Ivoire, au Cameroun, relances WhatsApp, Mobile Money : des guides pratiques et vérifiés.", alternates: { canonical: "/blog" } };
const d = (x) => new Date(x).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
export default function Blog() { const posts = allPosts(); const [first, ...rest] = posts;
  return (<><SiteNav /><main className="wrap sec" style={{ paddingTop: 40 }}>
    <p className="u">Guides</p><h1 style={{ fontSize: "clamp(40px,6vw,80px)", maxWidth: 900, margin: "12px 0 40px" }}>Facturer juste, se faire payer vite.</h1>
    <Link href={`/blog/${first.slug}`} className="feat" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, textDecoration: "none", borderTop: "1.5px solid var(--ink)", padding: "28px 0 40px" }}>
      <div><span className="pill">{first.tag}</span><h2 style={{ fontSize: "clamp(30px,4vw,48px)", margin: "16px 0 0" }}>{first.title}</h2></div>
      <div><p style={{ fontSize: 19, color: "var(--ink-2)", marginTop: 0 }}>{first.description}</p><span className="mute">{d(first.date)} · {first.read} min</span></div></Link>
    <div className="cards">{rest.map(p => <Link key={p.slug} href={`/blog/${p.slug}`}><span className="u" style={{ color: "var(--kola)" }}>{p.tag}</span><h3>{p.title}</h3><p className="mute" style={{ margin: "0 0 10px", fontSize: 15 }}>{p.description}</p><span className="mute" style={{ fontSize: 13.5 }}>{p.read} min de lecture</span></Link>)}</div>
    <style>{`@media(max-width:900px){.feat{grid-template-columns:1fr!important;gap:10px!important}}`}</style>
  </main><SiteFooter /></>); }
