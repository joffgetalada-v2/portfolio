"use client";

import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { ArrowIcon } from "@/components/ui/icons";
import { targetOf } from "@/lib/hash";

// Decorative animations, fetched only once the section comes near the screen. If the chunk fails to load
// (offline, or a newer deploy removed it), the frame stays empty instead of taking the page down.
const ServiceVisual = lazy(() =>
  import("./ServiceVisuals").then(
    (m) => ({ default: m.ServiceVisual }),
    () => ({ default: () => null }),
  ),
);

interface ServiceItem {
  title: string;
  content: ReactNode;
}

const regionId = (i: number) => `service-${i + 1}`;

// The item holding a #link target: its text, its title or anything inside either.
function itemOf(el: HTMLElement, regions: (HTMLElement | null)[], buttons: (HTMLElement | null)[]) {
  return regions.findIndex((r, k) => r?.contains(el) || buttons[k]?.parentElement?.contains(el));
}

// Without JS the closed items would stay hidden for good, so show every item, one under the other, and
// drop what only works with the script: the two columns, the accent bar, the visual frame and the icons.
// Tailwind hides [hidden] with !important in its base layer, so the reveal has to sit in that layer.
const NO_JS = [
  "@layer base{.svc-region[hidden]{display:block!important}}",
  ".svc-list{display:block;border-bottom-width:1px}",
  ".svc-row:last-of-type{border-bottom-width:0}",
  ".svc-row button{pointer-events:none;padding-left:0;color:var(--ink)}",
  ".svc-body{max-width:46rem;padding-bottom:2.5rem}",
  ".svc-bar,.svc-frame,.svc-icon{display:none}",
].join("");

