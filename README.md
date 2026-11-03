# Personal site

A small Jekyll site for a portfolio and journal. The pages use plain Liquid, Markdown, semantic HTML, and one custom stylesheet. There is no database or admin service to maintain: edit the files, commit, and push.

## Preview locally

1. Install Ruby and Bundler if they are not already installed.
2. From this folder, run `bundle install` once.
3. Run `bundle exec jekyll serve`.
4. Open the local address printed by Jekyll (usually `http://127.0.0.1:4000`).

Jekyll watches content and style files while the server runs. Restart it after changing `_config.yml`.

## Edit your site

- **Your name, intro, location, and social links:** `_data/profile.yml`
- **Portrait photo:** replace `assets/me.jpg`; update its alt text in `index.markdown` and `about.markdown` if needed.
- **Color theme:** follows the visitor’s system setting by default; the moon/sun button switches themes and remembers the choice in that browser.
- **Navigation:** `_data/navigation.yml`
- **Homepage copy and sections:** `index.markdown`
- **About page:** `about.markdown`
- **Work items:** add Markdown files inside `_work/`. Include front matter fields `title`, `description`, and `category`; `year`, `order`, `image`, and `image_alt` are optional. Put image files in `assets/images/`.
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

This project currently uses Jekyll 4.4 directly. GitHub Pages' built-in builder supports a specific dependency set, so choose one of these before publishing:

- **Simple GitHub Pages build:** switch the Gemfile to the `github-pages` gem as described in [GitHub's Jekyll setup guide](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll), and use only plugins supported by GitHub Pages. Then enable Pages in the repository settings and deploy from your chosen branch.
- **Keep Jekyll 4.4 and this setup:** use GitHub Actions to build the site and deploy the generated `_site` directory. This avoids GitHub's older built-in Jekyll dependency set.

Set `url` and `baseurl` in `_config.yml` to match the eventual domain and repository path. For a user site such as `simonkana.github.io`, `baseurl` is empty. For a project site, it is usually `/<repository-name>`.

## Content editing options

The easiest and most accessible editor is the GitHub web interface: open a Markdown or YAML file, choose the pencil icon, edit, and commit. A full CMS is intentionally not required for this setup. If you later want a visual editor, Decap CMS or another Git-based CMS can edit the same files; configure authentication and hosting as a separate step.
