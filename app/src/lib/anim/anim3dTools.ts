// Helpers for the 3D Animation Studio screen. Pure TypeScript (no React, no network) so they are unit-testable.
//  - rootSelector / classesOf : find the elements of a block
//  - resolvePick              : turn a click in the live preview into "block + element"
//  - demoPlayJs               : makes hover / press / scroll animations play WITHOUT a mouse (Play button)
//  - triggerForPreset         : keeps the trigger the user chose when they switch presets
import { AnimConfig, AnimRule, Trigger, effectiveDuration, totalDuration } from './anim3d';

const CLASS_OK = /^[A-Za-z_][\w-]*$/;

/** Selector of the outermost element of a block's HTML (class first, then id, then tag). */
export function rootSelector(html: string): string {
  const m = html.match(/<([a-zA-Z][\w-]*)\b([^>]*)>/);
  if (!m) return '';
  const cls = (m[2].match(/class="([^"]+)"/) || [])[1];
  const first = cls ? cls.split(/\s+/).find((x) => CLASS_OK.test(x)) : '';
  if (first) return '.' + first;
  const id = (m[2].match(/\sid="([A-Za-z][\w-]*)"/) || [])[1];
  return id ? '#' + id : m[1].toLowerCase();
}

/** Every usable class name inside a block (state classes such as is-open are skipped). */
export function classesOf(html: string, limit = 40): string[] {
  const out: string[] = [];
  html.replace(/class="([^"]+)"/g, (_m, c: string) => {
    c.split(/\s+/).forEach((x) => { if (CLASS_OK.test(x) && !/^is-/.test(x) && !out.includes(x)) out.push(x); });
    return '';
  });
  return out.slice(0, limit);
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const htmlHasClass = (html: string, cls: string) =>
  new RegExp(`class="([^"]*\\s)?${escRe(cls)}(\\s[^"]*)?"`).test(html);

export interface PickResult { blockPid: string; /** class name without the dot, '' = whole block */ target: string }

/**
 * The live preview reports a path like "body > section.bk-hero > div.bk-hero__text > h1.bk-hero__title".
 * Walk it from the clicked element up to the first class that belongs to one of the placed blocks.
 */
export function resolvePick(path: string, placed: { id: string; html: string }[]): PickResult | null {
  const segments = path.split('>').map((s) => s.trim()).filter(Boolean).reverse();
  for (const seg of segments) {
    const classes = seg.split('.').slice(1).map((c) => c.replace(/\\/g, '').replace(/:.*$/, '')).filter((c) => CLASS_OK.test(c) && !/^is-/.test(c));
    for (const c of classes) {
      for (const p of placed) {
        if (!htmlHasClass(p.html, c)) continue;
        return { blockPid: p.id, target: '.' + c === rootSelector(p.html) ? '' : c };
      }
    }
  }
  return null;
}

/**
 * Switching preset keeps the trigger the person chose on purpose. Without a manual choice the preset decides:
 * its own trigger when it has one (press, scroll, hover) and "hover" for everything that would otherwise loop by itself.
 */
export function triggerForPreset(presetTrigger: Trigger, chosen: Trigger | null): Trigger {
  if (chosen) return chosen;
  return presetTrigger === 'auto' ? 'hover' : presetTrigger;
}

/** How long a demo should hold the "on" state, in ms. Infinite loops are shown for a few seconds only. */
export function demoHoldMs(cfg: AnimConfig): number {
  if (cfg.repeat === 0) return 3200;
  const t = totalDuration(cfg) + 700;
  return Math.round(Math.min(9000, Math.max(1400, t)));
}

/**
 * Script injected into the PREVIEW only (never into exported code). A phone or a trackpad cannot hover, so after load
 * it switches every hover / press / scroll animation on for a moment and then off again. "focus" = key of the rule
 * whose element is scrolled into view first.
 */
export function demoPlayJs(rules: AnimRule[], focus?: string): string {
  const list = rules
    .filter((x) => x.cfg.trigger !== 'auto')
    .map((x) => {
      const cls = x.cfg.trigger === 'scroll' ? `${x.key}-in` : `${x.key}-on`;
      return `[${JSON.stringify(x.selector.trim())},${JSON.stringify(cls)},${demoHoldMs(x.cfg)},${JSON.stringify(x.key)}]`;
    }).join(',');
  const f = JSON.stringify(focus || '');
  return `(function(){var R=[${list}],F=${f};if(!R.length)return;
function run(){var shown=false;
R.forEach(function(r){var els=document.querySelectorAll(r[0]);
if(!shown&&(!F||F===r[3])&&els[0]&&els[0].scrollIntoView){shown=true;try{els[0].scrollIntoView({block:'center',inline:'nearest'});}catch(e){}}
setTimeout(function(){els.forEach(function(el){el.classList.remove(r[1]);void el.offsetWidth;el.classList.add(r[1]);setTimeout(function(){el.classList.remove(r[1]);},r[2]);});},380);});}
if(document.readyState==='complete')setTimeout(run,250);else window.addEventListener('load',function(){setTimeout(run,250);});})();`;
}

/** Human readable one-liner for the info bar under the preview. */
export function describeRule(cfg: AnimConfig): string {
  const s = (effectiveDuration(cfg) / 1000).toFixed(2).replace(/\.?0+$/, '');
  const rep = cfg.repeat === 0 ? 'loops' : cfg.repeat === 1 ? 'once' : `${cfg.repeat}×`;
  return `${s}s · ${cfg.easing} · ${rep} · ${cfg.direction}`;
}