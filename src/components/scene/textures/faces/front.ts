// Spread 1: contents (left) and intro (right).
import { profile } from "@/content/profile";
import { SPREADS } from "../../book-config";
import {
  arrow,
  capHeight,
  clamp,
  easeOut,
  fitSize,
  fract,
  leader,
  line,
  measure,
  pad2,
  para,
  runs,
  smooth,
  text,
  wrap,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, frame, paper, PAPER } from "../paper";
import { CONTENTS_ROWS } from "../layout";

export function drawContents(p: Page) {
  const { ctx, t } = p;
  paper(p, "left");
  chrome(p, { side: "left", spread: 1, title: "Contents", folio: 1, color: PAPER.ink });
  const { x0, x1 } = frame("left");

  text(p, "Contents", x0 - 4, 262, { size: 180, family: "serif", italic: true, color: PAPER.ink, track: -0.01 });

  const hint: TextStyle = { size: 22, family: "mono", upper: true, track: 0.06, color: PAPER.muted, align: "right" };
  text(p, "Click any page to turn it", x1 - 44, 252, hint);
  arrow(ctx, x1 - 28, 245, 28, PAPER.accent, 2);

  const { rowH, top } = CONTENTS_ROWS;
  const label: TextStyle = { size: 31, weight: 500, track: -0.01, color: PAPER.ink };
  const num: TextStyle = { size: 20, family: "mono", track: 0.04, color: PAPER.accent };
  const folio: TextStyle = { size: 20, family: "mono", track: 0.04, color: PAPER.muted, align: "right" };

  line(ctx, x0, top - 40, x1, top - 40, PAPER.line, 1);

  // On hover, underline one entry at a time.
  const per = 0.95;
  const active = t > 0 ? Math.floor(t / per) % SPREADS.length : -1;
  const k = t > 0 ? fract(t / per) : 0;

  SPREADS.forEach((sp, i) => {
    const y = top + i * rowH;
    const isActive = i === active;
    text(p, pad2(sp.page), x0, y, { ...num, color: isActive ? PAPER.ink : PAPER.accent });
    const lx = x0 + 78;
    const lw = text(p, sp.label, lx, y, label);
    const pageLabel = `p. ${pad2(sp.page * 2 - 1)}`;
    const fw = measure(p, pageLabel, folio);
    leader(ctx, lx + lw + 18, x1 - fw - 18, y - 7, "rgba(21,21,19,0.32)", 9, 1.3);
    text(p, pageLabel, x1, y, folio);
    if (isActive) {
      const grow = easeOut(clamp(k / 0.55));
      const fade = 1 - smooth(0.75, 1, k);
      ctx.globalAlpha = fade;
      ctx.fillStyle = PAPER.accent;
      ctx.fillRect(lx, y + 12, lw * grow, 2.5);
      ctx.globalAlpha = 1;
    }
  });
}

function parseStat(value: string) {
  const m = value.match(/^(\d+)(.*)$/);
  return m ? { n: Number(m[1]), suffix: m[2] } : { n: 0, suffix: value };
}

export function drawIntro(p: Page) {
  const { ctx, t } = p;
  paper(p, "right");
  chrome(p, { side: "right", spread: 1, title: "Hello", folio: 2, color: PAPER.ink });
  const { x0, x1 } = frame("right");
  const cw = x1 - x0;

  ctx.fillStyle = PAPER.accent;
  ctx.beginPath();
  ctx.arc(x0 + 5, 154, 5, 0, Math.PI * 2);
  ctx.fill();
  text(p, `Cebu, PH · ${profile.timezone} · Remote`, x0 + 22, 160, {
    size: 20,
    family: "mono",
    upper: true,
    track: 0.1,
    color: PAPER.muted,
  });

  // Greeting, scaled to the column width.
  const a: TextStyle = { size: 112, weight: 600, track: -0.045, color: PAPER.ink };
  const b: TextStyle = { size: 138, family: "serif", italic: true, color: PAPER.ink, track: -0.01 };
  const first = "Hello, I’m ";
  const second = `${profile.firstName}.`;
  const total = measure(p, first, a) + measure(p, second, b);
  const k = Math.min(1.12, cw / total);
  runs(p, [
    { str: first, st: { ...a, size: a.size * k } },
    { str: second, st: { ...b, size: b.size * k } },
  ], x0 - 4, 284);

  const headSize = fitSize(p, profile.headline, cw, { size: 26, weight: 500 });
  text(p, profile.headline, x0, 350, { size: headSize, weight: 500, color: PAPER.muted, track: -0.005 });

  para(p, profile.summary, x0, 414, 780, { size: 24, lh: 35, color: PAPER.ink, track: -0.003 });

  // Stats
  const statTop = 606;
  line(ctx, x0, statTop, x1, statTop, PAPER.line, 1);
  const colW = cw / profile.stats.length;
  const numeral: TextStyle = { size: 104, family: "display", color: PAPER.ink };
  const cap = capHeight(p, numeral, "1");
  const prog = t > 0 ? easeOut(t / 1.2) : 1;
  profile.stats.forEach((st, i) => {
    const x = x0 + i * colW;
    if (i > 0) line(ctx, x - 22, statTop, x - 22, statTop + 206, PAPER.line, 1);
    const { n, suffix } = parseStat(st.value);
    const shown = String(Math.round(n * prog));
    const baseY = statTop + 32 + cap;
    const nw = text(p, shown, x, baseY, numeral);
    if (suffix) text(p, suffix, x + nw + 4, baseY, { ...numeral, color: PAPER.accent });
    const caption: TextStyle = { size: 22, family: "mono", upper: true, track: 0.02, color: PAPER.muted };
    wrap(p, st.label, colW - 36, caption)
      .slice(0, 3)
      .forEach((ln, j) => text(p, ln, x, baseY + 38 + j * 26, caption));
  });
}
