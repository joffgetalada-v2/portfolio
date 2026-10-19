import { works, type Work } from "@/content/profile";
import { ArtisanTile } from "./tiles/ArtisanTile";
import { ShotTile } from "./tiles/ShotTile";
import { StoresMosaic } from "./tiles/StoresMosaic";
import { TypeTile } from "./tiles/TypeTile";

export function WorkList() {
  return (
    <ol>
      {works.map((work, i) => (
        <li key={work.id} className="border-t border-line first:border-t-0 md:first:border-t">
          <WorkEntry work={work} n={i + 1} />
        </li>
      ))}
    </ol>
  );
}

function WorkEntry({ work, n }: { work: Work; n: number }) {
  const titleId = `work-${work.id}`;
  return (
    <article aria-labelledby={titleId} className="grid gap-7 py-10 md:grid-cols-12 md:gap-10 md:py-14">
      {/* 6/12 at md: 5/12 is too narrow for the tile labels and windows. */}
      <WorkTile work={work} className="md:col-span-6 lg:col-span-5" />

      <div className="min-w-0 md:col-span-6 lg:col-span-7">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
          <span className="text-ink">{String(n).padStart(2, "0")}</span>
          <span aria-hidden="true" className="h-px w-6 bg-line" />
          <span>{work.kind}</span>
        </div>

        <h3 id={titleId} className="mt-4 text-[clamp(1.7rem,3.2vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
          {work.title}
        </h3>

        <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13.5px] sm:gap-x-8">
          <Meta term="Client" value={work.client} />
          <Meta term="Platform" value={work.platform} />
          <Meta term="Role" value={work.role} />
          {work.period && <Meta term="Period" value={work.period} />}
        </dl>

        <p className="mt-7 font-serif text-[clamp(1.3rem,2.2vw,1.6rem)] leading-[1.3] text-ink">{work.summary}</p>

        <ul className="mt-6 space-y-2.5">
          {work.highlights.map((h) => (
            <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
              <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-accent" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <ul aria-label="Stack" className="mt-7 flex flex-wrap gap-2">
          {work.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-ink/80">
              {s}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function Meta({ term, value }: { term: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{term}</dt>
      <dd className="mt-1 text-ink/90">{value}</dd>
    </div>
  );
}

function WorkTile({ work, className }: { work: Work; className?: string }) {
  if (work.shots?.length) return <ShotTile work={work} className={className} />;
  if (work.id === "artisan") return <ArtisanTile work={work} className={className} />;
  if (work.id === "freelance") return <StoresMosaic work={work} className={className} />;
  return <TypeTile work={work} className={className} />;
}
