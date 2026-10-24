import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";
import { site } from "@/content/site";

export const alt = `${profile.name} — ${profile.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Broken by hand so a platform name never splits across lines.
const HEADLINE = ["Senior E-Commerce Engineer", "Shopify Plus &", "Salesforce Commerce Cloud (Demandware)"];
const FACTS = "12+ years · 50+ Shopify stores · Timex & Guess Watches";
const PLACE = `${profile.location} · Remote`;
// Last name on its own line.
const NAME_WORDS = profile.name.split(" ");
const NAME_LINES = [NAME_WORDS.slice(0, -1), NAME_WORDS.slice(-1)];
// Bundled OFL fonts read from disk. A network fetch here hangs the prerender.
const fontDir = join(process.cwd(), "assets/fonts");
const [geistRegular, geistMedium, serifItalic] = await Promise.all([
  readFile(join(fontDir, "Geist-Regular.ttf")),
  readFile(join(fontDir, "Geist-Medium.ttf")),
  readFile(join(fontDir, "InstrumentSerif-Italic.ttf")),
]);

type Font = { name: string; data: Buffer; weight: 400 | 500; style: "normal" | "italic" };
const fonts: Font[] = [
  { name: "Geist", data: geistRegular, weight: 400, style: "normal" },
  { name: "Geist", data: geistMedium, weight: 500, style: "normal" },
  { name: "Instrument Serif", data: serifItalic, weight: 400, style: "italic" },
];

function Glyph({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9.25" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill={color} />
    </svg>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#060504",
          backgroundImage:
            "radial-gradient(circle at 80% 50%, rgba(228,176,104,0.38) 0%, rgba(150,96,44,0.16) 26%, rgba(6,5,4,0) 52%)",
          fontFamily: "Geist",
          color: "#ededea",
        }}
      >
        {/* Closed book */}
        <div
          style={{
            position: "absolute",
            right: 92,
            top: 122,
            width: 280,
            height: 380,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 44,
            borderRadius: 8,
            backgroundImage: "linear-gradient(150deg, #22201d 0%, #121110 55%, #0a0908 100%)",
            boxShadow: "0 50px 90px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05)",
            transform: "rotate(-9deg)",
          }}
        >
          <div style={{ position: "absolute", left: 18, top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(237,237,234,0.82)", fontSize: 20 }}>
            <Glyph size={17} color="rgba(237,237,234,0.82)" />
            {site.shortBrand}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "58px 64px 56px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 28, fontWeight: 500, letterSpacing: -0.5 }}>
              <Glyph size={26} color="#ededea" />
              {`Interactive ${site.brandTagline}`}
            </div>
            <div style={{ display: "flex", fontSize: 15, letterSpacing: 3.5, color: "#9a9a94" }}>{PLACE.toUpperCase()}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", maxWidth: 700 }}>
            {/* One span per word: Satori squeezes spaces under negative letter-spacing. */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                fontSize: 84,
                fontWeight: 500,
                letterSpacing: -3.2,
                lineHeight: 1,
                color: "#eef0f2",
              }}
            >
              {NAME_LINES.map((line) => (
                <div key={line.join(" ")} style={{ display: "flex", gap: 15 }}>
                  {line.map((word) => (
                    <span key={word}>{word}</span>
                  ))}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 24,
                fontFamily: "Instrument Serif",
                fontStyle: "italic",
                fontSize: 40,
                lineHeight: 1.1,
                color: "#d9b77e",
              }}
            >
              {HEADLINE.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              paddingTop: 22,
              borderTop: "1px solid rgba(237,237,234,0.14)",
              maxWidth: 640,
              fontSize: 23,
              color: "#bdbdb6",
            }}
          >
            {FACTS}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
