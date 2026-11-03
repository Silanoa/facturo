import fs from "fs";
import path from "path";
import { marked } from "marked";
const BASE = path.join(process.cwd(), "content/blog"); const dir = (l) => l === "en" ? path.join(BASE, "en") : BASE;
function parse(file, l) {
  const raw = fs.readFileSync(path.join(dir(l), file), "utf8"); const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(m[1].split("\n").map(l => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  return { slug: file.replace(/\.mdx?$/, ""), ...meta, read: +meta.read || 4, body: m[2] };
}
export function allPosts(l = "fr") { return fs.readdirSync(dir(l)).filter(f => /\.mdx?$/.test(f)).map(f => parse(f, l)).sort((a, b) => b.date.localeCompare(a.date)); }
export function getPost(slug, l = "fr") { const f = [`${slug}.md`, `${slug}.mdx`].find(x => fs.existsSync(path.join(dir(l), x))); if (!f) return null; const p = parse(f, l);
  const html = marked.parse(p.body, { gfm: true }).replace(/<table>/g, '<div style="overflow-x:auto"><table>').replace(/<\/table>/g, "</table></div>");
  const toc = [...p.body.matchAll(/^## (.+)$/gm)].map(x => x[1]); return { ...p, html, toc }; }
