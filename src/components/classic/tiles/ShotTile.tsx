import type { Work } from "@/content/profile";
import { ArrowIcon } from "@/components/ui/icons";
import { BrowserWindow } from "./BrowserWindow";
import { ShotImage } from "./ShotImage";
import { TileBackdrop, TileChip, TileShell, TileStage } from "./TileShell";

// Window widths for next/image. Tile is 5/12 cols from lg (capped at 1152px), 6/12 at md, full width
// below, minus 2 x 20px padding (2 x 16px on phones). Two-window tiles split 78% / 48%.
const SIZES = {
  single: "(min-width: 1152px) 390px, (min-width: 1024px) calc(41.7vw - 90px), (min-width: 768px) calc(50vw - 84px), calc(100vw - 64px)",
  main: "(min-width: 1152px) 304px, (min-width: 1024px) calc(32.5vw - 70px), (min-width: 768px) calc(39vw - 66px), calc(78vw - 50px)",
  inset: "(min-width: 1152px) 187px, (min-width: 1024px) calc(20vw - 43px), (min-width: 768px) calc(24vw - 40px), calc(48vw - 31px)",
};

// With two shots, the second window overlaps the first's lower-right corner.
export function ShotTile({ work, className }: { work: Work; className?: string }) {
  const [main, inset] = work.shots ?? [];
  if (!main) return null;

  return (
    <TileShell work={work} className={className}>
      <TileBackdrop />

      <TileStage work={work}>
        <BrowserWindow
          address={main.site}
          leg="15s"
          className={inset ? "absolute inset-y-0 left-0 w-[78%]" : "absolute inset-0"}
        >
          <ShotImage shot={main} sizes={inset ? SIZES.main : SIZES.single} />
        </BrowserWindow>

        {inset && (
          // bottom-0 so it overhangs the tile edge by the same --wt-crop as the main window
          <BrowserWindow
            address={inset.site}
            leg="10.5s"
            compact
            thumbInset="calc(15% + 3px)"
            className="absolute -right-[7%] bottom-0 top-[27%] w-[48%]"
            style={{
              boxShadow:
                "0 30px 60px -18px rgba(0,0,0,0.8), 0 0 0 1px color-mix(in oklab, var(--wt-ink) 18%, transparent)",
            }}
          >
            <ShotImage shot={inset} sizes={SIZES.inset} />
          </BrowserWindow>
        )}
      </TileStage>

      {/* Narrow tiles tighten the chip and drop the arrows below 21rem so two links fit on one row. */}
      <TileChip as="figcaption" tight>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.16em] opacity-75 @max-[23rem]/wt:tracking-[0.12em]">
          <span aria-hidden="true" className="size-[5px] rounded-full bg-[var(--wt-accent)]" />
          {/* Visually hidden at 320px so the links stay on one row */}
          <span className="@max-[19rem]/wt:sr-only">Live site</span>
        </span>
        {work.shots?.map((s) => (
          <a
            key={s.site}
            href={`https://${s.site}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.site} (opens in a new tab)`}
            // ::after pad turns the 11px text into a 27px-tall hit target without shifting layout
            className="group/link relative inline-flex items-center gap-1 rounded-sm font-mono text-[11px] leading-none @max-[23rem]/wt:text-[10.5px] decoration-[var(--wt-accent)] decoration-1 underline-offset-[4px] after:absolute after:-inset-x-1 after:-inset-y-2 after:content-[''] hover:underline focus-visible:underline focus-visible:outline-current"
          >
            {s.site}
            <ArrowIcon
              dir="up-right"
              className="size-3 text-[var(--wt-accent)] transition-transform duration-300 group-hover/link:-translate-y-px group-hover/link:translate-x-px @max-[21rem]/wt:hidden"
            />
          </a>
        ))}
      </TileChip>
    </TileShell>
  );
}
