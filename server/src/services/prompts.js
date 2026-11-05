// Prompt builders. The generate/refine prompts are the original ones, unchanged; the code-assistant prompts are new.
const { safePath } = require('../filePolicy');
const R = require('./designRules');

const MAX_COMPONENT_CHARS = 150_000;

function componentsBlock(components) {
  if (!Array.isArray(components) || !components.length) return '';
  let used = 0;
  const out = [];
  for (const c of components) {
    const html = String(c.html || ''), css = String(c.css || ''), js = String(c.js || '');
    const size = html.length + css.length + js.length;
    if (!c.name || used + size > MAX_COMPONENT_CHARS) continue;
    used += size;
    out.push(`--- SAVED COMPONENT "${String(c.name).slice(0, 80)}"${c.notes ? ' (' + String(c.notes).slice(0, 300) + ')' : ''} ---\nHTML:\n${html}\nCSS:\n${css}\nJS:\n${js}`);
  }
  if (!out.length) return '';
  return [
    "SAVED COMPONENTS: these are the user's own approved code blocks.",
    'RULES: If a section of the design corresponds to a saved component (match by its name/notes AND by visual role, e.g. "banner" = the top banner, "carousel" = a slider, "footer" = the page footer), REUSE that component as the base for that section: keep its HTML structure, class names and behaviour, and only change text, images, colors and sizes where the design clearly differs. Put its CSS into styles.css and its JS into script.js without breaking other code.',
    'If the user instructions name a component for a section, use that one. If no saved component fits a section, build that section from scratch so it matches the design.',
    'In the NOTES line, say which saved component was used for which section and which sections were built from scratch.',
    out.join('\n'),
  ].join('\n');
}

const MAX_ASSETS = 300;

function safeAssetPath(p) {
  return (
    typeof p === 'string' &&
    p.length > 0 &&
    p.length < 200 &&
    !p.startsWith('/') &&
    !p.includes('..') &&
    !p.includes('\\') &&
    /^[\w\-./ ]+$/.test(p)
  );
}

// The app sends only a light list of the user's images (path, size), never the image bytes.
// File names come from the user's ZIP, so they are validated before they are put into the prompt.
function cleanAssets(assets) {
  if (!Array.isArray(assets)) return [];
  const out = [];
  for (const a of assets.slice(0, MAX_ASSETS)) {
    if (!a || !safeAssetPath(a.path) || !/\.(png|jpe?g|webp|gif|svg|ico|avif|bmp)$/i.test(a.path)) continue;
    const w = Number(a.width) > 0 ? Math.round(Number(a.width)) : 0;
    const h = Number(a.height) > 0 ? Math.round(Number(a.height)) : 0;
    const kb = Number(a.bytes) > 0 ? Math.max(1, Math.round(Number(a.bytes) / 1024)) : 0;
    out.push({ path: a.path, w, h, kb });
  }
  return out;
}

function assetsBlock(assets) {
  if (!assets.length) return '';
  const list = assets.map((a) => `- ${a.path}${a.w && a.h ? ` (${a.w}x${a.h}${a.w > a.h * 1.6 ? ', wide' : a.h > a.w * 1.2 ? ', tall' : a.w === a.h ? ', square' : ''}${a.kb ? ', ' + a.kb + ' KB' : ''})` : ''}`).join('\n');
  return [
    "PROJECT IMAGES: these are the user's own image files. They ALREADY exist in the project folder, so do not output them as files.",
    list,
    'IMAGE RULES:',
    '- Use these files for the images of the design. Match by file name first, then by pixel size and shape (a wide image is a banner/hero, a square image is a logo/avatar/icon, a tall image is a poster/portrait).',
    '- Write every path EXACTLY as listed above, relative to index.html, for example <img src="images/logo.png" alt="...">. styles.css and script.js live in the project root, so write paths there relative to the root too, for example url("images/hero/banner.jpg").',
    '- Never rename an image, never write an image path that is not in the list, and never use a listed file for a slot where it clearly does not belong.',
    '- Use a listed file instead of a placeholder whenever one fits. Only when NO listed file fits a slot, use inline SVG or https://picsum.photos as a placeholder.',
    '- In the NOTES line say which image slots had no matching file.',
  ].join('\n');
}

