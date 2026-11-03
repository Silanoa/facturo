import { og, size as S } from "../../../lib/og.jsx";
import { allPosts, getPost } from "../../../lib/posts";
export const size = S; export const contentType = "image/png"; export const alt = "Guide Bonova";
export function generateStaticParams() { return allPosts("fr").map(p => ({ slug: p.slug })); }
export default function Image({ params }) { const p = getPost(params.slug, "fr"); return og(p?.title || "Guide", p?.tag || "Guide"); }
