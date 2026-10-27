// Back matter: toolkit, experience, process and contact.
import { experience, profile } from "@/content/profile";
import {
  arrow,
  clamp,
  easeInOut,
  easeOut,
  fract,
  line,
  measure,
  pad2,
  para,
  rrect,
  smooth,
  text,
  TAU,
  wrap,
  type Page,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, paper, PAPER, spreadOf } from "../paper";

const label: TextStyle = { size: 22, family: "mono", upper: true, track: 0.1, color: PAPER.muted };

// ---- Toolkit ----
export function drawToolkit(p: Page) {
  const { ctx, t } = p;
  paper(p, "left");
  chrome(p, { side: "left", spread: spreadOf("toolkit"), title: "Toolkit", folio: folioOf("toolkit"), color: PAPER.ink });
  const { x0, x1 } = frame("left");

  text(p, "Toolkit", x0 - 4, 262, { size: 180, family: "serif", italic: true, color: PAPER.ink });
  const count = profile.skills.reduce((n, g) => n + g.items.length, 0);
  text(p, `${profile.skills.length} groups · ${count} tools`, x1, 252, { ...label, align: "right", color: PAPER.muted });

  const groups = profile.skills;
  const gap = 26;
  const colW = (x1 - x0 - gap * (groups.length - 1)) / groups.length;
  const top = 338;
  const per = 1.6;
  const active = t > 0 ? Math.floor(t / per) % groups.length : -1;
  const k = t > 0 ? fract(t / per) : 0;

  const titleSt: TextStyle = { size: 20, family: "mono", upper: true, track: 0.06 };
  const maxTitle = Math.max(...groups.map((g) => wrap(p, g.group, colW, titleSt).length));
  groups.forEach((g, i) => {
    const x = x0 + i * (colW + gap);
    const on = i === active;
    const dimmed = active >= 0 && !on;
    // Accent sweep on the active group.
    line(ctx, x, top - 30, x + colW, top - 30, PAPER.line, 1);
    if (on) {
      const grow = easeOut(k / 0.45) * (1 - smooth(0.8, 1, k));
      ctx.fillStyle = PAPER.accent;
      ctx.fillRect(x, top - 31.5, colW * grow, 3);
    }
    ctx.globalAlpha = dimmed ? 0.55 : 1;
    text(p, pad2(i + 1), x, top + 2, { size: 20, family: "mono", color: PAPER.accent });
    const titleLines = wrap(p, g.group, colW, titleSt);
    titleLines.forEach((ln, j) => text(p, ln, x, top + 36 + j * 25, { ...titleSt, color: PAPER.ink }));
    let y = top + 36 + maxTitle * 25 + 24;
    for (const it of g.items) {
      y = para(p, it, x, y, colW, { size: 22, lh: 28, color: PAPER.ink, track: -0.006 }) + 6;
    }
    ctx.globalAlpha = 1;
  });
}

