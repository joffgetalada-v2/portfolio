// Page surfaces and the running header/folio.
import { site } from "@/content/site";
import { SHEETS, SPREADS, type FaceId } from "../book-config";
import { brandGlyph, H, pad2, pageLayer, rng, runs, text, W, type Ctx, type Page } from "./draw-utils";

export type Side = "left" | "right";

// Editorial (non-project) pages
export const PAPER = {
  bg: "#f3f1ec",
  ink: "#151513",
  muted: "#3f3c36",
  faint: "#78736a",
  line: "rgba(21,21,19,0.16)",
  accent: "#b5532c",
} as const;

// Design px. gut is the spine side, wide enough to clear the gutter shadow.
export const M = { out: 72, gut: 112, top: 80, foot: H - 56 } as const;

// Spread n shows SHEETS[n-1].back on the left and SHEETS[n].front on the right.
export function sideOf(id: FaceId): Side {
  return SHEETS.some((s) => s.front === id) ? "right" : "left";
}

export function spreadOf(id: FaceId): number {
  return SPREADS.find((s) => s.left === id || s.right === id)?.page ?? 0;
}

// Page number, first inside page = 1
export function folioOf(id: FaceId): number {
  const sp = SPREADS.find((s) => s.left === id || s.right === id);
  if (!sp) return 0;
  return sp.page * 2 - (sp.left === id ? 1 : 0);
}

export function frame(side: Side) {
  return side === "left" ? { x0: M.out, x1: W - M.gut } : { x0: M.gut, x1: W - M.out };
}

// ---------- grain ----------
let grainTile: HTMLCanvasElement | null = null;

