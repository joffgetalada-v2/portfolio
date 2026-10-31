// Spread 6: Timex & Guess Watches, dial hero (left) and detail page (right).
import { workById } from "@/content/profile";
import {
  brandGlyph,
  cached,
  chipRow,
  clamp,
  drawCover,
  drawGlow,
  easeInOut,
  fitSize,
  line,
  measure,
  para,
  rrect,
  TAU,
  text,
  type ChipStyle,
  type Ctx,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, paper, PAPER, spreadOf, surface } from "../paper";

const work = workById.timex;
const { bg: NAVY, ink: IVORY, accent: GOLD } = work.palette;
const GOLD_RGB = "201,162,39";

const DIAL = { x: 900, y: 446, r: 292 };

// Cached per size, so no text. Numerals are drawn live.
function dialLayer(ctx: Ctx) {
  const R = DIAL.r;
  const o = R + 40;
  ctx.translate(o, o);

  // Case rings.
  ctx.strokeStyle = `rgba(${GOLD_RGB},0.9)`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, R + 22, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = `rgba(${GOLD_RGB},0.35)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, R + 10, 0, TAU);
  ctx.stroke();

  // Dial face.
  const g = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.05, 0, 0, R);
  g.addColorStop(0, "#21456a");
  g.addColorStop(0.55, "#12283f");
  g.addColorStop(1, "#08131f");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.fill();

  // Sunburst brushing.
  for (let i = 0; i < 240; i++) {
    const a = (i / 240) * TAU;
    ctx.strokeStyle = i % 2 ? "rgba(255,255,255,0.028)" : "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 8, Math.sin(a) * 8);
    ctx.lineTo(Math.cos(a) * R, Math.sin(a) * R);
    ctx.stroke();
  }

  // Minute track.
  ctx.strokeStyle = "rgba(244,239,230,0.28)";
  ctx.lineWidth = 1;
  for (const rr of [R - 12, R - 30]) {
    ctx.beginPath();
    ctx.arc(0, 0, rr, 0, TAU);
    ctx.stroke();
  }
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * TAU - Math.PI / 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    if (i % 5 === 0) {
      ctx.save();
      ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = GOLD;
      ctx.fillRect(-3.5, -(R - 12), 7, 40);
      ctx.restore();
    } else {
      ctx.strokeStyle = "rgba(244,239,230,0.6)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(c * (R - 13), s * (R - 13));
      ctx.lineTo(c * (R - 29), s * (R - 29));
      ctx.stroke();
    }
  }
  // Inner chapter ring and 24h ticks.
  ctx.strokeStyle = `rgba(${GOLD_RGB},0.3)`;
  ctx.beginPath();
  ctx.arc(0, 0, R - 128, 0, TAU);
  ctx.stroke();
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * TAU;
    ctx.strokeStyle = `rgba(${GOLD_RGB},${i % 2 ? 0.25 : 0.55})`;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (R - 128), Math.sin(a) * (R - 128));
    ctx.lineTo(Math.cos(a) * (R - (i % 2 ? 134 : 140)), Math.sin(a) * (R - (i % 2 ? 134 : 140)));
    ctx.stroke();
  }
  brandGlyph(ctx, 0, -R * 0.4, 11, GOLD, 2);
}

function hand(ctx: Ctx, angle: number, len: number, width: number, tail: number) {
  ctx.save();
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-width * 0.7, tail);
  ctx.lineTo(-width * 0.5, -len * 0.84);
  ctx.lineTo(0, -len);
  ctx.lineTo(width * 0.5, -len * 0.84);
  ctx.lineTo(width * 0.7, tail);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function hands(ctx: Ctx, t: number, shadow: boolean) {
  const R = DIAL.r;
  const sec = 36 + t;
  const min = 9 + sec / 60 + t * 0.08;
  const hr = 10 + min / 60;
  const aS = (sec / 60) * TAU;
  const aM = (min / 60) * TAU;
  const aH = (hr / 12) * TAU;
  ctx.fillStyle = shadow ? "rgba(0,0,0,0.38)" : IVORY;
  hand(ctx, aH, R * 0.52, 15, 34);
  hand(ctx, aM, R * 0.8, 10, 40);
  if (!shadow) {
    // Lume slots.
    ctx.fillStyle = NAVY;
    for (const [a, l, w] of [
      [aH, R * 0.52, 5],
      [aM, R * 0.8, 3.4],
    ] as const) {
      ctx.save();
      ctx.rotate(a);
      ctx.fillRect(-w / 2, -l * 0.8, w, l * 0.56);
      ctx.restore();
    }
  }
  ctx.save();
  ctx.rotate(aS);
  ctx.strokeStyle = shadow ? "rgba(0,0,0,0.38)" : GOLD;
  ctx.fillStyle = shadow ? "rgba(0,0,0,0.38)" : GOLD;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0, R * 0.2);
  ctx.lineTo(0, -R * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, R * 0.15, 8, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -R * 0.68, 5.5, 0, TAU);
  ctx.fill();
  ctx.restore();
}

export function drawTimexHero(p: Page) {
  const { ctx, t } = p;
  surface(p, {
    tone: NAVY,
    side: "left",
    dark: true,
    key: "timex",
    vignette: 0.45,
    extra: (c) => {
      // Rings radiating from the dial.
      c.strokeStyle = "rgba(244,239,230,0.045)";
      c.lineWidth = 1;
      for (let r = DIAL.r + 90; r < 1300; r += 74) {
        c.beginPath();
        c.arc(DIAL.x, DIAL.y, r, 0, TAU);
        c.stroke();
      }
    },
  });

  const R = DIAL.r;
  if (p.image) {
    drawCover(ctx, p.image, 560, 120, 650, 650, 18);
  } else {
    drawGlow(p, GOLD_RGB, DIAL.x, DIAL.y, R * 1.9, 0.18);
    // Case shadow.
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.beginPath();
    ctx.ellipse(DIAL.x + 18, DIAL.y + 26, R + 26, R + 26, 0, 0, TAU);
    ctx.fill();
    const o = R + 40;
    ctx.drawImage(cached("timex-dial", o * 2, o * 2, p.s, dialLayer), DIAL.x - o, DIAL.y - o, o * 2, o * 2);

    // Numerals.
    const num: TextStyle = { size: 50, family: "serif", color: IVORY, align: "center", baseline: "middle" };
    for (let i = 1; i <= 12; i++) {
      const a = (i / 12) * TAU - Math.PI / 2;
      const rr = R - 84;
      text(p, String(i), DIAL.x + Math.cos(a) * rr, DIAL.y + Math.sin(a) * rr + 3, num);
    }
    text(p, "2018 — 2024", DIAL.x, DIAL.y + R * 0.42, {
      size: 18,
      family: "mono",
      track: 0.16,
      color: GOLD,
      align: "center",
    });

    ctx.save();
    ctx.translate(DIAL.x, DIAL.y);
    ctx.save();
    ctx.translate(7, 10);
    hands(ctx, t, true);
    ctx.restore();
    hands(ctx, t, false);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, TAU);
    ctx.fill();
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();

    // Crystal glints: a soft band and a bright arc on the rim.
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.clip();
    const ga = -0.72 + Math.sin(t * 0.7) * 0.4;
    ctx.rotate(ga);
    const band = ctx.createLinearGradient(0, -R, 0, R);
    band.addColorStop(0, "rgba(255,255,255,0.10)");
    band.addColorStop(0.32, "rgba(255,255,255,0.025)");
    band.addColorStop(0.33, "rgba(255,255,255,0)");
    band.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = band;
    ctx.fillRect(-R, -R, R * 2, R * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, R - 4, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55);
    ctx.stroke();
    ctx.restore();
  }

  chrome(p, { side: "left", spread: spreadOf("timex-hero"), title: "Timex & Guess Watches", folio: folioOf("timex-hero"), color: IVORY, alpha: 0.72 });
  const x0 = frame("left").x0;

  text(p, work.kind, x0, 170, { size: 20, family: "mono", upper: true, track: 0.14, color: GOLD });
  const title: TextStyle = { size: 142, family: "serif", color: IVORY, track: -0.01 };
  text(p, "Timex", x0 - 4, 312, title);
  const amp = text(p, "&", x0 - 2, 434, { ...title, italic: true, color: GOLD });
  text(p, " Guess", x0 - 2 + amp, 434, title);
  text(p, "Watches", x0 - 4, 556, { ...title, italic: true });

  ctx.fillStyle = GOLD;
  ctx.fillRect(x0, 614, 56, 2);
  // One platform per line so the long Salesforce name clears the dial.
  const plat: TextStyle = { size: 24, weight: 500, color: IVORY, track: -0.005 };
  const platforms = work.platform.split(" · ");
  const platSize = Math.min(...platforms.map((pl) => fitSize(p, pl, 500, plat)));
  platforms.forEach((pl, i) => text(p, pl, x0, 664 + i * 34, { ...plat, size: platSize }));
  text(p, work.period ?? "", x0, 664 + platforms.length * 34 + 12, { size: 20, family: "mono", upper: true, track: 0.1, color: IVORY, alpha: 0.78 });
}

const CHECKS = ["Lighthouse audit", "GTmetrix report", "Core Web Vitals", "QA checks in Jira"];

// Bars refill one at a time on hover; all complete at rest.
function releaseCard(p: Page, x: number, y: number, w: number, h: number) {
  const { ctx, t } = p;
  rrect(ctx, x, y, w, h, 16);
  ctx.fillStyle = NAVY;
  ctx.fill();
  const title = "Lighthouse checks before deployment";
  text(p, title, x + 28, y + 46, {
    size: fitSize(p, title, w - 56, { size: 22, weight: 500 }),
    weight: 500,
    color: IVORY,
  });
  const cycle = 4.6;
  const ph = t > 0 ? t % cycle : cycle;
  const rowTop = y + 90;
  const rowH = (h - 112) / CHECKS.length;
  CHECKS.forEach((label, i) => {
    const ry = rowTop + i * rowH;
    text(p, label, x + 28, ry + 6, { size: 18, family: "mono", color: IVORY, alpha: 0.9 });
    const bx = x + 228;
    const bw = w - 228 - 70;
    rrect(ctx, bx, ry - 4, bw, 6, 3);
    ctx.fillStyle = "rgba(244,239,230,0.12)";
    ctx.fill();
    let k: number;
    if (ph < 0.45) k = 1 - easeInOut(ph / 0.45);
    else k = easeInOut((ph - 0.6 - i * 0.62) / 0.85);
    k = clamp(k);
    if (k > 0.001) {
      rrect(ctx, bx, ry - 4, bw * k, 6, 3);
      ctx.fillStyle = GOLD;
      ctx.fill();
    }
    // Check mark.
    const cx = x + w - 40;
    ctx.globalAlpha = k >= 0.999 ? 1 : 0.25;
    ctx.strokeStyle = k >= 0.999 ? GOLD : IVORY;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, ry - 1, 11, 0, TAU);
    ctx.stroke();
    if (k >= 0.999) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 5, ry - 1);
      ctx.lineTo(cx - 1.5, ry + 3);
      ctx.lineTo(cx + 5.5, ry - 5);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
}

export function drawTimexDetail(p: Page) {
  const { ctx } = p;
  paper(p, "right");
  chrome(p, { side: "right", spread: spreadOf("timex-detail"), title: "Timex & Guess Watches", folio: folioOf("timex-detail"), color: PAPER.ink });
  const { x0, x1 } = frame("right");
  const cw = x1 - x0;

  para(p, work.summary, x0 - 2, 174, 610, { size: 40, family: "serif", lh: 47, color: PAPER.ink });
  if (p.image) drawCover(ctx, p.image, x1 - 420, 136, 420, 222, 16);
  else releaseCard(p, x1 - 420, 136, 420, 222);

  // Meta row.
  const metaTop = 414;
  line(ctx, x0, metaTop - 44, x1, metaTop - 44, PAPER.line);
  const metaLabel: TextStyle = { size: 20, family: "mono", upper: true, track: 0.1, color: PAPER.muted };
  const metaVal: TextStyle = { size: 22, weight: 500, color: PAPER.ink, track: -0.005 };
  const cols = [
    { label: "Role", value: work.role, w: 430 },
    { label: "Client", value: work.client, w: 430 },
    { label: "Period", value: work.period ?? "", w: cw - 860 },
  ];
  let cx = x0;
  for (const c of cols) {
    text(p, c.label, cx, metaTop, metaLabel);
    text(p, c.value, cx, metaTop + 34, { ...metaVal, size: fitSize(p, c.value, c.w - 28, metaVal) });
    cx += c.w;
  }

  const top = 526;
  const gap = 30;
  const colW = (cw - gap * 3) / 4;
  work.highlights.forEach((hl, i) => {
    const x = x0 + i * (colW + gap);
    line(ctx, x, top - 34, x + colW, top - 34, PAPER.line);
    text(p, String(i + 1).padStart(2, "0"), x, top, { size: 18, family: "mono", color: PAPER.accent, track: 0.04 });
    para(p, hl, x, top + 36, colW, { size: 22, lh: 30, color: PAPER.ink, track: -0.004 });
  });

  const chipSt: ChipStyle = { size: 18, family: "mono", color: PAPER.muted, stroke: "rgba(21,21,19,0.4)", h: 36, padX: 12 };
  // One row only; the short Salesforce name if the full one would wrap.
  const rowW = (items: readonly string[]) => items.reduce((n, it) => n + measure(p, it, chipSt) + 12 * 2 + 8, -8);
  const short = work.stack.map((it) => (it.startsWith("Salesforce Commerce Cloud") ? "SFCC (Demandware)" : it));
  chipRow(p, rowW(work.stack) <= cw ? work.stack : short, x0, 794, x1, chipSt, 8);
}
