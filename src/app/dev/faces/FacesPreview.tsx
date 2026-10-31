"use client";

import { useEffect, useRef, useState } from "react";
import {
  FACE_H,
  FACE_H_MOBILE,
  FACE_W,
  FACE_W_MOBILE,
  FACE_WORK,
  SPREADS,
  type FaceId,
} from "@/components/scene/book-config";
import { workById } from "@/content/profile";
import { drawCard } from "@/components/scene/props/Cards";
import { faces } from "@/components/scene/textures/faces";
import { loadFaceFonts } from "@/components/scene/textures/fonts";
import type { FaceFonts } from "@/components/scene/textures/types";

type Size = "desktop" | "mobile";

const ROWS: { label: string; left: FaceId | null; right: FaceId | null }[] = [
  { label: "Closed · front", left: null, right: "cover" },
  ...SPREADS.map((s) => ({ label: `Spread ${s.page} · ${s.label}`, left: s.left, right: s.right })),
  { label: "Closed · back", left: "back-cover", right: null },
];

interface Timing {
  first: number;
  sum: number;
  n: number;
  max: number;
}

type ShotMap = Partial<Record<FaceId, (HTMLImageElement | null)[]>>;

interface BenchRow {
  id: FaceId;
  avg: number;
  max: number;
}

// Draw + WebGL texture upload per face, same as an animated frame in the book.
// gl.finish() so the timing covers raster and upload, not just recording draw calls.
function benchmark(fonts: FaceFonts, w: number, h: number, shots: ShotMap): BenchRow[] {
  const gl = document.createElement("canvas").getContext("webgl2");
  const tex = gl?.createTexture() ?? null;
  if (gl && tex) gl.bindTexture(gl.TEXTURE_2D, tex);
  const upload = (c: HTMLCanvasElement) => {
    if (!gl) return;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.finish();
  };
  const rows: BenchRow[] = [];
  for (const id of Object.keys(faces) as FaceId[]) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    const draw = (t: number) => faces[id].draw({ ctx, w, h, s: w / FACE_W, t, fonts, image: null, shots: shots[id] ?? [] });
    draw(0);
    upload(c);
    let sum = 0;
    let max = 0;
    const n = 90;
    for (let i = 0; i < n; i++) {
      const t0 = performance.now();
      draw(0.05 + i * (6 / n));
      upload(c);
      const dt = performance.now() - t0;
      sum += dt;
      max = Math.max(max, dt);
    }
    rows.push({ id, avg: sum / n, max });
  }
  if (gl && tex) gl.deleteTexture(tex);
  return rows.sort((a, b) => b.avg - a.avg);
}


// Real Work.shots for faces that opt in, same as the book.
function loadShots(): Promise<ShotMap> {
  const jobs = (Object.keys(faces) as FaceId[]).map(async (id) => {
    const workId = FACE_WORK[id];
    const list = faces[id].shots && workId ? workById[workId].shots : undefined;
    if (!list) return [id, null] as const;
    const imgs = await Promise.all(
      list.map((shot) => {
        const img = new Image();
        img.src = shot.src;
        return img.decode().then(
          () => img,
          () => null,
        );
      }),
    );
    return [id, imgs] as const;
  });
  return Promise.all(jobs).then((rows) => Object.fromEntries(rows.filter(([, v]) => v)) as ShotMap);
}

// Placeholder screenshot for testing the image path.
function makeTestImage(): Promise<HTMLImageElement> {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 800;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 1200, 800);
  g.addColorStop(0, "#ff7a59");
  g.addColorStop(1, "#3a4bd8");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 96px sans-serif";
  ctx.fillText("TEST IMAGE", 120, 440);
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img.decode().then(() => img);
}

