// Spread 4: React client builds (left) and personal products (right).
import { workById, type Work } from "@/content/profile";
import { SPREADS } from "../../book-config";
import {
  cached,
  chipRow,
  clamp,
  easeInOut,
  easeOut,
  fitSize,
  fontKey,
  line,
  measure,
  pad2,
  pageLayer,
  para,
  rrect,
  runs,
  TAU,
  text,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface, type Side } from "../paper";

interface Theme {
  work: Work;
  face: "react-client" | "react-personal";
  side: Side;
  dark: boolean;
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  /** Accent for small type; the light page needs a darker green to read. */
  accentText: string;
  rule: string;
  // Browser window
  win: string;
  bar: string;
  pill: string;
  edge: string;
  shadow: string;
  skeleton: string;
}

const client = workById["react-client"];
const personal = workById["react-personal"];

const CLIENT: Theme = {
  work: client,
  face: "react-client",
  side: "left",
  dark: true,
  bg: client.palette.bg,
  ink: client.palette.ink,
  muted: "rgba(232,238,252,0.72)",
  accent: client.palette.accent,
  accentText: client.palette.accent,
  rule: "rgba(232,238,252,0.14)",
  win: "#121b2d",
  bar: "#18233a",
  pill: "rgba(232,238,252,0.07)",
  edge: "rgba(232,238,252,0.16)",
  shadow: "rgba(0,0,0,0.55)",
  skeleton: "rgba(232,238,252,0.07)",
};

const PERSONAL: Theme = {
  work: personal,
  face: "react-personal",
  side: "right",
  dark: false,
  bg: personal.palette.bg,
  ink: personal.palette.ink,
  muted: "rgba(21,21,19,0.7)",
  accent: personal.palette.accent,
  accentText: "#12803a",
  rule: "rgba(21,21,19,0.16)",
  win: "#ffffff",
  bar: "#f4f2ec",
  pill: "#e9e6de",
  edge: "rgba(21,21,19,0.14)",
  shadow: "rgba(48,38,18,0.2)",
  skeleton: "rgba(21,21,19,0.06)",
};

// Design px. Windows sit on the spine side, copy on the outer side.
const WIN_W = 292;
const WIN_GAP = 24;
const BAR_H = 40;
const COL_W = 440;
const WIN_Y = [[338, 772], [372, 806]] as const;

function layout(th: Theme) {
  const { x0, x1 } = frame(th.side);
  const pair = WIN_W * 2 + WIN_GAP;
  const wx = th.side === "left" ? x1 - pair : x0;
  const cx = th.side === "left" ? x0 : x1 - COL_W;
  const wins = WIN_Y.map(([top, bottom], i) => ({ x: wx + i * (WIN_W + WIN_GAP), y: top, w: WIN_W, h: bottom - top, shot: i }));
  return { x0, x1, col: cx, wins };
}

type Win = ReturnType<typeof layout>["wins"][number];

// Three orbits around a nucleus.
function atom(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string, lw: number, nucleus = true) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (i * Math.PI) / 3, 0, TAU);
    ctx.stroke();
  }
  if (nucleus) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, rx * 0.16, 0, TAU);
    ctx.fill();
  }
}