function analysisPrompt(n, isPdf = false) {
  const what = isPdf
    ? 'The attached PDF is the design. Read EVERY page. Each page is either a section of ONE scrolling site or a separate page of a multi-page site: say which.'
    : n > 1 ? `The ${n} images are consecutive vertical slices (top to bottom, ~80px overlap) of ONE design. Treat them as one page and do not count the overlapped area twice.` : 'Study the attached design.';
  return [
    'You are a meticulous UI analyst. ' + what,
    'Write a DESIGN SPEC in plain text (no code) that another engineer can build from WITHOUT seeing the image. Nothing visible may be left out. Use exactly these parts:',
    '1. GLOBAL: page width the design is drawn at, container max-width, page background; PALETTE as a list "role: #hex" (page bg, section bgs, card bg, text, muted text, accent, button bg/text, borders, footer bg); FONTS (family guess, weights) and the type scale (h1, h2, h3, body, small: px size, weight, line-height, letter-spacing); radius and shadow styles; the spacing rhythm (section padding, gaps).',
    '2. SECTIONS top to bottom. For each: id and tag; background; layout (columns, alignment, gaps, widths in px relative to the image width); ALL visible text copied exactly, in reading order; every button (label, colours, radius, size); every icon (what it shows, size, colour); every image (shape, size, position, crop); lists and cards (count, content of each).',
    '3. WIDGETS: carousels/sliders (visible items, item shape and size, arrows and their exact position, dots, captions), menus (items, active item, dropdowns), forms (fields, labels, placeholders), tabs, accordions, maps, videos.',
    '4. RESPONSIVE PLAN: how each section should re-flow at tablet (~768px) and mobile (~375px): columns, stacking order, what the menu becomes. Say it is inferred, since the image shows one size only.',
    '5. ELEMENT COUNT: total number of headings, buttons, images, icons and cards, so the result can be checked for missing items.',
    'Pay special attention to alignment, spacing, footers with many columns, small print, social icons and carousels. Mark anything you cannot read or measure as UNCERTAIN instead of guessing. Do not skip small items.',
  ].join('\n');
}

function buildPrompt({ mode, target, instructions, files, request, isPdf, spec, components, imageCount, assets = [] }) {
  const rules = [
    'OUTPUT FORMAT (strict, no JSON, no markdown fences): for every file write a line "=== FILE: path/to/file.ext ===" followed by the raw file content. After the last file write a line "=== NOTES ===" and one or two sentences summarizing what you did.',
    'Paths must be relative, use forward slashes, no "..", no leading slash.',
    'Every top-level page section MUST be a <header>, <section>, <main>, <nav> or <footer> with a unique stable id (header, hero, about, services, contact, footer ...).',
    'Never include API keys or secrets. ' + (assets.length ? 'Use the PROJECT IMAGES listed below for images; placeholders only when no listed file fits.' : 'Use https://picsum.photos or inline SVG for placeholder images.'),
    'Make the layout responsive (mobile, tablet, desktop).',
  ];
  const design = [R.block(R.FIDELITY), R.block(R.RESPONSIVE), R.block(R.LIGHT_COLOURS), R.block(R.MOTION), R.block(R.INTERACTION), R.block(R.ADVANCED)];
  const stack = {
    html: 'Plain HTML, CSS and JavaScript in separate files: index.html, styles.css, script.js.',
    bootstrap:
      'Bootstrap 5 via CDN (link + bundle script) plus a custom styles.css and script.js. Do not load any other CSS framework.',
    tailwind:
      'Tailwind CSS via the Play CDN script in index.html, plus a small styles.css and script.js. Do not load any other CSS framework.',
  }[target] || 'Plain HTML, CSS and JavaScript.';
  const frameworkRule = (instructions || []).find((s) => /^Output framework:/i.test(String(s)));
  const stackRule = frameworkRule ? frameworkRule : 'Stack: ' + stack;
  const user = (instructions || []).length
    ? 'USER INSTRUCTIONS (must follow all):\n- ' + instructions.join('\n- ')
    : '';
  if (mode === 'generate') {
    return [
      isPdf
        ? 'You are given a design as a PDF. Read EVERY page before writing code. Treat the pages in order as the sections of ONE scrolling website (index.html), unless the pages are clearly separate screens/pages of a multi-page site, in which case create one HTML file per page (index.html, about.html ...) with working links. Do not skip any page, section, text or image.'
        : 'You convert a UI screenshot into a working website that matches it as closely as possible.',
      imageCount > 1 ? `The ${imageCount} images are consecutive vertical slices (top to bottom, ~80px overlap) of ONE page. Build ONE page, do not repeat the overlapped area.` : '',
      'Match the design as closely as possible: same layout, alignment, spacing, sizes, colors, fonts, shapes (for example circular images), borders and shadows. Do not simplify or restyle anything.',
      'Copy visible text exactly. Sliders/carousels must be real working carousels with the same item shape, number of visible items and arrow placement as the design. Footers must keep the same columns and alignment.',
      stackRule,
      spec ? 'DESIGN SPEC written by an analyst who studied the images (if the spec and the images disagree, the images win):\n' + spec : '',
      componentsBlock(components),
      assetsBlock(assets),
      ...design,
      ...rules,
      user,
    ].filter(Boolean).join('\n');
  }
  return [
    'You edit an existing website. Make the SMALLEST change that satisfies the request. Keep all unrelated code identical.',
    'If the REQUEST is a numbered list of changes, apply EVERY item of it exactly, and nothing else. If an image is attached it is the reference design: after your change the page must match it in the affected parts.',
    'Return ONLY the files you changed (full content of each changed file, never a diff or a fragment).',
    assetsBlock(assets),
    R.block(R.RESPONSIVE),
    R.block(R.LIGHT_COLOURS),
    R.block(R.MOTION),
    R.block(R.INTERACTION),
    R.block(R.ADVANCED),
    ...rules,
    user,
    'CURRENT FILES:\n' + JSON.stringify(files),
    'REQUEST: ' + request,
  ].join('\n');
}


