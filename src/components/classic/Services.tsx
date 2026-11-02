import { profile } from "@/content/profile";
import { projectAnchor, projectById } from "@/content/projects";
import { ServicePicker } from "./ServicePicker";

type Service = (typeof profile.services)[number];

// proofNote reads "Name: what was done. Name: ..." in proofIds order, so each name can link to its card.
function proofs(s: Service) {
  return s.proofNote.split(/(?<=\.)\s+(?=[^.:]+:)/).map((note, i) => {
    const cut = note.indexOf(":");
    const id: string | undefined = s.proofIds[i];
    return { id: id && projectById[id] ? id : null, name: note.slice(0, cut), note: note.slice(cut + 1) };
  });
}

const LABEL = "font-mono text-[10px] uppercase tracking-[0.16em]";

export function Services() {
  return (
    <ServicePicker
      prompt="What's costing you sales?"
      items={profile.services.map((s) => ({ title: s.outcome, content: <ServiceBody s={s} /> }))}
    />
  );
}

function ServiceBody({ s }: { s: Service }) {
  return (
    <>
      <p className={`${LABEL} text-ink-muted`}>The problem</p>
      {/* The owner's pain, so it gets the largest type */}
      <p className="mt-2.5 text-pretty font-serif text-[clamp(1.4rem,2.3vw,1.8rem)] leading-[1.18] text-ink">{s.problem}</p>

      <p className={`${LABEL} mt-8 text-ink-muted`}>What I do</p>
      <p className="mt-2.5 max-w-[40rem] text-[15px] leading-relaxed text-ink/80">{s.approach}</p>

      {"result" in s && (
        <div className="mt-7 rounded-[12px] border border-accent/35 bg-accent/[0.07] px-4 py-3.5 sm:px-5 sm:py-4">
          <p className={`${LABEL} text-accent`}>Typical result</p>
          <p className="mt-1.5 text-[15px] leading-snug text-ink">{s.result}</p>
        </div>
      )}

      <p className={`${LABEL} mt-8 text-ink-muted`}>Proof</p>
      <ul className="mt-2.5 space-y-1.5 text-[14px] leading-snug text-ink-muted">
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
    </>
  );
}
