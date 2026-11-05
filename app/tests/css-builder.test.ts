import test from 'node:test';
import assert from 'node:assert/strict';
import { ANIMATION_PRESETS } from '../src/lib/anim/motionPresets';
import { buildCss, buildColorHoverCss, splitSelectors, type Opts } from '../src/lib/anim/cssBuilder';

const opts: Opts = { duration: '350', delay: '0', easing: 'ease', iteration: '1', direction: 'normal', fillMode: 'both', playState: 'running',
  transitionProperties: 'transform, opacity', translateX: '8', translateY: '-8', scale: '1.06', rotate: '5', skew: '6', perspective: '800',
  opacity: '.65', blur: '3', hoverColor: '#ff0000', bgColor: '#00ff00', textColor: '#0000ff', borderColor: '#818cf8', shadow: 'rgba(1,2,3,.4)',
  radius: '24', parentSelector: '.card', reducedMotion: false };
const preset = (id: string) => ANIMATION_PRESETS.find((p) => p.id === id)!;

test('bare class names become classes and lists stay scoped', () => {
  assert.deepEqual(splitSelectors('hero-card'), ['.hero-card']);
  assert.deepEqual(splitSelectors('.a, .b'), ['.a', '.b']);
  assert.deepEqual(splitSelectors('h1, button'), ['h1', 'button']);
  const css = buildCss(preset('lift'), '.a, .b', 'hover', opts);
  assert.ok(css.includes('.a:hover,\n.b:hover {'), css);
});

test('no --p2c helper variables leak into any preset output', () => {
  for (const p of ANIMATION_PRESETS) {
    const css = buildCss(p, '.x', p.defaultTrigger || 'hover', opts);
    assert.ok(!/--p2c|var\(/.test(css), `${p.id} leaked a variable:\n${css}`);
  }
});

test('preset colors are resolved to the real value', () => {
  assert.ok(buildCss(preset('glow'), '.x', 'hover', opts).includes('#ff0000'));
});

test('hover colors: background on => white text, children included, only the target', () => {
  const css = buildColorHoverCss('hero', { bgOn: true, textOn: false, bg: '#123456', text: '#000000', whiteWithBg: true, duration: '300', easing: 'ease' });
  assert.ok(css.includes('.hero:hover {\n  background: #123456 !important;\n  color: #ffffff !important;'), css);
  assert.ok(css.includes('.hero:hover * {\n  color: #ffffff !important;'), css);
  assert.ok(!/^\s*(div|section|\*)\s*[{:]/m.test(css));
  assert.equal(buildColorHoverCss('.x', { bgOn: false, textOn: false, bg: '', text: '', whiteWithBg: true, duration: '1', easing: 'ease' }), '');
});

test('hover colors: invalid / injected values fall back safely', () => {
  const css = buildColorHoverCss('.x', { bgOn: true, textOn: true, bg: 'red; } body { display:none', text: 'nope(', whiteWithBg: true, duration: '1', easing: 'ease' });
  assert.ok(!css.includes('display:none'));
});

test('keyframe presets produce readable, indented @keyframes', () => {
  const css = buildCss(preset('float'), '.x', 'always', opts);
  assert.match(css, /@keyframes p2c_float \{\n  0%, 100% \{\n    transform: translateY\(0\);\n  \}/);
});

test('colour hover does not add a second transition rule that would override the effect transition', () => {
  const css = buildColorHoverCss('.x', { bgOn: true, textOn: false, bg: '#111111', text: '#fff', whiteWithBg: true, duration: '1', easing: 'ease', withTransition: false });
  assert.ok(!css.includes('transition'), css);
});