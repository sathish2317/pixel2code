// 3D Animation Studio engine. Pure TypeScript: no UI, no network, no extra dependencies.
// One config model drives (a) the live React Native preview and (b) every code generator,
// so "what you see" and "what you export" can never drift apart.

export type TargetKind =
  | 'button' | 'text' | 'heading' | 'image' | 'card' | 'container'
  | 'nav' | 'form' | 'modal' | 'carousel' | 'list' | 'section';

export type EasingName = 'linear' | 'ease' | 'easeIn' | 'easeOut' | 'easeInOut' | 'back' | 'elastic' | 'bounce';
export type Direction = 'normal' | 'reverse' | 'alternate';
export type Trigger = 'auto' | 'hover' | 'press' | 'scroll';
export type ExportFormat = 'react-native' | 'react' | 'html' | 'css' | 'javascript';

/** One pose of the object. Rotations in degrees, translations in px. */
export interface Pose {
  rotX: number; rotY: number; rotZ: number;
  scaleX: number; scaleY: number; scaleZ: number;
  transX: number; transY: number; transZ: number;
  opacity: number;
  /** Optional extras (older saved animations do not have them: they count as 0). Skew in degrees, blur in px. */
  skewX?: number; skewY?: number; blur?: number;
}

export interface AnimConfig {
  preset: string;
  from: Pose;
  to: Pose;
  perspective: number;
  originX: number; // 0..100 (%)
  originY: number; // 0..100 (%)
  duration: number; // ms
  delay: number; // ms
  easing: EasingName;
  repeat: number; // 0 = infinite
  direction: Direction;
  speed: number; // 0.25..3
  trigger: Trigger;
  /** ms added per sibling (auto and scroll triggers): the 2nd card starts later than the 1st, and so on. Missing = 0. */
  stagger?: number;
}

export const IDENTITY: Required<Pose> = {
  rotX: 0, rotY: 0, rotZ: 0, scaleX: 1, scaleY: 1, scaleZ: 1, transX: 0, transY: 0, transZ: 0, opacity: 1, skewX: 0, skewY: 0, blur: 0,
};
const P = (o: Partial<Pose>): Pose => ({ ...IDENTITY, ...o });

export const TARGETS: { id: TargetKind; label: string; w: number; h: number; tag: string; text: string }[] = [
  { id: 'button', label: 'Button', w: 180, h: 52, tag: 'button', text: 'Get started' },
  { id: 'text', label: 'Text', w: 260, h: 64, tag: 'p', text: 'Smooth 3D motion for any text block.' },
  { id: 'heading', label: 'Heading', w: 290, h: 60, tag: 'h1', text: 'Build in 3D' },
  { id: 'image', label: 'Image', w: 240, h: 160, tag: 'img', text: '' },
  { id: 'card', label: 'Card', w: 250, h: 170, tag: 'article', text: 'Premium card' },
  { id: 'container', label: 'Container', w: 280, h: 170, tag: 'div', text: 'Container' },
  { id: 'nav', label: 'Navigation', w: 320, h: 56, tag: 'nav', text: 'Home  Work  About  Contact' },
  { id: 'form', label: 'Form', w: 260, h: 190, tag: 'form', text: 'Sign up' },
  { id: 'modal', label: 'Modal', w: 280, h: 180, tag: 'div', text: 'Confirm action' },
  { id: 'carousel', label: 'Carousel', w: 300, h: 150, tag: 'div', text: 'Slide 1' },
  { id: 'list', label: 'List', w: 260, h: 170, tag: 'ul', text: 'List' },
  { id: 'section', label: 'Page section', w: 320, h: 180, tag: 'section', text: 'Hero section' },
];
export const targetOf = (k: TargetKind) => TARGETS.find((t) => t.id === k) ?? TARGETS[0];

