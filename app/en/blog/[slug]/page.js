import { notFound } from "next/navigation";
import { BlogPost, postMeta } from "../../../../components/Blog";
import { allPosts, getPost } from "../../../../lib/posts";
export const dynamicParams = false;
export function generateStaticParams() { return allPosts("en").map(p => ({ slug: p.slug })); }
export function generateMetadata({ params }) { return postMeta(params.slug, "en"); }
export default function Page({ params }) { if (!getPost(params.slug, "en")) notFound(); return <BlogPost slug={params.slug} lang="en" />; }
