import type { Work } from "@/content/profile";
import { titleLines } from "@/components/ui/titleLines";
import { TileMeta, TileShell } from "./TileShell";

// Fallback for work with no screenshots or illustration.
export function TypeTile({ work, className }: { work: Work; className?: string }) {
  return (
    <TileShell work={work} className={className} decorative>
      <span className="absolute right-0 top-[46%] -z-10 aspect-square w-[44%] -translate-y-1/2 translate-x-1/2 rounded-full bg-[var(--wt-accent)]" />
      <span className="absolute right-0 top-[46%] -z-10 aspect-square w-[64%] -translate-y-1/2 translate-x-1/2 rounded-full border border-[var(--wt-accent)] opacity-40" />
      <TileMeta work={work} />
      <p className="absolute bottom-4 left-4 max-w-[72%] font-display text-[clamp(1.9rem,3.6vw,3rem)] uppercase leading-[0.9] sm:bottom-5 sm:left-5">
        {titleLines(work.title).map((line) => (
          <span key={line} className="block text-balance">
            {line}{" "}
          </span>
        ))}
      </p>
    </TileShell>
  );
}
