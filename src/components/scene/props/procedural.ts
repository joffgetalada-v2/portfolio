import { CanvasTexture, ClampToEdgeWrapping, LinearMipmapLinearFilter, NoColorSpace, RepeatWrapping, SRGBColorSpace } from "three";

// Seeded so generated textures are identical on every load.

// mulberry32, floats in [0, 1)
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fade = (t: number) => t * t * (3 - 2 * t);

// Value noise that wraps every px by py cells, so textures tile.
export function tileNoise(seed: number) {
  const rand = rng(seed);
  const perm = new Uint8Array(512);
  const values = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    perm[i] = i;
    values[i] = rand();
  }
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const t = perm[i];
    perm[i] = perm[j];
    perm[j] = t;
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];

  const lattice = (x: number, y: number, px: number, py: number) => {
    const xi = ((x % px) + px) % px;
    const yi = ((y % py) + py) % py;
    return values[perm[(perm[xi & 255] + yi) & 255]];
  };

  // x, y in lattice cells; returns [0, 1]
  const noise2 = (x: number, y: number, px: number, py: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const a = lattice(x0, y0, px, py);
    const b = lattice(x0 + 1, y0, px, py);
    const c = lattice(x0, y0 + 1, px, py);
    const d = lattice(x0 + 1, y0 + 1, px, py);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  const noise1 = (x: number, p: number) => noise2(x, 0.5, p, 1);

  // Hot-loop variant: fixed 256-cell period, no modulo.
  const noise256 = (x: number, y: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const px0 = perm[x0 & 255];
    const px1 = perm[(x0 + 1) & 255];
    const a = values[perm[(px0 + y0) & 255]];
    const b = values[perm[(px1 + y0) & 255]];
    const c = values[perm[(px0 + y0 + 1) & 255]];
    const d = values[perm[(px1 + y0 + 1) & 255]];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };

  return { noise1, noise2, noise256 };
}

export function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: false });
  if (!ctx) throw new Error("2D canvas unavailable");
  return { canvas, ctx };
}

interface TextureOptions {
  /** false for data maps (roughness, bump), which stay linear. */
  color?: boolean;
  repeat?: [number, number];
  anisotropy?: number;
}

export function canvasTexture(canvas: HTMLCanvasElement, { color = true, repeat, anisotropy = 4 }: TextureOptions = {}) {
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  tex.wrapS = tex.wrapT = repeat ? RepeatWrapping : ClampToEdgeWrapping;
  if (repeat) tex.repeat.set(repeat[0], repeat[1]);
  tex.minFilter = LinearMipmapLinearFilter;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

// Radial falloff for fake contact shadows; shape is in alpha.
export function contactShadowTexture() {
  const size = 128;
  const { canvas, ctx } = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,1)");
  g.addColorStop(0.35, "rgba(0,0,0,0.75)");
  g.addColorStop(0.7, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvasTexture(canvas, { color: true, anisotropy: 1 });
}
