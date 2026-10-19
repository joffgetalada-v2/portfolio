"use client";

import { useEffect, useState } from "react";
import { usePortfolio } from "@/lib/store";
import { BrandGlyph } from "./BrandGlyph";
import { UiKeyframes } from "./UiKeyframes";

const MAX_WAIT_MS = 12_000;
const FADE_MS = 600;

export function Loader() {
  const sceneReady = usePortfolio((s) => s.sceneReady);
  const webglFailed = usePortfolio((s) => s.webglFailed);
  const reducedMotion = usePortfolio((s) => s.reducedMotion);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);

  // Give up waiting on a slow GPU or a texture that never loads.
  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => window.clearTimeout(t);
  }, []);

  const done = sceneReady || webglFailed || timedOut;

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setGone(true), reducedMotion ? 0 : FADE_MS + 50);
    return () => window.clearTimeout(t);
  }, [done, reducedMotion]);

  if (gone) return null;

  return (
    <div
      role="status"
      aria-hidden={done || undefined}
      data-done={done || undefined}
      className="absolute inset-0 z-40 grid place-items-center bg-bg transition-opacity duration-[600ms] ease-out data-[done]:pointer-events-none data-[done]:opacity-0"
    >
      <UiKeyframes />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(40%_38%_at_50%_55%,rgba(217,183,126,0.07),transparent_70%)]"
      />
      <div className="relative flex flex-col items-center">
        <BrandGlyph className="size-6 animate-[cb-breathe_2s_ease-in-out_infinite] text-ink" />
        <p className="mt-4 text-[13px] tracking-[-0.005em] text-ink-muted">Setting the desk&hellip;</p>
        <span aria-hidden="true" className="relative mt-4 block h-px w-28 overflow-hidden bg-white/10">
          <span className="absolute inset-y-0 left-0 w-2/5 animate-[cb-scan_1.5s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-r from-transparent via-ink/80 to-transparent" />
        </span>
      </div>
    </div>
  );
}
