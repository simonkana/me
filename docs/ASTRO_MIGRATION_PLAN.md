# Implementation plan: Jekyll → Astro redesign ("the living sentence")

> **For Claude Code.** This file describes the full migration of this repository from Jekyll
> (GitHub Pages) to a static Astro site hosted on Vercel, together with a redesign of the
> homepage. Work through the phases in order, tick the checkboxes as you go, and stop at
> every **⏸ Ask Šimon** marker before doing that step.
>
> Owner: Šimon Káňa · Written: 2026-11-12

---

## 0. Ground rules

- **Work on a branch** called `astro-migration`. Never push to the default branch or delete
  Jekyll files until Phase 9.
- **Port real content verbatim.** Copy the existing texts (About, CV EN + CZ, photo titles and
  alt texts, notebook posts, meta descriptions) from the current Jekyll sources. Never
  invent bio facts, projects, job history or numbers. If something is missing, leave a
  clearly marked `TODO(simon):` placeholder and list it in your final summary.
- **No UI framework.** Plain `.astro` components, TypeScript and CSS only. No React, Vue,
  Tailwind or a component library. The site should ship almost no JavaScript.
- **Check current docs** for Astro, GSAP and Umami before using an API. This plan follows
  the Astro 5+ Content Layer API (`src/content.config.ts` with `glob` / `file` loaders). If
  the installed version differs, follow the official docs and note the difference.
- **English only**, with one exception: the CV keeps its Czech version (`/cv/cz/`), as today.
- Commit per phase, with clear messages.

---

## 1. Decisions already made

| Topic | Decision |
|---|---|
| Framework | Latest stable Astro, `output: 'static'`, TypeScript strict |
| Hosting | Vercel, static build (Astro preset). No adapter needed. |
| Content editing | Markdown and JSON/YAML in the repo (Astro content collections). Edit, push, Vercel rebuilds. |
| "Personal API" | A static JSON file generated at build time from `src/content/now.json`, served at `/api/now.json`, plus a plain-text version at `/now.txt`. No Rails or serverless function for now (see Phase 10 for the optional upgrade). |
| Analytics | **Umami** (cookieless). No cookie banner, because nothing on the site sets cookies. |
| Legal | A **Privacy & site notice** page at `/privacy/`, linked in the footer. |
| Animation | **GSAP** with SplitText and ScrambleText, homepage only, respecting `prefers-reduced-motion`. |
| Fonts | Self-hosted through Fontsource (no requests to Google): Instrument Serif and JetBrains Mono. |
| Languages | English site; CV in EN and CZ. |

### Open items (⏸ Ask Šimon if not answered in the chat)

1. **Domain.** Custom domain on Vercel, or the default `*.vercel.app` for now? Needed for
   `site` in `astro.config.mjs`, canonical URLs, the sitemap and Umami's `data-domains`.
   Use an env var `PUBLIC_SITE_URL` so it is a one-line change.
2. **Umami.** Umami Cloud or self-hosted? Needs the script URL and the website ID. Put them in
   `PUBLIC_UMAMI_SRC` and `PUBLIC_UMAMI_WEBSITE_ID`. If they are not set, the script is
   simply not rendered (so local dev and previews are never tracked).
3. **Static CV PDFs.** The current CV offers "Print / save as PDF" (browser print). Keep that.
   Optionally also generate downloadable PDFs at build time (Phase 6b). Default: do 6b.

---

## 2. Target structure

