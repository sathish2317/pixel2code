import type { ProjectFile } from '../types';

export type FrameworkTarget = 'html' | 'react' | 'next' | 'vue' | 'tailwind';

export function convertFramework(files: ProjectFile[], target: FrameworkTarget): ProjectFile[] {
  const htmlFile = files.find((f) => /\.html?$/i.test(f.path));
  const cssFile = files.find((f) => /\.css$/i.test(f.path));
  const html = htmlFile?.content ?? '<main><h1>Hello Pixel2Code</h1></main>';
  const css = cssFile?.content ?? '';
  if (target === 'html') return files;
  if (target === 'tailwind') {
    const converted = html.replace(/class=/g, 'className=');
    return [
      { path: 'tailwind-output.html', content: `<!-- Tailwind utility conversion starter. Review and replace custom classes as needed. -->\n${converted}` },
      { path: 'tailwind.config.js', content: `/** @type {import('tailwindcss').Config} */\nmodule.exports = { content: ['./**/*.{html,js,jsx,ts,tsx,vue}'], theme: { extend: {} }, plugins: [] };` },
      { path: 'tailwind.css', content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n${css}` },
    ];
  }
  const body = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html.replace(/<!doctype[^>]*>|<html[^>]*>|<\/html>|<head[\s\S]*?<\/head>/gi, '');
  const jsx = body.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/<img([^>]*?)(?<!\/)\s*>/gi, '<img$1 />')
    .replace(/<br\s*>/gi, '<br />').replace(/<hr\s*>/gi, '<hr />')
    .replace(/\bstyle="([^"]*)"/g, (_m, s: string) => `style={{ ${s.split(';').map((x) => x.trim()).filter(Boolean).map((x) => { const [k, ...v] = x.split(':'); return `${k.trim().replace(/-([a-z])/g, (_a, c) => c.toUpperCase())}: ${JSON.stringify(v.join(':').trim())}`; }).join(', ')} }}`);
  if (target === 'vue') return [{ path: 'App.vue', content: `<template>\n${body}\n</template>\n\n<script setup>\n// Add component state and event handlers here.\n</script>\n\n<style>\n${css}\n</style>\n` }];
  const name = target === 'next' ? 'app/page.jsx' : 'src/App.jsx';
  return [
    { path: name, content: `${target === 'next' ? '' : "import React from 'react';\n"}import './styles.css';\n\nexport default function App() {\n  return (\n    <>\n${jsx.split('\n').map((line) => `      ${line}`).join('\n')}\n    </>\n  );\n}\n` },
    { path: target === 'next' ? 'app/styles.css' : 'src/styles.css', content: css || '/* Move your styles here. */\n' },
  ];
}

export function repeatedMarkupReport(files: ProjectFile[]) {
  const html = files.filter((f) => /\.html?$/i.test(f.path)).map((f) => f.content).join('\n');
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bclass=["']([^"']+)["'][^>]*)>/gi)) {
    const tag = match[1].toLowerCase();
    const cls = match[3].trim().split(/\s+/).sort().join('.');
    const key = `<${tag} class="${cls}">`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([pattern, count]) => ({ pattern, count }));
}

export function responsiveAudit(files: ProjectFile[]) {
  const css = files.filter((f) => /\.css$/i.test(f.path)).map((f) => f.content).join('\n');
  const html = files.filter((f) => /\.html?$/i.test(f.path)).map((f) => f.content).join('\n');
  const issues: string[] = [];
  if (!/name=["']viewport["']/i.test(html)) issues.push('Add a viewport meta tag to the HTML head.');
  if (!/@media\s*\(/i.test(css)) issues.push('No CSS media queries detected; add mobile and tablet breakpoints.');
  if (/(?:width|min-width)\s*:\s*\d{3,}px/i.test(css) && !/max-width\s*:\s*100%/i.test(css)) issues.push('Large fixed widths may overflow on small screens; consider max-width: 100%.');
  if (/overflow\s*:\s*hidden/i.test(css)) issues.push('Check overflow:hidden rules on mobile so content is not clipped.');
  if (!/box-sizing\s*:\s*border-box/i.test(css)) issues.push('Consider applying box-sizing: border-box globally.');
  return issues;
}

export function commandToCss(command: string): { css: string; message: string } | null {
  const s = command.toLowerCase();
  const color = command.match(/#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})\b/i)?.[0];
  if (/background/.test(s) && color) return { css: `body { background-color: ${color}; }`, message: `Set the page background to ${color}.` };
  if (/(heading|text|font).*(colou?r|color)/.test(s) && color) return { css: `h1, h2, h3 { color: ${color}; }`, message: `Set heading colour to ${color}.` };
  if (/round|radius/.test(s)) { const px = command.match(/(\d+)\s*px/i)?.[1] ?? '12'; return { css: `button, .card, .box { border-radius: ${px}px; }`, message: `Applied ${px}px corner radius to common elements.` }; }
  if (/shadow/.test(s)) return { css: `.card, .box, button { box-shadow: 0 10px 30px rgba(0,0,0,.12); }`, message: 'Added a soft shadow to common components.' };
  if (/responsive|mobile/.test(s)) return { css: `*, *::before, *::after { box-sizing: border-box; }\nimg, video, iframe { max-width: 100%; }\n@media (max-width: 768px) { .container { width: 100%; max-width: 100%; padding-left: 16px; padding-right: 16px; } }`, message: 'Added a basic responsive safety pass.' };
  if (/hover.*(animation|effect)|smooth hover/.test(s)) return { css: `button, a, .card { transition: transform .25s ease, box-shadow .25s ease, color .25s ease, background-color .25s ease; }\nbutton:hover, a:hover, .card:hover { transform: translateY(-3px); }\n@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: .01ms !important; animation-duration: .01ms !important; } }`, message: 'Added a smooth hover effect and reduced-motion support.' };
  return null;
}
