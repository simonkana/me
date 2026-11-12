// Pure helpers for the living sentence, the JSON object and now.txt. No Astro imports, so they
// can be unit tested with Vitest (see sentence.test.ts).

export interface NowData {
  reading?: string;
  building?: string;
  projecting?: string;
  listening?: string;
  lastPhoto?: string;
  updatedAt: Date;
}

export interface PhotoRef {
  id: string;
  title: string;
}

/** A piece of the sentence: static text, or a live value that is highlighted and animated. */
export type Segment = { kind: 'text'; text: string } | { kind: 'value'; key: string; text: string; href?: string };

/**
 * A value counts as filled if it has text and is not a `TODO(...)` placeholder, so seeded
 * placeholders never reach the page. The clause is dropped instead.
 */
export function filled(value: string | undefined | null): value is string {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  return v.length > 0 && !/^TODO\b/i.test(v);
}

/** Joins items as "a", "a and b", "a, b and c". */
export function joinWithAnd<T>(items: T[], comma: T, and: T): T[] {
  const out: T[] = [];
  items.forEach((item, i) => {
    if (i > 0) out.push(i === items.length - 1 ? and : comma);
    out.push(item);
  });
  return out;
}

const CLAUSES = [
  { key: 'reading', lead: 'reading ' },
  { key: 'building', lead: 'building ' },
  { key: 'projecting', lead: 'projecting ' },
  { key: 'listening', lead: 'listening to ' },
] as const;

/** "Right now I’m reading X, building Y, projecting Z and listening to W." or null. */
export function nowSentence(now: Partial<NowData>): Segment[] | null {
  const clauses: Segment[][] = [];
  for (const { key, lead } of CLAUSES) {
    const value = now[key];
    if (filled(value)) clauses.push([{ kind: 'text', text: lead }, { kind: 'value', key, text: value.trim() }]);
  }
  if (clauses.length === 0) return null;
  const joined = joinWithAnd<Segment[]>(clauses, [{ kind: 'text', text: ', ' }], [{ kind: 'text', text: ' and ' }]);
  return mergeText([{ kind: 'text', text: 'Right now I’m ' }, ...joined.flat(), { kind: 'text', text: '.' }]);
}

/** "My last photograph was <title>." or null. */
export function photoSentence(photo: PhotoRef | undefined): Segment[] | null {
  if (!photo) return null;
  return [
    { kind: 'text', text: 'My last photograph was ' },
    { kind: 'value', key: 'last_photo', text: photo.title, href: `/photographs/#${photo.id}` },
    { kind: 'text', text: '.' },
  ];
}

function mergeText(segments: Segment[]): Segment[] {
  const out: Segment[] = [];
  for (const s of segments) {
    const prev = out[out.length - 1];
    if (s.kind === 'text' && prev?.kind === 'text') prev.text += s.text;
    else out.push({ ...s });
  }
  return out;
}

/** ISO 8601 in Prague local time with its offset, e.g. 2026-11-12T00:40:12+01:00. */
export function pragueIso(date: Date): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Prague',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
      timeZoneName: 'longOffset',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const offset = parts.timeZoneName === 'GMT' ? '+00:00' : String(parts.timeZoneName).replace('GMT', '');
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
}

export interface NowJson {
  name: string;
  based_in: string;
  now: Partial<Record<'reading' | 'building' | 'projecting' | 'listening', string>>;
  last_photo?: { title: string; url: string };
  updated_at: string;
  links: { github: string; youtube: string };
}

export function buildNowJson(
  now: NowData,
  photo: PhotoRef | undefined,
  opts: { siteUrl: string; name: string; city: string; links: { github: string; youtube: string } },
): NowJson {
  const values: NowJson['now'] = {};
  for (const { key } of CLAUSES) {
    const v = now[key];
    if (filled(v)) values[key] = v.trim();
  }
  return {
    name: opts.name,
    based_in: opts.city,
    now: values,
    ...(photo ? { last_photo: { title: photo.title, url: new URL(`/photographs/#${photo.id}`, opts.siteUrl).href } } : {}),
    updated_at: pragueIso(now.updatedAt),
    links: { github: opts.links.github, youtube: opts.links.youtube },
  };
}

/** The plain-text version served at /now.txt (and to `curl <domain>/now`). */
export function nowText(json: NowJson): string {
  const rule = '─'.repeat(30);
  const rows: [string, string][] = [
    ['reading', json.now.reading],
    ['building', json.now.building],
    ['projecting', json.now.projecting],
    ['listening', json.now.listening],
    ['last photo', json.last_photo?.title],
  ].filter((r): r is [string, string] => typeof r[1] === 'string');
  return [
    `${json.name} — ${json.based_in}`,
    rule,
    ...rows.map(([k, v]) => `${k.padEnd(13)}${v}`),
    rule,
    `updated ${json.updated_at.slice(0, 10)} · json: /api/now.json`,
    '',
  ].join('\n');
}
