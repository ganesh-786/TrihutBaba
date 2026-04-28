import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Trihutbaba Store & Machinery";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "linear-gradient(135deg, #1d6f3c 0%, #2d8c4a 60%, #f4c038 100%)",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "white",
              color: "#1d6f3c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            T
          </div>
          Trihutbaba
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Quality agriculture
            <br /> tools, delivered.
          </div>
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            Seeds · Machinery · Hand tools · Fertilizer · Nepal
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: 22,
            opacity: 0.95,
          }}
        >
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 16px", borderRadius: 999 }}>eSewa</span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 16px", borderRadius: 999 }}>Khalti</span>
          <span style={{ background: "rgba(255,255,255,0.18)", padding: "8px 16px", borderRadius: 999 }}>COD</span>
        </div>
      </div>
    ),
    size
  );
}
