"use client";

import { useEffect } from "react";

// Smooth scrolling for in-page links (globals.css), switched on at the reader's first scroll, touch, click
// or key press, so opening the page on a #link jumps straight there instead of gliding down from the top.
export function SmoothScroll() {
  useEffect(() => {
    const input = ["wheel", "touchstart", "keydown", "pointerdown"];
    const on = () => {
      document.documentElement.setAttribute("data-smooth", "");
      for (const type of input) removeEventListener(type, on);
    };
    for (const type of input) addEventListener(type, on, { passive: true });
    return () => {
      for (const type of input) removeEventListener(type, on);
    };
  }, []);
  return null;
}
