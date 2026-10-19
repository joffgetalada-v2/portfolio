"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
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

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Experience() {
  const webglFailed = usePortfolio((s) => s.webglFailed);

  useEffect(() => {
    const { setNarrow, setReducedMotion, setWebglFailed } = usePortfolio.getState();
    if (!supportsWebGL()) setWebglFailed(true);

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
      id="book"
      aria-label="Interactive portfolio book"
      className="relative h-[100svh] min-h-[min(560px,100svh)] w-full overflow-hidden bg-bg"
    >
      {!webglFailed && <Scene />}
      <Header />
      <HeroCopy />
      <BookNav />
      <Loader />
      <WorkDialog />
      <ContactDialog />
    </section>
  );
}
