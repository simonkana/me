// Site-wide facts (originally ported from the Jekyll site's config and profile data).
export const SITE = {
  name: 'Šimon Káňa',
  initials: 'š.k.',
  role: 'Freelance software engineer',
  city: 'Prague',
  location: 'Prague, Czechia',
  email: 'simon.kana@seznam.cz',
  description:
    'Freelance software engineer in Prague; guitar, singing, climbing, and first experiments with iPhone photography and filmmaking.',
  homeTitle: 'Šimon Káňa — software, music & climbing',
  ogImage: '/og/me.webp',
  ogImageAlt: 'Šimon sitting outdoors at sunset with a backpack',
  links: {
    github: 'https://github.com/simonkana',
    youtube: 'https://www.youtube.com/@simon-kana',
    linkedin: 'https://www.linkedin.com/in/%C5%A1imon-k%C3%A1%C5%88a-aa4090278',
  },
} as const;

export const NAV = [
  { n: '01', label: 'Work', href: '/work/', note: 'software, in progress' },
  { n: '02', label: 'Photographs', href: '/photographs/', note: 'a few frames from Prague' },
  { n: '03', label: 'Notebook', href: '/notebook/', note: 'notes & observations' },
  { n: '04', label: 'About', href: '/about/', note: 'the longer version' },
  { n: '05', label: 'CV', href: '/cv/', note: 'experience & skills' },
] as const;

/** Absolute URL for a path, based on `site` from astro.config.mjs. */
export function abs(path: string, site: URL | string | undefined): string {
  return new URL(path, site ?? 'https://simonkana.vercel.app').href;
}

/** Host of the site, for display ("simonkana.vercel.app"). */
export function host(site: URL | string | undefined): string {
  return new URL(site ?? 'https://simonkana.vercel.app').host;
}

export function personJsonLd(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.name,
    url: abs('/', site),
    image: abs(SITE.ogImage, site),
    jobTitle: SITE.role,
    address: { '@type': 'PostalAddress', addressLocality: 'Prague', addressCountry: 'CZ' },
    sameAs: [SITE.links.github, SITE.links.youtube, SITE.links.linkedin],
  };
}
