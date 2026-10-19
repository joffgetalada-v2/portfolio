// brand feeds the logo, book cover and metadata.
export const site = {
  brand: "cartbound",
  brandTagline: "The commerce folio of Joffrey Getalada",
  // Set NEXT_PUBLIC_SITE_URL for a custom domain.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  cvPath: "/Joffrey-Getalada-CV.pdf",
} as const;