// ---- Experience ----
export function drawExperience(p: Page) {
  const { ctx, t } = p;
  paper(p, "right");
  chrome(p, { side: "right", spread: spreadOf("experience"), title: "Experience", folio: folioOf("experience"), color: PAPER.ink });
  const { x0 } = frame("right");

  text(p, "Experience", x0 - 4, 250, { size: 116, family: "serif", italic: true, color: PAPER.ink });
  text(p, "12+ years · 2014 — Present", x0, 298, { ...label, color: PAPER.muted });

  text(p, "Languages", x0, 424, label);
  profile.languages.forEach((l, i) => {
    const [name, note] = l.split(" (");
    const lw = text(p, name, x0, 462 + i * 34, { size: 22, weight: 500, color: PAPER.ink });
    if (note) text(p, ` (${note}`, x0 + lw, 462 + i * 34, { size: 20, color: PAPER.muted });
  });

  const ed = profile.education;
  line(ctx, x0, 600, x0 + 400, 600, PAPER.line);
  text(p, "Education", x0, 640, label);
  const ey = para(p, ed.degree, x0, 678, 400, { size: 22, weight: 500, lh: 30, color: PAPER.ink });
  para(p, `${ed.school} · ${ed.year}`, x0, ey + 6, 400, { size: 18, lh: 25, color: PAPER.muted });

  // Timeline, oldest first.
  const items = [...experience].reverse();
  const lx = 640;
  const top = 182;
  const bottom = 742;
  const lineTop = top - 46;
  const lineBottom = bottom + 46;
  const step = (bottom - top) / (items.length - 1);
  line(ctx, lx, lineTop, lx, lineBottom, PAPER.line, 1.5);
  text(p, "2014", lx - 22, lineTop + 6, { ...label, align: "right" });
  text(p, "Present", lx - 22, lineBottom + 6, { ...label, align: "right", color: PAPER.accent });
  ctx.fillStyle = PAPER.faint;
  ctx.fillRect(lx - 6, lineTop - 0.75, 12, 1.5);

  // On hover the accent line draws down and fills each node it passes.
  const cycle = 3.8;
  const ph = t > 0 ? t % cycle : cycle;
  const prog = t > 0 ? easeInOut(clamp(ph / 2.6)) * (1 - smooth(3.4, 3.8, ph)) : 1;
  const yEnd = lineTop + (lineBottom - lineTop) * prog;
  ctx.fillStyle = PAPER.accent;
  ctx.fillRect(lx - 1.25, lineTop, 2.5, yEnd - lineTop);
  if (prog > 0.98) {
    ctx.beginPath();
    ctx.arc(lx, lineBottom, 4, 0, TAU);
    ctx.fill();
  }

  items.forEach((e, i) => {
    const y = top + i * step;
    const reached = yEnd >= y - 8;
    ctx.beginPath();
    ctx.arc(lx, y - 8, 7, 0, TAU);
    ctx.fillStyle = reached ? PAPER.accent : PAPER.bg;
    ctx.fill();
    ctx.strokeStyle = reached ? PAPER.accent : PAPER.faint;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const tx = lx + 38;
    text(p, e.period, tx, y - 30, { size: 20, family: "mono", upper: true, track: 0.06, color: PAPER.accent });
    text(p, e.role, tx, y + 2, { size: 26, weight: 600, color: PAPER.ink, track: -0.015 });
    text(p, `${e.company} · ${e.place}`, tx, y + 32, { size: 20, color: PAPER.muted });
  });
}

// ---- Process ----
export function drawProcess(p: Page) {
  const { ctx, t } = p;
  paper(p, "left");
  chrome(p, { side: "left", spread: spreadOf("process"), title: "Process", folio: folioOf("process"), color: PAPER.ink });
  const { x0, x1 } = frame("left");

  const hw = text(p, "How I ", x0 - 4, 250, { size: 168, family: "serif", color: PAPER.ink });
  text(p, "work", x0 - 4 + hw, 250, { size: 168, family: "serif", italic: true, color: PAPER.accent });

  text(p, "Markets", x1, 168, { ...label, align: "right" });
  const half = Math.ceil(profile.markets.length / 2);
  text(p, profile.markets.slice(0, half).join(" · "), x1, 204, { size: 21, color: PAPER.ink, align: "right" });
  text(p, profile.markets.slice(half).join(" · "), x1, 234, { size: 21, color: PAPER.ink, align: "right" });

  const items = profile.strengths;
  const gap = 34;
  const colW = (x1 - x0 - gap * (items.length - 1)) / items.length;
  const top = 344;
  const numSt: TextStyle = { size: 84, family: "display", color: PAPER.ink };

  const titleSt = { size: 26, weight: 600, lh: 31, color: PAPER.ink, track: -0.015 };
  const titleLines = Math.max(...items.map((s) => wrap(p, s.title, colW, titleSt).length));
  // Largest body size whose longest column still clears the folio.
  const bodyTop = top + 160 + titleLines * titleSt.lh + 12;
  const bodySt = [22, 21, 20, 19]
    .map((size) => ({ size, lh: Math.round(size * 1.4), track: -0.004 }))
    .find((st) => bodyTop + (Math.max(...items.map((s) => wrap(p, s.body, colW, st).length)) - 1) * st.lh <= 790) ?? {
    size: 19,
    lh: 27,
    track: -0.004,
  };
  items.forEach((s, i) => {
    const x = x0 + i * (colW + gap);
    line(ctx, x, top, x + colW, top, PAPER.ink, 1.5);
    // Staggered roll-up on hover.
    const k = t > 0 ? easeOut((t - i * 0.18) / 0.6) : 1;
    const nb = top + 102;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - 4, top + 6, colW, 104);
    ctx.clip();
    if (k < 1) {
      const prev = pad2(((i + 3) % 4) + 1);
      text(p, prev, x - 2, nb - k * 100, { ...numSt, alpha: 1 - k });
    }
    text(p, pad2(i + 1), x - 2, nb + (1 - k) * 100, { ...numSt, color: i === 0 ? PAPER.accent : PAPER.ink });
    ctx.restore();

    para(p, s.title, x, top + 160, colW, titleSt);
    para(p, s.body, x, bodyTop, colW, { ...bodySt, color: PAPER.muted });
  });
}

