// Canvas 2D helpers. Faces draw in a fixed 1280x880 design space under a scale transform.
import type { FaceFonts } from "./types";

export type Ctx = CanvasRenderingContext2D;

export const W = 1280;
export const H = 880;

export interface Page {
  ctx: Ctx;
  /** Seconds since hover began; 0 is the resting frame. */
  t: number;
  fonts: FaceFonts;
  image: HTMLImageElement | null;
  shots: readonly (HTMLImageElement | null)[];
  /** Canvas size in px; s = pw / W. */
  pw: number;
  ph: number;
  s: number;
}

// ---------- math ----------
export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const fract = (v: number) => v - Math.floor(v);
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const easeInOut = (k: number) => {
  const x = clamp(k);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const smooth = (a: number, b: number, v: number) => {
  const k = clamp((v - a) / (b - a));
  return k * k * (3 - 2 * k);
};
export const pad2 = (n: number) => String(n).padStart(2, "0");

// mulberry32, seeded so baked textures are stable across loads
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- cached offscreen layers ----------
const layers = new Map<string, HTMLCanvasElement>();

// Offscreen canvas painted once per key and size. Keys for layers with text must include fontKey().
export function cached(
  key: string,
  dw: number,
  dh: number,
  s: number,
  paint: (ctx: Ctx, pw: number, ph: number) => void,
): HTMLCanvasElement {
  const pw = Math.max(1, Math.round(dw * s));
  const ph = Math.max(1, Math.round(dh * s));
  const k = `${key}@${pw}x${ph}`;
  let c = layers.get(k);
  if (!c) {
    c = document.createElement("canvas");
    c.width = pw;
    c.height = ph;
    // CPU-backed to match the page canvases, otherwise drawImage forces GPU readbacks
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.setTransform(pw / dw, 0, 0, ph / dh, 0, 0);
    paint(ctx, pw, ph);
    layers.set(k, c);
  }
  return c;
}

// Changes once the web font has loaded, so baked text gets repainted.
export function fontKey(p: Page, family: Family): string {
  const fam = p.fonts[family];
  const ready = typeof document !== "undefined" && document.fonts?.check(`16px ${fam}`);
  return `${fam}:${ready ? 1 : 0}`;
}

export function pageLayer(p: Page, key: string, paint: (ctx: Ctx, pw: number, ph: number) => void) {
  p.ctx.drawImage(cached(key, W, H, p.s, paint), 0, 0, W, H);
}

// rgb as "r,g,b"
export function drawGlow(p: Page, rgb: string, x: number, y: number, r: number, alpha = 1) {
  const c = cached(`glow:${rgb}`, 128, 128, 1, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, `rgba(${rgb},1)`);
    g.addColorStop(0.18, `rgba(${rgb},0.55)`);
    g.addColorStop(0.45, `rgba(${rgb},0.16)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });
  const { ctx } = p;
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * alpha;
  ctx.drawImage(c, x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = a;
}

// ---------- text ----------
export type Family = keyof FaceFonts;

export interface TextStyle {
  size: number;
  family?: Family;
  weight?: number;
  italic?: boolean;
  color?: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  /** Letter spacing in em. */
  track?: number;
  upper?: boolean;
  alpha?: number;
}

function applyStyle(p: Page, st: TextStyle) {
  const { ctx, fonts } = p;
  ctx.font = `${st.italic ? "italic " : ""}${st.weight ?? 400} ${st.size}px ${fonts[st.family ?? "sans"]}`;
  if (st.color) ctx.fillStyle = st.color;
  ctx.textAlign = st.align ?? "left";
  ctx.textBaseline = st.baseline ?? "alphabetic";
  ctx.letterSpacing = `${(st.track ?? 0) * st.size}px`;
}

const caseOf = (str: string, st: TextStyle) => (st.upper ? str.toUpperCase() : str);

// letterSpacing adds a gap after the last glyph; offset right/center aligned text to compensate
function trackShift(st: TextStyle) {
  const tr = (st.track ?? 0) * st.size;
  if (st.align === "right" || st.align === "end") return tr;
  if (st.align === "center") return tr / 2;
  return 0;
}

// Faces redraw the same strings every frame, so cache measureText.
const widthCache = new Map<string, number>();

// Expects applyStyle() to have run for st.
function widthOf(p: Page, s: string, st: TextStyle): number {
  const key = `${p.fonts[st.family ?? "sans"]}|${st.weight ?? 400}|${st.italic ? 1 : 0}|${st.size}|${st.track ?? 0}|${s}`;
  let w = widthCache.get(key);
  if (w === undefined) {
    if (widthCache.size > 4000) widthCache.clear();
    w = p.ctx.measureText(s).width - (st.track ?? 0) * st.size;
    widthCache.set(key, w);
  }
  return w;
}

export function measure(p: Page, str: string, st: TextStyle): number {
  applyStyle(p, st);
  return widthOf(p, caseOf(str, st), st);
}

export function text(p: Page, str: string, x: number, y: number, st: TextStyle): number {
  const s = caseOf(str, st);
  applyStyle(p, st);
  const { ctx } = p;
  const a = ctx.globalAlpha;
  if (st.alpha !== undefined) ctx.globalAlpha = a * st.alpha;
  ctx.fillText(s, x + trackShift(st), y);
  ctx.globalAlpha = a;
  return widthOf(p, s, st);
}

const wrapCache = new Map<string, string[]>();

// Anything measured before the web fonts loaded used the fallback.
if (typeof document !== "undefined") {
  document.fonts?.addEventListener("loadingdone", () => {
    widthCache.clear();
    wrapCache.clear();
  });
}

// Greedy word wrap, honours \n.
export function wrap(p: Page, str: string, maxW: number, st: TextStyle): string[] {
  const s = caseOf(str, st);
  applyStyle(p, st);
  const { ctx } = p;
  const key = `${ctx.font}|${st.track ?? 0}|${Math.round(maxW)}|${s}`;
  const hit = wrapCache.get(key);
  if (hit) return hit;
  const tr = (st.track ?? 0) * st.size;
  const lines: string[] = [];
  for (const block of s.split("\n")) {
    let line = "";
    for (const word of block.split(" ")) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width - tr > maxW) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    lines.push(line);
  }
  wrapCache.set(key, lines);
  return lines;
}

export interface ParaStyle extends TextStyle {
  /** Line height in design px. */
  lh: number;
  maxLines?: number;
}

// Returns the baseline y of the next line.
export function para(p: Page, str: string, x: number, y: number, maxW: number, st: ParaStyle): number {
  let lines = wrap(p, str, maxW, st);
  if (st.maxLines && lines.length > st.maxLines) {
    lines = lines.slice(0, st.maxLines);
    lines[lines.length - 1] = lines[lines.length - 1].replace(/[\s,.;:]*$/, "") + "…";
  }
  lines.forEach((ln, i) => text(p, ln, x, y + i * st.lh, { ...st, upper: false }));
  return y + lines.length * st.lh;
}

// Largest size <= st.size that fits in maxW.
export function fitSize(p: Page, str: string, maxW: number, st: TextStyle): number {
  const w = measure(p, str, st);
  return w <= maxW ? st.size : Math.floor(((st.size * maxW) / w) * 10) / 10;
}

export interface Run {
  str: string;
  st: TextStyle;
}

// Mixed-style runs on one baseline. Returns total width.
export function runs(p: Page, parts: Run[], x: number, y: number, align: "left" | "right" | "center" = "left"): number {
  const widths = parts.map((r) => measure(p, r.str, { ...r.st, align: "left" }));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = align === "left" ? x : align === "right" ? x - total : x - total / 2;
  parts.forEach((r, i) => {
    text(p, r.str, cx, y, { ...r.st, align: "left" });
    cx += widths[i];
  });
  return total;
}

// For placing display type by its top edge.
export function capHeight(p: Page, st: TextStyle, sample = "H"): number {
  applyStyle(p, st);
  return p.ctx.measureText(sample).actualBoundingBoxAscent;
}

// ---------- shapes ----------
export function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, color: string, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Brand mark: circle with the left half filled.
export function brandGlyph(ctx: Ctx, x: number, y: number, r: number, color: string, lw = r * 0.18) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.arc(x, y, r - lw / 2, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, r - lw / 2, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fill();
}

// Dot leader, aligned to x2.
export function leader(ctx: Ctx, x1: number, x2: number, y: number, color: string, gap = 10, r = 1.5) {
  if (x2 - x1 < gap) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  const n = Math.floor((x2 - x1) / gap);
  const start = x2 - n * gap;
  for (let i = 0; i <= n; i++) {
    const cx = start + i * gap;
    ctx.moveTo(cx + r, y);
    ctx.arc(cx, y, r, 0, TAU);
  }
  ctx.fill();
}

export interface ChipStyle extends TextStyle {
  h?: number;
  padX?: number;
  stroke?: string;
  fill?: string;
}

// x is the left edge, y the vertical centre. Returns the width.
export function chip(p: Page, str: string, x: number, y: number, st: ChipStyle): number {
  const h = st.h ?? 36;
  const padX = st.padX ?? 16;
  const w = measure(p, str, st) + padX * 2;
  const { ctx } = p;
  rrect(ctx, x, y - h / 2, w, h, h / 2);
  if (st.fill) {
    ctx.fillStyle = st.fill;
    ctx.fill();
  }
  if (st.stroke) {
    ctx.strokeStyle = st.stroke;
    ctx.lineWidth = 1.25;
    ctx.stroke();
  }
  text(p, str, x + padX, y, { ...st, baseline: "middle", align: "left" });
  return w;
}

// Wraps at maxX. Returns the y centre of the last row.
export function chipRow(p: Page, items: readonly string[], x: number, y: number, maxX: number, st: ChipStyle, gap = 10): number {
  const h = st.h ?? 36;
  let cx = x;
  let cy = y;
  for (const it of items) {
    const w = measure(p, it, st) + (st.padX ?? 16) * 2;
    if (cx > x && cx + w > maxX) {
      cx = x;
      cy += h + gap;
    }
    cx += chip(p, it, cx, cy, st) + gap;
  }
  return cy;
}

// object-fit: cover, with optional corner radius
export function drawCover(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number, r = 0) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  ctx.save();
  if (r > 0) {
    rrect(ctx, x, y, w, h, r);
    ctx.clip();
  }
  ctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, w, h);
  ctx.restore();
}

export function arrow(ctx: Ctx, x: number, y: number, len: number, color: string, lw = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len, y);
  ctx.moveTo(x + len - len * 0.32, y - len * 0.3);
  ctx.lineTo(x + len, y);
  ctx.lineTo(x + len - len * 0.32, y + len * 0.3);
  ctx.stroke();
  ctx.lineCap = "butt";
}

// ---------- polylines ----------
export interface Path {
  pts: Float32Array; // x0,y0,x1,y1,...
  cum: Float32Array; // cumulative length at each point
  length: number;
}

// Cubic Bezier chain [p0, c1, c2, p1, c1, c2, p2, ...] sampled into a polyline.
export function bezierPath(points: readonly (readonly [number, number])[], stepsPer = 40): Path {
  const out: number[] = [];
  for (let i = 0; i + 3 < points.length; i += 3) {
    const [a, b, c, d] = [points[i], points[i + 1], points[i + 2], points[i + 3]];
    for (let k = i === 0 ? 0 : 1; k <= stepsPer; k++) {
      const u = k / stepsPer;
      const v = 1 - u;
      out.push(
        v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0],
        v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1],
      );
    }
  }
  const pts = new Float32Array(out);
  const n = pts.length / 2;
  const cum = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    cum[i] = cum[i - 1] + Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
  }
  return { pts, cum, length: cum[n - 1] };
}

// [x, y, tangent angle] at distance d
export function pointAt(path: Path, d: number): [number, number, number] {
  const { pts, cum, length } = path;
  const n = cum.length;
  const dd = clamp(d, 0, length);
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < dd) lo = mid;
    else hi = mid;
  }
  const seg = cum[hi] - cum[lo] || 1;
  const k = (dd - cum[lo]) / seg;
  const x = lerp(pts[lo * 2], pts[hi * 2], k);
  const y = lerp(pts[lo * 2 + 1], pts[hi * 2 + 1], k);
  return [x, y, Math.atan2(pts[hi * 2 + 1] - pts[lo * 2 + 1], pts[hi * 2] - pts[lo * 2])];
}

// Strokes the path between distances d0 and d1.
export function strokeSpan(ctx: Ctx, path: Path, d0: number, d1: number) {
  const a = clamp(d0, 0, path.length);
  const b = clamp(d1, 0, path.length);
  if (b <= a) return;
  const { pts, cum } = path;
  ctx.beginPath();
  const [sx, sy] = pointAt(path, a);
  ctx.moveTo(sx, sy);
  for (let i = 0; i < cum.length; i++) {
    if (cum[i] <= a) continue;
    if (cum[i] >= b) break;
    ctx.lineTo(pts[i * 2], pts[i * 2 + 1]);
  }
  const [ex, ey] = pointAt(path, b);
  ctx.lineTo(ex, ey);
  ctx.stroke();
}

export function strokePath(ctx: Ctx, path: Path) {
  const { pts } = path;
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.stroke();
}
