export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2.75a9.25 9.25 0 0 0 0 18.5Z" fill="currentColor" />
    </svg>
  );
}

// short replaces brand below the sm breakpoint.
export function Wordmark({ brand, short, className }: { brand: string; short?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.4em] whitespace-nowrap ${className ?? ""}`}>
      <BrandGlyph className="size-[0.95em] shrink-0 translate-y-[0.02em]" />
      {short ? (
        <>
          <span className="sm:hidden">{short}</span>
          <span className="hidden sm:inline">{brand}</span>
        </>
      ) : (
        <span>{brand}</span>
      )}
    </span>
  );
}
