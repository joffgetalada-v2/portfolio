"use client";

import { type KeyboardEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export interface CategoryPanel {
  id: string;
  label: string;
  short: string;
  count: number;
  content: ReactNode;
}

const noSubscribe = () => () => {};

function idFromHash(ids: string[], hash: string) {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    return ids.includes(id) ? id : null;
  } catch {
    return null;
  }
}

const PILL =
  "inline-flex h-11 min-w-0 items-center justify-between gap-2.5 rounded-full border px-4 text-[14px] transition-colors sm:justify-start";
const IDLE = "border-white/20 text-ink hover:border-white/45";
const SELECTED = "border-transparent bg-[#f3f3ef] text-[#0b0b0a]";

// Server HTML and no-JS: every panel in order under plain anchor links. Once hydrated: WAI-ARIA tabs,
// only the active panel shows, and #id links pick their tab.
export function CategoryTabs({ panels, label }: { panels: CategoryPanel[]; label: string }) {
  const enhanced = useSyncExternalStore(noSubscribe, () => true, () => false);
  const idsKey = panels.map((p) => p.id).join(" ");
  // Only read once enhanced, so the hash can't cause a hydration mismatch.
  const [active, setActive] = useState(
    () => (typeof window !== "undefined" && idFromHash(idsKey.split(" "), window.location.hash)) || panels[0].id,
  );
  const tabs = useRef(new Map<string, HTMLButtonElement>());

  // Landing on #id: the server HTML scrolled there with every panel open, so scroll again now
  // that the others are hidden.
  useEffect(() => {
    if (!enhanced) return;
    const id = idFromHash(idsKey.split(" "), window.location.hash);
    if (id) document.getElementById(id)?.scrollIntoView();
  }, [enhanced, idsKey]);

  useEffect(() => {
    const ids = idsKey.split(" ");
    const select = (hash: string) => {
      const id = idFromHash(ids, hash);
      if (id) flushSync(() => setActive(id));
      return id;
    };
    // Capture phase: the panel is visible before the browser (or a router) scrolls to it.
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest("a[href*='#']") : null;
      if (a instanceof HTMLAnchorElement && a.origin === location.origin && a.pathname === location.pathname) select(a.hash);
    };
    const onHashChange = () => {
      const id = select(location.hash);
      if (id) document.getElementById(id)?.scrollIntoView();
    };
    // Find-in-page revealed a hidden panel.
    const onMatch = (e: Event) => {
      if (e.target instanceof Element && ids.includes(e.target.id)) setActive(e.target.id);
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("beforematch", onMatch);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("beforematch", onMatch);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [idsKey]);

  // hidden="until-found" keeps inactive panels searchable with Ctrl+F. React only writes hidden as a
  // boolean, so it is set here, before paint.
  useLayoutEffect(() => {
    if (!enhanced) return;
    for (const id of idsKey.split(" ")) {
      const el = document.getElementById(id);
      if (id === active) el?.removeAttribute("hidden");
      else el?.setAttribute("hidden", "until-found");
    }
  }, [enhanced, active, idsKey]);

  const choose = (id: string, focus = false) => {
    setActive(id);
    if (focus) tabs.current.get(id)?.focus();
    // Keep a category hash in the URL in step, so a reload opens the same tab.
    const ids = idsKey.split(" ");
    if (idFromHash(ids, location.hash) && location.hash !== `#${id}`) history.replaceState(null, "", `#${id}`);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = panels.length - 1;
    const keys: Record<string, number> = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
    const next = keys[e.key];
    if (next === undefined) return;
    e.preventDefault();
    choose(panels[next].id, true);
  };

  return (
    <div>
      {enhanced ? (
        <div role="tablist" aria-label={label} className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {panels.map((p, i) => {
            const selected = p.id === active;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  if (el) tabs.current.set(p.id, el);
                  else tabs.current.delete(p.id);
                }}
                id={`${p.id}-tab`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={p.id}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(p.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className={`${PILL} ${selected ? SELECTED : IDLE}`}
              >
                <TabText panel={p} />
              </button>
            );
          })}
        </div>
      ) : (
        <nav aria-label={label}>
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {panels.map((p) => (
              <li key={p.id} className="grid">
                <a href={`#${p.id}`} className={`${PILL} ${IDLE}`}>
                  <TabText panel={p} />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {panels.map((p, i) => (
        <div
          key={p.id}
          id={p.id}
          role={enhanced ? "tabpanel" : undefined}
          aria-labelledby={enhanced ? `${p.id}-tab` : `${p.id}-label`}
          tabIndex={enhanced ? 0 : undefined}
          // Margin keeps the header and the tab bar in view when scrolled to. A hidden panel still has a
          // box (content-visibility), so it drops its own margin.
          className={`mt-10 scroll-mt-56 [&[hidden]]:m-0 rounded-sm sm:scroll-mt-44 md:mt-12 md:scroll-mt-48 ${!enhanced && i > 0 ? "border-t border-line pt-14" : ""}`}
        >
          {!enhanced && (
            <p id={`${p.id}-label`} className="mb-8 flex flex-wrap items-baseline gap-x-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
              <span className="text-ink">{p.label}</span>
              <span>
                {p.count} {p.count === 1 ? "project" : "projects"}
              </span>
            </p>
          )}
          {p.content}
        </div>
      ))}
    </div>
  );
}

// Short label below xl, full label (always the accessible name) from xl.
function TabText({ panel }: { panel: CategoryPanel }) {
  return (
    <>
      <span aria-hidden="true" className="truncate xl:hidden">
        {panel.short}
      </span>
      <span className="sr-only xl:not-sr-only">{panel.label}</span>
      <span className="font-mono text-[11px] tabular-nums opacity-60">
        {panel.count}
        <span className="sr-only"> {panel.count === 1 ? "project" : "projects"}</span>
      </span>
    </>
  );
}
