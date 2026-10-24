// Front and back covers.
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import { brandGlyph, clamp, easeInOut, fitSize, fract, H, lerp, text, W, type Page, type TextStyle } from "../draw-utils";
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

  // Full name on two lines, surname in italic.
  const words = site.brand.split(" ");
  const last = words.pop() ?? "";
  const first = words.join(" ");
  const name: TextStyle = { size: 132, family: "serif", track: -0.012, align: "center" };
  name.size = Math.min(name.size, fitSize(p, first, 940, name), fitSize(p, last, 940, { ...name, italic: true }));
  const lh = name.size * 1.0;
  const base1 = 404;
  const base2 = base1 + lh;

  deboss(p, (dx, dy, color) => {
    ctx.globalAlpha = 1;
    brandGlyph(ctx, cx + dx, 236 + dy, 15, color, 2.6);
    text(p, first, cx + dx, base1 + dy, { ...name, color });
    text(p, last, cx + dx, base2 + dy, { ...name, italic: true, color });
  });

  ctx.fillStyle = FOIL_DIM;
  ctx.fillRect(cx - 22, base2 + 62, 44, 1.5);
  text(p, site.brandTagline, cx, base2 + 112, {
    size: 20,
    family: "mono",
    track: 0.42,
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
  text(p, `${site.shortBrand} · ${site.brandTagline}`, 64, H - 64, meta);
  text(p, `${profile.location} · ${profile.timezone}`, W - 86 - 56, H - 64, { ...meta, align: "right" });

  sheen(p, 5.5);
}
