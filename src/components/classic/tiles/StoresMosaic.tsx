import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { works, type Work } from "@/content/profile";
import { TileChip, TileMeta, TileShell } from "./TileShell";

// Wall of mini storefronts: crops of real client captures mixed with illustrated ones.

type Category = "Apparel" | "Golf" | "Furniture" | "Gaming" | "Lifestyle";
type CardSpec = { kind: "shot"; src: string; y: number } | { kind: "art"; category: Category; alt: boolean };

const CATEGORIES: Category[] = ["Apparel", "Golf", "Furniture", "Gaming", "Lifestyle"];

// shift (% of wall height, ~half a card per 10%) keeps rows from lining up, even with reduced motion.
// Keep it within -15..+10 or a column's end shows.
const COLUMNS = [
  { dur: "50s", dir: "up", shift: 0 },
  { dur: "40s", dir: "down", shift: -5 },
  { dur: "56s", dir: "up", shift: -10 },
  { dur: "44s", dir: "down", shift: 5 },
  { dur: "52s", dir: "up", shift: 10 },
  { dur: "46s", dir: "down", shift: -15 },
] as const;
const PER_COLUMN = 5;

// Freelance clients only. Each capture shows as its top and bottom half, one per column on a staggered
// row. Art cards are dealt from a 15-card deck so the same card never repeats within three columns.
const FREELANCE_SHOTS: Work["id"][] = ["malbon", "atomic"];

function wall(): CardSpec[][] {
  const srcs = works.filter((w) => FREELANCE_SHOTS.includes(w.id)).flatMap((w) => w.shots ?? []).map((s) => s.src);
  const shots: CardSpec[] = [0, 100].flatMap((y) => srcs.map((src) => ({ kind: "shot" as const, src, y })));
  const rounds: [number[], boolean][] = [
    [[0, 1, 2, 3, 4], false],
    [[1, 3, 0, 4, 2], true],
    [[2, 4, 1, 0, 3], false],
  ];
  const art: CardSpec[] = rounds.flatMap(([order, alt]) =>
    order.map((i) => ({ kind: "art" as const, category: CATEGORIES[i], alt })),
  );
  let a = 0;
  return COLUMNS.map((_, ci) => {
    const shotRow = (ci * 2 + 1) % PER_COLUMN;
    return Array.from({ length: PER_COLUMN }, (_, k) =>
      k === shotRow && shots.length ? shots[ci % shots.length] : art[a++ % art.length],
    );
  });
}

