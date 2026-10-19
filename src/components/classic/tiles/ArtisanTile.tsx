import type { CSSProperties } from "react";
import type { Work } from "@/content/profile";
import { BrowserWindow } from "./BrowserWindow";
import { TileBackdrop, TileChip, TileShell, TileStage } from "./TileShell";

// No screenshot for this project, so the window shows an illustrated storefront.
export function ArtisanTile({ work, className }: { work: Work; className?: string }) {
  return (
    <TileShell work={work} className={className} decorative>
      <TileBackdrop />

      <TileStage work={work}>
        <BrowserWindow leg="12s" page={C.page} className="absolute inset-0">
          <Storefront />
        </BrowserWindow>
      </TileStage>

      <TileChip>
        <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase leading-none tracking-[0.16em]">
          <span className="size-[5px] rounded-full border border-current opacity-70" />
          Illustration
        </span>
      </TileChip>
    </TileShell>
  );
}

// SVG grid size. Animated parts are HTML layers on top, positioned in % of it via box().
const W = 400;
const H = 640;
const C = {
  page: "#faf6ef",
  ink: "#2b211a",
  terra: "#a4532f",
  terraLight: "#b8613a",
  ochre: "#d9a441",
  cream: "#f3e7d3",
  brown: "#4a2f20",
  kraft: "#c79a62",
  sage: "#7d8a6a",
  muted: "#9b8875",
  line: "#e6dccd",
};

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

const CARDS = [
  { x: 16, y: 172, w: 86, name: 52 },
  { x: 112, y: 172, w: 86, name: 40 },
  { x: 208, y: 172, w: 86, name: 58 },
  { x: 304, y: 172, w: 86, name: 46 },
  { x: 16, y: 290, w: 182, name: 70 },
  { x: 208, y: 290, w: 86, name: 44 },
  { x: 304, y: 290, w: 86, name: 50 },
];

