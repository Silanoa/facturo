import fs from "fs";
import path from "path";
import { marked } from "marked";
const DIR = path.join(process.cwd(), "content/blog");
function parse(file) {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8"); const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(m[1].split("\n").map(l => { const i = l.indexOf(":"); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }));
  return { slug: file.replace(/\.mdx?$/, ""), ...meta, read: +meta.read || 4, body: m[2] };
}
export function allPosts() { return fs.readdirSync(DIR).filter(f => /\.mdx?$/.test(f)).map(parse).sort((a, b) => b.date.localeCompare(a.date)); }
export function getPost(slug) { const f = [`${slug}.md`, `${slug}.mdx`].find(x => fs.existsSync(path.join(DIR, x))); if (!f) return null; const p = parse(f);
  const html = marked.parse(p.body, { gfm: true }).replace(/<table>/g, '<div style="overflow-x:auto"><table>').replace(/<\/table>/g, "</table></div>");
  const toc = [...p.body.matchAll(/^## (.+)$/gm)].map(x => x[1]); return { ...p, html, toc }; }
