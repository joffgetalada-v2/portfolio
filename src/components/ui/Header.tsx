"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { usePortfolio } from "@/lib/store";
import { Wordmark } from "./BrandGlyph";

export function Header() {
  const setContactOpen = usePortfolio((s) => s.setContactOpen);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="group/header pointer-events-none fixed inset-x-0 top-0 z-50"
    >
      {/* Gradient scrim at the top, frosted bar once scrolled. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 h-28 bg-gradient-to-b from-black/55 via-black/20 to-transparent transition-opacity duration-500 group-data-[scrolled]/header:opacity-0"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 border-b border-line bg-bg/70 opacity-0 backdrop-blur-xl backdrop-saturate-150 transition-opacity duration-500 group-data-[scrolled]/header:opacity-100"
      />
      <div className="relative flex h-16 items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-8">
        <a
          href="#book"
          aria-label={`${site.brand}, back to the top`}
          className="pointer-events-auto -mx-1 rounded-sm px-1 text-[17px] font-medium tracking-[-0.02em] text-ink transition-opacity hover:opacity-80"
        >
          <Wordmark brand={site.brand} />
        </a>

        <nav aria-label="Primary" className="pointer-events-auto flex items-center gap-1 sm:gap-2">
          <a
            href="#classic"
            className="hidden rounded-full px-3 py-2 text-[13px] text-ink-muted transition-colors hover:text-ink min-[400px]:inline-flex"
          >
            Classic view
          </a>
          {/* Dark 1px ring keeps the edge visible over light desk props. */}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="inline-flex h-9 items-center rounded-full bg-[#f3f3ef] px-4 text-[13px] font-medium tracking-[-0.01em] text-[#0b0b0a] shadow-[0_0_0_1px_rgba(0,0,0,0.55),0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-12px_rgba(0,0,0,0.8)] transition-[background-color,transform] duration-200 hover:bg-white active:scale-[0.97]"
          >
            Get in Touch
          </button>
        </nav>
      </div>
    </header>
  );
}