// One item open at a time: an accordion below lg, a list beside the open item from lg. The server HTML
// already has the first item open and the rest hidden, so the page keeps its height when the script runs.
// The markup repeats for every item, so its styles live in globals.css (svc-*) to keep the HTML small.
export function ServicePicker({ items, prompt }: { items: ServiceItem[]; prompt: string }) {
  const [open, setOpen] = useState(0);
  const [near, setNear] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const regions = useRef<(HTMLDivElement | null)[]>([]);
  // Where the chosen title sat on screen, so it stays there when the item above it closes.
  const anchor = useRef<{ i: number; top: number } | null>(null);
  // The item whose text last faded in, and a #hash target to scroll to once its item is open.
  const shown = useRef(0);
  const landing = useRef<{ i: number; el: HTMLElement } | null>(null);
  // The bar slides only when the reader picks an item, not on load, a #link or a resize.
  const slide = useRef(false);
  const count = items.length;

  // Below lg the title sits above the text, so a link to the item or its title shows it from the title.
  const show = (i: number, el: HTMLElement) => {
    const title = buttons.current[i]?.parentElement;
    const top = (e: Element) => e.getBoundingClientRect().top;
    const to = title && (title.contains(el) || (el === regions.current[i] && top(title) < top(el))) ? title : el;
    // Where it sits once the rows have risen into place (globals.css), so it lands just below the header
    // (the page's scroll padding) whether it rises on the way or not.
    const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    let y = top(to) + scrollY - pad - parseFloat(getComputedStyle(to).scrollMarginTop);
    for (let e: Element | null = to; e; e = e.parentElement) y -= new DOMMatrixReadOnly(getComputedStyle(e).transform).m42;
    scrollTo({ top: y, behavior: "instant" });
  };

  // Landing on a #link into an item: the browser could not scroll to a closed one, so open it here.
  useLayoutEffect(() => {
    const target = targetOf(location.hash);
    const i = target ? itemOf(target, regions.current, buttons.current) : -1;
    if (!target || i < 0) return;
    landing.current = { i, el: target };
    setOpen(i);
  }, []);

  // hidden="until-found" keeps closed items searchable with Ctrl+F. React only writes hidden as a
  // boolean, so it is set here, before paint.
  useLayoutEffect(() => {
    regions.current.forEach((el, i) => {
      if (i === open) el?.removeAttribute("hidden");
      else el?.setAttribute("hidden", "until-found");
    });
    // Chrome skips style inside hidden="until-found", so the fade-in would only play the first time an
    // item opens. Restart it each time (none runs when motion is reduced).
    if (shown.current !== open) {
      shown.current = open;
      regions.current[open]?.firstElementChild?.getAnimations().forEach((a) => (a.currentTime = 0));
    }
    const a = anchor.current;
    anchor.current = null;
    const moved = a ? (buttons.current[a.i]?.getBoundingClientRect().top ?? a.top) - a.top : 0;
    if (moved) window.scrollBy({ top: moved, behavior: "instant" });
    const l = landing.current;
    if (l?.i === open) {
      landing.current = null;
      show(l.i, l.el);
    }
  }, [open]);

  // Accent bar beside the open title (lg+). Transform only, so the slide stays off the layout.
  useLayoutEffect(() => {
    const el = bar.current;
    const list = root.current;
    const b = buttons.current[open];
    if (!el || !list || !b) return;
    const place = (animate: boolean) => {
      const top = b.getBoundingClientRect().top - list.getBoundingClientRect().top;
      const to = `translateY(${top}px) scaleY(${b.offsetHeight})`;
      if (to === el.style.transform) return;
      if (animate) {
        el.style.transform = to;
        return;
      }
      // Straight there: the read in between applies it while the transition is off.
      el.style.transition = "none";
      el.style.transform = to;
      el.getBoundingClientRect();
      el.style.transition = "";
    };
    place(slide.current);
    slide.current = false;
    const ro = new ResizeObserver(() => place(false));
    ro.observe(list);
    return () => ro.disconnect();
  }, [open]);

  // Find-in-page revealed a closed item, or the #hash changed to point into one.
  useEffect(() => {
    const onMatch = (e: Event) => {
      const i = e.target instanceof HTMLDivElement ? regions.current.indexOf(e.target) : -1;
      if (i < 0) return;
      slide.current = true;
      flushSync(() => setOpen(i));
    };
    const onHash = () => {
      const target = targetOf(location.hash);
      const i = target ? itemOf(target, regions.current, buttons.current) : -1;
      if (!target || i < 0) return;
      flushSync(() => setOpen(i));
      show(i, target);
    };
    document.addEventListener("beforematch", onMatch);
    addEventListener("hashchange", onHash);
    return () => {
      document.removeEventListener("beforematch", onMatch);
      removeEventListener("hashchange", onHash);
    };
  }, []);

  useEffect(() => {
    const list = root.current;
    if (near || !list) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "600px 0px" });
    io.observe(list);
    return () => io.disconnect();
  }, [near]);

  const choose = (i: number) => {
    if (i === open) return;
    const top = buttons.current[i]?.getBoundingClientRect().top;
    if (top !== undefined) anchor.current = { i, top };
    slide.current = true;
    setOpen(i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const last = count - 1;
    const keys: Record<string, number> = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div>
      <p className="mb-5 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted md:mb-7">
        <span aria-hidden="true" className="h-[3px] w-4 bg-accent" />
        {prompt}
      </p>

      <noscript>
        <style dangerouslySetInnerHTML={{ __html: NO_JS }} />
      </noscript>

      <div ref={root} style={{ "--n": count } as CSSProperties} className="svc-list">
        <span ref={bar} aria-hidden="true" className="svc-bar" />

        {items.map((item, i) => {
          const isOpen = i === open;
          return (
            <Fragment key={item.title}>
              <h3 className="svc-row">
                {/* The open item stays open until another is chosen, hence aria-disabled. */}
                <button
                  ref={(el) => {
                    buttons.current[i] = el;
                  }}
                  id={`${regionId(i)}-button`}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={regionId(i)}
                  aria-disabled={isOpen || undefined}
                  onClick={() => choose(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                >
                  <span aria-hidden="true" className="svc-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="svc-title">{item.title}</span>
                  <ArrowIcon className="svc-icon" />
                </button>
              </h3>

              <div
                ref={(el) => {
                  regions.current[i] = el;
                }}
                id={regionId(i)}
                role={isOpen ? "region" : undefined}
                aria-labelledby={isOpen ? `${regionId(i)}-button` : undefined}
                hidden={!isOpen}
                className="svc-region"
              >
                <div className="svc-body">
                  {/* Frame for the visual, sized up front so the page does not move when it loads. */}
                  {isOpen && (
                    <div aria-hidden="true" className="svc-frame">
                      {near && (
                        <Suspense fallback={null}>
                          <ServiceVisual n={i} />
                        </Suspense>
                      )}
                    </div>
                  )}
                  {item.content}
                </div>
              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
