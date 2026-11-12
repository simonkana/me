import type { APIRoute } from 'astro';
import { getNow } from '../lib/now';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const { text } = await getNow(site);
  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
