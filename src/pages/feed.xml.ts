import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../lib/site';

// Same path as the Jekyll feed (/feed.xml), so existing subscribers keep working.
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection('notebook', ({ data }) => !data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  return rss({
    title: `${SITE.name} — Notebook`,
    description: 'Notes and observations: software, music, climbing and learning to photograph.',
    site: site ?? 'https://simonkana.vercel.app',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `/notebook/${post.id}/`,
    })),
    customData: '<language>en</language>',
  });
};
