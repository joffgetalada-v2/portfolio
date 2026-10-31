// Spread 5: React client builds (left) and personal products (right).
import { workById, type Work } from "@/content/profile";
import { SPREADS } from "../../book-config";
import { windowFrame, windowShot, type WindowTheme } from "../browser";
import { chipRow, fontKey, line, measure, pad2, pageLayer, para, runs, TAU, text, type Ctx, type Page, type TextStyle } from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface, type Side } from "../paper";

interface Theme extends WindowTheme {
  work: Work;
  face: "react-client" | "react-personal";
  side: Side;
  bg: string;
  accent: string;
  /** Accent for small type; the light page needs a darker green to read. */
  accentText: string;
  rule: string;
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

function liveShots(p: Page, th: Theme) {
  layout(th).wins.forEach((win, i) => {
    // Flicks scale with the window so a wider one takes about as many to reach the bottom.
    windowShot(p, win, p.shots[win.shot] ?? null, 0.4 + i * 0.55, (80 * win.w) / WIN_W);
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