```
/
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
├─ vercel.json                 # redirects, headers, curl rewrite
├─ .env.example                # PUBLIC_SITE_URL, PUBLIC_UMAMI_SRC, PUBLIC_UMAMI_WEBSITE_ID
├─ public/
│  ├─ favicon.svg
│  ├─ og/me.webp               # social preview image
│  └─ cv/                      # generated PDFs (Phase 6b)
├─ scripts/
│  └─ cv-pdf.ts                # Playwright: render /cv/ and /cv/cz/ to PDF (Phase 6b)
└─ src/
   ├─ content.config.ts        # collections + zod schemas
   ├─ content/
   │  ├─ now.json              # the living sentence data
   │  ├─ notebook/*.md         # posts (ported from _posts)
   │  ├─ photos.yaml           # titles, alt, order, optional EXIF
   │  ├─ work/*.md             # projects (may be empty)
   │  └─ cv/en.yaml, cv/cz.yaml
   ├─ assets/
   │  ├─ photos/*.(jpg|webp)   # originals, optimized by astro:assets
   │  └─ me.(jpg|webp)
   ├─ styles/
   │  ├─ tokens.css            # colors, type scale, spacing
   │  ├─ global.css
   │  └─ print.css             # CV print styles
   ├─ layouts/
   │  ├─ Base.astro            # <head>, meta, fonts, Umami, header, footer
   │  └─ Cv.astro
   ├─ components/
   │  ├─ Header.astro
   │  ├─ Footer.astro
   │  ├─ LivingSentence.astro  # prose view + JSON view + toggle
   │  ├─ IndexList.astro       # 01–05 index rows
   │  ├─ Umami.astro
   │  └─ Seo.astro
   ├─ scripts/
   │  └─ home-motion.ts        # GSAP, homepage only
   └─ pages/
      ├─ index.astro
      ├─ work/index.astro
      ├─ photographs/index.astro
      ├─ notebook/index.astro
      ├─ notebook/[slug].astro
      ├─ about/index.astro
      ├─ cv/index.astro        # EN
      ├─ cv/cz/index.astro     # CZ
      ├─ privacy/index.astro
      ├─ 404.astro
      ├─ feed.xml.ts           # keeps the old RSS URL
      ├─ api/now.json.ts       # prerendered static JSON
      └─ now.txt.ts            # plain-text version for curl
```

---

## 3. Routes

| # | Route | Content | Notes |
|---|---|---|---|
| — | `/` | Living sentence + index list | The redesign. See §5. |
| 01 | `/work/` | Projects from `src/content/work` | If the collection is empty, show one honest line ("Projects are being prepared. Meanwhile, see GitHub ↗") instead of an empty grid. |
| 02 | `/photographs/` | The 6 existing photos | One image per row, full width of the column, numbered italic captions, intro text ported verbatim. |
| 03 | `/notebook/` + `/notebook/[slug]/` | Posts from `_posts` | Old URLs redirect (see §8). |
| 04 | `/about/` | Ported About page | Same typography system. |
| 05 | `/cv/` and `/cv/cz/` | The CV, EN and CZ, as on the current site | EN/CZ switch, "Print / save as PDF" button, print stylesheet, optional downloadable PDFs. See Phase 6. |
| — | `/privacy/` | Privacy & site notice | Footer link. See Phase 7. |
| — | `/feed.xml` | RSS of the notebook | Same path as the Jekyll feed so subscribers keep working. |
| — | `/api/now.json` | The "personal API" | Prerendered from `now.json`. |
| — | `/now.txt` | Plain-text version | Served for `curl <domain>/now` via a Vercel rewrite. |
| — | `/404` | Minimal not-found page | One sentence in the same style plus a link home. |

Use `trailingSlash: 'always'` and `build.format: 'directory'` to keep the current URL style.

---

## 4. Design system

Take these values from the approved prototype.

### Colors (`src/styles/tokens.css`)

```css
:root {
  --paper: #faf3e5;          /* background (current theme-color, keep it) */
  --ink: #1c1a17;            /* text */
  --muted: #6b6359;          /* labels, secondary text (passes 4.5:1 on paper) */
  --rule: rgb(28 26 23 / 0.14);
  --accent: #b4532a;         /* live values only */
}
@media (prefers-color-scheme: dark) {
  :root {
    --paper: #171512;
    --ink: #f1e9da;
    --muted: #a39a8c;
    --rule: rgb(241 233 218 / 0.14);
    --accent: #e08a5e;
  }
}
```

Check every pair for at least 4.5:1 contrast and adjust the dark values if needed. Update the
`theme-color` meta for both schemes.

### Typography

- **Display and prose:** Instrument Serif (regular + italic), via `@fontsource/instrument-serif`.
- **Data, labels, code:** JetBrains Mono 400/500, via `@fontsource/jetbrains-mono`.
- Preload only the Instrument Serif regular woff2 used above the fold. Use `font-display: swap`.
- Scale:
  - Living sentence: `clamp(30px, 4.6vw, 58px)`, line-height 1.16, letter-spacing −0.01em
  - Index titles: `clamp(26px, 3vw, 34px)`
  - Page headings (H1 on inner pages): `clamp(40px, 6vw, 72px)`
  - Body on inner pages: 20–22px serif, line-height 1.5, max ~65ch
  - Mono labels: 12–13px; uppercase index labels with 0.12em tracking

