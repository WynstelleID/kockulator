import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#101010",
          color: "#fff7ed",
          position: "relative",
          fontSize: 188,
          fontWeight: 900,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 380,
            height: 380,
            borderRadius: 999,
            background: "rgba(249,115,22,0.16)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 118,
            width: 208,
            height: 114,
            borderTopLeftRadius: 220,
            borderTopRightRadius: 220,
            border: "24px solid #f97316",
            borderBottom: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 108,
            height: 108,
            borderRadius: 999,
            background: "#f97316",
          }}
        />
        <div style={{ position: "absolute", top: 104, width: 24, height: 84, borderRadius: 99, background: "#fff7ed" }} />
        <div style={{ position: "absolute", left: 108, width: 84, height: 24, borderRadius: 99, background: "#fff7ed" }} />
        <div style={{ position: "absolute", right: 108, width: 84, height: 24, borderRadius: 99, background: "#fff7ed" }} />
      </div>
    ),
    size
  );
}
