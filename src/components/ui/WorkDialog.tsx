"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { workById, works, type WorkId } from "@/content/profile";
import { usePortfolio } from "@/lib/store";
import { ArrowIcon, CloseIcon } from "./icons";
import { Modal } from "./Modal";
import { titleLines } from "./titleLines";

const TITLE_ID = "work-dialog-title";
const pad = (n: number) => String(n).padStart(2, "0");

export function WorkDialog() {
  const activeWork = usePortfolio((s) => s.activeWork);
  const openWork = usePortfolio((s) => s.openWork);
  const closeWork = usePortfolio((s) => s.closeWork);
  const setContactOpen = usePortfolio((s) => s.setContactOpen);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Keep the last work rendered while the dialog animates out.
  const [lastId, setLastId] = useState<WorkId>(works[0].id);
  if (activeWork && activeWork !== lastId) setLastId(activeWork);
  const work = workById[activeWork ?? lastId];

  const i = works.findIndex((w) => w.id === work.id);
  const prevWork = works[(i - 1 + works.length) % works.length];
  const nextWork = works[(i + 1) % works.length];

  // Only announce prev/next swaps. The dialog label covers the first open.
  const [shownId, setShownId] = useState<WorkId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  if (activeWork !== shownId) {
    setShownId(activeWork);
    setAnnouncement(activeWork && shownId ? `Case study ${i + 1} of ${works.length}: ${work.title}` : "");
  }

  // The keyed body remounts on switch, so refocus the new Close button if focus fell to <body>.
  useEffect(() => {
    const dialog = bodyRef.current?.closest<HTMLElement>('[role="dialog"]');
    dialog?.scrollTo({ top: 0 });
    if (dialog && !dialog.contains(document.activeElement)) {
      bodyRef.current?.querySelector<HTMLElement>("header button")?.focus({ preventScroll: true });
    }
  }, [work.id]);

  const { bg, ink, accent } = work.palette;
  const band = { backgroundColor: bg, color: ink } as CSSProperties;

  return (
    <Modal
      open={activeWork !== null}
      onClose={closeWork}
      labelledBy={TITLE_ID}
      onKey={(e) => {
        if (e.key === "ArrowRight") openWork(nextWork.id);
        else if (e.key === "ArrowLeft") openWork(prevWork.id);
      }}
      panelClassName="max-h-[92svh] max-w-[46rem] rounded-t-[22px] border border-white/10 bg-[#0e0e0d] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:max-h-[calc(100svh-3rem)] sm:rounded-[22px]"
    >
      {/* Outside the keyed body so the live region persists. */}
      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </p>
      <div ref={bodyRef} key={work.id} className="transition-opacity duration-300 starting:opacity-0">
        <header style={band} className="relative isolate overflow-hidden px-5 pb-8 pt-5 sm:px-10 sm:pb-10 sm:pt-7">
          <span
            aria-hidden="true"
            style={{ color: accent }}
            className="pointer-events-none absolute -bottom-[0.22em] right-4 -z-10 select-none font-display text-[clamp(9rem,26vw,15rem)] leading-none opacity-25 sm:right-8"
          >
            {pad(i + 1)}
          </span>

          <div className="flex items-start justify-between gap-4">
            <p className="pt-2 font-mono text-[11px] uppercase tracking-[0.16em] opacity-80">
              <span>{pad(i + 1)}</span>
              <span aria-hidden="true"> — </span>
              <span className="sr-only">, </span>
              {work.kind}
            </p>
            <button
              type="button"
              onClick={closeWork}
              aria-label="Close case study"
              // currentColor ring: the accent ring is too faint on light palettes.
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-current/10 focus-visible:outline-current"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <span aria-hidden="true" style={{ backgroundColor: accent }} className="mt-6 block h-[3px] w-10 sm:mt-10" />
          <h2
            id={TITLE_ID}
            className="mt-4 max-w-[34rem] pr-[clamp(5rem,20%,12rem)] text-balance font-display text-[clamp(2.4rem,7.4vw,4.4rem)] uppercase leading-[0.92] tracking-[0.005em]"
          >
            {titleLines(work.title).map((line) => (
              <span key={line} className="block">
                {line}{" "}
              </span>
            ))}
          </h2>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 pr-[clamp(5rem,20%,12rem)] font-mono text-[11.5px] tracking-[0.04em] opacity-85">
            {[work.client, work.platform, work.period].filter(Boolean).map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span aria-hidden="true" style={{ backgroundColor: accent }} className="size-1.5 shrink-0 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </header>

        <div className="grid gap-8 px-5 py-8 sm:grid-cols-[10.5rem_1fr] sm:gap-10 sm:px-10 sm:py-10">
          <dl className="grid grid-cols-2 content-start gap-x-6 gap-y-5 text-[13px] sm:grid-cols-1 sm:gap-6">
            <div className="col-span-2 sm:col-span-1">
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Role</dt>
              <dd className="mt-1.5 leading-snug text-ink">{work.role}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Platform</dt>
              <dd className="mt-1.5 leading-snug text-ink">{work.platform}</dd>
            </div>
            {work.period && (
              <div>
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Period</dt>
                <dd className="mt-1.5 leading-snug text-ink">{work.period}</dd>
              </div>
            )}
            {work.shots?.length ? (
              <div className="col-span-2 sm:col-span-1">
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">
                  {work.shots.length > 1 ? "Live sites" : "Live site"}
                </dt>
                {work.shots.map((s) => (
                  <dd key={s.site} className="mt-1.5 leading-snug">
                    <a
                      href={`https://${s.site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 break-all text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      {s.site}
                      <ArrowIcon dir="up-right" className="size-3.5 shrink-0 text-ink-muted" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </dd>
                ))}
              </div>
            ) : null}
          </dl>

          <div className="min-w-0">
            <p className="font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] leading-[1.25] tracking-[-0.005em] text-ink">{work.summary}</p>

            <h3 className="mt-9 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Highlights</h3>
            <ol className="mt-3 divide-y divide-line border-y border-line">
              {work.highlights.map((h, n) => (
                <li key={h} className="flex gap-4 py-3.5 text-[14.5px] leading-relaxed text-ink/90">
                  <span aria-hidden="true" className="pt-[0.2em] font-mono text-[11px] tabular-nums text-accent">
                    {pad(n + 1)}
                  </span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>

            <h3 className="mt-9 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Stack</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {work.stack.map((s) => (
                <li key={s} className="rounded-full border border-line px-3 py-1.5 font-mono text-[11.5px] text-ink/85">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-[#0e0e0d]/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-10 sm:py-4">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openWork(prevWork.id)}
            aria-label="Previous case study"
            title={prevWork.title}
            className="grid size-10 place-items-center rounded-full border border-line text-ink/85 transition-colors hover:border-white/30 hover:text-ink"
          >
            <ArrowIcon dir="left" className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => openWork(nextWork.id)}
            aria-label="Next case study"
            title={nextWork.title}
            className="grid size-10 place-items-center rounded-full border border-line text-ink/85 transition-colors hover:border-white/30 hover:text-ink"
          >
            <ArrowIcon className="size-[18px]" />
          </button>
          <span className="ml-2 hidden font-mono text-[11px] tabular-nums text-ink-muted sm:inline">
            {pad(i + 1)} / {pad(works.length)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            closeWork();
            setContactOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-[#f3f3ef] pl-4 pr-3.5 text-[13px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
        >
          Discuss a similar project
          <ArrowIcon className="size-4" />
        </button>
      </footer>
    </Modal>
  );
}
