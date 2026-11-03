"use client";
// Import d'images : PNG, JPG, WebP, GIF, SVG et PDF (1re page). Toujours ramené à une petite image légère.
const MAX = 12 * 1024 * 1024;
async function pdfCanvas(file, W) {
  const pdfjs = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise; const page = await pdf.getPage(1);
  const v0 = page.getViewport({ scale: 1 }); const v = page.getViewport({ scale: W / v0.width }); const c = document.createElement("canvas"); c.width = W; c.height = Math.round(v.height);
  const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); await page.render({ canvasContext: g, viewport: v }).promise; return c;
}
function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("img")); i.src = src; }); }
const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name || "");
const isSvg = (f) => f.type === "image/svg+xml" || /\.svg$/i.test(f.name || "");
// Rogne les marges blanches/transparentes (utile pour un logo issu d'un PDF).
function trim(c) { const g = c.getContext("2d"); const { width: w, height: h } = c; const d = g.getImageData(0, 0, w, h).data; let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const k = (y * w + x) * 4; if (d[k + 3] > 16 && (d[k] < 245 || d[k + 1] < 245 || d[k + 2] < 245)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (x1 < 0) return c; const m = 6; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(w, x1 + m); y1 = Math.min(h, y1 + m); const o = document.createElement("canvas"); o.width = x1 - x0; o.height = y1 - y0; o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height); return o; }
export async function shrink(file, max = 360) {
  if (!file) throw new Error("file"); if (file.size > MAX) throw new Error("size");
  let src;
  if (isPdf(file)) src = trim(await pdfCanvas(file, 1000));
  else { const url = URL.createObjectURL(file); try { src = await loadImg(url); } finally { setTimeout(() => URL.revokeObjectURL(url), 2000); } }
  let w = src.naturalWidth || src.width, h = src.naturalHeight || src.height; if (!w || !h) { w = 600; h = 300; } // SVG sans dimensions
  const s = Math.min(1, max / Math.max(w, h)) * (isSvg(file) && Math.max(w, h) < max ? max / Math.max(w, h) : 1);
  const c = document.createElement("canvas"); c.width = Math.max(1, Math.round(w * s)); c.height = Math.max(1, Math.round(h * s)); c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  const png = file.type === "image/png" || isSvg(file) || file.type === "image/webp" || file.type === "image/gif" || isPdf(file);
  const out = c.toDataURL(png ? "image/png" : "image/jpeg", 0.88); if (out.length < 100) throw new Error("empty"); return out;
}
// Couleur dominante d'un logo (ignore blancs, noirs et gris) -> accent du modèle.
export function dominant(src) { return new Promise((res) => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 48; const g = c.getContext("2d"); g.drawImage(img, 0, 0, 48, 48); const d = g.getImageData(0, 0, 48, 48).data; const B = {};
  for (let i = 0; i < d.length; i += 4) { const [r, gg, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]]; if (a < 200) continue; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); if (mx - mn < 40 || mx < 40 || mn > 225) continue; const k = `${r >> 4},${gg >> 4},${b >> 4}`; B[k] = (B[k] || 0) + 1; }
  const top = Object.entries(B).sort((a, b) => b[1] - a[1])[0]; if (!top) return res(null); const [r, gg, b] = top[0].split(",").map((x) => (+x << 4) + 8); res("#" + [r, gg, b].map((x) => Math.min(200, x).toString(16).padStart(2, "0")).join("")); }; img.onerror = () => res(null); img.src = src; }); }
// Papier à en-tête : image ou 1re page d'un PDF -> JPEG A4 (1240 px de large).
export async function letterhead(file) {
  if (!file || file.size > MAX) throw new Error("size");
  let canvas = document.createElement("canvas"); const W = 1240;
  if (isPdf(file)) canvas = await pdfCanvas(file, W);
  else {
    const url = URL.createObjectURL(file); const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const iw = img.naturalWidth || img.width || 1240, ih = img.naturalHeight || img.height || 1754; canvas.width = W; canvas.height = Math.round(ih * W / iw); const g = canvas.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, canvas.width, canvas.height); g.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL("image/jpeg", 0.8);
}
