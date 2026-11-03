import { supabase } from "./supabase";
import { KINDS } from "./money";
// Numérotation : préfixe personnalisable (réglages), année incluse ou non, suite continue sans trou par type.
export function prefixFor(kind, lang = "fr", st = {}) {
  const n = st.numbering || {}; const p = (n[kind] || (lang === "en" ? KINDS[kind].pre_en : KINDS[kind].prefix)).trim();
  return n.year === false ? `${p}-` : `${p}-${new Date().getFullYear()}-`;
}
export async function nextNumber(kind, lang = "fr", st = {}) {
  const pre = prefixFor(kind, lang, st); const pad = +(st.numbering || {}).pad || 4;
  const { data } = await supabase.from("documents").select("number").eq("kind", kind).like("number", `${pre}%`).order("number", { ascending: false }).limit(20);
  const last = Math.max(0, ...(data || []).map((d) => parseInt(d.number.slice(pre.length)) || 0), (+(st.numbering || {}).start || 1) - 1);
  return pre + String(last + 1).padStart(pad, "0");
}
// Liste de documents synchronisée en temps réel (acceptation de devis, paiement déclaré…).
import { useEffect, useState } from "react";
export function useDocs() {
  const [docs, setDocs] = useState(null);
  useEffect(() => {
    const load = () => supabase.from("documents").select("*").order("issue_date", { ascending: false }).order("number", { ascending: false }).then(({ data }) => setDocs(data || []));
    load();
    const ch = supabase.channel(`docs-${Math.random().toString(36).slice(2)}`).on("postgres_changes", { event: "*", schema: "public", table: "documents" }, (p) => setDocs((l) => {
      if (!l) return l; if (p.eventType === "DELETE") return l.filter((d) => d.id !== p.old.id);
      return l.some((d) => d.id === p.new.id) ? l.map((d) => (d.id === p.new.id ? { ...d, ...p.new } : d)) : [p.new, ...l]; })).subscribe();
    const vis = () => document.visibilityState === "visible" && load(); document.addEventListener("visibilitychange", vis);
    return () => { supabase.removeChannel(ch); document.removeEventListener("visibilitychange", vis); };
  }, []);
  return [docs, setDocs];
}
