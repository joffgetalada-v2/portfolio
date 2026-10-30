"use client";

import { useState } from "react";
import { profile, upworkUrl } from "@/content/profile";
import { LAST_PAGE } from "@/components/scene/book-config";
import { usePortfolio } from "@/lib/store";
import { ArrowIcon } from "./icons";
import { UiKeyframes } from "./UiKeyframes";

// Breaks only between items, never inside one.
const subline = profile.subline.split(" · ");

const fade =
  "transition-[opacity,translate,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] data-[hidden]:pointer-events-none data-[hidden]:opacity-0 data-[hidden]:blur-[2px]";

export function HeroCopy() {
  const page = usePortfolio((s) => s.page);
  const webglFailed = usePortfolio((s) => s.webglFailed);
  const openBook = usePortfolio((s) => s.openBook);
  const goTo = usePortfolio((s) => s.goTo);
  const setContactOpen = usePortfolio((s) => s.setContactOpen);

  const showIntro = page === 0 || webglFailed;
  const showEnd = page === LAST_PAGE && !webglFailed;
  const showCue = showIntro || showEnd;
  // The end card's mono label mounts once the book has been opened, see BookNav.
  const [opened, setOpened] = useState(false);
  if (page > 0 && !opened) setOpened(true);

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <UiKeyframes />
      {/* Scrim for text contrast over the desk. */}
      <div
        aria-hidden="true"
        data-hidden={showIntro || showEnd ? undefined : true}
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_0%_0%,rgba(5,5,5,0.62),rgba(5,5,5,0.25)_55%,transparent_80%)] transition-opacity duration-700 data-[hidden]:opacity-0"
      />

      {webglFailed && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(55%_50%_at_50%_58%,rgba(217,183,126,0.16),rgba(217,183,126,0.04)_45%,transparent_75%)]"
        />
      )}

      {/* Intro. The h1 reads name and role; the name is shown in the line under it. */}
      {/* Short desktop screens get less top padding so the button clears the plant. */}
      <div
        data-hidden={showIntro ? undefined : true}
        inert={!showIntro}
        className={`absolute left-0 top-0 w-full max-w-[42rem] px-4 pt-[5.25rem] md:px-8 md:pt-32 [@media(min-width:768px)_and_(min-height:501px)_and_(max-height:760px)]:pt-[6.5rem] [@media(max-height:500px)]:pt-20 ${fade} data-[hidden]:-translate-y-3`}
      >
        <h1 className="text-[clamp(2.05rem,4.6vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em] text-[#e6eaee]">
          <span className="sr-only">{profile.name}, </span>
          <span className="block">Senior Shopify Plus</span>{" "}
          <span className="block">
            <em className="font-serif text-[1.08em] font-normal italic tracking-[-0.01em]">Developer</em>
          </span>
        </h1>

        <p className="mt-4 max-w-[27rem] text-[13px] leading-relaxed text-ink-muted md:mt-5 md:text-[15px]">
          <span aria-hidden="true" className="text-ink">{profile.name}</span>
          <br />
          {subline.map((part, i) => (
            <span key={part}>
              {i > 0 && " · "}
              <span className="whitespace-nowrap">{part}</span>
            </span>
          ))}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-2.5 md:mt-6 [@media(max-height:500px)]:mt-3">
          {upworkUrl ? (
            <a
              href={upworkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full bg-[#f3f3ef] px-4 text-[13px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
            >
              Hire me on Upwork
              <ArrowIcon dir="up-right" className="size-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full bg-[#f3f3ef] px-4 text-[13px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
            >
              Hire me on Upwork
            </button>
          )}
          <a
            href={`mailto:${profile.email}`}
            className="pointer-events-auto inline-flex h-10 items-center rounded-full border border-white/20 bg-white/[0.03] px-4 text-[13px] text-ink backdrop-blur-sm transition-colors duration-200 hover:border-white/45 hover:bg-white/[0.08]"
          >
            Email me
          </a>
        </div>

        {webglFailed ? (
          <div className="mt-6 max-w-[28rem] rounded-2xl border border-line bg-white/[0.03] p-4 text-[14px] leading-relaxed text-ink-muted md:mt-7">
            <p>
              The 3D book needs WebGL, which isn&rsquo;t available in this browser right now. Everything in it is also
              on the classic page below.
            </p>
            <a
              href="#classic"
              data-focus-target="intro"
              className="pointer-events-auto mt-3 inline-flex items-center gap-2 font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
            >
              Read the classic portfolio
              <ArrowIcon dir="down" className="size-4" />
            </a>
          </div>
        ) : (
          // Pointer type, not width, picks the copy, so touch laptops get the touch hint.
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] tracking-[0.005em] text-ink-muted md:mt-5 md:text-[13px] [@media(max-height:500px)]:mt-3">
            <span aria-hidden="true" className="size-1.5 shrink-0 animate-[cb-breathe_2.4s_ease-in-out_infinite] rounded-full bg-accent" />
            <span className="hidden pointer-fine:inline">Click the book or pages to explore</span>
            <span className="pointer-fine:hidden">Tap the book, swipe to turn pages</span>
            <button
              type="button"
              data-focus-target="intro"
              onClick={openBook}
              className="group pointer-events-auto -my-2 inline-flex items-center gap-1.5 py-2 text-ink underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
            >
              Open the book
              <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* End card on the closed back cover. */}
      <div
        data-hidden={showEnd ? undefined : true}
        inert={!showEnd}
        className={`absolute left-0 top-0 w-full max-w-[40rem] px-4 pt-[5.25rem] md:px-8 md:pt-32 [@media(max-height:500px)]:pt-20 ${fade} data-[hidden]:-translate-y-3`}
      >
        {opened && <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">The end</p>}
        <p className="mt-3 font-serif text-[clamp(2.4rem,5.2vw,4.5rem)] italic leading-[0.95] tracking-[-0.02em] text-[#e6eaee]">
          That&rsquo;s the folio.
        </p>
        <p className="mt-4 max-w-[26rem] text-[14px] leading-relaxed text-ink-muted md:text-[15px]">
          Thanks for reading. If your storefront needs a senior pair of hands, I&rsquo;d like to hear about it.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => goTo(0)}
            className="pointer-events-auto inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-4 text-[13px] text-ink backdrop-blur-sm transition-colors hover:border-white/45 hover:bg-white/[0.08]"
          >
            <ArrowIcon dir="left" className="size-4" />
            Read again
          </button>
          <button
            type="button"
            data-focus-target="end"
            onClick={() => setContactOpen(true)}
            className="pointer-events-auto inline-flex h-10 items-center rounded-full bg-[#f3f3ef] px-4 text-[13px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
          >
            Get in Touch
          </button>
        </div>
      </div>

      {/* Hidden on short screens, the header already links to the classic view. */}
      <div
        data-hidden={showCue ? undefined : true}
        inert={!showCue}
        className={`absolute inset-x-0 bottom-4 flex justify-center md:bottom-6 [@media(max-height:500px)]:hidden ${fade} data-[hidden]:translate-y-3`}
      >
        <a
          href="#classic"
          className="group pointer-events-auto flex flex-col items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-ink [text-shadow:0_1px_10px_rgba(0,0,0,0.95)] transition-colors hover:text-white"
        >
          <span>
            Prefer a classic page? <span className="font-medium">Scroll</span>
          </span>
          <ArrowIcon dir="down" className="size-3.5 animate-[cb-nudge_1.8s_ease-in-out_infinite]" />
        </a>
      </div>
    </div>
  );
}
