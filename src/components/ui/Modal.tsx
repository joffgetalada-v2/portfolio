"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { usePortfolio } from "@/lib/store";

const EXIT_MS = 320;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Ref-counted: one dialog can open another (case study to contact).
let scrollLocks = 0;
function lockScroll() {
  if (scrollLocks++ > 0) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.overflow = "hidden";
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
}
function unlockScroll() {
  if (--scrollLocks > 0) return;
  scrollLocks = 0;
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
}

function focusablesIn(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.getClientRects().length > 0,
  );
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  children: ReactNode;
  panelClassName?: string;
  /** Defaults to the panel. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Called for keys other than Escape and Tab. */
  onKey?: (e: KeyboardEvent) => void;
}

export function Modal({ open, onClose, labelledBy, describedBy, children, panelClassName, initialFocus, onKey }: ModalProps) {
  const reducedMotion = usePortfolio((s) => s.reducedMotion);
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const handlers = useRef({ onClose, onKey });
  useLayoutEffect(() => {
    handlers.current = { onClose, onKey };
  });

  // Stay mounted through the exit transition.
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  useEffect(() => {
    if (open || !present) return;
    const t = window.setTimeout(() => setPresent(false), reducedMotion ? 0 : EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, present, reducedMotion]);

  // Not in a cleanup: React's post-mutation selection restore would undo the focus() call.
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (open) {
      if (wasOpen.current) return;
      wasOpen.current = true;
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      (initialFocus?.current ?? panelRef.current)?.focus({ preventScroll: true });
      lockScroll();
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    unlockScroll();
    const el = returnFocus.current;
    returnFocus.current = null;
    if (el && el.isConnected && !el.closest("[inert]")) el.focus({ preventScroll: true });
  }, [open, initialFocus]);

  // Release the scroll lock if the dialog unmounts while open.
  useEffect(
    () => () => {
      if (!wasOpen.current) return;
      wasOpen.current = false;
      unlockScroll();
    },
    [],
  );

  // On document so keys still work if focus leaves the panel.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handlers.current.onClose();
        return;
      }
      if (e.key === "Tab") {
        const nodes = focusablesIn(panel);
        if (nodes.length === 0) {
          e.preventDefault();
          panel.focus();
          return;
        }
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        const active = document.activeElement;
        const inside = active instanceof Node && panel.contains(active);
        if (e.shiftKey && (!inside || active === first || active === panel)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (!inside || active === last)) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      handlers.current.onKey?.(e);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!present) return null;

  return (
    <div
      data-state={open ? "open" : "closed"}
      className="group fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px] transition-opacity duration-300 ease-out starting:opacity-0 group-data-[state=closed]:opacity-0"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        // Inline to beat the global :focus-visible ring. Only focused programmatically.
        style={{ outline: "none" }}
        className={`relative w-full overflow-y-auto overscroll-contain [scrollbar-color:rgba(255,255,255,0.18)_transparent] [scrollbar-width:thin] transition-[opacity,translate,scale] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] starting:translate-y-6 starting:opacity-0 group-data-[state=closed]:translate-y-4 group-data-[state=closed]:opacity-0 group-data-[state=closed]:duration-300 sm:starting:scale-[0.98] ${panelClassName ?? ""}`}
      >
        {children}
      </div>
    </div>
  );
}
