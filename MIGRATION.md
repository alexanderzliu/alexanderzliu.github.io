# Website Migration to Astro

This document summarizes the migration of the site from a single static HTML/CSS page to an Astro-powered static site with a minimal blog and tasteful transitions. It also lists next steps and maintenance tips.

## Summary
- Moved to Astro for content-first workflows, near-zero JS by default, and clean page transitions.
- Preserved the minimal aesthetic and typography.
- Added a simple writings section with Markdown posts via Astro Content Collections.
- Set up a GitHub Pages deploy workflow that builds on pushes to `main`.

## What Changed
- Added core files: `package.json`, `astro.config.mjs`, `tsconfig.json`.
- Created layout and pages:
  - `src/layouts/Base.astro` (shared HTML shell and head).
  - `src/pages/index.astro` (home).
  - `src/pages/writings/index.astro` (writings list).
  - `src/pages/writings/[slug].astro` (writings post route).
- Writings content collection:
  - `src/content/config.ts` (schema: `title`, `description?`, `date`, `draft?`).
  - Example post: `src/content/writings/welcome.md`.
- Styles moved and enhanced:
  - `public/style.css` (original rules + subtle link underline and fade-up on load; respects `prefers-reduced-motion`).
- Smooth navigation:
  - Enabled built-in View Transitions via `astro:transitions` with `transition:animate` on links for cross-page fades.
- Deployment:
  - `.github/workflows/deploy.yml` builds the site and deploys to GitHub Pages using Actions.
  - Includes a fallback step that copies any root `assets/` folder into `dist/assets/` during build to keep existing files (e.g., resume) working until they are moved under `public/`.
- Cleanup: Removed legacy `index.html` and `style.css` from repo root.

## New Structure (high level)
- `src/pages/` — routes (`index.astro`, `writings/…`).
- `src/layouts/` — shared markup (`Base.astro`).
- `src/content/` — content collections for writings posts.
- `public/` — static assets served at root (`/style.css`, `/assets/*`).
- `.github/workflows/deploy.yml` — GitHub Pages build/deploy.

## Local Development
- Requirements: Node 18+ (recommended: Node 20).
- Install deps: `npm install`
- Start dev server: `npm run dev` and open the printed localhost URL.
- Build: `npm run build` (outputs to `dist/`).
- Preview build: `npm run preview`.

## Deployment (GitHub Pages)
- Workflow triggers on pushes to `main` and publishes `dist/` to Pages.
- In GitHub → Settings → Pages: set Source to GitHub Actions.
- `astro.config.mjs` sets `site` to `https://alexanderzliu.github.io` for correct absolute URLs.

## Content & Writings
- Writings live in `src/content/writings/*.md` (or `*.mdx` if MDX is added later).
- Frontmatter fields:
  - `title: string`
  - `description?: string`
  - `date: YYYY-MM-DD` (or a JS date)
  - `draft?: boolean` (drafts are excluded in production)
- Add a post: create `src/content/writings/my-post.md` with frontmatter and Markdown body.

## Styling & Effects
- Global CSS is in `public/style.css`. It includes:
  - Original variables, layout, and type choices.
  - Subtle link underline reveal and color change on hover/focus.
  - A gentle fade-up for the main wrapper, disabled when users prefer reduced motion.
- View transitions: provided by `@astrojs/view-transitions` and `transition:animate` on links.

## Action Items (Recommended Next Steps)
1. Move resume PDF into `public/assets/` for local dev parity:
   - Move `assets/Alexander_Liu_2025.pdf` → `public/assets/Alexander_Liu_2025.pdf`.
   - The homepage already links to `/assets/Alexander_Liu_2025.pdf`.
2. Verify Pages configuration:
   - Ensure Pages is set to deploy via GitHub Actions.
   - Push to `main` and confirm the workflow finishes successfully.
3. Add content:
   - Write initial posts in `src/content/writings/`.
   - Update the homepage links or add more site sections as needed.
4. Optional polish:
   - Customize view transition style (e.g., cross-fade/slide) and timing.
   - Add MDX support if you want JSX in posts.
   - Add RSS and sitemap integrations for discoverability.
   - Consider lightweight analytics (e.g., GTag or Plausible) and SEO tags.

## Notes & Caveats
- Until the resume PDF is moved into `public/assets/`, it won’t be served by the dev server. The deploy workflow’s fallback still copies `assets/` into `dist/assets/` for production.
- Links to assets should be root-relative (e.g., `/assets/...`) in the Astro project.
- Keep `site` in `astro.config.mjs` aligned with your public domain if it changes.

## Troubleshooting
- 404 for `/assets/...` in dev: make sure the file is under `public/assets/`.
- Node not found or old: install Node 18+ and re-run `npm install`.
- Pages not updating: verify the GitHub Actions workflow succeeded and the repo’s Pages settings use GitHub Actions.

## Rollback
If you need to revert temporarily, restore the previous commit that contained the static `index.html` and `style.css` via `git revert` or by checking out that commit. Note: the new Astro structure is designed to preserve your minimal look while enabling future growth, so rolling back should rarely be necessary.
