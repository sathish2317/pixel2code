import test from 'node:test';
import assert from 'node:assert/strict';
import { commandToCss, convertFramework, repeatedMarkupReport, responsiveAudit } from '../src/lib/proTools';
import type { ProjectFile } from '../src/types';

const files: ProjectFile[] = [
  { path: 'index.html', content: '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div class="card"><h2>One</h2></div><div class="card"><h2>Two</h2></div></body></html>' },
  { path: 'style.css', content: '.card { border-radius: 8px; } @media (max-width: 768px) { .card { width: 100%; } }' },
];

test('framework conversion creates React starter files', () => {
  const result = convertFramework(files, 'react');
  assert.ok(result.some((f) => f.path === 'src/App.jsx'));
  assert.ok(result.find((f) => f.path === 'src/App.jsx')?.content.includes('className='));
});

test('Next conversion creates app router files', () => {
  const result = convertFramework(files, 'next');
  assert.ok(result.some((f) => f.path === 'app/page.jsx'));
  assert.ok(result.some((f) => f.path === 'app/styles.css'));
});

test('component report detects repeated class markup', () => {
  assert.ok(repeatedMarkupReport(files).some((x) => x.count === 2));
});

test('responsive audit returns no viewport warning when viewport exists', () => {
  assert.ok(!responsiveAudit(files).some((x) => x.includes('viewport meta')));
});

test('command palette creates common CSS actions', () => {
  assert.ok(commandToCss('change heading color to #2563eb')?.css.includes('#2563eb'));
  assert.ok(commandToCss('make it responsive')?.css.includes('@media'));
});
