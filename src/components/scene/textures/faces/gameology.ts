// Spread 2, left page: Gameology. The live store sits in the middle of a game board,
// two meeples take turns around the track and the dice roll for each move.
import { workById } from "@/content/profile";
import { windowFrame, windowShot, type Win, type WindowTheme } from "../browser";
import {
  capHeight,
  chipRow,
  clamp,
  drawGlow,
  easeOut,
  fitSize,
  fontKey,
  fract,
  line,
  measure,
  pad2,
  pageLayer,
  para,
  rrect,
  TAU,
  text,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface } from "../paper";

const work = workById.gameology;
const { bg: CHAR, ink: IVORY, accent: GOLD } = work.palette;
// The store's button red.
const RED = "#9c0411";

const WIN_THEME: WindowTheme = {
  dark: true,
  ink: IVORY,
  muted: "rgba(245,245,245,0.7)",
  win: "#232327",
  bar: "#2b2b30",
  pill: "rgba(245,245,245,0.08)",
  edge: "rgba(245,245,245,0.16)",
  shadow: "rgba(0,0,0,0.6)",
  skeleton: "rgba(245,245,245,0.07)",
};

// ---- Board ----
// Design px. The board sits on the spine side, copy on the outer side.
const SQ = 46;
const COLS = 10;
const ROWS = 13;
const { x0: X0, x1: X1 } = frame("left");
const BOARD = { x: X1 - COLS * SQ, y: 196, w: COLS * SQ, h: ROWS * SQ };
const COL_R = BOARD.x - 64;
const WIN: Win = { x: BOARD.x + SQ + 12, y: BOARD.y + SQ + 12, w: COLS * SQ - SQ * 2 - 24, h: ROWS * SQ - SQ * 2 - 24 };

interface Cell {
  x: number;
  y: number;
  /** Edge facing the board centre: 0 bottom, 1 left, 2 top, 3 right. */
  inner: number;
  corner: boolean;
}

// Clockwise from the top-left corner.
const TRACK: Cell[] = (() => {
  const cells: Cell[] = [];
  const at = (c: number, r: number, inner: number) => {
    const corner = (c === 0 || c === COLS - 1) && (r === 0 || r === ROWS - 1);
    cells.push({ x: BOARD.x + c * SQ, y: BOARD.y + r * SQ, inner, corner });
  };
  for (let c = 0; c < COLS; c++) at(c, 0, 0);
  for (let r = 1; r < ROWS; r++) at(COLS - 1, r, 1);
  for (let c = COLS - 2; c >= 0; c--) at(c, ROWS - 1, 2);
  for (let r = ROWS - 2; r >= 1; r--) at(0, r, 3);
  return cells;
})();
const LAP = TRACK.length;

const BANDS = [GOLD, RED, "rgba(245,245,245,0.75)"];

function star(ctx: Ctx, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
}

function cornerIcon(p: Page, i: number, cx: number, cy: number) {
  const { ctx } = p;
  ctx.fillStyle = GOLD;
  ctx.strokeStyle = GOLD;
  if (i === 0) {
    text(p, "GO", cx - 2, cy + 1, { size: 21, family: "display", color: GOLD, align: "center", baseline: "middle", track: 0.04 });
    line(ctx, cx - 12, cy + 15, cx + 10, cy + 15, GOLD, 2);
    ctx.beginPath();
    ctx.moveTo(cx + 14, cy + 15);
    ctx.lineTo(cx + 8, cy + 11);
    ctx.lineTo(cx + 8, cy + 19);
    ctx.closePath();
    ctx.fill();
  } else if (i === COLS - 1) {
    star(ctx, cx, cy, 13);
  } else if (i === COLS + ROWS - 2) {
    ctx.lineWidth = 1.8;
    rrect(ctx, cx - 11, cy - 11, 22, 22, 5);
    ctx.stroke();
    for (const [dx, dy] of [[-5, -5], [5, -5], [0, 0], [-5, 5], [5, 5]]) {
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 2, 0, TAU);
      ctx.fill();
    }
  } else {
    // A face-down card.
    ctx.lineWidth = 1.8;
    rrect(ctx, cx - 9, cy - 13, 18, 26, 3);
    ctx.stroke();
    text(p, "?", cx, cy + 1, { size: 18, family: "mono", weight: 500, color: GOLD, align: "center", baseline: "middle" });
  }
}

