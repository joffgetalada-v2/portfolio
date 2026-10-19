import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          backgroundColor: "#0b0a09",
          borderRadius: 7,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9.6" fill="none" stroke="#ededea" strokeWidth="2.4" />
          <path d="M12 2.4a9.6 9.6 0 0 0 0 19.2Z" fill="#ededea" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
