import { Color, type CanvasTexture } from "three";
import { canvasTexture, makeCanvas, rng, tileNoise } from "./procedural";

// Grain runs along +u (world x). One tile is TILE_W by TILE_H world units and wraps both ways.
export const TILE_W = 6.4;
export const TILE_H = 3.2;

export interface WoodMaps {
  /** sRGB albedo. */
  map: CanvasTexture;
  /** Linear: R = bump, G = roughness (three reads roughness from G). */
  surface: CanvasTexture;
  dispose: () => void;
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Linear to sRGB byte; the canvas stores display colour like a photo would.
const toSRGB = (c: number) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, v)) * 255);
};

// Dark latewood to light streaks
const RAMP = ["#060302", "#100806", "#1c100a", "#2d1a0f", "#4a2d1a"];
const COLOR_STEPS = 1024;
// Packed little-endian RGBA so each pixel is one 32-bit write.
function colorTable() {
  const stops = RAMP.map((hex) => new Color(hex));
  const table = new Uint32Array(COLOR_STEPS);
  for (let i = 0; i < COLOR_STEPS; i++) {
    const val = i / (COLOR_STEPS - 1);
    const x = Math.min(0.9999, val) * (stops.length - 1);
    const k = Math.floor(x);
    const f = x - k;
    const a = stops[k];
    const b = stops[k + 1];
    // Faint purple cast in the darker streaks
    const cool = (1 - val) * 0.06;
    const r = toSRGB((a.r + (b.r - a.r) * f) * (1 - cool * 0.3));
    const g = toSRGB((a.g + (b.g - a.g) * f) * (1 - cool));
    const bl = toSRGB((a.b + (b.b - a.b) * f) * (1 + cool * 0.5));
    table[i] = ((255 << 24) | (bl << 16) | (g << 8) | r) >>> 0;
  }
  return table;
}

// Generation is slow, so reuse canvases across remounts and the dev double render.
const cache = new Map<number, { albedo: HTMLCanvasElement; surface: HTMLCanvasElement }>();

