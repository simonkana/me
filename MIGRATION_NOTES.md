# Migration notes: Jekyll → Astro (Phase 1 inventory)

Written 2026-11-12 on branch `astro-migration`. Source: the Jekyll repo at commit `6ac9bcd`.

## 1. URLs: old → new

Old URLs come from the built `_site/` and `_config.yml` (`permalink: /journal/:year/:month/:day/:title/`,
`work` collection at `/work/:name/`).

| Old URL (Jekyll) | New URL (Astro) | How |
|---|---|---|
| `/` | `/` | Same path, redesigned |
| `/about/` | `/about/` | Same |
| `/photographs/` | `/photographs/` | Same, plus `#<slug>` anchors per photo |
| `/cv/` | `/cv/` | Same |
| `/cv/cz/` | `/cv/cz/` | Same |
| `/feed.xml` | `/feed.xml` | Same path (`@astrojs/rss`) |
| `/sitemap.xml` | `/sitemap-index.xml` | `@astrojs/sitemap` output; 301 `/sitemap.xml` → `/sitemap-index.xml` |
| `/robots.txt` | `/robots.txt` | Same |
| `/404.html` | `/404.html` | `404.astro` |
| `/journal/2026/11/03/a-place-to-begin/` | `/notebook/a-place-to-begin/` | 301 in `vercel.json` |
| `/work/01-product-dashboard/` | `/work/` | 301; these were starter templates (`template: true`), not real projects |
| `/work/02-client-portal/` | `/work/` | 301 (same reason) |
| `/work/03-small-tool/` | `/work/` | 301 (same reason) |
| `/#work`, `/#journal` (nav anchors) | `/work/`, `/notebook/` | Fragments never reach the server, so no redirect is possible. The new homepage links to the new routes. |
| `/assets/me.webp` | `/og/me.webp` | 301, because external OG caches may still use the old path |
| `/assets/photos/optimized/*.webp` | hashed `/_astro/*` | Not redirected (image URLs; low value) |

## 2. Content sources and where they go

| Jekyll source | Astro destination | Notes |
|---|---|---|
| `_config.yml` (title, description, email, url, social) | `src/lib/site.ts` + `astro.config.mjs` | `description` becomes the default meta description |
| `_data/profile.yml` | `src/lib/site.ts` | name, role, location, GitHub, LinkedIn, YouTube, email |
| `_data/navigation.yml` | `Header.astro` | New nav: Work · Photographs · Notebook · About · CV |
| `_data/photographs.yml` | `src/content/photos.yaml` | titles and alt text verbatim; slug from the file name; EXIF date added |
| `photographs.markdown` | `src/pages/photographs/index.astro` | intro verbatim; H1 "Observations"; meta description verbatim |
| `index.markdown` | `src/pages/index.astro` | replaced by the living sentence; meta description ported |
| `about.markdown` | `src/content/pages/about.md` (or inline) | text verbatim, meta description verbatim, portrait + alt |
| `_posts/2026-11-03-a-place-to-begin.markdown` | `src/content/notebook/a-place-to-begin.md` | title "A first hello"; slug keeps the file name |
| `_work/*.markdown` | **not ported** | all three are starter templates; `/work/` shows the honest empty line |
| `cv.markdown` / `cv-cz.markdown` | `src/content/cv/en.yaml` / `cz.yaml` | verbatim |
| `_layouts/cv.html` | `src/layouts/Cv.astro` | toolbar, header, contact links, portrait, footer |
| `404.html` | `src/pages/404.astro` | copy rewritten into the new style (one sentence + link home) |
| `assets/js/cv-print.js` | inline processed script in `Cv.astro` | |
| `assets/js/theme.js`, `menu.js` | **dropped** | plan uses `prefers-color-scheme` only and a compact text nav |
| `assets/css/main.css` | replaced by `tokens.css`, `global.css`, `print.css` | |

## 3. Assets

| Asset | Size | Destination |
|---|---|---|
| `assets/photos/0[1-6]-*.jpg` (originals, 1474–3024 px wide) | 49 MB total incl. webp copies | `src/assets/photos/*.jpg`, processed by `astro:assets` (AVIF + WebP) |
| `assets/photos/*.webp` (full-size webp copies) | — | not needed (Astro makes its own) |
| `assets/photos/optimized/*.webp` | — | not needed |
| `assets/me.jpg` (800×800) | 240 KB | `src/assets/me.jpg` (CV portrait, About) |
| `assets/me.webp` (800×800) | 136 KB | `public/og/me.webp` (social preview) |
| `assets/favicon.svg` | — | `public/favicon.svg` |
| `assets/images/project-placeholder-0[1-3].svg` | — | not ported (template art) |

Photo capture dates (EXIF `DateTime`): 01 Oct 16, 02 Oct 16, 03 Oct 16, 04 Oct 22, 05 Oct 13,
**06 "Amber After Dark" Oct 29 (newest)**, so `now.lastPhoto` is seeded with `amber-after-dark`.

## 4. Things that are unclear or worth flagging