// Light and dark specks at low alpha so one tile works on any tone.
function grain(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d", { willReadFrequently: true })!; // CPU-backed, same as the page canvases
  const img = ctx.createImageData(256, 256);
  const r = rng(7);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = r() - 0.5;
    const light = v > 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = light ? 255 : 0;
    img.data[i + 3] = Math.abs(v) * 0.5 * 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

function fillGrain(ctx: Ctx, pw: number, ph: number, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = ctx.createPattern(grain(), "repeat")!;
  ctx.fillRect(0, 0, pw, ph);
  ctx.restore();
}

// Large soft blotches to break up flat colour.
function mottle(ctx: Ctx, seed: number, alpha: number, dark: boolean) {
  if (alpha <= 0) return;
  const r = rng(seed);
  for (let i = 0; i < 46; i++) {
    const x = r() * W;
    const y = r() * H;
    const rad = 80 + r() * 260;
    const light = dark ? r() > 0.35 : r() > 0.6;
    const c = light ? "255,255,255" : "0,0,0";
    const a = alpha * (0.4 + r() * 0.6);
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(${c},${a})`);
    g.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
}

function fibres(ctx: Ctx, seed: number, count: number, color: string) {
  if (count <= 0) return;
  const r = rng(seed);
  ctx.strokeStyle = color;
  ctx.lineCap = "round";
  for (let i = 0; i < count; i++) {
    const x = r() * W;
    const y = r() * H;
    const len = 3 + r() * 9;
    const a = r() * Math.PI;
    ctx.globalAlpha = 0.25 + r() * 0.75;
    ctx.lineWidth = 0.5 + r() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4,
      y + Math.sin(a) * len * 0.5 + (r() - 0.5) * 4,
      x + Math.cos(a) * len,
      y + Math.sin(a) * len,
    );
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// Shading where the page curves into the spine, plus a falloff on the outer edge.
function gutter(ctx: Ctx, side: Side, strength: number) {
  const spineX = side === "left" ? W : 0;
  const dir = side === "left" ? -1 : 1;
  const g = ctx.createLinearGradient(spineX, 0, spineX + dir * 190, 0);
  g.addColorStop(0, `rgba(0,0,0,${0.3 * strength})`);
  g.addColorStop(0.08, `rgba(0,0,0,${0.16 * strength})`);
  g.addColorStop(0.35, `rgba(0,0,0,${0.05 * strength})`);
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(side === "left" ? W - 190 : 0, 0, 190, H);
  // Faint highlight just outside the crease.
  const hx = spineX + dir * 26;
  const hl = ctx.createLinearGradient(hx - 14, 0, hx + 14, 0);
  hl.addColorStop(0, "rgba(255,255,255,0)");
  hl.addColorStop(0.5, `rgba(255,255,255,${0.05 * strength})`);
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(hx - 14, 0, 28, H);
  // Outer edge.
  const ox = side === "left" ? 0 : W;
  const og = ctx.createLinearGradient(ox, 0, ox - dir * 40, 0);
  og.addColorStop(0, `rgba(0,0,0,${0.07 * strength})`);
  og.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = og;
  ctx.fillRect(side === "left" ? 0 : W - 40, 0, 40, H);
}

export interface SurfaceOpts {
  tone: string;
  side: Side;
  /** Cache key suffix; required when `extra` paints anything. */
  key?: string;
  grain?: number;
  mottle?: number;
  fibres?: number;
  fibreColor?: string;
  dark?: boolean;
  gutter?: number;
  vignette?: number;
  /** Baked into the cached layer. No text: the key has no fontKey(). */
  extra?: (ctx: Ctx) => void;
}

// Tone, mottling, fibres, grain and gutter in one cached layer.
export function surface(p: Page, o: SurfaceOpts) {
  const dark = o.dark ?? false;
  const key = `surface:${o.key ?? ""}:${o.tone}:${o.side}:${o.grain}:${o.mottle}:${o.fibres}:${o.gutter}:${o.vignette}`;
  pageLayer(p, key, (ctx, pw, ph) => {
    ctx.fillStyle = o.tone;
    ctx.fillRect(0, 0, W, H);
    o.extra?.(ctx);
    mottle(ctx, 11, o.mottle ?? (dark ? 0.035 : 0.03), dark);
    fibres(ctx, 23, o.fibres ?? (dark ? 0 : 140), o.fibreColor ?? (dark ? "rgba(255,255,255,0.04)" : "rgba(60,48,30,0.045)"));
    fillGrain(ctx, pw, ph, o.grain ?? (dark ? 0.3 : 0.26));
    const v = o.vignette ?? (dark ? 0.35 : 0.06);
    if (v > 0) {
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.78);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${v})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    gutter(ctx, o.side, o.gutter ?? (dark ? 1.2 : 1));
  });
}

export function paper(p: Page, side: Side) {
  surface(p, { tone: PAPER.bg, side });
}

// Black leather board with a hinge groove on the spine side.
export function leather(p: Page, side: Side) {
  pageLayer(p, `leather:${side}`, (ctx, pw, ph) => {
    ctx.fillStyle = "#0b0a09";
    ctx.fillRect(0, 0, W, H);
    // Pebbled grain.
    const r = rng(91);
    for (let i = 0; i < 9000; i++) {
      const x = r() * W;
      const y = r() * H;
      const rad = 1 + r() * 2.2;
      ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.006 + r() * 0.01})` : `rgba(0,0,0,${0.12 + r() * 0.18})`;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    mottle(ctx, 5, 0.014, true);
    fillGrain(ctx, pw, ph, 0.22);
    // Vignette.
    const g = ctx.createRadialGradient(W * 0.48, H * 0.45, H * 0.15, W / 2, H / 2, W * 0.75);
    g.addColorStop(0, "rgba(255,255,255,0.025)");
    g.addColorStop(0.6, "rgba(0,0,0,0)");
    g.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Hinge groove.
    const hx = side === "right" ? 86 : W - 86;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(hx - 3, 0, 6, H);
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(hx + (side === "right" ? 3 : -4), 0, 1, H);
    // Edge bevel.
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, W - 10, H - 10);
  });
}

export interface ChromeOpts {
  side: Side;
  spread: number;
  title: string;
  folio: number;
  color: string;
  alpha?: number;
}

// Running header in the top outer corner, folio in the bottom outer corner.
export function chrome(p: Page, o: ChromeOpts) {
  const { ctx } = p;
  const a = o.alpha ?? 0.8;
  const outerX = o.side === "left" ? M.out : W - M.out;
  const label = { size: 18, family: "mono" as const, color: o.color, alpha: a };
  const parts = [
    { str: site.shortBrand, st: { ...label, track: 0.02 } },
    { str: `  —  ${pad2(o.spread)}  —  `, st: { ...label, track: 0.04 } },
    { str: o.title, st: { ...label, track: 0.14, upper: true } },
  ];
  const glyphW = 25;
  ctx.globalAlpha = a;
  if (o.side === "left") {
    brandGlyph(ctx, outerX + 8, M.top - 6.5, 8, o.color, 1.6);
    ctx.globalAlpha = 1;
    runs(p, parts, outerX + glyphW, M.top, "left");
  } else {
    ctx.globalAlpha = 1;
    const wTotal = runs(p, parts, outerX, M.top, "right");
    ctx.globalAlpha = a;
    brandGlyph(ctx, outerX - wTotal - glyphW + 8, M.top - 6.5, 8, o.color, 1.6);
    ctx.globalAlpha = 1;
  }
  text(p, pad2(o.folio), outerX, M.foot, {
    ...label,
    align: o.side === "left" ? "left" : "right",
    track: 0.08,
  });
}
