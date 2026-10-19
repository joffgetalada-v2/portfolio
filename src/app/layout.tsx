import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const title = `${profile.shortName} — Senior Shopify Plus & Salesforce Commerce Cloud Engineer`;
const description =
  "Interactive portfolio of Joffrey Getalada, a senior e-commerce engineer with 12+ years and 50+ Shopify stores, including six years on the global Timex and Guess Watches storefronts. Open the book to explore the work.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.brand}`,
  },
  description,
  applicationName: site.brand,
  authors: [{ name: profile.name, url: profile.links.linkedin }],
  creator: profile.name,
  keywords: [
    "Shopify Plus developer",
    "Salesforce Commerce Cloud developer",
    "Shopify expert",
    "Liquid developer",
    "Next.js developer",
    "Core Web Vitals",
    "e-commerce engineer",
    "Upwork Shopify developer",
    "Joffrey Getalada",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.brand,
    title,
    description,
    firstName: "Joffrey",
    lastName: "Getalada",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${anton.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
