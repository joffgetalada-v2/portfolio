// Spread 4: The Artisan Collective (left) and freelance work (right).
import { profile, workById } from "@/content/profile";
import {
  bezierPath,
  cached,
  capHeight,
  clamp,
  drawCover,
  easeOut,
  fitSize,
  fract,
  line,
  measure,
  para,
  pointAt,
  rrect,
  strokePath,
  TAU,
  text,
  type Ctx,
  type Page,
  type Path,
  type TextStyle,
} from "../draw-utils";
import { chrome, folioOf, frame, spreadOf, surface } from "../paper";

// ---- Artisan ----
const artisan = workById.artisan;
const KRAFT = artisan.palette.bg;
const BROWN = artisan.palette.ink;
const TERRA = artisan.palette.accent;

const LANES = ["Products", "Content", "SEO"] as const;
const NODE = { ax: 72, bx: 948, w: 220, y: 470, h: 176 };

let lanePaths: Path[] | null = null;
function lanes(): Path[] {
  if (lanePaths) return lanePaths;
  const a0 = NODE.ax + NODE.w;
  const b0 = NODE.bx;
  const mid = NODE.y + NODE.h / 2;
  lanePaths = LANES.map((_, i) => {
    const off = (i - 1) * 44;
    const spread = (i - 1) * 74;
    return bezierPath(
      [
        [a0, mid + off],
        [a0 + 170, mid + off],
        [a0 + 200, mid + spread],
        [(a0 + b0) / 2, mid + spread],
        [b0 - 200, mid + spread],
        [b0 - 170, mid + off],
        [b0, mid + off],
      ],
      48,
    );
  });
  return lanePaths;
}