function board(p: Page) {
  const { ctx } = p;
  const { x, y, w, h } = BOARD;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.55)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  rrect(ctx, x - 8, y - 8, w + 16, h + 16, 14);
  ctx.fillStyle = "#28282d";
  ctx.fill();
  ctx.restore();
  rrect(ctx, x - 8, y - 8, w + 16, h + 16, 14);
  ctx.strokeStyle = "rgba(183,141,58,0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Centre panel under the window.
  ctx.fillStyle = "#18181b";
  ctx.fillRect(x + SQ, y + SQ, w - SQ * 2, h - SQ * 2);

  TRACK.forEach((c, i) => {
    ctx.fillStyle = c.corner ? "rgba(183,141,58,0.12)" : i % 2 ? "rgba(245,245,245,0.03)" : "rgba(245,245,245,0.075)";
    ctx.fillRect(c.x, c.y, SQ, SQ);
    if (c.corner) {
      cornerIcon(p, i, c.x + SQ / 2, c.y + SQ / 2);
      return;
    }
    if (i % 5 === 0) {
      // Chance square.
      ctx.fillStyle = "rgba(245,245,245,0.38)";
      ctx.beginPath();
      ctx.arc(c.x + SQ / 2, c.y + SQ / 2, 3.2, 0, TAU);
      ctx.fill();
      return;
    }
    // Colour bands in pairs, like property groups.
    const band = 8;
    const e = 4;
    ctx.fillStyle = BANDS[(Math.floor(i / 5) * 2 + (i % 5 > 2 ? 1 : 0)) % BANDS.length];
    if (c.inner === 0) ctx.fillRect(c.x + e, c.y + SQ - band - e, SQ - e * 2, band);
    else if (c.inner === 1) ctx.fillRect(c.x + e, c.y + e, band, SQ - e * 2);
    else if (c.inner === 2) ctx.fillRect(c.x + e, c.y + e, SQ - e * 2, band);
    else ctx.fillRect(c.x + SQ - band - e, c.y + e, band, SQ - e * 2);
  });

  // Grid lines.
  ctx.strokeStyle = "rgba(245,245,245,0.16)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let c = 0; c <= COLS; c++) {
    const lx = x + c * SQ;
    const inner = c > 1 && c < COLS - 1;
    ctx.moveTo(lx, y);
    ctx.lineTo(lx, inner ? y + SQ : y + h);
    if (inner) {
      ctx.moveTo(lx, y + h - SQ);
      ctx.lineTo(lx, y + h);
    }
  }
  for (let r = 0; r <= ROWS; r++) {
    const ly = y + r * SQ;
    const inner = r > 1 && r < ROWS - 1;
    ctx.moveTo(x, ly);
    ctx.lineTo(inner ? x + SQ : x + w, ly);
    if (inner) {
      ctx.moveTo(x + w - SQ, ly);
      ctx.lineTo(x + w, ly);
    }
  }
  ctx.stroke();
}

// ---- Turns ----
// Gold and red alternate. Each meeple's rolls add up to one lap, so the loop is seamless.
const GOLD_ROLLS = [[3, 4], [6, 3], [1, 4], [5, 6], [2, 4], [1, 3]] as const;
const RED_ROLLS = [[2, 6], [5, 1], [4, 6], [1, 3], [6, 3], [1, 4]] as const;
const START = [2, 23];
const ANGLES = [[-0.22, 0.18], [0.12, -0.3], [-0.08, 0.34], [0.26, -0.12]] as const;

const ROLL = 0.9;
const READ = 0.3;
const HOP = 0.24;
const REST = 0.55;
const LEAD = 0.25;

const TURNS = (() => {
  let start = LEAD;
  return GOLD_ROLLS.flatMap((g, j) => [
    { who: 0, dice: g },
    { who: 1, dice: RED_ROLLS[j] },
  ]).map((tu, i) => {
    const n = tu.dice[0] + tu.dice[1];
    const out = { ...tu, n, start, angles: ANGLES[i % ANGLES.length] };
    start += ROLL + READ + n * HOP + REST;
    return out;
  });
})();
const CYCLE = TURNS[TURNS.length - 1].start + ROLL + READ + TURNS[TURNS.length - 1].n * HOP + REST;

// Positions depend only on t. The rest frame is the end of the loop.
function turnState(t: number) {
  const ph = t > 0 ? t % CYCLE : CYCLE;
  const steps = [0, 0];
  let turn = TURNS.length - 1;
  let roll = 1;
  let hop = 0;
  for (let i = 0; i < TURNS.length; i++) {
    const tu = TURNS[i];
    if (ph < tu.start) break;
    turn = i;
    const d = ph - tu.start;
    roll = clamp(d / ROLL);
    const m = clamp((d - ROLL - READ) / HOP, 0, tu.n);
    steps[tu.who] += Math.floor(m);
    hop = m < tu.n ? fract(m) : 0;
  }
  return { turn, roll, hop, steps };
}