// Skeleton page shown until the capture loads.
function placeholder(ctx: Ctx, th: Theme, x: number, y: number, w: number, h: number) {
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

function windowFrame(p: Page, th: Theme, win: Win, domain: string) {
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

// Copy, windows and surface. Everything except the scrolling captures.
function staticLayer(p: Page, th: Theme) {
  const keys = (["sans", "serif", "mono"] as const).map((f) => fontKey(p, f)).join("|");
  pageLayer(p, `${th.face}:${keys}`, (ctx) => {
    const page: Page = { ...p, ctx, t: 0 };
    const L = layout(th);
    const last = L.wins[L.wins.length - 1];
    const wcx = (L.wins[0].x + last.x + last.w) / 2;
    surface(page, {
      tone: th.bg,
      side: th.side,
      dark: th.dark,
      key: th.face,
      vignette: th.dark ? 0.42 : 0.06,
      extra: (c) => atom(c, wcx, 572, 420, 158, th.dark ? "rgba(97,218,251,0.07)" : "rgba(22,163,74,0.09)", 1.5, false),
    });
    chrome(page, {
      side: th.side,
      spread: spreadOf(th.face),
      title: SPREADS.find((s) => s.page === spreadOf(th.face))?.label ?? "React projects",
      folio: folioOf(th.face),
      color: th.ink,
      alpha: th.dark ? 0.72 : 0.78,
    });

    const { work } = th;
    // Kind, with a small atom.
    atom(ctx, L.x0 + 13, 157, 13, 5, th.accentText, 1.6);
    text(page, `${work.kind} · ${work.role}`, L.x0 + 38, 164, { size: 20, family: "mono", upper: true, track: 0.12, color: th.accentText });

    // "A · B" title, the second name in italic.
    const names = work.title.split(" · ");
    const title: TextStyle = { size: 124, family: "serif", color: th.ink, track: -0.01 };
    const parts = [
      { str: names[0], st: title },
      { str: "  ·  ", st: { ...title, color: th.accent } },
      { str: names[1], st: { ...title, italic: true } },
    ];
    const full = parts.reduce((n, r) => n + measure(page, r.str, r.st), 0);
    const k = Math.min(1, (L.x1 - L.x0 + 4) / full);
    runs(page, parts.map((r) => ({ str: r.str, st: { ...r.st, size: r.st.size * k } })), L.x0 - 4, 284);

    // Stack chips, right-aligned on the label row.
    const chipSt = {
      size: 18,
      family: "mono" as const,
      color: th.ink,
      stroke: th.dark ? "rgba(232,238,252,0.42)" : "rgba(21,21,19,0.42)",
      h: 36,
      padX: 13,
    };
    const chipsW = work.stack.reduce((n, s) => n + measure(page, s, chipSt) + chipSt.padX * 2 + 8, -8);
    chipRow(page, work.stack, L.x1 - chipsW, 157, L.x1 + 1, chipSt, 8);

    // Copy column
    const cx = L.col;
    let y = 372;
    const body: TextStyle = { size: 23, color: th.ink, track: -0.004 };
    const named = /^([^:]{2,24}):\s+(.*)$/;
    work.highlights.forEach((hl, i) => {
      const m = hl.match(named);
      line(ctx, cx, y - 30, cx + COL_W, y - 30, th.rule);
      text(page, pad2(i + 1), cx, y, { size: 18, family: "mono", color: th.accentText, track: 0.04 });
      if (m) {
        text(page, m[1], cx + 44, y, { size: 18, family: "mono", upper: true, track: 0.1, color: th.ink });
        y = para(page, m[2].charAt(0).toUpperCase() + m[2].slice(1), cx + 44, y + 36, COL_W - 44, { ...body, lh: 32 }) + 42;
      } else {
        y = para(page, hl, cx + 44, y, COL_W - 44, { ...body, lh: 32, color: th.muted }) + 42;
      }
    });

    L.wins.forEach((win) => windowFrame(page, th, win, work.shots?.[win.shot]?.site ?? ""));
  });
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

function liveShots(p: Page, th: Theme) {
  const { ctx, t } = p;
  layout(th).wins.forEach((win, i) => {
    const img = p.shots[win.shot] ?? null;
    if (!img || !img.naturalWidth) return;
    const vx = win.x;
    const vy = win.y + BAR_H + 1;
    const vw = win.w;
    const vh = win.h - BAR_H - 1;
    const { c, h } = scaledShot(p, img, vw);
    // Flicks scale with the window so a wider one takes about as many to reach the bottom.
    const off = scrollAt(t, h - vh, 0.4 + i * 0.55, (80 * vw) / WIN_W);
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
  });
}

function drawSpreadPage(p: Page, th: Theme) {
  staticLayer(p, th);
  liveShots(p, th);
}

export function drawReactClient(p: Page) {
  drawSpreadPage(p, CLIENT);
}

export function drawReactPersonal(p: Page) {
  drawSpreadPage(p, PERSONAL);
}
