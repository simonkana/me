// Homepage only: human/machine toggle, relative "updated" time and GSAP motion.
import { gsap } from 'gsap';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

type View = 'human' | 'machine';
const STORAGE_KEY = 'home-view';
const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789/_-·';
const root = document.documentElement;

const panels: Record<View, HTMLElement | null> = {
  human: document.getElementById('view-human'),
  machine: document.getElementById('view-machine'),
};
const toggle = document.querySelector<HTMLElement>('[data-toggle]');
const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-toggle] [data-view]'));

// Pristine copies, taken before any animation touches the DOM, so an interrupted
// scramble or split can never leave garbled text behind.
const pristine = new Map<Element, string>();
document.querySelectorAll('#view-human .s-line').forEach((p) => pristine.set(p, p.innerHTML));
document.querySelectorAll<HTMLElement>('.living .live-text').forEach((el) => { el.dataset.text = el.textContent ?? ''; });

let current: View = 'human';
let motion = false;
let busy = false;

/* ---------- relative time ---------- */
const time = document.querySelector<HTMLTimeElement>('time[data-relative]');
if (time) {
  const then = new Date(time.dateTime).getTime();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536e6], ['month', 2592e6], ['week', 6048e5], ['day', 864e5], ['hour', 36e5], ['minute', 6e4],
  ];
  const render = () => {
    const diff = then - Date.now();
    const [unit, ms] = units.find(([, ms]) => Math.abs(diff) >= ms) ?? ['minute', 6e4];
    time.title = time.textContent ?? '';
    time.textContent = Math.abs(diff) < 6e4 ? 'just now' : rtf.format(Math.round(diff / ms), unit);
  };
  if (!Number.isNaN(then)) {
    const absolute = time.textContent ?? '';
    render();
    time.title = absolute;
    setInterval(render, 60_000);
  }
}

/* ---------- animation helpers ---------- */
function linesOf(view: View): Element[] {
  const panel = panels[view];
  if (!panel) return [];
  return view === 'machine' ? Array.from(panel.querySelectorAll('.json-bar, .jl')) : Array.from(panel.querySelectorAll('.s-line'));
}

/**
 * Scramble each live value into its real text. While it runs, the animated span is
 * aria-hidden and a visually hidden copy carries the real value for screen readers.
 */
function scramble(view: View, delay = 0): gsap.core.Timeline {
  const tl = gsap.timeline({ delay });
  panels[view]?.querySelectorAll<HTMLElement>('.live-text').forEach((el, i) => {
    const text = el.dataset.text ?? el.textContent ?? '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = text;
    tl.to(
      el,
      {
        duration: 0.75,
        scrambleText: { text, chars: CHARS, revealDelay: 0.2, speed: 0.6 },
        ease: 'none',
        onStart: () => { el.before(sr); el.setAttribute('aria-hidden', 'true'); },
        onComplete: () => { el.textContent = text; el.removeAttribute('aria-hidden'); sr.remove(); },
        onInterrupt: () => { el.textContent = text; el.removeAttribute('aria-hidden'); sr.remove(); },
      },
      i * 0.11,
    );
  });
  return tl;
}

/**
 * Split paragraphs into their rendered lines without changing the layout.
 *
 * GSAP SplitText wraps words in inline-blocks and lines in blocks, which changes where the
 * browser breaks lines around nested <em>/<a> live values (and it never slices links), so the
 * text jumped when the split was reverted. Here every word becomes a plain inline <span>
 * (identical layout), words are grouped into lines by their measured top, and each line is
 * risen with relative `top` (which works on inline boxes). restore() puts the original markup
 * back, and nothing moves.
 */