1. The Czech CV's education entry lists the school as "Masarykovo gymnázium", but the line under it
   says "Střední zdravotnická škola a Vyšší odborná škola zdravotnická, Vsetín". The EN version
   says "Vsetín, Czech Republic". This looks like a copy-paste slip. Ported verbatim until confirmed.
2. The CV dates overlap (Freelance Aug 2024 – Jan 2026, Sentiscrape Oct 2023 – Jun 2025, DEK May
   2025 – Jul 2026). Ported as-is.
3. `_site/` is a stale build: it contains `lightbox.js` and `photos/full-resolution/`, which are
   no longer in the sources. It is git-ignored and not needed.
4. The current site has a manual light/dark toggle (stored in `localStorage` as `site-theme`). The
   plan has only `prefers-color-scheme`, so the manual toggle is dropped.
5. The current CSP is a `<meta>` tag. The new one moves to `vercel.json` headers.
6. The GitHub Pages workflow builds Jekyll on pushes and PRs to `main`. It stays in place until
   Phase 9; Jekyll ignores `node_modules` by default, and `_config.yml` gets an `exclude` for the Astro
   folders so PR builds keep passing.

## 5. Scaffold decision

The Astro project lives in the **repo root**, next to the Jekyll files. Astro only reads `src/`,
`public/` and its config, so the Jekyll files (`_layouts`, `_posts`, `*.markdown` in the root,
`assets/`) are ignored without any configuration. A temporary folder would mean moving everything
again in Phase 9 and would break Vercel's root detection for previews. Name clashes in the root:
`README.md` (Jekyll README kept until Phase 9), `.gitignore` (merged), `404.html` and `robots.txt`
(Jekyll-only, in the root; Astro uses `src/pages/404.astro` and `public/robots.txt`).

## 6. Decisions and deviations from the plan (Phases 2–8)

| Plan | What was built | Why |
|---|---|---|
| Astro 5+ Content Layer | Astro **7.4** (`file`/`glob` loaders unchanged; `z` imported from `astro/zod`, which is Zod 4) | Latest stable at build time |
| SplitText for the line rise | Small custom splitter in `home.ts`: words become plain inline spans, grouped into lines by measured position, risen with relative `top`. ScrambleText is used as planned. | SplitText wraps words in inline-blocks, which changes where lines break around the italic live values, and it never slices links. The text visibly jumped when the split was reverted. The custom splitter keeps the browser's own line breaks, so nothing moves, and it saves ~7 KB. |
| `.js` class on `<html>` hides text until GSAP runs | Text is hidden by CSS only under `prefers-reduced-motion: no-preference`, with the 2s failsafe. `<noscript>` loads `/noscript.css`, which reveals it and hides the toggle. | No inline script needed, so the CSP stays `'self'`-only. Reduced-motion users never see hidden text. |
| CSP header (Report-Only first) | As planned in `vercel.json`. The build emits **no inline scripts or styles** (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`), so no hashes are needed. Astro's own `security.csp` is not used, because it only produces a `<meta>` tag, which cannot be Report-Only. | |
| Seed `now.json` with `TODO(simon)` | Done, and values starting with `TODO` are treated as empty, so their clause is dropped. The live site can never show a placeholder. | |
| Homepage first line | "I build software in Prague. I play guitar, sing and climb." All copy is in the first person, per Šimon. | Chat decision |
| `--accent: #b4532a` | Kept: it measures 4.52:1 on `--paper`. All dark-mode pairs pass (ink 15.1, muted 6.6, accent 6.9). | |
| Sitemap | `@astrojs/sitemap` writes `/sitemap-index.xml`; `/sitemap.xml` redirects there. | |
| Work items | Rendered inline on `/work/` (anchors per project); there are no `/work/<slug>/` pages yet. | The plan lists no detail route. |
| Toggle focus | Focus moves to the newly shown view only if it was on the toggle; otherwise it stays put. | §5.4 |
| Fonts | Latin + Latin Extended subsets only (covers Czech). | |
| CZ CV education place | Corrected to "Vsetín, Česká republika". | Chat decision |

## 7. Quality results (local `astro preview`, Lighthouse 12, mobile)

| Page | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 |
| `/photographs/` | 90–93 | 100 | 100 | 100 |
| `/cv/` | 100 | 100 | 100 | 100 |

`/photographs/` is limited by the first full-width portrait photo (LCP ≈ 3.2 s under simulated slow 4G). AVIF quality is already lowered to 50, with finer width steps. Going further means changing the design (for example capping photo height), which is Šimon's call.

Other checks: `astro check` 0 errors/warnings/hints, `vitest` 10/10, build without warnings, homepage JS 32 KB gzipped (budget 60 KB), no horizontal scroll at 360 px on any page in light or dark mode, no console errors, no-JS and reduced-motion render everything immediately, both CV PDFs are exactly 2 pages, linkinator: 112 internal links OK, Jekyll still builds and ignores the Astro files.

Not verifiable locally (check on the Vercel preview): redirects, the `curl` rewrite, response headers, the CSP report, and the Umami script on the real domain.
