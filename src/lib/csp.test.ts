import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// The theme script is inlined verbatim in <head> (src/layouts/Base.astro), so the CSP in
// vercel.json must allow its exact sha256 hash. If you edit the script, update the hash.
describe('CSP', () => {
  it('allows the inline theme script by hash', () => {
    const script = readFileSync('src/scripts/theme-inline.js', 'utf8');
    const hash = `'sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}'`;
    const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const csp = vercel.headers
      .flatMap((h: { headers: { key: string; value: string }[] }) => h.headers)
      .find((h: { key: string }) => h.key.startsWith('Content-Security-Policy'))?.value as string;
    const scriptSrc = csp.split(';').find((d) => d.trim().startsWith('script-src')) ?? '';
    expect(scriptSrc, `add ${hash} to script-src in vercel.json`).toContain(hash);
  });
});