### Layout

- One column, `max-width: 860px`, centered. Side padding `clamp(16px, 5vw, 64px)`.
- Vertical rhythm between homepage blocks: `clamp(56px, 9vw, 112px)`.
- No cards, no shadows, no gradients, no hero image on the homepage. Thin `--rule` lines only.
- Header on every page: `š.k.` (mono, links home) on the left. On the homepage the right side
  holds the human/machine toggle; on inner pages it holds a compact text nav
  (Work · Photographs · Notebook · About · CV).
- Footer on every page: the `$ curl <domain>/now` hint on the left; GitHub ↗ · YouTube ↗ ·
  RSS ↗ · Privacy · "Prague · <year>" on the right. Wraps on phones.
- Everything must work at 360 px width without horizontal scrolling.

---

## 5. The homepage

### 5.1 Content

```
Šimon Káňa builds software in Prague, plays guitar and climbs.

Right now he's reading <reading>, building <building>, projecting <projecting>
and listening to <listening>.

His last photograph was <last_photo>.
```

- The first line is static copy. **⏸ Ask Šimon** to confirm or rewrite it; the current site
  says "I build software. I play music & climb."
- The `<…>` values come from `src/content/now.json`, rendered in italic in `--accent`.
- `last_photo` should link to `/photographs/#<slug>`.
- If a `now` field is empty or missing, drop its clause cleanly (the sentence must still read
  naturally). Write a small helper that joins clauses with commas and "and", and test it.

Below the sentence, a mono meta row: a pulsing dot plus `live · updated <relative time>`.
The relative time is computed in the browser from `updatedAt`, with the absolute date as a
`<time datetime>` fallback for no-JS. **Remove** the prototype's "simulate an update" button
and "mock data" label.

Then the index list (`IndexList.astro`): rows `01 Work`, `02 Photographs`, `03 Notebook`,
`04 About`, `05 CV`. Each row shows the number (mono, muted), the title (serif), a short mono
note and an `→`. Notes: "software, in progress", "a few frames from Prague",
"notes & observations", "the longer version", "experience & skills". Hover shifts the row
right by 12px (CSS transition, disabled for reduced motion).

### 5.2 `now.json` schema (zod, in `content.config.ts`)

```ts
const now = defineCollection({
  loader: file('src/content/now.json'),
  schema: z.object({
    reading: z.string().optional(),
    building: z.string().optional(),
    projecting: z.string().optional(),   // climbing project, e.g. "a 6C at Smíchoff"
    listening: z.string().optional(),
    lastPhoto: z.string().optional(),    // slug from photos.yaml; validate it exists
    updatedAt: z.coerce.date(),
  }),
});
```

Adapt to how the `file` loader expects entries (an id-keyed object or an array); a single
entry with id `current` is fine. Seed it with `TODO(simon)` values, except `lastPhoto`
(use the newest photo) and `building` (use "this website in Astro").

### 5.3 The JSON ("machine") view

- Render the same data as pretty-printed JSON inside `<pre><code>`, with a small header bar:
  `GET /api/now.json` on the left and `200 OK · application/json` on the right.
- Syntax colors: keys and punctuation `--muted`, live values `--accent`, static values `--ink`.
- Do the highlighting at build time, with plain spans and no highlighting library.
- JSON shape (also used by `/api/now.json`):

```json
{
  "name": "Šimon Káňa",
  "based_in": "Prague",
  "now": {
    "reading": "…",
    "building": "…",
    "projecting": "…",
    "listening": "…"
  },
  "last_photo": { "title": "…", "url": "https://<domain>/photographs/#…" },
  "updated_at": "2026-11-12T00:40:12+01:00",
  "links": { "github": "https://github.com/simonkana", "youtube": "https://www.youtube.com/@simon-kana" }
}
```

Build the object once in `src/lib/now.ts` and import it in the homepage, `api/now.json.ts`
and `now.txt.ts`, so all three always match.

### 5.4 Toggle

