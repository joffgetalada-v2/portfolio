import { shot, workById, type SiteShot } from "./profile";

// Project cards on the classic page. Fill unknowns (null) only with confirmed facts.

export type Category = "shopify" | "wordpress" | "react";

// Page order, tabs and anchors all follow this list.
export const CATEGORIES: { id: Category; label: string; short: string }[] = [
  { id: "shopify", label: "Shopify / Shopify Plus", short: "Shopify" },
  { id: "wordpress", label: "WordPress / WooCommerce", short: "WordPress" },
  { id: "react", label: "React / Next.js", short: "React" },
];

export const SHOPIFY_TAGS = [
  "New build (free theme)",
  "Free → premium theme migration",
  "Premium theme revamp",
  "Theme customization",
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
    id: "gameology",
    name: "Gameology",
    client: "Gameology",
    country: "Australia",
    platform: "Shopify",
    category: "shopify",
    subTags: ["Theme customization"],
    year: null, // TODO
    scope: "Theme customization: custom sections, templates, and front-end changes on the existing theme.",
    stack: ["Shopify", "Liquid"],
    result: null, // TODO
    link: "https://www.gameology.com.au",
    screenshots: [shot("gameology", "gameology.com.au")],
    palette: workById.gameology.palette,
  },
  {
    id: "timex",
    name: "Timex & Guess Watches",
    client: "Timex Group · TMX Philippines Inc.",
    country: null, // multi-market
    platform: "Salesforce Commerce Cloud (Demandware) · Shopify",
    category: "shopify",
    subTags: [],
    year: "2018–2024",
    scope: "Multi-market storefronts on SFCC and Shopify: product pages, navigation, content modules, checkout-related UI, and Core Web Vitals.",
    stack: ["Salesforce Commerce Cloud (Demandware)", "Shopify", "Liquid", "JavaScript", "SASS", "Lighthouse", "GTmetrix", "Jira"],
    result: "Retained for six years; recurring defects reduced through documented procedures and standard quality checks.",
    link: "https://timex.com",
    screenshots: [shot("timex", "timex.com"), shot("guess", "guesswatches.com")],
    palette: { bg: "#0d1b2a", ink: "#f4efe6", accent: "#c9a227" },
  },
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
    link: "https://dashcamsrus.com.au",
    screenshots: [shot("dashcamsrus", "dashcamsrus.com.au")],
    palette: workById.dashcamsrus.palette,
  },

  // ---- WordPress / WooCommerce ----
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
    id: "city-mazda",
    name: "City Mazda",
    client: "City Mazda",
    country: "Australia",
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Dealer website and campaign landing pages.",
    stack: ["WordPress"],
    result: null, // TODO
    link: "https://www.citymazda.com.au",
    screenshots: [shot("citymazda", "citymazda.com.au")],
    palette: workById["city-mazda"].palette,
  },
  {
    id: "cega",
    name: "Cega",
    client: "Cega",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Main developer for the website.",
    stack: ["WordPress", "PHP", "MySQL", "HTML", "CSS"],
    result: null, // TODO
    link: "https://www.cega-jp.com",
    screenshots: [shot("cega", "cega-jp.com")],
    palette: { bg: "#f3f1ec", ink: "#1a1a1a", accent: "#c8102e" },
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
    link: "https://www.yoshinoya.com",
    screenshots: [shot("yoshinoya", "yoshinoya.com")],
    palette: { bg: "#f4efe6", ink: "#1d1a16", accent: "#e8730c" },
  },
  {
    id: "nuat-thai",
    name: "Nuat Thai Spa",
    client: "Nuat Thai Spa",
    country: "Philippines",
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Main developer for the responsive website, built at Monstar Lab Cebu.",
    stack: ["WordPress", "PHP", "MySQL", "Bootstrap 3"],
    result: null, // TODO
    link: "https://cebu-massage-spa.com",
    screenshots: [shot("nuat-thai", "cebu-massage-spa.com")],
    palette: { bg: "#efe8dc", ink: "#2a2118", accent: "#8a6a3b" },
  },
  {
    id: "qqenglish",
    name: "QQEnglish",
    client: "QQEnglish",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Maintained the websites, fixed bugs, and built new pages and functionality.",
    stack: ["WordPress", "PHP", "MySQL", "HTML", "CSS", "jQuery"],
    result: null, // TODO
    link: "https://qqenglish.jp",
    screenshots: [shot("qqenglish", "qqenglish.jp")],
    palette: { bg: "#f2f5fa", ink: "#14213d", accent: "#e63946" },
  },
  {
    id: "appstars",
    name: "Appstars",
    client: "Appstars",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Maintained the websites, fixed bugs, and built new pages and functionality.",
    stack: ["WordPress", "PHP", "MySQL", "Bootstrap 3"],
    result: null, // TODO
    link: "https://www.appstars.io",
    screenshots: [shot("appstars", "appstars.io")],
    palette: { bg: "#0f172a", ink: "#e2e8f0", accent: "#38bdf8" },
  },
  {
    id: "rusty-wallace",
    name: "Rusty Wallace Chevrolet",
    client: "Rusty Wallace Chevrolet",
    country: null, // TODO
    platform: "WordPress",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Maintained the website and updated content and the blog.",
    stack: ["WordPress", "Bootstrap 3", "HTML", "CSS", "jQuery"],
    result: null, // TODO
    link: "https://rustywallacechevrolet.com",
    screenshots: [], // no capture: the live site blocks automated browsers
    palette: { bg: "#111418", ink: "#f1f3f5", accent: "#d4a017" },
  },
  {
    id: "monican",
    name: "Monican Marketing",
    client: "Monican Marketing",
    country: null, // TODO
    platform: "WordPress · Divi",
    category: "wordpress",
    subTags: [],
    year: null, // TODO
    scope: "Maintained the website and updated content and the blog.",
    stack: ["WordPress", "Divi", "HTML", "CSS"],
    result: null, // TODO
    link: "https://monicanmarketing.com",
    screenshots: [], // no capture: the domain now redirects to another site
    palette: { bg: "#fbf7f2", ink: "#1f1b16", accent: "#7c3aed" },
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
];

export const projectsIn = (category: Category) => projects.filter((p) => p.category === category);
