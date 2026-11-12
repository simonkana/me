// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
// One-line change when the custom domain is ready: set PUBLIC_SITE_URL in Vercel.
const site = env.PUBLIC_SITE_URL || 'https://simonkana.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  // No inline scripts or styles anywhere, so the CSP in vercel.json can stay strict ('self' only).
  build: { format: 'directory', inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [
    sitemap({
      filter: (page) => !/\/(api\/|now\.txt|404)/.test(page),
    }),
  ],
});