- Two `<button type="button" aria-pressed>` elements, `human` and `machine`, in a pill outline.
  The pressed one is filled with `--ink` and uses `--paper` text.
- **Both views are in the HTML.** Without JS, show the prose and hide the toggle.
- Remember the choice in `localStorage`, wrapped in try/catch.
- Screen readers: the prose is the primary content. Mark the JSON view with
  `aria-label="The same information as JSON"`. When toggling, move focus only if it was on
  the toggle.

### 5.5 Motion (`src/scripts/home-motion.ts`)

Load it only on `/`, via a processed `<script>` in `index.astro`.

- Install `gsap` from npm. Register `SplitText` and `ScrambleTextPlugin`, which ship in the
  public package since GSAP 3.13; verify for the installed version.
- Wrap everything in `gsap.matchMedia()` with a `(prefers-reduced-motion: no-preference)`
  branch. With reduced motion there is no animation at all; everything is visible immediately.
- **On load:**
  1. Split the three sentence paragraphs by lines and rise them in (y 14px → 0, opacity 0 → 1,
     0.9s, stagger 0.18s, ease `power3.out`).
  2. Then scramble each live value from random glyphs into its real text (charset
     `abcdefghijklmnopqrstuvwxyz0123456789/_-·`, about 0.75s each, stagger 0.11s).
  3. Fade in the meta row and the index rows (stagger 0.06s).
- **On toggle:** fade and lift the outgoing view out (0.25s), swap, then rise the incoming
  view's lines in and scramble its accent values again. It should feel like the prose turns
  into data, not like a page change. Optionally try GSAP Flip on the shared values; keep it
  only if it looks clean.
- **Text must never be missing for SEO or no-JS.** The real text is in the HTML. Hide it
  with a `.js` class on `<html>` only until GSAP runs, and add a 2s CSS failsafe that reveals
  it anyway.
- The scramble must not be announced by screen readers: put the real value in an
  `aria-label` or visually hidden span, and mark the animated span `aria-hidden="true"`.
- Budget: homepage JS ≤ 60 KB gzipped in total. Inner pages: no JS except the CV print
  button and the relative-time script, if used.

---

## 6. CV (route 05)

Keep it as on the current site: the same sections, content, EN/CZ switch, contact links,
portrait and "Print / save as PDF".

### 6a. Page

- [ ] Port the CV content into `src/content/cv/en.yaml` and `cz.yaml`: profile, experience,
  education, skill groups, languages, personal skills, interests and contact links. Copy
  every text verbatim from the current Jekyll source.
- [ ] Build one `Cv.astro` layout that renders either language. `lang="en"` or `lang="cs"` on
  `<html>`. Add EN | CZ links, with `aria-current` on the active one.
- [ ] "Print / save as PDF" is a real `<button>` that calls `window.print()`. If downloadable
  PDFs exist (6b), add `Download PDF ↓` next to it, linking to the right language.
- [ ] `print.css`: A4, 15–18mm margins, hide header, footer, nav and buttons, black text on
  white, serif headings and readable body sizes. Avoid page breaks inside a job entry. Show
  link URLs for contact links only. It must fit cleanly on 2 pages; adjust spacing in print
  only.
- [ ] Use the same typography system on screen, with experience entries in the one-column
  layout.

### 6b. Downloadable PDFs (default: do it)

- [ ] `scripts/cv-pdf.ts`: use Playwright to open the built `/cv/` and `/cv/cz/` (served
  with `astro preview`) and save `public/cv/simon-kana-cv-en.pdf` and
  `public/cv/simon-kana-cv-cz.pdf`, using the print CSS.
- [ ] Add an npm script `cv:pdf`. Run it locally and **commit the PDFs**. Do not run
  Playwright inside the Vercel build.
- [ ] Note in the README that `npm run cv:pdf` must be rerun after any CV change.

---

## 7. Analytics, consent and privacy

### Umami

- [ ] `Umami.astro` renders
  `<script defer src={PUBLIC_UMAMI_SRC} data-website-id={PUBLIC_UMAMI_WEBSITE_ID} data-domains={host of PUBLIC_SITE_URL}>`
  only when both env vars are set and `import.meta.env.PROD` is true.
- [ ] Track two custom events with `data-umami-event` attributes, no extra JS:
  `toggle-machine` and `cv-download` (with the language as a property).
