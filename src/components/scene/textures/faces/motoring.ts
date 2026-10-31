// Spread 4: Dash Cams R Us (left) and City Mazda (right). Live store windows meet at the spine,
// copy sits on the outer side above a scene: a night drive through a dash cam, and a showroom.
import { workById, type Work } from "@/content/profile";
import { windowFrame, windowShot, type Win, type WindowTheme } from "../browser";
import {
  cached,
  capHeight,
  chipRow,
  clamp,
  drawGlow,
  fitSize,
  fontKey,
  fract,
  line,
  measure,
  pad2,
  pageLayer,
  para,
  rng,
  rrect,
  TAU,
  text,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface, type Side } from "../paper";

interface Theme extends WindowTheme {
  face: "dashcamsrus" | "city-mazda";
  work: Work;
  side: Side;
  bg: string;
  accent: string;
  rule: string;
  chip: string;
  /** Title split; the second part is in the accent. */
  title: readonly [string, string];
}

const dash = workById.dashcamsrus;
const mazda = workById["city-mazda"];

const DASH: Theme = {
  face: "dashcamsrus",
  work: dash,
  side: "left",
  dark: true,
  bg: dash.palette.bg,
  ink: dash.palette.ink,
  accent: dash.palette.accent,
  muted: "rgba(244,247,245,0.72)",
  rule: "rgba(244,247,245,0.14)",
  chip: "rgba(244,247,245,0.42)",
  title: ["DASH CAMS", " R US"],
  win: "#141716",
  bar: "#1b1f1d",
  pill: "rgba(244,247,245,0.07)",
  edge: "rgba(244,247,245,0.16)",
  shadow: "rgba(0,0,0,0.6)",
  skeleton: "rgba(244,247,245,0.07)",
};

const MAZDA: Theme = {
  face: "city-mazda",
  work: mazda,
  side: "right",
  dark: false,
  bg: mazda.palette.bg,
  ink: mazda.palette.ink,
  accent: mazda.palette.accent,
  muted: "rgba(25,25,25,0.7)",
  rule: "rgba(25,25,25,0.16)",
  chip: "rgba(25,25,25,0.42)",
  title: ["CITY ", "MAZDA"],
  win: "#ffffff",
  bar: "#efefef",
  pill: "#e4e4e4",
  edge: "rgba(25,25,25,0.14)",
  shadow: "rgba(30,30,30,0.22)",
  skeleton: "rgba(25,25,25,0.06)",
};

// Design px.
const WIN_W = 372;
const GAP = 56;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function layout(side: Side) {
  const { x0, x1 } = frame(side);
  const win: Win = { x: side === "left" ? x1 - WIN_W : x0, y: 150, w: WIN_W, h: 640 };
  const col = side === "left" ? { x0, x1: win.x - GAP } : { x0: win.x + WIN_W + GAP, x1 };
  const panel: Box = { x: col.x0, y: 532, w: col.x1 - col.x0, h: 256 };
  return { win, col, panel };
}

const DASH_L = layout("left");
const MAZDA_L = layout("right");

function copy(page: Page, th: Theme, col: { x0: number; x1: number }) {
  const { ctx } = page;
  const { work } = th;
  const { x0, x1 } = col;
  text(page, work.kind, x0, 164, { size: 20, family: "mono", upper: true, track: 0.12, color: th.accent });
  const chipSt = { size: 18, family: "mono" as const, color: th.ink, stroke: th.chip, h: 36, padX: 13 };
  const chipsW = work.stack.reduce((n, s) => n + measure(page, s, chipSt) + chipSt.padX * 2 + 8, -8);
  chipRow(page, work.stack, x1 - chipsW, 157, x1 + 1, chipSt, 8);

  const [a, b] = th.title;
  const base: TextStyle = { size: 124, family: "display", color: th.ink, track: 0.005 };
  const title = { ...base, size: Math.min(124, fitSize(page, a + b, x1 - x0 + 6, base)) };
  const tBase = 198 + capHeight(page, title);
  const aw = text(page, a, x0 - 3, tBase, title);
  text(page, b, x0 - 3 + aw, tBase, { ...title, color: th.accent });

  let y = para(page, work.summary, x0, tBase + 64, x1 - x0, { size: 32, family: "serif", lh: 38, color: th.ink });
  y += 46;
  line(ctx, x0, y - 32, x1, y - 32, th.rule);
  work.highlights.forEach((hl, i) => {
    text(page, pad2(i + 1), x0, y, { size: 18, family: "mono", color: th.accent, track: 0.04 });
    y = para(page, hl, x0 + 44, y, x1 - x0 - 44, { size: 22, lh: 30, color: th.ink, track: -0.004 }) + 6;
  });
}

