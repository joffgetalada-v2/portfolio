import type { ReactNode } from "react";

export function Section({
  id,
  n,
  title,
  aside,
  children,
  wide = false,
}: {
  id: string;
  n: string;
  title: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  /** Put the heading above the content instead of beside it. */
  wide?: boolean;
}) {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20 border-t border-line py-20 md:py-28">
      <div className={wide ? "grid gap-10 md:gap-14" : "grid gap-10 md:grid-cols-12 md:gap-8"}>
        <div className={wide ? "flex flex-wrap items-end justify-between gap-6" : "md:col-span-4 lg:col-span-3"}>
          <div className={wide ? "" : "md:sticky md:top-28"}>
            <p className="font-mono text-[11px] tracking-[0.08em] text-ink-muted">({n})</p>
            <h2
              id={headingId}
              className="mt-3 font-serif text-[clamp(2.6rem,5.4vw,4rem)] italic leading-[0.95] tracking-[-0.015em] text-ink"
            >
              {title}
            </h2>
          </div>
          {aside}
        </div>
        <div className={wide ? "" : "min-w-0 md:col-span-8 lg:col-span-9"}>{children}</div>
      </div>
    </section>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted ${className ?? ""}`}>{children}</p>
  );
}