function token(ctx: Ctx, kind: number, x: number, y: number, a: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = a;
  ctx.fillStyle = TERRA;
  ctx.strokeStyle = TERRA;
  if (kind === 0) {
    // Product: a swing tag.
    ctx.beginPath();
    ctx.moveTo(-10, -7);
    ctx.lineTo(4, -7);
    ctx.lineTo(10, 0);
    ctx.lineTo(4, 7);
    ctx.lineTo(-10, 7);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = KRAFT;
    ctx.beginPath();
    ctx.arc(3, 0, 2, 0, TAU);
    ctx.fill();
  } else if (kind === 1) {
    // Content: a page with lines.
    ctx.fillRect(-7, -9, 14, 18);
    ctx.fillStyle = KRAFT;
    ctx.fillRect(-4, -5, 8, 1.6);
    ctx.fillRect(-4, -1, 8, 1.6);
    ctx.fillRect(-4, 3, 5, 1.6);
  } else {
    // SEO: a ring with a dot.
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, TAU);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function drawArtisan(p: Page) {
  const { ctx, t } = p;
  surface(p, {
    tone: KRAFT,
    side: "left",
    key: "artisan",
    fibres: 1400,
    fibreColor: "rgba(110,78,44,0.13)",
    mottle: 0.05,
    grain: 0.36,
    vignette: 0.1,
  });
  chrome(p, { side: "left", spread: spreadOf("artisan"), title: "The Artisan Collective", folio: folioOf("artisan"), color: BROWN, alpha: 0.78 });
  const { x0, x1 } = frame("left");

  text(p, `${artisan.kind} · ${artisan.role}`, x0, 164, { size: 20, family: "mono", upper: true, track: 0.12, color: TERRA });
  const title: TextStyle = { size: 136, family: "serif", color: BROWN, track: -0.012 };
  text(p, "The Artisan", x0 - 4, 296, title);
  text(p, "Collective", x0 - 4, 410, { ...title, italic: true, color: TERRA });

  para(p, artisan.summary, 740, 222, x1 - 740, { size: 22, lh: 32, color: BROWN, track: -0.004 });

  if (p.image) {
    drawCover(ctx, p.image, x0, 448, x1 - x0, 210, 14);
  } else {
    const paths = lanes();
    ctx.strokeStyle = "rgba(43,33,26,0.28)";
    ctx.lineWidth = 1.5;
    paths.forEach((pa) => strokePath(ctx, pa));

    // Positions depend only on t, so the rest frame is complete.
    paths.forEach((pa, i) => {
      const n = 4;
      const speed = [0.16, 0.12, 0.2][i];
      for (let j = 0; j < n; j++) {
        const u = fract(j / n + t * speed + i * 0.13);
        const [x, y] = pointAt(pa, u * pa.length);
        const fade = Math.min(1, u / 0.08, (1 - u) / 0.08);
        token(ctx, i, x, y, clamp(fade));
      }
    });

    // Lane labels.
    paths.forEach((pa, i) => {
      const [x, y] = pointAt(pa, pa.length / 2);
      const st: TextStyle = { size: 18, family: "mono", upper: true, track: 0.12, color: BROWN };
      const label = LANES[i];
      const w = measure(p, label, st) + 32;
      rrect(ctx, x - w / 2, y - 18, w, 36, 18);
      ctx.fillStyle = KRAFT;
      ctx.fill();
      ctx.strokeStyle = "rgba(43,33,26,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      text(p, label, x, y + 1, { ...st, align: "center", baseline: "middle" });
    });

    // Nodes.
    const { ax, bx, w, y, h } = NODE;
    rrect(ctx, ax, y, w, h, 14);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fill();
    ctx.strokeStyle = "rgba(43,33,26,0.45)";
    ctx.lineWidth = 1.25;
    ctx.stroke();
    text(p, "From", ax + 24, y + 44, { size: 19, family: "mono", upper: true, track: 0.14, color: BROWN, alpha: 0.8 });
    const node: TextStyle = { size: 40, family: "serif", italic: true };
    text(p, "Old store", ax + 22, y + h - 34, { ...node, size: fitSize(p, "Old store", w - 44, node), color: BROWN });

    rrect(ctx, bx, y, w, h, 14);
    ctx.fillStyle = BROWN;
    ctx.fill();
    text(p, "To", bx + 24, y + 44, { size: 19, family: "mono", upper: true, track: 0.14, color: KRAFT, alpha: 0.85 });
    text(p, "WordPress", bx + 22, y + h - 34, { ...node, size: fitSize(p, "WordPress", w - 44, node), color: KRAFT });
  }

  const top = 724;
  const gap = 28;
  const colW = (x1 - x0 - gap * 3) / 4;
  artisan.highlights.forEach((hl, i) => {
    const x = x0 + i * (colW + gap);
    line(ctx, x, top - 36, x + colW, top - 36, "rgba(43,33,26,0.22)");
    text(p, String(i + 1).padStart(2, "0"), x, top, { size: 18, family: "mono", color: TERRA });
    para(p, hl, x + 36, top, colW - 36, { size: 22, lh: 29, color: BROWN, track: -0.004 });
  });
}

// ---- Freelance ----
const free = workById.freelance;
const COAL = free.palette.bg;
const CHALK = free.palette.ink;
const LIME = free.palette.accent;
const LIME_RGB = "149,191,71";

const TILE = { w: 46, h: 37, gap: 8, cols: 10, rows: 5 };

function storefront(ctx: Ctx, lit: boolean) {
  const { w, h } = TILE;
  const stroke = lit ? LIME : "rgba(245,245,240,0.2)";
  rrect(ctx, 1, 1, w - 2, h - 2, 5);
  ctx.fillStyle = lit ? `rgba(${LIME_RGB},0.16)` : "rgba(245,245,240,0.025)";
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // Awning with scallops.
  ctx.fillStyle = lit ? LIME : "rgba(245,245,240,0.16)";
  ctx.fillRect(5, 5, w - 10, 7);
  const n = 5;
  const sw = (w - 10) / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath();
    ctx.arc(5 + sw * (i + 0.5), 12, sw / 2, 0, Math.PI);
    ctx.fill();
  }
  // Window and door.
  ctx.fillStyle = lit ? "rgba(245,245,240,0.85)" : "rgba(245,245,240,0.12)";
  ctx.fillRect(8, 20, 16, 9);
  ctx.fillStyle = lit ? LIME : "rgba(245,245,240,0.16)";
  ctx.fillRect(w - 18, 19, 9, h - 21);
}

