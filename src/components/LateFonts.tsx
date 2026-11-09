"use client";

import { useEffect } from "react";

// Puts font variables on <html> once the first frame is out, so fonts used only below the fold (mono,
// Anton) don't compete with the hero. Until then that text inherits the body font. The faces load first,
// so the text switches once, straight to its own font, rather than through a fallback that wraps
// differently (a visible shift when the page opens on a #link further down).
export function LateFonts({ className, families }: { className: string; families: string[] }) {
  const familiesKey = families.join("|");
  useEffect(() => {
    const add = () => document.documentElement.classList.add(...className.split(" "));
    const load = () => Promise.allSettled(familiesKey.split("|").map((f) => document.fonts.load(`1em ${f}`))).then(add);
    // Two frames: the callback of the second runs after the first has been painted.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(load);
    });
    return () => cancelAnimationFrame(frame);
  }, [className, familiesKey]);
  return null;
}
