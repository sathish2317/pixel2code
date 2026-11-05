import test from 'node:test';
import assert from 'node:assert/strict';
import { EFFECT_CATEGORIES, HOVER_EFFECTS, searchEffects } from '../src/lib/anim/catalog';

test('animation catalog exposes 60+ unique, stable hover effect identifiers', () => {
  assert.ok(HOVER_EFFECTS.length >= 60, `expected at least 60 effects, received ${HOVER_EFFECTS.length}`);
  assert.equal(new Set(HOVER_EFFECTS).size, HOVER_EFFECTS.length, 'effect identifiers must be unique');
  for (const effect of HOVER_EFFECTS) assert.match(effect, /^[a-z][a-z0-9-]*$/, `invalid effect identifier: ${effect}`);
});

test('every effect category has a stable id, label, and at least one effect', () => {
  assert.equal(new Set(EFFECT_CATEGORIES.map((category) => category.id)).size, EFFECT_CATEGORIES.length);
  for (const category of EFFECT_CATEGORIES) {
    assert.ok(category.label.trim());
    assert.ok(category.effects.length > 0);
    for (const effect of category.effects) assert.ok(HOVER_EFFECTS.includes(effect), `${effect} is missing from the canonical catalog`);
  }
});

test('effect search is case-insensitive, whitespace tolerant, and deduplicates category overlaps', () => {
  assert.deepEqual(searchEffects('  IMAGE   ZOOM  '), ['image-zoom']);
  assert.ok(searchEffects('glow').includes('glow'));
  assert.ok(searchEffects('not-a-real-effect').length === 0);
  assert.equal(searchEffects('').length, HOVER_EFFECTS.length);
});
