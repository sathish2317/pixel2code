import test from 'node:test';
import assert from 'node:assert/strict';
import { FORMATS, PRESETS, TARGETS, configFromPreset, depthScale, generateCode, sanitize } from '../src/lib/anim/anim3d';

test('3D engine generates code for every format, preset and component', () => {
  for (const f of FORMATS) for (const p of PRESETS) for (const t of TARGETS) {
    const code = generateCode(f.id, configFromPreset(p.id), t.id);
    assert.ok(code.length > 50);
    assert.doesNotMatch(code, /NaN|undefined/);
  }
});

test('3D engine sanitises bad numbers', () => {
  const c = configFromPreset('flip'); c.duration = NaN; c.to.scaleX = -5;
  const s = sanitize(c);
  assert.ok(Number.isFinite(s.duration));
  assert.ok(s.to.scaleX > 0);
});

test('depth is emulated with a perspective scale', () => {
  assert.equal(depthScale(0, 1, 800), 1);
  assert.ok(depthScale(200, 1, 800) > 1);
  assert.ok(depthScale(-200, 1, 800) < 1);
});

import { buildRuleCss, validSelector } from '../src/lib/anim/anim3d';

test('hover animations never run on their own', () => {
  for (const p of PRESETS) {
    const c = { ...configFromPreset(p.id), trigger: 'hover' as const };
    const { css } = buildRuleCss(c, '.bk-card', 'p2c3d-1');
    const idle = css.split(':hover')[0];
    assert.doesNotMatch(idle.replace(/@keyframes[\s\S]*?\n}\n/, ''), /\n\s+animation:/, p.id);
    assert.match(css, /:hover/);
  }
});

test('selectors are validated', () => {
  assert.ok(validSelector('.bk-card .bk-btn'));
  assert.ok(!validSelector('.a{}'));
  assert.ok(!validSelector('a[href="x"]'));
});
import { IDENTITY, hoverUsesTransition, mirrorConfig, scaleIntensity, searchPresets, swapPoses, warningsFor, buildRuleBundle } from '../src/lib/anim/anim3d';

test('every preset builds valid rule CSS for every trigger, with no NaN', () => {
  for (const p of PRESETS) for (const trigger of ['auto', 'hover', 'press', 'scroll'] as const) {
    const { css, js } = buildRuleCss({ ...configFromPreset(p.id), trigger, stagger: 80 }, '.bk-card', 'p2c3d-1');
    assert.doesNotMatch(css + js, /NaN|undefined/, `${p.id} ${trigger}`);
    assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, `${p.id} ${trigger} braces`);
    if (trigger === 'scroll') assert.doesNotThrow(() => new Function(js), p.id);
  }
});

test('preset ids are unique and the new presets exist', () => {
  const ids = PRESETS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ['flip-loop', 'focus', 'door-open', 'pulse', 'zoom-blur', 'orbit']) assert.ok(ids.includes(id), id);
});

test('3D flip holds the flipped state on hover (transition), flip loop keeps looping', () => {
  assert.ok(hoverUsesTransition(configFromPreset('flip')));
  assert.ok(!hoverUsesTransition(configFromPreset('flip-loop')));
  assert.ok(!hoverUsesTransition(configFromPreset('infinite-rotate')));
});

test('blur and skew reach the CSS only when used', () => {
  const plain = buildRuleCss({ ...configFromPreset('tilt'), trigger: 'hover' }, '.a', 'k').css;
  assert.doesNotMatch(plain, /blur|skew/);
  const blur = buildRuleCss({ ...configFromPreset('focus'), trigger: 'hover' }, '.a', 'k').css;
  assert.match(blur, /filter: blur\(5px\)/); assert.match(blur, /filter: blur\(0px\)/);
  assert.match(buildRuleCss({ ...configFromPreset('skew-slide'), trigger: 'hover' }, '.a', 'k').css, /skew\(-8deg, 0deg\)/);
});

test('stagger adds nth-child delays for auto and scroll only', () => {
  const auto = buildRuleCss({ ...configFromPreset('pulse'), trigger: 'auto', stagger: 100 }, '.bk-card', 'k').css;
  assert.match(auto, /\.bk-card:nth-child\(3\) \{ animation-delay: 0\.2s !important; \}/);
  const none = buildRuleCss({ ...configFromPreset('pulse'), trigger: 'auto' }, '.bk-card', 'k').css;
  assert.doesNotMatch(none, /nth-child/);
  const hover = buildRuleCss({ ...configFromPreset('tilt'), trigger: 'hover', stagger: 100 }, '.bk-card', 'k').css;
  assert.doesNotMatch(hover, /nth-child/);
});

test('older saved animations (no skew, blur or stagger) still work', () => {
  const old: any = configFromPreset('tilt'); delete old.stagger;
  for (const k of ['skewX', 'skewY', 'blur']) { delete old.from[k]; delete old.to[k]; }
  const { css } = buildRuleBundle([{ selector: '.x', cfg: old, key: 'k1' }]);
  assert.doesNotMatch(css, /NaN|undefined/);
});

test('swap, mirror and intensity helpers', () => {
  const c = configFromPreset('tilt');
  const s = swapPoses(c); assert.deepEqual(s.from, c.to); assert.deepEqual(s.to, c.from);
  const m = mirrorConfig(c); assert.equal(m.to.rotY, 18); assert.equal(m.originX, 50);
  assert.equal(mirrorConfig(mirrorConfig(c)).to.rotY, c.to.rotY);
  assert.equal(m.from.rotY, 0); assert.ok(!Object.is(m.from.rotY, -0));
  const weak = scaleIntensity(c, 0.5); assert.equal(weak.to.rotX, 7); assert.equal(weak.from.rotX, 0);
  assert.equal(scaleIntensity(c, 1).to.rotY, c.to.rotY);
  assert.deepEqual(scaleIntensity(c, 0).to.rotX, IDENTITY.rotX);
});

