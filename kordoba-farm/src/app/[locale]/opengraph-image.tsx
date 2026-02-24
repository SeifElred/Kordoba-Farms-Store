import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kordoba Farms – Premium Qurban & Aqiqah";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F3D2E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 700 }}>Kordoba Farms</div>
        <div style={{ fontSize: 24, marginTop: 16, color: "#C8A951" }}>
          Premium Qurban & Aqiqah · Malaysia
        </div>
      </div>
    ),
    { ...size }
  );
}
