import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { LateFonts } from "@/components/LateFonts";
import { profile } from "@/content/profile";
import { site } from "@/content/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Mono and Anton never show above the fold, so they load after hydration (LateFonts) instead of
// competing with the hero.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
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
  preload: false,
});

const title = `${profile.name} | Senior Shopify Plus Developer`;
const description =
  "Senior Shopify Plus Developer: 100+ Shopify stores delivered, 6 years on Timex & Guess storefronts, plus WordPress, React/Next.js and Salesforce Commerce Cloud.";

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
    "Demandware developer",
    "React developer",
    "Shopify expert",
    "Liquid developer",
    "Next.js developer",
    "Core Web Vitals",
    "e-commerce engineer",
    "Upwork Shopify developer",
    "Joffrey Getalada",
    "Joffrey Anthony Getalada",
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
      className={`${geistSans.variable} ${instrumentSerif.variable} antialiased`}
    >
      <body>
        <LateFonts className={`${geistMono.variable} ${anton.variable}`} />
        {children}
      </body>
    </html>
  );
}
