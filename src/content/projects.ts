import { shot, type SiteShot } from "./profile";

// Project cards on the classic page. Fill unknowns (null) only with confirmed facts.

export type Category = "shopify" | "wordpress" | "react" | "sfcc";

// Page order, tabs and anchors all follow this list.
export const CATEGORIES: { id: Category; label: string; short: string }[] = [
  { id: "shopify", label: "Shopify / Shopify Plus", short: "Shopify" },
  { id: "wordpress", label: "WordPress / WooCommerce", short: "WordPress" },
  { id: "react", label: "React / Next.js", short: "React" },
  { id: "sfcc", label: "Salesforce Commerce Cloud (Demandware)", short: "SFCC" },
];

export const SHOPIFY_TAGS = [
  "New build (free theme)",
  "Free → premium theme migration",
  "Premium theme revamp",
  "Shopify Plus",
  "Speed optimization",
  "App integration",
  "Platform migration",
] as const;
export type ShopifyTag = (typeof SHOPIFY_TAGS)[number];

export interface Project {
  id: string;
  name: string;
  // Brand name, or "Confidential (NDA)".
  client: string;
  country: string | null;
  platform: string;
  category: Category;
  // Shopify only.
  subTags: ShopifyTag[];
  year: string | null;
  // What I did, 1–2 lines.
  scope: string;
  stack: string[];
  // Metric if there is one, otherwise a qualitative outcome. null when not confirmed.
  result: string | null;
  link: string | null;
  // Live-site captures; empty when there are none.
  screenshots: SiteShot[];
  // Tile colours.
  palette: { bg: string; ink: string; accent: string };
}

