import test from 'node:test';
import assert from 'node:assert/strict';
import { classesOf, demoHoldMs, demoPlayJs, describeRule, resolvePick, rootSelector, triggerForPreset } from '../src/lib/anim/anim3dTools';
import { configFromPreset } from '../src/lib/anim/anim3d';

const blocks = [
  { id: 'a', html: '<section class="bk-hero bk-hero--dark"><h1 class="bk-hero__title">Hi</h1><a class="bk-btn is-open">Go</a></section>' },
  { id: 'b', html: '<footer class="bk-footer"><p class="bk-footer__copy">c</p></footer>' },
];

test('root selector and classes', () => {
  assert.equal(rootSelector(blocks[0].html), '.bk-hero');
  assert.equal(rootSelector('<div id="x"></div>'), '#x');
  assert.equal(rootSelector('<nav>x</nav>'), 'nav');
  assert.deepEqual(classesOf(blocks[0].html), ['bk-hero', 'bk-hero--dark', 'bk-hero__title', 'bk-btn']);
});

test('clicking in the preview resolves to the right block and element', () => {
  assert.deepEqual(resolvePick('body > section.bk-hero.bk-hero--dark > h1.bk-hero__title', blocks), { blockPid: 'a', target: 'bk-hero__title' });
  assert.deepEqual(resolvePick('body > section.bk-hero', blocks), { blockPid: 'a', target: '' });
  assert.deepEqual(resolvePick('body > footer.bk-footer > p.bk-footer__copy', blocks), { blockPid: 'b', target: 'bk-footer__copy' });
  // an element without classes falls back to its closest classed ancestor
  assert.deepEqual(resolvePick('body > section.bk-hero > span', blocks), { blockPid: 'a', target: '' });
  assert.equal(resolvePick('body > div.unknown', blocks), null);
});

test('switching preset keeps a trigger the person chose', () => {
  assert.equal(triggerForPreset('auto', null), 'hover');
  assert.equal(triggerForPreset('scroll', null), 'scroll');
  assert.equal(triggerForPreset('auto', 'auto'), 'auto');
  assert.equal(triggerForPreset('hover', 'press'), 'press');
});

test('demo script targets hover/press/scroll only and is valid JS', () => {
  const rules = [
    { selector: '.bk-card', key: 'p2c3d-1', cfg: { ...configFromPreset('tilt'), trigger: 'hover' as const } },
    { selector: '.bk-x', key: 'p2c3d-2', cfg: { ...configFromPreset('rotate-y'), trigger: 'auto' as const } },
    { selector: '.bk-y', key: 'p2c3d-3', cfg: { ...configFromPreset('scroll-reveal'), trigger: 'scroll' as const } },
  ];
  const js = demoPlayJs(rules, 'p2c3d-1');
  assert.match(js, /p2c3d-1-on/); assert.match(js, /p2c3d-3-in/); assert.doesNotMatch(js, /p2c3d-2/);
  assert.doesNotThrow(() => new Function(js));
  assert.equal(demoPlayJs([rules[1]]).includes('R=[]'), true);
});

test('hold time is bounded and descriptions are readable', () => {
  assert.ok(demoHoldMs({ ...configFromPreset('infinite-rotate') }) <= 9000);
  assert.ok(demoHoldMs({ ...configFromPreset('press') }) >= 1400);
  assert.match(describeRule(configFromPreset('tilt')), /0\.45s · easeOut · once · normal/);
});