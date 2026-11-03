"use client";
import { createContext, useContext, useEffect, useState } from "react";
const Ctx = createContext({ lang: "fr", tr: (f) => f, setLang: () => {} });
export function LangProvider({ children, initial }) {
  const [lang, setL] = useState(initial || "fr");
  useEffect(() => { if (initial) return; const l = localStorage.getItem("lang") || ((navigator.language || "fr").startsWith("fr") ? "fr" : "en"); setL(l); document.documentElement.lang = l; }, [initial]);
  const setLang = (l) => { setL(l); localStorage.setItem("lang", l); document.documentElement.lang = l; };
  useEffect(() => { if (initial) { localStorage.setItem("lang", initial); document.documentElement.lang = initial; } }, [initial]);
  return <Ctx.Provider value={{ lang, setLang, tr: (f, e) => (lang === "en" ? e : f) }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
export const trOf = (lang) => (f, e) => (lang === "en" ? e : f);
