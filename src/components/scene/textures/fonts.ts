import type { FaceFonts } from "./types";

// Canvas can't read CSS variables, so resolve the next/font families from <html>.
const VARS: Record<keyof FaceFonts, { cssVar: string; fallback: string; probes: string[] }> = {
  sans: {
    cssVar: "--font-geist-sans",
    fallback: "ui-sans-serif, system-ui, sans-serif",
    probes: ["400", "500", "600", "700"],
  },
  serif: {
    cssVar: "--font-instrument-serif",
    fallback: "Georgia, serif",
    probes: ["400", "italic 400"],
  },
  mono: {
    cssVar: "--font-geist-mono",
    fallback: "ui-monospace, monospace",
    probes: ["400", "500"],
  },
  display: {
    cssVar: "--font-anton",
    fallback: "Impact, sans-serif",
    probes: ["400"],
  },
};

let cached: Promise<FaceFonts> | null = null;

export function loadFaceFonts(): Promise<FaceFonts> {
  if (cached) return cached;
  cached = (async () => {
    const style = getComputedStyle(document.documentElement);
    const fonts = {} as FaceFonts;
    const loads: Promise<unknown>[] = [];
    for (const key of Object.keys(VARS) as (keyof FaceFonts)[]) {
      const { cssVar, fallback, probes } = VARS[key];
      const family = style.getPropertyValue(cssVar).trim();
      fonts[key] = family ? `${family}, ${fallback}` : fallback;
      if (family) {
        for (const probe of probes) {
          loads.push(document.fonts.load(`${probe} 32px ${family}`).catch(() => undefined));
        }
      }
    }
    // Don't hold the scene back on a slow font request.
    await Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, 4000))]);
    return fonts;
  })();
  return cached;
}
