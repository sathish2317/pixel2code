import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { Settings as AppSettings } from '../storage';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { pickOne } from '../lib/pickCode';
import { diffLines } from '../lib/diff';
import { codeAction } from '../api';
import {
  AI_INSTRUCTION, Analysis, DEFAULTS, EASINGS, Effect, HoverFx, LoopFx, Intensity, P2C_CSS, P2C_JS, PRESETS, Project, START, END, Settings,
  aiContext, analyze, applyGenerated, buildPreview, changesBetween, cloneProject, exportZip, generate, loadZip, parseInstruction, removeFromOriginal, removeGenerated,
  safePath, setText, validSelector, FileChange,
} from '../lib/anim/engine';

const EFFECTS: Effect[] = ['fade', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'slide-up', 'zoom-in', 'zoom-out', 'reveal', 'image-reveal', 'blur-in'];
const HOVERS: HoverFx[] = ['lift','scale','glow','image-zoom','underline','border','gradient','icon-move','shrink','rotate','tilt','slide-left','slide-right','slide-up','slide-down','background-fade','text-color','shadow','soft-shadow','hard-shadow','inset-shadow','outline','radius','brightness','grayscale','saturate','sepia','blur','invert','opacity','text-shadow','letter-spacing','border-glow','skew','flip','pulse','bounce','ripple','gradient-shift','image-overlay','button-press','underline-grow','underline-slide','color-wash','raise','perspective','focus-ring','rotate-small','shine-sweep','wobble','swing','heartbeat','float','jelly','skew-x','skew-y','image-white','contrast','hue-rotate','border-dash','underline-center','text-reveal'];
const LOOPS: LoopFx[] = ['none', 'float', 'pulse', 'spin', 'bounce', 'gradient-move', 'text-emphasis'];
const INTENSITIES: Intensity[] = ['subtle', 'medium', 'advanced'];
const DEVICES: { k: string; w: number | 'full' }[] = [{ k: 'Desktop', w: 'full' }, { k: 'Tablet', w: 768 }, { k: 'Mobile', w: 390 }];

