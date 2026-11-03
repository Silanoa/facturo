export const SITE = { name: "Bonova", url: process.env.NEXT_PUBLIC_SITE_URL || "https://facturo-woad.vercel.app", tagline: "Invoice in seconds. Get paid anywhere." };
// Support : WhatsApp + email. NEXT_PUBLIC_SUPPORT_EMAIL = support@<domaine> une fois le domaine acheté (routage email Cloudflare/ImprovMX gratuit).
export const SUPPORT = { wa: "221787388599", waLabel: "+221 78 738 85 99", email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "rosalex@mail.grokbot.com" };
export const waSupport = (text = "") => `https://wa.me/${SUPPORT.wa}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