// ---- Contact ----
const bare = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

export function drawContact(p: Page) {
  const { ctx, t } = p;
  paper(p, "right");
  chrome(p, { side: "right", spread: spreadOf("contact"), title: "Contact", folio: folioOf("contact"), color: PAPER.ink });
  const { x0, x1 } = frame("right");

  text(p, "Say hello", x0, 164, { ...label, color: PAPER.accent });
  const head: TextStyle = { size: 128, family: "serif", italic: true, color: PAPER.ink, track: -0.01 };
  text(p, "Let’s build your", x0 - 4, 286, head);
  const lw = text(p, "next storefront.", x0 - 4, 424, head);

  // Underline sweep and blinking cursor.
  const cycle = 3.2;
  const ph = t > 0 ? t % cycle : cycle;
  let u0 = 0;
  let u1 = 1;
  if (t > 0) {
    if (ph < 0.6) u0 = easeInOut(ph / 0.6);
    else {
      u0 = 0;
      u1 = easeInOut((ph - 0.7) / 0.9);
    }
  }
  if (u1 > u0) {
    ctx.fillStyle = PAPER.accent;
    ctx.fillRect(x0 + lw * u0, 450, lw * (u1 - u0) - 4, 4);
  }
  const blink = t > 0 ? fract(t * 1.1) < 0.55 : true;
  if (blink) {
    ctx.save();
    ctx.translate(x0 + lw + 12, 424);
    ctx.transform(1, 0, -0.2, 1, 0, 0);
    ctx.fillStyle = PAPER.accent;
    ctx.fillRect(0, -96, 5, 112);
    ctx.restore();
  }

  const rows = [
    { k: "Email", v: profile.email },
    { k: "LinkedIn", v: bare(profile.links.linkedin) },
    { k: "GitHub", v: bare(profile.links.github) },
    ...(profile.links.upwork ? [{ k: "Upwork", v: bare(profile.links.upwork) }] : []),
  ];
  const top = 532;
  const colW = (x1 - x0) / rows.length;
  line(ctx, x0, top - 40, x1, top - 40, PAPER.line);
  rows.forEach((r, i) => {
    const x = x0 + i * colW;
    text(p, r.k, x, top, label);
    const size = Math.min(23, (23 * (colW - 30)) / Math.max(1, measure(p, r.v, { size: 23, weight: 500 })));
    text(p, r.v, x, top + 38, { size, weight: 500, color: PAPER.ink, track: -0.01 });
  });

  text(p, "Based in", x0, 640, label);
  text(p, `${profile.location} · ${profile.timezone}`, x0, 676, { size: 23, weight: 500, color: PAPER.ink });
  text(p, profile.availability, x0, 710, { size: 20, color: PAPER.muted });

  // CTA
  const cta = "Get in touch";
  const cw = measure(p, cta, { size: 22, weight: 600 }) + 92;
  const bx = x1 - cw;
  const by = 652;
  rrect(ctx, bx, by, cw, 64, 32);
  ctx.fillStyle = PAPER.ink;
  ctx.fill();
  text(p, cta, bx + 32, by + 33, { size: 22, weight: 600, color: PAPER.bg, baseline: "middle" });
  arrow(ctx, bx + cw - 50, by + 32, 20, PAPER.bg, 2);
  text(p, "Click this page to get in touch", x1, by + 102, { ...label, align: "right" });
}
