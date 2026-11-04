/**
 * The only sentences the badge can say (Flo, 2026-11-03): a fixed list, so the package itself can't
 * carry another message. New sentences go through Flo. English and German.
 */
export const KEYS = ['stronger-together', 'safe-with-me', 'love-is-love', 'you-belong'] as const;
export type Key = (typeof KEYS)[number];
export type Lang = 'en' | 'de';

export const TEXTS: Record<Key, Record<Lang, string>> = {
  'stronger-together': { en: 'Stronger together.', de: 'Gemeinsam stärker.' },
  'safe-with-me': { en: 'You’re safe with me.', de: 'Bei mir bist du sicher.' },
  'love-is-love': { en: 'Love is love.', de: 'Liebe ist Liebe.' },
  'you-belong': { en: 'You belong here.', de: 'Du gehörst dazu.' },
};

/** The flag's alt text and what screen readers hear after the sentence. */
export const LABELS: Record<Lang, { flag: string; action: string }> = {
  en: { flag: 'Intersex-inclusive Progress Pride flag', action: ' Throw some flags.' },
  de: { flag: 'Intersex-inklusive Progress-Pride-Flagge', action: ' Wirf ein paar Flaggen.' },
};

const isKey = (v: string): v is Key => (KEYS as readonly string[]).includes(v);

/** The `texts` attribute: known keys in the given order; nothing usable means all four. */
export function parseTexts(value: string | null): Key[] {
  const keys = [...new Set((value ?? '').split(/\s+/).filter(isKey))];
  return keys.length ? keys : [...KEYS];
}

/** The badge's own `lang`, else the page's, primary subtag only; anything but en/de is English. */
export function resolveLang(own: string | null, page: string | null): Lang {
  const lang = (own || page || '').split('-')[0].toLowerCase();
  return lang === 'de' ? 'de' : 'en';
}

export function nextKey(list: Key[], key: Key): Key {
  return list[(list.indexOf(key) + 1) % list.length];
}
