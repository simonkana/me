import type { APIRoute } from 'astro';
import { getNow } from '../../lib/now';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const { json } = await getNow(site);
  return new Response(JSON.stringify(json, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