export function StoresMosaic({ work, className }: { work: Work; className?: string }) {
  const columns = wall();
  const [big, ...rest] = work.title.split(" ");
  const plus = big.endsWith("+");
  const figure = plus ? big.slice(0, -1) : big;

  return (
    <TileShell work={work} className={className} decorative>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="wt-wall absolute -inset-x-[16%] -inset-y-[36%] flex rotate-[-10deg] gap-[2%]">
          {COLUMNS.map((col, ci) => {
            const items = columns[ci];
            return (
              <div key={ci} className="min-w-0 flex-1" style={{ transform: `translateY(${col.shift}%)` }}>
                <div className="wt-marquee" data-dir={col.dir} style={{ "--wt-dur": col.dur } as CSSProperties}>
                  {[0, 1].map((copy) =>
                    items.map((card, k) => (
                      <div key={`${copy}-${k}`} className="pb-[12%]">
                        <MiniCard card={card} />
                      </div>
                    )),
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Scrims for text legibility */}
        <span className="absolute inset-x-0 top-0 h-[30%] bg-linear-to-b from-[#111111] via-[#111111]/70 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-[#111111]/85 to-transparent" />
        <span className="absolute inset-0 bg-[radial-gradient(110%_85%_at_0%_100%,#111111_16%,rgba(17,17,17,0.8)_40%,transparent_70%)]" />
      </div>

      <TileMeta work={work} />

      {/* Shared row so a narrow tile wraps the label instead of running it under the chip. */}
      <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 sm:inset-x-5 sm:bottom-5">
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
            Live captures
            <br />+ illustration
          </span>
        </TileChip>
      </div>
    </TileShell>
  );
}

function MiniCard({ card }: { card: CardSpec }) {
  if (card.kind === "shot") {
    return (
      <Frame bar="#1d1d1b">
        <div className="relative aspect-[4/5] w-full bg-white">
          <Image
            src={card.src}
            alt=""
            fill
            sizes="(min-width: 1152px) 85px, (min-width: 1024px) 8vw, (min-width: 768px) 10vw, 20vw"
            loading="lazy"
            className="object-cover"
            style={{ objectPosition: `50% ${card.y}%` }}
          />
        </div>
      </Frame>
    );
  }

  const a = { ...ART[card.category], ...(card.alt ? ART[card.category].alt : {}) };
  // alt mirrors the hero: product left, copy right
  const textX = card.alt ? 58 : 12;
  return (
    <Frame bar={a.bar}>
      <svg viewBox="0 0 100 125" className="block aspect-[4/5] w-full">
        <rect width="100" height="125" fill={a.page} />
        {/* nav */}
        <rect x="7" y="6" width="16" height="3" rx="1.5" fill={a.ink} />
        <rect x="56" y="6.5" width="8" height="2" rx="1" fill={a.ink} opacity="0.45" />
        <rect x="68" y="6.5" width="8" height="2" rx="1" fill={a.ink} opacity="0.45" />
        <rect x="80" y="5.5" width="13" height="4" rx="2" fill={a.accent} />
        {/* hero */}
        <rect x="6" y="15" width="88" height="56" rx="3" fill={a.hero} />
        <text
          x={textX}
          y="25"
          fontSize="4.6"
          letterSpacing="0.7"
          fill={a.label}
          style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace" }}
        >
          {card.category.toUpperCase()}
        </text>
        <rect x={textX} y="31" width="30" height="4.5" rx="1" fill={a.label} />
        <rect x={textX} y="38.5" width="22" height="4.5" rx="1" fill={a.label} />
        <rect x={textX} y="49" width="18" height="6.5" rx="3.25" fill={a.accent} />
        {card.alt ? <g transform="translate(100 0) scale(-1 1)">{a.art}</g> : a.art}
        {/* copy + products */}
        <rect x="7" y="78" width="46" height="3" rx="1.5" fill={a.ink} opacity="0.8" />
        <rect x="7" y="84" width="30" height="2.5" rx="1.25" fill={a.ink} opacity="0.35" />
        {[7, 37, 67].map((x, i) => (
          <g key={x}>
            <rect x={x} y="93" width="26" height="22" rx="2" fill={a.tiles[i]} />
            <rect x={x} y="118" width="16" height="2" rx="1" fill={a.ink} opacity="0.4" />
          </g>
        ))}
      </svg>
    </Frame>
  );
}

function Frame({ bar, children }: { bar: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[7px] shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
      <div className="flex h-[7px] items-center gap-[2.5px] px-[5px]" style={{ backgroundColor: bar }}>
        <span className="size-[3px] rounded-full bg-white/35" />
        <span className="size-[3px] rounded-full bg-white/35" />
        <span className="size-[3px] rounded-full bg-white/35" />
      </div>
      {children}
    </div>
  );
}

type Palette = { page: string; bar: string; ink: string; hero: string; label: string; accent: string; tiles: string[] };

// art is drawn in the right half of the hero (x 50-92, y 17-69). alt overrides the palette when mirrored.
const ART: Record<Category, Palette & { alt: Partial<Palette>; art: ReactNode }> = {
  Apparel: {
    page: "#f4f1ec",
    bar: "#2a2724",
    ink: "#2a2724",
    hero: "#d9ccba",
    label: "#2a2724",
    accent: "#2a2724",
    tiles: ["#e3d9cc", "#cdbfae", "#e9e2d8"],
    alt: { hero: "#bccad6", page: "#eef2f5", accent: "#33495c", tiles: ["#d5dee6", "#c3cfd9", "#e2e8ee"] },
    art: (
      <g>
        <path d="M60 30L67 26.5Q73 31 79 26.5L86 30L90 39L84.5 41.5L83 37.5V64H63V37.5L61.5 41.5L56 39Z" fill="#2f2a26" />
        <path d="M67 26.5Q73 31 79 26.5" fill="none" stroke="#d9ccba" strokeWidth="1" />
      </g>
    ),
  },
  Golf: {
    page: "#eef3ea",
    bar: "#1f3b2d",
    ink: "#1f3b2d",
    hero: "#cfe0d2",
    label: "#1f3b2d",
    accent: "#e4572e",
    tiles: ["#d8e6d6", "#c3d7c4", "#e3ece0"],
    alt: { hero: "#efe3c8", page: "#f8f4ea", accent: "#1f3b2d", tiles: ["#eadfc6", "#dfe8d8", "#f1ead9"] },
    art: (
      <g>
        <ellipse cx="72" cy="70" rx="30" ry="12" fill="#5f9b5f" />
        <ellipse cx="72" cy="60" rx="8" ry="2" fill="#2f5d3a" />
        <path d="M72 60V28" stroke="#2a2a2a" strokeWidth="1.2" />
        <path d="M72 28L85 32.5L72 37Z" fill="#e4572e" />
        <circle cx="60" cy="57" r="3" fill="#ffffff" />
        <circle cx="59.2" cy="56.2" r="0.5" fill="#cfd8cf" />
      </g>
    ),
  },
  Furniture: {
    page: "#f6f1ea",
    bar: "#3b2a1e",
    ink: "#3b2a1e",
    hero: "#e7dccd",
    label: "#3b2a1e",
    accent: "#8a5a3b",
    tiles: ["#e9dfd1", "#d8c6b0", "#efe6da"],
    alt: { hero: "#d3dbcc", page: "#f1f3ed", accent: "#4f5d43", tiles: ["#dfe5d8", "#cbd4c2", "#e8ece3"] },
    art: (
      <g>
        <ellipse cx="72" cy="64.5" rx="20" ry="1.8" fill="#3b2a1e" opacity="0.15" />
        <path d="M57 46C57 41 61 39 65 39H85C88 39 90 41 90 44V48H57Z" fill="#c9a27e" />
        <path d="M61 30C61 27 63 25 66 25H83C86 25 88 27 88 30V42H61Z" fill="#b48a66" />
        <rect x="55" y="46" width="37" height="7" rx="2.5" fill="#d6b48f" />
        <path d="M60 53L57.5 64M87 53L89.5 64M66 53L65 61M81 53L82 61" stroke="#5a3d2a" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    ),
  },
  Gaming: {
    page: "#121019",
    bar: "#0b0a10",
    ink: "#e9e6ff",
    hero: "#2a1f4a",
    label: "#e9e6ff",
    accent: "#7cf2ff",
    tiles: ["#231b3d", "#2e2453", "#1c1730"],
    alt: { hero: "#3d1434", page: "#140c14", accent: "#ff5fd2", tiles: ["#2c1328", "#3a1834", "#22101f"] },
    art: (
      <g>
        <circle cx="74" cy="43" r="18" fill="#8f7bff" opacity="0.18" />
        <path
          d="M60 38C60 35 62 33 65 33H83C86 33 88 35 88 38L91 53C91.6 56 89.5 58 87 58C85 58 84 57 83 55L81 51H67L65 55C64 57 63 58 61 58C58.5 58 56.4 56 57 53Z"
          fill="#8f7bff"
        />
        <path d="M66 40V46M63 43H69" stroke="#121019" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="80" cy="41" r="1.6" fill="#7cf2ff" />
        <circle cx="83.5" cy="44.5" r="1.6" fill="#ff5fd2" />
      </g>
    ),
  },
  Lifestyle: {
    page: "#faf4ef",
    bar: "#4a3a33",
    ink: "#4a3a33",
    hero: "#efd9cc",
    label: "#4a3a33",
    accent: "#c46a4a",
    tiles: ["#f2e1d6", "#e6cbbb", "#f6ebe3"],
    alt: { hero: "#d8e6e0", page: "#f2f7f4", accent: "#3f6b5c", tiles: ["#dbe8e2", "#c9dbd3", "#e8f0ec"] },
    art: (
      <g>
        <ellipse cx="72" cy="66" rx="20" ry="1.8" fill="#4a3a33" opacity="0.15" />
        <path d="M78 46C72 40 72 30 77 22C80 30 81 39 78 46Z" fill="#7d8f6a" />
        <path d="M80 46C84 38 90 35 94 34C92 40 87 45 80 46Z" fill="#94a67f" />
        <path d="M76 46C71 41 65 40 61 41C64 45 70 47 76 46Z" fill="#94a67f" />
        <path d="M71 46H87L85 65H73Z" fill="#c46a4a" />
        <rect x="56" y="50" width="12" height="15" rx="2" fill="#f7efe6" stroke="#d9c3b4" strokeWidth="0.8" />
        <path d="M62 50V46.5" stroke="#4a3a33" strokeWidth="0.8" />
        <path d="M62 46.5C60.6 44.8 61.2 43 62 42C62.8 43 63.4 44.8 62 46.5Z" fill="#f2a541" />
      </g>
    ),
  },
};
