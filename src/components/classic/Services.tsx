import { profile } from "@/content/profile";
import { projectAnchor, projectById } from "@/content/projects";

type Service = (typeof profile.services)[number];

// proofNote reads "Name: what was done. Name: ..." in proofIds order, so each name can link to its card.
function proofs(s: Service) {
  return s.proofNote.split(/(?<=\.)\s+(?=[^.:]+:)/).map((note, i) => {
    const cut = note.indexOf(":");
    const id: string | undefined = s.proofIds[i];
    return { id: id && projectById[id] ? id : null, name: note.slice(0, cut), note: note.slice(cut + 1) };
  });
}

export function Services() {
  return (
    <ol className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
      {profile.services.map((s, i) => (
        <li key={s.outcome} className="flex min-w-0 flex-col border-t border-line pt-5">
          <h3 className="flex items-baseline gap-3 text-[clamp(1.2rem,1.8vw,1.4rem)] font-medium leading-[1.2] tracking-[-0.02em] text-ink">
            <span aria-hidden="true" className="font-mono text-[11px] tracking-normal text-accent">
              {String(i + 1).padStart(2, "0")}
            </span>
            {s.outcome}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed text-ink/85">{s.problem}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-muted">{s.approach}</p>
          {/* mt-auto keeps the proof at the bottom of each item */}
          <div className="mt-auto pt-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">Proof</p>
            <ul className="mt-2 space-y-1.5 text-[14px] leading-snug text-ink-muted">
              {proofs(s).map((p) => (
                <li key={p.name}>
                  {p.id ? (
                    <a
                      href={`#${projectAnchor(p.id)}`}
                      className="text-ink underline decoration-accent/50 underline-offset-4 transition-colors hover:decoration-accent"
                    >
                      {p.name}
                    </a>
                  ) : (
                    <span className="text-ink">{p.name}</span>
                  )}
                  :{p.note}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