function Storefront() {
  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 block size-full" aria-hidden="true">
        <defs>
          <pattern id="ac-wicker" width="6" height="7" patternUnits="userSpaceOnUse">
            <rect width="6" height="7" fill={C.kraft} />
            <path d="M0 3.5H6M1.5 0V3.5M4.5 3.5V7" stroke="#a27845" strokeWidth="1" />
          </pattern>
          <pattern id="ac-weft" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect width="1.5" height="1.5" fill="#000" opacity="0.08" />
            <rect x="1.5" y="1.5" width="1.5" height="1.5" fill="#000" opacity="0.08" />
          </pattern>
        </defs>

        <rect width={W} height={H} fill={C.page} />

        {/* Announcement bar */}
        <rect width={W} height="12" fill={C.terra} />
        <Bar x={150} y={4.75} w={100} h={2.5} fill={C.cream} opacity={0.85} />

        {/* Header */}
        <rect y="39" width={W} height="1" fill={C.line} />
        <circle cx="24" cy="25.5" r="7" fill="none" stroke={C.terra} strokeWidth="2" />
        <circle cx="24" cy="25.5" r="2.5" fill={C.terra} />
        <Bar x={36} y={21} w={44} h={4.5} fill={C.ink} />
        <Bar x={36} y={28} w={28} h={2.5} fill="#b9a58c" />
        {[
          [150, 20],
          [180, 24],
          [214, 18],
          [242, 22],
        ].map(([x, w]) => (
          <Bar key={x} x={x} y={24.5} w={w} h={2.5} fill="#6b5a4a" />
        ))}
        <g fill="none" stroke={C.ink} strokeWidth="1.4" strokeLinecap="round">
          <circle cx="314" cy="25" r="3.6" />
          <path d="M316.7 27.7L319 30" />
          <circle cx="331" cy="23.4" r="2.4" />
          <path d="M326.6 30.6C326.6 27.2 335.4 27.2 335.4 30.6" />
        </g>
        <rect x="344" y="17" width="40" height="17" rx="8.5" fill={C.ink} />
        <path d="M352 23.2H360L359.2 30.6H352.8Z" fill={C.cream} />
        <path d="M354 23.2V22a2 2 0 0 1 4 0v1.2" fill="none" stroke={C.cream} strokeWidth="1" />
        <Bar x={364} y={24.25} w={13} h={2.5} fill={C.cream} opacity={0.7} />
        <circle cx="385" cy="17" r="5.5" fill={C.terra} stroke={C.page} strokeWidth="1.5" />
        <text x="385" y="19.3" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="system-ui, sans-serif">
          2
        </text>

        {/* Hero base, the kilim layer animates over it */}
        <rect y="40" width={W} height="96" fill={C.terraLight} />

        {/* Section heading */}
        <Bar x={16} y={149} w={74} h={6} fill={C.ink} />
        <Bar x={16} y={159} w={120} h={2.5} fill={C.muted} />
        <Bar x={334} y={152} w={34} h={2.5} fill={C.terra} />
        <path d="M372 153.25h9m-2.6-2.6 2.6 2.6-2.6 2.6" fill="none" stroke={C.terra} strokeWidth="1.2" strokeLinecap="round" />

        {/* Product grid */}
        <g transform="translate(16 172)">
          <Card w={86} fill="#eadccb" />
          <Vase />
        </g>
        <g transform="translate(112 172)">
          <Card w={86} fill="#e4d6c2" />
          <Bowl />
        </g>
        <g transform="translate(208 172)">
          <Card w={86} fill="#ece2d3" />
          <Basket />
        </g>
        <g transform="translate(304 172)">
          <Card w={86} fill="#e8dccd" />
          <Mug />
        </g>
        <g transform="translate(16 290)">
          <Card w={182} fill="#e6d9c6" />
          <Rug />
        </g>
        <g transform="translate(208 290)">
          <Card w={86} fill="#ebe1d2" />
          <Pitcher />
        </g>
        <g transform="translate(304 290)">
          <Card w={86} fill="#e9dfcf" />
          <Planter />
        </g>
        {CARDS.map((c) => (
          <g key={`${c.x}-${c.y}`}>
            <Bar x={c.x} y={c.y + 93} w={c.name} h={3.5} fill={C.ink} opacity={0.8} />
            <Bar x={c.x} y={c.y + 100} w={22} h={3.5} fill={C.terra} />
          </g>
        ))}

        {/* Story band: loom */}
        <rect y="410" width={W} height="110" fill="#ebdcc6" />
        <g transform="translate(16 422)">
          <rect width="170" height="86" rx="4" fill="#d9c3a3" />
          {Array.from({ length: 22 }, (_, i) => (
            <line key={i} x1={22 + i * 6} y1="12" x2={22 + i * 6} y2="74" stroke={C.cream} strokeWidth="0.9" />
          ))}
          <rect x="18" y="46" width="134" height="7" fill={C.terra} />
          <rect x="18" y="53" width="134" height="5" fill={C.ochre} />
          <rect x="18" y="58" width="134" height="8" fill={C.brown} />
          <path
            d="M18 65 l5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5 5-5 5 5"
            fill="none"
            stroke={C.cream}
            strokeWidth="1.1"
          />
          <rect x="18" y="66" width="134" height="8" fill={C.terraLight} />
          <rect x="18" y="46" width="134" height="28" fill="url(#ac-weft)" />
          <rect x="12" y="8" width="146" height="5" rx="2" fill="#6b4a32" />
          <rect x="12" y="73" width="146" height="5" rx="2" fill="#6b4a32" />
          <rect x="38" y="37" width="62" height="4" rx="2" fill="#8f6a3e" />
          <path d="M100 39c12 0 18 3 24 7" fill="none" stroke={C.terra} strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <Bar x={204} y={432} w={34} h={2.5} fill={C.terra} />
        <Bar x={204} y={441} w={150} h={7} fill={C.ink} />
        <Bar x={204} y={452} w={108} h={7} fill={C.ink} />
        {[170, 162, 168, 120].map((w, i) => (
          <Bar key={i} x={204} y={467 + i * 6} w={w} h={2.5} fill="#8d7a66" />
        ))}
        <Bar x={204} y={497} w={54} h={3} fill={C.terra} />

        {/* Newsletter */}
        <rect y="532" width={W} height="52" fill={C.ink} />
        <Bar x={16} y={546} w={120} h={6} fill={C.cream} />
        <Bar x={16} y={557} w={160} h={2.5} fill="#b9a58c" />
        <rect x="214.5" y="548.5" width="119" height="19" rx="9.5" fill="none" stroke="#6b5a4a" />
        <Bar x={226} y={556.75} w={50} h={2.5} fill="#8d7a66" />
        <rect x="338" y="548" width="46" height="20" rx="10" fill={C.terra} />
        <Bar x={350} y={556.75} w={22} h={2.5} fill={C.cream} />

        {/* Footer */}
        <rect y="584" width={W} height="56" fill="#f1e8db" />
        <circle cx="24" cy="604" r="6" fill="none" stroke={C.terra} strokeWidth="1.6" />
        {[120, 200, 280].map((x) => (
          <g key={x}>
            <Bar x={x} y={597} w={30} h={3} fill={C.ink} />
            {[40, 34, 38].map((w, i) => (
              <Bar key={i} x={x} y={605 + i * 6} w={w} h={2.2} fill="#a8957f" />
            ))}
          </g>
        ))}
        <rect y="627" width={W} height="0.8" fill="#ddcfbb" />
        <Bar x={16} y={632} w={60} h={2} fill="#b9a58c" />
      </svg>

      {/* 200% wide with a 40-unit repeat, so translateX(-50%) loops seamlessly. */}
      <div aria-hidden="true" className="absolute overflow-hidden" style={box(0, 40, W, 96)}>
        <svg viewBox="0 0 800 96" preserveAspectRatio="none" className="wt-weave block h-full w-[200%]">
          <defs>
            <Kilim />
          </defs>
          <rect width="800" height="96" fill="url(#ac-kilim)" />
          <rect width="800" height="96" fill="url(#ac-weft-hero)" />
        </svg>
      </div>

      {/* Hero copy card */}
      <div aria-hidden="true" className="absolute shadow-[0_8px_18px_-8px_rgba(43,33,26,0.55)]" style={box(22, 56, 176, 64)}>
        <svg viewBox="0 0 176 64" className="block size-full">
          <rect width="176" height="64" rx="4" fill={C.page} />
          <Bar x={12} y={11} w={34} h={2.5} fill={C.terra} />
          <Bar x={12} y={19} w={130} h={7} fill={C.ink} />
          <Bar x={12} y={30} w={94} h={7} fill={C.ink} />
          <Bar x={12} y={42} w={112} h={2.5} fill={C.muted} />
          <rect x="12" y="49" width="46" height="10" rx="5" fill={C.terra} />
          <Bar x={21} y={52.75} w={28} h={2.5} fill={C.cream} />
        </svg>
      </div>

      {/* 7 cards x 2s delay = the 14s wt-pick cycle. wt-ping runs on the same 2s beat. */}
      {CARDS.map((c, i) => (
        <span
          key={`pick-${c.x}-${c.y}`}
          aria-hidden="true"
          data-still={i === 0 ? "" : undefined}
          className="wt-pick absolute rounded-[3px] shadow-[inset_0_0_0_1.5px_#a4532f,0_0_0_3px_rgba(164,83,47,0.16)]"
          style={{ ...box(c.x, c.y, c.w, 86), animationDelay: `${i * 2}s` }}
        >
          <span className="absolute bottom-[7%] right-[6%] grid size-[4.6cqw] place-items-center rounded-full bg-[#2b211a] text-[#f3e7d3] shadow-[0_2px_6px_rgba(43,33,26,0.35)]">
            <svg viewBox="0 0 10 10" className="size-[55%]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M5 1.5v7M1.5 5h7" />
            </svg>
          </span>
        </span>
      ))}
      <span
        aria-hidden="true"
        className="wt-ping absolute aspect-square rounded-full border-[1.5px] border-[#a4532f]"
        style={{ left: `${(379.5 / W) * 100}%`, top: `${(11.5 / H) * 100}%`, width: `${(11 / W) * 100}%` }}
      />
    </div>
  );
}

