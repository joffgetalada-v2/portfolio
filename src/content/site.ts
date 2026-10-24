// brand feeds the logo, book cover and metadata.
export const site = {
  brand: "Joffrey Anthony Getalada",
  // Running heads and other tight spots.
  shortBrand: "J. A. Getalada",
  brandTagline: "Portfolio",
  // Set NEXT_PUBLIC_SITE_URL for a custom domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  cvPath: "/Joffrey-Getalada-CV.pdf",
} as const;
