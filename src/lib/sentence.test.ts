import { describe, expect, it } from 'vitest';
import { buildNowJson, filled, joinWithAnd, nowSentence, nowText, photoSentence, pragueIso, type Segment } from './sentence';
import { highlightJson } from './json-highlight';

const text = (segs: Segment[] | null) => segs?.map((s) => s.text).join('') ?? null;
const date = new Date('2026-11-12T00:40:12+01:00');

describe('joinWithAnd', () => {
  const j = (xs: string[]) => joinWithAnd(xs, ', ', ' and ').join('');
  it('handles 0–4 items', () => {
    expect(j([])).toBe('');
    expect(j(['a'])).toBe('a');
    expect(j(['a', 'b'])).toBe('a and b');
    expect(j(['a', 'b', 'c'])).toBe('a, b and c');
    expect(j(['a', 'b', 'c', 'd'])).toBe('a, b, c and d');
  });
});

describe('filled', () => {
  it('rejects empty, whitespace and TODO placeholders', () => {
    expect(filled(undefined)).toBe(false);
    expect(filled('')).toBe(false);
    expect(filled('   ')).toBe(false);
    expect(filled('TODO(simon)')).toBe(false);
    expect(filled('Piranesi')).toBe(true);
  });
});

describe('nowSentence', () => {
  it('reads naturally with all four clauses', () => {
    expect(
      text(nowSentence({ reading: 'Piranesi', building: 'this website', projecting: 'a 6C at Smíchoff', listening: 'Khruangbin', updatedAt: date })),
    ).toBe('Right now I’m reading Piranesi, building this website, projecting a 6C at Smíchoff and listening to Khruangbin.');
  });
  it('drops missing clauses cleanly', () => {
    expect(text(nowSentence({ reading: 'Piranesi', listening: 'Khruangbin', updatedAt: date }))).toBe(
      'Right now I’m reading Piranesi and listening to Khruangbin.',
    );
    expect(text(nowSentence({ building: 'this website', projecting: 'TODO(simon)', updatedAt: date }))).toBe(
      'Right now I’m building this website.',
    );
    expect(nowSentence({ reading: '', updatedAt: date })).toBeNull();
  });
  it('marks values as live segments', () => {
    const segs = nowSentence({ reading: ' Piranesi ', updatedAt: date })!;
    expect(segs.filter((s) => s.kind === 'value')).toEqual([{ kind: 'value', key: 'reading', text: 'Piranesi' }]);
  });
});

describe('photoSentence', () => {
  it('links to the photo anchor', () => {
    const segs = photoSentence({ id: 'the-walk-home', title: 'The Walk Home' })!;
    expect(text(segs)).toBe('My last photograph was The Walk Home.');
    expect(segs[1]).toMatchObject({ href: '/photographs/#the-walk-home' });
    expect(photoSentence(undefined)).toBeNull();
  });
});

describe('pragueIso', () => {
  it('uses the Prague offset in winter and summer', () => {
    expect(pragueIso(date)).toBe('2026-11-12T00:40:12+01:00');
    expect(pragueIso(new Date('2026-07-01T10:00:00Z'))).toBe('2026-07-01T12:00:00+02:00');
  });
});

const opts = {
  siteUrl: 'https://example.com',
  name: 'Šimon Káňa',
  city: 'Prague',
  links: { github: 'https://github.com/simonkana', youtube: 'https://www.youtube.com/@simon-kana' },
};

describe('buildNowJson + nowText', () => {
  const json = buildNowJson(
    { reading: 'Piranesi', building: 'this website in Astro', projecting: 'TODO(simon)', updatedAt: date },
    { id: 'the-walk-home', title: 'The Walk Home' },
    opts,
  );
  it('omits unfilled values', () => {
    expect(json.now).toEqual({ reading: 'Piranesi', building: 'this website in Astro' });
    expect(json.last_photo).toEqual({ title: 'The Walk Home', url: 'https://example.com/photographs/#the-walk-home' });
  });
  it('renders aligned plain text', () => {
    expect(nowText(json)).toBe(
      [
        'Šimon Káňa — Prague',
        '──────────────────────────────',
        'reading      Piranesi',
        'building     this website in Astro',
        'last photo   The Walk Home',
        '──────────────────────────────',
        'updated 2026-11-12 · json: /api/now.json',
        '',
      ].join('\n'),
    );
  });
  it('highlighting keeps the exact JSON text', () => {
    const html = highlightJson(json, (p) => p.startsWith('now.'));
    const plain = html
      .replace(/<span class="sr-only">.*?<\/span>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    expect(plain).toBe(JSON.stringify(json, null, 2));
    expect(html).toContain('class="j-live"');
  });
});
