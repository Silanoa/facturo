"use client";
import { useEffect, useState } from "react";
// Filet de sécurité : jamais l'écran brut de Next. Après une mise en ligne, un onglet resté ouvert peut
// demander des fichiers qui n'existent plus (ChunkLoadError) : on recharge alors la page une seule fois.
export const isStale = (e) => /ChunkLoadError|Loading (CSS )?chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(`${e?.name || ""} ${e?.message || e || ""}`);
export function reloadOnce() { try { const k = "bnv_reload_at", t = +sessionStorage.getItem(k) || 0; if (Date.now() - t < 30000) return false; sessionStorage.setItem(k, String(Date.now())); } catch {} location.reload(); return true; }
const pickLang = () => { try { if (location.pathname === "/en" || location.pathname.startsWith("/en/")) return "en"; const s = localStorage.getItem("lang"); if (s === "fr" || s === "en") return s; } catch {} return "fr"; };
export default function ErrorScreen({ error, reset }) {
  const [en, setEn] = useState(false); const [stale] = useState(() => typeof window !== "undefined" && isStale(error));
  useEffect(() => { setEn(pickLang() === "en"); if (isStale(error)) reloadOnce(); else console.error(error); }, [error]);
  const t = (f, e) => (en ? e : f);
  return (<main className="errs" role="alert">
    <p className="errs-k">Bonova</p>
    <h1>{stale ? t("Mise à jour en cours…", "Updating…") : t("Cette page n'a pas pu s'afficher.", "This page could not be displayed.")}</h1>
    <p className="errs-p">{stale ? t("Une nouvelle version de Bonova vient d'être mise en ligne. La page se recharge.", "A new version of Bonova was just released. The page is reloading.") : t("Vos données ne sont pas touchées. Réessayez ; si le problème continue, écrivez-nous.", "Your data is safe. Please try again; if it keeps happening, let us know.")}</p>
    <div className="errs-a"><button className="b k" onClick={() => { if (isStale(error)) return location.reload(); try { reset?.(); } catch { location.reload(); } }}>{t("Réessayer", "Try again")}</button>
      <a className="b o" href={en ? "/en" : "/"} onClick={(e) => { if (location.pathname.startsWith("/app")) { e.preventDefault(); location.href = "/app"; } }}>{t("Retour à l'accueil", "Back to home")}</a></div>
    {error?.digest && <p className="errs-d">{t("Référence", "Reference")} : {error.digest}</p>}
  </main>);
}
