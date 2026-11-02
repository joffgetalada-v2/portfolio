"use client";

import { type CSSProperties, useEffect, useRef } from "react";

// One small animated scene per service, in profile.services order. Decorative: the text beside it says
// the same thing. Loaded on demand by ServicePicker, so none of this is in the server HTML.

const W = 400;
const H = 200;
const BAR = 22;

// Resting style is the end state, which is all that shows when motion is reduced. Every animation in a
// scene shares its length (--sv-t), so a scene stays in sync.
const anim = (name: string, rest: string, frames: string, ease = "ease-in-out") =>
  `.${name}{${rest};animation:${name} var(--sv-t) ${ease} infinite}@keyframes ${name}{${frames}}`;
const range = [0, 1, 2, 3];
const OUT = "cubic-bezier(.22,1,.36,1)";

// Colours as fill (sv-f-) and stroke (sv-s-) classes, with the strength in fillOpacity/strokeOpacity, so
// they live here rather than in the site-wide CSS.
const TONES = { ink: "--ink", accent: "--accent", bg: "--bg", bad: "--sv-bad", good: "--sv-good" };

const css = [
  ".sv{--sv-bad:#e0705c;--sv-good:#6cc58a;animation:sv-show .5s ease-out both}",
  "@keyframes sv-show{from{opacity:0}}",
  ...Object.entries(TONES).map(([k, v]) => `.sv-f-${k}{fill:var(${v})}.sv-s-${k}{stroke:var(${v})}`),
  // Paused until on screen, see ServiceVisual.
  ".sv:not([data-play]) *{animation-play-state:paused}",
  ".sv1-ping,.sv5-done{transform-box:fill-box;transform-origin:center}",
  // Fades the moving parts out and back in, so a scene can reset without running backwards.
  anim("sv-loop", "opacity:1", "0%{opacity:0}4%,94%{opacity:1}100%{opacity:0}", "linear"),

  anim("sv1-pointer", "transform:translate(262px,112px)", "0%,6%{transform:translate(262px,112px)}17%,21%{transform:translate(174px,17px)}33%,44%{transform:translate(202px,72px)}58%,100%{transform:translate(262px,112px)}"),
  anim("sv1-hover", "opacity:0", "0%,15%{opacity:0}18%,44%{opacity:1}48%,100%{opacity:0}"),
  anim("sv1-menu", "opacity:0", "0%,18%{opacity:0;transform:translateY(-5px)}24%,44%{opacity:1;transform:none}50%,100%{opacity:0;transform:translateY(-5px)}"),
  anim("sv1-pick", "opacity:0", "0%,31%{opacity:0}34%,46%{opacity:1}50%,100%{opacity:0}"),
  anim("sv1-ping", "opacity:0", "0%,36%{opacity:0;transform:scale(.4)}38%{opacity:1;transform:scale(.4)}46%,100%{opacity:0;transform:scale(1.8)}", "ease-out"),
  anim("sv1-card", "opacity:1", "0%{opacity:1}6%,56%{opacity:0}62%,100%{opacity:1}"),

  // --b/--bw: the before band's start and width out of 100, --a/--aw: the after band's.
  anim("sv2-fill", "stroke:var(--accent);stroke-dasharray:var(--a) 100", "0%,30%{stroke:var(--sv-bad);stroke-dasharray:var(--b) 100}56%,100%{stroke:var(--accent);stroke-dasharray:var(--a) 100}"),
  anim("sv2-band", "stroke:var(--accent);stroke-dasharray:var(--aw) 100;stroke-dashoffset:calc(var(--a) * -1)", "0%,30%{stroke:var(--sv-bad);stroke-dasharray:var(--bw) 100;stroke-dashoffset:calc(var(--b) * -1)}56%,100%{stroke:var(--accent);stroke-dasharray:var(--aw) 100;stroke-dashoffset:calc(var(--a) * -1)}"),
  anim("sv2-was", "opacity:0", "0%,32%{opacity:1}40%,100%{opacity:0}"),
  anim("sv2-now", "opacity:1", "0%,42%{opacity:0}52%,100%{opacity:1}"),
  ".sv2-ghost{display:none}",

  ...range.map((k) => anim(`sv3-b${k}`, "opacity:1", `0%,${8 + 12 * k}%{opacity:0;transform:translateX(-56px)}${16 + 12 * k}%,100%{opacity:1;transform:none}`, OUT)),
  ...range.map((k) => anim(`sv3-c${k}`, "opacity:0", `0%,${5 + 12 * k}%{opacity:0}${8 + 12 * k}%,${16 + 12 * k}%{opacity:1}${20 + 12 * k}%,100%{opacity:0}`)),

  anim("sv4-scan", "opacity:0;transform:translateY(186px)", "0%{opacity:0;transform:translateY(8px)}4%{opacity:1}32%{opacity:1;transform:translateY(186px)}36%,100%{opacity:0;transform:translateY(186px)}", "linear"),
  anim("sv4-fault", "opacity:0", "0%,21%{opacity:0}24%,46%{opacity:1}52%,100%{opacity:0}"),
  anim("sv4-fixed", "opacity:1", "0%,48%{opacity:0}56%,100%{opacity:1}"),
  anim("sv4-broken", "opacity:0", "0%,60%{opacity:1}66%,100%{opacity:0}"),
  anim("sv4-ok", "opacity:1", "0%,62%{opacity:0}68%,100%{opacity:1}"),

  ...range.slice(0, 3).map((k) => anim(`sv5-t${k}`, "transform:translateX(264px)", `0%,${10 + 14 * k}%{transform:none}${30 + 14 * k}%,100%{transform:translateX(264px)}`)),
  anim("sv5-done", "opacity:1", "0%,62%{opacity:0;transform:scale(.6)}68%,100%{opacity:1;transform:none}", OUT),

  // The speed scene's before scores, which otherwise only show mid-animation, stay as a struck-out figure.
  "@media (prefers-reduced-motion:reduce){.sv,.sv *{animation:none}.sv2-ghost{display:inline}}",
].join("\n");

