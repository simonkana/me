# Šimon Káňa — personal site

My personal site: a homepage that tells you what I'm up to right now, plus my work, photographs, notebook, about page and CV. It's a static [Astro](https://astro.build) site hosted on Vercel, live at <https://simonkana.vercel.app>.

There's no CMS or database. Content lives in Markdown, JSON and YAML in this repo: edit a file, push to `main`, and Vercel rebuilds. Every other branch gets its own preview deployment.

## Run it locally

Requires Node 24 (Astro 7 needs at least 22.23).

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/
npm run check      # astro check (types + diagnostics)
npm test           # Vitest unit tests
npm run links      # check every internal link in dist/ (after a build)
npm run cv:pdf     # regenerate the CV PDFs (after a build)
```

Copy `.env.example` to `.env` to test analytics locally. Umami only renders in production builds.

## Edit the content

| What | Where |
|---|---|
| **The living sentence** (reading, building, projecting, listening, last photo) | `src/content/now.json`. Update `updatedAt` too. An empty value, or one starting with `TODO`, drops its clause from the sentence, `/api/now.json` and `/now.txt`. `lastPhoto` must be an `id` from `photos.yaml`; otherwise the build fails and lists the valid ids. |
| **First line of the homepage** | `src/components/LivingSentence.astro` |
| **Notebook post** | Add `src/content/notebook/<slug>.md` with `title`, `date` and an optional `excerpt`. The URL is `/notebook/<slug>/`. Set `draft: true` to hide it. It also appears in the RSS feed at `/feed.xml`. |
| **Photograph** | Put the original JPG in `src/assets/photos/` and add an entry to `src/content/photos.yaml` (`id`, `order`, `title`, `alt`, `image`). Astro creates the AVIF/WebP sizes and strips metadata at build time. **The original file in the repo keeps its EXIF data, so check it has no GPS location before committing.** |
| **Project** | Add `src/content/work/<slug>.md` (front matter in `src/content/work/README.txt`). While there are none, `/work/` shows one line linking to GitHub. |
| **About** | `src/pages/about/index.astro` |
| **CV** | `src/content/cv/en.yaml` and `src/content/cv/cz.yaml`. **After any CV change, run `npm run build && npm run cv:pdf` and commit the two PDFs in `public/cv/`.** Vercel doesn't regenerate them. |
| **Privacy notice** | `src/pages/privacy/index.astro` |
| **Name, links, homepage index notes** | `src/lib/site.ts` |
| **Colors, type, spacing** | `src/styles/tokens.css` (`global.css` for base styles, `print.css` for the CV) |

## Project structure

```
src/
  content/          now.json, photos.yaml, notebook/, work/, cv/   (schemas in src/content.config.ts)
  assets/           original photos and portrait (optimized at build time)
  pages/            one file per route, plus /api/now.json, /now.txt, /feed.xml, /robots.txt
  layouts/          Base.astro (head, header, footer), Cv.astro
  components/       LivingSentence, IndexList, Header, Footer, Seo, Umami
  lib/              site constants, sentence/JSON builders (+ tests)
  scripts/          home.ts (homepage motion), theme-inline.js (light/dark)
  styles/           tokens.css, global.css, print.css
public/             favicon, social image, CV PDFs, noscript.css
scripts/cv-pdf.ts   renders /cv/ and /cv/cz/ to PDF with Playwright
docs/               the migration plan and notes from the move off Jekyll
vercel.json         redirects, the curl rewrite, caching and security headers
```

## How it fits together

- `src/lib/sentence.ts` builds the sentence clauses, the JSON object and the plain-text version, so the homepage, `/api/now.json` and `/now.txt` always match. `src/lib/now.ts` loads the data from the content collections.
- `src/scripts/home.ts` is the homepage's only JavaScript: the human/machine toggle, the relative "updated" time and the GSAP motion. Everything is in the HTML without JS, and with `prefers-reduced-motion` nothing animates.
- Light/dark mode follows the system until someone uses the footer toggle (stored in `localStorage`). `src/scripts/theme-inline.js` is inlined in `<head>` so there's no flash of the wrong colors. The CSP allows it by its sha256 hash, and `npm test` fails if you edit the script without updating that hash in `vercel.json`.
- Apart from that tiny theme script, inner pages ship no JavaScript.
- No other inline scripts or styles are emitted (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`), so the Content Security Policy stays `'self'` plus that one hash.
- `curl <domain>/now` returns the plain-text card (a `user-agent` rewrite in `vercel.json`); browsers visiting `/now` go to the homepage.
- Old Jekyll URLs (`/journal/…`, `/work/<name>/`, `/sitemap.xml`, `/assets/me.webp`) redirect permanently to their new homes.

## Deploy (Vercel)

- The project is connected to this repository with the Astro preset; `vercel.json` sets the build command (`npm run build`) and the output folder (`dist/`).
- Environment variables (Production and Preview), as in `.env.example`:
  - `PUBLIC_SITE_URL`: the site's origin, used for canonical URLs, the sitemap, RSS and Umami
  - `PUBLIC_UMAMI_SRC` and `PUBLIC_UMAMI_WEBSITE_ID`: Umami only runs on the host in `PUBLIC_SITE_URL`, so previews are never tracked

  Redeploy after changing them; they are read at build time.
- The CSP currently ships as `Content-Security-Policy-Report-Only`. Once the browser console on the live site shows no CSP reports, rename the header to `Content-Security-Policy` in `vercel.json` to enforce it.
- Moving to a custom domain: add it in Vercel, change `PUBLIC_SITE_URL`, update the domain in Umami, and redeploy.

## Privacy

The site sets no cookies and embeds no third-party content. Umami counts anonymous page views without cookies. If that ever changes (embeds, other analytics, chat widgets…), add a consent mechanism first and update `/privacy/`. The same note is in `src/layouts/Base.astro`.