// Accept valid CSS hex forms (including #ffff) and common CSS color functions/names.
function isUsableCssColor(input: string): boolean {
  const v = input.trim();
  if (/^#[0-9a-f]{3}(?:[0-9a-f])?$|^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/i.test(v)) return true;
  if (/^(?:rgb|rgba|hsl|hsla)\(\s*[\d.%+\-,\s/]+\)$/i.test(v)) return true;
  return /^(?:transparent|currentColor|black|white|red|green|blue|yellow|orange|purple|pink|gray|grey|navy|teal|tomato|rebeccapurple)$/i.test(v);
}
function safeCssColor(input: string, fallback = '#6366f1'): string {
  const v = input.trim();
  return isUsableCssColor(v) ? v : fallback;
}
function colorWithAlpha(input: string, alpha: number): string {
  const value = safeCssColor(input);
  let hex = value;
  if (/^#[0-9a-f]{3}$/i.test(hex)) hex = '#' + hex.slice(1).split('').map(c => c+c).join('');
  if (/^#[0-9a-f]{4}$/i.test(hex)) hex = '#' + hex.slice(1,4).split('').map(c => c+c).join('');
  if (/^#[0-9a-f]{8}$/i.test(hex)) hex = hex.slice(0,7);
  if (/^#[0-9a-f]{6}$/i.test(hex)) return `rgba(${parseInt(hex.slice(1,3),16)}, ${parseInt(hex.slice(3,5),16)}, ${parseInt(hex.slice(5,7),16)}, ${Math.max(0,Math.min(1,alpha))})`;
  return value;
}

// Build readable selectors for generated CSS. Drop Bootstrap layout/spacing helpers
// so exported rules target semantic project classes rather than framework scaffolding.
function cleanEffectSelector(raw: string): string {
  const bootstrapUtility = /^(?:container(?:-fluid|-sm|-md|-lg|-xl|-xxl)?|row|col(?:-(?:auto|\d+|sm|md|lg|xl|xxl)(?:-\d+)?)?|g-\d+|gx-\d+|gy-\d+|m[trblxy]?-(?:auto|\d+)|p[trblxy]?-(?:auto|\d+)|gap-\d+|row-gap-\d+|d-(?:none|block|inline|inline-block|flex|inline-flex|grid)|flex-(?:row|column|wrap|nowrap|fill|grow-\d+|shrink-\d+)|justify-content-\w+|align-items-\w+|text-(?:start|end|center|left|right|white|dark|light|primary|secondary|success|danger|warning|info)|bg-(?:primary|secondary|success|danger|warning|info|light|dark|white|transparent)|w-\d+|h-\d+|position-\w+|top-\d+|start-\d+|end-\d+|bottom-\d+|rounded(?:-\w+)?|shadow(?:-\w+)?)$/i;
  const parts = raw.replace(/\s*[>+~]\s*/g, ' ').trim().split(/\s+/).filter(Boolean);
  const kept: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const clean = part.replace(/:hover\b/g, '').replace(/\.p2c-studio-selected\b/g, '');
    const tag = (clean.match(/^[a-z][\w-]*/i)?.[0] || '').toLowerCase();
    const classes = [...clean.matchAll(/\.([\w-]+)/g)].map(m => m[1]).filter(c => !bootstrapUtility.test(c) && !/^p2c-/.test(c));
    const id = clean.match(/#([\w-]+)/)?.[1];
    if (id) { kept.push('#' + id); continue; }
    if (classes.length) {
      // Keep the actual terminal tag (h2, p, button, img) in the selector,
      // while keeping ancestors semantic/class-based and dropping Bootstrap helpers.
      const terminalTag = i === parts.length - 1 && /^(?:h[1-6]|p|button|a|img|input|textarea|label|li)$/.test(tag) ? tag : '';
      kept.push(terminalTag + classes.map(c => '.' + c).join('')); continue;
    }
    // Keep meaningful terminal/semantic tags (especially h1-h6, paragraphs, buttons and links).
    if (/^(?:section|article|header|footer|nav|main|aside|h[1-6]|p|button|a|img|input|textarea|label|form|ul|ol|li)$/.test(tag)) kept.push(tag);
  }
  return kept.length ? kept.join(' ') : (raw.match(/#([\w-]+)/)?.[0] || '.selected-element');
}

function download(name: string, data: Uint8Array | string, type: string) {
  if (Platform.OS !== 'web') return;
  const url = URL.createObjectURL(new Blob([data as BlobPart], { type }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function AnimationStudio({ settings, onBack, toast }: { settings: AppSettings; onBack: () => void; toast: (s: string) => void }) {
  const t = useTheme();
  const { width: winW } = useWindowDimensions();
  const wide = winW >= 1180; // Preserve the original three-panel studio layout on desktop and landscape tablet; stack only on narrow screens.

  const [name, setName] = useState('');
  const [original, setOriginal] = useState<Project | null>(null);
  const [committed, setCommitted] = useState<Project | null>(null);
  const [pending, setPending] = useState<Project | null>(null);
  const [past, setPast] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);
  const [main, setMain] = useState('');
  const [page, setPage] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [s, setS] = useState<Settings>(DEFAULTS);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [device, setDevice] = useState<number | 'full'>('full');
  const [reload, setReload] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [rightTab, setRightTab] = useState<'cssEffects' | 'animate' | 'changes' | 'manage'>('cssEffects');
  const [mobileTab, setMobileTab] = useState<'files' | 'preview' | 'panel'>('preview');
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [fileDraft, setFileDraft] = useState<string | null>(null);
  const [fileView, setFileView] = useState<'diff' | 'full'>('diff');
  const [previewProblems, setPreviewProblems] = useState<string[]>([]);
  const [runtimeErr, setRuntimeErr] = useState('');
  const [log, setLog] = useState<string[]>([]);
  const [showFiles, setShowFiles] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'html' | 'css'>('html');
  const [selectedElement, setSelectedElement] = useState<{selector:string;tag:string;id:string;className:string;html:string;css:string} | null>(null);
  const [selectedHtml, setSelectedHtml] = useState('');
  const [selectedCss, setSelectedCss] = useState('');
  const [selectedEffectCss, setSelectedEffectCss] = useState('');
  const [hoveredEffectCss, setHoveredEffectCss] = useState('');
  const [hoveredHoverFx, setHoveredHoverFx] = useState<HoverFx | null>(null);
  const [selectedHoverFx, setSelectedHoverFx] = useState<HoverFx | null>(null);
  const [hoverColor, setHoverColor] = useState('#6366f1');
  const [hoverBackgroundColor, setHoverBackgroundColor] = useState('#eaf5ff');
  const [hoverTextColor, setHoverTextColor] = useState('#1684d8');
  const [hoverCategory, setHoverCategory] = useState<'hover' | 'background' | 'text' | 'image' | 'transform' | 'shadow'>('hover');
  const [hoveredEffectButton, setHoveredEffectButton] = useState<HoverFx | null>(null);
  const [showKeyframes, setShowKeyframes] = useState(false);
  const iframeRef = useRef<any>(null);

  const shown: Project | null = showOriginal ? original : (pending ?? committed);
  const set = (patch: Partial<Settings>) => setS((c) => ({ ...c, ...patch }));

  const sendToPreview = (message: any) => { try { iframeRef.current?.contentWindow?.postMessage(message, '*'); } catch {} };
  const effectColorFor = (fx: HoverFx) => fx === 'background-fade' || fx === 'color-wash' || fx === 'gradient' || fx === 'gradient-shift' ? hoverBackgroundColor : fx === 'text-color' ? hoverTextColor : hoverColor;
  const HOVER_CATEGORIES: { key: typeof hoverCategory; label: string; items: HoverFx[] }[] = [
    { key: 'hover', label: 'Hover', items: HOVERS },
    { key: 'background', label: 'Background', items: ['background-fade','gradient','gradient-shift','color-wash','image-overlay'] },
    { key: 'text', label: 'Text', items: ['text-color','underline','underline-grow','underline-slide','text-shadow','letter-spacing','underline-center','text-reveal'] },
    { key: 'image', label: 'Image', items: ['image-zoom','brightness','grayscale','saturate','sepia','blur','invert','opacity','image-overlay','image-white','contrast','hue-rotate'] },
    { key: 'transform', label: 'Transform', items: ['lift','scale','shrink','rotate','tilt','skew','skew-x','skew-y','flip','slide-left','slide-right','slide-up','slide-down','icon-move','raise','perspective','rotate-small','button-press','wobble','swing','heartbeat','float','jelly'] },
    { key: 'shadow', label: 'Shadow', items: ['glow','shadow','soft-shadow','hard-shadow','inset-shadow','border-glow','focus-ring','outline','border-dash'] },
  ];
  const liveSelectedCss = (css: string) => { setSelectedCss(css); sendToPreview({ p2cEditSelectedCss: css }); sendToPreview({ p2cStudioPreview: css }); };
  const liveSelectedHtml = (html: string) => { setSelectedHtml(html); sendToPreview({ p2cEditSelectedHtml: html }); };
  const effectCssFor = (fx: HoverFx, selector: string, colorInput: string) => {
    const base = cleanEffectSelector(selector || '.selected-element');
    const color = safeCssColor(colorInput);
    const bg = safeCssColor(['background-fade','color-wash','gradient','gradient-shift'].includes(fx) ? colorInput : hoverBackgroundColor, '#eaf5ff');
    const text = safeCssColor(fx === 'text-color' ? colorInput : hoverTextColor, '#1684d8');
    const rules: Record<HoverFx, string> = {
      lift:'transform:translateY(-8px);box-shadow:0 14px 32px rgba(0,0,0,.18)', scale:'transform:scale(1.04)', glow:'box-shadow:0 0 24px '+colorWithAlpha(color,.65),
      'image-zoom':'transform:scale(1.06)', underline:'text-decoration:underline;text-underline-offset:4px', border:'border-color:'+color,
      gradient:'background-image:linear-gradient(120deg,'+colorWithAlpha(bg,.96)+','+colorWithAlpha(color,.22)+')', 'icon-move':'transform:translateX(4px)', shrink:'transform:scale(.96)', rotate:'transform:rotate(3deg)',
      tilt:'transform:perspective(700px) rotateX(3deg) rotateY(-3deg)', 'slide-left':'transform:translateX(-6px)', 'slide-right':'transform:translateX(6px)', 'slide-up':'transform:translateY(-6px)', 'slide-down':'transform:translateY(6px)',
      'background-fade':'background-color:'+bg, 'text-color':'color:'+text, shadow:'box-shadow:0 12px 28px rgba(0,0,0,.2)', 'soft-shadow':'box-shadow:0 6px 18px rgba(0,0,0,.12)',
      'hard-shadow':'box-shadow:8px 8px 0 rgba(15,23,42,.25)', 'inset-shadow':'box-shadow:inset 0 0 0 2px '+colorWithAlpha(color,.53), outline:'outline:2px solid '+color+';outline-offset:3px', radius:'border-radius:24px',
      brightness:'filter:brightness(1.12)', grayscale:'filter:grayscale(1)', saturate:'filter:saturate(1.6)', sepia:'filter:sepia(.7)', blur:'filter:blur(1.5px)', invert:'filter:invert(.85)', opacity:'opacity:.72',
      'text-shadow':'text-shadow:0 2px 12px '+colorWithAlpha(color,.53), 'letter-spacing':'letter-spacing:.06em', 'border-glow':'border-color:'+color+';box-shadow:0 0 0 3px '+colorWithAlpha(color,.2),
      skew:'transform:skew(-2deg,-1deg)', flip:'transform:perspective(600px) rotateY(8deg)', pulse:'animation:p2c-hover-pulse .7s ease-in-out infinite alternate', bounce:'animation:p2c-hover-bounce .55s ease-in-out infinite alternate',
      ripple:'box-shadow:0 0 0 5px '+colorWithAlpha(color,.22), 'gradient-shift':'background-position:100% 0', 'image-overlay':'filter:brightness(.82) saturate(1.1)', 'button-press':'transform:translateY(1px) scale(.98)',
      'underline-grow':'text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px', 'underline-slide':'text-decoration:underline;text-underline-offset:4px', 'color-wash':'background-color:'+colorWithAlpha(bg,.22),
      raise:'transform:translateY(-10px);box-shadow:0 16px 30px rgba(15,23,42,.18)', perspective:'transform:perspective(800px) rotateX(5deg) rotateY(5deg)', 'focus-ring':'box-shadow:0 0 0 3px '+colorWithAlpha(color,.27), 'rotate-small':'transform:rotate(-2deg)',
      'shine-sweep':'background-image:linear-gradient(110deg,transparent 20%,'+colorWithAlpha(color,.38)+' 45%,transparent 70%);background-size:220% 100%;background-position:100% 0', wobble:'animation:p2c-wobble .7s ease-in-out both', swing:'transform-origin:top center;animation:p2c-swing .7s ease-in-out both', heartbeat:'animation:p2c-heartbeat .8s ease-in-out infinite', float:'animation:p2c-float 1.2s ease-in-out infinite alternate', jelly:'animation:p2c-jelly .7s ease-in-out both',
      'skew-x':'transform:skewX(-6deg)', 'skew-y':'transform:skewY(-6deg)', 'image-white':'filter:brightness(0) invert(1)', contrast:'filter:contrast(1.35)', 'hue-rotate':'filter:hue-rotate(100deg)', 'border-dash':'border:2px dashed '+color, 'underline-center':'text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:5px', 'text-reveal':'clip-path:inset(0 0 0 0);letter-spacing:.04em'
    };
    const imageFx = ['image-zoom','brightness','grayscale','saturate','sepia','blur','invert','opacity','image-overlay','image-white','contrast','hue-rotate'].includes(fx);
    const selectedIsImage = selectedElement?.tag?.toLowerCase() === 'img';
    const target = imageFx && !selectedIsImage ? `${base} img` : base;
    const hoverTarget = imageFx && !selectedIsImage ? `${base}:hover img` : `${base}:hover`;
    const transitionProps = imageFx ? 'filter 350ms ease, transform 350ms ease, opacity 350ms ease' : 'transform 350ms ease, box-shadow 350ms ease, filter 350ms ease, color 350ms ease, background-color 350ms ease, border-color 350ms ease';
    const keyframes = ['pulse','bounce','wobble','swing','heartbeat','float','jelly'].includes(fx) ? `\n@keyframes p2c-hover-pulse { from { transform:scale(1); } to { transform:scale(1.035); } }\n@keyframes p2c-hover-bounce { from { transform:translateY(0); } to { transform:translateY(-7px); } }\n@keyframes p2c-wobble { 0%,100% { transform:rotate(0); } 25% { transform:rotate(-4deg); } 75% { transform:rotate(4deg); } }\n@keyframes p2c-swing { 20% { transform:rotate(8deg); } 40% { transform:rotate(-5deg); } 60% { transform:rotate(3deg); } 80% { transform:rotate(-2deg); } }\n@keyframes p2c-heartbeat { 0%,100% { transform:scale(1); } 15%,35% { transform:scale(1.07); } 25%,45% { transform:scale(1.02); } }\n@keyframes p2c-float { from { transform:translateY(0); } to { transform:translateY(-7px); } }\n@keyframes p2c-jelly { 0%,100% { transform:scale(1,1); } 30% { transform:scale(1.12,.88); } 45% { transform:scale(.88,1.12); } 60% { transform:scale(1.05,.95); } }` : '';
    return `${target} { transition: ${transitionProps}; }\n${hoverTarget} { ${rules[fx] || rules.lift}; }${keyframes}`;
  };
  const previewCssNow = (css: string) => {
    sendToPreview({ p2cEditSelectedCss: css });
    // The preview runtime removes :hover from selectors in its temporary style only.
    sendToPreview({ p2cStudioPreview: css });
  };
  const refreshSelectedEffect = (fx: HoverFx, overrideColor?: string) => {
    if (!selectedElement?.selector) return;
    const css = effectCssFor(fx, selectedElement.selector, overrideColor || effectColorFor(fx));
    setSelectedEffectCss(css); setSelectedCss(css); previewCssNow(css);
  };
  const previewHoverEffect = (fx: HoverFx, overrideColor?: string) => {
    if (!selectedElement?.selector) return;
    const css = effectCssFor(fx, selectedElement.selector, overrideColor || effectColorFor(fx));
    setHoveredHoverFx(fx); setHoveredEffectCss(css);
    sendToPreview({ p2cStudioPreview: css });
  };
  const clearHoverEffectPreview = () => {
    setHoveredEffectCss(''); setHoveredHoverFx(null);
    // Remove only the temporary forced preview. The committed stylesheet keeps its
    // real :hover rule, so the effect activates when the user hovers the target itself.
    sendToPreview({ p2cStudioClear: true });
  };
  const applyHoverEffect = (fx: HoverFx) => {
    if (!selectedElement?.selector) { toast('Click an element in the website preview first.'); return; }
    const css = effectCssFor(fx, selectedElement.selector, effectColorFor(fx));
    setSelectedHoverFx(fx); setSelectedEffectCss(css); setSelectedCss(css); setSelectedTab('css');
    setHoveredEffectCss(''); setHoveredHoverFx(null);
    sendToPreview({ p2cStudioClear: true }); previewCssNow(css);
    toast(`${fx.replace(/-/g, ' ')} hover effect applied. Save CSS to include it in the exported project.`);
  };
  const applyKeyframePreset = (preset: 'move-up-down' | 'pulse' | 'rotate' | 'shake' | 'fade' | 'flip' | 'color-pulse' | 'wobble') => {
    if (!selectedElement?.selector) { toast('Select an element in the website preview first.'); return; }
    const base = cleanEffectSelector(selectedElement.selector);
    const presets: Record<typeof preset, { name: string; frames: string }> = {
      'move-up-down': { name: 'p2cMoveUpDown', frames: 'from { transform: translateY(0); } to { transform: translateY(-10px); }' },
      pulse: { name: 'p2cPulse', frames: 'from { transform: scale(1); } to { transform: scale(1.06); }' },
      rotate: { name: 'p2cRotate', frames: 'from { transform: rotate(0deg); } to { transform: rotate(5deg); }' },
      shake: { name: 'p2cShake', frames: '0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); }' },
      fade: { name: 'p2cFade', frames: 'from { opacity: .65; } to { opacity: 1; }' },
      flip: { name: 'p2cFlip', frames: 'from { transform: perspective(600px) rotateY(0); } to { transform: perspective(600px) rotateY(180deg); }' },
      'color-pulse': { name: 'p2cColorPulse', frames: `from { color: ${safeCssColor(hoverTextColor)}; } to { color: ${safeCssColor(hoverColor)}; }` },
      wobble: { name: 'p2cWobble', frames: '0%,100% { transform: rotate(0); } 25% { transform: rotate(-4deg); } 75% { transform: rotate(4deg); }' },
    };
    const chosen = presets[preset];
    const css = `${base} { transition: transform 300ms ease-in-out, opacity 300ms ease, color 300ms ease; }\n${base}:hover { animation: ${chosen.name} 800ms ease-in-out infinite alternate; transform-origin: center; }\n@keyframes ${chosen.name} { ${chosen.frames} }`;
    setSelectedHoverFx(null); setSelectedEffectCss(css); setSelectedCss(css); setHoveredEffectCss(''); setSelectedTab('css'); setShowKeyframes(false);
    previewCssNow(css);
    toast(`${preset.replace(/-/g, ' ')} keyframe animation applied. Save CSS to add it to the project.`);
  };

  const saveSelectedCss = () => {
    if (!committed || !selectedElement?.selector) return toast('Select an element first.');
    const css = selectedEffectCss || selectedCss;
    if (!css.trim()) return toast('There is no CSS to save.');
    const p = cloneProject(committed); const old = p.get(P2C_CSS)?.text || `${START}\n${END}\n`;
    const updated = old.includes(END) ? old.replace(END, css + '\n' + END) : `${old}\n${css}\n`;
    setText(p, P2C_CSS, updated); stage(p, `Saved selected element hover CSS for ${selectedElement.selector}`, false); setSelectedCss(css); toast('CSS saved to project and preview updated.');
  };

  const saveFileDraft = () => {
    if (!committed || !openFile || fileDraft === null) return toast('Choose a text file first.');
    const p = cloneProject(committed); setText(p, openFile, fileDraft); stage(p, `Edited source file ${openFile}`); toast(`Saved ${openFile} into the project. Export ZIP to download it.`);
    if (/\.html?$/i.test(openFile)) setPage(openFile);
  };

  // ---------- upload ----------
  const upload = async () => {
    setError(''); setBusy('Reading ZIP...');
    try {
      const f = await pickOne(['application/zip', 'application/x-zip-compressed', 'application/octet-stream']);
      if (!f) { setBusy(''); return; }
      if (!/\.zip$/i.test(f.name) && !(f.bytes[0] === 0x50 && f.bytes[1] === 0x4b)) throw new Error('Please choose a .zip file.');
      const r = await loadZip(f.bytes);
      const a = analyze(r.project, r.main);
      setName(f.name.replace(/\.zip$/i, '')); setOriginal(r.project); setCommitted(cloneProject(r.project)); setPending(null); setPast([]); setFuture([]);
      setMain(r.main); setPage(r.main); setAnalysis(a); setWarnings([...r.warnings, ...(r.skipped.length ? [`${r.skipped.length} unsupported/ignored file(s) skipped.`] : [])]);
      setS(DEFAULTS); setLog([]); setShowOriginal(false); setRuntimeErr(''); setReload((x) => x + 1);
      toast(`Loaded ${r.project.size} files. Main page: ${r.main}`);
    } catch (e: any) { setError(e.message || 'Could not read the ZIP.'); }
    setBusy('');
  };

  // ---------- preview ----------
  const preview = useMemo(() => (shown && page ? buildPreview(shown, page) : null), [shown, page, reload]);
  useEffect(() => { setPreviewProblems(preview?.problems || []); setRuntimeErr(''); }, [preview]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.p2cNav && shown) {
        const target = resolveLocal(page, String(e.data.p2cNav));
        if (target && shown.has(target)) setPage(target); else toast('Link not available in preview: ' + e.data.p2cNav);
      }
      if (e.data?.p2cErr) setRuntimeErr(String(e.data.p2cErr).slice(0, 500));
      if (e.data?.p2cSelected) { const v = e.data.p2cSelected; setFileDraft(null); setSelectedElement(v); setSelectedHtml(String(v.html || '')); setSelectedCss(String(v.css || '')); setSelectedEffectCss(''); setHoveredEffectCss(''); setHoveredHoverFx(null); setSelectedHoverFx(null); setSelectedTab('html'); }
    };
    window.addEventListener('message', h);
    return () => window.removeEventListener('message', h);
  }, [page, shown]);

  // ---------- change pipeline ----------
  const stage = (next: Project, why: string, showChanges = true) => { setPending(next); setLog((l) => [why, ...l].slice(0, 30)); if (showChanges) setRightTab('changes'); if (!wide) setMobileTab('preview'); setReload((x) => x + 1); };
  const base = committed;

  const makeAnimation = (patch?: Partial<Settings>) => {
    if (!base || !analysis) return toast('Upload a ZIP first.');
    const eff = { ...s, ...patch };
    for (const f of [eff.scrollTargets === 'auto' ? '' : eff.scrollTargets, eff.excludes, eff.loopTarget]) if (f && !validSelector(f)) return setError('Invalid CSS selector: ' + f);
    setError('');
    const g = generate(analysis, eff);
    if (!g.css.includes('p2c')) return toast('Nothing suitable to animate in this project.');
    const p = applyGenerated(removeGenerated(base, original!), g);
    stage(p, 'Generated animations (' + eff.intensity + ')' + (g.notes.length ? '. ' + g.notes.join(' ') : ''));
  };

  const runInstruction = async (viaAi: boolean) => {
    if (!base || !analysis) return toast('Upload a ZIP first.');
    const text = instruction.trim(); if (!text) return toast('Describe the animation you want.');
    setError('');
    const parsed = parseInstruction(text, s);
    if (parsed.remove) { return manage(parsed.remove, parsed.removeSelector); }
    if (!viaAi) {
      const next = { ...s, ...parsed.settings }; setS(next);
      if (!parsed.understood.length) return setError('Could not map that to local controls. Use "Ask AI" for free-form requests.');
      const g = generate(analysis, next);
      stage(applyGenerated(removeGenerated(base, original!), g), `"${text}" → ${parsed.understood.join('; ')}`);
      return;
    }
    setBusy('Asking AI...');
    try {
      const working = applyGenerated(removeGenerated(base, original!), generate(analysis, { ...s, ...parsed.settings }));
      const ctx = aiContext(analysis, { ...s, ...parsed.settings }, working, main);
      const res = await codeAction(settings, 'generate', { files: ctx.files, instruction: AI_INSTRUCTION(text) });
      const f = res.files.find((x) => x.path === P2C_CSS || x.path.endsWith('/' + P2C_CSS));
      if (!f) throw new Error('The AI did not return ' + P2C_CSS + '. Your project is unchanged. ' + (res.explanation || ''));
      let css = f.content;
      if (!css.includes(START)) css = START + '\n' + css + '\n' + END;
      if (/@import|expression\(|javascript:/i.test(css)) throw new Error('AI output contained unsafe CSS and was rejected.');
      const p = cloneProject(working); setText(p, P2C_CSS, css + '\n');
      stage(p, `AI: "${text}". ${res.explanation || ''}`.slice(0, 400));
    } catch (e: any) {
      setError(e.quota || e.status === 429 ? 'AI usage limit reached. Your project and previous changes are safe. ' + (e.message || '') : 'AI request failed: ' + (e.message || 'unknown error') + ' Your project and previous changes are unchanged.');
    }
    setBusy('');
  };

  const manage = (mode: 'all' | 'scroll' | 'hover' | 'loop' | 'restore' | 'orig-anim' | 'orig-trans', selector?: string) => {
    if (!base || !original) return toast('Upload a ZIP first.');
    if (mode === 'restore') { commit(cloneProject(original), 'Restored original uploaded files'); return; }
    if (mode === 'all') return stage(removeGenerated(base, original), 'Removed all Pixel2Code animations');
    if (mode === 'orig-anim' || mode === 'orig-trans') {
      const r = removeFromOriginal(base, mode === 'orig-anim' ? 'original-animations' : 'original-transitions', selector);
      if (!r.removed.length) return toast('No matching original rules found.');
      return stage(r.project, `Removed original ${mode === 'orig-anim' ? 'animation' : 'transition'} declarations from ${r.removed.length} rule(s)`);
    }
    if (!analysis) return;
    const patch: Partial<Settings> = mode === 'scroll' ? { scrollOn: false } : mode === 'hover' ? { hoverOn: false } : { loop: 'none', loadOn: false, navOnLoad: false };
    const next = { ...s, ...patch, ...(selector ? { excludes: [s.excludes, selector].filter(Boolean).join(', ') } : {}) };
    if (selector && mode !== 'loop') { next.scrollOn = s.scrollOn; next.hoverOn = s.hoverOn; }
    setS(next);
    const g = generate(analysis, next);
    stage(applyGenerated(removeGenerated(base, original), g), `Removed ${mode} animations${selector ? ' from ' + selector : ''}`);
  };

  const commit = (p: Project, why: string) => {
    if (!base) return;
    setPast((x) => [...x, base].slice(-30)); setFuture([]); setCommitted(p); setPending(null); setLog((l) => [why, ...l]); setReload((x) => x + 1);
  };
  const apply = () => { if (pending) { commit(pending, 'Applied changes'); toast('Changes applied.'); } };
  const reject = () => { setPending(null); setReload((x) => x + 1); toast('Changes rejected.'); };
  const undo = () => { if (pending) return reject(); if (!past.length || !committed) return; setFuture((f) => [committed, ...f]); setCommitted(past[past.length - 1]); setPast((x) => x.slice(0, -1)); setReload((x) => x + 1); };
  const redo = () => { if (!future.length || !committed) return; setPast((x) => [...x, committed]); setCommitted(future[0]); setFuture((f) => f.slice(1)); setReload((x) => x + 1); };
  const revertBroken = () => { if (pending) reject(); else undo(); setRuntimeErr(''); };

  const changes = useMemo<FileChange[]>(() => (committed && pending ? changesBetween(committed, pending) : committed && original ? changesBetween(original, committed) : []), [committed, pending, original]);
  const vsOriginal = useMemo<FileChange[]>(() => (original && shown ? changesBetween(original, shown) : []), [original, shown]);

  const downloadAll = async () => { if (!committed) return; if (pending) return toast('Apply or reject the pending changes first.'); download((name || 'website') + '-animated.zip', await exportZip(committed), 'application/zip'); toast('Downloaded complete project ZIP.'); };
  const downloadCssJs = async () => { if (!committed) return; if (pending) return toast('Apply or reject the pending changes first.'); download((name || 'website') + '-css-js.zip', await exportZip(committed, 'css-js'), 'application/zip'); };

  // ---------- UI pieces ----------
  const label = (x: string) => <Txt sub size={12} style={{ marginTop: 6 }}>{x}</Txt>;
  const num = (k: keyof Settings, step: number, min: number, max: number, unit = '') => (
    <View style={[row, { gap: 6 }]}>
      <Btn small kind="ghost" label="−" onPress={() => set({ [k]: Math.max(min, +(((s[k] as number) - step)).toFixed(2)) } as any)} />
      <Txt bold style={{ minWidth: 70, textAlign: 'center' }}>{String(s[k])}{unit}</Txt>
      <Btn small kind="ghost" label="+" onPress={() => set({ [k]: Math.min(max, +(((s[k] as number) + step)).toFixed(2)) } as any)} />
    </View>
  );

  const header = (
    <View style={{ borderBottomWidth: 1, borderColor: t.border, backgroundColor: '#081326', paddingHorizontal: 10, paddingVertical: 8, gap: 8 }}>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap', gap: 7 }]}>
        <View style={[row, { gap: 8 }]}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#2878ff', alignItems: 'center', justifyContent: 'center' }}><Txt bold size={20} style={{ color: '#fff' }}>P</Txt></View>
          <Txt bold size={19} style={{ letterSpacing: -0.4 }}>Pixel2Code</Txt>
          <View style={{ width: 1, height: 28, backgroundColor: t.border, marginHorizontal: 5 }} />
          <Txt sub size={12}>▰ {name || 'Website Project'} ⌄</Txt>
        </View>
        <View style={[row, { gap: 5 }]}>
          {DEVICES.map((d) => <Btn key={d.k} small kind={device === d.w ? 'primary' : 'ghost'} label={d.k === 'Desktop' ? '▣ Desktop' : d.k === 'Tablet' ? '▯ Tablet' : '▯ Mobile'} onPress={() => setDevice(d.w)} />)}
          <Btn small kind="ghost" label={fullScreen ? '⛶ Exit Full Screen' : '⛶ Full Screen'} onPress={() => { setFullScreen((v) => !v); if (Platform.OS === 'web') { try { if (!fullScreen) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); } catch {} } }} />
          <Btn small kind="ghost" label="↻ Refresh" onPress={() => setReload((x) => x + 1)} />
          <Btn small kind={showConsole ? 'primary' : 'ghost'} label="◉ Console" onPress={() => setShowConsole((v) => !v)} />
        </View>
        <View style={[row, { gap: 5 }]}>
          <Btn small kind="ghost" label="⇩ Export ZIP" onPress={downloadAll} disabled={!committed || !!pending} />
          <Btn small label="Save Project" onPress={() => pending ? apply() : toast('No pending changes. Use Export ZIP to download the current project.')} disabled={!committed} />
          <Btn small kind="ghost" label="⚙" onPress={() => toast('Project settings are available from Settings.')} />
        </View>
      </View>
      <View style={[row, { justifyContent: 'flex-end', gap: 5 }]}>
        <Btn small label={original ? 'Upload another ZIP' : 'Upload ZIP'} onPress={upload} />
        <Btn small kind="ghost" label="Undo" onPress={undo} disabled={!pending && !past.length} />
        <Btn small kind="ghost" label="Redo" onPress={redo} disabled={!future.length} />
        <Btn small kind="ghost" label="Reset" onPress={() => manage('restore')} disabled={!original} />
        <Btn small kind="ghost" label="CSS+JS only" onPress={downloadCssJs} disabled={!committed || !!pending} />
      </View>
    </View>
  );

  const explorer = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, gap: 8 }}>
      <Txt bold>Project files</Txt>
      {!shown ? <Txt sub size={12}>Upload a ZIP to see the file tree.</Txt> : Array.from(shown.keys()).sort().map((p) => {
        const isPage = /\.html?$/i.test(p), changed = changes.some((c) => c.path === p), gen = p === P2C_CSS || p === P2C_JS;
        return (
          <Pressable key={p} onPress={() => { const content = shown.get(p)?.text; if (content !== undefined) { setOpenFile(p); setFileView('full'); setFileDraft(content); setShowFiles(false); if (isPage) setPage(p); if (!wide) setMobileTab('files'); } else if (isPage) { setPage(p); setMobileTab('preview'); } }}
            style={{ paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6, backgroundColor: p === page ? t.input : 'transparent' }}>
            <Txt size={12} style={{ color: gen ? t.ok : changed ? t.primary : t.text, fontFamily: Platform.OS === 'web' ? 'monospace' : undefined }} numberOfLines={1}>
              {'  '.repeat(Math.max(0, p.split('/').length - 1))}{p.split('/').pop()}{isPage ? '  ▸ page' : ''}{gen ? '  + P2C' : ''}
            </Txt>
          </Pressable>
        );
      })}
      {!!analysis && (
        <Card style={{ gap: 4 }}>
          <Txt bold size={13}>Analysis</Txt>
          <Txt sub size={12}>Main page: {main}</Txt>
          <Txt sub size={12}>{analysis.pages.length} page(s), {analysis.css.length} CSS, {analysis.js.length} JS, {analysis.elements} elements</Txt>
          <Txt sub size={12}>Sections {analysis.sections.length} · Cards {analysis.cards.length} · Buttons {analysis.buttons.length} · Images {analysis.images.length}</Txt>
          {!!analysis.libs.length && <Txt sub size={12}>Detected: {analysis.libs.join(', ')}</Txt>}
        </Card>
      )}
      {warnings.map((w, i) => <Txt key={i} size={12} style={{ color: '#f5a524' }}>⚠ {w}</Txt>)}
    </ScrollView>
  );

  const leftInspector = (
    <View style={{ flex: 1, minHeight: 220 }}>
      <View style={[row, { padding: 8, justifyContent: 'space-between', borderBottomWidth: 1, borderColor: t.border }]}>
        <Txt bold>{showFiles ? 'Project files' : 'Selected element'}</Txt>
        <Btn small kind="ghost" label={showFiles ? '← Element' : '☰ Files'} onPress={() => setShowFiles((v) => !v)} />
      </View>
      {showFiles ? explorer : (openFile && fileDraft !== null) ? (
        <View style={{ flex: 1, padding: 8, gap: 8 }}>
          <View style={row}><Btn small kind="ghost" label="← Files" onPress={() => setShowFiles(true)} /><Txt bold size={12}>{openFile}</Txt></View>
          <Input multiline value={fileDraft} onChangeText={setFileDraft} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top" mono style={{ flex: 1, minHeight: 220, fontSize: 11, lineHeight: 16 }} />
          <View style={row}><Btn small label="Save file" onPress={saveFileDraft} /><Btn small kind="ghost" label="Close editor" onPress={() => setFileDraft(null)} /></View>
          <Txt sub size={11}>Edits are staged in the project. Export the modified ZIP to keep them.</Txt>
        </View>
      ) : !selectedElement ? (
        <View style={{ padding: 12, gap: 8 }}><Txt sub size={12}>Click an element in the website preview. Its HTML and matching CSS will appear here.</Txt><Txt sub size={11}>Use ☰ Files to open the full project tree and choose an entire source file.</Txt></View>
      ) : (
        <View style={{ flex: 1, padding: 8, gap: 8 }}>
          <Txt bold size={12}>{selectedElement.selector}</Txt><Txt sub size={11}>{selectedElement.tag}{selectedElement.id ? ' · #' + selectedElement.id : ''}{selectedElement.className ? ' · .' + selectedElement.className.split(/\s+/).join('.') : ''}</Txt>
          <View style={row}><Chip label="HTML" active={selectedTab === 'html'} onPress={() => setSelectedTab('html')} /><Chip label="CSS" active={selectedTab === 'css'} onPress={() => setSelectedTab('css')} /><Btn small kind="ghost" label="Copy" onPress={() => { const v = selectedTab === 'html' ? selectedHtml : selectedCss; if (Platform.OS === 'web' && navigator.clipboard) navigator.clipboard.writeText(v).then(() => toast('Copied code.')).catch(() => toast('Select the code and copy manually.')); }} /></View>
          <Input multiline value={selectedTab === 'html' ? selectedHtml : selectedCss} onChangeText={selectedTab === 'html' ? liveSelectedHtml : (v) => { setSelectedEffectCss(v); liveSelectedCss(v); sendToPreview({ p2cStudioPreview: v }); }} autoCapitalize="none" autoCorrect={false} spellCheck={false} textAlignVertical="top" mono style={{ flex: 1, minHeight: 180, fontSize: 11, lineHeight: 16 }} />
          {selectedTab === 'css' && <Btn small label="Save CSS to project" onPress={saveSelectedCss} />}
        </View>
      )}
    </View>
  );

  const previewPane = (
    <View style={{ flex: 1, minHeight: 360 }}>
      <View style={[row, { padding: 8, gap: 6, borderBottomWidth: 1, borderColor: t.border, flexWrap: 'wrap' }]}>
        <Btn small kind="ghost" label="☰ Files" onPress={() => { setShowFiles(true); if (!wide) setMobileTab('files'); }} />
        <Btn small kind={showOriginal ? 'primary' : 'ghost'} label={showOriginal ? 'Showing: Original' : 'Showing: Modified'} onPress={() => setShowOriginal((v) => !v)} disabled={!original} />
        {!!analysis && analysis.pages.length > 1 && <Txt sub size={12}>Page: {page}</Txt>}
      </View>
      {!!runtimeErr && (
        <View style={[row, { padding: 8, backgroundColor: '#3b1219' }]}>
          <Txt size={12} style={{ color: '#ff9aa5', flex: 1 }}>Preview error: {runtimeErr}</Txt>
          <Btn small kind="danger" label="Revert to previous working version" onPress={revertBroken} />
        </View>
      )}
      {!!previewProblems.length && <Txt size={11} style={{ color: '#f5a524', padding: 6 }} numberOfLines={3}>⚠ {previewProblems.slice(0, 3).join(' · ')}{previewProblems.length > 3 ? ` (+${previewProblems.length - 3} more)` : ''}</Txt>}
      {showConsole && <View style={{ backgroundColor: '#091326', borderBottomWidth: 1, borderColor: t.border, padding: 8, gap: 4, maxHeight: 130 }}>
        <View style={[row, { justifyContent: 'space-between' }]}><Txt bold size={12}>Console · diagnostics</Txt><Btn small kind="ghost" label="Close" onPress={() => setShowConsole(false)} /></View>
        {!!runtimeErr && <Txt size={11} style={{ color: '#ff8c9a' }}>ERROR · {runtimeErr}</Txt>}
        {previewProblems.slice(0, 5).map((problem, i) => <Txt key={i} size={11} style={{ color: '#ffbf54' }}>WARNING · {problem}</Txt>)}
        {!runtimeErr && !previewProblems.length && <Txt sub size={11}>No preview diagnostics reported.</Txt>}
      </View>}
      <View style={{ flex: 1, backgroundColor: '#0b0d18', alignItems: 'center' }}>
        {!preview ? (
          <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
            <Txt bold size={16} style={{ textAlign: 'center' }}>Upload your website ZIP to begin</Txt>
            <Txt sub style={{ textAlign: 'center', marginTop: 6 }}>HTML, CSS, JS and assets in nested folders are supported. Your actual site is rendered here in a sandbox.</Txt>
            <View style={{ alignItems: 'center', marginTop: 14 }}><Btn label="Upload ZIP" onPress={upload} /></View>
          </View>
        ) : Platform.OS === 'web' ? (
          React.createElement('iframe', {
            key: reload + page + (showOriginal ? 'o' : 'm') + String(device), ref: iframeRef, title: 'Website preview', srcDoc: preview.html,
            sandbox: 'allow-scripts', // no allow-same-origin: uploaded code cannot reach Pixel2Code storage/cookies
            style: { border: 0, width: '100%', maxWidth: device === 'full' ? '100%' : device, height: '100%', background: '#fff', flex: 1, minWidth: 0, alignSelf: 'center' },
          })
        ) : (() => { const { WebView } = require('react-native-webview'); return <WebView key={reload + page} originWhitelist={['*']} source={{ html: preview.html }} javaScriptEnabled domStorageEnabled={false} style={{ width: device === 'full' ? '100%' : device, flex: 1 }} />; })()}
      </View>
    </View>
  );

  const animateTab = (
    <View style={{ gap: 8 }}>
      <Btn label={busy || (pending ? 'Regenerate animations' : 'Make Animation')} onPress={() => makeAnimation()} disabled={!original || !!busy} />
      <Txt bold>Describe what you want</Txt>
      <Input multiline value={instruction} onChangeText={setInstruction} placeholder='e.g. "Add a smooth fade-up animation to every section" or "Remove animations only from the footer"' style={{ minHeight: 70 }} />
      <View style={row}>
        <Btn small label="Apply instruction" onPress={() => runInstruction(false)} disabled={!original || !!busy} />
        <Btn small kind="ghost" label="Ask AI" onPress={() => runInstruction(true)} disabled={!original || !!busy} />
      </View>
      <Txt sub size={11}>"Apply instruction" maps your words to the controls below instantly. "Ask AI" sends the page structure to your AI server for free-form CSS (needs the server running).</Txt>
      {!!error && <Txt size={12} style={{ color: t.danger }}>{error}</Txt>}

      <Txt bold style={{ marginTop: 8 }}>Presets</Txt>
      <View style={row}>{Object.keys(PRESETS).map((k) => <Chip key={k} label={k} onPress={() => { const p = { ...PRESETS[k] }; setS((c) => ({ ...c, ...p })); if (original) makeAnimation(p); }} />)}</View>

      <Txt bold style={{ marginTop: 8 }}>Intensity</Txt>
      <View style={row}>{INTENSITIES.map((i) => <Chip key={i} label={i[0].toUpperCase() + i.slice(1)} active={s.intensity === i} onPress={() => set({ intensity: i })} />)}</View>

      <Txt bold style={{ marginTop: 8 }}>Scroll animation</Txt>
      <View style={row}><Chip label={s.scrollOn ? 'On' : 'Off'} active={s.scrollOn} onPress={() => set({ scrollOn: !s.scrollOn })} /></View>
      <View style={row}>{EFFECTS.map((e) => <Chip key={e} label={e} active={s.effect === e} onPress={() => set({ effect: e })} />)}</View>
      {label('Target selectors (comma separated, or "auto")')}
      <Input value={s.scrollTargets} onChangeText={(v) => set({ scrollTargets: v || 'auto' })} autoCapitalize="none" mono />
      {label('Exclude selectors (e.g. header, footer)')}
      <Input value={s.excludes} onChangeText={(v) => set({ excludes: v })} autoCapitalize="none" mono />
      {label('Duration (ms)')}{num('duration', 100, 100, 3000)}
      {label('Delay (ms)')}{num('delay', 50, 0, 2000)}
      {label('Stagger interval (ms)')}{num('stagger', 20, 0, 400)}
      {label('Movement distance (px)')}{num('distance', 4, 0, 160)}
      {label('Start scale (zoom)')}{num('scale', 0.02, 0.5, 1)}
      {label('Scroll activation threshold (0–1)')}{num('threshold', 0.05, 0, 1)}
      {label('Easing')}
      <View style={row}>{EASINGS.map((e) => <Chip key={e} label={e.startsWith('cubic') ? e.slice(13, 22) + '…' : e} active={s.easing === e} onPress={() => set({ easing: e })} />)}</View>
      {label('Trigger')}
      <View style={row}>
        <Chip label="Observer (reliable)" active={s.trigger === 'scroll-observer'} onPress={() => set({ trigger: 'scroll-observer' })} />
        <Chip label="CSS scroll-driven (no JS)" active={s.trigger === 'scroll-driven'} onPress={() => set({ trigger: 'scroll-driven' })} />
      </View>
      {label('Repeat')}
      <View style={row}><Chip label="Once" active={s.once} onPress={() => set({ once: true })} /><Chip label="Every time in view" active={!s.once} onPress={() => set({ once: false })} /></View>

      <Txt bold style={{ marginTop: 8 }}>Hover animation</Txt>
      <View style={row}><Chip label={s.hoverOn ? 'On' : 'Off'} active={s.hoverOn} onPress={() => set({ hoverOn: !s.hoverOn })} /></View>
      <View style={[row, { flexWrap: 'wrap' }]}>{HOVERS.map((h) => <Chip key={h} label={h} active={s.hover.includes(h)} onPress={() => { set({ hoverOn: true, hover: [h] }); applyHoverEffect(h); }} />)}</View>
      {label('Hover color (for background, glow, border and text effects)')}
      <Input value={hoverColor} onChangeText={(v) => { setHoverColor(v); if (selectedElement && selectedHoverFx) { const css = effectCssFor(selectedHoverFx, selectedElement.selector, effectColorFor(selectedHoverFx)); setSelectedEffectCss(css); sendToPreview({ p2cStudioPreview: css }); } }} autoCapitalize="none" placeholder="#6366f1" />
      {!!selectedEffectCss && <Card style={{ gap: 6 }}><Txt bold size={12}>Selected hover CSS · live preview</Txt><Input multiline value={hoveredEffectCss || selectedEffectCss} onChangeText={(v) => { setSelectedEffectCss(v); setSelectedCss(v); sendToPreview({ p2cEditSelectedCss: v }); }} autoCapitalize="none" autoCorrect={false} mono style={{ minHeight: 110, fontSize: 11 }} /><View style={row}><Btn small label="Save CSS" onPress={saveSelectedCss} /><Btn small kind="ghost" label="Reset preview" onPress={() => { setSelectedEffectCss(''); setSelectedHoverFx(null); sendToPreview({ p2cStudioClear: true }); }} /></View></Card>}
      {label('Hover intensity')}{num('hoverIntensity', 0.2, 0.2, 3, '×')}
      {label('Card selectors')}<Input value={s.hoverCards} onChangeText={(v) => set({ hoverCards: v || 'auto' })} autoCapitalize="none" mono />
      {label('Button selectors')}<Input value={s.hoverButtons} onChangeText={(v) => set({ hoverButtons: v || 'auto' })} autoCapitalize="none" mono />

      <Txt bold style={{ marginTop: 8 }}>Other animations</Txt>
      <View style={row}>{LOOPS.map((l) => <Chip key={l} label={l} active={s.loop === l} onPress={() => set({ loop: l })} />)}</View>
      {s.loop !== 'none' && <><Txt sub size={12}>Loop target selector</Txt><Input value={s.loopTarget} onChangeText={(v) => set({ loopTarget: v })} placeholder="auto (first image/button)" autoCapitalize="none" mono /></>}
      <View style={row}>
        <Chip label="Navbar entrance on load" active={s.navOnLoad} onPress={() => set({ navOnLoad: !s.navOnLoad })} />
        <Chip label="Focus-visible states" active={s.focusStates} onPress={() => set({ focusStates: !s.focusStates })} />
      </View>
      <Btn label="Generate with these controls" kind="ghost" onPress={() => makeAnimation()} disabled={!original || !!busy} />
    </View>
  );

  const fileChange = changes.find((c) => c.path === openFile) || changes[0];
  const changesTab = (
    <View style={{ gap: 8 }}>
      {pending ? (
        <View style={row}>
          <Btn small label="Apply changes" onPress={apply} /><Btn small kind="danger" label="Reject" onPress={reject} />
          <Txt sub size={12}>Pending: not saved until you apply.</Txt>
        </View>
      ) : <Txt sub size={12}>{changes.length ? 'Applied changes vs. your original upload:' : 'No changes yet. Click Make Animation.'}</Txt>}
      {!!log.length && <Card style={{ gap: 3 }}><Txt bold size={12}>Why</Txt>{log.slice(0, 4).map((l, i) => <Txt key={i} sub size={12}>• {l}</Txt>)}</Card>}
      <View style={row}>
        {changes.map((c) => <Chip key={c.path} label={`${c.status === 'added' ? '+' : c.status === 'removed' ? '−' : '~'} ${c.path}`} active={fileChange?.path === c.path} onPress={() => { setOpenFile(c.path); setFileView('diff'); }} />)}
      </View>
      {!!fileChange && (
        <>
          <View style={row}>
            <Chip label="Diff (original vs modified)" active={fileView === 'diff'} onPress={() => setFileView('diff')} />
            <Chip label="Complete file" active={fileView === 'full'} onPress={() => setFileView('full')} />
          </View>
          <CodeBox change={fileChange} view={fileView} />
        </>
      )}
      {!fileChange && openFile && shown?.get(openFile)?.text !== undefined && <CodeBox change={{ path: openFile, status: 'modified', before: shown.get(openFile)!.text!, after: shown.get(openFile)!.text! }} view="full" />}
      {!!vsOriginal.length && !pending && <Txt sub size={11}>{vsOriginal.length} file(s) differ from the original upload. Unrelated files are untouched.</Txt>}
    </View>
  );

  const ex = analysis?.existing || [];
  const manageTab = (
    <View style={{ gap: 8 }}>
      <Txt bold>Pixel2Code animations</Txt>
      <View style={row}>
        <Btn small kind="ghost" label="Remove all generated" onPress={() => manage('all')} disabled={!original} />
        <Btn small kind="ghost" label="Remove scroll only" onPress={() => manage('scroll')} disabled={!original} />
        <Btn small kind="ghost" label="Remove hover only" onPress={() => manage('hover')} disabled={!original} />
        <Btn small kind="ghost" label="Disable continuous" onPress={() => manage('loop')} disabled={!original} />
      </View>
      <Txt sub size={12}>Remove from a specific element (selector):</Txt>
      <RemoveFrom onRemove={(sel) => { if (!validSelector(sel)) return setError('Invalid selector'); manage('scroll', sel); }} />
      <Txt sub size={12}>Change duration globally:</Txt>
      <View style={row}>{[0.7, 1.4].map((m) => <Btn key={m} small kind="ghost" label={m < 1 ? 'Faster' : 'Slower'} onPress={() => makeAnimation({ duration: Math.round(s.duration * m) })} disabled={!original} />)}</View>
      <Txt sub size={12}>Replace fade-left → fade-up (or any):</Txt>
      <View style={row}>{EFFECTS.slice(0, 6).map((e) => <Chip key={e} label={e} onPress={() => makeAnimation({ effect: e })} />)}</View>
      <Txt bold style={{ marginTop: 8 }}>Original project animations</Txt>
      <Txt sub size={11}>These come from your uploaded files and are kept unless you choose to remove them.</Txt>
      <View style={row}>
        <Btn small kind="danger" label="Remove original @animation usage" onPress={() => manage('orig-anim')} disabled={!original} />
        <Btn small kind="danger" label="Remove original transitions" onPress={() => manage('orig-trans')} disabled={!original} />
        <Btn small kind="ghost" label="Restore original" onPress={() => manage('restore')} disabled={!original} />
      </View>
      {!ex.length && <Txt sub size={12}>No existing animations detected.</Txt>}
      {ex.slice(0, 60).map((e, i) => (
        <Card key={i} style={{ padding: 8 }}>
          <Txt size={12} bold>{e.managed ? 'Pixel2Code' : 'Original'} · {e.kind}: {e.name}</Txt>
          <Txt sub size={11} numberOfLines={1}>{e.file} — {e.selector}</Txt>
        </Card>
      ))}
    </View>
  );

  const cssEffectsTab = (
    <View style={{ gap: 10 }}>
      <Card style={{ gap: 5 }}>
        <View style={[row, { justifyContent: 'space-between', alignItems: 'center' }]}>
          <Txt bold size={15}>CSS Effects Studio</Txt>
          <Txt size={11} style={{ color: '#64E4C1' }}>● LIVE</Txt>
        </View>
        <Txt sub size={12}>Choose a hover effect to preview it on the selected element. Hover effects are written using :hover.</Txt>
        <Txt size={12}>Selected: {selectedElement ? `${selectedElement.tag}${selectedElement.className ? ' · .' + selectedElement.className.trim().split(/\s+/).join('.') : ''}${selectedElement.id ? ' · #' + selectedElement.id : ''}` : 'No element selected'}</Txt>
        {!selectedElement && <Txt sub size={11}>Click an element inside the website preview first.</Txt>}
      </Card>
      <View style={[row, { flexWrap: 'wrap', gap: 6 }]}>
        <Chip label="Keyframes" active={showKeyframes} onPress={() => { if (!selectedElement?.selector) { toast('Select an element in the preview first.'); return; } setShowKeyframes(v => !v); }} />
        {HOVER_CATEGORIES.map((c) => <Chip key={c.key} label={c.label} active={hoverCategory === c.key} onPress={() => setHoverCategory(c.key)} />)}
      </View>
      {showKeyframes && <Card style={{ gap: 8 }}><Txt bold size={12}>Keyframe presets</Txt><Txt sub size={11}>Choose a CSS @keyframes pattern. Hovering previews it; clicking applies the code.</Txt><View style={[row, { flexWrap: 'wrap', gap: 6 }]}>{(['move-up-down','pulse','rotate','shake','fade','flip','color-pulse','wobble'] as const).map((preset) => <Pressable key={preset} onHoverIn={() => { if (!selectedElement?.selector) return; const base = cleanEffectSelector(selectedElement.selector); const demo = preset === 'move-up-down' ? `@keyframes p2cMoveUpDown { from { transform:translateY(0); } to { transform:translateY(-10px); } }\n${base} { animation:p2cMoveUpDown 800ms ease-in-out infinite alternate; }` : preset === 'pulse' ? `@keyframes p2cPulse { from { transform:scale(1); } to { transform:scale(1.06); } }\n${base} { animation:p2cPulse 800ms ease-in-out infinite alternate; }` : preset === 'rotate' ? `@keyframes p2cRotate { from { transform:rotate(0); } to { transform:rotate(5deg); } }\n${base} { animation:p2cRotate 800ms ease-in-out infinite alternate; }` : preset === 'shake' ? `@keyframes p2cShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }\n${base} { animation:p2cShake 800ms ease-in-out infinite alternate; }` : preset === 'fade' ? `@keyframes p2cFade { from { opacity:.65; } to { opacity:1; } }\n${base} { animation:p2cFade 800ms ease-in-out infinite alternate; }` : preset === 'flip' ? `@keyframes p2cFlip { from { transform:perspective(600px) rotateY(0); } to { transform:perspective(600px) rotateY(180deg); } }\n${base} { animation:p2cFlip 800ms ease-in-out infinite alternate; }` : preset === 'color-pulse' ? `@keyframes p2cColorPulse { from { color:${safeCssColor(hoverTextColor)}; } to { color:${safeCssColor(hoverColor)}; } }\n${base} { animation:p2cColorPulse 800ms ease-in-out infinite alternate; }` : `@keyframes p2cWobble { 0%,100% { transform:rotate(0); } 25% { transform:rotate(-4deg); } 75% { transform:rotate(4deg); } }\n${base} { animation:p2cWobble 800ms ease-in-out infinite alternate; }`; sendToPreview({ p2cStudioPreview: demo }); }} onHoverOut={() => sendToPreview({ p2cStudioClear: true })} onPress={() => applyKeyframePreset(preset)} style={{ borderWidth: 1, borderColor: t.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: 10, backgroundColor: t.input }}><Txt size={11}>{preset.replace(/-/g, ' ')}</Txt></Pressable>)}</View></Card>}
      <Txt bold size={13}>{hoverCategory === 'hover' ? `Hover animations (${HOVERS.length})` : `${HOVER_CATEGORIES.find((c) => c.key === hoverCategory)?.label} effects`}</Txt>
      <View style={[row, { flexWrap: 'wrap', gap: 7 }]}>
        {HOVER_CATEGORIES.find((c) => c.key === hoverCategory)!.items.map((fx) => (
          <Pressable
            key={fx}
            onHoverIn={() => { setHoveredEffectButton(fx); previewHoverEffect(fx); }}
            onHoverOut={() => { setHoveredEffectButton(null); clearHoverEffectPreview(); }}
            onPress={() => applyHoverEffect(fx)}
            accessibilityRole="button"
            accessibilityLabel={`Apply ${fx.replace(/-/g, ' ')} hover effect`}
            style={{ borderWidth: 1, borderColor: selectedHoverFx === fx || hoveredEffectButton === fx ? '#8EA5FF' : t.border, borderRadius: 22, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: selectedHoverFx === fx ? t.primary : hoveredEffectButton === fx ? '#263B68' : t.input, transform: hoveredEffectButton === fx ? [{ translateY: -1 }] : undefined }}
          >
            <Txt size={12} style={{ color: selectedHoverFx === fx ? '#FFFFFF' : t.text }}>{fx.replace(/-/g, ' ')}</Txt>
          </Pressable>
        ))}
      </View>
      <Txt bold size={12}>Hover color (glow / border)</Txt>
      <Input value={hoverColor} onChangeText={(v) => {
        setHoverColor(v);
        if (selectedElement && selectedHoverFx) refreshSelectedEffect(selectedHoverFx, v);
        if (selectedElement && hoveredHoverFx) previewHoverEffect(hoveredHoverFx, v);
      }} autoCapitalize="none" placeholder="#6366f1" />
      <View style={[row, { gap: 8, flexWrap: 'wrap' }]}>
        <View style={{ flex: 1, minWidth: 130 }}><Txt sub size={11}>Hover background color</Txt><Input value={hoverBackgroundColor} onChangeText={(v) => { setHoverBackgroundColor(v); if (selectedElement && selectedHoverFx) refreshSelectedEffect(selectedHoverFx, (selectedHoverFx === 'background-fade' || selectedHoverFx === 'color-wash' || selectedHoverFx === 'gradient' || selectedHoverFx === 'gradient-shift') ? v : effectColorFor(selectedHoverFx)); if (selectedElement && hoveredHoverFx) previewHoverEffect(hoveredHoverFx, (hoveredHoverFx === 'background-fade' || hoveredHoverFx === 'color-wash' || hoveredHoverFx === 'gradient' || hoveredHoverFx === 'gradient-shift') ? v : effectColorFor(hoveredHoverFx)); }} autoCapitalize="none" placeholder="#eaf5ff" /></View>
        <View style={{ flex: 1, minWidth: 130 }}><Txt sub size={11}>Hover text color</Txt><Input value={hoverTextColor} onChangeText={(v) => { setHoverTextColor(v); if (selectedElement && selectedHoverFx) refreshSelectedEffect(selectedHoverFx, selectedHoverFx === 'text-color' ? v : effectColorFor(selectedHoverFx)); if (selectedElement && hoveredHoverFx) previewHoverEffect(hoveredHoverFx, hoveredHoverFx === 'text-color' ? v : effectColorFor(hoveredHoverFx)); }} autoCapitalize="none" placeholder="#1684d8" /></View>
      </View>
      {!!(hoveredEffectCss || selectedEffectCss) && (
        <Card style={{ gap: 7 }}>
          <View style={[row, { justifyContent: 'space-between', alignItems: 'center' }]}>
            <Txt bold size={12}>{hoveredEffectCss ? 'Hover preview CSS · temporary' : 'Selected hover CSS · click an effect to apply'}</Txt>
            <Btn small kind="ghost" label="Copy CSS" onPress={() => {
              if (Platform.OS === 'web' && navigator.clipboard?.writeText) navigator.clipboard.writeText(hoveredEffectCss || selectedEffectCss).then(() => toast('CSS copied.')).catch(() => toast('Select the CSS below and copy it manually.'));
              else toast('Select the CSS below and copy it manually.');
            }} />
          </View>
          <Input multiline value={hoveredEffectCss || selectedEffectCss} onChangeText={(v) => { setSelectedEffectCss(v); setSelectedCss(v); sendToPreview({ p2cEditSelectedCss: v }); }} autoCapitalize="none" autoCorrect={false} mono style={{ minHeight: 150, fontSize: 11 }} />
          <View style={[row, { flexWrap: 'wrap' }]}>
            <Btn small label="Save CSS" onPress={saveSelectedCss} disabled={!selectedElement} />
            <Btn small kind="ghost" label="Reset preview" onPress={() => { setHoveredEffectCss(''); setHoveredHoverFx(null); setSelectedEffectCss(''); setSelectedCss(''); setSelectedHoverFx(null); sendToPreview({ p2cStudioClear: true }); sendToPreview({ p2cEditSelectedCss: '' }); }} />
          </View>
        </Card>
      )}
    </View>
  );

  const panel = (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <View style={row}>
        <Chip label="CSS Effects" active={rightTab === 'cssEffects'} onPress={() => setRightTab('cssEffects')} />
        <Chip label="Animate" active={rightTab === 'animate'} onPress={() => setRightTab('animate')} />
        <Chip label={`Code changes${pending ? ' •' : ''}`} active={rightTab === 'changes'} onPress={() => setRightTab('changes')} />
        <Chip label="Manage" active={rightTab === 'manage'} onPress={() => setRightTab('manage')} />
      </View>
      {rightTab === 'cssEffects' ? cssEffectsTab : rightTab === 'animate' ? animateTab : rightTab === 'changes' ? changesTab : manageTab}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {header}
      {fullScreen ? (
        <View style={{ flex: 1, minHeight: 0 }}><View style={{ padding: 6, alignItems: 'flex-start' }}><Btn small label="Exit Full Screen" onPress={() => { setFullScreen(false); if (Platform.OS === 'web') { try { document.exitFullscreen?.(); } catch {} } }} /></View><View style={{ flex: 1, minHeight: 0 }}>{previewPane}</View></View>
      ) : wide ? (
        <View style={{ flex: 1, flexDirection: 'row', minWidth: 0, minHeight: 0 }}>
          <View style={{ width: winW >= 1450 ? 360 : 300, minWidth: 230, borderRightWidth: 1, borderColor: t.border }}>{leftInspector}</View>
          <View style={{ flex: 1, minWidth: 0 }}>{previewPane}</View>
          <View style={{ width: winW >= 1450 ? 420 : 360, minWidth: 320, borderLeftWidth: 1, borderColor: t.border }}>{panel}</View>
        </View>
      ) : (
        <View style={{ flex: 1, minHeight: 0 }}>
          <View style={[row, { padding: 8, flexWrap: 'wrap' }]}>
            {(['files', 'preview', 'panel'] as const).map((k) => <Chip key={k} label={k === 'panel' ? 'Effects / Code' : k === 'files' ? 'Selected / Files' : 'Preview'} active={mobileTab === k} onPress={() => { setMobileTab(k); if (k === 'files') setShowFiles(false); }} />)}
          </View>
          <View style={{ flex: 1, minHeight: 0 }}>{mobileTab === 'files' ? leftInspector : mobileTab === 'preview' ? previewPane : panel}</View>
        </View>
      )}
    </View>
  );
}

function resolveLocal(from: string, href: string): string | null {
  const clean = href.split('#')[0].split('?')[0]; if (!clean) return null;
  const base = from.includes('/') ? from.slice(0, from.lastIndexOf('/')).split('/') : [];
  const parts = clean.startsWith('/') ? [] : base;
  for (const seg of clean.split('/')) { if (!seg || seg === '.') continue; if (seg === '..') parts.pop(); else parts.push(decodeURIComponent(seg)); }
  const p = parts.join('/'); return safePath(p) ? p : null;
}

function RemoveFrom({ onRemove }: { onRemove: (s: string) => void }) {
  const [v, setV] = useState('');
  return (
    <View style={row}>
      <Input value={v} onChangeText={setV} placeholder="footer, .hero, #about" autoCapitalize="none" mono style={{ flex: 1, minWidth: 160 }} />
      <Btn small kind="ghost" label="Exclude / remove" onPress={() => v.trim() && onRemove(v.trim())} />
    </View>
  );
}

function CodeBox({ change, view }: { change: FileChange; view: 'diff' | 'full' }) {
  const t = useTheme();
  const ops = useMemo(() => (view === 'diff' ? diffLines(change.before, change.after).filter((o, i, a) => o.t !== 'eq' || a.slice(Math.max(0, i - 2), i + 3).some((x) => x.t !== 'eq')) : []), [change, view]);
  const mono = Platform.OS === 'web' ? 'monospace' : undefined;
  return (
    <ScrollView horizontal style={{ borderWidth: 1, borderColor: t.border, borderRadius: 8, maxHeight: 460, backgroundColor: t.input }}>
      <ScrollView nestedScrollEnabled style={{ maxHeight: 456 }}>
        <View style={{ padding: 8 }}>
          <Txt size={11} sub>{change.path} · {change.status}</Txt>
          {view === 'full' ? <Txt selectable size={11} style={{ fontFamily: mono }}>{change.after || change.before}</Txt> : ops.map((o, i) => (
            <Txt key={i} selectable size={11} style={{ fontFamily: mono, color: o.t === 'add' ? t.ok : o.t === 'del' ? t.danger : t.sub, backgroundColor: o.t === 'add' ? 'rgba(61,220,151,.08)' : o.t === 'del' ? 'rgba(255,93,108,.08)' : 'transparent' }}>
              {(o.t === 'add' ? '+ ' : o.t === 'del' ? '- ' : '  ') + o.text}
            </Txt>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
}