// Step 1 of "plan then apply": compare reference and page, change NOTHING, return a numbered list.
function planPrompt({ files, request, assets = [], imageCount = 1 }) {
  return [
    'You are a strict design reviewer. ANALYSIS ONLY: do NOT change, add or return any file and write no code.',
    imageCount > 1 ? `The ${imageCount} attached images are consecutive vertical slices (top to bottom, ~80px overlap) of ONE reference design.` : 'The attached image is the reference design.',
    'Compare the reference with the CURRENT FILES below, section by section, from the top header to the footer. Check at least: layout and alignment, spacing and sizes, font family/size/weight, colours and backgrounds, images and icons, borders/radius/shadows, buttons, exact text, missing or extra elements, and how the page re-flows on tablet and mobile.',
    'OUTPUT FORMAT (strict). Write one line per difference, nothing else except the final NOTES line:',
    '<number>. <Section name> | <what is different and exactly what it should be, with px/hex values where you can read them>',
    'Write "<number>. <Section name> | matches" for a section that already matches. Mention even small differences. Never write code blocks.',
    'After the list write a line "=== NOTES ===" and one sentence with the overall match estimate.',
    assetsBlock(assets),
    'CURRENT FILES:\n' + JSON.stringify(files),
    request ? 'REQUEST FROM THE APP:\n' + request : '',
  ].filter(Boolean).join('\n');
}

// Optional second look after generation: the model audits its own result against the reference and fixes it.
function verifyPrompt({ files, spec, imageCount = 1, isPdf = false }) {
  return [
    'You are a meticulous QA engineer. ' + (isPdf ? 'The attached PDF is the reference design.' : imageCount > 1 ? `The ${imageCount} attached images are consecutive vertical slices of ONE reference design (~80px overlap).` : 'The attached image is the reference design.') + ' The reference is the source of truth.',
    'Below are the files that were generated from it. Audit them against the reference: missing sections, elements, text or icons; wrong text; wrong colours, fonts, sizes, spacing, alignment, radius, shadows; wrong footer columns; carousels that are not real working carousels; overlapped slice areas that appear twice; broken ids, links, image paths; and responsive problems (menu does not collapse, columns do not stack, horizontal scroll at 320px).',
    'Fix everything you find with the SMALLEST possible change. Keep every id and class name. Do NOT add hover, scroll or click animations.',
    'OUTPUT FORMAT (strict, no JSON, no fences): for every file you changed write a line "=== FILE: path ===" followed by the COMPLETE new file. Do not return unchanged files. Then a line "=== NOTES ===" and a short list of what you fixed. If nothing needs fixing, write only "=== NOTES ===" and "No fixes needed".',
    R.block(R.LIGHT_COLOURS),
    spec ? 'DESIGN SPEC written earlier:\n' + spec : '',
    'GENERATED FILES:\n' + JSON.stringify(files),
  ].filter(Boolean).join('\n');
}

