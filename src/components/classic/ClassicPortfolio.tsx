import { profile } from "@/content/profile";
import { site } from "@/content/site";
import { Wordmark } from "@/components/ui/BrandGlyph";
import { ArrowIcon } from "@/components/ui/icons";
import { Label, Section } from "./Section";
import { WorkList } from "./WorkList";

// First sentence gets full ink, the rest is muted.
const splitAt = profile.summary.indexOf(". ") + 1;
const summaryLead = profile.summary.slice(0, splitAt);
const summaryRest = profile.summary.slice(splitAt).trim();

// Plain, crawlable version of the book content.
export function ClassicPortfolio() {
  const links = [
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "GitHub", href: profile.links.github },
    ...(profile.links.upwork ? [{ label: "Upwork", href: profile.links.upwork }] : []),
  ];

  return (
    <main id="classic" className="relative scroll-mt-0 bg-bg text-ink">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Masthead */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line pb-5 pt-24 font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted md:pt-28">
          <span>The classic page</span>
          <span>
            {profile.location} · {profile.timezone}
          </span>
        </div>

        <header className="py-16 md:py-24">
          <p className="text-[15px] text-ink-muted">
            <span className="text-ink">{profile.name}</span> · {profile.role}
          </p>
          <p className="mt-6 text-[clamp(2.1rem,7.4vw,6.6rem)] font-medium leading-[0.95] tracking-[-0.045em] text-ink">
            Senior e-commerce engineer for{" "}
            <em className="font-serif font-normal italic tracking-[-0.02em] text-accent">Shopify Plus</em>{" "}
            <span className="text-ink-muted">&amp;</span>{" "}
            <em className="font-serif font-normal italic tracking-[-0.02em] text-accent">Salesforce Commerce Cloud (Demandware)</em>.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#contact"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f3f3ef] px-5 text-[14px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
            >
              Get in Touch
              <ArrowIcon className="size-4" />
            </a>
            <a
              href={site.cvPath}
              download
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] text-ink transition-colors hover:border-white/45"
            >
              <ArrowIcon dir="down" className="size-4" />
              Download CV (PDF)
            </a>
          </div>
        </header>

        <Section id="about" n="01" title="About">
          <p className="max-w-[46rem] text-pretty text-[clamp(1.3rem,2.2vw,1.75rem)] leading-[1.32] tracking-[-0.02em] text-ink/60">
            <span className="text-ink">{summaryLead}</span> {summaryRest}
          </p>
          <p className="mt-6 max-w-[42rem] text-[16px] leading-relaxed text-ink-muted">{profile.summaryMore}</p>

          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {profile.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-3 border-t border-line pt-5">
                <dt className="max-w-[13rem] text-balance text-[13px] leading-snug text-ink-muted">{s.label}</dt>
                <dd className="order-first font-display text-[clamp(3rem,6vw,4.75rem)] leading-[0.9] tracking-[0.01em] text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {profile.strengths.map((s, i) => (
              <li key={s.title} className="border-t border-line pt-5">
                <p className="flex items-baseline gap-3">
                  <span className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[17px] font-medium tracking-[-0.015em] text-ink">{s.title}</span>
                </p>
                <p className="mt-2.5 text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="work"
          n="02"
          title={
            <>
              Selected <span className="not-italic">work</span>
            </>
          }
          wide
          aside={
            <p className="max-w-[24rem] text-[14px] leading-relaxed text-ink-muted">
              Enterprise storefronts, Shopify Plus brands, a WordPress rebuild and a long-running freelance practice.
              The same projects that fill the pages of the book.
            </p>
          }
        >
          <WorkList />
        </Section>

        <Section id="experience" n="03" title="Experience">
          <ol className="relative">
            {profile.experience.map((job) => (
              <li key={`${job.company}-${job.period}`} className="grid gap-3 border-t border-line py-8 first:border-t-0 first:pt-0 md:grid-cols-9 md:gap-8 md:py-10 md:first:pt-0">
                <div className="md:col-span-3">
                  <p className="flex items-center gap-2.5 font-mono text-[11.5px] tabular-nums text-ink">
                    <span
                      aria-hidden="true"
                      className={`size-1.5 rounded-full ${job.end === null ? "bg-accent shadow-[0_0_0_4px_rgba(217,183,126,0.15)]" : "bg-white/30"}`}
                    />
                    {job.period}
                  </p>
                  <p className="mt-1.5 pl-4 font-mono text-[11px] text-ink-muted">{job.place}</p>
                </div>
                <div className="min-w-0 md:col-span-6">
                  <h3 className="text-[clamp(1.25rem,2vw,1.5rem)] font-medium leading-snug tracking-[-0.02em] text-ink">{job.role}</h3>
                  <p className="mt-1 font-serif text-[1.2rem] italic text-ink-muted">{job.company}</p>
                  <ul className="mt-5 space-y-2.5">
                    {job.points.map((p) => (
                      <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                        <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-white/25" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="skills" n="04" title="Skills">
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {profile.skills.map((g) => (
              <div key={g.group} className="border-t border-line pt-5 sm:last:odd:col-span-2">
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">{g.group}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li key={item} className="rounded-full border border-line bg-white/[0.02] px-3 py-1.5 text-[13.5px] text-ink/90">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section
          id="education"
          n="05"
          title={
            <>
              Education <span className="not-italic text-ink-muted">&amp;</span> languages
            </>
          }
        >
          <div className="grid gap-10 sm:grid-cols-2">
            <div className="border-t border-line pt-5">
              <Label>Education</Label>
              <h3 className="mt-4 text-[20px] font-medium leading-snug tracking-[-0.02em] text-ink">{profile.education.degree}</h3>
              <p className="mt-1.5 font-serif text-[1.2rem] italic text-ink-muted">{profile.education.school}</p>
              <p className="mt-3 font-mono text-[12px] text-ink-muted">{profile.education.year}</p>
            </div>
            <div className="border-t border-line pt-5">
              <Label>Languages</Label>
              <ul className="mt-4 space-y-2">
                {profile.languages.map((l) => {
                  const [name, level] = l.split(/\s*\(/);
                  return (
                    <li key={l} className="flex flex-wrap items-baseline gap-x-2 text-[20px] font-medium tracking-[-0.02em] text-ink">
                      {name}
                      {level && <span className="text-[14px] font-normal tracking-normal text-ink-muted">({level}</span>}
                    </li>
                  );
                })}
              </ul>
              <Label className="mt-8">Markets served</Label>
              <p className="mt-3 text-[15px] leading-relaxed text-ink/85">{profile.markets.join(" · ")}</p>
            </div>
          </div>
        </Section>

        <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 border-t border-line py-20 md:py-32">
          <div className="flex items-baseline gap-3 font-mono text-[11px] text-ink-muted">
            <span className="tracking-[0.08em]">(06)</span>
            <h2 id="contact-title" className="uppercase tracking-[0.16em]">
              Contact
            </h2>
          </div>
          <p className="mt-8 max-w-[15ch] font-serif text-[clamp(2.9rem,8.4vw,7.5rem)] italic leading-[0.92] tracking-[-0.025em] text-ink">
            Let&rsquo;s build your next storefront.
          </p>
          <p className="mt-8 flex items-start gap-2.5 text-[14px] leading-relaxed text-ink-muted">
            <span aria-hidden="true" className="mt-[0.55em] size-2 shrink-0 rounded-full bg-accent" />
            {profile.availability} · {profile.location}
          </p>

          <a
            href={`mailto:${profile.email}`}
            className="group mt-10 inline-flex max-w-full items-center gap-3 border-b border-white/20 pb-2 text-[clamp(1.35rem,4.6vw,3.25rem)] font-medium tracking-[-0.035em] text-ink transition-colors hover:border-accent"
          >
            <span className="min-w-0 break-all">{profile.email}</span>
            <ArrowIcon dir="up-right" className="size-[0.8em] shrink-0 text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            <a
              href={site.cvPath}
              download
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f3f3ef] px-5 text-[14px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
            >
              <ArrowIcon dir="down" className="size-4" />
              Download CV (PDF)
            </a>
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] text-ink transition-colors hover:border-white/45"
              >
                {l.label}
                <ArrowIcon dir="up-right" className="size-4 text-ink-muted" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ))}
            {profile.showPhone && (
              <a
                href={`tel:${profile.phone.replace(/\s+/g, "")}`}
                className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 font-mono text-[13px] text-ink transition-colors hover:border-white/45"
              >
                {profile.phone}
              </a>
            )}
          </div>
        </section>
      </div>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-[13px] text-ink-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Wordmark brand={site.brand} className="text-[15px] font-medium text-ink" />
            <span aria-hidden="true" className="h-3 w-px bg-line" />
            <span>{site.brandTagline}</span>
          </p>
          <p>Built with Next.js &amp; Three.js</p>
          <a href="#book" className="inline-flex items-center gap-2 text-ink transition-colors hover:text-accent">
            Back to the book
            <ArrowIcon dir="up" className="size-4" />
          </a>
        </div>
      </footer>
    </main>
  );
}
