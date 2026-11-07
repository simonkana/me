# Šimon Káňa — Personal site

A simple Jekyll site for a portfolio and notebook. Warm paper colors, brighter accents, clear typography, and a few playful details give it a personal feel. The pages use plain Liquid, Markdown, semantic HTML, and one custom stylesheet. There is no database or admin service to maintain: edit the files, commit, and push.

## Preview locally

1. Install Ruby and Bundler if they are not already installed.
2. From this folder, run `bundle install` once.
3. Run `bundle exec jekyll serve`.
4. Open the local address printed by Jekyll (usually `http://127.0.0.1:4000`).

Jekyll watches content and style files while the server runs. Restart it after changing `_config.yml`.

## Edit your site

- **Your name, role, intro, location, and social links:** `_data/profile.yml`
- **Email address and site-wide SEO text:** `_config.yml`. GitHub and YouTube links live in `_data/profile.yml`.
- **Portrait photo:** replace `assets/me.webp`; update its alt text in `index.markdown` and `about.markdown` if needed.
- **Color theme:** follows the visitor’s system setting by default; the moon/sun button switches themes and remembers the choice in that browser.
- **Navigation:** `_data/navigation.yml`
- **Homepage copy and sections:** `index.markdown`
- **Photograph gallery:** your originals live in `assets/photos/`; ordered titles and alt text are in `_data/photographs.yml`. Add each image there with its path, caption, descriptive `alt`, and pixel dimensions.
- **About page:** `about.markdown`
- **CV page:** edit `cv.markdown`; projects added under `_work/` appear there automatically. On `/cv/`, use **Print / save as PDF** and choose “Save as PDF” in the browser print dialog.
- **Work items:** add Markdown files inside `_work/`. Include front matter fields `title`, `description`, and `category`; `year`, `order`, `image`, and `image_alt` are optional. Put image files in `assets/images/`.
- **Project starters:** three editable examples live in `_work/`; replace their sample copy and placeholder artwork. Remove `template: true` when a project is ready to appear on your CV, or delete a starter you do not need.
- **Journal posts:** add a file named `YYYY-MM-DD-your-title.markdown` inside `_posts/`, then add front matter with `title`, `date`, and an optional `excerpt`.
- **Colors, typography, spacing, and responsive layout:** `assets/css/main.css`
- **Page structure:** `_layouts/`

Work front matter example:

```yaml
---
title: "A project name"
description: "A short, clear sentence about the work."
category: Web
year: 2026
order: 1
image: /assets/images/project-name.jpg
image_alt: "A description of the project image"
---
Write the project story here in Markdown.
```

## Publish with GitHub Pages

The workflow in `.github/workflows/pages.yml` builds this Jekyll 4.4 site and deploys it through GitHub Actions when you push to `main`. It also builds pull requests so a broken Jekyll build is caught before merging.

1. Push the repository to GitHub.
2. In the repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
3. Push to `main` or run **Build and deploy site** from the Actions tab on `main`. The workflow publishes the generated site and reports its URL.

The site is currently configured for `https://simonkana.github.io` with an empty `baseurl`, which is correct when the repository is named `simonkana.github.io`. The workflow reads the Pages base path when it builds, so project repositories work too. Keep `url` set to the site’s origin; for local previews of a project site, set `baseurl` to `/<repository-name>`. If you use a custom domain, update `url` and configure that domain in the Pages settings.

## Content editing options

The easiest and most accessible editor is the GitHub web interface: open a Markdown or YAML file, choose the pencil icon, edit, and commit. A full CMS is intentionally not required for this setup. If you later want a visual editor, Decap CMS or another Git-based CMS can edit the same files; configure authentication and hosting as a separate step.
