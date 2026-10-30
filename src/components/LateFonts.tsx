"use client";

import { useEffect } from "react";

// Puts font variables on <html> once the first frame is out, so fonts used only below the fold (mono,
// Anton) don't compete with the hero. Until then that text inherits the body font.
export function LateFonts({ className }: { className: string }) {
  useEffect(() => {
    const add = () => document.documentElement.classList.add(...className.split(" "));
    // Two frames: the callback of the second runs after the first has been painted.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(add);
    });
    return () => cancelAnimationFrame(frame);
  }, [className]);
  return null;
}
