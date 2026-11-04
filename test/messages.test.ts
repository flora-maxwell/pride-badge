import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KEYS, TEXTS, LABELS, parseTexts, resolveLang, nextKey } from '../src/messages.ts';

const ALL = ['stronger-together', 'safe-with-me', 'love-is-love', 'you-belong'];

test('the sentences are exactly the fixed list, in English and German', () => {
  assert.deepEqual([...KEYS], ALL);
  assert.deepEqual(TEXTS, {
    'stronger-together': { en: 'Stronger together.', de: 'Gemeinsam stärker.' },
    'safe-with-me': { en: 'You’re safe with me.', de: 'Bei mir bist du sicher.' },
    'love-is-love': { en: 'Love is love.', de: 'Liebe ist Liebe.' },
    'you-belong': { en: 'You belong here.', de: 'Du gehörst dazu.' },
  });
  assert.deepEqual(LABELS, {
    en: { flag: 'Intersex-inclusive Progress Pride flag', action: ' Throw some flags.' },
    de: { flag: 'Intersex-inklusive Progress-Pride-Flagge', action: ' Wirf ein paar Flaggen.' },
  });
});

test('parseTexts keeps known keys in the given order', () => {
  assert.deepEqual(parseTexts('safe-with-me love-is-love'), ['safe-with-me', 'love-is-love']);
  assert.deepEqual(parseTexts('  love-is-love\n you-belong '), ['love-is-love', 'you-belong']);
  assert.deepEqual(parseTexts('Hate love-is-love'), ['love-is-love']);
  assert.deepEqual(parseTexts('you-belong you-belong'), ['you-belong']);
});

test('parseTexts falls back to all four sentences', () => {
  for (const v of [null, '', 'Hate', 'STRONGER-TOGETHER']) assert.deepEqual(parseTexts(v), ALL);
});

test('resolveLang: own lang, then the page, then English', () => {
  assert.equal(resolveLang('de', 'en'), 'de');
  assert.equal(resolveLang(null, 'de-AT'), 'de');
  assert.equal(resolveLang(null, 'DE'), 'de');
  assert.equal(resolveLang('fr', 'de'), 'en');
  assert.equal(resolveLang(null, null), 'en');
  assert.equal(resolveLang('', 'de'), 'de');
});

test('nextKey walks the list and wraps', () => {
  const walk = ['stronger-together'];
  for (let i = 0; i < 4; i++) walk.push(nextKey([...KEYS], walk.at(-1) as never));
  assert.deepEqual(walk, [...ALL, 'stronger-together']);
  assert.equal(nextKey(['you-belong', 'safe-with-me'], 'safe-with-me'), 'you-belong');
  assert.equal(nextKey(['love-is-love'], 'love-is-love'), 'love-is-love');
});
