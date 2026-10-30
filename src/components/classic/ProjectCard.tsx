import type { Project } from "@/content/projects";
import { ArrowIcon } from "@/components/ui/icons";
import { ArtisanTile } from "./tiles/ArtisanTile";
import { ShotTile } from "./tiles/ShotTile";
import type { TileInfo } from "./tiles/TileShell";
import { TypeTile } from "./tiles/TypeTile";

// Wider than the case-study tiles so a row of two cards stays short.
const RATIO = "aspect-[8/5]";

export function ProjectCard({ project, n }: { project: Project; n: number }) {
  const titleId = `project-${project.id}`;
  const meta = [
    { term: "Client", value: project.client },
    { term: "Platform", value: project.platform },
    { term: "Country", value: project.country },
    { term: "Year", value: project.year },
  ].filter((m): m is { term: string; value: string } => Boolean(m.value?.trim()));
  const tags = project.category === "shopify" ? project.subTags : [];
  const tile: TileInfo = {
    title: project.name,
    platform: project.platform,
    palette: project.palette,
    index: String(n).padStart(2, "0"),
    shots: project.screenshots,
  };

  return (
    <article aria-labelledby={titleId} className="flex min-w-0 flex-col">
      <ProjectTile project={project} tile={tile} />

      <h3 id={titleId} className="mt-7 text-[clamp(1.45rem,2.4vw,1.85rem)] font-medium leading-[1.1] tracking-[-0.025em] text-ink">
        {project.name}
      </h3>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-[13.5px]">
        {meta.map((m) => (
          <div key={m.term} className="min-w-0">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">{m.term}</dt>
            <dd className="mt-1 text-ink/90">{m.value}</dd>
          </div>
        ))}
      </dl>

      {project.scope && <p className="mt-5 text-[15px] leading-relaxed text-ink/80">{project.scope}</p>}

      {tags.length > 0 && (
        <ul aria-label="Type of work" className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li key={t} className="rounded-full border border-accent/35 bg-accent/[0.07] px-3 py-1.5 text-[12.5px] text-accent">
              {t}
            </li>
          ))}
        </ul>
      )}

      {project.stack.length > 0 && (
        <ul aria-label="Stack" className={`${tags.length > 0 ? "mt-2.5" : "mt-5"} flex flex-wrap gap-2`}>
          {project.stack.map((s) => (
            <li key={s} className="rounded-full border border-line px-3 py-1.5 font-mono text-[11px] text-ink/80">
              {s}
            </li>
          ))}
        </ul>
      )}

      {project.result && (
        <div className="mt-6 border-l border-accent pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">Result</p>
          <p className="mt-1.5 font-serif text-[1.2rem] leading-snug text-ink">{project.result}</p>
        </div>
      )}

      {project.link && (
        // mt-auto lines the links up along a row of cards
        <p className="mt-auto pt-6">
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group/visit inline-flex min-h-6 items-center gap-2 text-[14px] text-ink"
          >
            <span className="border-b border-white/25 pb-0.5 transition-colors group-hover/visit:border-accent">Visit site</span>
            <span className="sr-only">: {project.name} (opens in a new tab)</span>
            <ArrowIcon
              dir="up-right"
              className="size-3.5 text-accent transition-transform duration-300 group-hover/visit:-translate-y-px group-hover/visit:translate-x-px"
            />
          </a>
        </p>
      )}
    </article>
  );
}

function ProjectTile({ project, tile }: { project: Project; tile: TileInfo }) {
  if (project.screenshots.length) return <ShotTile tile={tile} ratio={RATIO} />;
  if (project.id === "artisan") return <ArtisanTile tile={tile} ratio={RATIO} />;
  return <TypeTile tile={tile} ratio={RATIO} />;
}
