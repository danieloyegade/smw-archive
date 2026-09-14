# See My World Archive

An interactive archive of See My World — photography, performance and community
history across Manchester and Lagos. Built with [Astro](https://astro.build) and
[three.js](https://threejs.org), deployed as a static site to GitHub Pages.

## Getting started

```sh
npm install
npm run dev        # http://127.0.0.1:4328
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built site |
| `npm run check` | `astro check` — typechecks `.astro`, `.ts` and content frontmatter |
| `npm test` | Builds, then asserts things about `dist/` (see `tests/`) |
| `npm run test:e2e` | Browser smoke tests against `dist/` |

Running the browser tests needs a Chromium: `npx playwright install chromium`,
or point at an existing one with `CHROMIUM_PATH=/path/to/chrome npm run test:e2e`.

## How the archive is structured

### Content

Each entry is one Markdown file in `src/content/projects/`. **The filename is the
URL slug.** Frontmatter is validated by the Zod schema in `src/content.config.ts`,
so a typo in a field name or a pointer to a missing image fails the build rather
than silently rendering an empty page.

```yaml
---
order: 3                    # position in the archive; drives globe layout + numbering
title: "Liberation"
category: "Movement"
year: "2025"                # four digits, as a string
description: "…"            # used on the page and in meta tags
places: ["Manchester", "Royal Exchange Theatre"]
keywords: ["protest", "theatre"]
image: "../../assets/projects/liberation-2025.jpg"   # optional
alt: "…"                    # required whenever `image` is set
---

Optional Markdown body, rendered beneath the description.
```

Slugs are derived from titles. When a slug has to change, add the old one to
`src/lib/legacy-slugs.ts` — it keeps working as a redirect, and a test asserts
every legacy slug still points at a real entry.

### Images

Source photographs live in `src/assets/projects/` and go through Astro's asset
pipeline, which generates the sizes and formats each surface needs: 1024px WebP
textures for the globe, 160px thumbnails for the list, and responsive hero images
on detail pages.

Keep committed sources at **2400px on the longest edge or under**. Camera masters
(6000px, 15MB+) belong in the archive's own storage, not in the repo — they make
clones and builds slow for no visible benefit at web sizes.

An entry with no `image` is a deliberate gap: the globe draws a generated panel
and the detail page draws a numbered placeholder.

### The globe

`src/scripts/archive-globe.ts` is the only copy of the globe code; Astro bundles
it from `src/components/ArchiveGlobe.astro`. Nothing about the globe is committed
as pre-built JavaScript, and a test fails if `dist/archive-globe.js` reappears.

The globe is an **enhancement**. `ArchiveGlobe.astro` server-renders the complete
archive as a list, and the script only switches to the globe once a WebGL context
is live. Without JavaScript, without WebGL, or with a keyboard or screen reader,
the list is the archive. Anything that makes an entry reachable *only* through the
globe is a bug.

## Deployment

`main` deploys to GitHub Pages via `.github/workflows/deploy.yml`. Typecheck,
build tests and browser tests all gate the deploy, and the artifact that ships is
the one those tests ran against. Pull requests run the same checks without
deploying.

The build output is **not** committed. Pages must be configured to deploy from
GitHub Actions, not from a branch folder.

## Known gaps

- **Placeholder entries.** 11 of the 20 entries have no photograph yet: `homage`,
  `poetic-justice`, `everyday-manchester`, `everyday-people`, `abasindi`,
  `moss-side-and-hulme`, `kents-kitchen`, `james-baldwin-schools-poetry`,
  `oral-histories`, `community-workshops`, `see-my-world-archive`. Drop a file in
  `src/assets/projects/` and add `image` + `alt` to the entry.
- **Alt text is provisional.** The nine entries with photographs carry generic alt
  text ("Photograph from the … archive"). Real descriptions need someone who has
  seen the images.
- **The globe is not geographic.** `places` holds real place names, but panels sit
  on an arbitrary 5×4 grid. Adding coordinates to the schema and positioning
  entries by where they happened would make the globe mean something.
