# alexanderzliu.github.io

Astro-powered personal site with a minimal aesthetic, subtle animations, and a simple writings section.

Dev
- Install Node 18+ (recommended: 20). Then:
- `npm install`
- `npm run dev` → open the printed localhost URL

Build & Preview
- `npm run build` → outputs to `dist/`
- `npm run preview` → serve the built site locally

Content
- Writings live in `src/content/writings/*.md` (see `src/content/config.ts`).
- Update your resume at `public/assets/Alexander_Liu_YYYY.pdf` and keep the link `/assets/Alexander_Liu_2025.pdf` in `src/pages/index.astro`.

Deploy (GitHub Pages)
- A workflow at `.github/workflows/deploy.yml` builds and deploys to Pages on pushes to `main`.
- Repository settings → Pages → Source: GitHub Actions.
- Fallback: the workflow copies any root `assets/` into `dist/assets/` during build; ideally move PDFs into `public/assets/`.

Further context
- See `MIGRATION.md` for a summary of changes, action items, and troubleshooting.