function cellCentre(i: number): [number, number] {
  const c = TRACK[((i % LAP) + LAP) % LAP];
  return [c.x + SQ / 2, c.y + SQ / 2];
}

// ---- Meeple ----
const MEEPLE = [
  { light: "#dcb768", dark: "#8f6a26", edge: "rgba(40,28,8,0.5)", dx: -8 },
  { light: "#d0293c", dark: "#6d020c", edge: "rgba(30,0,4,0.55)", dx: 8 },
];

// (x, y) is the base; h the height in px.
function meeple(ctx: Ctx, x: number, y: number, h: number, who: number, lift: number) {
  const m = MEEPLE[who];
  ctx.fillStyle = `rgba(0,0,0,${0.4 * (1 - lift * 0.5)})`;
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 1, h * 0.4 * (1 - lift * 0.25), h * 0.11, 0, 0, TAU);
  ctx.fill();

  const by = y - lift * 22;
  ctx.save();
  ctx.translate(x, by);
  ctx.scale(h, h);
  ctx.beginPath();
  ctx.moveTo(-0.44, 0);
  ctx.lineTo(-0.11, 0);
  ctx.quadraticCurveTo(0, -0.3, 0.11, 0);
  ctx.lineTo(0.44, 0);
  ctx.quadraticCurveTo(0.42, -0.22, 0.2, -0.42);
  ctx.quadraticCurveTo(0.27, -0.5, 0.48, -0.55);
  ctx.quadraticCurveTo(0.6, -0.62, 0.49, -0.7);
  ctx.quadraticCurveTo(0.3, -0.75, 0.1, -0.745);
  ctx.arc(0, -0.88, 0.17, 0.94, Math.PI - 0.94, true);
  ctx.quadraticCurveTo(-0.3, -0.75, -0.49, -0.7);
  ctx.quadraticCurveTo(-0.6, -0.62, -0.48, -0.55);
  ctx.quadraticCurveTo(-0.27, -0.5, -0.2, -0.42);
  ctx.quadraticCurveTo(-0.42, -0.22, -0.44, 0);
  ctx.closePath();
  ctx.restore();
  const g = ctx.createLinearGradient(x - h * 0.4, by - h, x + h * 0.4, by);
  g.addColorStop(0, m.light);
  g.addColorStop(1, m.dark);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = m.edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function meeples(p: Page, st: ReturnType<typeof turnState>) {
  const { ctx } = p;
  const tu = TURNS[st.turn];
  // Draw the lower one last so it stands in front.
  const pos = [0, 1].map((who) => {
    const at = START[who] + st.steps[who];
    const moving = who === tu.who && st.hop > 0;
    const [ax, ay] = cellCentre(at);
    if (!moving) return { who, x: ax, y: ay, lift: 0 };
    const [bx, by] = cellCentre(at + 1);
    const k = easeOut(st.hop);
    return { who, x: ax + (bx - ax) * k, y: ay + (by - ay) * k, lift: Math.sin(st.hop * Math.PI) };
  });
  pos.sort((a, b) => a.y - b.y);
  for (const m of pos) meeple(ctx, m.x + MEEPLE[m.who].dx, m.y + 13, 34, m.who, m.lift);
}

// ---- Dice ----
const PIPS: Record<number, readonly (readonly [number, number])[]> = {
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};

const DICE = [
  { x: COL_R - 92, y: 752, body: ["#c0182c", "#7e030f"], pip: "#f5f0e6" },
  { x: COL_R - 18, y: 736, body: ["#fbf8f1", "#d8d2c4"], pip: "#1b1b1e" },
] as const;
const DIE = 52;

