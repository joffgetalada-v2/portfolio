import { titleLines } from "@/components/ui/titleLines";
import { TileMeta, TileShell, type TileInfo } from "./TileShell";

// Fallback for work with no screenshots or illustration. Type scales with the tile width.
export function TypeTile({ tile, className, ratio }: { tile: TileInfo; className?: string; ratio?: string }) {
  return (
    <TileShell tile={tile} className={className} ratio={ratio} decorative>
      <span className="absolute right-0 top-[46%] -z-10 aspect-square w-[44%] -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--wt-accent)]" />
      <span className="absolute right-0 top-[46%] -z-10 aspect-square w-[64%] -translate-y-1/2 translate-x-1/2 rounded-full border border-[var(--wt-accent)] opacity-40" />
      <TileMeta tile={tile} />
      <p className="absolute bottom-4 left-4 max-w-[72%] font-display text-[clamp(1.75rem,8.5cqw,3rem)] uppercase leading-[0.9] sm:bottom-5 sm:left-5">
        {titleLines(tile.title).map((line) => (
          <span key={line} className="block text-balance">
            {line}{" "}
          </span>
        ))}
      </p>
    </TileShell>
  );
}
