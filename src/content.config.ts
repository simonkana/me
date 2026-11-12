import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { readdirSync } from 'node:fs';

/** glob() warns when a folder has no matching files; work/ is allowed to be empty. */
const hasMarkdown = (dir: string) => {
  try {
    return readdirSync(dir, { recursive: true }).some((f) => String(f).endsWith('.md'));
  } catch {
    return false;
  }
};

const now = defineCollection({
  // One entry, keyed `current`.
  loader: file('src/content/now.json'),
  schema: z.object({
    reading: z.string().optional(),
    building: z.string().optional(),
    projecting: z.string().optional(), // climbing project, e.g. "a 6C at Smíchoff"
    listening: z.string().optional(),
    lastPhoto: z.string().optional(), // id from photos.yaml; checked in src/lib/now.ts
    updatedAt: z.coerce.date(),
  }),
});

const photos = defineCollection({
  loader: file('src/content/photos.yaml'),
  schema: ({ image }) =>
    z.object({
      order: z.number(),
      title: z.string(),
      alt: z.string(),
      image: image(),
      takenAt: z.coerce.date().optional(),
    }),
});

const notebook = defineCollection({
  loader: glob({ base: './src/content/notebook', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: hasMarkdown('./src/content/work')
    ? glob({ base: './src/content/work', pattern: '**/*.md' })
    : { name: 'work-empty', load: async () => {} },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    year: z.number().int().optional(),
    order: z.number().default(99),
    link: z.url().optional(),
    draft: z.boolean().default(false),
  }),
});

const cv = defineCollection({
  loader: glob({ base: './src/content/cv', pattern: '*.yaml' }),
  schema: z.object({
    lang: z.enum(['en', 'cs']),
    title: z.string(),
    description: z.string(),
    location: z.string(),
    role: z.string(),
    labels: z.object({
      eyebrow: z.string(),
      back: z.string(),
      languageNav: z.string(),
      download: z.string(),
      portraitAlt: z.string(),
      website: z.string(),
      profile: z.string(),
      experience: z.string(),
      education: z.string(),
      skills: z.string(),
      languages: z.string(),
      personalSkills: z.string(),
      interests: z.string(),
    }),
    profile: z.array(z.string()),
    experience: z.array(
      z.object({ role: z.string(), period: z.string(), org: z.string(), points: z.array(z.string()) }),
    ),
    education: z.array(
      z.object({ school: z.string(), period: z.string(), place: z.string(), details: z.string() }),
    ),
    skills: z.array(z.object({ label: z.string(), value: z.string() })),
    languages: z.array(z.string()),
    personalSkills: z.string(),
    interests: z.array(z.string()),
  }),
});

export const collections = { now, photos, notebook, work, cv };