function die(p: Page, d: number, face: number, angle: number, squash: number, lift: number) {
  const { ctx } = p;
  const { x, y, body, pip } = DICE[d];
  drawGlow(p, "0,0,0", x + 6 + lift * 14, y + 10 + lift * 22, DIE * (0.95 + lift * 0.3), 0.6 * (1 - lift * 0.45));
  const sc = 1 + lift * 0.16;
  ctx.save();
  ctx.translate(x - Math.sin(lift * Math.PI * 0.5) * (d ? -10 : 10), y - lift * 14);
  ctx.rotate(angle);
  ctx.scale(Math.max(0.16, squash) * sc, sc);
  const s = DIE / 2;
  const g = ctx.createLinearGradient(-s, -s, s, s);
  g.addColorStop(0, body[0]);
  g.addColorStop(1, body[1]);
  rrect(ctx, -s, -s, DIE, DIE, DIE * 0.2);
  ctx.fillStyle = g;
  ctx.fill();
  rrect(ctx, -s + 3, -s + 3, DIE - 6, DIE - 6, DIE * 0.16);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = pip;
  for (const [px, py] of PIPS[face]) {
    ctx.beginPath();
    ctx.arc(px * DIE * 0.27, py * DIE * 0.27, DIE * 0.085, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// Each die hops, spins a full turn and flips three times, landing on the new face.
function dice(p: Page, st: ReturnType<typeof turnState>) {
  const tu = TURNS[st.turn];
  const prev = TURNS[(st.turn - 1 + TURNS.length) % TURNS.length];
  for (let d = 0; d < 2; d++) {
    const k = st.roll;
    if (k >= 1) {
      die(p, d, tu.dice[d], tu.angles[d], 1, 0);
      continue;
    }
    const lift = Math.sin(k * Math.PI);
    const flips = k * 3;
    const flip = Math.floor(flips + 0.5);
    const face = flip === 0 ? prev.dice[d] : flip >= 3 ? tu.dice[d] : ((prev.dice[d] + tu.dice[d] + flip * 2 + d) % 6) + 1;
    const spin = (d ? 1 : -1) * TAU;
    const angle = prev.angles[d] + (tu.angles[d] + spin - prev.angles[d]) * easeOut(k);
    die(p, d, face, angle, Math.abs(Math.cos(flips * Math.PI)), lift);
  }
}

// ---- Page ----
function staticLayer(p: Page) {
  const keys = (["sans", "serif", "mono", "display"] as const).map((f) => fontKey(p, f)).join("|");
  pageLayer(p, `gameology:${keys}`, (ctx) => {
    const page: Page = { ...p, ctx, t: 0 };
    surface(page, { tone: CHAR, side: "left", dark: true, key: "gameology", vignette: 0.36 });
    chrome(page, { side: "left", spread: spreadOf("gameology"), title: work.title, folio: folioOf("gameology"), color: IVORY, alpha: 0.72 });

    const cw = COL_R - X0;
    text(page, work.kind, X0, 164, { size: 20, family: "mono", upper: true, track: 0.12, color: GOLD });
    const chipSt = { size: 18, family: "mono" as const, color: IVORY, stroke: "rgba(245,245,245,0.42)", h: 36, padX: 13 };
    const chipsW = work.stack.reduce((n, s) => n + measure(page, s, chipSt) + chipSt.padX * 2 + 8, -8);
    chipRow(page, work.stack, COL_R - chipsW, 157, COL_R + 1, chipSt, 8);

    // GAME in ivory, OLOGY in gold.
    const name = work.title.toUpperCase();
    const split = name.indexOf("OLOGY");
    const base: TextStyle = { size: 150, family: "display", color: IVORY, track: 0.005 };
    const title = { ...base, size: Math.min(150, fitSize(page, name, cw + 6, base)) };
    const tBase = 214 + capHeight(page, title);
    if (split > 0) {
      const aw = text(page, name.slice(0, split), X0 - 3, tBase, title);
      text(page, name.slice(split), X0 - 3 + aw, tBase, { ...title, color: GOLD });
    } else {
      text(page, name, X0 - 3, tBase, title);
    }

    let y = para(page, work.summary, X0, tBase + 72, cw, { size: 34, family: "serif", lh: 41, color: IVORY });
    y += 58;
    const body: TextStyle = { size: 23, color: IVORY, track: -0.004 };
    work.highlights.forEach((hl, i) => {
      line(ctx, X0, y - 32, COL_R, y - 32, "rgba(245,245,245,0.14)");
      text(page, pad2(i + 1), X0, y, { size: 18, family: "mono", color: GOLD, track: 0.04 });
      y = para(page, hl, X0 + 44, y, cw - 44, { ...body, lh: 31 }) + 42;
    });

    board(page);
    windowFrame(page, WIN_THEME, WIN, work.shots?.[0]?.site ?? "");
  });
}

export function drawGameology(p: Page) {
  staticLayer(p);
  windowShot(p, WIN, p.shots[0] ?? null, 0.5);
  const st = turnState(p.t);
  meeples(p, st);
  dice(p, st);
}