function tileGrid(p: Page, gx: number, gy: number) {
  const { ctx, t } = p;
  const dim = cached("store-tile-off", TILE.w, TILE.h, p.s, (c) => storefront(c, false));
  const lit = cached("store-tile-on", TILE.w, TILE.h, p.s, (c) => storefront(c, true));
  // Cycle: fade to dim (0.5s), diagonal light-up wave, hold. Rest frame is all lit.
  const cycle = 5.4;
  const ph = t > 0 ? t % cycle : cycle;
  for (let r = 0; r < TILE.rows; r++) {
    for (let c = 0; c < TILE.cols; c++) {
      const x = gx + c * (TILE.w + TILE.gap);
      const y = gy + r * (TILE.h + TILE.gap);
      let k: number;
      let flash = 0;
      if (ph < 0.5) k = 1 - ph / 0.5;
      else {
        const start = 0.6 + (c + r * 1.4) * 0.17;
        k = easeOut((ph - start) / 0.3);
        flash = k > 0 ? Math.max(0, 1 - (ph - start) / 0.7) : 0;
      }
      ctx.drawImage(dim, x, y, TILE.w, TILE.h);
      if (k > 0) {
        ctx.globalAlpha = clamp(k);
        ctx.drawImage(lit, x, y, TILE.w, TILE.h);
        ctx.globalAlpha = 1;
      }
      if (flash > 0) {
        ctx.globalAlpha = flash * 0.5;
        rrect(ctx, x - 2, y - 2, TILE.w + 4, TILE.h + 4, 7);
        ctx.strokeStyle = LIME;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }
  }
}

export function drawFreelance(p: Page) {
  const { ctx } = p;
  surface(p, { tone: COAL, side: "right", dark: true, vignette: 0.3 });
  chrome(p, { side: "right", spread: spreadOf("freelance"), title: "50+ Shopify stores", folio: folioOf("freelance"), color: CHALK, alpha: 0.72 });
  const { x0, x1 } = frame("right");

  text(p, `${free.kind} · ${free.period}`, x0, 164, { size: 20, family: "mono", upper: true, track: 0.12, color: LIME });

  const big: TextStyle = { size: 272, family: "display", color: CHALK, track: -0.01 };
  const top = 196;
  const base = top + capHeight(p, big, "5");
  const w50 = text(p, "50", x0 - 8, base, big);
  text(p, "+", x0 - 8 + w50 + 6, base, { ...big, color: LIME });

  const gw = TILE.cols * TILE.w + (TILE.cols - 1) * TILE.gap;
  const gh = TILE.rows * TILE.h + (TILE.rows - 1) * TILE.gap;
  const gx = x1 - gw;
  if (p.image) drawCover(ctx, p.image, gx, top, gw, gh, 14);
  else tileGrid(p, gx, top);

  const lede: TextStyle = { size: 46, family: "serif", italic: true, color: CHALK };
  text(p, "Shopify & Shopify Plus stores —", x0 - 2, base + 78, lede);
  text(p, "built, migrated, integrated, or optimized.", x0 - 2, base + 130, { ...lede, color: LIME });

  const rowTop = base + 222;
  line(ctx, x0, rowTop - 44, x1, rowTop - 44, "rgba(245,245,240,0.14)");
  const label: TextStyle = { size: 19, family: "mono", upper: true, track: 0.06, color: LIME };
  const body = { size: 22, lh: 30, color: CHALK, track: -0.004 };
  const cols = [
    { x: x0, w: 270, title: "Categories", body: "Apparel / Golf / Furniture / Gaming / Lifestyle" },
    {
      x: x0 + 300,
      w: 330,
      title: "Integrations",
      body: "Klaviyo / Preorder & back-in-stock / Store locators / Analytics / Reviews",
    },
    { x: x0 + 670, w: x1 - x0 - 670, title: profile.strengths[2].title, body: profile.strengths[2].body },
  ];
  for (const c of cols) {
    text(p, c.title, c.x, rowTop, label);
    para(p, c.body, c.x, rowTop + 40, c.w, { ...body, color: c === cols[2] ? "rgba(245,245,240,0.78)" : CHALK });
  }
}
