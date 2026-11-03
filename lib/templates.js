export const TEMPLATES = [
  { id: "net", name: "Épuré", en: "Clean" },
  { id: "atelier", name: "Classique", en: "Classic" },
  { id: "marche", name: "Bandeau", en: "Banner" },
  { id: "sahel", name: "Éditorial", en: "Editorial" },
  { id: "registre", name: "Tableau", en: "Grid" },
];
export const DEFAULT_TPL = "net";
export const ACCENTS = ["#111110", "#1F3A5F", "#2433D6", "#0E6E78", "#1E5C3A", "#8A5D00", "#B3261E", "#5B2A86"];
export const FONTS = {
  grotesk: { name: "Grotesque", body: "var(--f-display)", display: "var(--f-display)" },
  modern: { name: "Moderne", en: "Modern", body: "var(--f-ui)", display: "var(--f-ui)" },
  serif: { name: "Serif", body: "var(--f-ui)", display: "var(--f-serif)" },
  mono: { name: "Machine", en: "Typewriter", body: "var(--f-mono)", display: "var(--f-mono)" },
};
// Sections du corps du document, dans l'ordre. L'utilisateur peut les réordonner et les masquer.
export const SECTIONS = { parties: ["Émetteur et client", "From & client"], items: ["Lignes", "Lines"], totals: ["Totaux", "Totals"], words: ["Montant en lettres", "Amount in words"], pay: ["Moyens de paiement", "Payment details"], notes: ["Notes et conditions", "Notes & terms"], signature: ["Signature", "Signature"], legal: ["Mentions légales", "Legal lines"] };
export const DEFAULT_ORDER = ["parties", "items", "totals", "words", "pay", "notes", "signature", "legal"];
export const DEFAULT_BLOCKS = { logo: true, words: true, pay: true, ref: true, notes: true, signature: false, legal: true, client_tax: true, align: "left", logo_pos: "left", logo_size: 56, scale: 100, title: "", lh_top: 22, lh_bottom: 12, order: DEFAULT_ORDER };
export const blocksOf = (p = {}) => { const b = { ...DEFAULT_BLOCKS, ...(p.blocks || {}) }; const o = (b.order || []).filter((x) => SECTIONS[x]); b.order = [...o, ...DEFAULT_ORDER.filter((x) => !o.includes(x))]; return b; };
