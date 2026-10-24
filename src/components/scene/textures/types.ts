import type { FaceId } from "../book-config";

export interface FaceFonts {
  /** Geist, body copy */
  sans: string;
  /** Instrument Serif, display (mostly italic) */
  serif: string;
  /** Geist Mono, labels and metadata */
  mono: string;
  /** Anton, condensed poster type */
  display: string;
}

export interface DrawContext {
  ctx: CanvasRenderingContext2D;
  /** Canvas size in px. */
  w: number;
  h: number;
  /** w / 1280 */
  s: number;
  /** Seconds since hover started; 0 is the resting frame. */
  t: number;
  fonts: FaceFonts;
  /** Work.image, when the face has one. */
  image: HTMLImageElement | null;
  /** Work.shots in order, null until loaded. Empty unless the face sets shots. */
  shots: readonly (HTMLImageElement | null)[];
}

export interface FaceSpec {
  draw: (d: DrawContext) => void;
  /** Redrawn every frame while hovered. */
  animated: boolean;
  /** Loads its work's live-site captures into DrawContext.shots. */
  shots: boolean;
}

export type FaceRegistry = Record<FaceId, FaceSpec>;
