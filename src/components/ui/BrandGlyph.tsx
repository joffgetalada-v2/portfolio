export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ brand, className }: { brand: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.4em] lowercase ${className ?? ""}`}>
      <BrandGlyph className="size-[0.95em] shrink-0 translate-y-[0.02em]" />
      <span>{brand}</span>
    </span>
  );
}
