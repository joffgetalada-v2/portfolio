import type { CSSProperties, ReactNode } from "react";
import type { Work } from "@/content/profile";

// Exposes the palette as --wt-bg / --wt-ink / --wt-accent. Sticky only from 640px tall, otherwise
// the tile runs off the bottom on landscape phones.
export function TileShell({
  work,
  className,
  decorative = false,
  children,
}: {
  work: Work;
  className?: string;
  /** aria-hidden, for tiles that only repeat the facts next to them. */
  decorative?: boolean;
  children: ReactNode;
}) {
  const { bg, ink, accent } = work.palette;
  const style = { "--wt-bg": bg, "--wt-ink": ink, "--wt-accent": accent, backgroundColor: bg, color: ink } as CSSProperties;
  const Tag = decorative ? "div" : "figure";
  return (
    <Tag
      aria-hidden={decorative || undefined}
      style={style}
      className={`wt group/wt @container/wt relative isolate aspect-[5/4] overflow-hidden rounded-[18px] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.06] md:self-start [@media(min-width:768px)_and_(min-height:640px)]:sticky [@media(min-width:768px)_and_(min-height:640px)]:top-28 ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}

// inFlow: sits in the TileStage column, so a label that wraps pushes the windows down.
export function TileMeta({ work, inFlow = false }: { work: Work; inFlow?: boolean }) {
  const place = inFlow
    ? "relative shrink-0 px-4 pb-3.5 pt-4 sm:px-5 sm:pb-4 sm:pt-5"
    : "absolute inset-x-4 top-4 sm:inset-x-5 sm:top-5";
  return (
    <div
      aria-hidden="true"
      className={`${place} z-10 flex items-start justify-between gap-4 font-mono text-[9.5px] uppercase leading-[1.3] tracking-[0.16em] sm:text-[10px]`}
    >
      <span className="flex min-w-0 items-start gap-2">
        <span className="mt-[0.5em] h-[3px] w-4 shrink-0 bg-[var(--wt-accent)]" />
        <span className="text-balance opacity-80">{work.platform}</span>
      </span>
      <span className="shrink-0 opacity-80">No. {work.index}</span>
    </div>
  );
}

// Windows overhang the tile's bottom edge by CROP px. --wt-crop lets the scroll motion land the
// capture's last pixel on that edge (see .wt-pin in globals.css).
const CROP = 28;
export function TileStage({ work, children }: { work: Work; children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <TileMeta work={work} inFlow />
      <div
        style={{ "--wt-crop": `${CROP}px`, marginBottom: -CROP } as CSSProperties}
        className="relative mx-4 min-h-0 flex-1 sm:mx-5"
      >
        {children}
      </div>
    </div>
  );
}

// place="flow" puts the chip in the caller's layout, for when it must not overlap a sibling.
export function TileChip({
  as: Tag = "div",
  place = "left",
  tight = false,
  children,
}: {
  as?: "div" | "figcaption";
  place?: "left" | "flow";
  /** Tighter spacing when the tile is under 23rem wide. */
  tight?: boolean;
  children: ReactNode;
}) {
  const position =
    place === "flow"
      ? "relative shrink-0"
      : "absolute bottom-3.5 left-3.5 z-20 max-w-[calc(100%-1.75rem)] sm:bottom-4 sm:left-4";
  return (
    <Tag className={`${position} ${tight ? "@max-[23rem]/wt:gap-x-2 @max-[23rem]/wt:px-2.5" : ""} flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[12px] bg-[color-mix(in_oklab,var(--wt-bg)_84%,transparent)] px-3 py-2 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6),0_0_0_1px_color-mix(in_oklab,var(--wt-ink)_14%,transparent)] backdrop-blur-md`}>
      {children}
    </Tag>
  );
}

// Accent glow and rings, same motif as the book pages.
export function TileBackdrop() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <span className="absolute inset-0 bg-[radial-gradient(80%_60%_at_95%_0%,color-mix(in_oklab,var(--wt-accent)_34%,transparent),transparent_70%)]" />
      <span className="absolute -right-[16%] -top-[52%] aspect-square w-[64%] rounded-full border border-[var(--wt-accent)] opacity-35" />
      <span className="absolute -right-[9%] -top-[40%] aspect-square w-[46%] rounded-full bg-[var(--wt-accent)] opacity-[0.16]" />
    </span>
  );
}
