"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { workById, type WorkId } from "@/content/profile";
import { FACE_WORK, LAST_PAGE, SPREADS, type FaceId, type Spread } from "@/components/scene/book-config";
import { isBookOpen, usePortfolio, type ReadSide } from "@/lib/store";
import { ArrowIcon, CloseIcon } from "./icons";

// Button labels, falls back to the work title.
const SHORT_TITLES: Partial<Record<WorkId, string>> = {
  timex: "Timex & Guess",
  malbon: "Malbon Golf",
  artisan: "Artisan Collective",
  freelance: "50+ stores",
};
const shortTitle = (id: WorkId) => SHORT_TITLES[id] ?? workById[id].title;
const pad = (n: number) => String(n).padStart(2, "0");
const TOTAL = SPREADS.length;
const SWIPE_MIN = 40;
const pill =
  "group pointer-events-auto inline-flex h-9 items-center gap-2 rounded-full border border-accent/35 bg-[#120f0a]/70 pl-3.5 pr-3 text-[12.5px] text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-[border-color,background-color] duration-200 hover:border-accent/80 hover:bg-[#1b160e]/85 data-[active]:border-accent/80 data-[active]:bg-[#1b160e]/85";

function announce(page: number, side: ReadSide, narrow: boolean) {
  if (page === 0) return "Book closed.";
  if (page === LAST_PAGE) return "Book closed on the back cover.";
  const spread = SPREADS[page - 1];
  return `Spread ${page} of ${TOTAL}: ${spread.label}${narrow ? `, ${side} page` : ""}.`;
}

// Page text is unreadable on phones, so pages without a case study link to the classic section.
const CLASSIC_ANCHOR: Partial<Record<FaceId, string>> = {
  toolkit: "#skills",
  experience: "#experience",
  process: "#about", // strengths are under About
  contact: "#contact",
};
function classicAnchor(page: number, side: ReadSide) {
  const spread = SPREADS[page - 1];
  return CLASSIC_ANCHOR[side === "left" ? spread.left : spread.right] ?? "#about";
}

