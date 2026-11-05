import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMATION_PRESETS, CATEGORIES, EASINGS } from '../src/lib/anim/motionPresets';

test('Motion Lab exposes a substantial, unique preset library', () => {
  assert.ok(ANIMATION_PRESETS.length >= 100, `expected 100+ presets, got ${ANIMATION_PRESETS.length}`);
  const ids = ANIMATION_PRESETS.map((preset) => preset.id);
  assert.equal(new Set(ids).size, ids.length, 'preset IDs must be unique');
  for (const preset of ANIMATION_PRESETS) {
    assert.ok(preset.name.trim(), `missing name for ${preset.id}`);
    assert.ok(preset.description.trim(), `missing description for ${preset.id}`);
    assert.ok(CATEGORIES.includes(preset.category), `invalid category for ${preset.id}`);
    assert.ok(preset.kind === 'transition' || preset.kind === 'keyframe', `invalid kind for ${preset.id}`);
    if (preset.kind === 'keyframe') assert.ok(preset.frames?.trim(), `missing keyframes for ${preset.id}`);
  }
});

test('Motion Lab exposes standard and advanced easing functions', () => {
  for (const easing of ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out']) assert.ok(EASINGS.includes(easing));
  assert.ok(EASINGS.some((easing) => easing.startsWith('cubic-bezier(')));
  assert.ok(EASINGS.some((easing) => easing.startsWith('steps(')));
});
