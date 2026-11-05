import type { Preset, Trigger } from './motionPresets';

export type Opts = {
  duration: string; delay: string; easing: string; iteration: string; direction: string; fillMode: string; playState: string;
  transitionProperties: string; translateX: string; translateY: string; scale: string; rotate: string; skew: string; perspective: string;
  opacity: string; blur: string; hoverColor: string; bgColor: string; textColor: string; borderColor: string; shadow: string; radius: string;
  parentSelector: string; reducedMotion: boolean;
};

const HTML_TAGS = new Set(['a','article','aside','body','button','div','footer','form','h1','h2','h3','h4','h5','h6','header','img','input','label','li','main','nav','ol','p','section','span','strong','svg','table','textarea','ul','video']);

/** Split on a separator, ignoring separators inside (...) or [...]. Empty parts are dropped. */
export function splitTop(input: string, sep: string): string[] {
  const out: string[] = []; let depth = 0; let cur = '';
  for (const ch of input) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (ch === sep && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}

/** "hero-card" -> ".hero-card"; ".a, .b" -> [".a", ".b"]; real tags (h1, button) stay as tags. */
export function splitSelectors(raw: string): string[] {
  const list = splitTop(raw, ',').map((s) => (/^[A-Za-z_][\w-]*$/.test(s) && !HTML_TAGS.has(s.toLowerCase()) ? '.' + s : s));
  return list.length ? list : ['.selected-element'];
}

/** Replace var(--p2c-*, fallback) with the real value so no helper variables leak into the output. */
export function resolveVars(css: string, o: Pick<Opts, 'hoverColor' | 'bgColor' | 'textColor' | 'shadow'>): string {
  const map: Record<string, string> = { 'hover-color': o.hoverColor, 'hover-bg': o.bgColor, 'hover-text': o.textColor, shadow: o.shadow, surface: o.bgColor };
  let out = ''; let i = 0;
  while (i < css.length) {
    const start = css.indexOf('var(--p2c-', i);
    if (start < 0) { out += css.slice(i); break; }
    out += css.slice(i, start);
    let depth = 0; let j = start + 3;
    for (; j < css.length; j++) {
      if (css[j] === '(') depth++;
      else if (css[j] === ')') { depth--; if (depth === 0) { j++; break; } }
    }
    const inner = css.slice(start + 4, j - 1);
    const comma = inner.indexOf(',');
    const name = (comma < 0 ? inner : inner.slice(0, comma)).replace(/^--p2c-/, '').trim();
    out += map[name] ?? (comma < 0 ? '' : inner.slice(comma + 1).trim());
    i = j;
  }
  return out;
}

/** "a:b;c:d" -> one declaration per line, "prop: value;" */
export function fmtDecls(decls: string, indent = '  '): string {
  return splitTop(decls, ';').map((d) => {
    const k = d.indexOf(':');
    return k < 0 ? `${indent}${d};` : `${indent}${d.slice(0, k).trim()}: ${d.slice(k + 1).trim().replace(/\s+/g, ' ')};`;
  }).join('\n');
}

/** "0%,100%{a:b}50%{c:d}" -> readable, indented keyframe steps */
export function fmtFrames(frames: string): string {
  const out: string[] = []; const re = /([^{}]+)\{([^{}]*)\}/g; let m: RegExpExecArray | null;
  while ((m = re.exec(frames))) out.push(`  ${m[1].trim().replace(/\s*,\s*/g, ', ')} {\n${fmtDecls(m[2], '    ')}\n  }`);
  return out.length ? out.join('\n') : frames;
}

export function safeColor(v: string, fallback: string): string {
  const s = v.trim();
  try { if (typeof CSS !== 'undefined' && CSS.supports) return s && CSS.supports('color', s) ? s : fallback; } catch { /* fall through */ }
  return /^#[0-9a-f]{3,8}$/i.test(s) || /^(?:rgb|hsl)a?\([\d\s.,%/-]+\)$/i.test(s) || /^[a-z]+$/i.test(s) ? s : fallback;
}

export function buildCss(preset: Preset, target: string, trigger: Trigger, opts: Opts, customFrames = '', customName = 'p2cCustomMotion'): string {
  const targets = splitSelectors(target);
  const parents = splitSelectors(opts.parentSelector);
  const list = (arr: string[]) => arr.join(',\n');
  const hoverSel = trigger === 'parent-hover' ? list(parents.flatMap((p) => targets.map((t) => `${p}:hover ${t}`)))
    : trigger === 'always' ? list(targets)
    : list(targets.map((t) => t + (trigger === 'focus' ? ':focus-visible' : trigger === 'active' ? ':active' : ':hover')));

  let effect = resolveVars(preset.declarations, opts);
  if (preset.id === 'background-color') effect = `background-color:${opts.bgColor};`;
  if (preset.id === 'text-color') effect = `color:${opts.textColor};`;
  if (preset.id === 'border-color') effect = `border-color:${opts.borderColor};`;
  if (preset.id === 'radius-morph') effect = `border-radius:${opts.radius}px;`;
  if (preset.id === 'multi-transform') effect = `transform:translate(${opts.translateX}px,${opts.translateY}px) rotate(${opts.rotate}deg) scale(${opts.scale});`;
  if (preset.id === 'translate-3d') effect = `transform:translate3d(${opts.translateX}px,${opts.translateY}px,0);`;
  if (preset.id === 'scale-xy') effect = `transform:scaleX(${opts.scale}) scaleY(${Math.max(.1, Number(opts.scale) * .96)});`;
  if (preset.id === 'rotate-3d') effect = `transform:perspective(${opts.perspective}px) rotate3d(1,1,0,${opts.rotate}deg);`;
  if (preset.id === 'skew') effect = `transform:skew(${opts.skew}deg,${Number(opts.skew) * -.5}deg);`;
  if (preset.id === 'skew-x') effect = `transform:skewX(${opts.skew}deg);`;
  if (preset.id === 'skew-y') effect = `transform:skewY(${opts.skew}deg);`;
  if (preset.id === 'perspective' || preset.id === 'perspective-hover') effect = `transform:perspective(${opts.perspective}px) rotateY(${opts.rotate}deg) translateY(${opts.translateY}px);`;
  if (preset.id === 'opacity') effect = `opacity:${opts.opacity};`;
  if (preset.id === 'blur-hover' || preset.id === 'image-blur') effect = `filter:blur(${opts.blur}px);`;

  const frames = customFrames.trim() || preset.frames || '';
  const isKeyframe = !!frames && (preset.kind === 'keyframe' || !!customFrames.trim());
  const blocks: string[] = [];
  const timing = `${opts.duration}ms ${opts.easing} ${opts.delay}ms`;

  if (!isKeyframe) {
    const props = splitTop(opts.transitionProperties, ',');
    blocks.push(`${list(targets)} {\n  transition:\n${(props.length ? props : ['all']).map((p) => `    ${p} ${timing}`).join(',\n')};\n}`);
    if (effect.trim()) blocks.push(`${hoverSel} {\n${fmtDecls(effect)}\n}`);
  } else {
    const kf = customFrames.trim() ? customName.replace(/[^a-z0-9_-]/gi, '_') : `p2c_${preset.id.replace(/[^a-z0-9_-]/gi, '_')}`;
    const decl = [`animation:${kf} ${timing} ${opts.iteration} ${opts.direction} ${opts.fillMode}`];
    if (opts.playState && opts.playState !== 'running') decl.push(`animation-play-state:${opts.playState}`);
    blocks.push(`${hoverSel} {\n${fmtDecls(decl.join(';'))}\n}`);
    blocks.push(`@keyframes ${kf} {\n${fmtFrames(resolveVars(frames, opts))}\n}`);
  }
  if (opts.reducedMotion) blocks.push(`@media (prefers-reduced-motion: reduce) {\n  ${list(targets).replace(/\n/g, '\n  ')} {\n    animation: none !important;\n    transition: none !important;\n  }\n}`);
  return blocks.join('\n\n') + '\n';
}

export type ColorHover = { bgOn: boolean; textOn: boolean; bg: string; text: string; whiteWithBg: boolean; duration: string; easing: string; withTransition?: boolean };

/** Hover-only background/text colour change for one class (or list of selectors). */
export function buildColorHoverCss(target: string, o: ColorHover): string {
  if (!o.bgOn && !o.textOn) return '';
  const targets = splitSelectors(target);
  const bg = safeColor(o.bg, '#4f46e5');
  // When the hover background changes, text is white unless the user chose a custom text colour.
  const text = o.textOn ? safeColor(o.text, '#ffffff') : o.bgOn && o.whiteWithBg ? '#ffffff' : '';
  const props = [o.bgOn ? 'background-color' : '', text ? 'color' : ''].filter(Boolean).map((p) => `    ${p} ${o.duration}ms ${o.easing}`).join(',\n');
  const blocks: string[] = [];
  // Skipped when the effect rule already sets `transition` on the same element (a second rule would override it).
  if (o.withTransition !== false) blocks.push(`${targets.join(',\n')} {\n  transition:\n${props};\n}`);
  const decl = [o.bgOn ? `background:${bg} !important` : '', text ? `color:${text} !important` : ''].filter(Boolean).join(';');
  blocks.push(`${targets.map((t) => t + ':hover').join(',\n')} {\n${fmtDecls(decl)}\n}`);
  if (text) blocks.push(`${targets.map((t) => t + ':hover *').join(',\n')} {\n  color: ${text} !important;\n}`);
  return blocks.join('\n\n') + '\n';
}