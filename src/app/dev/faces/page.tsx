import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FacesPreview } from "./FacesPreview";

// Dev-only preview of the page faces. 404s in production.
export const metadata: Metadata = {
  title: "Page faces (dev)",
  robots: { index: false, follow: false },
};

export default function FacesPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <FacesPreview />;
}
