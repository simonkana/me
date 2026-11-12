// Build-time JSON syntax highlighting with plain spans, no library.
// Keys and punctuation → .j-k / .j-p (muted); live values → .j-live (accent); other values → .j-v (ink).
// Live string values get a .live-text span that the homepage animation may scramble
// (it adds a screen-reader copy only while scrambling).

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const p = (s: string) => `<span class="j-p">${esc(s)}</span>`;

export function liveValue(text: string): string {
  return `<span class="live-text">${esc(text)}</span>`;
}

/**
 * @param isLive decides from the key path (e.g. "now.reading") whether a value is live.
 */
export function highlightJson(value: unknown, isLive: (path: string) => boolean, indent = 2): string {
  const walk = (v: unknown, path: string, depth: number): string => {
    const pad = ' '.repeat(indent * (depth + 1));
    const end = ' '.repeat(indent * depth);
    if (Array.isArray(v)) {
      if (v.length === 0) return p('[]');
      const items = v.map((item, i) => pad + walk(item, `${path}[${i}]`, depth + 1));
      return `${p('[')}\n${items.join(`${p(',')}\n`)}\n${end}${p(']')}`;
    }
    if (v !== null && typeof v === 'object') {
      const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined);
      if (entries.length === 0) return p('{}');
      const rows = entries.map(([k, x]) => {
        const sub = path ? `${path}.${k}` : k;
        return `${pad}<span class="j-k">${esc(JSON.stringify(k))}</span>${p(': ')}${walk(x, sub, depth + 1)}`;
      });
      return `${p('{')}\n${rows.join(`${p(',')}\n`)}\n${end}${p('}')}`;
    }
    if (typeof v === 'string') {
      const quoted = JSON.stringify(v);
      if (isLive(path)) {
        return `<span class="j-live">${p('"')}<span class="live" data-key="${esc(path)}">${liveValue(quoted.slice(1, -1))}</span>${p('"')}</span>`;
      }
      return `<span class="j-v">${esc(quoted)}</span>`;
    }
    return `<span class="j-v">${esc(JSON.stringify(v))}</span>`;
  };
  // Wrap each line so the homepage can animate lines. No span crosses a newline.
  return walk(value, '', 0)
    .split('\n')
    .map((line) => `<span class="jl">${line}</span>`)
    .join('\n');
}
