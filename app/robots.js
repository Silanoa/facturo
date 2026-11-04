import { SITE } from "../lib/site";
const PRIVATE = ["/app", "/f/", "/api/", "/connexion"];
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "Google-Extended", "PerplexityBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "Applebot-Extended", "CCBot"];
export default function robots() { return { rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }, { userAgent: AI, allow: "/", disallow: PRIVATE }], sitemap: `${SITE.url}/sitemap.xml`, host: SITE.url }; }
