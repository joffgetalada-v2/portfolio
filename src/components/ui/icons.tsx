export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowIcon({ dir = "right", className }: { dir?: "left" | "right" | "up" | "down" | "up-right"; className?: string }) {
  const d = {
    right: "M5 12h14M13 6l6 6-6 6",
    left: "M19 12H5M11 6l-6 6 6 6",
    up: "M12 19V5M6 11l6-6 6 6",
    down: "M12 5v14M6 13l6 6 6-6",
    "up-right": "M7 17L17 7M8 7h9v9",
  }[dir];
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