export interface Preset {
  id: string; label: string; group: 'Rotate' | 'Flip & tilt' | 'Motion' | 'Entrance' | 'Interactive' | 'Attention';
  from: Pose; to: Pose; duration: number; easing: EasingName; repeat: number; direction: Direction; trigger: Trigger; perspective: number;
  originX?: number; originY?: number; keywords?: string;
}
const base = { duration: 1200, easing: 'easeInOut' as EasingName, repeat: 1, direction: 'normal' as Direction, trigger: 'auto' as Trigger, perspective: 800 };
export const PRESETS: Preset[] = [
  { ...base, id: 'rotate-x', label: 'Rotate X', group: 'Rotate', from: P({}), to: P({ rotX: 360 }), easing: 'linear', duration: 2000 },
  { ...base, id: 'rotate-y', label: 'Rotate Y', group: 'Rotate', from: P({}), to: P({ rotY: 360 }), easing: 'linear', duration: 2000 },
  { ...base, id: 'rotate-z', label: 'Rotate Z', group: 'Rotate', from: P({}), to: P({ rotZ: 360 }), easing: 'linear', duration: 2000 },
  { ...base, id: 'infinite-rotate', label: 'Infinite rotation', group: 'Rotate', from: P({}), to: P({ rotY: 360 }), easing: 'linear', duration: 4000, repeat: 0 },
  { ...base, id: 'flip', label: '3D flip', group: 'Flip & tilt', from: P({}), to: P({ rotY: 180 }), duration: 900, trigger: 'hover', keywords: 'card turn mirror' },
  { ...base, id: 'flip-loop', label: 'Flip loop', group: 'Flip & tilt', from: P({}), to: P({ rotY: 180 }), duration: 1200, direction: 'alternate', repeat: 0, keywords: 'card turn forever' },
  { ...base, id: 'flip-x', label: 'Flip X (vertical)', group: 'Flip & tilt', from: P({}), to: P({ rotX: 180 }), duration: 900, trigger: 'hover', keywords: 'card turn vertical' },
  { ...base, id: 'tilt', label: '3D card tilt', group: 'Flip & tilt', from: P({}), to: P({ rotX: 14, rotY: -18, scaleX: 1.05, scaleY: 1.05, transZ: 40 }), duration: 450, easing: 'easeOut', trigger: 'hover', perspective: 700 },
  { ...base, id: 'float', label: 'Floating', group: 'Motion', from: P({ transY: 0 }), to: P({ transY: -24, rotX: 6, rotY: -6 }), duration: 1800, direction: 'alternate', repeat: 0 },
  { ...base, id: 'perspective-zoom', label: 'Perspective zoom', group: 'Motion', from: P({ transZ: -220, opacity: 0.2 }), to: P({ transZ: 120 }), duration: 1400, easing: 'easeOut', perspective: 500 },
  { ...base, id: 'parallax', label: 'Parallax movement', group: 'Motion', from: P({ transX: -40, transY: 14, rotY: -10 }), to: P({ transX: 40, transY: -14, rotY: 10 }), duration: 2600, direction: 'alternate', repeat: 0 },
  { ...base, id: 'smooth-transition', label: 'Smooth 3D transition', group: 'Motion', from: P({ transX: -70, rotY: -35, opacity: 0.4 }), to: P({}), duration: 1000, easing: 'easeInOut' },
  { ...base, id: 'bounce', label: 'Bounce', group: 'Motion', from: P({ transY: -140 }), to: P({}), duration: 1100, easing: 'bounce' },
  { ...base, id: 'elastic', label: 'Elastic', group: 'Motion', from: P({ scaleX: 0.3, scaleY: 0.3, rotZ: -25 }), to: P({}), duration: 1300, easing: 'elastic' },
  { ...base, id: 'entrance', label: '3D entrance', group: 'Entrance', from: P({ rotX: -80, transY: 60, transZ: -80, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut' },
  { ...base, id: 'exit', label: '3D exit', group: 'Entrance', from: P({}), to: P({ rotX: 80, transY: -60, transZ: -120, scaleX: 0.85, scaleY: 0.85, opacity: 0 }), duration: 800, easing: 'easeIn' },
  { ...base, id: 'scroll-reveal', label: 'Scroll reveal', group: 'Entrance', from: P({ transY: 80, rotX: -28, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll' },
  { ...base, id: 'hover', label: 'Hover lift', group: 'Interactive', from: P({}), to: P({ transY: -10, transZ: 60, rotX: 6, scaleX: 1.06, scaleY: 1.06 }), duration: 300, easing: 'easeOut', trigger: 'hover' },
  { ...base, id: 'tilt-soft', label: 'Soft tilt', group: 'Flip & tilt', from: P({}), to: P({ rotX: 6, rotY: -8, transZ: 20 }), duration: 400, easing: 'easeOut', trigger: 'hover', perspective: 900, keywords: 'subtle gentle card' },
  { ...base, id: 'door-open', label: 'Door open', group: 'Flip & tilt', from: P({}), to: P({ rotY: -75 }), duration: 700, easing: 'easeOut', trigger: 'hover', originX: 0, originY: 50, keywords: 'hinge panel' },
  { ...base, id: 'unfold', label: 'Unfold', group: 'Entrance', from: P({ rotX: -90, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll', originX: 50, originY: 0, keywords: 'paper reveal' },
  { ...base, id: 'pop', label: 'Pop in', group: 'Entrance', from: P({ scaleX: 0.6, scaleY: 0.6, opacity: 0 }), to: P({}), duration: 600, easing: 'back', trigger: 'scroll', keywords: 'scale appear' },
  { ...base, id: 'slide-left', label: '3D slide from left', group: 'Entrance', from: P({ transX: -120, rotY: 55, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll', keywords: 'enter side' },
  { ...base, id: 'slide-right', label: '3D slide from right', group: 'Entrance', from: P({ transX: 120, rotY: -55, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll', keywords: 'enter side' },
  { ...base, id: 'drop-in', label: 'Drop in', group: 'Entrance', from: P({ transY: -120, rotX: 40, opacity: 0 }), to: P({}), duration: 1000, easing: 'bounce', trigger: 'scroll', keywords: 'fall' },
  { ...base, id: 'spin-in', label: 'Spin in', group: 'Entrance', from: P({ rotZ: -180, scaleX: 0.2, scaleY: 0.2, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll', keywords: 'rotate zoom' },
  { ...base, id: 'zoom-blur', label: 'Blur zoom in', group: 'Entrance', from: P({ scaleX: 1.25, scaleY: 1.25, blur: 12, opacity: 0 }), to: P({}), duration: 900, easing: 'easeOut', trigger: 'scroll', keywords: 'focus fade' },
  { ...base, id: 'focus', label: 'Focus on hover', group: 'Interactive', from: P({ blur: 5, opacity: 0.7, scaleX: 0.97, scaleY: 0.97 }), to: P({}), duration: 350, easing: 'easeOut', trigger: 'hover', keywords: 'blur sharpen' },
  { ...base, id: 'depth-push', label: 'Push back', group: 'Interactive', from: P({}), to: P({ transZ: -80, scaleX: 0.97, scaleY: 0.97, opacity: 0.85 }), duration: 300, easing: 'easeOut', trigger: 'hover', perspective: 600, keywords: 'press away depth' },
  { ...base, id: 'spotlight', label: 'Spotlight lift', group: 'Interactive', from: P({}), to: P({ transZ: 110, transY: -8, rotX: 4, scaleX: 1.08, scaleY: 1.08 }), duration: 350, easing: 'easeOut', trigger: 'hover', perspective: 600, keywords: 'grow card zoom' },
  { ...base, id: 'skew-slide', label: 'Skew slide', group: 'Interactive', from: P({}), to: P({ skewX: -8, transX: 10 }), duration: 260, easing: 'easeOut', trigger: 'hover', keywords: 'button italic' },
  { ...base, id: 'swing', label: 'Swing', group: 'Attention', from: P({ rotZ: -10 }), to: P({ rotZ: 10 }), duration: 1400, easing: 'easeInOut', direction: 'alternate', repeat: 0, originX: 50, originY: 0, keywords: 'pendulum hang' },
  { ...base, id: 'pulse', label: 'Pulse', group: 'Attention', from: P({}), to: P({ scaleX: 1.07, scaleY: 1.07 }), duration: 900, easing: 'easeInOut', direction: 'alternate', repeat: 0, keywords: 'heartbeat beat grow' },
  { ...base, id: 'wobble', label: 'Wobble', group: 'Attention', from: P({ skewX: -5, rotZ: -2 }), to: P({ skewX: 5, rotZ: 2 }), duration: 700, easing: 'easeInOut', direction: 'alternate', repeat: 0, keywords: 'jelly shake' },
  { ...base, id: 'shake-3d', label: '3D shake', group: 'Attention', from: P({ rotY: -12, transX: -6 }), to: P({ rotY: 12, transX: 6 }), duration: 180, easing: 'linear', direction: 'alternate', repeat: 6, keywords: 'error nope no' },
  { ...base, id: 'orbit', label: 'Orbit tilt', group: 'Attention', from: P({ rotX: 12, rotY: -12 }), to: P({ rotX: -12, rotY: 12 }), duration: 2400, easing: 'easeInOut', direction: 'alternate', repeat: 0, perspective: 900, keywords: 'float card showcase' },
  { ...base, id: 'press', label: 'Press down', group: 'Interactive', from: P({}), to: P({ scaleX: 0.94, scaleY: 0.94, rotX: 10, transZ: -30 }), duration: 160, easing: 'easeOut', trigger: 'press' },
];
export const presetOf = (id: string) => PRESETS.find((p) => p.id === id) ?? PRESETS[0];

export function configFromPreset(id: string): AnimConfig {
  const p = presetOf(id);
  return {
    preset: p.id, from: { ...p.from }, to: { ...p.to }, perspective: p.perspective,
    originX: p.originX ?? 50, originY: p.originY ?? 50, duration: p.duration, delay: 0, easing: p.easing,
    repeat: p.repeat, direction: p.direction, speed: 1, trigger: p.trigger, stagger: 0,
  };
}

export const EASINGS: EasingName[] = ['linear', 'ease', 'easeIn', 'easeOut', 'easeInOut', 'back', 'elastic', 'bounce'];
export const DIRECTIONS: Direction[] = ['normal', 'reverse', 'alternate'];
export const TRIGGERS: Trigger[] = ['auto', 'hover', 'press', 'scroll'];
export const FORMATS: { id: ExportFormat; label: string; file: string }[] = [
  { id: 'react-native', label: 'React Native', file: 'Animated3D.tsx' },
  { id: 'react', label: 'React', file: 'Animated3D.jsx' },
  { id: 'html', label: 'HTML', file: 'animation3d.html' },
  { id: 'css', label: 'CSS', file: 'animation3d.css' },
  { id: 'javascript', label: 'JavaScript', file: 'animation3d.js' },
];

// ---------------------------------------------------------------------------------------------
// Numeric helpers (shared by preview and tests)
// ---------------------------------------------------------------------------------------------
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const r = (n: number, d = 3) => Math.round(n * 10 ** d) / 10 ** d;

/** Sanitise any user-entered value so a bad number can never reach the transform. */
export function sanitize(c: AnimConfig): AnimConfig {
  const fix = (p: Pose): Pose => {
    const o = { ...p } as Pose;
    (Object.keys(o) as (keyof Pose)[]).forEach((k) => { if (!Number.isFinite(o[k])) o[k] = IDENTITY[k]; });
    o.scaleX = clamp(o.scaleX, 0.05, 6); o.scaleY = clamp(o.scaleY, 0.05, 6); o.scaleZ = clamp(o.scaleZ, 0.05, 6);
    o.opacity = clamp(o.opacity, 0, 1);
    o.skewX = clamp(o.skewX ?? 0, -80, 80); o.skewY = clamp(o.skewY ?? 0, -80, 80); o.blur = clamp(o.blur ?? 0, 0, 40);
    return o;
  };
  return {
    ...c, from: fix(c.from), to: fix(c.to),
    perspective: clamp(Number.isFinite(c.perspective) ? c.perspective : 800, 100, 3000),
    originX: clamp(Number.isFinite(c.originX) ? c.originX : 50, 0, 100), originY: clamp(Number.isFinite(c.originY) ? c.originY : 50, 0, 100),
    stagger: clamp(Number.isFinite(c.stagger as number) ? (c.stagger as number) : 0, 0, 1000),
    duration: clamp(Number.isFinite(c.duration) ? c.duration : 1000, 50, 20000),
    delay: clamp(Number.isFinite(c.delay) ? c.delay : 0, 0, 10000),
    repeat: Math.max(0, Math.floor(Number.isFinite(c.repeat) ? c.repeat : 1)),
    speed: clamp(Number.isFinite(c.speed) ? c.speed : 1, 0.25, 3),
  };
}

/** React Native has no translateZ / scaleZ, so depth is emulated with a perspective scale. */
export function depthScale(z: number, scaleZ: number, perspective: number): number {
  const d = clamp(z * scaleZ, -perspective * 0.9, perspective * 0.8);
  return perspective / (perspective - d);
}

export function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  (Object.keys(IDENTITY) as (keyof Pose)[]).forEach((k) => { const x = a[k] ?? IDENTITY[k]!; const y = b[k] ?? IDENTITY[k]!; o[k] = x + (y - x) * t; });
  return o;
}

export const effectiveDuration = (c: AnimConfig) => Math.max(50, c.duration / Math.max(0.1, c.speed));
export function totalDuration(c: AnimConfig): number {
  const one = effectiveDuration(c) * (c.direction === 'alternate' ? 2 : 1);
  return c.delay + one * (c.repeat === 0 ? 1 : c.repeat);
}

// ---------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------
const CSS_EASE: Record<EasingName, string> = {
  linear: 'linear', ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out',
  back: 'cubic-bezier(.34,1.56,.64,1)', elastic: 'cubic-bezier(.68,-.6,.32,1.6)', bounce: 'cubic-bezier(.3,1.4,.5,1)',
};
export const cssEasing = (e: EasingName) => CSS_EASE[e];

export function cssTransform(p: Pose, perspective: number): string {
  const skew = (p.skewX || p.skewY) ? ` skew(${r(p.skewX ?? 0)}deg, ${r(p.skewY ?? 0)}deg)` : '';
  return `perspective(${r(perspective, 0)}px) translate3d(${r(p.transX)}px, ${r(p.transY)}px, ${r(p.transZ)}px) rotateX(${r(p.rotX)}deg) rotateY(${r(p.rotY)}deg) rotateZ(${r(p.rotZ)}deg)${skew} scale3d(${r(p.scaleX)}, ${r(p.scaleY)}, ${r(p.scaleZ)})`;
}

/** CSS filter for a pose (blur only). It is written whenever either pose blurs, so the blur can animate between the two poses. */
export const cssFilter = (p: Pose) => `blur(${r(p.blur ?? 0)}px)`;
export const usesBlur = (c: AnimConfig) => (c.from.blur ?? 0) > 0 || (c.to.blur ?? 0) > 0;

const slug = (c: AnimConfig, kind: TargetKind) => `p2c-${c.preset}-${kind}`;

export function buildCss(input: AnimConfig, kind: TargetKind): string {
  const c = sanitize(input); const cls = slug(c, kind); const t = targetOf(kind);
  const dur = r(effectiveDuration(c) / 1000, 3);
  const common = `.${cls} {\n  width: ${t.w}px;\n  max-width: 100%;\n  min-height: ${t.h}px;\n  transform-origin: ${r(c.originX, 1)}% ${r(c.originY, 1)}%;\n  transform-style: preserve-3d;\n  backface-visibility: visible;\n  will-change: transform, opacity;`;
  const reduced = `@media (prefers-reduced-motion: reduce) {\n  .${cls} { animation: none !important; transition: none !important; }\n}`;
  if (c.trigger === 'hover' || c.trigger === 'press') {
    const pseudo = c.trigger === 'hover' ? ':hover' : ':active';
    return `${common}\n  transform: ${cssTransform(c.from, c.perspective)};\n  opacity: ${r(c.from.opacity)};\n  transition: transform ${dur}s ${cssEasing(c.easing)} ${r(c.delay / 1000)}s, opacity ${dur}s ${cssEasing(c.easing)} ${r(c.delay / 1000)}s;\n}\n\n.${cls}${pseudo} {\n  transform: ${cssTransform(c.to, c.perspective)};\n  opacity: ${r(c.to.opacity)};\n}\n\n${reduced}\n`;
  }
  const iter = c.repeat === 0 ? 'infinite' : String(c.repeat);
  const kf = `@keyframes ${cls}-kf {\n  from { transform: ${cssTransform(c.from, c.perspective)}; opacity: ${r(c.from.opacity)}; }\n  to { transform: ${cssTransform(c.to, c.perspective)}; opacity: ${r(c.to.opacity)}; }\n}`;
  const anim = `  animation: ${cls}-kf ${dur}s ${cssEasing(c.easing)} ${r(c.delay / 1000)}s ${iter} ${c.direction} both;`;
  const scroll = c.trigger === 'scroll'
    ? `\n\n@supports (animation-timeline: view()) {\n  .${cls} {\n    animation-timeline: view();\n    animation-range: entry 0% entry 80%;\n    animation-duration: auto;\n  }\n}`
    : '';
  return `${kf}\n\n${common}\n${anim}\n}${scroll}\n\n${reduced}\n`;
}

// ---------------------------------------------------------------------------------------------
// Markup
// ---------------------------------------------------------------------------------------------
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function htmlFor(kind: TargetKind, cls: string, indent = ''): string {
  const t = targetOf(kind); const x = esc(t.text);
  switch (kind) {
    case 'button': return `${indent}<button type="button" class="${cls}">${x}</button>`;
    case 'text': return `${indent}<p class="${cls}">${x}</p>`;
    case 'heading': return `${indent}<h1 class="${cls}">${x}</h1>`;
    case 'image': return `${indent}<img class="${cls}" src="your-image.jpg" alt="Describe the image">`;
    case 'card': return `${indent}<article class="${cls}">\n${indent}  <h3>${x}</h3>\n${indent}  <p>Short supporting description.</p>\n${indent}</article>`;
    case 'container': return `${indent}<div class="${cls}">${x}</div>`;
    case 'nav': return `${indent}<nav class="${cls}">\n${indent}  <a href="#">Home</a>\n${indent}  <a href="#">Work</a>\n${indent}  <a href="#">About</a>\n${indent}  <a href="#">Contact</a>\n${indent}</nav>`;
    case 'form': return `${indent}<form class="${cls}">\n${indent}  <label>Name <input name="name" required></label>\n${indent}  <label>Email <input name="email" type="email" required></label>\n${indent}  <button type="submit">${x}</button>\n${indent}</form>`;
    case 'modal': return `${indent}<div class="${cls}" role="dialog" aria-modal="true" aria-label="${x}">\n${indent}  <h2>${x}</h2>\n${indent}  <button type="button">OK</button>\n${indent}</div>`;
    case 'carousel': return `${indent}<div class="${cls}" aria-roledescription="carousel">\n${indent}  <div class="slide">Slide 1</div>\n${indent}  <div class="slide">Slide 2</div>\n${indent}  <div class="slide">Slide 3</div>\n${indent}</div>`;
    case 'list': return `${indent}<ul class="${cls}">\n${indent}  <li>First item</li>\n${indent}  <li>Second item</li>\n${indent}  <li>Third item</li>\n${indent}</ul>`;
    case 'section': return `${indent}<section class="${cls}">\n${indent}  <h2>${x}</h2>\n${indent}  <p>Your page section content.</p>\n${indent}</section>`;
  }
}

// ---------------------------------------------------------------------------------------------
// JavaScript (Web Animations API)
// ---------------------------------------------------------------------------------------------
export function buildJs(input: AnimConfig, kind: TargetKind): string {
  const c = sanitize(input); const cls = slug(c, kind);
  const dur = Math.round(effectiveDuration(c));
  const frames = `[\n  { transform: '${cssTransform(c.from, c.perspective)}', opacity: ${r(c.from.opacity)} },\n  { transform: '${cssTransform(c.to, c.perspective)}', opacity: ${r(c.to.opacity)} },\n]`;
  const head = `// Reusable 3D animation (${c.preset} on ${kind}). Uses the Web Animations API, no libraries.\nconst el = document.querySelector('.${cls}');\nif (el) {\n  el.style.transformOrigin = '${r(c.originX, 1)}% ${r(c.originY, 1)}%';\n  el.style.transformStyle = 'preserve-3d';\n  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;\n  const frames = ${frames.replace(/\n/g, '\n  ')};\n`;
  const opts = `{ duration: ${dur}, delay: ${Math.round(c.delay)}, iterations: ${c.repeat === 0 ? 'Infinity' : c.repeat}, direction: '${c.direction}', easing: '${cssEasing(c.easing)}', fill: 'both' }`;
  if (c.trigger === 'hover' || c.trigger === 'press') {
    const [on, off] = c.trigger === 'hover' ? ['pointerenter', 'pointerleave'] : ['pointerdown', 'pointerup'];
    return `${head}  const anim = el.animate(frames, { duration: ${dur}, easing: '${cssEasing(c.easing)}', fill: 'both' });\n  anim.pause();\n  anim.currentTime = 0;\n  if (!reduce) {\n    el.addEventListener('${on}', () => { anim.playbackRate = 1; anim.play(); });\n    el.addEventListener('${off}', () => { anim.playbackRate = -1; anim.play(); });\n    el.addEventListener('pointercancel', () => { anim.playbackRate = -1; anim.play(); });\n  }\n}\n`;
  }
  if (c.trigger === 'scroll') {
    return `${head}  const anim = el.animate(frames, ${opts});\n  anim.pause();\n  if (reduce) { anim.finish(); } else {\n    const io = new IntersectionObserver((entries) => {\n      entries.forEach((e) => { if (e.isIntersecting) { anim.play(); io.disconnect(); } });\n    }, { threshold: 0.25 });\n    io.observe(el);\n  }\n}\n`;
  }
  return `${head}  const anim = el.animate(frames, ${opts});\n  if (reduce) anim.finish();\n}\n`;
}

// ---------------------------------------------------------------------------------------------
// HTML / React
// ---------------------------------------------------------------------------------------------
export function buildHtml(c: AnimConfig, kind: TargetKind): string {
  const cls = slug(c, kind);
  return `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>3D animation: ${esc(c.preset)}</title>\n<style>\n  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0f1220; color: #eef0fa; font-family: system-ui, sans-serif; }\n  .stage { padding: 48px; }\n  .${cls} { background: #6c8cff; color: #fff; border: 0; border-radius: 14px; padding: 14px 18px; box-sizing: border-box; }\n${buildCss(c, kind).split('\n').map((l) => (l ? '  ' + l : l)).join('\n')}</style>\n</head>\n<body>\n  <div class="stage">\n${htmlFor(kind, cls, '    ')}\n  </div>\n  <script>\n${buildJsPlain(c, kind)}  </script>\n</body>\n</html>\n`;
}

// HTML export relies on pure CSS for auto/scroll triggers; hover/press are pure CSS too, so no script is needed.
function buildJsPlain(_c: AnimConfig, _kind: TargetKind): string {
  return '    // Pure CSS animation: no JavaScript required.\n';
}

export function buildReact(input: AnimConfig, kind: TargetKind): string {
  const c = sanitize(input); const cls = slug(c, kind); const name = 'Animated3D' + targetOf(kind).label.replace(/[^A-Za-z]/g, '');
  const jsx = htmlFor(kind, cls, '      ').replace(/\bclass=/g, 'className=').replace(/\bfor=/g, 'htmlFor=')
    .replace(/<img ([^>]*?)>/g, '<img $1 />').replace(/<input ([^>]*?)>/g, '<input $1 />');
  const css = buildCss(c, kind).replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
  return `import React from 'react';\n\n// Reusable 3D animation: ${c.preset} on ${kind}. Drop <${name} /> anywhere in your React app.\nconst CSS = \`\n.${cls} { background: #6c8cff; color: #fff; border: 0; border-radius: 14px; padding: 14px 18px; box-sizing: border-box; }\n${css}\`;\n\nexport default function ${name}() {\n  return (\n    <>\n      <style>{CSS}</style>\n${jsx}\n    </>\n  );\n}\n`;
}

// ---------------------------------------------------------------------------------------------
// React Native
// ---------------------------------------------------------------------------------------------
const RN_EASE: Record<EasingName, string> = {
  linear: 'Easing.linear', ease: 'Easing.ease', easeIn: 'Easing.in(Easing.cubic)', easeOut: 'Easing.out(Easing.cubic)',
  easeInOut: 'Easing.inOut(Easing.cubic)', back: 'Easing.out(Easing.back(1.7))', elastic: 'Easing.elastic(1.4)', bounce: 'Easing.bounce',
};
export const rnEasingExpr = (e: EasingName) => RN_EASE[e];

export function buildReactNative(input: AnimConfig, kind: TargetKind): string {
  const c = sanitize(input); const t = targetOf(kind);
  const name = 'Animated3D' + t.label.replace(/[^A-Za-z]/g, '');
  const dur = Math.round(effectiveDuration(c));
  const zs0 = r(depthScale(c.from.transZ, c.from.scaleZ, c.perspective)); const zs1 = r(depthScale(c.to.transZ, c.to.scaleZ, c.perspective));
  const ox = r(((c.originX - 50) / 100) * t.w, 1); const oy = r(((c.originY - 50) / 100) * t.h, 1);
  const iv = (a: number, b: number, unit = '') => `p.interpolate({ inputRange: [0, 1], outputRange: [${unit ? `'${r(a)}${unit}', '${r(b)}${unit}'` : `${r(a)}, ${r(b)}`}] })`;
  const interactive = c.trigger === 'hover' || c.trigger === 'press';
  const iters = c.repeat === 0 ? -1 : c.repeat;
  const timing = (to: number, d = dur) => `Animated.timing(p, { toValue: ${to}, duration: ${d}, easing: ${rnEasingExpr(c.easing)}, useNativeDriver: false })`;
  let runner: string;
  if (interactive) runner = '';
  else {
    const start = c.direction === 'reverse' ? 1 : 0;
    const leg = c.direction === 'reverse' ? timing(0) : timing(1);
    const body = c.direction === 'alternate' ? `Animated.sequence([${timing(1)}, ${timing(0)}])` : leg;
    runner = `  useEffect(() => {\n    p.setValue(${start});\n    const run = Animated.sequence([\n      Animated.delay(${Math.round(c.delay)}),\n      Animated.loop(${body}, { iterations: ${iters} }),\n    ]);\n    run.start();\n    return () => run.stop();\n  }, [p]);\n`;
  }
  const pressHandlers = interactive
    ? `      ${c.trigger === 'hover' ? 'onHoverIn' : 'onPressIn'}={() => ${timing(1)}.start()}\n      ${c.trigger === 'hover' ? 'onHoverOut' : 'onPressOut'}={() => ${timing(0)}.start()}\n`
    : '';
  const hint = interactive ? `  // ${c.trigger === 'hover' ? 'Hover works on web / pointer devices; ' : ''}press and release animate between the two poses.\n` : '';
  const inner = kind === 'image' ? '' : `<Text style={styles.label}>${t.text.replace(/'/g, "\\'")}</Text>`;
  const body = `<Animated.View style={[styles.box, { opacity, transform }]}>${inner}</Animated.View>`;
  return `import React, { useEffect, useRef } from 'react';\nimport { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';\n\n// Reusable 3D animation: ${c.preset} on ${kind}.\n// React Native has no translateZ/scaleZ, so depth is emulated with a perspective scale\n// and transform-origin is emulated with offset translations (works on every RN version).\nexport default function ${name}() {\n  const p = useRef(new Animated.Value(0)).current;\n${hint}${runner}\n  const opacity = ${iv(c.from.opacity, c.to.opacity)};\n  const transform = [\n    { perspective: ${r(c.perspective, 0)} },\n    { translateX: ${iv(c.from.transX, c.to.transX)} },\n    { translateY: ${iv(c.from.transY, c.to.transY)} },\n    { translateX: ${ox} },\n    { translateY: ${oy} },\n    { rotateX: ${iv(c.from.rotX, c.to.rotX, 'deg')} },\n    { rotateY: ${iv(c.from.rotY, c.to.rotY, 'deg')} },\n    { rotateZ: ${iv(c.from.rotZ, c.to.rotZ, 'deg')} },\n    { scaleX: ${iv(c.from.scaleX * zs0, c.to.scaleX * zs1)} },\n    { scaleY: ${iv(c.from.scaleY * zs0, c.to.scaleY * zs1)} },\n    { translateX: ${r(-ox, 1)} },\n    { translateY: ${r(-oy, 1)} },\n  ];\n\n  return (\n    <Pressable\n${pressHandlers}    >\n      ${body}\n    </Pressable>\n  );\n}\n\nconst styles = StyleSheet.create({\n  box: { width: ${t.w}, height: ${t.h}, borderRadius: 14, backgroundColor: '#6c8cff', alignItems: 'center', justifyContent: 'center' },\n  label: { color: '#ffffff', fontWeight: '700' },\n});\n`;
}

export function generateCode(format: ExportFormat, cfg: AnimConfig, kind: TargetKind): string {
  const c = sanitize(cfg);
  switch (format) {
    case 'react-native': return buildReactNative(c, kind);
    case 'react': return buildReact(c, kind);
    case 'html': return buildHtml(c, kind);
    case 'css': return buildCss(c, kind);
    case 'javascript': return buildJs(c, kind);
  }
}

export const FORMAT_NOTES: Record<ExportFormat, string> = {
  'react-native': 'Animated API with perspective. translateZ/scaleZ are emulated (React Native has no true Z axis).',
  react: 'Function component with an inline <style> block. Real CSS 3D transforms.',
  html: 'Standalone page, pure CSS 3D animation, no JavaScript.',
  css: 'Keyframes + class. Add the class to any element. Honors prefers-reduced-motion.',
  javascript: 'Web Animations API. Pair with the CSS class name shown in the code.',
};

// ---------------------------------------------------------------------------------------------
// Selector based animation for real HTML blocks (Code Blocks style output)
// Hover-first: by default nothing moves until the visitor hovers (or presses / scrolls to) the element.
// ---------------------------------------------------------------------------------------------
export const validSelector = (s: string) => /^[.#A-Za-z0-9_\-\s>]+$/.test(s.trim()) && s.trim().length > 0 && s.length < 160;

const isIdentity = (p: Pose) => (Object.keys(IDENTITY) as (keyof Pose)[]).every((k) => Math.abs((p[k] ?? IDENTITY[k]!) - IDENTITY[k]!) < 1e-6);
const maxTurn = (a: Pose, b: Pose) => Math.max(Math.abs(a.rotX - b.rotX), Math.abs(a.rotY - b.rotY), Math.abs(a.rotZ - b.rotZ));

/**
 * true when hover / press can simply transition from the resting pose to the end pose and back (no loop, no full turn).
 * The resting pose is the START pose, so presets such as "Focus on hover" (blurred at rest, sharp on hover) work too.
 */
export function hoverUsesTransition(c: AnimConfig): boolean {
  return c.repeat === 1 && c.direction === 'normal' && maxTurn(c.from, c.to) < 360;
}

export interface AnimRule { selector: string; cfg: AnimConfig; key: string }

const MAX_STAGGER_SIBLINGS = 10;

export function buildRuleCss(input: AnimConfig, selector: string, key: string): { css: string; js: string } {
  const c = sanitize(input); const S = selector.trim();
  const dur = r(effectiveDuration(c) / 1000); const delay = r(c.delay / 1000); const ease = cssEasing(c.easing);
  const iter = c.repeat === 0 ? 'infinite' : String(c.repeat);
  const blur = usesBlur(c);
  const origin = `transform-origin: ${r(c.originX, 1)}% ${r(c.originY, 1)}%; transform-style: preserve-3d; backface-visibility: visible; will-change: transform, opacity${blur ? ', filter' : ''};`;
  const fromT = cssTransform(c.from, c.perspective); const toT = cssTransform(c.to, c.perspective);
  const decl = (p: Pose, imp: boolean) => {
    const I = imp ? ' !important' : '';
    return `transform: ${cssTransform(p, c.perspective)}${I}; opacity: ${r(p.opacity)}${I};${blur ? ` filter: ${cssFilter(p)}${I};` : ''}`;
  };
  const frame = (p: Pose) => `transform: ${cssTransform(p, c.perspective)}; opacity: ${r(p.opacity)};${blur ? ` filter: ${cssFilter(p)};` : ''}`;
  const kf = `@keyframes ${key} {\n  from { ${frame(c.from)} }\n  to { ${frame(c.to)} }\n}`;
  const run = `animation: ${key} ${dur}s ${ease} ${delay}s ${iter} ${c.direction} both !important;`;
  const pose = decl(c.to, true);
  const reduce = `@media (prefers-reduced-motion: reduce) {\n  ${S}, ${S}:hover, ${S}:active, ${S}.${key}-on, ${S}.${key}-in { animation: none !important; transition: none !important; transform: none !important; opacity: 1 !important;${blur ? ' filter: none !important;' : ''} }\n}`;
  const head = `/* 3D animation: ${c.preset} on ${S} (${c.trigger}) */`;
  const stagger = Math.round(c.stagger ?? 0);
  const staggerRules = (prefix: string, suffix: string) => {
    if (stagger <= 0) return '';
    const out: string[] = [];
    for (let k = 2; k <= MAX_STAGGER_SIBLINGS; k++) out.push(`${prefix}${S}:nth-child(${k})${suffix} { animation-delay: ${r((c.delay + (k - 1) * stagger) / 1000)}s !important; }`);
    return out.join('\n') + '\n';
  };

  if (c.trigger === 'auto') return { css: `${head}\n${kf}\n${S} {\n  ${origin}\n  ${run}\n}\n${staggerRules('', '')}${reduce}\n`, js: '' };

  if (c.trigger === 'scroll') {
    const css = `${head}\n${kf}\n.p2c3d-js ${S} {\n  ${origin}\n  ${frame(c.from)}\n}\n.p2c3d-js ${S}.${key}-in {\n  ${run}\n}\n${staggerRules('.p2c3d-js ', `.${key}-in`)}${reduce}\n`;
    const js = `(function () {\n  var els = document.querySelectorAll('${S}');\n  if (!('IntersectionObserver' in window) || !els.length) return;\n  document.documentElement.classList.add('p2c3d-js');\n  var io = new IntersectionObserver(function (entries) {\n    entries.forEach(function (e) {\n      if (e.isIntersecting) { e.target.classList.add('${key}-in'); io.unobserve(e.target); }\n    });\n  }, { threshold: 0.2 });\n  els.forEach(function (el) { io.observe(el); });\n})();`;
    return { css, js };
  }

  const press = c.trigger === 'press';
  const state = press ? `${S}:active` : `${S}:hover`;
  const useT = hoverUsesTransition(c);
  const active = useT ? pose : run;
  // the resting pose is the start pose; it only has to be written when it differs from the element's natural look
  const rest = useT && (!isIdentity(c.from) || blur) ? `\n  ${decl(c.from, true)}` : '';
  const base = useT
    ? `${S} {\n  ${origin}${rest}\n  transition: transform ${dur}s ${ease} ${delay}s, opacity ${dur}s ${ease} ${delay}s${blur ? `, filter ${dur}s ${ease} ${delay}s` : ''} !important;\n}`
    : `${S} {\n  ${origin}\n}`;
  // plain :hover (no "(hover: hover)" media query): the effect starts the instant the pointer touches the element, like the Code blocks screen
  const rules = `${state}, ${S}.${key}-on {\n  ${active}\n}`;
  return { css: `${head}\n${useT ? '' : kf + '\n'}${base}\n${rules}\n${reduce}\n`, js: '' };
}

export function buildRuleBundle(rules: AnimRule[]): { css: string; js: string } {
  const parts = rules.map((x) => buildRuleCss(x.cfg, x.selector, x.key));
  return { css: parts.map((p) => p.css).join('\n'), js: parts.map((p) => p.js).filter(Boolean).join('\n') };
}

// ---------------------------------------------------------------------------------------------
// Pro helpers used by the studio screen (pure, so they are unit-tested)
// ---------------------------------------------------------------------------------------------

/** Swap the start and end pose ("play it backwards"). */
export const swapPoses = (c: AnimConfig): AnimConfig => ({ ...c, from: { ...c.to }, to: { ...c.from } });

/** Mirror left <-> right: Y rotation, Z rotation, X move, X skew and the X origin change sign. */
export function mirrorConfig(c: AnimConfig): AnimConfig {
  const m = (p: Pose): Pose => ({ ...p, rotY: -p.rotY || 0, rotZ: -p.rotZ || 0, transX: -p.transX || 0, skewX: -(p.skewX ?? 0) || 0 });
  return { ...c, from: m(c.from), to: m(c.to), originX: 100 - c.originX };
}

/** Make the motion weaker (<1) or stronger (>1): the end pose moves k times as far away from the start pose. */
export function scaleIntensity(c: AnimConfig, k: number): AnimConfig {
  return sanitize({ ...c, to: lerpPose(c.from, c.to, clamp(k, 0, 3)) });
}

/** Plain-language advice shown under the sliders. Empty list = nothing to worry about. */
export function warningsFor(input: AnimConfig): string[] {
  const c = sanitize(input); const out: string[] = [];
  const interactive = c.trigger === 'hover' || c.trigger === 'press';
  if (interactive && hoverUsesTransition(c) && c.from.opacity < 0.3) out.push('The element is almost invisible until the visitor hovers or presses it.');
  if (interactive && c.delay > 1500) out.push('A long delay on hover feels laggy. Try under 500 ms.');
  if (c.trigger === 'auto' && c.repeat === 0 && effectiveDuration(c) < 350) out.push('A very fast endless loop can be uncomfortable to look at. Slow it down.');
  if (Math.max(c.from.scaleX, c.from.scaleY, c.to.scaleX, c.to.scaleY) > 2.2) out.push('Scale above 2.2× can cover the neighbouring content.');
  if (Math.max(c.from.transZ, c.to.transZ) >= c.perspective * 0.85) out.push('Depth (Translate Z) is close to the Perspective value, so the element can vanish or look huge. Raise Perspective or lower Z.');
  if (c.trigger === 'scroll' && c.to.opacity < 0.5) out.push('Scroll animations normally end fully visible (Opacity 1 on the End pose).');
  return out;
}

/** Search the preset list by name, id, group or keywords. `group` = 'All' for every group. */
export function searchPresets(query: string, group = 'All', list: Preset[] = PRESETS): Preset[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return list.filter((p) => (group === 'All' || p.group === group)
    && words.every((w) => `${p.label} ${p.id} ${p.group} ${p.keywords ?? ''} ${p.trigger}`.toLowerCase().includes(w)));
}

/**
 * Preview-only helper. Mouse (enter / leave) and touch (press and hold) both switch the "-on" class of hover and press
 * animations, so the effect starts instantly on every device, also on phones and touch laptops that have no real hover.
 * Never part of the exported code (the exported CSS uses plain :hover / :active).
 */
export function touchPreviewJs(rules: AnimRule[]): string {
  const list = rules.filter((x) => x.cfg.trigger === 'hover' || x.cfg.trigger === 'press')
    .map((x) => `[${JSON.stringify(x.selector.trim())},${JSON.stringify(x.key + '-on')},${x.cfg.trigger === 'hover' ? 1 : 0}]`).join(',');
  return `(function(){var L=[${list}];L.forEach(function(p){document.querySelectorAll(p[0]).forEach(function(el){var t;function on(){clearTimeout(t);el.classList.add(p[1]);}function off(d){clearTimeout(t);t=setTimeout(function(){el.classList.remove(p[1]);},d);}el.addEventListener('touchstart',on,{passive:true});el.addEventListener('touchend',function(){off(700);},{passive:true});el.addEventListener('touchcancel',function(){off(0);},{passive:true});if(p[2]){el.addEventListener('mouseenter',on);el.addEventListener('mouseleave',function(){off(0);});}});});})();`;
}

/** Turn "Infinity" on (repeat forever, ping-pong so the loop is smooth) or off (play once, straight). */
export function withInfinity(c: AnimConfig, on: boolean): AnimConfig {
  return on
    ? { ...c, repeat: 0, direction: c.direction === 'normal' ? 'alternate' : c.direction }
    : { ...c, repeat: 1, direction: 'normal' };
}
export const isInfinite = (c: AnimConfig) => c.repeat === 0;