export const projects: Project[] = [
  // ---- Shopify / Shopify Plus ----
  {
    id: "malbon",
    name: "Malbon Golf / Buckets Club",
    client: "Malbon Golf",
    country: null, // TODO
    platform: "Shopify Plus",
    category: "shopify",
    subTags: ["Shopify Plus", "Speed optimization"],
    year: null, // TODO
    scope: "Front-end enhancements, mobile improvements, performance work, and ongoing production support.",
    stack: ["Shopify Plus", "Liquid", "JavaScript", "CSS3/SASS"],
    result: null, // TODO
    link: "https://malbon.com",
    screenshots: [shot("malbon", "malbon.com")],
    palette: { bg: "#1f3b2d", ink: "#f2ede0", accent: "#e4572e" },
  },
  {
    id: "atomic",
    name: "Atomic Golf",
    client: "Atomic Golf",
    country: null, // TODO
    platform: "Shopify",
    category: "shopify",
    subTags: ["Platform migration"],
    year: null, // TODO
    scope: "Moved marketing content from Framer to Shopify, built reusable Liquid sections and responsive landing pages for faster campaign delivery.",
    stack: ["Shopify", "Liquid", "Responsive design"],
    result: null, // TODO
    link: "https://atomicgolf.com",
    screenshots: [shot("atomic", "atomicgolf.com")],
    palette: { bg: "#f2f0ea", ink: "#111111", accent: "#ff4f1f" },
  },
  {
    id: "dashcamsrus",
    name: "Dash Cams R Us",
    client: "Dash Cams R Us",
    country: "Australia",
    platform: "Shopify",
    category: "shopify",
    subTags: [], // TODO: type of work
    year: null, // TODO
    scope: "Shopify store with custom templates and a mega menu.",
    stack: ["Shopify", "Liquid"],
    result: null, // TODO
    link: null, // TODO
    screenshots: [], // TODO
    palette: { bg: "#101418", ink: "#eef2f6", accent: "#95bf47" },
  },

  // ---- WordPress / WooCommerce ----
  {
    id: "city-mazda",
    name: "City Mazda",
    client: "City Mazda",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Dealer website and campaign landing pages.",
    stack: ["WordPress"],
    result: null, // TODO
    link: null, // TODO
    screenshots: [],
    palette: { bg: "#151515", ink: "#f2f2f2", accent: "#c8102e" },
  },
  {
    id: "artisan",
    name: "The Artisan Collective",
    client: "The Artisan Collective",
    country: null, // TODO
    platform: "WordPress · WooCommerce",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Led a full storefront rebuild on WordPress and WooCommerce, with product and content transfer.",
    stack: ["WordPress", "WooCommerce", "PHP", "Technical SEO", "Data migration"],
    result: "SEO preserved through the move.",
    link: null, // TODO
    screenshots: [],
    palette: { bg: "#efe6d8", ink: "#2b211a", accent: "#a4532f" },
  },
  {
    id: "yoshinoya",
    name: "Yoshinoya",
    client: "Yoshinoya",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Developed the website from the ground up at Monstar Lab Cebu.",
    stack: ["WordPress", "PHP", "MySQL", "JavaScript"],
    result: null, // TODO
    link: null, // TODO
    screenshots: [],
    palette: { bg: "#f4efe6", ink: "#1d1a16", accent: "#e8730c" },
  },
  {
    id: "nuat-thai",
    name: "Nuat Thai Spa",
    client: "Nuat Thai Spa",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Responsive website, built at Monstar Lab Cebu.",
    stack: ["WordPress", "PHP"],
    result: null, // TODO
    link: null, // TODO
    screenshots: [],
    palette: { bg: "#efe8dc", ink: "#2a2118", accent: "#8a6a3b" },
  },

  // ---- React / Next.js ----
  {
    id: "ev360",
    name: "EV360",
    client: "EV360",
    country: "Australia",
    platform: "Next.js",
    category: "react",
    subTags: [],
    year: null, // TODO
    scope: "Next.js site for an independent EV battery health-check service, with online booking.",
    stack: ["React", "Next.js"],
    result: null, // TODO
    link: "https://ev360.com.au",
    screenshots: [shot("ev360", "ev360.com.au")],
    palette: { bg: "#0b1220", ink: "#e8eefc", accent: "#61dafb" },
  },
  {
    id: "finevu",
    name: "FineVu Australia",
    client: "FineVu Australia",
    country: "Australia",
    platform: "Next.js",
    category: "react",
    subTags: [],
    year: null, // TODO
    scope: "Product site for a dash cam brand: front and rear dash cams, product pages, and warranty information.",
    stack: ["React", "Next.js"],
    result: null, // TODO
    link: "https://www.finevuaustralia.com.au",
    screenshots: [shot("finevu", "finevuaustralia.com.au")],
    palette: { bg: "#111014", ink: "#f2f0f5", accent: "#f08a24" },
  },
  {
    id: "sulitscan",
    name: "SulitScan PH",
    client: "Personal project",
    country: "Philippines",
    platform: "Next.js",
    category: "react",
    subTags: [],
    year: null, // TODO
    scope: "Curated Shopee PH and Sephora PH deals with buyer notes, fake-discount checks, and shopping guides.",
    stack: ["React", "Next.js"],
    result: null, // TODO
    link: "https://sulitscan.com",
    screenshots: [shot("sulitscan", "sulitscan.com")],
    palette: { bg: "#f2efe7", ink: "#151513", accent: "#16a34a" },
  },
  {
    id: "importtax",
    name: "ImportTax PH",
    client: "Personal project",
    country: "Philippines",
    platform: "Next.js",
    category: "react",
    subTags: [],
    year: null, // TODO
    scope: "Free calculator for Philippine customs duty and 12% VAT on international orders.",
    stack: ["React", "Next.js"],
    result: null, // TODO
    link: "https://importtaxph.com",
    screenshots: [shot("importtax", "importtaxph.com")],
    palette: { bg: "#0f1115", ink: "#eef0f4", accent: "#f59e0b" },
  },

  // ---- Salesforce Commerce Cloud (Demandware) ----
  {
    id: "timex",
    name: "Timex & Guess Watches",
    client: "Timex Group · TMX Philippines Inc.",
    country: null, // multi-market
    platform: "Salesforce Commerce Cloud (Demandware) · Shopify",
    category: "sfcc",
    subTags: [],
    year: "2018–2024",
    scope: "Multi-market storefronts on SFCC and Shopify: product pages, navigation, content modules, checkout-related UI, and Core Web Vitals.",
    stack: ["Salesforce Commerce Cloud (Demandware)", "Shopify", "Liquid", "JavaScript", "SASS", "Lighthouse", "GTmetrix", "Jira"],
    result: "Retained for six years; recurring defects reduced through documented procedures and standard quality checks.",
    link: "https://timex.com",
    screenshots: [shot("timex", "timex.com"), shot("guess", "guesswatches.com")],
    palette: { bg: "#0d1b2a", ink: "#f4efe6", accent: "#c9a227" },
  },
];

export const projectsIn = (category: Category) => projects.filter((p) => p.category === category);
