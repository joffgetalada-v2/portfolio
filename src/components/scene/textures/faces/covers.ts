// Front and back covers.
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import { brandGlyph, clamp, easeInOut, fract, H, lerp, measure, text, W, type Page, type TextStyle } from "../draw-utils";
import { leather } from "../paper";

const FOIL = "#bdb7ab";
const FOIL_DIM = "rgba(189,183,171,0.55)";

// Shadow above, highlight below, then foil, so the stamp looks pressed in.
function deboss(p: Page, draw: (dx: number, dy: number, color: string) => void) {
  draw(0, -1.4, "rgba(0,0,0,0.9)");
  draw(0, 1.4, "rgba(255,255,255,0.09)");
  draw(0, 0, FOIL);
}

// Diagonal light band across the board; hidden at t = 0.
function sheen(p: Page, period = 5) {
  if (p.t <= 0) return;
  const k = fract(p.t / period);
  const travel = easeInOut(clamp(k / 0.6));
  const x = lerp(-360, W + 520, travel);
  const { ctx } = p;
  const g = ctx.createLinearGradient(x - 300, -120, x + 300, 120);
  g.addColorStop(0, "rgba(255,240,220,0)");
  g.addColorStop(0.45, "rgba(255,240,220,0.035)");
  g.addColorStop(0.5, "rgba(255,244,230,0.075)");
  g.addColorStop(0.55, "rgba(255,240,220,0.035)");
  g.addColorStop(1, "rgba(255,240,220,0)");
  ctx.save();
  ctx.translate(x, H / 2);
  ctx.rotate(-0.38);
  ctx.translate(-x, -H / 2);
  ctx.fillStyle = g;
  ctx.fillRect(x - 320, -400, 640, H + 800);
  ctx.restore();
}

export function drawCover(p: Page) {
  leather(p, "right");
  const { ctx } = p;
  // Centre on the board right of the hinge (x = 86).
  const cx = (86 + W) / 2;
  const cy = H / 2 - 18;

  const word: TextStyle = { size: 52, weight: 500, track: -0.03, baseline: "alphabetic" };
  const wordW = measure(p, site.brand, word);
  const gr = 17;
  const gap = 14;
  const total = gr * 2 + gap + wordW;
  const x0 = cx - total / 2;
  const base = cy + 16;

  deboss(p, (dx, dy, color) => {
    ctx.globalAlpha = 1;
    brandGlyph(ctx, x0 + gr + dx, cy + 0.5 + dy, gr, color, 3.2);
    text(p, site.brand, x0 + gr * 2 + gap + dx, base + dy, { ...word, color });
  });

  ctx.fillStyle = FOIL_DIM;
  ctx.fillRect(cx - 22, cy + 66, 44, 1.5);
  text(p, `${profile.shortName} · Commerce Folio`, cx, cy + 112, {
    size: 18,
    family: "mono",
    track: 0.2,
    upper: true,
    align: "center",
    color: FOIL_DIM,
  });

  const meta: TextStyle = { size: 18, family: "mono", track: 0.2, upper: true, color: "rgba(189,183,171,0.5)" };
  text(p, "Vol. 12", 86 + 56, H - 64, meta);
  text(p, "2014 — Present", W - 64, H - 64, { ...meta, align: "right" });

  sheen(p);
}

export function drawBackCover(p: Page) {
  leather(p, "left");
  const { ctx } = p;
  const cx = (W - 86) / 2;
  const cy = H / 2;

  deboss(p, (dx, dy, color) => {
    brandGlyph(ctx, cx + dx, cy - 118 + dy, 13, color, 2.4);
    text(p, "Thanks for reading.", cx + dx, cy + 8 + dy, {
      size: 78,
      family: "serif",
      italic: true,
      align: "center",
      color,
    });
  });

  ctx.fillStyle = FOIL_DIM;
  ctx.fillRect(cx - 22, cy + 52, 44, 1.5);
  text(p, profile.email, cx, cy + 102, { size: 20, family: "mono", track: 0.04, align: "center", color: FOIL_DIM });

  const meta: TextStyle = { size: 18, family: "mono", track: 0.2, upper: true, color: "rgba(189,183,171,0.5)" };
  text(p, site.brand, 64, H - 64, { ...meta, upper: false, track: 0.08 });
  text(p, `${profile.location} · ${profile.timezone}`, W - 86 - 56, H - 64, { ...meta, align: "right" });

  sheen(p, 5.5);
}
