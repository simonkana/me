// Builds the "now" data once, so the homepage, /api/now.json and /now.txt always match.
import { getCollection, getEntry } from 'astro:content';
import { SITE } from './site';
import { buildNowJson, nowSentence, nowText, photoSentence, type NowData, type PhotoRef } from './sentence';

export async function getNow(site: URL | undefined) {
  const entry = await getEntry('now', 'current');
  if (!entry) throw new Error('src/content/now.json must contain an entry with the id "current".');
  const data: NowData = entry.data;

  let photo: PhotoRef | undefined;
  if (data.lastPhoto) {
    const photos = await getCollection('photos');
    const match = photos.find((p) => p.id === data.lastPhoto);
    if (!match) {
      throw new Error(
        `now.json → lastPhoto "${data.lastPhoto}" is not an id in src/content/photos.yaml. ` +
          `Use one of: ${photos.map((p) => p.id).join(', ')}.`,
      );
    }
    photo = { id: match.id, title: match.data.title };
  }

  const json = buildNowJson(data, photo, {
    siteUrl: (site ?? new URL('https://simonkana.vercel.app')).href,
    name: SITE.name,
    city: SITE.city,
    links: { github: SITE.links.github, youtube: SITE.links.youtube },
  });

  return {
    updatedAt: data.updatedAt,
    json,
    text: nowText(json),
    sentence: { now: nowSentence(data), photo: photoSentence(photo) },
  };
}