- [ ] Check Umami's current docs for the exact attributes (for example a do-not-track
  option, and data-domains). Enable do-not-track support if available.

### Cookie consent

- The site sets **no cookies**: Umami is cookieless, fonts are self-hosted, nothing is
  embedded from YouTube or other third parties (links only), and `localStorage` holds only the
  toggle preference, which is strictly functional. So **no consent banner**.
- [ ] Add this as a comment block in `Base.astro`: if any cookie-setting or tracking third
  party (embeds, GA, chat widgets…) is ever added, a consent mechanism must be added first.

### Privacy & site notice (`/privacy/`)

Write it in plain English, short, in the same typography. Sections:

1. **Who runs this site.** Šimon Káňa, Prague, Czechia, with a contact email
   (`TODO(simon)`: confirm which address to publish).
2. **What is measured.** Umami: anonymous page views, referrer, browser, OS, device type and
   country. No cookies, no cross-site tracking, no personal profiles. Mention where the
   Umami data is hosted (`TODO(simon)`: Cloud region or own server).
3. **Hosting.** Vercel processes technical request data (for example IP addresses in server
   logs) to deliver the site. Link to Vercel's privacy policy.
4. **Local storage.** Only the human/machine toggle preference, kept in your browser.
5. **No cookies, no forms, no newsletter.**
6. **Your rights** under the GDPR (access, erasure, objection) and the contact address.
   Mention the right to complain to the Czech data protection authority (ÚOOÚ).
7. **Last updated** date.

Add a visible `TODO(simon): have this reviewed` note in the source (an HTML comment, not on
the page). This is a starting point, not legal advice.

---

## 8. SEO, feeds, redirects and headers

- [ ] `Seo.astro`: title pattern `<Page> — Šimon Káňa`, homepage title
  `Šimon Káňa — software, music & climbing`, meta description per page (port the current
  ones), canonical, Open Graph and Twitter tags. Port the existing OG image.
- [ ] `@astrojs/sitemap`. Exclude `/api/*` and `/now.txt`.
- [ ] `robots.txt` pointing to the sitemap.
- [ ] `feed.xml.ts` with `@astrojs/rss` at the **same path** as today (`/feed.xml`).
- [ ] JSON-LD `Person` on the homepage and About page (name, url, sameAs: GitHub, YouTube,
  LinkedIn).
