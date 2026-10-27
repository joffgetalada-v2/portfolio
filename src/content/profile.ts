// All site copy. Keep it in line with the CV.

export const profile = {
  name: "Joffrey Anthony Getalada",
  shortName: "Joffrey Anthony Getalada",
  firstName: "Joffrey",
  role: "Senior Software Engineer",
  headline: "Senior E-Commerce Engineer · Shopify Plus & Salesforce Commerce Cloud (Demandware)",
  location: "Cebu, Philippines",
  timezone: "GMT+8",
  availability: "Remote · overlap with US, AU & EU hours",
  email: "joffgetalada@gmail.com",
  // Hidden unless showPhone is true.
  phone: "+63 917 174 4467",
  showPhone: false,
  links: {
    linkedin: "https://linkedin.com/in/joffreygetalada",
    github: "https://github.com/joffgetalada-v2",
    // Shown in the contact panel when set.
    upwork: "",
  },
  summary:
    "Senior software engineer with 12+ years building and scaling production e-commerce platforms for brands in the US, Europe, Australia, New Zealand, and Singapore. Deep platform expertise across Shopify Plus and Salesforce Commerce Cloud (Demandware), including six years supporting global Timex and Guess Watches storefronts.",
  summaryMore:
    "Strong in JavaScript and React/Next.js engineering, API and third-party integrations, platform migrations, and Core Web Vitals performance. Diagnoses complex production issues across code, apps, and platform settings. Works independently or in distributed teams, owning code review, testing, and release quality.",
  stats: [
    { value: "12+", label: "Years shipping production e-commerce" },
    { value: "50+", label: "Shopify & Shopify Plus stores" },
    { value: "6+", label: "Years on Timex & Guess Watches" },
    { value: "5", label: "Markets: US, EU, AU, NZ, SG" },
  ],
  markets: ["United States", "Europe", "Australia", "New Zealand", "Singapore"],
  strengths: [
    {
      title: "Enterprise commerce",
      body: "6+ years on international Timex and Guess Watches storefronts on Shopify and Salesforce Commerce Cloud (Demandware), a specialty few engineers have.",
    },
    {
      title: "Scale of delivery",
      body: "50+ Shopify and Shopify Plus stores built, migrated, integrated, or optimized across apparel, golf, furniture, gaming, and lifestyle brands.",
    },
    {
      title: "Performance without regressions",
      body: "Core Web Vitals improvements shipped incrementally with regression testing to protect carts, filters, menus, and integrations.",
    },
    {
      title: "Remote delivery",
      body: "10+ years with clients and teams across time zones, from requirements and Figma handoff to launch and ongoing support.",
    },
  ],
  skills: [
    {
      group: "Languages & Frameworks",
      items: ["JavaScript (ES6+)", "React", "Next.js", "PHP", "Laravel", "Python", "Django", "HTML5", "CSS3/SASS", "Tailwind CSS"],
    },
    {
      group: "Commerce Platforms",
      items: ["Shopify", "Shopify Plus", "Liquid", "Shopify CLI", "Salesforce Commerce Cloud (Demandware)", "WooCommerce", "WordPress"],
    },
    {
      group: "Engineering",
      items: [
        "REST API & third-party integrations",
        "Platform migrations",
        "Core Web Vitals",
        "Technical SEO",
        "Accessibility",
        "Debugging & root-cause analysis",
        "Cross-browser testing",
      ],
    },
    {
      group: "Data & Tools",
      items: ["MySQL", "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Figma", "Google Lighthouse", "GTmetrix", "Agile/Scrum"],
    },
  ],
  experience: [
    {
      role: "Senior E-Commerce Engineer (Freelance)",
      // Hidden for now; set to false to show it again.
      hidden: true,
      company: "International Clients",
      place: "Remote",
      period: "2016 – Present",
      start: 2016,
      end: null as number | null,
      points: [
        "Engineered, migrated, and optimized 50+ Shopify and Shopify Plus stores, owning delivery from requirements and Figma handoff through Git-based development, launch, and post-release monitoring.",
        "Improved page speed on client stores through incremental releases and regression testing, protecting carts, filters, menus, and integrations.",
        "Resolved complex production issues as sole engineer for small businesses and within 3–5 person teams for mid-to-large clients, tracing root causes across theme code, JavaScript, app conflicts, and platform settings.",
        "Integrated and validated third-party systems including Klaviyo, preorder and back-in-stock apps, store locators, analytics, reviews, and marketing platforms.",
        "Led a full storefront rebuild for The Artisan Collective on WordPress and WooCommerce, including product and content transfer and SEO preservation.",
      ],
    },
    {
      role: "Senior Systems Analyst, E-Commerce",
      company: "TMX Philippines Inc. (Timex Group)",
      place: "Cebu, Philippines",
      period: "Jun 2018 – Dec 2024",
      start: 2018,
      end: 2024,
      points: [
        "Built and maintained production code for Timex and Guess Watches storefronts across international markets on Shopify and Salesforce Commerce Cloud (Demandware), using JavaScript, Liquid, HTML5, and CSS3/SASS.",
        "Improved purchase journeys by refining product pages, navigation, content modules, and checkout-related interfaces with product, design, marketing, and QA teams.",
        "Used Lighthouse and GTmetrix to find bottlenecks, optimize front-end assets, and verify Core Web Vitals before deployment.",
        "Reduced recurring defects by documenting development procedures and standardizing quality checks within Agile/Scrum workflows in Jira.",
        "Retained for 6+ years supporting evolving commerce platforms and global business priorities.",
      ],
    },
    {
      role: "Full Stack WordPress Developer",
      company: "Monstar Lab Cebu, Inc.",
      place: "Cebu, Philippines",
      period: "Sep 2016 – Jun 2018",
      start: 2016,
      end: 2018,
      points: [
        "Built custom WordPress themes, plugins, and reusable templates with PHP, MySQL, JavaScript, HTML5, and CSS3.",
        "Developed the Yoshinoya website from the ground up and a responsive site for Nuat Thai Spa.",
      ],
    },
    {
      role: "Full Stack WordPress Developer",
      company: "Social Media Enterprise Pte. Ltd.",
      place: "Singapore",
      period: "Mar 2015 – Mar 2016",
      start: 2015,
      end: 2016,
      points: [
        "Developed and maintained WordPress and Laravel applications for multiple clients, covering front-end features, PHP functionality, database updates, and technical SEO.",
        "Managed website and server migrations with backups, DNS and hosting changes, and production validation to protect service continuity.",
      ],
    },
    {
      role: "IT Administrator",
      company: "Expressions International",
      place: "Singapore",
      period: "Mar 2014 – Mar 2015",
      start: 2014,
      end: 2015,
      points: [
        "Maintained the online store, advertising websites, and day-to-day IT operations; built HTML email templates for marketing campaigns.",
      ],
    },
  ],
  education: {
    degree: "Bachelor of Science in Information Technology",
    school: "University of Cebu – Banilad, Philippines",
    year: "2009",
  },
  languages: ["English (professional working proficiency)", "Filipino (native)"],
} as const;