export function BookNav() {
  const page = usePortfolio((s) => s.page);
  const readSide = usePortfolio((s) => s.readSide);
  const narrow = usePortfolio((s) => s.narrow);
  const hoveredFace = usePortfolio((s) => s.hoveredFace);
  const next = usePortfolio((s) => s.next);
  const prev = usePortfolio((s) => s.prev);
  const closeBook = usePortfolio((s) => s.closeBook);
  const openWork = usePortfolio((s) => s.openWork);
  const webglFailed = usePortfolio((s) => s.webglFailed);

  const open = isBookOpen(page) && !webglFailed;

  // Keep the last spread on screen while the bar fades out.
  const [shown, setShown] = useState<Spread>(SPREADS[0]);
  const current = open ? SPREADS[page - 1] : shown;
  if (open && current !== shown) setShown(current);

  // Announce page turns, not the initial state.
  const key = `${page}:${readSide}`;
  const [lastKey, setLastKey] = useState(key);
  const [message, setMessage] = useState("");
  if (key !== lastKey) {
    setLastKey(key);
    setMessage(announce(page, readSide, narrow));
  }

  // Swipe to turn pages.
  useEffect(() => {
    const el = document.getElementById("book");
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    const onStart = (e: TouchEvent) => {
      start = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    };
    const onEnd = (e: TouchEvent) => {
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      const s = usePortfolio.getState();
      if (s.activeWork || s.contactOpen || s.webglFailed) return;
      if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) <= Math.abs(dy)) return;
      if (dx < 0) s.next();
      else s.prev();
    };
    const onCancel = () => {
      start = null;
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, []);

  // A keyboard page turn can unmount or inert the focused control. Refocus the current primary
  // control (Next page, Open the book, end card CTA). Pointer input never moves focus.
  const keyFocus = useRef<Element | null>(null);
  useEffect(() => {
    const onKey = () => {
      keyFocus.current = document.activeElement;
    };
    const onPointer = () => {
      keyFocus.current = null;
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("pointerdown", onPointer, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("pointerdown", onPointer, true);
    };
  }, []);
  useEffect(() => {
    const from = keyFocus.current;
    if (!from || from === document.body) return;
    const active = document.activeElement;
    if (active && active !== document.body && active.isConnected && !active.closest("[inert]")) return;
    const target = webglFailed || page === 0 ? "intro" : page === LAST_PAGE ? "end" : "book";
    document.querySelector<HTMLElement>(`#book [data-focus-target="${target}"]`)?.focus({ preventScroll: true });
  }, [page, webglFailed]);

  const hoveredWork = hoveredFace ? FACE_WORK[hoveredFace] : undefined;
  const sideLabel = readSide === "left" ? "Left page" : "Right page";

  return (
    <>
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {message}
      </p>

      <nav
        aria-label="Book navigation"
        data-hidden={open ? undefined : true}
        inert={!open}
        className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-2.5 px-4 transition-[opacity,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] data-[hidden]:translate-y-4 data-[hidden]:opacity-0 md:bottom-7 md:gap-3"
      >
        {current.works.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-2" aria-label="Case studies on this spread">
            {/* Index keys keep a focused button mounted across page turns. */}
            {current.works.map((id, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => openWork(id)}
                  data-active={hoveredWork === id || undefined}
                  aria-label={`View case study: ${shortTitle(id)}`}
                  title={workById[id].title}
                  className={pill}
                >
                  <span className="text-ink-muted transition-colors group-hover:text-ink">View case study</span>
                  <span aria-hidden="true" className="h-3 w-px bg-white/15" />
                  <span className="font-medium text-accent">{shortTitle(id)}</span>
                  <ArrowIcon dir="up-right" className="size-3.5 text-accent transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          narrow && (
            <a href={classicAnchor(current.page, readSide)} className={pill}>
              <span className="font-medium">Read this page</span>
              <ArrowIcon dir="down" className="size-3.5 text-accent transition-transform duration-200 group-hover:translate-y-px" />
            </a>
          )
        )}

        <p className="max-w-full truncate text-[12px] text-ink [text-shadow:0_1px_10px_rgba(0,0,0,0.95)] sm:hidden">{current.label}</p>

        <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border border-white/[0.12] bg-[#0a0a09]/60 p-1 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_18px_40px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl backdrop-saturate-150">
          <NavButton label="Previous page" onClick={prev}>
            <ArrowIcon dir="left" className="size-[18px]" />
          </NavButton>

          <div className="flex min-w-0 items-center gap-3 px-2 sm:px-3">
            <span className="font-mono text-[11px] tabular-nums tracking-[0.06em] text-ink-muted">
              <span className="text-ink">{pad(current.page)}</span> / {pad(TOTAL)}
            </span>
            <span className="hidden max-w-[22rem] truncate text-[13px] text-ink sm:inline">{current.label}</span>
            {narrow && (
              <span className="flex items-center gap-[3px]" title={sideLabel}>
                <span className="sr-only">{sideLabel}</span>
                <span aria-hidden="true" data-on={readSide === "left" || undefined} className="h-3 w-2.5 rounded-[2px] border border-white/30 data-[on]:border-accent data-[on]:bg-accent" />
                <span aria-hidden="true" data-on={readSide === "right" || undefined} className="h-3 w-2.5 rounded-[2px] border border-white/30 data-[on]:border-accent data-[on]:bg-accent" />
              </span>
            )}
          </div>

          <NavButton label="Next page" onClick={next} focusTarget="book">
            <ArrowIcon className="size-[18px]" />
          </NavButton>
          <span aria-hidden="true" className="mx-1 h-5 w-px bg-white/[0.12]" />
          <NavButton label="Close book" onClick={closeBook}>
            <CloseIcon className="size-[17px]" />
          </NavButton>
        </div>

        <p
          aria-hidden="true"
          className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-ink/70 [text-shadow:0_1px_10px_rgba(0,0,0,0.95),0_0_2px_rgba(0,0,0,0.8)] md:pointer-fine:block [@media(max-height:500px)]:hidden"
        >
          ← → to turn · Esc to close
        </p>
      </nav>
    </>
  );
}

function NavButton({
  label,
  onClick,
  focusTarget,
  children,
}: {
  label: string;
  onClick: () => void;
  focusTarget?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-focus-target={focusTarget}
      className="grid size-10 place-items-center rounded-full text-ink/85 transition-colors duration-200 hover:bg-white/10 hover:text-ink active:bg-white/15 md:size-9"
    >
      {children}
    </button>
  );
}
