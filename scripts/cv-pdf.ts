// Renders /cv/ and /cv/cz/ to PDF with the print stylesheet.
// Usage: npm run build && npm run cv:pdf   (run locally, then commit public/cv/*.pdf)
// Not part of the Vercel build.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const PORT = 4329;
const base = `http://localhost:${PORT}`;
const targets = [
  { path: '/cv/', out: 'public/cv/simon-kana-cv-en.pdf' },
  { path: '/cv/cz/', out: 'public/cv/simon-kana-cv-cz.pdf' },
];

// Own process group, so the whole tree (npx → astro) can be stopped afterwards.
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], { stdio: 'ignore', detached: true });
const stop = () => {
  try {
    if (server.pid) process.kill(-server.pid, 'SIGTERM');
  } catch {
    /* already gone */
  }
};

async function waitForServer(url: string, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Preview server did not start at ${url}`);
}

try {
  await waitForServer(`${base}/cv/`);
  mkdirSync('public/cv', { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (const { path, out } of targets) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({ path: out, format: 'A4', preferCSSPageSize: true, printBackground: false });
    console.log(`✓ ${out}`);
  }
  await browser.close();
} finally {
  stop();
}
