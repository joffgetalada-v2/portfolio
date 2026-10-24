# Joffrey Anthony Getalada, portfolio

Interactive portfolio of Joffrey Anthony Getalada, senior e-commerce engineer (Shopify Plus, Salesforce Commerce Cloud (Demandware), React).

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
| Projects shown in the book and the classic page | `works` in `src/content/profile.ts` |
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

## Deployment

Hosted on Vercel.

1. Import the GitHub repository in Vercel and keep the defaults (Framework: Next.js, build command `next build`).
2. Set `NEXT_PUBLIC_SITE_URL` to the production URL (e.g. `https://your-project.vercel.app` or a custom domain)
   and redeploy, so share previews and the sitemap use the right address.

Or from the command line:

```bash
npx vercel
```
