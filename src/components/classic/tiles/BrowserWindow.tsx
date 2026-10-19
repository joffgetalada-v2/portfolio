import type { CSSProperties, ReactNode } from "react";

// Children scroll top to bottom on hover, or on their own on touch. Motion is in globals.css (.wt-view).
export function BrowserWindow({
  address,
  leg = "14s",
  page = "#ffffff",
  compact = false,
  thumbInset = "3px",
  className,
  style,
  children,
}: {
  /** Omit for a blank placeholder pill. */
  address?: string;
  /** Duration of one top-to-bottom pass. */
  leg?: string;
  /** Background shown while the content loads. */
  page?: string;
  compact?: boolean;
  /** Thumb offset from the right edge, larger when the window overhangs the tile. */
  thumbInset?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const dot = "size-[6px] rounded-full bg-[color-mix(in_oklab,var(--wt-bg),var(--wt-ink)_32%)]";
  return (
    <div
      style={{
        boxShadow:
          "0 26px 50px -22px rgba(0,0,0,0.7), 0 8px 16px -10px rgba(0,0,0,0.35), 0 0 0 1px color-mix(in oklab, var(--wt-ink) 14%, transparent)",
        ...style,
      }}
      className={`flex flex-col overflow-hidden rounded-[9px] bg-[color-mix(in_oklab,var(--wt-bg),var(--wt-ink)_10%)] ${className ?? ""}`}
    >
      <div
        aria-hidden="true"
        className={`flex h-[20px] shrink-0 items-center px-2 sm:h-[22px] ${compact ? "gap-1.5" : "gap-2 sm:px-2.5"}`}
      >
        <span className={`flex shrink-0 gap-[4px] ${compact ? "" : "w-[26px]"}`}>
          <span className={dot} />
          <span className={dot} />
          <span className={dot} />
        </span>
        <span
          className={`mx-auto flex h-[12px] min-w-0 flex-1 items-center justify-center gap-[5px] rounded-full bg-[color-mix(in_oklab,var(--wt-bg),var(--wt-ink)_17%)] sm:h-[13px] ${compact ? "px-1.5" : "max-w-[64%] px-2"}`}
        >
          {address ? (
            <>
              {/* Compact windows drop the lock below lg to fit the domain. */}
              <LockGlyph className={compact ? "hidden lg:block" : undefined} />
              <span className="truncate font-mono text-[8px] leading-none tracking-[0.02em] opacity-80 sm:text-[8.5px]">{address}</span>
            </>
          ) : (
            <span className="h-[3px] w-2/5 rounded-full bg-current opacity-30" />
          )}
        </span>
        {!compact && (
          <span className="flex w-[26px] shrink-0 justify-end">
            <ScrollHint />
          </span>
        )}
      </div>

      {/* The last --wt-crop px sit under the tile edge (TileStage), so .wt-pin is the visible part.
          See .wt-pin in globals.css for the scroll math. */}
      <div
        style={{ "--wt-leg": leg, backgroundColor: page } as CSSProperties}
        className="wt-view relative min-h-0 flex-1 overflow-hidden [container-type:inline-size]"
      >
        <div className="wt-pin absolute inset-x-0 top-0 will-change-transform" style={{ height: "calc(100% - var(--wt-crop, 0px))" }}>
          <div className="wt-scroll will-change-transform">{children}</div>
        </div>
        {/* Fake scrollbar, spans the visible part of the viewport */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[3px] w-[3px]"
          style={{ right: thumbInset, height: "calc(100% - var(--wt-crop, 0px) - 6px)" }}
        >
          <span className="wt-thumb block h-[18%] w-full rounded-full bg-black/55 shadow-[0_0_0_1px_rgba(255,255,255,0.5)]" />
        </span>
      </div>
    </div>
  );
}

// Hover hint for pointer devices, fades out once the tile is hovered.
function ScrollHint() {
  return (
    <svg
      viewBox="0 0 10 14"
      className="hidden h-[10px] w-[7px] opacity-55 transition-opacity duration-300 group-hover/wt:opacity-0 group-focus-within/wt:opacity-0 motion-safe:[@media(hover:hover)]:block"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <rect x="1" y="1" width="8" height="12" rx="4" />
      <path d="M5 3.6v2.2" strokeLinecap="round" />
    </svg>
  );
}

function LockGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 12"
      className={`h-[7px] w-[6px] shrink-0 opacity-60 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="1" y="5" width="8" height="6" rx="1.2" fill="currentColor" stroke="none" />
      <path d="M3 5V3.6a2 2 0 0 1 4 0V5" />
    </svg>
  );
}
