import type { CSSProperties } from "react";
import Image from "next/image";
import type { Work } from "@/content/profile";
import { storeThumbs, type StoreThumb } from "@/content/stores";
import { TileChip, TileMeta, TileShell } from "./TileShell";

// Wall of store home pages in drifting columns. Each store sits in one column only, so neighbouring
// columns never show the same one.

// shift (% of wall height) staggers the rows, mostly for reduced motion where nothing moves.
const COLUMNS = [
  { dur: "46s", dir: "up", shift: 0 },
  { dur: "38s", dir: "down", shift: -7 },
  { dur: "50s", dir: "up", shift: -3 },
  { dur: "42s", dir: "down", shift: -10 },
  { dur: "48s", dir: "up", shift: 4 },
] as const;

// The marquee moves by one copy (.wt-marquee), the other copies fill the visible height meanwhile.
const COPIES = 3;

// Column width: about 24% of the tile.
const SIZES = "(min-width: 1152px) 106px, (min-width: 1024px) 10vw, (min-width: 768px) 11vw, calc(24vw - 8px)";

export function StoresMosaic({ work, className }: { work: Work; className?: string }) {
  const columns = COLUMNS.map((_, ci) => storeThumbs.filter((_, i) => i % COLUMNS.length === ci));
  const [big, ...rest] = work.title.split(" ");
  const plus = big.endsWith("+");
  const figure = plus ? big.slice(0, -1) : big;

  return (
    <TileShell work={work} className={className}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="wt-wall absolute -inset-x-[16%] -inset-y-[36%] flex rotate-[-10deg] gap-[2%]">
          {COLUMNS.map((col, ci) => (
            <div key={ci} className="min-w-0 flex-1" style={{ transform: `translateY(${col.shift}%)` }}>
              <div
                className="wt-marquee"
                data-dir={col.dir}
                style={{ "--wt-dur": col.dur, "--wt-copies": COPIES } as CSSProperties}
              >
                {Array.from({ length: COPIES }, (_, copy) => (
                  <div key={copy} aria-hidden={copy > 0 || undefined}>
                    {columns[ci].map((store) => (
                      <div key={store.domain} className="pb-[11%]">
                        <StoreCard store={store} decorative={copy > 0} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Scrims for text legibility */}
        <span className="absolute inset-x-0 top-0 h-[30%] bg-linear-to-b from-[#111111] via-[#111111]/70 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-[#111111]/85 to-transparent" />
        <span className="absolute inset-0 bg-[radial-gradient(110%_85%_at_0%_100%,#111111_16%,rgba(17,17,17,0.8)_40%,transparent_70%)]" />
      </div>

      <TileMeta work={work} />

      {/* Shared row so a narrow tile wraps the label instead of running it under the chip. */}
      <div aria-hidden="true" className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
        <div className="min-w-0">
          <p className="font-display text-[clamp(3.6rem,8.4vw,5.6rem)] leading-[0.82] tracking-[0.005em]">
            {figure}
            {plus && <span className="text-[var(--wt-accent)]">+</span>}
          </p>
          <p className="mt-2.5 flex items-start gap-2 font-mono text-[9.5px] uppercase leading-[1.3] tracking-[0.16em] opacity-85 sm:text-[10px]">
            <span className="mt-[0.5em] h-[3px] w-4 shrink-0 bg-[var(--wt-accent)]" />
            {rest.join(" ")}
          </p>
        </div>

        <TileChip place="flow">
          <span className="font-mono text-[8.5px] uppercase leading-[1.45] tracking-[0.14em] opacity-80 sm:text-[9px]">
            Stores worked on
            <br />
            Live captures
          </span>
        </TileChip>
      </div>

      <figcaption className="sr-only">Home pages of Shopify stores worked on or managed</figcaption>
    </TileShell>
  );
}

function StoreCard({ store, decorative }: { store: StoreThumb; decorative: boolean }) {
  return (
    <div className="overflow-hidden rounded-[6px] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
      <div className="flex h-[6px] items-center gap-[2.5px] bg-[#1d1d1b] px-[5px]">
        <span className="size-[2.5px] rounded-full bg-white/35" />
        <span className="size-[2.5px] rounded-full bg-white/35" />
        <span className="size-[2.5px] rounded-full bg-white/35" />
      </div>
      <Image
        src={store.src}
        alt={decorative ? "" : `${store.domain} home page`}
        width={480}
        height={300}
        sizes={SIZES}
        loading="lazy"
        draggable={false}
        className="block aspect-[8/5] h-auto w-full select-none bg-white"
      />
    </div>
  );
}
