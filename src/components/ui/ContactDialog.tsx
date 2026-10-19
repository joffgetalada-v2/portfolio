"use client";

import { useEffect, useState } from "react";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import { usePortfolio } from "@/lib/store";
import { ArrowIcon, CloseIcon } from "./icons";
import { Modal } from "./Modal";

const TITLE_ID = "contact-dialog-title";
const DESC_ID = "contact-dialog-desc";

const prettyUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function ContactDialog() {
  const open = usePortfolio((s) => s.contactOpen);
  const setContactOpen = usePortfolio((s) => s.setContactOpen);
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (copy === "idle") return;
    const t = window.setTimeout(() => setCopy("idle"), 2200);
    return () => window.clearTimeout(t);
  }, [copy]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  const links = [
    { label: "LinkedIn", href: profile.links.linkedin },
    { label: "GitHub", href: profile.links.github },
    ...(profile.links.upwork ? [{ label: "Upwork", href: profile.links.upwork }] : []),
  ];

  return (
    <Modal
      open={open}
      onClose={() => setContactOpen(false)}
      labelledBy={TITLE_ID}
      describedBy={DESC_ID}
      panelClassName="max-h-[92svh] max-w-[34rem] rounded-t-[22px] border border-white/10 bg-[#0e0e0d] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:max-h-[calc(100svh-3rem)] sm:rounded-[22px]"
    >
      <div className="relative isolate overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(70%_100%_at_30%_0%,rgba(217,183,126,0.16),transparent_70%)]"
        />

        <div className="px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-9 sm:pb-8 sm:pt-7">
          <div className="flex items-start justify-between gap-4">
            <p className="pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">Get in touch</p>
            <button
              type="button"
              onClick={() => setContactOpen(false)}
              aria-label="Close contact panel"
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink/85 transition-colors hover:bg-white/10 hover:text-ink"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <h2
            id={TITLE_ID}
            className="mt-6 max-w-[26rem] font-serif text-[clamp(2.3rem,7vw,3.4rem)] italic leading-[0.95] tracking-[-0.015em] text-ink sm:mt-8"
          >
            Let&rsquo;s build your next storefront.
          </h2>

          <div id={DESC_ID} className="mt-5 space-y-1 text-[13.5px] leading-relaxed text-ink-muted">
            <p className="flex items-center gap-2.5">
              <span aria-hidden="true" className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
                <span className="relative size-2 rounded-full bg-accent" />
              </span>
              <span className="text-ink">{profile.availability}</span>
            </p>
            <p className="pl-[18px]">
              {profile.location} · {profile.timezone}
            </p>
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-ink-muted">Email</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <a
                href={`mailto:${profile.email}`}
                className="min-w-0 break-all text-[clamp(1.3rem,5.4vw,1.85rem)] font-medium leading-tight tracking-[-0.025em] text-ink underline decoration-white/20 decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent"
              >
                {profile.email}
              </a>
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-line px-3.5 text-[12.5px] text-ink transition-colors hover:border-white/35"
              >
                {copy === "copied" ? <CheckIcon className="size-4 text-accent" /> : <CopyIcon className="size-4" />}
                {copy === "copied" ? "Copied" : copy === "failed" ? "Copy failed" : "Copy"}
              </button>
            </div>
            <p aria-live="polite" className="sr-only">
              {copy === "copied" ? "Email address copied to the clipboard." : copy === "failed" ? "Could not copy the email address." : ""}
            </p>
          </div>

          <ul className="mt-6 border-t border-line">
            {links.map((l) => (
              <li key={l.label} className="border-b border-line">
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 py-3.5 text-[14px]"
                >
                  <span className="text-ink">{l.label}</span>
                  <span className="flex min-w-0 items-center gap-2 text-ink-muted transition-colors group-hover:text-ink">
                    <span className="truncate font-mono text-[12px]">{prettyUrl(l.href)}</span>
                    <ArrowIcon dir="up-right" className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </span>
                </a>
              </li>
            ))}
            {profile.showPhone && (
              <li className="border-b border-line">
                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="group flex items-center justify-between gap-4 py-3.5 text-[14px]">
                  <span className="text-ink">Phone</span>
                  <span className="font-mono text-[12px] text-ink-muted transition-colors group-hover:text-ink">{profile.phone}</span>
                </a>
              </li>
            )}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={site.cvPath}
              download
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f3f3ef] pl-4 pr-4 text-[13.5px] font-medium text-[#0b0b0a] transition-colors hover:bg-white"
            >
              <ArrowIcon dir="down" className="size-4" />
              Download CV (PDF)
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
      <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
