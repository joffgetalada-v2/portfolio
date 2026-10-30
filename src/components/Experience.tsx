"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { isBookOpen, usePortfolio } from "@/lib/store";
import { BookNav } from "./ui/BookNav";
import { ContactDialog } from "./ui/ContactDialog";
import { Header } from "./ui/Header";
import { HeroCopy } from "./ui/HeroCopy";
import { Loader } from "./ui/Loader";
import { WorkDialog } from "./ui/WorkDialog";

const Scene = dynamic(() => import("./scene/Scene").then((m) => m.Scene), { ssr: false });

const NARROW_QUERY = "(max-width: 767px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
// Any of these means someone is here, so the 3D scene is worth loading.
const INTENT_EVENTS = ["pointermove", "pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;

// Captures of the desk view at 2x. Media queries and box sizes match .poster-box in globals.css.
const posterBase = { alt: "", loading: "eager", fetchPriority: "high" } as const;
const posterSources = [
  { media: "(min-width: 768px) and (max-aspect-ratio: 1/1)", src: "/poster/desk-portrait.webp", width: 1536, height: 2048, sizes: "(min-aspect-ratio: 3/4) 100vw, 75vh" },
  { media: "(min-width: 768px) and (max-aspect-ratio: 159/100)", src: "/poster/desk-landscape.webp", width: 2048, height: 1536, sizes: "(min-aspect-ratio: 4/3) 100vw, 134vh" },
  { media: "(min-width: 768px)", src: "/poster/desk-wide.webp", width: 2880, height: 1800, sizes: "(min-aspect-ratio: 8/5) 100vw, 160vh" },
].map(({ media, ...img }) => ({ media, ...getImageProps({ ...posterBase, ...img }).props }));
const { props: narrowPoster } = getImageProps({
  ...posterBase,
  src: "/poster/desk-narrow.webp",
  width: 780,
  height: 1688,
  sizes: "(min-aspect-ratio: 390/844) 100vw, 47vh",
});

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

// Static stand-in for the scene. Below about 12:5 CameraRig fits the desk width, so each capture is
// fitted by width around the centre, where the camera aims.
function Poster({ bookArea, children }: { bookArea: boolean; children: ReactNode }) {
  const openBook = usePortfolio((s) => s.openBook);
  return (
    <div className="absolute inset-0 overflow-hidden [container-type:size]">
      <div className="poster-box absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <picture>
          {posterSources.map((source) => (
            <source key={source.src} media={source.media} srcSet={source.srcSet} sizes={source.sizes} />
          ))}
          <img {...narrowPoster} alt="" draggable={false} className="block size-full select-none" />
        </picture>
        {/* The closed book opens like the 3D cover does. */}
        {bookArea && (
          <div
            aria-hidden="true"
            onClick={openBook}
            className="poster-book absolute cursor-pointer"
          />
        )}
        {children}
      </div>
    </div>
  );
}

export function Experience() {
  const webglFailed = usePortfolio((s) => s.webglFailed);
  const reducedMotion = usePortfolio((s) => s.reducedMotion);
  const section = useRef<HTMLElement>(null);
  const booted = useRef(false);
  const [boot, setBoot] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const start = useCallback(() => {
    if (booted.current) return;
    booted.current = true;
    if (supportsWebGL()) setBoot(true);
    else usePortfolio.getState().setWebglFailed(true);
  }, []);

  useEffect(() => {
    const { setNarrow, setReducedMotion } = usePortfolio.getState();
    const narrow = window.matchMedia(NARROW_QUERY);
    const reduced = window.matchMedia(REDUCED_QUERY);
    const sync = () => {
      setNarrow(narrow.matches);
      setReducedMotion(reduced.matches);
    };
    sync();
    narrow.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      narrow.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  // Poster first; the 3D chunk loads on the first sign of a visitor while the hero is on screen.
  // With reduced motion the poster stays until the book is actually opened.
  useEffect(() => {
    const el = section.current;
    if (boot || reducedMotion || !el) return;
    let inView = el.getBoundingClientRect().bottom > 0;
    const io = new IntersectionObserver(([entry]) => (inView = entry.isIntersecting));
    io.observe(el);
    const onIntent = () => {
      if (inView) start();
    };
    for (const type of INTENT_EVENTS) window.addEventListener(type, onIntent, { capture: true, passive: true });
    return () => {
      io.disconnect();
      for (const type of INTENT_EVENTS) window.removeEventListener(type, onIntent, { capture: true });
    };
  }, [boot, reducedMotion, start]);

  // Opening before the scene is ready (button, poster, arrow key, swipe) waits for it instead.
  useEffect(
    () =>
      usePortfolio.subscribe((s, prev) => {
        if (s.sceneReady || s.webglFailed || s.page === 0 || prev.page !== 0) return;
        usePortfolio.setState({ page: 0, readSide: "left" });
        setWaiting(true);
        start();
      }),
    [start],
  );
  useEffect(() => {
    if (!waiting) return;
    const unsubscribe = usePortfolio.subscribe((s) => {
      if (!s.sceneReady && !s.webglFailed) return;
      // Off before openBook, which notifies again.
      unsubscribe();
      setWaiting(false);
      if (s.sceneReady) s.openBook();
    });
    return unsubscribe;
  }, [waiting]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const state = usePortfolio.getState();
      if (state.activeWork || state.contactOpen || state.webglFailed) return; // dialogs handle their own keys
      // Book is scrolled out of view.
      if (window.scrollY > window.innerHeight * 0.6) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        state.next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        state.prev();
      } else if (e.key === "Escape" && isBookOpen(state.page)) {
        state.closeBook();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      ref={section}
      id="book"
      aria-label="Interactive portfolio book"
      className="relative h-[100svh] min-h-[min(560px,100svh)] w-full overflow-hidden bg-bg"
    >
      <Poster bookArea={!webglFailed}>
        <Loader waiting={waiting} />
      </Poster>
      {boot && !webglFailed && <Scene />}
      <Header />
      <HeroCopy />
      <BookNav />
      <WorkDialog />
      <ContactDialog />
    </section>
  );
}
