import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export function og(title, kicker = "kola") {
  return new ImageResponse((<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#F3EFE6", padding: 72, color: "#141210" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: "#B8321A", display: "flex" }} />kola<span style={{ fontSize: 22, fontWeight: 600, color: "#77716A", letterSpacing: 3, marginLeft: 20, textTransform: "uppercase" }}>{kicker}</span></div>
    <div style={{ fontSize: title.length > 60 ? 64 : 84, fontWeight: 800, lineHeight: 1, letterSpacing: -3, maxWidth: 1050 }}>{title}</div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#3B3833" }}><span>Factures · devis · reçus · Mobile Money</span><span style={{ color: "#B8321A", fontWeight: 700 }}>Gratuit, sans compte</span></div>
  </div>), size);
}
