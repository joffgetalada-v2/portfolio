import { workById } from "@/content/profile";
import storeData from "@/content/shopify-stores.json";
import { StoresMosaic } from "./tiles/StoresMosaic";

interface Store {
  name: string;
  url: string | null;
  industry: string | null;
  logo: string | null;
}

interface Group {
  label: string;
  stores: Store[];
  continued?: boolean;
}

const stores: Store[] = storeData;

// Rows shown before "Show all". The cut snaps to a group edge when one is within SNAP rows.
const PREVIEW = 24;
const SNAP = 8;

const byName = (a: Store, b: Store) => a.name.localeCompare(b.name, "en", { numeric: true, sensitivity: "base" });

// A to Z by first letter, or by industry as soon as any store has one.
function groupStores(list: Store[]): { groups: Group[]; byIndustry: boolean } {
  const byIndustry = list.some((s) => s.industry?.trim());
  const map = new Map<string, Store[]>();
  for (const s of list) {
    const first = s.name.trim().charAt(0).toUpperCase();
    const key = byIndustry ? s.industry?.trim() || "Other" : /[A-Z]/.test(first) ? first : "0–9";
    map.set(key, [...(map.get(key) ?? []), s]);
  }
  const groups = [...map]
    .map(([label, items]) => ({ label, stores: [...items].sort(byName) }))
    .sort((a, b) => {
      if (byIndustry && (a.label === "Other" || b.label === "Other")) return a.label === "Other" ? 1 : -1;
      return a.label.localeCompare(b.label, "en");
    });
  return { groups, byIndustry };
}

function splitGroups(groups: Group[]): [Group[], Group[]] {
  let cut = PREVIEW;
  let best = Infinity;
  let total = 0;
  for (const g of groups) {
    total += g.stores.length;
    const off = Math.abs(total - PREVIEW);
    if (off <= SNAP && off < best) [best, cut] = [off, total];
  }
  const head: Group[] = [];
  const tail: Group[] = [];
  let seen = 0;
  for (const g of groups) {
    const take = Math.max(0, Math.min(g.stores.length, cut - seen));
    if (take > 0) head.push({ ...g, stores: g.stores.slice(0, take) });
    if (take < g.stores.length) tail.push({ ...g, stores: g.stores.slice(take), continued: take > 0 });
    seen += g.stores.length;
  }
  return [head, tail];
}

const isWebUrl = (url: string | null): url is string => !!url && /^https?:\/\//i.test(url);

// Entry styles live on the list, so 200+ entries don't each repeat them in the page HTML.
const LIST =
  "grid grid-cols-[repeat(auto-fill,minmax(min(100%,13.5rem),1fr))] gap-x-6 gap-y-1 text-[13.5px] leading-snug " +
  "*:*:block *:*:py-1 *:*:[overflow-wrap:anywhere] *:*:text-ink-muted [&_a]:text-ink/85 [&_a]:decoration-accent " +
  "[&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-ink [&_a:hover]:underline";

export function StoreDirectory() {
  const freelance = workById.freelance;
  const { groups, byIndustry } = groupStores(stores);
  const [head, tail] = splitGroups(groups);

  return (
    <section aria-labelledby="stores-title" className="mt-20 border-t border-line pt-14 md:mt-24 md:pt-16">
      <div className="grid gap-8 md:grid-cols-12 md:gap-10">
        <StoresMosaic tile={{ ...freelance, index: undefined }} className="md:col-span-6 md:self-start lg:col-span-5" />

        <div className="min-w-0 md:col-span-6 lg:col-span-7">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted">
            <span className="text-ink">{freelance.kind}</span>
            {freelance.period && (
              <>
                <span aria-hidden="true" className="h-px w-6 bg-line" />
                <span>{freelance.period}</span>
              </>
            )}
          </p>
          <h3 id="stores-title" className="mt-4 text-[clamp(1.7rem,3.2vw,2.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-ink">
            Stores I&rsquo;ve worked on
          </h3>
          <p className="mt-6 font-serif text-[clamp(1.25rem,2vw,1.5rem)] leading-[1.3] text-ink">{freelance.summary}</p>
          <ul className="mt-6 space-y-2.5">
            {freelance.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-[15px] leading-relaxed text-ink/80">
                <span aria-hidden="true" className="mt-[0.72em] h-px w-3 shrink-0 bg-accent" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {stores.length > 0 && (
        <div className="mt-14 md:mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line pb-4">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">
              <span className="text-ink">{stores.length} stores</span> · {byIndustry ? "by industry" : "A to Z"}
            </p>
            <p className="text-[13px] text-ink-muted">Links open the live store in a new tab.</p>
          </div>

          <StoreGroups groups={head} byIndustry={byIndustry} />

          {tail.length > 0 && (
            <details className="group/more">
              <summary className="mt-6 inline-flex h-11 cursor-pointer list-none items-center gap-2.5 rounded-full border border-white/20 px-5 text-[14px] text-ink transition-colors hover:border-white/45 [&::-webkit-details-marker]:hidden">
                <span className="group-open/more:hidden">Show all {stores.length} stores</span>
                <span className="hidden group-open/more:inline">Show fewer stores</span>
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-4 text-ink-muted transition-transform duration-300 group-open/more:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <StoreGroups groups={tail} byIndustry={byIndustry} />
            </details>
          )}
        </div>
      )}
    </section>
  );
}

function StoreGroups({ groups, byIndustry }: { groups: Group[]; byIndustry: boolean }) {
  return (
    <div>
      {groups.map((g) => (
        <div
          key={`${g.label}-${g.continued ? "rest" : "head"}`}
          className={`grid gap-x-4 gap-y-3 border-b border-line py-5 ${byIndustry ? "" : "grid-cols-[2.75rem_minmax(0,1fr)] sm:grid-cols-[4rem_minmax(0,1fr)]"}`}
        >
          <h4
            className={
              byIndustry
                ? "font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink"
                : "pt-0.5 font-display text-[1.5rem] leading-none tracking-[0.02em] text-accent"
            }
          >
            {g.label}
            {g.continued && <span className="sr-only"> (continued)</span>}
          </h4>
          <ul className={LIST}>
            {g.stores.map((s, i) => (
              <li key={`${s.name}-${i}`}>
                <StoreName store={s} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function StoreName({ store }: { store: Store }) {
  const body = store.logo ? (
    <>
      {/* Logos can live on any host, so a plain img rather than next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={store.logo} alt="" width={20} height={20} loading="lazy" decoding="async" className="size-5 shrink-0 rounded-[4px] bg-white object-contain" />
      <span className="min-w-0">{store.name}</span>
    </>
  ) : (
    store.name
  );
  // Text-only entries are block (see LIST); with a logo the row lays out as flex.
  const layout = store.logo ? "!flex items-center gap-2" : undefined;
  return isWebUrl(store.url) ? (
    <a href={store.url} target="_blank" rel="noopener noreferrer" className={layout}>
      {body}
    </a>
  ) : (
    <span className={layout}>{body}</span>
  );
}
