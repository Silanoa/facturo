"use client";
import { createContext, useContext, useEffect, useState } from "react";
// Une seule langue pour tout le site : localStorage + cookie, diffusée à tous les fournisseurs (racine, /en, outils).
const Ctx = createContext({ lang: "fr", tr: (f) => f, setLang: () => {} });
const EV = "bnv-lang";
function store(l) { try { localStorage.setItem("lang", l); document.cookie = `lang=${l};path=/;max-age=31536000;samesite=lax`; document.documentElement.lang = routeLang() || l; } catch {} }
export function readLang() { try { const s = localStorage.getItem("lang"); if (s === "fr" || s === "en") return s; const c = /(?:^|; )lang=(fr|en)/.exec(document.cookie); if (c) return c[1]; } catch {} return (typeof navigator !== "undefined" && (navigator.language || "fr").startsWith("fr")) ? "fr" : "en"; }
export function setGlobalLang(l) { store(l); window.dispatchEvent(new CustomEvent(EV, { detail: l })); }
// Pages à langue fixe (/en…, guides FR, outils FR, mentions) : l'attribut lang suit la page, pas la préférence.
const FR_ROUTES = /^\/(blog|outils|essai|exemple|conditions|confidentialite)?(\/|$)/;
export function routeLang() { try { const p = location.pathname; if (p === "/en" || p.startsWith("/en/")) return "en"; if (FR_ROUTES.test(p)) return "fr"; } catch {} return null; }
export function LangProvider({ children, initial }) {
  const [lang, setL] = useState(initial || "fr");
  useEffect(() => {
    if (initial) setGlobalLang(initial); else { const l = readLang(); setL(l); document.documentElement.lang = routeLang() || l; }
    if (initial) return;
    const f = (e) => setL(e.detail); window.addEventListener(EV, f); return () => window.removeEventListener(EV, f);
  }, [initial]);
  const setLang = (l) => { if (!initial) setL(l); setGlobalLang(l); };
  return <Ctx.Provider value={{ lang, setLang, tr: (f, e) => (lang === "en" ? e : f) }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
export const trOf = (lang) => (f, e) => (lang === "en" ? e : f);