const SCENES = [
  { Scene: Discovery, t: "8s" },
  { Scene: Speed, t: "8s" },
  { Scene: Campaign, t: "9s" },
  { Scene: Bugs, t: "8s" },
  { Scene: Migration, t: "9s" },
];

export function ServiceVisual({ n }: { n: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const scene = SCENES[n];

  // Plays only while on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-play", e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!scene) return null;
  const { Scene, t } = scene;
  return (
    <>
      <style href="service-visuals" precedence="low">
        {css}
      </style>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H + BAR}`}
        style={{ "--sv-t": t } as CSSProperties}
        className="sv absolute inset-0 block size-full"
      >
        <Chrome />
        <g transform={`translate(0 ${BAR})`}>
          <Scene />
        </g>
      </svg>
    </>
  );
}

// Browser bar, same parts as tiles/BrowserWindow.
function Chrome() {
  return (
    <>
      <rect width={W} height={BAR} fillOpacity={0.06} className="sv-f-ink" />
      {[12, 21, 30].map((x) => (
        <circle key={x} cx={x} cy={BAR / 2} r={2.6} fillOpacity={0.25} className="sv-f-ink" />
      ))}
      <rect x={140} y={5} width={120} height={12} rx={6} fillOpacity={0.07} className="sv-f-ink" />
      <text x={W / 2} y={14.1} textAnchor="middle" fontSize={8.5} fillOpacity={0.5} className="sv-f-ink font-mono">
        your-store.com
      </text>
    </>
  );
}

function Label({
  x,
  y,
  children,
  className = "sv-f-ink",
  alpha = 0.55,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: string;
  className?: string;
  alpha?: number;
  anchor?: "start" | "middle";
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={10} letterSpacing="0.14em" fillOpacity={alpha} className={`font-mono ${className}`}>
      {children}
    </text>
  );
}

// 01: menu opens, a category is picked, the product it leads to lights up.
function Discovery() {
  const nav = [
    [120, 26],
    [158, 34],
    [206, 24],
    [242, 30],
  ];
  return (
    <>
      <rect width={W} height={30} fillOpacity={0.03} className="sv-f-ink" />
      <rect y={30} width={W} height={1} fillOpacity={0.1} className="sv-f-ink" />
      <circle cx={20} cy={15} r={5} className="sv-f-accent" />
      <rect x={30} y={12.5} width={34} height={5} rx={2.5} fillOpacity={0.45} className="sv-f-ink" />
      {nav.map(([x, w]) => (
        <rect key={x} x={x} y={13.5} width={w} height={3} rx={1.5} fillOpacity={0.35} className="sv-f-ink" />
      ))}
      <rect x={158} y={22} width={34} height={1.5} className="sv1-hover sv-f-accent" />
      <g fill="none" strokeOpacity={0.45} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" className="sv-s-ink">
        <circle cx={350} cy={14.5} r={3.6} />
        <path d="M352.7 17.2l2.3 2.3M364 10h2.4l1.8 7.4h8.2l1.6-5.4h-10.6" />
      </g>

      {range.map((k) => {
        const x = 16 + k * 94;
        return (
          <g key={k}>
            <rect x={x} y={44} width={86} height={92} rx={4} fillOpacity={0.06} className="sv-f-ink" />
            <rect x={x} y={144} width={k % 2 ? 44 : 58} height={4} rx={2} fillOpacity={0.3} className="sv-f-ink" />
            <rect x={x} y={153} width={28} height={4} rx={2} fillOpacity={0.15} className="sv-f-ink" />
          </g>
        );
      })}
      <g className="sv1-card">
        <rect x={200} y={40} width={94} height={142} rx={6} strokeWidth={1.2} fillOpacity={0.08} className="sv-f-accent sv-s-accent" />
        <rect x={204} y={164} width={86} height={14} rx={3} className="sv-f-accent" />
        <rect x={227} y={169.5} width={40} height={3} rx={1.5} fillOpacity={0.8} className="sv-f-bg" />
      </g>

      <g className="sv1-menu">
        <rect x={100} y={31} width={284} height={92} rx={4} strokeOpacity={0.1} className="sv-f-bg sv-s-ink" />
        {[116, 182, 248].map((x, c) => (
          <g key={x}>
            <rect x={x} y={44} width={34} height={4} rx={2} fillOpacity={0.55} className="sv-f-ink" />
            {[0, 1, 2, 3].map((r) => (
              <rect key={r} x={x} y={58 + r * 12} width={[44, 34, 50, 28][(r + c) % 4]} height={3} rx={1.5} fillOpacity={0.25} className="sv-f-ink" />
            ))}
          </g>
        ))}
        <rect x={318} y={42} width={56} height={70} rx={3} fillOpacity={0.15} className="sv-f-accent" />
        <rect x={178} y={65} width={56} height={11} rx={2} fillOpacity={0.25} className="sv1-pick sv-f-accent" />
      </g>
      <circle cx={202} cy={72} r={8} strokeWidth={1.4} fill="none" className="sv1-ping sv-s-accent" />

      <path d="M0 0v14l3.6-3.4 2.6 5.6 2.4-1.1-2.6-5.5h5z" strokeWidth={1} strokeLinejoin="round" className="sv1-pointer sv-f-ink sv-s-bg" />
    </>
  );
}

// 02: the owner's typical PageSpeed ranges, before and after. Bands, not single scores.
const GAUGES = [
  { label: "MOBILE", x: 120, before: [20, 30], after: [50, 70] },
  { label: "DESKTOP", x: 280, before: [45, 50], after: [70, 90] },
];

function Speed() {
  return (
    <>
      <rect x={166} y={8} width={68} height={18} rx={9} fillOpacity={0.06} className="sv-f-ink" />
      {GAUGES.map((g) => (
        <g key={g.label}>
          <circle cx={g.x} cy={98} r={44} strokeWidth={8} fill="none" strokeOpacity={0.08} className="sv-s-ink" />
          <Label x={g.x} y={172}>
            {g.label}
          </Label>
        </g>
      ))}
      <g className="sv-loop">
        <Label x={200} y={20.6} alpha={1} className="sv2-was sv-f-bad">
          BEFORE
        </Label>
        <Label x={200} y={20.6} alpha={1} className="sv2-now sv-f-accent">
          AFTER
        </Label>
        {GAUGES.map((g) => {
          const vars = {
            "--b": g.before[0],
            "--bw": g.before[1] - g.before[0],
            "--a": g.after[0],
            "--aw": g.after[1] - g.after[0],
          } as CSSProperties;
          const arc = { cx: g.x, cy: 98, r: 44, pathLength: 100, strokeWidth: 8, fill: "none", style: vars };
          return (
            <g key={g.label}>
              <g transform={`rotate(-90 ${g.x} 98)`}>
                <circle {...arc} className="sv2-fill" />
                <circle {...arc} strokeOpacity={0.38} className="sv2-band" />
              </g>
              <text x={g.x} y={104.5} textAnchor="middle" fontSize={18} className="sv2-was sv-f-ink font-mono">
                {g.before.join("–")}
              </text>
              <text x={g.x} y={104.5} textAnchor="middle" fontSize={18} className="sv2-now sv-f-ink font-mono">
                {g.after.join("–")}
              </text>
              <g className="sv2-ghost sv-f-bad">
                <text x={g.x} y={125} textAnchor="middle" fontSize={10} className="font-mono">
                  {g.before.join("–")}
                </text>
                <rect x={g.x - 17} y={121} width={34} height={1} />
              </g>
            </g>
          );
        })}
      </g>
    </>
  );
}

// 03: reusable sections stack into a landing page.
const SECTIONS = ["Hero", "Offer", "Products", "Reviews"];

function Campaign() {
  return (
    <>
      <rect x={16} y={12} width={116} height={176} rx={6} fillOpacity={0.04} strokeOpacity={0.1} className="sv-f-ink sv-s-ink" />
      <Label x={28} y={30} anchor="start" alpha={0.45}>
        SECTIONS
      </Label>
      {SECTIONS.map((s, k) => (
        <g key={s}>
          <rect x={26} y={42 + k * 34} width={96} height={26} rx={4} fillOpacity={0.06} className="sv-f-ink" />
          <rect x={26} y={42 + k * 34} width={96} height={26} rx={4} strokeWidth={1.2} fill="none" className={`sv3-c${k} sv-s-accent`} />
          <rect x={33} y={49 + k * 34} width={12} height={12} rx={2} fillOpacity={0.4} className="sv-f-accent" />
          <text x={52} y={58.5 + k * 34} fontSize={10} fillOpacity={0.8} className="sv-f-ink">
            {s}
          </text>
        </g>
      ))}

      <rect x={152} y={12} width={232} height={176} rx={6} fillOpacity={0.03} strokeOpacity={0.1} className="sv-f-ink sv-s-ink" />
      <g className="sv-loop">
        <g className="sv3-b0">
          <rect x={162} y={22} width={212} height={62} rx={3} fillOpacity={0.2} className="sv-f-accent" />
          <rect x={176} y={36} width={104} height={7} rx={2} fillOpacity={0.75} className="sv-f-ink" />
          <rect x={176} y={49} width={72} height={4} rx={2} fillOpacity={0.35} className="sv-f-ink" />
          <rect x={176} y={62} width={44} height={12} rx={6} className="sv-f-accent" />
        </g>
        <g className="sv3-b1">
          <rect x={162} y={90} width={212} height={16} rx={3} className="sv-f-accent" />
          <rect x={226} y={96} width={84} height={4} rx={2} fillOpacity={0.7} className="sv-f-bg" />
        </g>
        <g className="sv3-b2">
          {[0, 1, 2].map((j) => (
            <g key={j}>
              <rect x={162 + j * 72} y={112} width={68} height={30} rx={3} fillOpacity={0.09} className="sv-f-ink" />
              <rect x={162 + j * 72} y={146} width={40} height={3.5} rx={1.75} fillOpacity={0.3} className="sv-f-ink" />
            </g>
          ))}
        </g>
        <g className="sv3-b3">
          <rect x={162} y={156} width={212} height={24} rx={3} fillOpacity={0.05} className="sv-f-ink" />
          {[0, 1, 2, 3, 4].map((j) => (
            <circle key={j} cx={174 + j * 9} cy={168} r={2.6} className="sv-f-accent" />
          ))}
          <rect x={228} y={166} width={90} height={4} rx={2} fillOpacity={0.3} className="sv-f-ink" />
        </g>
      </g>
    </>
  );
}

// 04: a scan through each layer finds the clash, it gets fixed, the cart works again.
const LAYERS = ["Theme code", "JavaScript", "Apps", "Settings"];

function Bugs() {
  const faultY = 16 + 2 * 42;
  return (
    <>
      {LAYERS.map((l, k) => {
        const y = 16 + k * 42;
        return (
          <g key={l}>
            <rect x={16} y={y} width={236} height={32} rx={5} fillOpacity={0.05} strokeOpacity={0.1} className="sv-f-ink sv-s-ink" />
            <text x={30} y={y + 19.5} fontSize={10.5} fillOpacity={0.75} className="sv-f-ink font-mono">
              {l}
            </text>
            {[
              [118, 30],
              [154, 36],
              [196, 18],
            ].map(([x, w]) => (
              <rect key={x} x={x} y={y + 14} width={w} height={4} rx={2} fillOpacity={0.15} className="sv-f-ink" />
            ))}
          </g>
        );
      })}

      <g fill="none" strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="sv-s-ink">
        <path d="M296 40h8l6 30h30l6-22h-38" />
        <circle cx={314} cy={80} r={3.4} />
        <circle cx={336} cy={80} r={3.4} />
      </g>
      <rect x={290} y={110} width={80} height={22} rx={11} fillOpacity={0.08} className="sv-f-ink" />
      <text x={330} y={124.6} textAnchor="middle" fontSize={10.5} fillOpacity={0.4} className="sv-f-ink">
        Checkout
      </text>

      <g className="sv-loop">
        <g className="sv4-scan">
          <rect x={10} y={-12} width={248} height={12} fillOpacity={0.1} className="sv-f-accent" />
          <rect x={10} y={0} width={248} height={1.5} className="sv-f-accent" />
        </g>
        <g className="sv4-fault">
          <rect x={16} y={faultY} width={236} height={32} rx={5} strokeWidth={1.5} fillOpacity={0.1} className="sv-f-bad sv-s-bad" />
          <circle cx={236} cy={faultY + 16} r={8} className="sv-f-bad" />
          <rect x={235} y={faultY + 10.5} width={2} height={7} rx={1} className="sv-f-bg" />
          <circle cx={236} cy={faultY + 20.5} r={1.1} className="sv-f-bg" />
        </g>
        <g className="sv4-fixed">
          <rect x={16} y={faultY} width={236} height={32} rx={5} strokeWidth={1.2} fill="none" strokeOpacity={0.5} className="sv-s-good" />
          <circle cx={236} cy={faultY + 16} r={8} className="sv-f-good" />
          <path d={`M232.4 ${faultY + 16.2}l2.4 2.4 4.6-5`} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" className="sv-s-bg" />
        </g>

        <g className="sv4-broken">
          <circle cx={350} cy={38} r={10} className="sv-f-bad" />
          <rect x={349} y={31.5} width={2} height={8} rx={1} className="sv-f-bg" />
          <circle cx={350} cy={43} r={1.2} className="sv-f-bg" />
        </g>
        <g className="sv4-ok">
          <circle cx={350} cy={38} r={10} className="sv-f-good" />
          <path d="M345.6 38.2l3 3 5.6-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" className="sv-s-bg" />
          <rect x={290} y={110} width={80} height={22} rx={11} className="sv-f-accent" />
          <text x={330} y={124.6} textAnchor="middle" fontSize={10.5} className="sv-f-bg">
            Checkout
          </text>
        </g>
      </g>
    </>
  );
}

// 05: products, content and SEO carried from the old store to the new one.
const MOVES = ["Products", "Content", "SEO"];

function Migration() {
  return (
    <>
      <Label x={68} y={24}>
        OLD STORE
      </Label>
      <rect x={16} y={34} width={104} height={150} rx={6} fillOpacity={0.04} strokeOpacity={0.15} className="sv-f-ink sv-s-ink" />
      <Label x={332} y={24} alpha={1} className="sv-f-accent">
        NEW STORE
      </Label>
      <rect x={280} y={34} width={104} height={150} rx={6} fillOpacity={0.05} strokeOpacity={0.45} className="sv-f-accent sv-s-accent" />

      {MOVES.map((s, k) => {
        const y = 54 + k * 44;
        return (
          <g key={s}>
            <rect x={26} y={y} width={84} height={24} rx={12} strokeDasharray="3 3" fill="none" strokeOpacity={0.2} className="sv-s-ink" />
            <rect x={290} y={y} width={84} height={24} rx={12} strokeDasharray="3 3" fill="none" strokeOpacity={0.4} className="sv-s-accent" />
            <path d={`M120 ${y + 12}H280`} strokeDasharray="2 4" strokeOpacity={0.2} className="sv-s-ink" />
          </g>
        );
      })}

      <g className="sv-loop">
        {MOVES.map((s, k) => {
          const y = 54 + k * 44;
          return (
            <g key={s} className={`sv5-t${k}`}>
              <rect x={26} y={y} width={84} height={24} rx={12} strokeWidth={1.2} className="sv-f-bg sv-s-accent" />
              <text x={68} y={y + 15.5} textAnchor="middle" fontSize={10} className="sv-f-ink font-mono">
                {s}
              </text>
            </g>
          );
        })}
        <g className="sv5-done">
          <circle cx={384} cy={34} r={8} className="sv-f-good" />
          <path d="M380.4 34.2l2.4 2.4 4.6-5" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" className="sv-s-bg" />
        </g>
      </g>
    </>
  );
}