// ---------------------------------------------------------------------------------------------
// Code assistant
// ---------------------------------------------------------------------------------------------
const ACTIONS = {
  explain: {
    goal: 'Explain the code in beginner-friendly language: what it does, step by step, key terms, and anything surprising. Do NOT change code. Return no FILE sections.',
    changes: false,
  },
  generate: {
    goal: 'Write the code the user describes. Prefer several small related files over one big file. Add new files; only modify an existing file when the instruction requires it, and then return its COMPLETE new content while keeping all unrelated code identical.',
    changes: true,
  },
  refactor: {
    goal: 'Refactor for clarity and maintainability WITHOUT changing behaviour. Return the complete new content of each changed file only. Explain each change and why it is safe.',
    changes: true,
  },
  fix: {
    goal: 'Find and fix syntax errors, runtime errors and obvious logic bugs (use the DIAGNOSTICS if given). Make the smallest change that fixes each problem. Return the complete new content of each changed file only, and explain the root cause of each bug.',
    changes: true,
  },
  review: {
    goal: 'Review the code. List problems ordered by priority: bugs, security issues (injection, XSS, secrets, unsafe auth), accessibility, performance, SEO and maintainability. Do NOT change code. Return no FILE sections. Put every finding in the ISSUES section.',
    changes: false,
  },
  tests: {
    goal: 'Write unit tests (and basic integration tests where sensible) for the code. Use the test framework already present in the project, otherwise the most common one for the language. Return only NEW test files, never edit the code under test.',
    changes: true,
  },
};

function codePrompt(action, { files, selection, instruction, language, diagnostics, instructions = [] }) {
  const a = ACTIONS[action];
  const parts = [
    'You are a careful senior engineer working inside the user\'s existing project. Preserve everything that already works.',
    'TASK: ' + a.goal,
    'OUTPUT FORMAT (strict, no JSON, no markdown outside file contents). Use these section markers, each on its own line:',
    '=== EXPLANATION ===   plain-language explanation of what you found/did and why (always present)',
    a.changes ? '=== FILE: relative/path.ext ===   then the COMPLETE raw file content (no fences). Repeat for every file you create or change.' : '(Do not write FILE sections for this task.)',
    '=== DEPENDENCIES ===   one package per line as "name - why", or the word none',
    action === 'review' || action === 'fix' ? '=== ISSUES ===   one per line: severity | path:line | what is wrong | how to fix. severity is one of critical, high, medium, low, info.' : '',
    '=== NOTES ===   one or two sentences, including anything the user must verify. Never claim the code is secure or tested unless you ran it (you did not).',
    'Paths are relative with forward slashes, no "..", no leading slash. Never include secrets or API keys. Never write executable or binary files.',
    instructions.length ? 'PROJECT RULES (follow all):\n- ' + instructions.join('\n- ') : '',
    language ? 'Preferred language/stack: ' + language : '',
    diagnostics && diagnostics.length ? 'DIAGNOSTICS reported by the editor:\n' + diagnostics.slice(0, 40).map((d) => `- ${d.path || ''}${d.line ? ':' + d.line : ''} ${String(d.message).slice(0, 300)}`).join('\n') : '',
    selection && selection.text ? `SELECTED CODE in ${selection.path || 'current file'}${selection.startLine ? ' (lines ' + selection.startLine + '-' + (selection.endLine || selection.startLine) + ')' : ''}. Focus on it and keep the rest of the file unchanged:\n${String(selection.text).slice(0, 60_000)}` : '',
    'PROJECT FILES (context):\n' + files.map((f) => `--- ${f.path} ---\n${f.content}`).join('\n'),
    'INSTRUCTION: ' + (instruction || '(none: use the task above)'),
  ];
  return parts.filter(Boolean).join('\n');
}

// Options chosen in the "Convert" panel are turned into plain rules for the existing generate prompt.
function conversionRules(o = {}) {
  const out = [];
  if (o.framework && o.framework !== 'html') out.push(`Output framework: ${o.framework}. Create a real multi-file project (components/pages/styles), not one big file.`);
  if (o.language === 'typescript') out.push('Use TypeScript for all scripts/components.');
  if (o.styling) out.push('Styling approach: ' + String(o.styling).slice(0, 40) + '.');
  if (Array.isArray(o.breakpoints) && o.breakpoints.length) out.push('Responsive breakpoints (px): ' + o.breakpoints.slice(0, 6).map(Number).filter((n) => n > 0 && n < 5000).join(', ') + '.');
  if (o.font) out.push('Preferred font: ' + String(o.font).replace(/[^\w \-]/g, '').slice(0, 40) + '.');
  if (o.animation && o.animation !== 'none') {
    out.push('Animation preference: ' + String(o.animation).replace(/[^\w \-]/g, '').slice(0, 40) + ' (respect prefers-reduced-motion).');
    if (o.animation === 'rich') out.push('Use polished but purposeful motion: section reveals, restrained staggered entrances, meaningful state transitions and carefully timed hero motion. Avoid excessive movement and keep the content usable without animation.');
  }
  out.push('Split the result into separate related files (markup, styles, scripts). Keep every section id stable.');
  return out;
}

module.exports = { componentsBlock, cleanAssets, assetsBlock, analysisPrompt, buildPrompt, planPrompt, verifyPrompt, codePrompt, conversionRules, ACTIONS };
