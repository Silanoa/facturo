import { og, size as S } from "../../../lib/og.jsx";
import { allPosts, getPost } from "../../../lib/posts";
export const size = S; export const contentType = "image/png"; export const alt = "Guide Kola";
export function generateStaticParams() { return allPosts().map(p => ({ slug: p.slug })); }
export default function Image({ params }) { const p = getPost(params.slug); return og(p?.title || "Guide", p?.tag || "Guide"); }
