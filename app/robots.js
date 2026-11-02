import { SITE } from "../lib/site";
export default function robots() { return { rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/f/", "/api/", "/connexion"] }], sitemap: `${SITE.url}/sitemap.xml`, host: SITE.url }; }