// Experience entries currently shown on the site.
export const experience = profile.experience.filter((job) => !("hidden" in job && job.hidden));

export type WorkId = "timex" | "malbon" | "atomic" | "artisan" | "freelance" | "react-client" | "react-personal";

/** Live-site screenshot for the classic page work tiles. */
export interface SiteShot {
  src: string;
  site: string;
  width: number;
  height: number;
}

export interface Work {
  id: WorkId;
  // Display number: "01", "02", ...
  index: string;
  title: string;
  client: string;
  kind: string;
  platform: string;
  period?: string;
  role: string;
  summary: string;
  highlights: string[];
  stack: string[];
  // Used by the book page artwork and the case-study dialog.
  palette: { bg: string; ink: string; accent: string };
  // e.g. "/works/malbon.jpg", replaces the illustration on the book page.
  image?: string;
  // Classic page tiles fall back to an illustration without these.
  shots?: SiteShot[];
  // Left off the site for now; set to false to show it again.
  hidden?: boolean;
}

const shot = (name: string, site: string): SiteShot => ({ src: `/works/${name}.webp`, site, width: 1000, height: 2500 });

const allWorks: Work[] = [
  {
    id: "timex",
    index: "01",
    title: "Timex & Guess Watches",
    client: "Timex Group · TMX Philippines Inc.",
    kind: "Enterprise storefronts",
    platform: "Shopify · Salesforce Commerce Cloud (Demandware)",
    period: "Jun 2018 – Dec 2024",
    role: "Senior Systems Analyst, E-Commerce",
    summary:
      "Six years building and maintaining production code for the global Timex and Guess Watches storefronts across international markets.",
    highlights: [
      "Built and maintained production storefront code on Shopify and Salesforce Commerce Cloud (Demandware) using JavaScript, Liquid, HTML5, and CSS3/SASS.",
      "Refined product pages, navigation, content modules, and checkout-related interfaces with product, design, marketing, and QA teams.",
      "Found bottlenecks with Lighthouse and GTmetrix, optimized front-end assets, and verified Core Web Vitals before deployment.",
      "Reduced recurring defects by documenting development procedures and standardizing quality checks in Agile/Scrum workflows in Jira.",
    ],
    stack: ["Salesforce Commerce Cloud (Demandware)", "Shopify", "Liquid", "JavaScript", "SASS", "Lighthouse", "GTmetrix", "Jira"],
    palette: { bg: "#0d1b2a", ink: "#f4efe6", accent: "#c9a227" },
    shots: [shot("timex", "timex.com"), shot("guess", "guesswatches.com")],
  },
  {
    id: "malbon",
    index: "02",
    title: "Malbon Golf / Buckets Club",
    client: "Malbon Golf",
    kind: "Lifestyle golf brand",
    platform: "Shopify Plus",
    role: "Front-end engineer",
    summary: "Front-end enhancements, mobile improvements, performance work, and ongoing production support for a Shopify Plus golf lifestyle brand.",
    highlights: [
      "Front-end enhancements across the storefront.",
      "Mobile improvements for shoppers on small screens.",
      "Performance work on the live store.",
      "Ongoing production support.",
    ],
    stack: ["Shopify Plus", "Liquid", "JavaScript", "CSS3/SASS"],
    palette: { bg: "#1f3b2d", ink: "#f2ede0", accent: "#e4572e" },
    shots: [shot("malbon", "malbon.com")],
  },
  {
    id: "atomic",
    index: "03",
    title: "Atomic Golf",
    client: "Atomic Golf",
    kind: "Golf entertainment venue",
    platform: "Shopify",
    role: "Shopify developer",
    summary: "Moved marketing content from Framer into Shopify and built a kit of reusable Liquid sections for faster campaign delivery.",
    highlights: [
      "Migrated marketing content from Framer to Shopify.",
      "Built reusable Liquid sections.",
      "Built responsive landing pages for faster campaign delivery.",
    ],
    stack: ["Shopify", "Liquid", "Framer → Shopify", "Responsive design"],
    palette: { bg: "#f2f0ea", ink: "#111111", accent: "#ff4f1f" },
    shots: [shot("atomic", "atomicgolf.com")],
  },
  {
    id: "artisan",
    index: "04",
    title: "The Artisan Collective",
    client: "The Artisan Collective",
    kind: "Storefront rebuild",
    platform: "WordPress · WooCommerce",
    role: "Lead engineer",
    summary: "Led a full storefront rebuild on WordPress and WooCommerce: product and content transfer, SEO preservation, and conversion-focused optimization.",
    highlights: [
      "Rebuilt the storefront on WordPress and WooCommerce.",
      "Transferred products and content to the new store.",
      "Preserved SEO through the move.",
      "Applied conversion-focused optimization on the new store.",
    ],
    stack: ["WordPress", "WooCommerce", "PHP", "Technical SEO", "Data migration"],
    palette: { bg: "#efe6d8", ink: "#2b211a", accent: "#a4532f" },
  },
  {
    id: "freelance",
    index: "05",
    title: "50+ Shopify stores",
    client: "International clients",
    kind: "Freelance practice",
    platform: "Shopify · Shopify Plus",
    period: "2016 – Present",
    role: "Senior E-Commerce Engineer (Freelance)",
    summary:
      "Engineered, migrated, and optimized 50+ Shopify and Shopify Plus stores across apparel, golf, furniture, gaming, and lifestyle brands.",
    highlights: [
      "Owns delivery from requirements and Figma handoff through Git-based development, launch, and post-release monitoring.",
      "Improves page speed through incremental releases and regression testing that protect carts, filters, menus, and integrations.",
      "Integrates and validates Klaviyo, preorder and back-in-stock apps, store locators, analytics, reviews, and marketing platforms.",
      "Traces root causes across theme code, JavaScript, app conflicts, and platform settings, solo or in 3–5 person teams.",
    ],
    stack: ["Shopify Plus", "Liquid", "Shopify CLI", "Klaviyo", "Git", "Figma"],
    palette: { bg: "#111111", ink: "#f5f5f0", accent: "#95bf47" },
  },
  {
    id: "react-client",
    hidden: true,
    index: "06",
    title: "EV360 · FineVu Australia",
    client: "Australian brands",
    kind: "React client builds",
    platform: "React · Next.js",
    role: "React developer",
    summary:
      "React and Next.js sites for two Australian brands: an independent EV battery health-check service with online booking, and a dash cam brand's product site.",
    highlights: [
      "EV360: independent EV battery health checks across Melbourne and Brisbane, with certified State of Health reports and online booking.",
      "FineVu Australia: premium 4K and 2K front and rear dash cams, with product pages and a 3-year Australian warranty.",
      "Built with React and Next.js.",
    ],
    stack: ["React", "Next.js", "JavaScript"],
    palette: { bg: "#0b1220", ink: "#e8eefc", accent: "#61dafb" },
    shots: [shot("ev360", "ev360.com.au"), shot("finevu", "finevuaustralia.com.au")],
  },
  {
    id: "react-personal",
    index: "07",
    title: "SulitScan PH · ImportTax PH",
    client: "Personal projects",
    kind: "Personal products",
    platform: "React · Next.js",
    role: "Designer & developer",
    summary:
      "Two consumer tools for Filipino shoppers: curated online deals with fake-discount checks, and a calculator for Philippine import duty and VAT.",
    highlights: [
      "SulitScan PH: curated Shopee PH and Sephora PH deals with honest buyer notes, fake-discount checks, and shopping guides.",
      "ImportTax PH: free customs duty and 12% VAT estimator for Temu, Shein, AliExpress, Lazada, Shopee, and international orders.",
      "Built with React and Next.js.",
    ],
    stack: ["React", "Next.js", "JavaScript"],
    palette: { bg: "#f2efe7", ink: "#151513", accent: "#16a34a" },
    shots: [shot("sulitscan", "sulitscan.com"), shot("importtax", "importtaxph.com")],
  },
];

// Visible works, numbered by position so the list, tiles and dialog agree.
export const works: Work[] = allWorks
  .filter((w) => !w.hidden)
  .map((w, i) => ({ ...w, index: String(i + 1).padStart(2, "0") }));

export const workById = Object.fromEntries(
  allWorks.map((w) => [w.id, works.find((v) => v.id === w.id) ?? w]),
) as Record<WorkId, Work>;
