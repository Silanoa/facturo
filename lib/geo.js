"use client";
import { useEffect, useState } from "react";
import { COUNTRIES } from "./countries";
// Pays du visiteur : 1) choix enregistré, 2) IP (Vercel), 3) langue du navigateur. Toujours modifiable.
const ok = (c) => c && COUNTRIES.some((x) => x.code === c) ? c : null;
export function browserCountry() { for (const l of (navigator.languages || [navigator.language || ""])) { const m = /-([A-Z]{2})$/i.exec(l); if (m && ok(m[1].toUpperCase())) return m[1].toUpperCase(); } return null; }
let pending = null;
export function detectCountry() {
  if (!pending) pending = fetch("/api/geo").then((r) => r.json()).then((j) => ok(j.country) || browserCountry()).catch(() => browserCountry());
  return pending;
}
export function useCountry(fallback = null) {
  const [cc, setCc] = useState(fallback);
  useEffect(() => { let saved = null; try { saved = localStorage.getItem("bnv_cc"); } catch {} if (ok(saved)) return setCc(saved); detectCountry().then((c) => c && setCc(c)); }, []);
  return cc;
}
export const rememberCountry = (c) => { try { localStorage.setItem("bnv_cc", c); } catch {} };
