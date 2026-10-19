"use client";

import { create } from "zustand";
import type { WorkId } from "@/content/profile";
import { LAST_PAGE, type FaceId } from "@/components/scene/book-config";

export type ReadSide = "left" | "right";

interface PortfolioState {
  /** 0: front cover, 1..LAST_PAGE-1: open spreads, LAST_PAGE: back cover. */
  page: number;
  /** Narrow screens show one page of the spread at a time. */
  readSide: ReadSide;
  narrow: boolean;
  reducedMotion: boolean;
  hoveredFace: FaceId | null;
  activeWork: WorkId | null;
  contactOpen: boolean;
  /** Fonts and page textures loaded, first frame rendered. */
  sceneReady: boolean;
  webglFailed: boolean;

  goTo: (page: number, side?: ReadSide) => void;
  next: () => void;
  prev: () => void;
  openBook: () => void;
  closeBook: () => void;
  setHoveredFace: (face: FaceId | null) => void;
  openWork: (id: WorkId) => void;
  closeWork: () => void;
  setContactOpen: (open: boolean) => void;
  setNarrow: (narrow: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setSceneReady: (ready: boolean) => void;
  setWebglFailed: (failed: boolean) => void;
}

const clampPage = (p: number) => Math.max(0, Math.min(LAST_PAGE, p));
const isOpen = (p: number) => p > 0 && p < LAST_PAGE;

export const usePortfolio = create<PortfolioState>((set, get) => ({
  page: 0,
  readSide: "left",
  narrow: false,
  reducedMotion: false,
  hoveredFace: null,
  activeWork: null,
  contactOpen: false,
  sceneReady: false,
  webglFailed: false,

  goTo: (page, side) => {
    const p = clampPage(page);
    set({ page: p, readSide: side ?? (p > get().page ? "left" : "right") });
  },

  next: () => {
    const { page, narrow, readSide } = get();
    if (narrow && isOpen(page) && readSide === "left") {
      set({ readSide: "right" });
      return;
    }
    if (page >= LAST_PAGE) return;
    set({ page: page + 1, readSide: "left" });
  },

  prev: () => {
    const { page, narrow, readSide } = get();
    if (narrow && isOpen(page) && readSide === "right") {
      set({ readSide: "left" });
      return;
    }
    if (page <= 0) return;
    set({ page: page - 1, readSide: "right" });
  },

  openBook: () => set({ page: 1, readSide: "left" }),
  closeBook: () => set({ page: 0, readSide: "left", activeWork: null }),
  setHoveredFace: (face) => set({ hoveredFace: face }),
  openWork: (id) => set({ activeWork: id }),
  closeWork: () => set({ activeWork: null }),
  setContactOpen: (open) => set({ contactOpen: open }),
  setNarrow: (narrow) => set({ narrow }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setSceneReady: (sceneReady) => set({ sceneReady }),
  setWebglFailed: (webglFailed) => set({ webglFailed }),
}));

export const isBookOpen = isOpen;