function splitIntoLines(paragraphs: Element[]) {
  const originals = paragraphs.map((p) => pristine.get(p) ?? p.innerHTML);
  paragraphs.forEach((p, i) => { p.innerHTML = originals[i]; });
  paragraphs.forEach((p) => p.classList.add('splitting'));
  const lines: HTMLElement[][] = [];
  paragraphs.forEach((p) => {
    const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    const texts: Text[] = [];
    while (walker.nextNode()) texts.push(walker.currentNode as Text);
    const words: HTMLElement[] = [];
    texts.forEach((node) => {
      // Split on ordinary whitespace only, so non-breaking spaces stay inside a word.
      const parts = (node.textContent ?? '').split(/([ \t\n]+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^[ \t\n]+$/.test(part)) { frag.append(part); return; }
        const span = document.createElement('span');
        span.className = 's-word';
        span.textContent = part;
        frag.append(span);
        words.push(span);
      });
      node.replaceWith(frag);
    });
    let top = Number.NaN;
    words.forEach((w) => {
      const t = w.getBoundingClientRect().top;
      if (Number.isNaN(top) || Math.abs(t - top) > 4) { lines.push([]); top = t; }
      lines[lines.length - 1].push(w);
    });
  });
  const restore = () =>
    paragraphs.forEach((p, i) => {
      p.innerHTML = originals[i];
      p.classList.remove('splitting');
    });
  return { lines, restore };
}

/** Rise the view's lines in, then scramble its live values. */
function riseIn(view: View): gsap.core.Timeline {
  const tl = gsap.timeline();
  if (view === 'human') {
    const split = splitIntoLines(linesOf('human'));
    split.lines.forEach((words, i) => {
      tl.from(words, { top: 14, autoAlpha: 0, duration: 0.9, ease: 'power3.out' }, i * 0.18);
    });
    // Restore the original markup (identical layout), then scramble the real elements.
    tl.add(() => { split.restore(); scramble(view); });
  } else {
    tl.from(linesOf('machine'), { y: 10, autoAlpha: 0, duration: 0.5, stagger: 0.035, ease: 'power3.out' });
    tl.add(() => { scramble(view); }, '-=0.35');
  }
  return tl;
}

/* ---------- toggle ---------- */
function setPressed(view: View) {
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
}

function swap(view: View) {
  (Object.keys(panels) as View[]).forEach((v) => { if (panels[v]) panels[v]!.hidden = v !== view; });
  current = view;
  setPressed(view);
}

function show(view: View) {
  if (view === current || busy) return;
  const focusWasOnToggle = !!toggle && toggle.contains(document.activeElement);
  try { localStorage.setItem(STORAGE_KEY, view); } catch { /* storage unavailable */ }

  const finish = () => {
    swap(view);
    if (focusWasOnToggle) panels[view]?.focus({ preventScroll: true });
  };

  if (!motion) { finish(); return; }
  busy = true;
  // Stop anything still animating in the outgoing view (interrupted scrambles restore their text).
  gsap.killTweensOf(panels[current]?.querySelectorAll('.live-text, .s-word, .jl, .json-bar') ?? []);
  if (current === 'human') linesOf('human').forEach((p) => { const html = pristine.get(p); if (html) { p.innerHTML = html; p.classList.remove('splitting'); } });
  gsap.to(panels[current], {
    autoAlpha: 0, y: -10, duration: 0.25, ease: 'power2.in',
    onComplete: () => {
      gsap.set(panels[current], { clearProps: 'all' });
      finish();
      riseIn(view).eventCallback('onComplete', () => { busy = false; });
      // Let the toggle be used again as soon as the lines are in.
      gsap.delayedCall(0.6, () => { busy = false; });
    },
  });
}

buttons.forEach((b) => b.addEventListener('click', () => show(b.dataset.view as View)));

let saved: View = 'human';
try { if (localStorage.getItem(STORAGE_KEY) === 'machine') saved = 'machine'; } catch { /* ignore */ }
if (saved === 'machine') swap('machine');

/* ---------- intro motion ---------- */
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  motion = true;
  // If the 2s CSS failsafe already revealed the page (slow load), don't hide it again.
  const late = performance.now() > 1800;
  const extras = document.querySelectorAll('.home .meta, .home .index li');
  if (!late) {
    gsap.set(extras, { autoAlpha: 0 });
    root.classList.add('motion-ready');
    const tl = gsap.timeline();
    tl.add(riseIn(current));
    tl.to(extras, { autoAlpha: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, '-=0.3');
  } else {
    root.classList.add('motion-ready');
  }
  return () => { motion = false; };
});
root.classList.add('motion-ready');
