// Spread 2, right page: Atomic Golf. Gameology faces it.
import { workById } from "@/content/profile";
import {
  capHeight,
  chip,
  clamp,
  drawCover,
  easeInOut,
  fitSize,
  lerp,
  line,
  para,
  rrect,
  text,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface } from "../paper";

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
  chrome(p, { side: "right", spread: spreadOf("atomic"), title: "Atomic Golf", folio: folioOf("atomic"), color: INK, alpha: 0.75 });
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