function panelShell(ctx: Ctx, b: Box, th: Theme) {
  ctx.save();
  ctx.shadowColor = th.shadow;
  ctx.shadowBlur = th.dark ? 40 : 30;
  ctx.shadowOffsetY = th.dark ? 18 : 12;
  rrect(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.fillStyle = th.dark ? "#000000" : "#e9e8e5";
  ctx.fill();
  ctx.restore();
}

function panelEdge(ctx: Ctx, b: Box, color: string) {
  rrect(ctx, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 16);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function staticLayer(p: Page, th: Theme, L: ReturnType<typeof layout>, scene: (ctx: Ctx, b: Box) => void) {
  const keys = (["sans", "serif", "mono", "display"] as const).map((f) => fontKey(p, f)).join("|");
  pageLayer(p, `${th.face}:${keys}`, (ctx) => {
    const page: Page = { ...p, ctx, t: 0 };
    surface(page, { tone: th.bg, side: th.side, dark: th.dark, key: th.face, vignette: th.dark ? 0.4 : 0.06 });
    chrome(page, {
      side: th.side,
      spread: spreadOf(th.face),
      title: th.work.title,
      folio: folioOf(th.face),
      color: th.ink,
      alpha: th.dark ? 0.72 : 0.78,
    });
    copy(page, th, L.col);
    panelShell(ctx, L.panel, th);
    ctx.save();
    rrect(ctx, L.panel.x, L.panel.y, L.panel.w, L.panel.h, 16);
    ctx.clip();
    ctx.drawImage(cached(`${th.face}-scene`, L.panel.w, L.panel.h, p.s, (c) => scene(c, { x: 0, y: 0, w: L.panel.w, h: L.panel.h })), L.panel.x, L.panel.y, L.panel.w, L.panel.h);
    ctx.restore();
    windowFrame(page, th, L.win, th.work.shots?.[0]?.site ?? "");
  });
}

// ---- Dash Cams R Us: night drive ----
// Camera in the left lane (Australia drives on the left). World units: lanes 3.5 wide, camera 1.2 up.
const ROAD = { hz: 0.42, s: 0.27, speed: 7 };

function roadMap(b: Box) {
  const hz = b.y + b.h * ROAD.hz;
  const vx = b.x + b.w * 0.5;
  const S = b.w * ROAD.s;
  const ground = b.y + b.h - hz;
  // Screen point for world (X, height Y) at distance d.
  return {
    hz,
    vx,
    x: (X: number, d: number) => vx + (X * S) / d,
    y: (Y: number, d: number) => hz + (ground * (1 - Y / 1.2)) / d,
  };
}

function nightStatic(ctx: Ctx, b: Box) {
  const m = roadMap(b);
  const sky = ctx.createLinearGradient(0, b.y, 0, m.hz);
  sky.addColorStop(0, "#020403");
  sky.addColorStop(1, "#0c1a15");
  ctx.fillStyle = sky;
  ctx.fillRect(b.x, b.y, b.w, m.hz - b.y);
  const r = rng(41);
  // Stars.
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.35})`;
    ctx.fillRect(b.x + r() * b.w, b.y + r() * (m.hz - b.y) * 0.7, 1.4, 1.4);
  }
  // Skyline with a few lit windows.
  let x = b.x - 10;
  while (x < b.x + b.w) {
    const bw = 22 + r() * 46;
    const bh = 10 + r() * (r() > 0.8 ? 64 : 34);
    ctx.fillStyle = "#050807";
    ctx.fillRect(x, m.hz - bh, bw, bh);
    for (let wy = m.hz - bh + 6; wy < m.hz - 6; wy += 8) {
      for (let wx = x + 4; wx < x + bw - 5; wx += 7) {
        if (r() > 0.82) {
          ctx.fillStyle = `rgba(255,214,140,${0.25 + r() * 0.45})`;
          ctx.fillRect(wx, wy, 2.4, 3);
        }
      }
    }
    x += bw + 2;
  }
  // Verge and road.
  const ground = ctx.createLinearGradient(0, m.hz, 0, b.y + b.h);
  ground.addColorStop(0, "#050706");
  ground.addColorStop(1, "#0b0e0d");
  ctx.fillStyle = ground;
  ctx.fillRect(b.x, m.hz, b.w, b.y + b.h - m.hz);
  const bottom = b.y + b.h;
  const road = ctx.createLinearGradient(0, m.hz, 0, bottom);
  road.addColorStop(0, "#151a18");
  road.addColorStop(1, "#222826");
  ctx.fillStyle = road;
  ctx.beginPath();
  ctx.moveTo(m.vx, m.hz);
  ctx.lineTo(m.x(-2.2, 1), bottom);
  ctx.lineTo(m.x(6, 1), bottom);
  ctx.closePath();
  ctx.fill();
  // Edge lines, tapered.
  for (const X of [-1.75, 5.25]) {
    ctx.fillStyle = "rgba(235,240,236,0.55)";
    ctx.beginPath();
    ctx.moveTo(m.vx, m.hz);
    ctx.lineTo(m.x(X - 0.07, 1), bottom);
    ctx.lineTo(m.x(X + 0.07, 1), bottom);
    ctx.closePath();
    ctx.fill();
  }
  // Glow over the city.
  const glow = ctx.createRadialGradient(m.vx, m.hz, 4, m.vx, m.hz, b.w * 0.45);
  glow.addColorStop(0, "rgba(36,255,79,0.07)");
  glow.addColorStop(1, "rgba(36,255,79,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(b.x, b.y, b.w, b.h);
}

function nightDrive(p: Page, b: Box) {
  const { ctx, t } = p;
  const m = roadMap(b);
  const travel = t * ROAD.speed;
  ctx.save();
  rrect(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.clip();

  // Car ahead in our lane.
  const dc = 9 + Math.sin(t * 0.5) * 0.7;
  const cl = m.x(-0.9, dc);
  const cr = m.x(0.9, dc);
  const ct = m.y(1.45, dc);
  const cb = m.y(0.15, dc);
  ctx.fillStyle = "#020303";
  rrect(ctx, cl, ct, cr - cl, cb - ct, 4);
  ctx.fill();
  for (const X of [-0.68, 0.68]) {
    const lx = m.x(X, dc);
    const ly = m.y(0.8, dc);
    drawGlow(p, "255,40,40", lx, ly, 16, 0.9);
    ctx.fillStyle = "#ff5a4f";
    ctx.fillRect(lx - 3.5, ly - 1.5, 7, 3);
  }

  // Street lights on both verges, far to near.
  const gap = 9;
  for (let k = 9; k >= 0; k--) {
    const d = 0.7 + k * gap - (travel % gap);
    if (d < 0.5) continue;
    for (const X of [-3.4, 7.2]) {
      const px = m.x(X, d);
      const base = m.y(0, d);
      const top = m.y(3.6, d);
      const lw = Math.max(1, 5 / d);
      ctx.fillStyle = "#2c3431";
      ctx.fillRect(px - lw / 2, top, lw, base - top);
      const hx = m.x(X + (X < 0 ? 1.1 : -1.1), d);
      ctx.strokeStyle = "#2c3431";
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
      ctx.moveTo(px, top);
      ctx.lineTo(hx, top);
      ctx.stroke();
      drawGlow(p, "255,196,120", hx, top + lw, Math.min(90, 70 / d + 6), clamp(0.9 - d / 90));
    }
  }

  // Centre line dashes rushing in.
  const period = 4;
  for (let k = 24; k >= 0; k--) {
    const d0 = 0.6 + k * period - (travel % period);
    const d1 = d0 + 1.8;
    if (d0 < 0.4) continue;
    const yn = m.y(0, d0);
    const yf = m.y(0, d1);
    ctx.fillStyle = `rgba(240,242,236,${clamp(0.95 - d0 / 120)})`;
    ctx.beginPath();
    ctx.moveTo(m.x(1.68, d0), yn);
    ctx.lineTo(m.x(1.82, d0), yn);
    ctx.lineTo(m.x(1.82, d1), yf);
    ctx.lineTo(m.x(1.68, d1), yf);
    ctx.closePath();
    ctx.fill();
  }

  // Bonnet.
  const bottom = b.y + b.h;
  ctx.fillStyle = "#030404";
  ctx.beginPath();
  ctx.moveTo(b.x, bottom);
  ctx.lineTo(b.x, bottom - 16);
  ctx.quadraticCurveTo(b.x + b.w * 0.5, bottom - 40, b.x + b.w, bottom - 16);
  ctx.lineTo(b.x + b.w, bottom);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(b.x, bottom - 16);
  ctx.quadraticCurveTo(b.x + b.w * 0.5, bottom - 40, b.x + b.w, bottom - 16);
  ctx.stroke();
  ctx.restore();
}

function bracket(ctx: Ctx, x: number, y: number, dx: number, dy: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(x, y + dy * 24);
  ctx.lineTo(x, y);
  ctx.lineTo(x + dx * 24, y);
  ctx.stroke();
  ctx.lineCap = "butt";
}

// Recording overlay. The clock runs on from a mid-drive time while hovered.
function hud(p: Page, b: Box) {
  const { ctx, t } = p;
  const i = 16;
  const x0 = b.x + i;
  const y0 = b.y + i;
  const x1 = b.x + b.w - i;
  const y1 = b.y + b.h - i;
  bracket(ctx, x0, y0, 1, 1, DASH.accent);
  bracket(ctx, x1, y0, -1, 1, DASH.accent);
  bracket(ctx, x0, y1, 1, -1, DASH.accent);
  bracket(ctx, x1, y1, -1, -1, DASH.accent);

  const label: TextStyle = { size: 18, family: "mono", track: 0.08, color: DASH.ink };
  const on = t <= 0 || fract(t) < 0.6;
  ctx.fillStyle = "#ff3b30";
  ctx.globalAlpha = on ? 1 : 0.25;
  ctx.beginPath();
  ctx.arc(x0 + 22, y0 + 24, 6, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
  text(p, "REC", x0 + 36, y0 + 30, label);

  const secs = 12 * 60 + 48 + Math.floor(Math.max(0, t));
  const clock = `00:${pad2(Math.floor(secs / 60) % 60)}:${pad2(secs % 60)}`;
  text(p, clock, x1 - 12, y0 + 30, { ...label, align: "right" });

  const kmh = 60 + Math.round(Math.sin(t * 0.6) * 2);
  text(p, `${kmh} KM/H`, x0 + 12, y1 - 14, { ...label, color: DASH.accent });
  const gw = text(p, "GPS", x1 - 12, y1 - 14, { ...label, align: "right" });
  ctx.fillStyle = DASH.accent;
  ctx.beginPath();
  ctx.arc(x1 - 12 - gw - 12, y1 - 20, 4, 0, TAU);
  ctx.fill();
}

export function drawDashcams(p: Page) {
  const L = DASH_L;
  staticLayer(p, DASH, L, nightStatic);
  nightDrive(p, L.panel);
  hud(p, L.panel);
  panelEdge(p.ctx, L.panel, "rgba(244,247,245,0.16)");
  windowShot(p, L.win, p.shots[0] ?? null, 0.4);
}

// ---- City Mazda: showroom ----
const FLOOR = 0.58;

function showroomStatic(ctx: Ctx, b: Box) {
  const fy = b.y + b.h * FLOOR;
  const wall = ctx.createLinearGradient(0, b.y, 0, fy);
  wall.addColorStop(0, "#dedcd8");
  wall.addColorStop(1, "#f0efec");
  ctx.fillStyle = wall;
  ctx.fillRect(b.x, b.y, b.w, fy - b.y);
  // Glazing.
  ctx.strokeStyle = "rgba(25,25,25,0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = b.x + 42; x < b.x + b.w; x += 96) {
    ctx.moveTo(x, b.y + 56);
    ctx.lineTo(x, fy);
  }
  ctx.moveTo(b.x, b.y + 56);
  ctx.lineTo(b.x + b.w, b.y + 56);
  ctx.stroke();
  const floor = ctx.createLinearGradient(0, fy, 0, b.y + b.h);
  floor.addColorStop(0, "#d3d1cc");
  floor.addColorStop(1, "#c3c0ba");
  ctx.fillStyle = floor;
  ctx.fillRect(b.x, fy, b.w, b.y + b.h - fy);
  line(ctx, b.x, fy, b.x + b.w, fy, "rgba(25,25,25,0.18)", 1.5);
  // Tile seams towards a point above the wall.
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  const vx = b.x + b.w / 2;
  ctx.beginPath();
  for (let i = -8; i <= 8; i++) {
    ctx.moveTo(vx + i * 40, fy);
    ctx.lineTo(vx + i * 150, b.y + b.h);
  }
  ctx.stroke();
}

const SPOTS = [0.22, 0.5, 0.78];

function spotlights(p: Page, b: Box) {
  const { ctx, t } = p;
  const fy = b.y + b.h * FLOOR;
  SPOTS.forEach((u, i) => {
    const sx = b.x + b.w * u;
    const sway = t > 0 ? Math.sin(t * 0.8 + i * 1.7) * 0.07 : 0;
    const len = fy + 52 - b.y;
    const ex = sx + Math.tan(sway) * len;
    const g = ctx.createLinearGradient(0, b.y, 0, b.y + len);
    g.addColorStop(0, "rgba(255,252,240,0.85)");
    g.addColorStop(1, "rgba(255,252,240,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(sx - 9, b.y + 10);
    ctx.lineTo(sx + 9, b.y + 10);
    ctx.lineTo(ex + 90, b.y + len);
    ctx.lineTo(ex - 90, b.y + len);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#2a2a2a";
    rrect(ctx, sx - 12, b.y - 4, 24, 16, 5);
    ctx.fill();
  });
}

function turntable(p: Page, cx: number, cy: number, rx: number, ry: number) {
  const { ctx, t } = p;
  ctx.fillStyle = "#9d9a94";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 9, rx, ry, 0, 0, TAU);
  ctx.fill();
  const g = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  g.addColorStop(0, "#f2f1ee");
  g.addColorStop(1, "#d8d6d1");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "rgba(25,25,25,0.2)";
  ctx.lineWidth = 1;
  ctx.stroke();
  // Marks on the deck turn with it.
  const n = 28;
  const spin = t * 0.35;
  ctx.fillStyle = MAZDA.accent;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + spin;
    const depth = Math.sin(a);
    ctx.globalAlpha = 0.25 + 0.55 * (depth * 0.5 + 0.5);
    const x = cx + Math.cos(a) * (rx - 16);
    const y = cy + depth * (ry - 5);
    ctx.beginPath();
    ctx.ellipse(x, y, 5 * (0.6 + 0.4 * Math.abs(Math.sin(a))), 1.8, 0, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Side view facing the spine. (ox, oy) is the front bumper at ground level, L the length.
function carBody(ctx: Ctx, ox: number, oy: number, L: number) {
  const P = (x: number, y: number): [number, number] => [ox + x * L, oy + y * L];
  ctx.beginPath();
  ctx.moveTo(...P(0.015, -0.085));
  ctx.bezierCurveTo(...P(-0.006, -0.12), ...P(-0.002, -0.19), ...P(0.03, -0.215));
  ctx.bezierCurveTo(...P(0.12, -0.24), ...P(0.25, -0.255), ...P(0.335, -0.272));
  ctx.bezierCurveTo(...P(0.39, -0.33), ...P(0.43, -0.366), ...P(0.5, -0.373));
  ctx.bezierCurveTo(...P(0.6, -0.382), ...P(0.7, -0.377), ...P(0.76, -0.362));
  ctx.bezierCurveTo(...P(0.84, -0.342), ...P(0.9, -0.31), ...P(0.95, -0.285));
  ctx.bezierCurveTo(...P(0.995, -0.27), ...P(1.006, -0.2), ...P(0.996, -0.13));
  ctx.bezierCurveTo(...P(0.99, -0.1), ...P(0.975, -0.085), ...P(0.95, -0.08));
  ctx.lineTo(...P(0.9, -0.08));
  ctx.arc(ox + 0.79 * L, oy - 0.09 * L, 0.11 * L, -0.08, -Math.PI + 0.08, true);
  ctx.lineTo(...P(0.3, -0.072));
  ctx.arc(ox + 0.19 * L, oy - 0.09 * L, 0.11 * L, -0.08, -Math.PI + 0.08, true);
  ctx.closePath();
}

function wheel(ctx: Ctx, x: number, y: number, r: number, spin: number) {
  ctx.fillStyle = "#171717";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.25, 1, x, y, r * 0.68);
  g.addColorStop(0, "#eceef1");
  g.addColorStop(1, "#8d9198");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.66, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = "#3c3f44";
  ctx.lineWidth = r * 0.12;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = spin + (i / 5) * TAU;
    ctx.moveTo(x + Math.cos(a) * r * 0.16, y + Math.sin(a) * r * 0.16);
    ctx.lineTo(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6);
  }
  ctx.stroke();
  ctx.fillStyle = "#2b2d31";
  ctx.beginPath();
  ctx.arc(x, y, r * 0.14, 0, TAU);
  ctx.fill();
}

function car(p: Page, ox: number, oy: number, L: number) {
  const { ctx, t } = p;
  const P = (x: number, y: number): [number, number] => [ox + x * L, oy + y * L];
  // Contact shadow.
  ctx.save();
  ctx.translate(ox + L * 0.5, oy);
  ctx.scale(1, 0.14);
  drawGlow(p, "0,0,0", 0, 0, L * 0.62, 0.5);
  ctx.restore();

  carBody(ctx, ox, oy, L);
  const paint = ctx.createLinearGradient(0, oy - L * 0.38, 0, oy);
  paint.addColorStop(0, "#b72a43");
  paint.addColorStop(0.45, MAZDA.accent);
  paint.addColorStop(1, "#4f0b17");
  ctx.fillStyle = paint;
  ctx.fill();

  // Sheen sweeps along the body while hovered.
  ctx.save();
  carBody(ctx, ox, oy, L);
  ctx.clip();
  const u = t > 0 ? ((t * 0.32) % 1.7) - 0.35 : 0.3;
  const sx = ox + u * L;
  const sh = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
  sh.addColorStop(0, "rgba(255,255,255,0)");
  sh.addColorStop(0.5, "rgba(255,255,255,0.32)");
  sh.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sh;
  ctx.beginPath();
  ctx.moveTo(sx - 30, oy - L * 0.4);
  ctx.lineTo(sx + 60, oy - L * 0.4);
  ctx.lineTo(sx + 10, oy);
  ctx.lineTo(sx - 80, oy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Glasshouse with a B-pillar.
  ctx.beginPath();
  ctx.moveTo(...P(0.365, -0.28));
  ctx.bezierCurveTo(...P(0.41, -0.33), ...P(0.45, -0.356), ...P(0.51, -0.36));
  ctx.bezierCurveTo(...P(0.6, -0.367), ...P(0.7, -0.362), ...P(0.75, -0.35));
  ctx.bezierCurveTo(...P(0.8, -0.338), ...P(0.84, -0.318), ...P(0.875, -0.297));
  ctx.lineTo(...P(0.37, -0.278));
  ctx.closePath();
  const glass = ctx.createLinearGradient(0, oy - L * 0.37, 0, oy - L * 0.28);
  glass.addColorStop(0, "#43484f");
  glass.addColorStop(1, "#1d2025");
  ctx.fillStyle = glass;
  ctx.fill();
  ctx.strokeStyle = MAZDA.accent;
  ctx.lineWidth = L * 0.016;
  ctx.beginPath();
  ctx.moveTo(...P(0.615, -0.368));
  ctx.lineTo(...P(0.605, -0.284));
  ctx.stroke();

  // Shoulder line and lower cladding.
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(...P(0.07, -0.19));
  ctx.bezierCurveTo(...P(0.4, -0.215), ...P(0.7, -0.225), ...P(0.97, -0.222));
  ctx.stroke();
  ctx.strokeStyle = "rgba(20,20,20,0.55)";
  ctx.lineWidth = L * 0.018;
  ctx.beginPath();
  ctx.moveTo(...P(0.31, -0.08));
  ctx.lineTo(...P(0.67, -0.08));
  ctx.stroke();

  // Lights.
  ctx.fillStyle = "#f4f1e6";
  ctx.beginPath();
  ctx.moveTo(...P(0.028, -0.205));
  ctx.lineTo(...P(0.115, -0.222));
  ctx.lineTo(...P(0.1, -0.2));
  ctx.lineTo(...P(0.035, -0.188));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#e0303f";
  ctx.beginPath();
  ctx.moveTo(...P(0.94, -0.272));
  ctx.lineTo(...P(0.997, -0.252));
  ctx.lineTo(...P(0.995, -0.232));
  ctx.lineTo(...P(0.935, -0.252));
  ctx.closePath();
  ctx.fill();

  const r = L * 0.088;
  wheel(ctx, ox + 0.19 * L, oy - r, r, 0.3);
  wheel(ctx, ox + 0.79 * L, oy - r, r, 0.9);
}

const FLAGS = [MAZDA.accent, MAZDA.ink, "#b9b9b9"];

// Pennant string across the top, waving while hovered.
function bunting(p: Page, b: Box) {
  const { ctx, t } = p;
  const y0 = b.y + 18;
  const sag = 16;
  const at = (u: number): [number, number] => [b.x - 10 + u * (b.w + 20), y0 + Math.sin(u * Math.PI) * sag];
  ctx.strokeStyle = "rgba(25,25,25,0.45)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const [x, y] = at(i / 40);
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  const n = 17;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const [x, y] = at(u);
    const a = t > 0 ? Math.sin(t * 2.6 + i * 0.7) * 0.2 : Math.sin(i * 1.3) * 0.05;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = FLAGS[i % FLAGS.length];
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 28);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function showroom(p: Page, b: Box) {
  const { ctx } = p;
  ctx.save();
  rrect(ctx, b.x, b.y, b.w, b.h, 16);
  ctx.clip();
  spotlights(p, b);
  const cx = b.x + b.w * 0.5;
  const cy = b.y + b.h * FLOOR + 58;
  turntable(p, cx, cy, Math.min(250, b.w * 0.37), 30);
  const L = Math.min(360, b.w * 0.54);
  car(p, cx - L / 2, cy + 4, L);
  bunting(p, b);
  ctx.restore();
}

export function drawCityMazda(p: Page) {
  const L = MAZDA_L;
  staticLayer(p, MAZDA, L, showroomStatic);
  showroom(p, L.panel);
  panelEdge(p.ctx, L.panel, "rgba(25,25,25,0.16)");
  windowShot(p, L.win, p.shots[0] ?? null, 0.4);
}