function generate(W: number) {
  const H = W / 2;
  const { noise1, noise2, noise256 } = tileNoise(7);
  const rand = rng(11);

  // 1) Coarse low-frequency fields: grain warp and tone
  const CW = 128;
  const CH = 64;
  const warp = new Float32Array(CW * CH);
  const tone = new Float32Array(CW * CH);
  // Blends two streak patterns so lines fade in and out along the board.
  const mixer = new Float32Array(CW * CH);
  for (let j = 0; j < CH; j++) {
    const v = j / CH;
    for (let i = 0; i < CW; i++) {
      const u = i / CW;
      warp[j * CW + i] =
        (noise2(u * 3, v * 1, 3, 1) - 0.5) * 1.1 +
        (noise2(u * 2, v * 3, 2, 3) - 0.5) * 0.9 +
        (noise2(u * 6, v * 5, 6, 5) - 0.5) * 0.35 +
        (noise2(u * 9, v * 2, 9, 2) - 0.5) * 0.45 +
        (noise2(u * 14, v * 9, 14, 9) - 0.5) * 0.12;
      tone[j * CW + i] = noise2(u * 2, v * 3, 2, 3) * 0.6 + noise2(u * 5, v * 7, 5, 7) * 0.4;
      mixer[j * CW + i] = smooth(0.3, 0.7, noise2(u * 5, v * 3, 5, 3) * 0.7 + noise2(u * 11, v * 6, 11, 6) * 0.3);
    }
  }

  // 2) 1D grain profile across the board: bands, growth rings, fine streaks
  const L = 4096;
  const RINGS = 48;
  const grain = new Float32Array(L + 1);
  const grainB = new Float32Array(L + 1);
  const late = new Float32Array(L + 1);
  const ringStrength = new Float32Array(RINGS);
  for (let r = 0; r < RINGS; r++) ringStrength[r] = 0.35 + rand() * 0.65;
  for (let k = 0; k <= L; k++) {
    const v = (k % L) / L;
    const bands = smooth(0.2, 0.8, noise1(v * 5, 5) * 0.55 + noise1(v * 13, 13) * 0.45);
    const rc = v * RINGS + (noise1(v * 17, 17) - 0.5) * 2.4;
    const ri = ((Math.floor(rc) % RINGS) + RINGS) % RINGS;
    const f = rc - Math.floor(rc);
    // Latewood darkens gradually and ends sharply.
    const lw = smooth(0.5, 0.92, f) * (1 - smooth(0.95, 1, f)) * ringStrength[ri];
    // Top octave stays under half the texture height in cycles to avoid aliasing.
    const fine = noise1(v * 150, 150) * 0.55 + noise1(v * 440, 440) * 0.45;
    const fineB = noise1(v * 90 + 31, 90) * 0.6 + noise1(v * 300 + 77, 300) * 0.4;
    late[k] = lw;
    grain[k] = bands * 0.74 + fine * 0.26 - lw * 0.45;
    grainB[k] = bands * 0.74 + fineB * 0.26 - lw * 0.38;
  }

  // 3) Per pixel: warp the grain, add pores and noise, write albedo and surface
  const colors = colorTable();
  const albedo = makeCanvas(W, H);
  const surface = makeCanvas(W, H);
  const aImg = albedo.ctx.createImageData(W, H);
  const sImg = surface.ctx.createImageData(W, H);
  const a = new Uint32Array(aImg.data.buffer);
  const s = new Uint32Array(sImg.data.buffer);
  const warpAmp = H * 0.1;
  // Pores are short dashes along the grain. noise256 repeats every 256 cells,
  // so 512 by 1024 cells per tile keeps them seamless.
  const poreScaleX = 512 / W;
  const poreScaleY = 1024 / H;
  const cellW = W / CW; // integer while W is a power of two >= CW
  const cellH = H / CH;
  let seed = 0x9e3779b9;

  for (let y = 0; y < H; y++) {
    const gy = y / cellH;
    const j0 = Math.floor(gy);
    const fy = gy - j0;
    const r0 = (j0 & (CH - 1)) * CW;
    const r1 = ((j0 + 1) & (CH - 1)) * CW;
    const row = y * W;
    for (let ci = 0; ci < CW; ci++) {
      // Coarse fields are linear across a cell, so step them incrementally.
      const c1 = (ci + 1) & (CW - 1);
      let w = warp[r0 + ci] + (warp[r1 + ci] - warp[r0 + ci]) * fy;
      let t = tone[r0 + ci] + (tone[r1 + ci] - tone[r0 + ci]) * fy;
      let mix = mixer[r0 + ci] + (mixer[r1 + ci] - mixer[r0 + ci]) * fy;
      const dw = (warp[r0 + c1] + (warp[r1 + c1] - warp[r0 + c1]) * fy - w) / cellW;
      const dt = (tone[r0 + c1] + (tone[r1 + c1] - tone[r0 + c1]) * fy - t) / cellW;
      const dm = (mixer[r0 + c1] + (mixer[r1 + c1] - mixer[r0 + c1]) * fy - mix) / cellW;

      for (let px = 0, x = ci * cellW; px < cellW; px++, x++, w += dw, t += dt, mix += dm) {
        const yw = y + w * warpAmp;
        const lv = (yw / H) * L;
        const li = Math.floor(lv);
        const lf = lv - li;
        const k = li & (L - 1);
        const ga = grain[k] + (grain[k + 1] - grain[k]) * lf;
        const gb = grainB[k] + (grainB[k + 1] - grainB[k]) * lf;
        const g = ga + (gb - ga) * mix;
        const lw = late[k] + (late[k + 1] - late[k]) * lf;

        const pn = noise256(x * poreScaleX, yw * poreScaleY);
        const pore = pn < 0.86 ? 0 : smooth(0.86, 0.98, pn);
        seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
        const speck = (seed >>> 8) / 16777216 - 0.5;

        let val = 0.1 + g + (t - 0.5) * 0.55 - pore * 0.1 + speck * 0.02;
        val = val < 0 ? 0 : val > 1 ? 1 : val;
        const o = row + x;
        a[o] = colors[(val * (COLOR_STEPS - 1) + 0.5) | 0];

        // Satin finish. Pores barely dent the surface so they don't sparkle in the highlight.
        const height = 0.7 - pore * 0.1 - lw * 0.15 + g * 0.1;
        const rough = 0.74 + pore * 0.08 + lw * 0.06 + (1 - val) * 0.06 + speck * 0.02;
        const hb = height <= 0 ? 0 : height >= 1 ? 255 : (height * 255 + 0.5) | 0;
        const rb = rough <= 0 ? 0 : rough >= 1 ? 255 : (rough * 255 + 0.5) | 0;
        s[o] = (0xff000000 | (rb << 8) | hb) >>> 0;
      }
    }
  }
  albedo.ctx.putImageData(aImg, 0, 0);
  surface.ctx.putImageData(sImg, 0, 0);
  return { albedo: albedo.canvas, surface: surface.canvas };
}

export function createWoodMaps({ width = 2048, anisotropy = 8, repeat = [1, 1] as [number, number] } = {}): WoodMaps {
  let canvases = cache.get(width);
  if (!canvases) {
    canvases = generate(width);
    cache.set(width, canvases);
  }
  const map = canvasTexture(canvases.albedo, { color: true, repeat, anisotropy });
  const surface = canvasTexture(canvases.surface, { color: false, repeat, anisotropy });
  return {
    map,
    surface,
    dispose: () => {
      map.dispose();
      surface.dispose();
    },
  };
}
