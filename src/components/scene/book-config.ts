import { workById, type WorkId } from "@/content/profile";

// While the client React work is hidden, spread 5 shows the two personal apps instead.
export const REACT_CLIENT_SHOWN = !workById["react-client"].hidden;

// ---- Book geometry (world units, desk is the XZ plane, y up) ----
export const PAGE_WIDTH = 1.6;
export const PAGE_HEIGHT = 1.1;
export const PAGE_DEPTH = 0.006;
export const PAGE_SEGMENTS = 30;

// Page canvas size, same aspect ratio as PAGE_WIDTH / PAGE_HEIGHT.
export const FACE_W = 1280;
export const FACE_H = 880;
export const FACE_W_MOBILE = 896;
export const FACE_H_MOBILE = 616;

// ---- Prop layout ----
// [x, z] on the desk. The open spread covers x -1.6..1.6, z -0.55..0.55.
export interface DeskLayout {
  plant: readonly [number, number];
  cup: readonly [number, number];
  pen: readonly [number, number];
  /** Radians around Y; positive turns the tip away from the camera. */
  penYaw: number;
  /** null hides the cards. */
  cards: readonly [number, number] | null;
}

export const DESK_LAYOUT: DeskLayout = {
  // Kept low so it clears the hero copy on short laptop screens.
  plant: [-2.1, 0.6],
  cup: [2.0, -0.8],
  pen: [-1.45, 0.9],
  penYaw: 0.5,
  cards: [1.65, 0.85],
};

// Phones only frame about ±1.2 units around the book, so props sit just in front of it,
// clear of the page label and nav pills. No room for the cards.
export const DESK_LAYOUT_NARROW: DeskLayout = {
  plant: [-0.8, 1.0],
  cup: [0.1, 1.6],
  pen: [0.7, 0.95],
  penYaw: 0.45,
  cards: null,
};

// ---- Page faces ----
export type FaceId =
  | "cover"
  | "contents"
  | "intro"
  | "timex-hero"
  | "timex-detail"
  | "malbon"
  | "atomic"
  | "artisan"
  | "freelance"
  | "react-client"
  | "react-personal"
  | "toolkit"
  | "experience"
  | "process"
  | "contact"
  | "back-cover";

export interface Sheet {
  front: FaceId;
  back: FaceId;
}

// One sheet per leaf. Spread n shows SHEETS[n-1].back on the left and SHEETS[n].front on the right.
export const SHEETS: Sheet[] = [
  { front: "cover", back: "contents" },
  { front: "intro", back: "timex-hero" },
  { front: "timex-detail", back: "malbon" },
  { front: "atomic", back: "artisan" },
  { front: "freelance", back: "react-client" },
  { front: "react-personal", back: "toolkit" },
  { front: "experience", back: "process" },
  { front: "contact", back: "back-cover" },
];

// Page 0 is closed front cover up, LAST_PAGE is closed back cover up.
export const LAST_PAGE = SHEETS.length;

export interface Spread {
  page: number;
  label: string;
  left: FaceId;
  right: FaceId;
  works: WorkId[];
}

const SPREAD_META: Record<number, { label: string; works: WorkId[] }> = {
  1: { label: "Contents · Hello", works: [] },
  2: { label: "Timex & Guess Watches", works: ["timex"] },
  3: { label: "Malbon Golf · Atomic Golf", works: ["malbon", "atomic"] },
  4: { label: "The Artisan Collective · 100+ stores", works: ["artisan", "freelance"] },
  5: REACT_CLIENT_SHOWN
    ? { label: "React projects", works: ["react-client", "react-personal"] }
    : { label: "Personal React apps", works: ["react-personal"] },
  6: { label: "Toolkit · Experience", works: [] },
  7: { label: "Process · Contact", works: [] },
};

export const SPREADS: Spread[] = SHEETS.slice(1).map((sheet, i) => {
  const page = i + 1;
  return {
    page,
    left: SHEETS[i].back,
    right: sheet.front,
    ...SPREAD_META[page],
  };
});

// Leather, not paper.
export const COVER_FACES: FaceId[] = ["cover", "back-cover"];

// Maps a page to its case study for click/hover.
export const FACE_WORK: Partial<Record<FaceId, WorkId>> = {
  "timex-hero": "timex",
  "timex-detail": "timex",
  malbon: "malbon",
  atomic: "atomic",
  artisan: "artisan",
  freelance: "freelance",
  "react-client": REACT_CLIENT_SHOWN ? "react-client" : "react-personal",
  "react-personal": "react-personal",
};
