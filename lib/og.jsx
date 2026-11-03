import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export function og(title, kicker = "bonova", lang = "fr") {
  return new ImageResponse((<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F1EFE8", padding: 64, color: "#111110", borderLeft: "28px solid #2433D6" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", borderBottom: "3px solid #111110", paddingBottom: 18 }}>
      <span style={{ fontSize: 44, letterSpacing: -1, textTransform: "none", fontWeight: 900 }}>bonova</span><span style={{ color: "#2433D6" }}>§ {kicker}</span></div>
    <div style={{ fontSize: title.length > 60 ? 66 : 92, fontWeight: 900, lineHeight: 0.95, letterSpacing: -3, maxWidth: 1060, textTransform: "uppercase" }}>{title}</div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, borderTop: "3px dashed #111110", paddingTop: 18 }}><span>{lang === "en" ? "Invoices · quotes · receipts · any currency" : "Factures · devis · reçus · toutes devises"}</span><span style={{ color: "#2433D6", fontWeight: 800 }}>{lang === "en" ? "Free, no sign-up" : "Gratuit, sans compte"}</span></div>
  </div>), size);
}