test('warnings explain risky settings and stay quiet for the presets', () => {
  for (const p of PRESETS) {
    const w = warningsFor(configFromPreset(p.id));
    assert.ok(w.every((x) => typeof x === 'string'));
  }
  assert.deepEqual(warningsFor({ ...configFromPreset('tilt'), trigger: 'hover' }), []);
  assert.ok(warningsFor({ ...configFromPreset('entrance'), trigger: 'hover' }).some((x) => /invisible/.test(x)));
  const deep = configFromPreset('tilt'); deep.to.transZ = 790;
  assert.ok(warningsFor(deep).some((x) => /Depth/.test(x)));
});

test('preset search matches name, group and keywords', () => {
  assert.ok(searchPresets('flip').length >= 3);
  assert.ok(searchPresets('blur').some((p) => p.id === 'focus'));
  assert.ok(searchPresets('card tilt').some((p) => p.id === 'tilt'));
  assert.equal(searchPresets('zzzz').length, 0);
  assert.ok(searchPresets('', 'Entrance').every((p) => p.group === 'Entrance'));
});

import { withInfinity, isInfinite, touchPreviewJs } from '../src/lib/anim/anim3d';
import { FX, buildFxBundle, fxOf } from '../src/lib/anim/anim3dFx';

test('hover uses plain :hover so it starts instantly (no hover media query)', () => {
  for (const p of PRESETS) {
    const { css } = buildRuleCss({ ...configFromPreset(p.id), trigger: 'hover' }, '.bk-card', 'k');
    assert.doesNotMatch(css, /@media \(hover/, p.id);
    assert.match(css, /\.bk-card:hover, \.bk-card\.k-on/, p.id);
  }
});

test('infinity switch', () => {
  const c = configFromPreset('tilt');
  assert.ok(!isInfinite(c));
  const on = withInfinity(c, true);
  assert.ok(isInfinite(on)); assert.equal(on.direction, 'alternate');
  const css = buildRuleCss({ ...on, trigger: 'hover' }, '.a', 'k').css;
  assert.match(css, /infinite alternate/);
  assert.doesNotMatch(css, /transition: transform/);
  const off = withInfinity(on, false);
  assert.equal(off.repeat, 1); assert.equal(off.direction, 'normal');
  assert.equal(withInfinity({ ...c, direction: 'reverse' }, true).direction, 'reverse');
});

test('preview helper handles mouse and touch, valid JS', () => {
  const js = touchPreviewJs([{ selector: '.a', key: 'k1', cfg: { ...configFromPreset('tilt'), trigger: 'hover' } }, { selector: '.b', key: 'k2', cfg: { ...configFromPreset('press'), trigger: 'press' } }]);
  assert.match(js, /mouseenter/); assert.match(js, /touchstart/); assert.match(js, /"k1-on"/);
  assert.doesNotThrow(() => new Function(js));
});

test('every special effect gives balanced CSS and valid JavaScript', () => {
  assert.ok(FX.length >= 9);
  assert.equal(new Set(FX.map((f) => f.id)).size, FX.length);
  for (const f of FX) {
    const { css, js } = f.build('.bk-card .bk-btn', 'p2c3dfx-1');
    assert.ok(css.length > 20, f.id);
    assert.doesNotMatch(css + js, /NaN|undefined/, f.id);
    assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, f.id);
    if (js) { assert.doesNotThrow(() => new Function(js), f.id); assert.match(js, /prefers-reduced-motion/, f.id); assert.match(js, /"\.bk-card \.bk-btn"/, f.id); }
    assert.match(css, /prefers-reduced-motion/, f.id);
  }
});

test('effect bundle skips unknown ids and joins the rest', () => {
  const b = buildFxBundle([{ selector: '.a', fx: 'ripple', key: 'k1' }, { selector: '.b', fx: 'nope', key: 'k2' }, { selector: '.c', fx: 'cursor-tilt', key: 'k3' }]);
  assert.match(b.css, /k1-wave/); assert.match(b.css, /k3-live/); assert.doesNotMatch(b.css, /nope/);
  assert.ok(fxOf('magnetic'));
});

test('special effect JS really runs against a DOM-like page', () => {
  // minimal fake DOM: enough to prove the scripts bind listeners without throwing
  const fire: Record<string, Function[]> = {};
  const el: any = { classList: { add() {}, remove() {}, toggle() {} }, style: { setProperty() {} }, children: [{ style: {} }], appendChild() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 50 }), addEventListener: (n: string, f: Function) => { (fire[n] ||= []).push(f); } };
  const win: any = { matchMedia: () => ({ matches: false }), addEventListener: (n: string, f: Function) => { (fire['w' + n] ||= []).push(f); }, innerHeight: 800 };
  const doc: any = { querySelectorAll: () => [el], createElement: () => ({ style: {}, parentNode: null }) };
  for (const f of FX) {
    const { js } = f.build('.x', 'k');
    if (!js) continue;
    new Function('window', 'document', 'getComputedStyle', 'requestAnimationFrame', 'setTimeout', 'matchMedia', js)(win, doc, () => ({ position: 'static' }), (cb: Function) => cb(), (cb: Function) => cb(), win.matchMedia);
  }
  for (const f of fire.pointermove || []) f({ clientX: 30, clientY: 10 });
  for (const f of fire.wpointermove || []) f({ clientX: 30, clientY: 10 });
  for (const f of fire.pointerdown || []) f({ clientX: 30, clientY: 10 });
  for (const f of fire.click || []) f();
  for (const f of fire.pointerleave || []) f();
  assert.ok((fire.pointermove || []).length >= 3);
});