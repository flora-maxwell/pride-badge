import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseReach } from '../src/effects.ts';

test('trail-reach: a number of pixels, 60 without it, held to 0–300', () => {
  assert.equal(parseReach(null), 60);
  assert.equal(parseReach(''), 60);
  assert.equal(parseReach('abc'), 60);
  assert.equal(parseReach('120'), 120);
  assert.equal(parseReach(' 90 '), 90);
  assert.equal(parseReach('120px'), 120);
  assert.equal(parseReach('0'), 0);
  assert.equal(parseReach('-20'), 0);
  assert.equal(parseReach('9999'), 300);
});
