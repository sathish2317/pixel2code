// Business logic that talks to the AI provider. Routes call these; they never touch HTTP.
const { HttpError } = require('../errors');
const { parseFiles, parsePlan, parseCodeResponse } = require('./aiOutput');
const P = require('./prompts');

function create({ cfg, provider, log }) {
  const L = cfg.limits;
  const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/webp'];

  /**
   * Second look (only for deep mode): the model compares its own result with the reference and returns just the files it fixed.
   * It can only improve the answer: any failure, empty answer or suspiciously short file is ignored and the original is kept.
   */
  async function verify({ files, spec, imgParts, imageCount, isPdf }) {
    try {
      const size = files.reduce((n, f) => n + f.content.length, 0);
      if (size > L.requestFilesChars) return { files, fixed: [], note: '' };
      const text = await provider.complete([{ text: P.verifyPrompt({ files, spec, imageCount, isPdf }) }, ...imgParts], { log });
      const out = parseFiles(text, L, { allowEmpty: true });
      const have = new Map(files.map((f) => [f.path, f]));
      const fixed = [];
      for (const f of out.files) {
        const old = have.get(f.path);
        if (old && f.content.length < old.content.length * 0.4) { log.warn('verify: ignored a much shorter file', { path: f.path }); continue; } // looks cut off
        if (old && old.content === f.content) continue;
        have.set(f.path, f);
        fixed.push(f.path);
      }
      return { files: [...have.values()], fixed, note: out.notes };
    } catch (e) {
      if (e.status === 429) log.warn('verify skipped: quota');
      else log.warn('verify pass failed', { msg: e.message });
      return { files, fixed: [], note: '' };
    }
  }

  async function generate({ images, target = 'html', instructions = [], components = [], deep = false, assets, options }) {
    const isPdf = images[0].mime === 'application/pdf';
    const imgParts = images.map((im) => ({ inline_data: { mime_type: im.mime, data: im.base64 } }));
    let spec = '';
    if (deep) {
      try { spec = (await provider.complete([{ text: P.analysisPrompt(images.length, isPdf) }, ...imgParts], { log })).slice(0, 30_000); }
      catch (e) { if (e.status === 429) throw e; log.warn('analysis pass failed', { msg: e.message }); }
    }
    const extra = options ? P.conversionRules(options) : [];
    const prompt = P.buildPrompt({ mode: 'generate', target, instructions: [...instructions, ...extra], isPdf, spec, components, imageCount: images.length, assets: P.cleanAssets(assets) });
    const out = parseFiles(await provider.complete([{ text: prompt }, ...imgParts], { log }), L);
    let result = { ...out, analyzed: Boolean(spec), verified: false, fixed: [] };
    if (deep && cfg.verifyPass) {
      const v = await verify({ files: out.files, spec, imgParts, imageCount: images.length, isPdf });
      result = { ...out, files: v.files, analyzed: Boolean(spec), verified: true, fixed: v.fixed };
      if (v.fixed.length && v.note) result.notes = (out.notes + ' | Self-check fixed: ' + v.note.replace(/\s+/g, ' ')).slice(0, 900);
    }
    return result;
  }

  /**
   * Plan step: compare the reference with the current files and LIST the differences. Never returns files, never changes anything.
   * `images` is a list of {base64, mime} (the route has already validated it).
   */
  async function plan({ images, files, request = '', assets }) {
    const imgParts = images.map((im) => ({ inline_data: { mime_type: im.mime, data: im.base64 } }));
    const prompt = P.planPrompt({ files, request: String(request).slice(0, 2000), assets: P.cleanAssets(assets), imageCount: images.length });
    const text = await provider.complete([{ text: prompt }, ...imgParts], { log });
    const out = parsePlan(text);
    return { files: [], notes: out.notes, items: out.items, summary: out.summary, analysisOnly: true };
  }

  async function refine({ files, request, target = 'html', instructions = [], imageBase64, mime, assets }) {
    const parts = [{ text: P.buildPrompt({ mode: 'refine', target, instructions, files, request, assets: P.cleanAssets(assets) }) }];
    if (imageBase64 && IMAGE_MIME.includes(mime)) parts.push({ inline_data: { mime_type: mime, data: imageBase64 } });
    return parseFiles(await provider.complete(parts, { log }), L);
  }

  function parseJsonAnswer(text) {
    const raw = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    try { return JSON.parse(raw); } catch {}
    const start = raw.indexOf('{'), end = raw.lastIndexOf('}');
    if (start >= 0 && end > start) { try { return JSON.parse(raw.slice(start, end + 1)); } catch {} }
    return null;
  }

  async function analyzeDesign({ images, instructions = [] }) {
    const imgParts = images.map((im) => ({ inline_data: { mime_type: im.mime, data: im.base64 } }));
    const prompt = [
      'Act as a senior product designer and frontend architect. Analyze every attached reference image carefully. Do not invent unreadable text or uncertain measurements.',
      images.length > 1 ? `The ${images.length} images are ordered vertical slices of one page. Combine them and do not count overlaps twice.` : 'The image is the full design reference.',
      'Return ONLY valid JSON with this schema:',
      '{"title":"string","pageType":"landing|dashboard|marketing|portfolio|ecommerce|other","designSummary":"string","canvas":{"estimatedWidth":number|null,"background":"string","containerWidth":"string"},"palette":[{"role":"string","hex":"#RRGGBB","confidence":"high|medium|low"}],"typography":{"fontFamily":"string","scale":[{"role":"h1|h2|h3|body|small","size":"string","weight":"string","lineHeight":"string"}]},"sections":[{"id":"string","name":"string","layout":"string","background":"string","content":["exact visible text"],"elements":[{"type":"heading|text|image|button|icon|card|form|navigation|other","description":"string","label":"string"}]}],"interactions":[{"element":"string","behavior":"string"}],"responsivePlan":[{"viewport":"mobile|tablet|desktop","changes":["string"]}],"assetsToFind":[{"role":"string","visualDescription":"string","aspect":"wide|square|portrait|unknown"}],"uncertainties":["string"],"confidence":number}',
      'Copy visible text exactly. Use null for measurements that cannot be estimated. Palette hex values are estimates from the image, not sampled pixel truth. Confidence is 0 to 1.',
      instructions.length ? 'USER CONTEXT:\n' + instructions.join('\n') : ''
    ].filter(Boolean).join('\n');
    const raw = await provider.complete([{ text: prompt }, ...imgParts], { log });
    const parsed = parseJsonAnswer(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { structured: false, raw: raw.slice(0, 30000), warning: 'The model did not return valid structured JSON. The raw analysis is included.' };
    return { structured: true, ...parsed };
  }

  async function compareDesign({ reference, rendered, viewport, instruction = '' }) {
    const prompt = [
      'You are a meticulous visual QA engineer. Compare IMAGE 1 (reference design) with IMAGE 2 (current browser render).',
      'Return ONLY valid JSON using this schema: {"visualScore":number,"summary":"string","matches":["string"],"issues":[{"severity":"critical|high|medium|low","area":"layout|spacing|typography|colour|imagery|content|responsive|interaction|other","reference":"what image 1 shows","rendered":"what image 2 shows","fix":"specific change to make"}],"missingElements":["string"],"extraElements":["string"],"uncertainties":["string"]}.',
      'visualScore is a subjective visual estimate from 0 to 100, NOT a measured pixel-difference percentage. Compare section order, alignment, relative dimensions, spacing, typography, colors, crop, visible text and controls. Do not claim that a control works merely because it is visible. Do not invent exact CSS values if they cannot be read.',
      viewport ? `Both images are intended to represent viewport ${viewport.width}x${viewport.height}.` : 'Assume both images are intended to represent the same viewport; mention if they appear differently sized.',
      instruction ? 'Additional context: ' + instruction : ''
    ].filter(Boolean).join('\n');
    const raw = await provider.complete([
      { text: prompt },
      { inline_data: { mime_type: reference.mime, data: reference.base64 } },
      { inline_data: { mime_type: rendered.mime, data: rendered.base64 } }
    ], { log });
    const parsed = parseJsonAnswer(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return { structured: false, raw: raw.slice(0, 20000), warning: 'The model did not return valid structured comparison data.' };
    const score = Number(parsed.visualScore);
    return { structured: true, ...parsed, visualScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null, measurement: 'vision-model estimate; use the frontend Canvas pixel-diff tool for exact pixel metrics' };
  }

  async function iterateDesign({ images, files, request = '', target = 'html', maxIterations = 1, assets = [] }) {
    const original = files.map((f) => ({ path: f.path, content: f.content }));
    let current = original;
    const imgParts = images.map((im) => ({ inline_data: { mime_type: im.mime, data: im.base64 } }));
    const rounds = [];
    const allChanged = new Set();
    let remaining = [];
    for (let round = 1; round <= maxIterations; round++) {
      const planText = await provider.complete([{ text: P.planPrompt({ files: current, request, assets: P.cleanAssets(assets), imageCount: images.length }) }, ...imgParts], { log });
      const plan = parsePlan(planText);
      remaining = plan.items;
      if (!plan.items.length) { rounds.push({ round, status: 'matches-or-no-differences-parsed', issuesFound: 0, changed: [] }); break; }
      const fixRequest = [
        request ? 'USER REQUEST: ' + request : '',
        'Fix the following reference mismatches in priority order. Make the smallest possible changes and preserve all unrelated behavior:',
        ...plan.items.map((item, i) => `${i + 1}. ${item.section}: ${item.text}`),
        'Return complete contents only for files that need changes.'
      ].filter(Boolean).join('\n');
      const prompt = P.buildPrompt({ mode: 'refine', target, instructions: [], files: current, request: fixRequest, assets: P.cleanAssets(assets) });
      const proposed = parseFiles(await provider.complete([{ text: prompt }, ...imgParts], { log }), L);
      if (!proposed.files.length) { rounds.push({ round, status: 'no-valid-file-changes', issuesFound: plan.items.length, changed: [] }); break; }
      const map = new Map(current.map((f) => [f.path, f]));
      const changed = [];
      for (const f of proposed.files) {
        const old = map.get(f.path);
        if (old && old.content === f.content) continue;
        map.set(f.path, f); changed.push(f.path); allChanged.add(f.path);
      }
      if (!changed.length) { rounds.push({ round, status: 'no-different-content', issuesFound: plan.items.length, changed: [] }); break; }
      current = [...map.values()];
      let verification = { files: current, fixed: [], note: '' };
      if (cfg.verifyPass) verification = await verify({ files: current, spec: plan.notes, imgParts, imageCount: images.length, isPdf: false });
      current = verification.files;
      verification.fixed.forEach((p) => allChanged.add(p));
      rounds.push({ round, status: 'proposal-created', issuesFound: plan.items.length, changed: [...new Set([...changed, ...verification.fixed])], verification: cfg.verifyPass ? 'attempted' : 'disabled' });
    }
    // One final analysis reports remaining gaps; it does not make further edits.
    try {
      const finalText = await provider.complete([{ text: P.planPrompt({ files: current, request, assets: P.cleanAssets(assets), imageCount: images.length }) }, ...imgParts], { log });
      remaining = parsePlan(finalText).items;
    } catch (e) { log.warn('final design analysis skipped', { message: e.message }); }
    const originalByPath = new Map(original.map((f) => [f.path, f.content]));
    const changedFiles = current.filter((f) => originalByPath.get(f.path) !== f.content).map((f) => ({ ...f, status: originalByPath.has(f.path) ? 'modified' : 'new' }));
    return {
      files: changedFiles,
      rounds,
      remaining,
      complete: remaining.length === 0,
      requiresApproval: true,
      applied: false,
      notes: 'This is an AI-generated proposal. Review the diff and preview it before applying; the server has not changed the saved project.'
    };
  }

  /** action: explain | generate | refactor | fix | review | tests. Returns a PROPOSAL; the server never applies it. */
  async function codeAction(action, input) {
    if (!P.ACTIONS[action]) throw new HttpError(400, 'Unknown code action.');
    const text = await provider.complete([{ text: P.codePrompt(action, input) }], { log });
    const out = parseCodeResponse(text, L, input.files);
    if (P.ACTIONS[action].changes && !out.files.length && !out.explanation) throw new HttpError(502, 'AI answer was empty or unusable. Try again with a clearer instruction.');
    if (!P.ACTIONS[action].changes) out.files = []; // read-only actions never propose edits
    return {
      action, ...out,
      requiresApproval: out.files.some((f) => f.status !== 'new'), // anything that overwrites needs an explicit OK in the app
      disclaimer: 'AI output is unreviewed. Read the diff, test it, and do not assume it is correct or secure.',
    };
  }

  return { generate, refine, plan, analyzeDesign, compareDesign, iterateDesign, codeAction, IMAGE_MIME };
}

module.exports = { create };