export function FacesPreview() {
  const [fonts, setFonts] = useState<FaceFonts | null>(null);
  const [size, setSize] = useState<Size>("desktop");
  const [animate, setAnimate] = useState(false);
  const [scrub, setScrub] = useState(0);
  const [withImage, setWithImage] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [withShots, setWithShots] = useState(true);
  const [shots, setShots] = useState<ShotMap>({});
  const [focus, setFocus] = useState<FaceId | null>(null);
  const [stats, setStats] = useState<Record<string, Timing>>({});
  // 1:1 crop: ?face=x&native=1&x=200&y=100
  const [crop, setCrop] = useState<{ x: number; y: number } | null>(null);
  const [bench, setBench] = useState<BenchRow[] | null>(null);

  const canvases = useRef(new Map<FaceId, HTMLCanvasElement>());
  const cardBox = useRef<HTMLDivElement>(null);
  const timings = useRef(new Map<FaceId, Timing>());

  useEffect(() => {
    // e.g. ?face=gameology&t=1.5&size=mobile&animate=1
    const q = new URLSearchParams(window.location.search);
    const f = q.get("face") as FaceId | null;
    loadFaceFonts().then((ff) => {
      setFonts(ff);
      if (f && f in faces) setFocus(f);
      if (q.get("t")) setScrub(Number(q.get("t")));
      if (q.get("size") === "mobile") setSize("mobile");
      if (q.get("animate")) setAnimate(true);
      if (q.get("image")) setWithImage(true);
      if (q.get("native")) setCrop({ x: Number(q.get("x") ?? 0), y: Number(q.get("y") ?? 0) });
      if (q.get("shots") === "0") setWithShots(false);
    });
    loadShots().then(setShots);
  }, []);

  // Business card from the desk, drawn once.
  useEffect(() => {
    const box = cardBox.current;
    if (!fonts || !box) return;
    const c = drawCard(fonts);
    c.className = "block h-auto w-full";
    box.replaceChildren(c);
  }, [fonts, focus]);

  useEffect(() => {
    if (!withImage || image) return;
    makeTestImage().then(setImage);
  }, [withImage, image]);

  const w = size === "desktop" ? FACE_W : FACE_W_MOBILE;
  const h = size === "desktop" ? FACE_H : FACE_H_MOBILE;

  const runBench = () => {
    if (fonts) setBench(benchmark(fonts, w, h, shots));
  };

  useEffect(() => {
    if (!fonts) return;
    // Handy from the devtools console.
    Object.assign(window, { __benchFaces: () => benchmark(fonts, w, h, shots), __faces: faces, __fonts: fonts });
  }, [fonts, w, h, shots]);

  useEffect(() => {
    if (!fonts) return;
    timings.current.clear();
    const img = withImage ? image : null;

    const drawFace = (id: FaceId, c: HTMLCanvasElement, t: number) => {
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const t0 = performance.now();
      const faceShots = (withShots && shots[id]) || [];
      faces[id].draw({ ctx, w: c.width, h: c.height, s: c.width / FACE_W, t, fonts, image: FACE_WORK[id] ? img : null, shots: faceShots });
      const dt = performance.now() - t0;
      const rec = timings.current.get(id);
      if (!rec) timings.current.set(id, { first: dt, sum: 0, n: 0, max: 0 });
      else {
        rec.sum += dt;
        rec.n += 1;
        rec.max = Math.max(rec.max, dt);
      }
    };
    const flush = () => setStats(Object.fromEntries(timings.current));

    if (!animate) {
      for (const [id, c] of canvases.current) drawFace(id, c, scrub);
      flush();
      return;
    }
    let raf = 0;
    let lastFlush = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = scrub + (now - start) / 1000;
      for (const [id, c] of canvases.current) if (faces[id].animated) drawFace(id, c, t);
      if (now - lastFlush > 400) {
        lastFlush = now;
        flush();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [fonts, animate, scrub, size, withImage, image, withShots, shots, focus]);

  const slowest = Object.entries(stats)
    .filter(([, r]) => r.n > 0)
    .map(([id, r]) => ({ id, avg: r.sum / r.n, max: r.max }))
    .sort((a, b) => b.avg - a.avg)[0];

  const faceCanvas = (id: FaceId) => {
    const r = stats[id];
    return (
      <figure key={`${id}-${size}`} className="min-w-0 flex-1">
        <canvas
          ref={(el) => {
            if (el) canvases.current.set(id, el);
            else canvases.current.delete(id);
          }}
          width={w}
          height={h}
          onClick={() => setFocus((f) => (f === id ? null : id))}
          className="block h-auto w-full cursor-zoom-in"
        />
        <figcaption className="mt-1 flex justify-between font-mono text-[11px] text-ink-muted">
          <span>
            {id} {faces[id].animated ? "· animated" : ""}
          </span>
          <span>
            {r ? `first ${r.first.toFixed(1)} ms` : ""}
            {r && r.n > 0 ? ` · avg ${(r.sum / r.n).toFixed(2)} · max ${r.max.toFixed(2)} ms` : ""}
          </span>
        </figcaption>
      </figure>
    );
  };

  return (
    <main className="min-h-screen bg-bg px-4 py-6 text-ink sm:px-8">
      <header className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 font-mono text-xs backdrop-blur sm:-mx-8 sm:px-8">
        <strong className="mr-2 font-sans text-sm">Page faces</strong>
        <button className="rounded-full border border-line px-3 py-1" onClick={() => setAnimate((a) => !a)}>
          {animate ? "■ Stop" : "▶ Animate (hover)"}
        </button>
        <button
          className="rounded-full border border-line px-3 py-1"
          onClick={() => setSize((s) => (s === "desktop" ? "mobile" : "desktop"))}
        >
          {size === "desktop" ? `${FACE_W}×${FACE_H}` : `${FACE_W_MOBILE}×${FACE_H_MOBILE}`}
        </button>
        <button className="rounded-full border border-line px-3 py-1" onClick={() => setWithImage((v) => !v)}>
          {withImage ? "Test image: on" : "Test image: off"}
        </button>
        <button className="rounded-full border border-line px-3 py-1" onClick={() => setWithShots((v) => !v)}>
          {withShots ? "Captures: on" : "Captures: off"}
        </button>
        <label className="flex items-center gap-2">
          t
          <input
            type="range"
            min={0}
            max={8}
            step={0.05}
            value={scrub}
            onChange={(e) => setScrub(Number(e.target.value))}
          />
          <span className="w-10 tabular-nums">{scrub.toFixed(2)}s</span>
        </label>
        <button className="rounded-full border border-line px-3 py-1" onClick={runBench}>
          Benchmark
        </button>
        {focus && (
          <button className="rounded-full border border-line px-3 py-1" onClick={() => setFocus(null)}>
            ✕ {focus}
          </button>
        )}
        {slowest && (
          <span className="ml-auto text-ink-muted">
            slowest: {slowest.id} avg {slowest.avg.toFixed(2)} ms · max {slowest.max.toFixed(2)} ms
          </span>
        )}
      </header>

      {!fonts && <p className="font-mono text-sm text-ink-muted">Loading fonts…</p>}

      {bench && (
        <table className="mx-auto mb-8 w-full max-w-[640px] font-mono text-xs">
          <caption className="mb-2 text-left text-ink-muted">
            Draw + texture upload per frame at {w}×{h} (90 frames) · budget 6 ms
          </caption>
          <tbody>
            {bench.map((r) => (
              <tr key={r.id} className="border-b border-line">
                <td className="py-1">{r.id}</td>
                <td className={r.avg > 6 ? "text-red-400" : ""}>avg {r.avg.toFixed(2)} ms</td>
                <td className={r.max > 6 ? "text-red-400" : ""}>max {r.max.toFixed(2)} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {fonts && focus && !crop && <div className="mx-auto max-w-[1280px]">{faceCanvas(focus)}</div>}
      {fonts && focus && crop && (
        <div className="relative h-[calc(100vh-120px)] w-full overflow-hidden">
          <div style={{ width: w, transform: `translate(${-crop.x}px, ${-crop.y}px)` }}>{faceCanvas(focus)}</div>
        </div>
      )}

      {fonts && !focus && (
        <div className="mx-auto flex max-w-[1320px] flex-col gap-10">
          {ROWS.map((row) => (
            <section key={row.label}>
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">{row.label}</h2>
              <div className="flex gap-1">
                {row.left ? faceCanvas(row.left) : <div className="flex-1" />}
                {row.right ? faceCanvas(row.right) : <div className="flex-1" />}
              </div>
            </section>
          ))}
          <section>
            <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint">Desk · business card</h2>
            <div ref={cardBox} className="max-w-[640px]" />
          </section>
        </div>
      )}
    </main>
  );
}
