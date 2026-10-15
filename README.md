# Mammas oppskrifter

Static SvelteKit site with mum's favourite recipes, hosted on GitHub Pages.

```sh
pnpm install
pnpm dev
```

Add a recipe: append it to `src/lib/recipes.ts` and put its photo in `static/images/`.

On push to `main`, `.github/workflows/deploy.yml` builds the site into the `gh-pages` branch. One-time setup: repo **Settings → Pages → Deploy from a branch: `gh-pages` / root**.
