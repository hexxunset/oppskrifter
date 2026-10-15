# Mammas oppskrifter

Static SvelteKit site with mum's favourite recipes, hosted on GitHub Pages.

```sh
pnpm install
pnpm dev
```

Add a recipe: append it to `src/lib/recipes.ts` and put its photo in `static/images/`.

Deploys on push to `main` via `.github/workflows/deploy.yml`. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
