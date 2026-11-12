# Šimon Káňa — personal site

A small static site built with [Astro](https://astro.build), hosted on Vercel. Content lives in Markdown, JSON and YAML in this repo: edit a file, push, and Vercel rebuilds.

> **Migration in progress.** The Jekyll files (`_config.yml`, `_layouts/`, `_posts/`, `*.markdown`, `assets/`, `Gemfile*`) are still here and still deploy the old site to GitHub Pages. They will be removed after the switch-over. See `MIGRATION_NOTES.md`.

## Run it locally

Requires Node 22 or newer.

```sh
npm install
npm run dev        # http://localhost:4321
npm run build      # static site in dist/
npm run preview    # serve dist/
npm run check      # astro check (types + diagnostics)
npm test           # Vitest unit tests
npm run links      # check every internal link in dist/
```

Copy `.env.example` to `.env` if you want to test analytics locally (it only renders in production builds).

## Edit the content

| What | Where |
|---|---|
| **The living sentence** (reading, building, projecting, listening, last photo) | `src/content/now.json`. Update `updatedAt` too. Empty values, or values starting with `TODO`, drop their clause from the sentence, `/api/now.json` and `/now.txt`. `lastPhoto` must be an `id` from `photos.yaml`, or the build fails with a helpful message. |
| **First line of the homepage** | `src/components/LivingSentence.astro` |
| **Notebook post** | Add `src/content/notebook/<slug>.md` with `title`, `date` and an optional `excerpt`. The URL is `/notebook/<slug>/`. Set `draft: true` to hide it. |
| **Photograph** | Put the original JPG in `src/assets/photos/` and add an entry to `src/content/photos.yaml` (`id`, `order`, `title`, `alt`, `image`). Astro creates the AVIF/WebP sizes at build time. |
| **Project** | Add `src/content/work/<slug>.md` (see `src/content/work/README.txt` for the front matter). While there are none, `/work/` shows one line linking to GitHub. |
| **About** | `src/pages/about/index.astro` |
| **CV** | `src/content/cv/en.yaml` and `src/content/cv/cz.yaml`. **After any CV change, run `npm run build && npm run cv:pdf` and commit the two PDFs in `public/cv/`.** |
| **Privacy notice** | `src/pages/privacy/index.astro` |
| **Name, links, nav notes** | `src/lib/site.ts` |
| **Colors, type, spacing** | `src/styles/tokens.css` (`global.css` for base styles, `print.css` for the CV) |

## How it fits together

- `src/lib/sentence.ts` builds the sentence clauses, the JSON object and the plain-text version, so the homepage, `/api/now.json` and `/now.txt` always match. `src/lib/now.ts` loads the data from the content collections.
- `src/scripts/home.ts` is the only real JavaScript: the human/machine toggle, the relative "updated" time and the GSAP motion. Everything is in the HTML without JS, and with `prefers-reduced-motion` nothing animates.
- Light/dark mode follows the system until someone uses the footer toggle (stored in `localStorage`). `src/scripts/theme-inline.js` is inlined in `<head>` so there is no flash; the CSP allows it by its sha256 hash, and `npm test` fails if you edit the script without updating that hash in `vercel.json`.
- Apart from that tiny theme script, inner pages ship no JavaScript. The CV offers the pre-generated PDFs; the print stylesheet still applies when someone prints the page (and is what `npm run cv:pdf` uses).
- No other inline scripts or styles are emitted (`inlineStylesheets: 'never'`, `assetsInlineLimit: 0`), so the Content Security Policy in `vercel.json` stays `'self'` plus that one hash.

## Deploy (Vercel)

1. Import the repository in Vercel. The Astro preset and `vercel.json` handle the build (`npm run build`, output `dist/`).
2. Set the environment variables from `.env.example`: `PUBLIC_SITE_URL`, `PUBLIC_UMAMI_SRC` and `PUBLIC_UMAMI_WEBSITE_ID`. Umami only runs on the host in `PUBLIC_SITE_URL`, so previews are never tracked.
3. `vercel.json` holds the redirects from the old Jekyll URLs, the `curl <domain>/now` rewrite, caching and security headers. The CSP starts as `Content-Security-Policy-Report-Only`. Once the preview shows no violations in the browser console, rename the header to `Content-Security-Policy`.

## Privacy

The site sets no cookies and embeds no third-party content. If that ever changes (embeds, other analytics, chat widgets…), add a consent mechanism first and update `/privacy/`. The same note is in `src/layouts/Base.astro`.