- [ ] `vercel.json`:
  - **Redirects:** every old Jekyll URL that changes, for example
    `/journal/2026/11/03/a-place-to-begin/` → `/notebook/a-place-to-begin/`. Generate the
    list from `_posts` and check the built Jekyll `_site` URLs if needed.
  - **Rewrite:** `/now` → `/now.txt` when the `user-agent` header matches `curl.*` (Vercel
    `has` condition), so `curl <domain>/now` prints the plain-text version while browsers go
    to `/`. Verify on a preview deployment.
  - **Headers:** `Cache-Control: public, max-age=31536000, immutable` for `/_astro/*`.
    Security headers: `X-Content-Type-Options`, `Referrer-Policy:
    strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera, mic, geolocation),
    and a `Content-Security-Policy` that allows `'self'` plus the Umami script origin. Start
    CSP as `Content-Security-Policy-Report-Only`, check the preview, then enforce.
  - `Content-Type: application/json` and `Access-Control-Allow-Origin: *` for `/api/now.json`.
- [ ] `now.txt` output, monospace-friendly:

```
Šimon Káňa — Prague
──────────────────────────────
reading      Piranesi
building     this website in Astro
projecting   a 6C at Smíchoff
listening    Khruangbin
last photo   The Walk Home
──────────────────────────────
updated 2026-11-12 · json: /api/now.json
```

---

## 9. Phases and checklist

### Phase 1: Inventory (no code changes)
- [ ] Read the whole Jekyll repo: `_config.yml`, layouts, includes, `_posts`, pages, `_data`,
  `assets`, the CV (EN + CZ) and the photographs page.
- [ ] Write `MIGRATION_NOTES.md` with: every current URL and its new URL, every content
  source and where it goes, all assets, and anything unclear.
- [ ] **⏸ Ask Šimon** about the open items in §1 that are still unanswered, plus anything
  unclear from the inventory.

### Phase 2: Scaffold
- [ ] Create the Astro project in the repo root on the branch (`npm create astro@latest`,
  minimal template, TypeScript strict). Keep the Jekyll files untouched for now. Configure
  Astro to ignore them, or scaffold into a temporary folder and move in Phase 9, whichever
  is cleaner; explain the choice.
- [ ] Add Fontsource fonts, `tokens.css`, `global.css`, `Base.astro`, Header, Footer, Seo and
  `.env.example`.
- [ ] Set `site`, `trailingSlash` and `build.format` in `astro.config.mjs`. Add the sitemap
  integration.
- [ ] Add scripts: `dev`, `build`, `preview`, `check` (`astro check`), `cv:pdf`.

### Phase 3: Content collections
- [ ] `content.config.ts` with `now`, `notebook`, `photos`, `work` and `cv` collections and
  zod schemas.
- [ ] Port notebook posts, photos (move originals into `src/assets/photos/`, keep titles and
  alt texts), About text and CV data.
- [ ] Validate that `now.lastPhoto` exists in `photos`.

### Phase 4: Homepage
- [ ] `src/lib/now.ts` (sentence clauses + JSON object), with small unit tests (Vitest)
  for the clause joining.
- [ ] `LivingSentence.astro` (both views, toggle, no-JS behavior), `IndexList.astro`.
- [ ] `home-motion.ts` (GSAP), following §5.5.
- [ ] `api/now.json.ts` and `now.txt.ts` (both prerendered).

### Phase 5: Inner pages
- [ ] Work, Photographs (`<Picture>` with AVIF and WebP, proper `sizes`, `loading="lazy"`
  except the first image, width and height set to avoid layout shift, `id` per photo for
  anchors), Notebook index and post pages, About, 404.

### Phase 6: CV
- [ ] 6a and 6b from §6.

### Phase 7: Analytics and privacy
- [ ] §7.

### Phase 8: SEO, redirects, headers and quality
- [ ] §8.
- [ ] `astro check` and `npm run build` with no errors or warnings.
- [ ] Lighthouse on the built site (homepage, photographs, CV): aim for 95+ in all four
  categories on mobile. Fix what's reasonable and report the scores.
- [ ] Manual checks: 360 px width, keyboard-only navigation, reduced motion, no-JS, dark
  mode, print preview of both CVs, all redirects, `curl` against `/api/now.json`.
- [ ] Check every internal link (a small script or `linkinator` on `dist/`).

### Phase 9: Deploy and switch over
- [ ] **⏸ Ask Šimon** before each step here.
- [ ] Šimon imports the repo into Vercel (Astro preset), sets the env vars and reviews the
  preview deployment.
- [ ] After approval, remove the Jekyll files (`_config.yml`, `Gemfile*`, `_layouts`,
  `_includes`, `_posts`, `_site`, Jekyll-only assets) in a single commit, and update the README
  with how to edit `now.json`, add a post or photo, regenerate CV PDFs and deploy.
- [ ] Domain: connect the chosen domain in Vercel. For the old `simonkana.github.io`
  address, GitHub Pages cannot do server redirects. Agree with Šimon whether to keep a
  tiny meta-refresh plus canonical page there pointing to the new domain, or turn Pages off.
- [ ] Open a pull request from `astro-migration` with a summary, the Lighthouse scores and
  the list of `TODO(simon)` items.

### Phase 10 (optional, later): a live API
Only if Šimon asks. Switch `/api/now` to a Vercel serverless function (add the
`@astrojs/vercel` adapter, `prerender = false` on that route only). It would merge `now.json`
with live sources such as Spotify's recently played tracks, cached with `s-maxage`, while the
homepage still renders the build-time snapshot and refreshes the values in the browser.
Never expose real-time location.

---

## 10. Definition of done

- All routes from §3 exist and match the design system in §4.
- The homepage matches §5: living sentence, human/machine toggle, GSAP motion, works without
  JS and with reduced motion.
- The CV matches the current one in content, in both languages, with print and PDF download.
- Umami loads only in production, no cookies are set, and `/privacy/` exists and is linked
  in the footer.
- All old URLs either work or redirect. `/feed.xml` still works.
- Build passes, Lighthouse 95+, and the `TODO(simon)` list is in the PR description.
