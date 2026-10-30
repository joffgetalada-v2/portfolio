# Joffrey Anthony Getalada, portfolio

Interactive portfolio of Joffrey Anthony Getalada, Senior Shopify Plus Developer (also WordPress, React/Next.js and
Salesforce Commerce Cloud (Demandware)).

The landing view is a 3D book on a desk. Click the book to open it, click or swipe to turn pages, and
hover a page to see it move. Below the book is a regular scrollable version of the same content for
recruiters, search engines, and browsers without WebGL.

Stack: Next.js 16, React Three Fiber, drei, Three.js, zustand, Tailwind CSS v4.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

In development, http://localhost:3000/dev/faces renders every book page side by side (404 in production).

## Content

| What | Where |
| --- | --- |
| Name, summary, stats, skills, experience, contact links | `src/content/profile.ts` |
| Project cards on the classic page, by category | `src/content/projects.ts` |
| Case studies in the book and its dialog | `works` in `src/content/profile.ts` |
| "Stores I've worked on" list | `src/content/shopify-stores.json` |
| Store screenshots in the mosaic tile | `src/content/stores.ts`, images in `public/works/stores/` |
| Still of the desk shown before the 3D scene loads | `public/poster/` |
| Brand name (logo, cover, page titles) | `src/content/site.ts` |
| CV download | `public/Joffrey-Getalada-CV.pdf` |
| Book page artwork | `src/components/scene/textures/` |
| Desk props (cup, plant, pen, business cards) | `src/components/scene/props/` |
| Share image (Open Graph) | `src/app/opengraph-image.tsx`, fonts in `assets/fonts/` |

Options in `profile.ts`:

- `links.upwork`: Upwork profile URL. Shown in the contact panel and on the classic page when set.
- `showPhone`: shows the phone number publicly. Off by default.
- `works[].image`: screenshot path, e.g. `"/works/malbon.jpg"` in `public/works/`. Replaces the
  illustration on the book page.

`projects.ts` drives the category tabs (Shopify, WordPress, React, SFCC in that order). Fields left as
`null` are hidden on the card; fill them only with confirmed facts. In `shopify-stores.json`, setting
`industry` on any entry switches the list from A to Z to grouping by industry, and `logo` (a URL or a
path in `public/`) shows a logo next to the name.

The posters in `public/poster/` are captures of the closed-book desk view at 390x844, 768x1024,
1024x768 and 1440x900 (all 2x). If the desk, lighting or camera changes, capture them again, or the
fade from poster to live scene will jump.

## Deployment

Hosted on Vercel.

1. Import the GitHub repository in Vercel and keep the defaults (Framework: Next.js, build command `next build`).
2. Set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://your-project.vercel.app` or a custom domain)
   and redeploy, so share previews and the sitemap use the right address.

Or from the command line:

```bash
npx vercel
```
