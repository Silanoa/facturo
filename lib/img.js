"use client";
export function shrink(file) { return new Promise((res, rej) => { const img = new Image(); const r = new FileReader(); r.onload = () => { img.onload = () => { const s = Math.min(1, 360 / Math.max(img.width, img.height)); const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL(file.type === "image/png" || file.type === "image/svg+xml" ? "image/png" : "image/jpeg", .85)); }; img.onerror = rej; img.src = r.result; }; r.readAsDataURL(file); }); }
// Couleur dominante d'un logo (ignore blancs, noirs et gris) -> accent du modèle.
export function dominant(src) { return new Promise((res) => { const img = new Image(); img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = 48; const g = c.getContext("2d"); g.drawImage(img, 0, 0, 48, 48); const d = g.getImageData(0, 0, 48, 48).data; const B = {};
  for (let i = 0; i < d.length; i += 4) { const [r, gg, b, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]]; if (a < 200) continue; const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); if (mx - mn < 40 || mx < 40 || mn > 225) continue; const k = `${r >> 4},${gg >> 4},${b >> 4}`; B[k] = (B[k] || 0) + 1; }
  const top = Object.entries(B).sort((a, b) => b[1] - a[1])[0]; if (!top) return res(null); const [r, gg, b] = top[0].split(",").map((x) => (+x << 4) + 8); res("#" + [r, gg, b].map((x) => Math.min(200, x).toString(16).padStart(2, "0")).join("")); }; img.onerror = () => res(null); img.src = src; }); }
// Papier à en-tête : image ou 1re page d'un PDF -> JPEG A4 (1240 px de large).
export async function letterhead(file) {
  let canvas = document.createElement("canvas"); const W = 1240;
  if (file.type === "application/pdf") {
    const pdfjs = await import(/* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";
    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise; const page = await pdf.getPage(1);
    const v0 = page.getViewport({ scale: 1 }); const v = page.getViewport({ scale: W / v0.width }); canvas.width = W; canvas.height = Math.round(v.height);
    const g = canvas.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, canvas.width, canvas.height); await page.render({ canvasContext: g, viewport: v }).promise;
  } else {
    const url = URL.createObjectURL(file); const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    canvas.width = W; canvas.height = Math.round(img.height * W / img.width); const g = canvas.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, canvas.width, canvas.height); g.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  return canvas.toDataURL("image/jpeg", 0.8);
}
