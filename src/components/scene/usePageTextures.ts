"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";
import { workById } from "@/content/profile";
import { COVER_FACES, FACE_H, FACE_H_MOBILE, FACE_W, FACE_W_MOBILE, FACE_WORK, SHEETS, type FaceId } from "./book-config";
import { faces } from "./textures/faces";
import { loadFaceFonts } from "./textures/fonts";
import type { FaceFonts } from "./textures/types";

export type FaceTextures = Record<FaceId, CanvasTexture>;

interface Surface {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: CanvasTexture;
  image: HTMLImageElement | null;
  drawn: boolean;
}

// Reading order, so the idle queue draws pages roughly in the order they're reached.
const ALL_FACES: FaceId[] = SHEETS.flatMap((sheet) => [sheet.front, sheet.back]);
// Drawn before the reveal: the closed cover and the first spread.
const FIRST_FACES: FaceId[] = ["cover", "contents", "intro"];

// Safari has no requestIdleCallback.
const hasIdle = () => typeof window.requestIdleCallback === "function";
const idle = (fn: () => void): number =>
  hasIdle() ? window.requestIdleCallback(fn, { timeout: 400 }) : (setTimeout(fn, 32) as unknown as number);
const cancelIdle = (handle: number) => (hasIdle() ? window.cancelIdleCallback(handle) : clearTimeout(handle));

// redraw(face, t) animates a face; ensureDrawn(face) draws it now if it's still queued.
export function usePageTextures(anisotropy: number, onUpdate?: () => void) {
  const [textures, setTextures] = useState<FaceTextures | null>(null);
  const surfaces = useRef<Partial<Record<FaceId, Surface>>>({});
  const fontsRef = useRef<FaceFonts | null>(null);
  // Ref so a new callback doesn't rebuild the textures.
  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const redraw = useCallback((id: FaceId, t: number) => {
    const surface = surfaces.current[id];
    const fonts = fontsRef.current;
    if (!surface || !fonts) return;
    const { canvas, ctx, texture, image } = surface;
    ctx.save();
    faces[id].draw({ ctx, w: canvas.width, h: canvas.height, s: canvas.width / FACE_W, t, fonts, image });
    ctx.restore();
    surface.drawn = true;
    texture.needsUpdate = true;
    onUpdateRef.current?.();
  }, []);

  const ensureDrawn = useCallback(
    (id: FaceId) => {
      if (surfaces.current[id]?.drawn === false) redraw(id, 0);
    },
    [redraw],
  );

  useEffect(() => {
    let cancelled = false;
    let idleHandle = 0;
    // Screen size, not viewport, so a narrow desktop window still gets full-size art.
    const narrow = Math.min(window.screen.width, window.screen.height) < 768;
    const w = narrow ? FACE_W_MOBILE : FACE_W;
    const h = narrow ? FACE_H_MOBILE : FACE_H;
    const built = surfaces.current;

    loadFaceFonts().then((fonts) => {
      if (cancelled) return;
      fontsRef.current = fonts;
      const map = {} as FaceTextures;
      for (const id of ALL_FACES) {
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        // CPU canvas: uploading a GPU canvas to WebGL stalls on every hover frame.
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) continue;
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = anisotropy;
        texture.minFilter = LinearMipmapLinearFilter;
        // Skip flip and unpremultiply on upload (faster); flip in the UV transform instead.
        texture.flipY = false;
        texture.premultiplyAlpha = true;
        texture.repeat.set(1, -1);
        texture.offset.set(0, 1);
        // Blank stock until drawn.
        ctx.fillStyle = COVER_FACES.includes(id) ? "#0b0a09" : "#f3f1ec";
        ctx.fillRect(0, 0, w, h);
        built[id] = { canvas, ctx, texture, image: null, drawn: false };
        map[id] = texture;
      }
      for (const id of FIRST_FACES) redraw(id, 0);
      setTextures(map);

      // One page per idle slot to avoid a long task on load.
      const queue = ALL_FACES.filter((id) => !FIRST_FACES.includes(id));
      const pump = () => {
        if (cancelled) return;
        const id = queue.shift();
        if (!id) return;
        ensureDrawn(id);
        idleHandle = idle(pump);
      };
      idleHandle = idle(pump);

      // Work.image screenshots replace the illustration once loaded.
      for (const id of ALL_FACES) {
        const workId = FACE_WORK[id];
        const src = workId ? workById[workId].image : undefined;
        if (!src) continue;
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
          const surface = built[id];
          if (cancelled || !surface) return;
          surface.image = img;
          redraw(id, 0);
        };
        img.src = src;
      }
    });

    return () => {
      cancelled = true;
      cancelIdle(idleHandle);
      for (const id of ALL_FACES) built[id]?.texture.dispose();
      surfaces.current = {};
    };
  }, [anisotropy, redraw, ensureDrawn]);

  return { textures, redraw, ensureDrawn };
}
