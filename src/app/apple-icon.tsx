import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// No border radius, iOS rounds the corners.
export default function AppleIcon() {
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
          backgroundImage: "radial-gradient(circle at 50% 46%, rgba(217,183,126,0.22) 0%, rgba(11,10,9,0) 62%)",
        }}
      >
        <svg width="96" height="96" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9.3" fill="none" stroke="#ededea" strokeWidth="1.5" />
          <path d="M12 2.7a9.3 9.3 0 0 0 0 18.6Z" fill="#ededea" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
