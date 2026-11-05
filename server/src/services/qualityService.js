'use strict';

const { extOf } = require('../filePolicy');

const SEVERITY_WEIGHT = { critical: 18, high: 10, medium: 5, low: 2, info: 0 };
const lineOf = (s, i) => String(s).slice(0, Math.max(0, i)).split('\n').length;

function audit(files) {
  const issues = [];
  const metrics = { files: files.length, htmlPages: 0, cssFiles: 0, jsFiles: 0, images: 0, mediaQueries: 0, headings: 0, imagesMissingAlt: 0, duplicateIds: 0 };
  const add = (severity, category, path, line, message, recommendation) => issues.push({ severity, category, path, line, message, recommendation });

  for (const file of files) {
    const ext = extOf(file.path), source = String(file.content || '');
    if (['html', 'htm'].includes(ext)) {
      metrics.htmlPages++;
      if (!/<html\b[^>]*\blang\s*=/i.test(source)) add('medium', 'accessibility', file.path, 1, 'The page does not declare a document language.', 'Add an accurate lang attribute to the html element.');
      if (!/<meta\b[^>]*name=["']viewport["']/i.test(source)) add('high', 'responsive', file.path, 1, 'The viewport meta tag is missing.', 'Add width=device-width, initial-scale=1.');
      if (!/<title\b[^>]*>\s*[^<]/i.test(source)) add('medium', 'seo', file.path, 1, 'The page has no descriptive title.', 'Add a unique title element.');
      if (!/<meta\b[^>]*name=["']description["']/i.test(source)) add('low', 'seo', file.path, 1, 'The page has no meta description.', 'Add a concise page-specific description.');
      const h1 = [...source.matchAll(/<h1\b/gi)].length;
      metrics.headings += [...source.matchAll(/<h[1-6]\b/gi)].length;
      if (h1 === 0) add('medium', 'seo', file.path, 1, 'No h1 heading was found.', 'Add one clear page-level h1 heading.');
      if (h1 > 1) add('low', 'seo', file.path, 1, `The page contains ${h1} h1 headings.`, 'Use a single page-level h1 and nest subsequent headings logically.');
      for (const m of source.matchAll(/<img\b[^>]*>/gi)) {
        metrics.images++;
        if (!/\balt\s*=/i.test(m[0])) { metrics.imagesMissingAlt++; add('medium', 'accessibility', file.path, lineOf(source, m.index), 'An image is missing its alt attribute.', 'Add meaningful alt text, or alt="" for decorative images.'); }
      }
      for (const m of source.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/gi)) {
        const inner = m[1].replace(/<[^>]+>/g, '').trim();
        if (!inner && !/\baria-label\s*=/i.test(m[0]) && !/<img\b[^>]*\balt\s*=\s*["'][^"']+/i.test(m[0])) add('medium', 'accessibility', file.path, lineOf(source, m.index), 'A button has no accessible name.', 'Add visible text or an aria-label.');
      }
      for (const m of source.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)) if (!/\brel\s*=\s*["'][^"']*(noopener|noreferrer)/i.test(m[0])) add('medium', 'security', file.path, lineOf(source, m.index), 'A new-tab link does not set rel="noopener" or noreferrer.', 'Add rel="noopener noreferrer".');
      for (const m of source.matchAll(/\bid\s*=\s*(["'])([^"']+)\1/gi)) {
        const id = m[2];
        const before = source.slice(0, m.index);
        if (new RegExp(`\\bid\\s*=["']${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i').test(before)) {
          metrics.duplicateIds++;
          add('low', 'html', file.path, lineOf(source, m.index), `The id "${id}" appears more than once.`, 'Give each element a unique id.');
        }
      }
      for (const m of source.matchAll(/\b(?:href|src)\s*=\s*["']\s*javascript:/gi)) add('high', 'security', file.path, lineOf(source, m.index), 'A javascript: URL was found.', 'Remove the javascript URL and use a safe event handler.');
      for (const m of source.matchAll(/\bon[a-z]+\s*=\s*["'][^"']*["']/gi)) add('info', 'security', file.path, lineOf(source, m.index), 'Inline event-handler code was found.', 'Prefer addEventListener in a separate script where practical.');
    } else if (['css', 'scss', 'sass', 'less'].includes(ext)) {
      metrics.cssFiles++;
      metrics.mediaQueries += [...source.matchAll(/@media\b/gi)].length;
      if (/\b(?:width|min-width)\s*:\s*\d{3,4}px\b/i.test(source)) add('low', 'responsive', file.path, 1, 'A fixed pixel width may cause overflow on narrow screens.', 'Use max-width, percentages, grid/flex constraints, and responsive breakpoints.');
      if (/overflow-x\s*:\s*(?:hidden|clip)/i.test(source)) add('info', 'responsive', file.path, 1, 'Horizontal overflow is being clipped.', 'Verify this is intentional; clipping can hide content rather than fix layout overflow.');
      if (/(^|\n)\s*\*\s*\{[^}]*transition\s*:/i.test(source)) add('info', 'performance', file.path, 1, 'A global transition may animate many unrelated elements.', 'Limit transitions to specific properties and interactive elements.');
      if (/animation\s*:/i.test(source) && !/prefers-reduced-motion/i.test(source)) add('low', 'accessibility', file.path, 1, 'Animations do not appear to respect reduced-motion preferences.', 'Add a prefers-reduced-motion media query to disable or reduce non-essential motion.');
    } else if (['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx'].includes(ext)) {
      metrics.jsFiles++;
      for (const [re, severity, msg, recommendation] of [
        [/\beval\s*\(/g, 'high', 'eval() was found.', 'Avoid evaluating dynamic strings; use explicit functions or safe parsers.'],
        [/\bnew\s+Function\s*\(/g, 'high', 'The Function constructor was found.', 'Avoid dynamic code construction.'],
        [/\binnerHTML\s*=/g, 'medium', 'innerHTML assignment was found.', 'Sanitize untrusted content or use textContent and safe DOM APIs.'],
        [/\bdebugger\s*;/g, 'low', 'A debugger statement remains in the source.', 'Remove debugger statements before release.'],
      ]) for (const m of source.matchAll(re)) add(severity, severity === 'high' || severity === 'medium' ? 'security' : 'maintainability', file.path, lineOf(source, m.index), msg, recommendation);
    }
  }

  const score = Math.max(0, Math.round(100 - issues.reduce((n, i) => n + SEVERITY_WEIGHT[i.severity], 0)));
  const byCategory = {};
  for (const issue of issues) byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  return {
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'Needs work',
    issues: issues.sort((a, b) => (SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity]) || a.path.localeCompare(b.path) || a.line - b.line),
    metrics,
    byCategory,
    note: 'Static source checks only. This is not a browser execution, Lighthouse, penetration test, or proof that the application is secure.'
  };
}

module.exports = { audit };
