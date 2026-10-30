"use client";

import { useEffect, useState } from "react";
import { usePortfolio } from "@/lib/store";
import { BrandGlyph } from "./BrandGlyph";
import { UiKeyframes } from "./UiKeyframes";

const MAX_WAIT_MS = 12_000;

// Shown on the poster only while an "open the book" request waits on the 3D scene.
export function Loader({ waiting }: { waiting: boolean }) {
  const sceneReady = usePortfolio((s) => s.sceneReady);
  const webglFailed = usePortfolio((s) => s.webglFailed);
  const [timedOut, setTimedOut] = useState(false);

  // Give up on a slow GPU or a texture that never loads; the poster stays.
  useEffect(() => {
    if (!waiting) return;
    const t = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS);
    return () => window.clearTimeout(t);
  }, [waiting]);

  const shown = waiting && !sceneReady && !webglFailed && !timedOut;
  // Mounted on first use and kept, so the pill fades out with its content.
  const [used, setUsed] = useState(false);
  if (waiting && !used) setUsed(true);

  return (
    // Sits on the poster, just below the closed book.
    <div className="poster-pill pointer-events-none absolute inset-x-0 flex justify-center">
      <p role="status" className="sr-only">
        {shown ? "Opening the book…" : ""}
      </p>
      {/* Short delay so a scene that is nearly ready doesn't flash the pill. */}
      <div
        aria-hidden="true"
        data-shown={shown || undefined}
        className="flex h-9 items-center gap-2.5 rounded-full border border-white/[0.12] bg-[#0a0a09]/60 pl-3 pr-3.5 opacity-0 md:pr-4 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-opacity duration-300 ease-out data-[shown]:opacity-100 data-[shown]:delay-200"
      >
        {used && (
          <>
            <UiKeyframes />
            <BrandGlyph className="size-4 animate-[cb-breathe_2s_ease-in-out_infinite] text-ink" />
            <span className="text-[12.5px] tracking-[-0.005em] text-ink">Opening the book&hellip;</span>
            <span className="relative hidden h-px w-10 overflow-hidden bg-white/10 md:block">
              <span className="absolute inset-y-0 left-0 w-2/5 animate-[cb-scan_1.5s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-gradient-to-r from-transparent via-ink/80 to-transparent" />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
