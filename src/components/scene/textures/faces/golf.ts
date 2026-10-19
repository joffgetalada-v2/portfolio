// Spread 3: Malbon Golf (left) and Atomic Golf (right).
import { workById } from "@/content/profile";
import {
  cached,
  capHeight,
  chip,
  clamp,
  drawCover,
  drawGlow,
  easeInOut,
  fitSize,
  fontKey,
  lerp,
  line,
  para,
  rrect,
  TAU,
  text,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, frame, surface } from "../paper";

// ---- Malbon ----
const malbon = workById.malbon;
const GREEN = malbon.palette.bg;
const CREAM = malbon.palette.ink;
const ORANGE = malbon.palette.accent;

// Fibonacci sphere, front hemisphere only, as unit vectors.
const DIMPLES: [number, number, number][] = (() => {
  const out: [number, number, number][] = [];
  const n = 420;
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = ga * i;
    const x = Math.cos(th) * rad;
    const z = Math.sin(th) * rad;
    if (z > 0.06) out.push([x, y, z]);
  }
  return out;
})();

// Rolling is a rotation about the view axis, so the cached sprite can just be rotated.
function ballSprite(p: Page, r: number) {
  return cached(`golf-ball:${r}`, r * 2, r * 2, p.s, (ctx) => {
    ctx.beginPath();
    ctx.arc(r, r, r, 0, TAU);
    ctx.fillStyle = "#f6f2e7";
    ctx.fill();
    ctx.clip();
    const dr = r * 0.083;
    for (const [x, y, z] of DIMPLES) {
      ctx.save();
      ctx.translate(r + x * r, r + y * r);
      ctx.rotate(Math.atan2(y, x));
      ctx.fillStyle = "rgba(70,60,35,0.13)";
      ctx.beginPath();
      ctx.ellipse(0, 0, dr * z, dr, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.ellipse(dr * 0.22 * z, 0, dr * 0.62 * z, dr * 0.66, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  });
}

function golfBall(p: Page, cx: number, cy: number, r: number, spin: number) {
  const { ctx } = p;
  // Ground shadow.
  ctx.save();
  ctx.translate(cx + 12, cy + r - 4);
  ctx.scale(1, 0.18);
  drawGlow(p, "0,0,0", 0, 0, r * 1.35, 0.85);
  ctx.restore();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(spin);
  ctx.drawImage(ballSprite(p, r), -r, -r, r * 2, r * 2);
  ctx.restore();

  // Shading stays fixed while the sprite rotates.
  const g = ctx.createRadialGradient(cx - r * 0.38, cy - r * 0.42, r * 0.05, cx, cy, r * 1.02);
  g.addColorStop(0, "rgba(255,255,255,0.6)");
  g.addColorStop(0.45, "rgba(255,255,255,0)");
  g.addColorStop(0.8, "rgba(20,30,20,0.16)");
  g.addColorStop(1, "rgba(10,20,10,0.42)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
}

// Clockwise from 12 o'clock. Baked into a sprite: rotating each glyph every frame misses the glyph cache.
function ringText(p: Page, str: string, cx: number, cy: number, r: number, angle: number, st: TextStyle) {
  const { ctx } = p;
  const box = r + st.size;
  const sprite = cached(`ring:${str}:${r}:${st.size}:${fontKey(p, st.family ?? "sans")}`, box * 2, box * 2, p.s, (c) => {
    const page: Page = { ...p, ctx: c };
    const chars = [...str];
    const step = TAU / chars.length;
    chars.forEach((ch, i) => {
      const a = i * step;
      c.save();
      c.translate(box + Math.sin(a) * r, box - Math.cos(a) * r);
      c.rotate(a);
      text(page, ch, 0, 0, { ...st, align: "center", baseline: "middle", track: 0, alpha: 1 });
      c.restore();
    });
  });
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const a = ctx.globalAlpha;
  ctx.globalAlpha = a * (st.alpha ?? 1);
  ctx.drawImage(sprite, -box, -box, box * 2, box * 2);
  ctx.globalAlpha = a;
  ctx.restore();
}

function flag(ctx: Ctx, px: number, top: number, bottom: number, t: number) {
  // Pin and hole.
  ctx.fillStyle = "#0d1f16";
  ctx.beginPath();
  ctx.ellipse(px, bottom, 36, 9, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(px, top - 6);
  ctx.lineTo(px, bottom);
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.beginPath();
  ctx.arc(px, top - 8, 5, 0, TAU);
  ctx.fill();

  // Cloth: strips with a travelling sine wave, shaded by slope.
  const L = 168;
  const FH = 96;
  const n = 18;
  const wave = (u: number) => Math.sin(u * 3.4 - t * 4.4) * 10 * u;
  const slope = (u: number) => Math.cos(u * 3.4 - t * 4.4) * u;
  for (let i = 0; i < n; i++) {
    const u0 = i / n;
    const u1 = (i + 1) / n;
    const xa = px - 2 - u0 * L;
    const xb = px - 2 - u1 * L - 0.6;
    const ya = top + wave(u0);
    const yb = top + wave(u1);
    const ha = FH * (1 - u0 * 0.14);
    const hb = FH * (1 - u1 * 0.14);
    ctx.fillStyle = ORANGE;
    ctx.beginPath();
    ctx.moveTo(xa, ya);
    ctx.lineTo(xb, yb);
    ctx.lineTo(xb, yb + hb);
    ctx.lineTo(xa, ya + ha);
    ctx.closePath();
    ctx.fill();
    const sh = slope((u0 + u1) / 2);
    ctx.fillStyle = sh > 0 ? `rgba(0,0,0,${sh * 0.22})` : `rgba(255,255,255,${-sh * 0.12})`;
    ctx.fill();
  }
}

export function drawMalbon(p: Page) {
  const { ctx, t } = p;
  surface(p, {
    tone: GREEN,
    side: "left",
    dark: true,
    key: "malbon",
    vignette: 0.4,
    extra: (c) => {
      // Mowing stripes.
      c.save();
      c.translate(640, 440);
      c.rotate(-0.42);
      for (let i = -12; i < 12; i += 2) {
        c.fillStyle = "rgba(255,255,255,0.028)";
        c.fillRect(i * 92, -1200, 92, 2400);
      }
      c.restore();
    },
  });
  chrome(p, { side: "left", spread: 3, title: "Malbon Golf", folio: 5, color: CREAM, alpha: 0.75 });
  const { x0, x1 } = frame("left");

  const title: TextStyle = { size: 260, family: "display", color: CREAM, track: 0.005 };
  title.size = fitSize(p, "MALBON GOLF", x1 - x0 + 6, title);
  const tBase = 128 + capHeight(p, title);
  text(p, "MALBON GOLF", x0 - 3, tBase, title);
  text(p, "Buckets Club", x0, tBase + 112, { size: 104, family: "serif", italic: true, color: ORANGE });

  const ballX = 838;
  const ballY = 640;
  const ballR = 112;
  if (p.image) {
    drawCover(ctx, p.image, 640, tBase + 60, x1 - 640, 790 - tBase - 60, 14);
  } else {
    flag(ctx, 1084, 372, 792, t);
    const roll = Math.sin(t * 1.1) * 28;
    ringText(p, "BUCKETS CLUB · SHOPIFY PLUS · MALBON GOLF · ", ballX, ballY, ballR + 46, -t * 0.12 - 0.35, {
      size: 18,
      family: "mono",
      color: CREAM,
      alpha: 0.8,
    });
    golfBall(p, ballX + roll, ballY, ballR, roll / ballR);
  }

  let y = tBase + 182;
  chip(p, malbon.platform, x0, y, { size: 20, family: "mono", upper: true, track: 0.1, color: CREAM, stroke: "rgba(242,237,224,0.6)", h: 40 });
  y += 70;
  const body: TextStyle = { size: 24, color: CREAM, track: -0.005 };
  malbon.highlights.forEach((hl, i) => {
    text(p, String(i + 1).padStart(2, "0"), x0, y, { size: 19, family: "mono", color: ORANGE });
    y = para(p, hl, x0 + 46, y, 480, { ...body, lh: 32 }) + 12;
  });
}

// ---- Atomic ----
const atomic = workById.atomic;
const BONE = atomic.palette.bg;
const INK = atomic.palette.ink;
const FLAME = atomic.palette.accent;

type BlockKind = "hero" | "media-text" | "product-grid" | "banner" | "newsletter";
const BLOCKS: { kind: BlockKind; h: number; w: number; dx: number }[] = [
  { kind: "hero", h: 68, w: 220, dx: 0 },
  { kind: "media-text", h: 46, w: 184, dx: 30 },
  { kind: "product-grid", h: 58, w: 206, dx: 10 },
  { kind: "banner", h: 38, w: 164, dx: 44 },
  { kind: "newsletter", h: 46, w: 190, dx: 18 },
];

function blockContent(ctx: Ctx, kind: BlockKind, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  const pad = 9;
  const ix = x + pad;
  const iy = y + pad;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  switch (kind) {
    case "hero":
      ctx.globalAlpha = 0.18;
      ctx.fillRect(ix, iy, iw, ih);
      ctx.globalAlpha = 0.9;
      ctx.fillRect(ix + 10, iy + ih - 26, iw * 0.5, 7);
      ctx.fillRect(ix + 10, iy + ih - 13, iw * 0.3, 4);
      break;
    case "media-text":
      ctx.globalAlpha = 0.25;
      ctx.fillRect(ix, iy, ih * 1.3, ih);
      ctx.globalAlpha = 0.7;
      ctx.fillRect(ix + ih * 1.3 + 10, iy + 4, iw * 0.42, 5);
      ctx.fillRect(ix + ih * 1.3 + 10, iy + 15, iw * 0.3, 4);
      ctx.fillRect(ix + ih * 1.3 + 10, iy + 24, iw * 0.36, 4);
      break;
    case "product-grid": {
      const n = 4;
      const gw = (iw - (n - 1) * 6) / n;
      for (let i = 0; i < n; i++) {
        ctx.globalAlpha = 0.25;
        ctx.fillRect(ix + i * (gw + 6), iy, gw, ih - 12);
        ctx.globalAlpha = 0.7;
        ctx.fillRect(ix + i * (gw + 6), iy + ih - 6, gw * 0.7, 4);
      }
      break;
    }
    case "banner":
      ctx.globalAlpha = 0.8;
      ctx.fillRect(ix, y + h / 2 - 3, iw * 0.62, 6);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(ix + iw * 0.7, y + h / 2 - 7, iw * 0.3, 14);
      break;
    case "newsletter":
      ctx.globalAlpha = 0.7;
      ctx.fillRect(ix, iy + 2, iw * 0.5, 5);
      ctx.globalAlpha = 0.22;
      ctx.fillRect(ix, iy + ih - 14, iw * 0.66, 14);
      ctx.globalAlpha = 0.85;
      ctx.fillRect(ix + iw * 0.7, iy + ih - 14, iw * 0.3, 14);
      break;
  }
  ctx.globalAlpha = 1;
}

function migrationDiagram(p: Page, x: number, y: number, w: number, h: number) {
  const { ctx, t } = p;
  rrect(ctx, x, y, w, h, 18);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();
  ctx.strokeStyle = "rgba(17,17,17,0.14)";
  ctx.lineWidth = 1;
  ctx.stroke();

  const colW = 232;
  const lx = x + 28;
  const rx = x + w - 28 - colW;
  const head: TextStyle = { size: 20, family: "mono", upper: true, track: 0.12, color: INK };
  text(p, "Framer", lx, y + 46, head);
  text(p, "Shopify", rx, y + 46, head);
  text(p, "Marketing pages", lx, y + 74, { ...head, size: 18, upper: false, track: 0, color: "rgba(17,17,17,0.68)" });
  text(p, "Liquid sections", rx, y + 74, { ...head, size: 18, upper: false, track: 0, color: FLAME });
  line(ctx, lx, y + 92, lx + colW, y + 92, "rgba(17,17,17,0.14)");
  line(ctx, rx, y + 92, rx + colW, y + 92, "rgba(17,17,17,0.14)");

  // Freeform frames on the left, uniform section stack on the right.
  const top = y + 106;
  const left: { x: number; y: number; w: number; h: number }[] = [];
  const right: { x: number; y: number; w: number; h: number }[] = [];
  let ly = top;
  let ry = top;
  BLOCKS.forEach((b) => {
    left.push({ x: lx + b.dx, y: ly, w: b.w, h: b.h });
    ly += b.h + 10;
    right.push({ x: rx, y: ry, w: colW, h: 42 });
    ry += 52;
  });

  // Arrow between the columns.
  const mx0 = lx + colW + 16;
  const mx1 = rx - 16;
  const my = top + (ry - top) / 2 - 6;
  ctx.setLineDash([3, 7]);
  line(ctx, mx0, my, mx1, my, "rgba(17,17,17,0.35)", 1.5);
  ctx.setLineDash([]);
  ctx.fillStyle = FLAME;
  ctx.beginPath();
  ctx.moveTo(mx1 + 2, my);
  ctx.lineTo(mx1 - 8, my - 6);
  ctx.lineTo(mx1 - 8, my + 6);
  ctx.closePath();
  ctx.fill();

  // Cycle: clear 0.5s, one copy per block every T, hold 1.4s. Rest frame has every section built.
  const T = 0.9;
  const cycle = 0.5 + BLOCKS.length * T + 1.4;
  const ph = t > 0 ? t % cycle : cycle;
  const clearK = ph < 0.5 ? easeInOut(ph / 0.5) : 1;
  const m = ph < 0.5 ? -1 : (ph - 0.5) / T;

  BLOCKS.forEach((b, i) => {
    const L = left[i];
    const R = right[i];
    const moving = ph >= 0.5 && i === Math.floor(m);
    const built = ph < 0.5 || i < Math.floor(m);
    const k = moving ? easeInOut(clamp((m - i) / 0.85)) : 0;

    // Source frame, highlighted while it's copied.
    rrect(ctx, L.x, L.y, L.w, L.h, 8);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = moving ? FLAME : "rgba(17,17,17,0.35)";
    ctx.lineWidth = moving ? 2 : 1;
    ctx.stroke();
    blockContent(ctx, b.kind, L.x, L.y, L.w, L.h, INK);

    // Empty slot.
    ctx.setLineDash([4, 5]);
    rrect(ctx, R.x, R.y, R.w, R.h, 8);
    ctx.strokeStyle = "rgba(17,17,17,0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Built section.
    const alpha = built ? (ph < 0.5 ? 1 - clearK : 1) : 0;
    if (alpha > 0) {
      ctx.globalAlpha = alpha;
      rrect(ctx, R.x, R.y, R.w, R.h, 8);
      ctx.fillStyle = INK;
      ctx.fill();
      ctx.fillStyle = FLAME;
      ctx.fillRect(R.x + 14, R.y + R.h / 2 - 5, 10, 10);
      text(p, `${b.kind}.liquid`, R.x + 32, R.y + R.h / 2 + 1, { size: 16, family: "mono", color: BONE, baseline: "middle" });
      ctx.globalAlpha = 1;
    }

    if (moving) {
      const bx = lerp(L.x, R.x, k);
      const by = lerp(L.y, R.y, k) - Math.sin(k * Math.PI) * 40;
      const bw = lerp(L.w, R.w, k);
      const bh = lerp(L.h, R.h, k);
      rrect(ctx, bx + 6, by + 10, bw, bh, 8);
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fill();
      rrect(ctx, bx, by, bw, bh, 8);
      ctx.fillStyle = k > 0.55 ? INK : "#ffffff";
      ctx.fill();
      ctx.strokeStyle = FLAME;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (k <= 0.55) blockContent(ctx, b.kind, bx, by, bw, bh, INK);
      else {
        ctx.fillStyle = FLAME;
        ctx.fillRect(bx + 14, by + bh / 2 - 5, 10, 10);
      }
    }
  });

  text(p, "Illustrative sketch", rx, ry + 20, { size: 18, family: "mono", color: "rgba(17,17,17,0.68)" });
}

export function drawAtomic(p: Page) {
  const { ctx } = p;
  surface(p, { tone: BONE, side: "right" });
  chrome(p, { side: "right", spread: 3, title: "Atomic Golf", folio: 6, color: INK, alpha: 0.75 });
  const { x0, x1 } = frame("right");

  const title: TextStyle = { size: 260, family: "display", color: INK, track: 0.005 };
  title.size = fitSize(p, "ATOMIC GOLF", x1 - x0 + 6, title);
  const tBase = 128 + capHeight(p, title);
  const aw = text(p, "ATOMIC ", x0 - 3, tBase, title);
  text(p, "GOLF", x0 - 3 + aw, tBase, { ...title, color: FLAME });

  const colW = 430;
  let y = tBase + 84;
  y = para(p, atomic.summary, x0, y, colW, { size: 34, family: "serif", lh: 40, color: INK });
  y += 24;
  chip(p, atomic.platform, x0, y, { size: 20, family: "mono", upper: true, track: 0.1, color: INK, stroke: "rgba(17,17,17,0.5)", h: 40 });
  y += 64;
  const body: TextStyle = { size: 22, color: INK, track: -0.004 };
  atomic.highlights.forEach((hl, i) => {
    text(p, String(i + 1).padStart(2, "0"), x0, y, { size: 19, family: "mono", color: FLAME });
    y = para(p, hl, x0 + 44, y, colW - 44, { ...body, lh: 30 }) + 10;
  });

  const dx = x0 + colW + 60;
  const dy = tBase + 52;
  if (p.image) drawCover(ctx, p.image, dx, dy, x1 - dx, 792 - dy, 18);
  else migrationDiagram(p, dx, dy, x1 - dx, 792 - dy);
}
