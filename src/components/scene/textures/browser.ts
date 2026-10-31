// Browser windows that scroll live-site captures. Shared by the project pages.
import { cached, clamp, easeInOut, easeOut, fitSize, line, rrect, TAU, text, type Ctx, type Page, type TextStyle } from "./draw-utils";

export const BAR_H = 40;

export interface WindowTheme {
  dark: boolean;
  ink: string;
  muted: string;
  win: string;
  bar: string;
  pill: string;
  edge: string;
  shadow: string;
  skeleton: string;
}

export interface Win {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Skeleton page shown until the capture loads.
function placeholder(ctx: Ctx, th: WindowTheme, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = th.skeleton;
  ctx.fillRect(x, y, w, h * 0.42);
  const pad = 18;
  const bar = (bx: number, by: number, bw: number, bh: number) => {
    rrect(ctx, bx, by, bw, bh, bh / 2);
    ctx.fill();
  };
  bar(x + pad, y + h * 0.42 + 24, w * 0.62, 12);
  bar(x + pad, y + h * 0.42 + 46, w * 0.44, 10);
  const cw = (w - pad * 2 - 12) / 2;
  for (let i = 0; i < 2; i++) {
    rrect(ctx, x + pad + i * (cw + 12), y + h * 0.42 + 80, cw, h * 0.3, 8);
    ctx.fill();
  }
}

function lock(ctx: Ctx, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(x, y - 3, 3.6, Math.PI, 0);
  ctx.stroke();
  rrect(ctx, x - 5.5, y - 3, 11, 9, 2);
  ctx.fill();
}

// Frame, toolbar and skeleton. Static, so pages bake it into their cached layer.
export function windowFrame(p: Page, th: WindowTheme, win: Win, domain: string) {
  const { ctx } = p;
  const { x, y, w, h } = win;
  ctx.save();
  ctx.shadowColor = th.shadow;
  ctx.shadowBlur = th.dark ? 46 : 34;
  ctx.shadowOffsetY = th.dark ? 22 : 16;
  rrect(ctx, x, y, w, h, 12);
  ctx.fillStyle = th.win;
  ctx.fill();
  ctx.restore();

  // Toolbar
  ctx.save();
  rrect(ctx, x, y, w, h, 12);
  ctx.clip();
  ctx.fillStyle = th.bar;
  ctx.fillRect(x, y, w, BAR_H);
  ctx.restore();
  line(ctx, x, y + BAR_H, x + w, y + BAR_H, th.edge, 1);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.globalAlpha = th.dark ? 0.85 : 1;
    ctx.beginPath();
    ctx.arc(x + 18 + i * 15, y + BAR_H / 2, 4.6, 0, TAU);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  const px = x + 70;
  const pw = w - 70 - 12;
  rrect(ctx, px, y + 9, pw, BAR_H - 18, (BAR_H - 18) / 2);
  ctx.fillStyle = th.pill;
  ctx.fill();
  lock(ctx, px + 15, y + BAR_H / 2 - 0.5, th.muted);
  const st: TextStyle = { size: 16, family: "mono", color: th.ink, alpha: 0.82, baseline: "middle" };
  text(p, domain, px + 28, y + BAR_H / 2 + 1, { ...st, size: fitSize(p, domain, pw - 40, st) });

  placeholder(ctx, th, x, y + BAR_H, w, h - BAR_H);

  rrect(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 12);
  ctx.strokeStyle = th.edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Capture scaled to the window width once, so frames only blit.
function scaledShot(p: Page, img: HTMLImageElement, w: number) {
  const h = Math.round((w * img.naturalHeight) / img.naturalWidth);
  const c = cached(`shot:${img.src}:${w}`, w, h, p.s, (ctx) => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
  });
  return { c, h };
}

// Wheel-style flicks down the page, a pause, then a smooth return to the top. 0 at rest.
const FLICK = 1.1;
function scrollAt(t: number, max: number, delay: number, step = 80) {
  if (t <= 0 || max <= 0) return 0;
  const n = Math.ceil(max / step);
  const down = n * FLICK;
  const cycle = delay + down + 1.4 + 1.6 + 0.8;
  const ph = t % cycle;
  if (ph < delay) return 0;
  const d = ph - delay;
  if (d < down) {
    const i = Math.floor(d / FLICK);
    return Math.min(max, (i + easeOut((d - i * FLICK) / 0.6)) * step);
  }
  const back = d - down - 1.4;
  return max * (1 - easeInOut(clamp(back / 1.6)));
}

// The capture under the toolbar, scrolled for time t, with a scrollbar.
export function windowShot(p: Page, win: Win, img: HTMLImageElement | null, delay: number, step = 80) {
  if (!img || !img.naturalWidth) return;
  const { ctx, t } = p;
  const vx = win.x;
  const vy = win.y + BAR_H + 1;
  const vw = win.w;
  const vh = win.h - BAR_H - 1;
  const { c, h } = scaledShot(p, img, vw);
  const off = scrollAt(t, h - vh, delay, step);
  ctx.save();
  ctx.beginPath();
  ctx.rect(vx, vy, vw, vh);
  ctx.clip();
  rrect(ctx, win.x, win.y, win.w, win.h, 12);
  ctx.clip();
  // Source rect in the scaled layer's own pixels
  const k = c.width / vw;
  ctx.drawImage(c, 0, off * k, c.width, vh * k, vx, vy, vw, vh);
  ctx.restore();

  // Scrollbar
  const track = vh - 16;
  const thumb = Math.max(36, (track * vh) / h);
  const ty = vy + 8 + (track - thumb) * (off / Math.max(1, h - vh));
  rrect(ctx, vx + vw - 10, ty, 6, thumb, 3);
  ctx.fillStyle = "rgba(0,0,0,0.42)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
