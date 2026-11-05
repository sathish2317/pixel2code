import test from 'node:test';
import assert from 'node:assert/strict';
import { UI_KIT, UI_KIT_CATEGORIES } from '../src/lib/anim/uiKit';

test('UI kit has unique, complete component definitions', () => {
  assert.ok(UI_KIT.length >= 18);
  assert.equal(new Set(UI_KIT.map(x => x.id)).size, UI_KIT.length);
  for (const item of UI_KIT) {
    assert.ok(item.name.trim(), `${item.id} has a name`);
    assert.ok(item.html.includes('p2c-stage'), `${item.id} has preview markup`);
    assert.ok(item.css.trim(), `${item.id} has styles`);
    assert.ok(item.description.trim(), `${item.id} has a description`);
    assert.ok(UI_KIT_CATEGORIES.includes(item.category));
  }
});

test('advanced interactive components include runnable JavaScript', () => {
  const named = ['btn-ripple', 'btn-loading', 'btn-toggle', 'btn-record', 'modal-command', 'modal-danger', 'modal-toasts', 'nav-sidebar', 'nav-tabs', 'nav-stepper', 'card-spotlight'];
  for (const id of named) {
    const component = UI_KIT.find(x => x.id === id);
    assert.ok(component, `${id} exists in the catalogue`);
    assert.ok(component.js, `${id} includes interaction code`);
  }
  // Every modal and navigation component is interactive by nature, so none may ship without code.
  for (const item of UI_KIT.filter(x => /^(modal|nav)-/.test(x.id))) assert.ok(item.js, `${item.id} includes interaction code`);
});

test('component snippets are framework independent and scoped', () => {
  for (const item of UI_KIT) {
    assert.ok(!/import\s+React|from\s+['"]react/.test(item.js || ''));
    assert.ok(item.css.includes('.'));
  }
});