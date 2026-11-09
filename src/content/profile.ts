// All site copy. Keep it in line with the CV.

export const profile = {
  name: "Joffrey Anthony Getalada",
  shortName: "Joffrey Anthony Getalada",
  firstName: "Joffrey",
  role: "Senior Shopify Plus Developer",
  headline: "Senior Shopify Plus Developer",
  // Hero and classic header lead.
  pitch: "For business owners on Shopify: I build, speed up and fix stores so shoppers find the right product faster and the pages that take orders keep working.",
  // Proof line under the pitch.
  subline: "100+ Shopify stores · 6+ years on Timex & Guess · 12+ years in e-commerce · Brands in US, EU, AU, NZ, SG",
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
    upwork: "https://www.upwork.com/freelancers/joffreyanthonyg",
  },
  summary:
    "Senior Shopify Plus Developer for business owners who want a store that loads fast, is easy to shop, and is simple to update. 12+ years in e-commerce for brands in the US, Europe, Australia, New Zealand, and Singapore: 100+ Shopify and Shopify Plus stores delivered, and 6+ years on the Timex and Guess Watches storefronts.",
  summaryMore:
    "New builds on free themes, free-to-premium theme migrations, premium theme revamps, custom front-end and back-end work, speed optimization, app integrations, and platform migrations, plus WordPress/WooCommerce and React/Next.js. Works as the sole developer for small businesses or in 3–5 person teams for mid-to-large clients, owning code review, testing, and release quality. Uses AI as a coding assistant only, preferring to write the code and check every change personally.",
  stats: [
    { value: "12+", label: "Years shipping production e-commerce" },
    { value: "100+", label: "Shopify & Shopify Plus stores" },
    { value: "6+", label: "Years on Timex & Guess Watches" },
    { value: "5", label: "Markets: US, EU, AU, NZ, SG" },
  ],
  markets: ["United States", "Europe", "Australia", "New Zealand", "Singapore"],
  strengths: [
    {
      title: "Your whole store, one developer",
      body: "100+ Shopify and Shopify Plus stores delivered end to end: new builds, theme migrations and revamps, custom code, speed work, app integrations, and platform migrations.",
    },
    {
      title: "Retained 6+ years by Timex",
      body: "Built and maintained the Timex and Guess Watches storefronts across international markets, with product, design, marketing, and QA teams.",
    },
    {
      title: "Speed work that protects sales",
      body: "Core Web Vitals work in small, regression-tested releases that protect the carts, filters, menus, and integrations your sales run on.",
    },
    {
      title: "Fewer repeat bugs",
      body: "Problems traced to the root cause across theme code, JavaScript, apps, and settings. At Timex, documented procedures and standard quality checks reduced recurring defects.",
    },
  ],
  // Who the work is for, above the services.
  audience: "I work with business owners and e-commerce managers in the US, Europe, Australia, New Zealand, and Singapore: as the sole developer for small businesses, or in a 3–5 person team for mid-to-large clients.",
  // What a store owner gets. proofIds are project ids in projects.ts; proofNote names them in the same order.
  services: [
    {
      outcome: "Shoppers find the right product sooner",
      problem: "Customers can't find what they want in your menu or on your product pages, so they leave without buying.",
      approach: "I build and refine product pages, navigation, content modules, and checkout-related screens, as I did for 6+ years on Timex and Guess Watches, plus custom templates and mega menus.",
      proofIds: ["timex", "dashcamsrus", "gameology"],
      proofNote: "Timex & Guess: product pages, navigation, checkout-related UI. Dash Cams R Us: mega menu. Gameology: custom sections.",
    },
    {
      outcome: "Fewer shoppers lost to slow pages",
      problem: "A slow store loses shoppers, and a speed fix that breaks the cart, filters, or menu costs more than it saves.",
      approach: "I find what slows each page with Lighthouse and GTmetrix, optimize front-end assets and Core Web Vitals, and ship fixes in small, tested releases so carts, filters, menus, and apps keep working.",
      proofIds: ["timex", "malbon"],
      proofNote: "Timex & Guess: Core Web Vitals verified before deployment. Malbon Golf: performance and mobile work on Shopify Plus.",
      // Owner's typical before/after range; no per-client records were kept.
      result: "Typical Google PageSpeed scores on stores I've optimized: 20–30 to 50–70 on mobile, 45–50 to 70–90 on desktop.",
    },
    {
      outcome: "Launch campaign pages faster",
      problem: "Every new promotion page needs a developer, so campaigns start late and each landing page means another invoice.",
      approach: "I build reusable sections and landing page templates your team can fill in from the Shopify theme editor for each campaign, and move marketing pages from separate tools like Framer into your store.",
      proofIds: ["atomic", "city-mazda"],
      proofNote: "Atomic Golf: Framer content moved into Shopify, plus reusable sections. City Mazda: campaign landing pages.",
    },
    {
      outcome: "Fix the bugs and app clashes that cost orders",
      problem: "An app update or theme change breaks the cart, filters, or menu, and nobody can tell you why.",
      approach: "I trace the root cause across theme code, JavaScript, app conflicts, and platform settings, then fix it. I also set up and test Klaviyo, reviews, preorder, and back-in-stock apps with your theme.",
      proofIds: ["timex", "malbon"],
      proofNote: "Timex & Guess: recurring defects reduced through documented procedures and quality checks. Malbon: production support.",
    },
    {
      outcome: "Move or rebuild, protect your Google traffic",
      problem: "You need a new platform or theme, but worry a move will lose products, break pages, or cost you your Google rankings.",
      approach: "I run platform and theme migrations, including free-to-premium theme moves: products and content transferred, SEO planned in from the start, backups and DNS changes handled, and the live store checked after launch.",
      proofIds: ["artisan", "atomic"],
      proofNote: "The Artisan Collective: full rebuild, products and content moved, SEO preserved. Atomic Golf: Framer to Shopify move.",
    },
  ],
  // How a project runs.
  process: [
    {
      title: "Start from your goal",
      body: "Work starts from your requirements and Figma designs, so the build matches what you need the store to do.",
    },
    {
      title: "Git-based development",
      body: "Every change is tracked in Git, so work can be reviewed and rolled back.",
    },
    {
      title: "Small, tested releases",
      body: "Work goes live in small releases with regression testing, so carts, filters, menus, and integrations keep working.",
    },
    {
      title: "Launch and support",
      body: "After launch I monitor the store and stay on for ongoing support, with hours that overlap the US, Australia, and Europe. Requests can come through your own Jira, HubSpot, or Zendesk.",
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
      items: ["MySQL", "Git", "GitHub", "GitLab", "Bitbucket", "Figma", "Google Lighthouse", "GTmetrix", "Agile/Scrum"],
    },
    {
      group: "Helpdesk & CRM",
      items: ["Jira", "HubSpot", "Zendesk"],
    },
  ],
  experience: [
    {
      role: "Senior E-Commerce Engineer (Freelance)",
      company: "International Clients",
      place: "Remote",
      period: "2016 – Present",
      // Shown under the company.
      note: "Part-time alongside employment 2016 – 2024, full-time since 2025",
      start: 2016,
      end: null as number | null,
      points: [
        "Built, migrated, and optimized 100+ Shopify and Shopify Plus stores, owning delivery from requirements and Figma handoff through Git-based development, launch, and post-release monitoring.",
        "Optimized page speed on client stores in small, regression-tested releases; typical Google PageSpeed scores went from 20–30 to 50–70 on mobile and from 45–50 to 70–90 on desktop.",
        "Resolved complex production issues on live stores as sole engineer for small businesses and within 3–5 person teams for mid-to-large clients, tracing root causes across theme code, JavaScript, app conflicts, and platform settings.",
        "Handled tasks, tickets, and support requests in clients’ Jira, HubSpot, or Zendesk.",
        "Integrated and validated Klaviyo, preorder and back-in-stock apps, store locators, analytics, reviews, and marketing platforms, the tools stores use to capture and keep customers.",
        "Led a full storefront rebuild for The Artisan Collective on WordPress and WooCommerce, moving products and content and preserving SEO to protect existing search traffic.",
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
        "Built and maintained production code for the Timex and Guess Watches storefronts across international markets on Shopify and Salesforce Commerce Cloud (Demandware), using JavaScript, Liquid, HTML5, and CSS3/SASS.",
        "Refined product pages, navigation, content modules, and checkout-related interfaces with product, design, marketing, and QA teams to make the path to purchase clearer.",
        "Checked speed before deployment: found bottlenecks with Lighthouse and GTmetrix, optimized front-end assets, and verified Core Web Vitals.",
        "Reduced recurring storefront defects by documenting development procedures and standardizing quality checks within Agile/Scrum workflows in Jira.",
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
        "Built custom WordPress themes, plugins, and reusable templates for clients with PHP, MySQL, JavaScript, HTML5, and CSS3.",
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
        "Developed and maintained WordPress and Laravel applications for multiple clients, covering front-end features, PHP functionality, database updates, and technical SEO for search visibility.",
        "Managed website and server migrations with backups, DNS and hosting changes, and production validation to keep client sites online through each move.",
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
  contact: {
    headline: "Tell me what’s holding your store back.",
    line: "Send your store link, what you want fixed or built, and your timeline. A short list of problems is enough to start.",
  },
  // Aside for the classic page's Selected work section.
  workIntro: "Each card shows the business, what I built, and why it matters for sales or running costs. Results appear only where they are confirmed: I don't publish numbers I can't back up.",
} as const;

// Upwork link only once a real URL is set.
export const upworkUrl = /^https?:\/\//.test(profile.links.upwork) ? profile.links.upwork : null;

export type WorkId =
  | "gameology"
  | "atomic"
  | "freelance"
  | "artisan"
  | "dashcamsrus"
  | "city-mazda"
  | "react-client"
  | "react-personal"
  | "timex";

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
  // The business goal, in the owner's terms.
  goal: string;
  highlights: string[];
  // Why it matters for sales or running costs: purpose, not a measured result.
  value: string;
  // Confirmed results only.
  result?: string;
  stack: string[];
  // Used by the book page artwork and the case-study dialog.
  palette: { bg: string; ink: string; accent: string };
  // e.g. "/works/gameology.webp", replaces the illustration on the book page.
  image?: string;
  // Classic page tiles fall back to an illustration without these.
  shots?: SiteShot[];
}

export const shot = (name: string, site: string): SiteShot => ({ src: `/works/${name}.webp`, site, width: 1000, height: 2500 });

// Case studies shown in the 3D book and its dialog. The classic page lists projects.ts.
export const works: Work[] = [
  {
    id: "gameology",
    index: "01",
    title: "Gameology",
    client: "Gameology",
    kind: "Board game retailer",
    platform: "Shopify",
    role: "Shopify developer",
    summary:
      "Custom sections, templates, and front-end changes for an Australian board game store, built on its existing Shopify theme.",
    goal: "Give the store new sections and page layouts while keeping the Shopify theme it already runs on.",
    highlights: [
      "Built custom sections and templates on the existing theme.",
      "Made front-end changes to the storefront.",
    ],
    value: "Customizing the theme a store already has costs less than a rebuild, and keeps products, apps, and settings in place while the store gets the layouts it needs.",
    stack: ["Shopify", "Liquid"],
    palette: { bg: "#1b1b1e", ink: "#f5f5f5", accent: "#b78d3a" },
    shots: [shot("gameology", "gameology.com.au")],
  },
  {
    id: "atomic",
    index: "02",
    title: "Atomic Golf",
    client: "Atomic Golf",
    kind: "Golf entertainment venue",
    platform: "Shopify",
    role: "Shopify developer",
    summary:
      "Moved marketing content from Framer into Shopify and built a kit of reusable Liquid sections for faster campaign delivery.",
    goal: "Run marketing pages inside the Shopify store instead of a separate Framer site.",
    highlights: [
      "Migrated marketing content from Framer to Shopify.",
      "Built reusable Liquid sections.",
      "Built responsive landing pages for faster campaign delivery.",
    ],
    value: "Keeping marketing pages in the store means one site to update, and reusable sections let a new landing page be built from ready-made blocks.",
    result: "Reusable Liquid sections and responsive landing pages for faster campaign delivery.",
    stack: ["Shopify", "Liquid", "Framer → Shopify", "Responsive design"],
    palette: { bg: "#f2f0ea", ink: "#111111", accent: "#ff4f1f" },
    shots: [shot("atomic", "atomicgolf.com")],
  },
  {
    id: "freelance",
    index: "03",
    title: "100+ Shopify stores",
    client: "International clients",
    kind: "Freelance practice",
    platform: "Shopify · Shopify Plus",
    period: "2016 – Present",
    role: "Senior E-Commerce Engineer (Freelance)",
    summary:
      "100+ Shopify and Shopify Plus stores delivered end to end for small businesses and mid-to-large clients: new builds, theme migrations and revamps, custom features, speed work, app integrations, and platform migrations.",
    goal: "Give store owners one developer who takes a store from requirements and Figma handoff to launch and ongoing support.",
    highlights: [
      "Owns delivery from requirements and Figma handoff through Git-based development, launch, and post-release monitoring.",
      "Optimizes page speed in small, regression-tested releases that protect carts, filters, menus, and integrations.",
      "Integrates and validates Klaviyo, preorder and back-in-stock apps, store locators, analytics, reviews, and marketing platforms.",
      "Traces root causes across theme code, JavaScript, app conflicts, and platform settings, solo or in 3–5 person teams.",
      "Handles tasks, tickets, and support requests in clients’ Jira, HubSpot, or Zendesk.",
    ],
    value: "One developer owning the work means fewer handoffs, and regression testing on each release protects the carts, filters, menus, and integrations that take orders.",
    result: "100+ Shopify and Shopify Plus stores delivered. Typical PageSpeed scores after speed work: 50–70 on mobile and 70–90 on desktop, up from 20–30 and 45–50.",
    stack: ["Shopify Plus", "Liquid", "Shopify CLI", "Klaviyo", "Git", "Figma", "Jira", "HubSpot", "Zendesk"],
    palette: { bg: "#111111", ink: "#f5f5f0", accent: "#95bf47" },
  },
  {
    id: "artisan",
    index: "04",
    title: "The Artisan Collective",
    client: "The Artisan Collective",
    kind: "Storefront rebuild",
    platform: "WordPress · WooCommerce",
    role: "Lead engineer",
    summary:
      "Led a full storefront rebuild on WordPress and WooCommerce: products and content transferred, and SEO preserved through the move.",
    goal: "Rebuild the online store on WordPress and WooCommerce without losing products, content, or search rankings.",
    highlights: [
      "Rebuilt the storefront on WordPress and WooCommerce.",
      "Transferred products and content to the new store.",
      "Preserved SEO through the move.",
    ],
    value: "Search traffic a store has already earned is traffic it does not pay for. Preserving SEO through the rebuild means the new store does not start from zero.",
    result: "SEO preserved through the rebuild.",
    stack: ["WordPress", "WooCommerce", "PHP", "Technical SEO", "Data migration"],
    palette: { bg: "#efe6d8", ink: "#2b211a", accent: "#a4532f" },
  },
  {
    id: "dashcamsrus",
    index: "05",
    title: "Dash Cams R Us",
    client: "Dash Cams R Us",
    kind: "Dash cam retailer",
    platform: "Shopify",
    role: "Shopify developer",
    summary: "Shopify store for an Australian dash cam retailer, with custom templates and a mega menu.",
    goal: "Let shoppers reach any category from one menu, and give key pages layouts built for the store's products.",
    highlights: ["Custom templates for the store.", "Mega menu navigation."],
    value: "A mega menu puts categories one click away, and custom templates let each page show what matters for its products, which helps shoppers find the right product faster.",
    stack: ["Shopify", "Liquid"],
    palette: { bg: "#0b0d0c", ink: "#f4f7f5", accent: "#24ff4f" },
    shots: [shot("dashcamsrus", "dashcamsrus.com.au")],
  },
  {
    id: "city-mazda",
    index: "06",
    title: "City Mazda",
    client: "City Mazda",
    kind: "Mazda dealership",
    platform: "WordPress",
    role: "WordPress developer",
    summary: "Dealer website and campaign landing pages on WordPress.",
    goal: "Give the dealership a website plus campaign landing pages its marketing can point to.",
    highlights: ["Dealer website on WordPress.", "Campaign landing pages."],
    value: "A landing page built for one offer gives campaign visitors a clear next step, instead of dropping them on a general homepage.",
    stack: ["WordPress"],
    palette: { bg: "#f5f5f5", ink: "#191919", accent: "#8e1c2e" },
    shots: [shot("citymazda", "citymazda.com.au")],
  },
  {
    id: "react-client",
    index: "07",
    title: "EV360 · FineVu Australia",
    client: "Australian brands",
    kind: "React client builds",
    platform: "React · Next.js",
    role: "React developer",
    summary:
      "React and Next.js sites for two Australian brands: an independent EV battery health-check service with online booking, and a dash cam brand's product site.",
    goal: "Let EV owners book a battery health check online, and give a dash cam brand a site that explains its range and warranty.",
    highlights: [
      "EV360: independent EV battery health checks across Melbourne and Brisbane, with certified State of Health reports and online booking.",
      "FineVu Australia: premium 4K and 2K front and rear dash cams, with product pages and a 3-year Australian warranty.",
      "Built with React and Next.js.",
    ],
    value: "Online booking lets customers book a battery check without a phone call, and clear product and warranty pages answer buyer questions before they ask.",
    stack: ["React", "Next.js", "JavaScript"],
    palette: { bg: "#0b1220", ink: "#e8eefc", accent: "#61dafb" },
    shots: [shot("ev360", "ev360.com.au"), shot("finevu", "finevuaustralia.com.au")],
  },
  {
    id: "react-personal",
    index: "08",
    title: "SulitScan PH · ImportTax PH",
    client: "Personal projects",
    kind: "Personal products",
    platform: "React · Next.js",
    role: "Designer & developer",
    summary:
      "Two consumer tools for Filipino shoppers: curated online deals with fake-discount checks, and a calculator for Philippine import duty and VAT.",
    goal: "Help Filipino shoppers check a deal or estimate import charges before they buy.",
    highlights: [
      "SulitScan PH: curated Shopee PH and Sephora PH deals with honest buyer notes, fake-discount checks, and shopping guides.",
      "ImportTax PH: free customs duty and 12% VAT estimator for Temu, Shein, AliExpress, Lazada, Shopee, and international orders.",
      "Built with React and Next.js.",
    ],
    value: "Designed, built, and run as my own products, from idea to live site, so I also see a website from the owner's side.",
    stack: ["React", "Next.js", "JavaScript"],
    palette: { bg: "#f2efe7", ink: "#151513", accent: "#16a34a" },
    shots: [shot("sulitscan", "sulitscan.com"), shot("importtax", "importtaxph.com")],
  },
  {
    id: "timex",
    index: "09",
    title: "Timex & Guess Watches",
    client: "Timex Group · TMX Philippines Inc.",
    kind: "Enterprise storefronts",
    platform: "Shopify · Salesforce Commerce Cloud (Demandware)",
    period: "Jun 2018 – Dec 2024",
    role: "Senior Systems Analyst, E-Commerce",
    summary:
      "6+ years building and maintaining production code for the global Timex and Guess Watches storefronts across international markets.",
    goal: "Keep multi-market watch storefronts fast, stable, and easy to shop while product, design, and marketing teams ship changes.",
    highlights: [
      "Built and maintained production storefront code on Shopify and Salesforce Commerce Cloud (Demandware) using JavaScript, Liquid, HTML5, and CSS3/SASS.",
      "Refined product pages, navigation, content modules, and checkout-related interfaces with product, design, marketing, and QA teams.",
      "Found bottlenecks with Lighthouse and GTmetrix, optimized front-end assets, and verified Core Web Vitals before deployment.",
      "Reduced recurring defects by documenting development procedures and standardizing quality checks in Agile/Scrum workflows in Jira.",
    ],
    value: "On a store that sells in many markets, a slow page or a broken checkout is costly, so changes were checked for speed and quality before release.",
    result: "Retained for 6+ years; recurring defects reduced through documented procedures and standard quality checks.",
    stack: ["Salesforce Commerce Cloud (Demandware)", "Shopify", "Liquid", "JavaScript", "SASS", "Lighthouse", "GTmetrix", "Jira"],
    palette: { bg: "#0d1b2a", ink: "#f4efe6", accent: "#c9a227" },
    shots: [shot("timex", "timex.com"), shot("guess", "guesswatches.com")],
  },
];

export const workById = Object.fromEntries(works.map((w) => [w.id, w])) as Record<WorkId, Work>;