function Bar({ x, y, w, h, fill, opacity }: { x: number; y: number; w: number; h: number; fill: string; opacity?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={Math.min(h / 2, 1.5)} fill={fill} opacity={opacity} />;
}

function Card({ w, fill }: { w: number; fill: string }) {
  return <rect width={w} height="86" rx="4" fill={fill} />;
}

function Shadow({ cx, cy, rx }: { cx: number; cy: number; rx: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry="2.6" fill={C.ink} opacity="0.14" />;
}

function Vase() {
  return (
    <g>
      <Shadow cx={43} cy={76} rx={17} />
      <path
        d="M35 13H51C51 16 48 17.5 48 21C48 27 64 31 64 47C64 61 55 69 52.5 76H33.5C31 69 22 61 22 47C22 31 38 27 38 21C38 17.5 35 16 35 13Z"
        fill="#b65d36"
      />
      <path d="M25 41.5H61" stroke="#f3e2cc" strokeWidth="1.4" />
      <path d="M25.5 52l4.5-4 4.5 4 4.5-4 4.5 4 4.5-4 4.5 4 4.5-4 4.5 4" fill="none" stroke="#f3e2cc" strokeWidth="1.2" />
      <path d="M27 58.5H59" stroke="#f3e2cc" strokeWidth="1.4" />
      <path d="M29.5 34C26.5 40 26.5 51 30.5 60" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Bowl() {
  return (
    <g>
      <Shadow cx={43} cy={69} rx={21} />
      <rect x="34" y="64" width="18" height="5" rx="1.5" fill="#b07a36" />
      <path d="M13 40H73C73 57 61 66 43 66C25 66 13 57 13 40Z" fill={C.ochre} />
      <ellipse cx="43" cy="40" rx="30" ry="5.5" fill="#7a4a26" />
      <ellipse cx="43" cy="40.6" rx="26.5" ry="3.8" fill="#5e3820" />
      <path d="M18 49C30 55.5 56 55.5 68 49" fill="none" stroke="#f3e2cc" strokeWidth="1.3" opacity="0.85" />
      <path d="M22 55C33 60 53 60 64 55" fill="none" stroke="#b07a36" strokeWidth="1" />
      <g fill="#7a4a26" opacity="0.5">
        <circle cx="30" cy="59" r="0.8" />
        <circle cx="51" cy="61" r="0.8" />
        <circle cx="60" cy="52" r="0.8" />
      </g>
    </g>
  );
}

function Basket() {
  return (
    <g>
      <Shadow cx={43} cy={74} rx={20} />
      <path d="M27 36C27 12 59 12 59 36" fill="none" stroke="#8f6a3e" strokeWidth="3" strokeLinecap="round" />
      <path d="M19 36H67L61 73H25Z" fill="url(#ac-wicker)" />
      <path d="M19 36H67L61 73H25Z" fill="none" stroke="#8f6a3e" strokeWidth="0.8" />
      <rect x="17" y="33" width="52" height="5" rx="2.5" fill="#9c7343" />
      <rect x="23" y="62" width="40" height="3" fill={C.terra} opacity="0.9" />
    </g>
  );
}

function Mug() {
  return (
    <g>
      <Shadow cx={40} cy={73} rx={18} />
      <path d="M55 38C66 38 66 58 55 58" fill="none" stroke="#d8c8b2" strokeWidth="5" />
      <path d="M55 38C66 38 66 58 55 58" fill="none" stroke="#f4ece0" strokeWidth="3" />
      <rect x="23" y="30" width="33" height="42" rx="5" fill="#f4ece0" />
      <rect x="23" y="30" width="33" height="42" rx="5" fill="none" stroke="#d8c8b2" strokeWidth="0.8" />
      <path
        d="M23 35C23 32 25 30 28 30H51C54 30 56 32 56 35V40C54 40 54 45 51.5 45C49 45 49 39 46.5 39C44 39 44 47 41 47C38 47 38 40 35.5 40C33 40 33 44 30 44C27 44 27 40 23 40Z"
        fill={C.terra}
      />
      <ellipse cx="39.5" cy="30.5" rx="16.5" ry="2" fill="#7f3d21" />
      <path d="M34 23c-2-3 2-5 0-8M44 23c-2-3 2-5 0-8" fill="none" stroke="#b9a58c" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function Rug() {
  const fringe = Array.from({ length: 12 }, (_, i) => 24 + i * 4)
    .map((y) => `M25 ${y}h5M152 ${y}h5`)
    .join("");
  return (
    <g>
      <rect x="32" y="23" width="122" height="52" fill={C.ink} opacity="0.12" />
      <path d={fringe} stroke="#ead8bb" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="30" y="20" width="122" height="52" fill={C.terra} />
      <rect x="34" y="24" width="114" height="44" fill="none" stroke="#f2e2c9" strokeWidth="1.6" />
      <rect x="38" y="28" width="106" height="36" fill="#5a3826" />
      {[58, 91, 124].map((cx) => (
        <g key={cx}>
          <polygon points={`${cx},31 ${cx + 14},46 ${cx},61 ${cx - 14},46`} fill={C.ochre} />
          <polygon points={`${cx},37 ${cx + 8},46 ${cx},55 ${cx - 8},46`} fill={C.terra} />
          <polygon points={`${cx},42 ${cx + 3.5},46 ${cx},50 ${cx - 3.5},46`} fill="#f2e2c9" />
        </g>
      ))}
      <rect x="30" y="20" width="122" height="52" fill="url(#ac-weft)" />
    </g>
  );
}

function Pitcher() {
  return (
    <g>
      <Shadow cx={43} cy={75} rx={16} />
      <path d="M53 26C66 28 66 52 55 60" fill="none" stroke="#6f7d5c" strokeWidth="4" strokeLinecap="round" />
      <path d="M27 13L36 19C29 30 26 50 31 74H55C60 50 57 30 50 19L53 13Z" fill={C.sage} />
      <path d="M29.5 40H57" stroke="#efe3d1" strokeWidth="2" />
      <g fill="#efe3d1">
        {[33, 38, 43, 48, 53].map((x) => (
          <circle key={x} cx={x} cy="48" r="1.2" />
        ))}
      </g>
      <path d="M33.5 26C30.5 36 30 52 33 64" fill="none" stroke="#fff" strokeOpacity="0.2" strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Planter() {
  return (
    <g>
      <Shadow cx={43} cy={75} rx={15} />
      <path d="M43 50C30 44 24 30 28 18C38 24 44 36 43 50Z" fill="#6f7d5c" />
      <path d="M43 50C56 44 62 30 58 18C48 24 42 36 43 50Z" fill="#8a9a7b" />
      <path d="M43 50C40 36 42 22 43 10C46 22 47 36 43 50Z" fill="#5d6b4c" />
      <path d="M43 50C34 46 22 44 16 36C28 34 38 40 43 50Z" fill="#8a9a7b" />
      <path d="M43 50C52 46 64 44 70 36C58 34 48 40 43 50Z" fill="#6f7d5c" />
      <path d="M28 50H58L54 75H32Z" fill="#c8693f" />
      <rect x="26" y="48" width="34" height="6" rx="1.5" fill={C.terra} />
      <path d="M31 63H55" stroke="#f2e2c9" strokeWidth="1.2" />
    </g>
  );
}

// One 40 x 96 tile of the kilim pattern.
function Kilim() {
  const zig = (y0: number, y1: number) =>
    Array.from({ length: 8 }, (_, i) => `L${i * 5 + 5} ${i % 2 === 0 ? y1 : y0}`).join(" ");
  return (
    <>
      <pattern id="ac-kilim" width="40" height="96" patternUnits="userSpaceOnUse">
        <rect width="40" height="96" fill={C.terraLight} />
        <rect width="40" height="7" fill={C.brown} />
        <path d={`M0 7 ${zig(7, 2)} Z`} fill={C.cream} />
        <rect y="7" width="40" height="2" fill={C.ochre} />
        <polygon points="20,12 34,26 20,40 6,26" fill={C.cream} />
        <polygon points="20,17 29,26 20,35 11,26" fill={C.ochre} />
        <polygon points="20,22 24,26 20,30 16,26" fill={C.brown} />
        <polygon points="0,15 9,26 0,37" fill={C.brown} />
        <polygon points="40,15 31,26 40,37" fill={C.brown} />
        <rect y="42" width="40" height="8" fill={C.cream} />
        <path d={`M0 49 ${zig(49, 43)}`} fill="none" stroke={C.terra} strokeWidth="1.6" />
        <rect y="50" width="40" height="34" fill={C.brown} />
        <polygon points="0,56 12,68 0,80" fill={C.terraLight} />
        <polygon points="40,56 28,68 40,80" fill={C.terraLight} />
        <polygon points="20,61 27,68 20,75 13,68" fill={C.ochre} />
        <rect x="19" y="56" width="2" height="2" fill={C.cream} />
        <rect x="19" y="78" width="2" height="2" fill={C.cream} />
        <rect y="84" width="40" height="5" fill={C.ochre} />
        {[3, 13, 23, 33].map((x) => (
          <rect key={x} x={x} y="85.5" width="4" height="2" fill={C.brown} />
        ))}
        <rect y="89" width="40" height="7" fill={C.cream} />
        <path d={`M0 96 ${zig(96, 90)} Z`} fill={C.terraLight} />
      </pattern>
      <pattern id="ac-weft-hero" width="3" height="3" patternUnits="userSpaceOnUse">
        <rect width="1.5" height="1.5" fill="#000" opacity="0.08" />
        <rect x="1.5" y="1.5" width="1.5" height="1.5" fill="#000" opacity="0.08" />
      </pattern>
    </>
  );
}
