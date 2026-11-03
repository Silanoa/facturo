export const SITE = { name: "Bonova", url: process.env.NEXT_PUBLIC_SITE_URL || "https://facturo-woad.vercel.app", tagline: "Invoice in a minute. Get paid anywhere." };
// Identité support. Changer de domaine = changer les variables d'environnement, rien d'autre.
// NEXT_PUBLIC_SUPPORT_EMAIL (ex. support@bonova.app), NEXT_PUBLIC_SUPPORT_WA (chiffres, indicatif inclus), NEXT_PUBLIC_SUPPORT_NAME.
const wa = (process.env.NEXT_PUBLIC_SUPPORT_WA || "221787388599").replace(/\D/g, "");
const pretty = (d) => d.startsWith("221") && d.length === 12 ? `+221 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10)}` : `+${d}`;
export const SUPPORT = { name: process.env.NEXT_PUBLIC_SUPPORT_NAME || "Bonova Support", wa, waLabel: pretty(wa), email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "rosalex@mail.grokbot.com" };
export const waSupport = (text = "", lang = "fr") => `https://wa.me/${SUPPORT.wa}?text=${encodeURIComponent(text || (lang === "en" ? "Hello Bonova Support, I have a question about my account:" : "Bonjour l'équipe Bonova, j'ai une question :"))}`;
export const mailSupport = (body = "", lang = "fr") => `mailto:${SUPPORT.email}?subject=${encodeURIComponent(lang === "en" ? "Bonova — support request" : "Bonova — demande d'aide")}${body ? `&body=${encodeURIComponent(body)}` : ""}`;
