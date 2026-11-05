import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacedBlock, ProjectFile, SavedComponent, uid } from '../types';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { Draggable, DropArea, dndEnabled } from '../components/dnd';
import Preview from '../components/Preview';
import type { PreviewElement } from '../components/Preview';
import FullView from '../components/FullView';
import DeviceStage from '../components/DeviceStage';
import {
  ACCENT, BLOCKS, CATEGORIES, DEFAULT_THEME, TYPES, Theme, tagsOf, blockFromCode, blockPreviewFiles, composeCss, composeHtml, composeJs,
  composePage, pageFiles, placeFromBlock, placeFromSaved,
} from '../lib/blocks';
import { saveSingleFile } from '../lib/exporter';
import { confirmAction } from '../lib/confirm';
import {
  AnimConfig, AnimRule, DIRECTIONS, EASINGS, Pose, PRESETS, TRIGGERS, Trigger, buildRuleBundle, buildRuleCss, clamp, configFromPreset,
  hoverUsesTransition, isInfinite, mirrorConfig, presetOf, scaleIntensity, searchPresets, swapPoses, touchPreviewJs, validSelector, warningsFor, withInfinity,
} from '../lib/anim/anim3d';
import { FX, FxRule, buildFxBundle, fxOf } from '../lib/anim/anim3dFx';
import { classesOf, demoPlayJs, describeRule, resolvePick, rootSelector, triggerForPreset } from '../lib/anim/anim3dTools';

type Props = { components?: SavedComponent[]; onBack: () => void; toast: (message: string) => void };
type Item = {
  id: string; blockPid: string; selector: string; label: string; cfg: AnimConfig;
  // how the element was chosen, so "tap to edit" restores the inspector exactly (older saved items may not have these)
  target?: string; custom?: string; scoped?: boolean;
  /** switched off: stays in the list but is left out of the preview and of the exported code */
  off?: boolean;
  /** id of a special effect (see anim3dFx.ts). Special effects have no pose settings: cfg is only a placeholder. */
  fx?: string;
};
type Snap = { placed: PlacedBlock[]; items: Item[] };
type View_ = 'blocks' | 'page' | 'animate' | 'preview' | 'code';
type Out = 'html' | 'css' | 'js' | 'anim' | 'page';
type InspTab = 'style' | 'tune' | 'special' | 'layers';

const STORE = 'p2c:blocks3d:v1';
const FAV_STORE = 'p2c:blocks3d:favs';
const TAG_COLOR: Record<string, string> = { 'Live API': '#0891b2', 'E-commerce': '#ea580c', Form: '#7c3aed', Interactive: '#2563eb', Animated: '#db2777', Classic: '#a16207', Static: '#64748b' };
const SWATCHES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0f766e', '#0f172a'];
const MODE_LABEL: Record<string, string> = { hover: 'On hover', press: 'On press', scroll: 'On scroll into view', auto: 'Auto-run (loop)' };
const MODE_SHORT: Record<string, string> = { hover: 'hover', press: 'press', scroll: 'scroll', auto: 'auto' };
const DEV: [string, number | 'full'][] = [['Fit', 'full'], ['Phone 390', 390], ['Tablet 820', 820], ['Laptop 1280', 1280], ['Desktop 1440', 1440]];
const VIOLET = '#7c3aed';
const HISTORY_LIMIT = 60;
const STRIP = /\n*<!-- 3D animations -->\s*/g;
const noop = () => {};
const injectScript = (fs: ProjectFile[], src: string) =>
  fs.map((x) => (x.path === 'index.html' ? { ...x, content: x.content.replace('</body>', `<script src="${src}"></script>\n</body>`) } : x));

// ---- slider ---------------------------------------------------------------------------------
// The PanResponder is created ONCE and reads the latest props from a ref, so a drag is never interrupted by a re-render.
function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  const t = useTheme();
  const width = useRef(1);
  const startX = useRef(0);
  const live = useRef({ min, max, step, onChange });
  live.current = { min, max, step, onChange };
  const snap = (v: number) => {
    const { min: lo, max: hi, step: st } = live.current;
    return Math.round(clamp(Math.round(v / st) * st, lo, hi) * 10000) / 10000;
  };
  const setFrom = (x: number) => {
    const { min: lo, max: hi } = live.current;
    live.current.onChange(snap(lo + clamp(x / width.current, 0, 1) * (hi - lo)));
  };
  const panRef = useRef<ReturnType<typeof PanResponder.create> | null>(null);
  if (!panRef.current) {
    panRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => { startX.current = e.nativeEvent.locationX; setFrom(startX.current); },
      onPanResponderMove: (_e, g) => setFrom(startX.current + g.dx),
    });
  }
  const pan = panRef.current;
  const pct = (clamp(value, min, max) - min) / (max - min || 1);
  const nudge = (d: number) => onChange(snap(value + d * step));
  return (
    <View style={{ gap: 2 }}>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
        <Txt sub size={11}>{label}</Txt>
        <View style={[row, { gap: 2, flexWrap: 'nowrap' }]}>
          <Pressable onPress={() => nudge(-1)} accessibilityLabel={`Decrease ${label}`} style={{ paddingHorizontal: 7 }}><Txt bold size={15}>−</Txt></Pressable>
          <Txt bold size={11} style={{ minWidth: 54, textAlign: 'center' }}>{Math.round(value * 100) / 100}{unit}</Txt>
          <Pressable onPress={() => nudge(1)} accessibilityLabel={`Increase ${label}`} style={{ paddingHorizontal: 7 }}><Txt bold size={15}>+</Txt></Pressable>
        </View>
      </View>
      <View {...pan.panHandlers} onLayout={(e) => { width.current = Math.max(1, e.nativeEvent.layout.width); }}
        style={{ height: 26, justifyContent: 'center' }} accessibilityRole="adjustable" accessibilityLabel={label}>
        <View pointerEvents="none" style={{ height: 4, borderRadius: 2, backgroundColor: t.border }}>
          <View style={{ width: `${pct * 100}%`, height: 4, borderRadius: 2, backgroundColor: VIOLET }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: `${pct * 100}%`, marginLeft: -8, width: 16, height: 16, borderRadius: 8, backgroundColor: VIOLET, borderWidth: 2, borderColor: '#fff' }} />
      </View>
    </View>
  );
}

function Group({ title, children, right, hint }: { title: string; children: React.ReactNode; right?: React.ReactNode; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: t.border, backgroundColor: t.card }}>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'nowrap' }]}>
        <Txt bold size={11} style={{ letterSpacing: 0.8, color: t.sub }}>{title.toUpperCase()}</Txt>{right}
      </View>
      {!!hint && <Txt sub size={11}>{hint}</Txt>}
      {children}
    </View>
  );
}

/** Switch between 2-3 views ("Blocks / My page", "Preview / Code", the inspector tabs). */
function Segment<T extends string>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden', backgroundColor: t.input }}>
      {options.map(([k, l]) => (
        <Pressable key={k} onPress={() => onChange(k)} accessibilityRole="button" accessibilityState={{ selected: value === k }}
          style={{ flex: 1, paddingVertical: 9, paddingHorizontal: 10, alignItems: 'center', backgroundColor: value === k ? VIOLET : 'transparent' }}>
          <Txt bold size={13} style={{ color: value === k ? '#fff' : t.text }}>{l}</Txt>
        </Pressable>
      ))}
    </View>
  );
}

type FxGroupName = 'Cursor' | 'Click' | 'Scroll' | 'Ambient';

/** The ∞ button: the animation repeats forever (hover: while the mouse is over the element). */
function InfinityToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => onChange(!on)} accessibilityRole="switch" accessibilityState={{ checked: on }} accessibilityLabel="Infinity: repeat forever"
      style={[row, { flexWrap: 'nowrap', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: on ? '#0891b2' : t.border, backgroundColor: on ? '#0891b222' : 'transparent' }]}>
      <Txt bold size={26} style={{ color: on ? '#0891b2' : t.sub, lineHeight: 28 }}>∞</Txt>
      <View style={{ flex: 1 }}>
        <Txt bold size={13}>Infinity {on ? 'is ON' : 'is OFF'}</Txt>
        <Txt sub size={11}>{on ? 'Repeats forever (it goes there and back, so the loop is smooth).' : 'Plays once. Turn on to repeat forever.'}</Txt>
      </View>
      <View style={{ width: 42, height: 24, borderRadius: 12, padding: 2, backgroundColor: on ? '#0891b2' : t.border, alignItems: on ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
      </View>
    </Pressable>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return <Txt bold size={10} style={{ color, borderWidth: 1, borderColor: color, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 }}>{label}</Txt>;
}

export default function Animation3DStudio(props: Props) {
  const t = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const wide = winW >= 1100;
  const mine = props.components ?? [];

  const [placed, setPlaced] = useState<PlacedBlock[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [target, setTarget] = useState<string>('');
  const [custom, setCustom] = useState('');
  const [scoped, setScoped] = useState(true);
  const [cfg, setCfg] = useState<AnimConfig>(() => ({ ...configFromPreset('tilt'), trigger: 'hover' }));
  const [chosenTrigger, setChosenTrigger] = useState<Trigger | null>(null); // set only when the person picks "when it runs" on purpose
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pose, setPose] = useState<'from' | 'to'>('to');
  const [insp, setInsp] = useState<InspTab>('style');
  const [cat, setCat] = useState('All');
  const [type, setType] = useState('All');
  const [q, setQ] = useState('');
  const [presetQ, setPresetQ] = useState('');
  const [group, setGroup] = useState('All');
  const [favs, setFavs] = useState<string[]>([]);
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const [openSpecs, setOpenSpecs] = useState<string | null>(null);
  const [editCode, setEditCode] = useState<string | null>(null);
  const [out, setOut] = useState<Out>('html');
  const [accent, setAccent] = useState(ACCENT);
  const [accentText, setAccentText] = useState(ACCENT);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [device, setDevice] = useState<number | 'full'>('full');
  const [reload, setReload] = useState(0);
  const [playToken, setPlayToken] = useState(-1);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false); // off: hover works the moment you touch an element; the Play button demos it
  const [pickMode, setPickMode] = useState(false);
  const [stage, setStage] = useState({ pct: 100, w: 0 });
  const [full, setFull] = useState<{ title: string; files: ProjectFile[] } | null>(null);
  const [view, setView] = useState<View_>('blocks');
  const [left, setLeft] = useState<'blocks' | 'page'>('blocks');
  const [center, setCenter] = useState<'preview' | 'code'>('preview');
  const [ghost, setGhost] = useState<string | null>(null); // preset the pointer is over in the list: shown in the preview right away, never saved
  const ghostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, setHistTick] = useState(0);
  const first = useRef(true);

  // ---- history (undo / redo) ----
  const snapRef = useRef<Snap>({ placed, items });
  snapRef.current = { placed, items };
  const hist = useRef<{ past: Snap[]; future: Snap[] }>({ past: [], future: [] });
  const checkpoint = () => {
    hist.current.past.push(snapRef.current);
    if (hist.current.past.length > HISTORY_LIMIT) hist.current.past.shift();
    hist.current.future = [];
    setHistTick((n) => n + 1);
  };
  const applySnap = (s: Snap) => { setPlaced(s.placed); setItems(s.items); setEditingId(null); setFocusId(null); setReload((r) => r + 1); setHistTick((n) => n + 1); };
  const undo = () => {
    const s = hist.current.past.pop();
    if (!s) return;
    hist.current.future.push(snapRef.current);
    applySnap(s);
  };
  const redo = () => {
    const s = hist.current.future.pop();
    if (!s) return;
    hist.current.past.push(snapRef.current);
    applySnap(s);
  };

  // ---- persistence (this screen only, on this device) ----
  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORE), AsyncStorage.getItem(FAV_STORE)]).then(([raw, fav]) => {
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (Array.isArray(d.placed)) setPlaced(d.placed);
          if (Array.isArray(d.items)) setItems(d.items);
          if (typeof d.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(d.accent)) { setAccent(d.accent); setAccentText(d.accent); }
          if (d.theme && typeof d.theme === 'object') setTheme({ ...DEFAULT_THEME, ...d.theme });
        } catch { /* ignore broken data */ }
      }
      if (fav) { try { const f = JSON.parse(fav); if (Array.isArray(f)) setFavs(f.filter((x) => typeof x === 'string')); } catch { /* ignore */ } }
    }).catch(() => {}).finally(() => setLoaded(true));
  }, []);
  useEffect(() => {
    if (!loaded) return;
    if (first.current) { first.current = false; return; }
    const h = setTimeout(() => { AsyncStorage.setItem(STORE, JSON.stringify({ placed, items, accent, theme })).catch(() => props.toast('Could not save this page on the device.')); }, 500);
    return () => clearTimeout(h);
  }, [placed, items, accent, theme, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  const toggleFav = (id: string) => setFavs((cur) => {
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    AsyncStorage.setItem(FAV_STORE, JSON.stringify(next)).catch(() => {});
    return next;
  });

  const bump = () => setReload((r) => r + 1);
  const resetPicker = () => { setTarget(''); setCustom(''); setScoped(true); };
  const selectBlock = (id: string) => { setSel(id); resetPicker(); setEditingId(null); setPickMode(false); setInsp('style'); if (!wide) setView('animate'); };
  const insert = (b: PlacedBlock, at?: number) => {
    checkpoint();
    setPlaced((c) => { const a = [...c]; a.splice(at === undefined ? a.length : clamp(at, 0, a.length), 0, b); return a; });
    setSel(b.id); resetPicker(); setEditingId(null); bump();
  };
  const updateBlock = (id: string, patch: Partial<PlacedBlock>) => { setPlaced((c) => c.map((p) => (p.id === id ? { ...p, ...patch } : p))); bump(); };
  const move = (id: string, to: number) => {
    checkpoint();
    setPlaced((c) => {
      const from = c.findIndex((p) => p.id === id);
      if (from < 0) return c;
      const a = [...c]; const [item] = a.splice(from, 1);
      a.splice(clamp(to > from ? to - 1 : to, 0, a.length), 0, item);
      return a;
    });
    bump();
  };
  const remove = (id: string) => {
    checkpoint();
    const open = editingId ? items.find((x) => x.id === editingId) : undefined;
    if (open && open.blockPid === id) setEditingId(null);
    setItems((c) => c.filter((x) => x.blockPid !== id));
    setPlaced((c) => c.filter((p) => p.id !== id)); if (sel === id) setSel(null); if (editCode === id) setEditCode(null); bump();
  };

  /** A block was dropped (or "Add" pressed) at position `at`. Same data format as the Code blocks screen. */
  const onData = useCallback((data: string, at?: number) => {
    const [kind, ...rest] = data.split(':');
    const id = rest.join(':');
    if (kind === 'lib') { const b = BLOCKS.find((x) => x.id === id); if (b) insert(placeFromBlock(b), at); }
    else if (kind === 'saved') { const c = mine.find((x) => x.id === id); if (c) insert(placeFromSaved(c), at); }
    else if (kind === 'move') move(id, at === undefined ? Number.MAX_SAFE_INTEGER : at);
  }, [mine]); // eslint-disable-line react-hooks/exhaustive-deps
  const onText = (text: string) => { if (text.trim()) { insert(blockFromCode('Pasted code', text)); props.toast('Code added as a block.'); } };

  // ---- 3D output ----
  const live = useMemo(() => items.filter((x) => placed.some((p) => p.id === x.blockPid)), [items, placed]);
  const active = useMemo(() => live.filter((x) => !x.off), [live]);
  const anim = useMemo(() => active.filter((x) => !x.fx), [active]);
  const rules: AnimRule[] = useMemo(() => anim.map((x, i) => ({ selector: x.selector, cfg: x.cfg, key: `p2c3d-${i + 1}` })), [anim]);
  const fxRules: FxRule[] = useMemo(() => active.filter((x) => x.fx).map((x, i) => ({ selector: x.selector, fx: x.fx as string, key: `p2c3dfx-${i + 1}` })), [active]);
  const bundle = useMemo(() => {
    const a = buildRuleBundle(rules); const f = buildFxBundle(fxRules);
    return { css: [a.css, f.css].filter(Boolean).join('\n'), js: [a.js, f.js].filter(Boolean).join('\n') };
  }, [rules, fxRules]);
  const total = rules.length + fxRules.length;
  const withAnim = useMemo<PlacedBlock[]>(() => (total
    ? [...placed, { id: 'p2c3d', blockId: 'p2c3d', name: '3D animations', html: '', css: bundle.css, js: bundle.js }]
    : placed), [placed, total, bundle]);

  const html = useMemo(() => composeHtml(withAnim, accent).replace(STRIP, '\n').trim(), [withAnim, accent]);
  const css = useMemo(() => composeCss(withAnim, accent, theme), [withAnim, accent, theme]);
  const js = useMemo(() => composeJs(withAnim), [withAnim]);
  const page = useMemo(() => composePage(withAnim, accent, 'My 3D page', theme).replace(STRIP, '\n'), [withAnim, accent, theme]);
  const animOnly = useMemo(() => [bundle.css && `/* ---- CSS ---- */\n${bundle.css}`, bundle.js && `// ---- JavaScript ----\n${bundle.js}`].filter(Boolean).join('\n'), [bundle]);
  const text = out === 'html' ? html : out === 'css' ? css : out === 'js' ? js : out === 'anim' ? animOnly : page;

  // files = what the person exports / sees in full screen. previewFiles = the same page + a preview-only "Play" script.
  const files = useMemo<ProjectFile[]>(() => {
    const f = pageFiles(withAnim, accent, theme).map((x) => (x.path === 'index.html' ? { ...x, content: x.content.replace(STRIP, '\n') } : x));
    // the helper makes hover / press start instantly with a mouse AND with a finger, on every device
    if (!rules.some((x) => x.cfg.trigger === 'hover' || x.cfg.trigger === 'press')) return f;
    return [...injectScript(f, 'p2c3d-touch.js'), { path: 'p2c3d-touch.js', content: touchPreviewJs(rules) }];
  }, [withAnim, accent, theme, rules]);

  const copy = async (s: string, label: string) => {
    if (!s.trim()) { props.toast('Nothing to copy yet. Add a block first.'); return; }
    await Clipboard.setStringAsync(s);
    props.toast(`${label} copied.`);
  };
  const applyAccent = (v: string) => { setAccentText(v); if (/^#[0-9a-fA-F]{6}$/.test(v)) { setAccent(v.toLowerCase()); bump(); } };
  const setThemePart = (patch: Partial<Theme>) => { setTheme((c) => ({ ...c, ...patch })); bump(); };

  // ---- selection / inspector ----
  const block = placed.find((p) => p.id === sel);
  const root = block ? rootSelector(block.html) : '';
  const classes = block ? classesOf(block.html) : [];
  const customOk = custom.trim() === '' || validSelector(custom);
  const chosen = custom.trim() && customOk ? custom.trim() : target ? '.' + target : root;
  const finalSelector = !chosen ? '' : custom.trim() || !scoped || chosen === root || !root ? chosen : `${root} ${chosen}`;
  const blockItems = live.filter((x) => x.blockPid === sel);
  const editing = editingId ? items.find((x) => x.id === editingId) : undefined;
  const labelFor = custom.trim() || target || 'whole block';
  const tips = useMemo(() => warningsFor(cfg), [cfg]);

  const playing = rules.length > 0 && (autoPlay || playToken === reload);
  // Hover-preview of a preset: the same page, but the element you selected plays that preset on a loop. Preview only, never exported.
  const ghostFiles = useMemo<ProjectFile[] | null>(() => {
    if (!ghost || !block || !finalSelector || !validSelector(finalSelector)) return null;
    const gcfg = withInfinity({ ...configFromPreset(ghost), trigger: 'auto' as Trigger }, true);
    const rs: AnimRule[] = [...rules.filter((r_) => r_.selector !== finalSelector), { selector: finalSelector, cfg: gcfg, key: 'p2c3d-ghost' }];
    const a = buildRuleBundle(rs); const f = buildFxBundle(fxRules);
    const bl: PlacedBlock = { id: 'p2c3d', blockId: 'p2c3d', name: '3D animations', html: '', css: [a.css, f.css].filter(Boolean).join('\n'), js: [a.js, f.js].filter(Boolean).join('\n') };
    return pageFiles([...placed, bl], accent, theme).map((x) => (x.path === 'index.html' ? { ...x, content: x.content.replace(STRIP, '\n') } : x));
  }, [ghost, block, finalSelector, rules, fxRules, placed, accent, theme]);
  const showGhost = (id: string | null) => {
    if (ghostTimer.current) clearTimeout(ghostTimer.current);
    ghostTimer.current = setTimeout(() => setGhost(id), id ? 70 : 120); // short wait so moving across rows does not reload the preview for every row
  };
  useEffect(() => () => { if (ghostTimer.current) clearTimeout(ghostTimer.current); }, []);

  const previewFiles = useMemo<ProjectFile[]>(() => {
    if (ghostFiles) return ghostFiles;
    if (!playing) return files;
    const fid = focusId ?? editingId;
    const idx = fid ? anim.findIndex((x) => x.id === fid) : -1;
    return [...injectScript(files, 'p2c3d-demo.js'), { path: 'p2c3d-demo.js', content: demoPlayJs(rules, idx >= 0 ? rules[idx].key : undefined) }];
  }, [ghostFiles, files, playing, rules, anim, focusId, editingId]);


  const update = useCallback((patch: Partial<AnimConfig>) => setCfg((c) => ({ ...c, ...patch })), []);
  const updatePose = useCallback((patch: Partial<Pose>) => setCfg((c) => ({ ...c, [pose]: { ...c[pose], ...patch } })), [pose]);
  const setTrigger = (x: Trigger) => { setChosenTrigger(x); update({ trigger: x }); };
  const pickPreset = (id: string) => setCfg({ ...configFromPreset(id), trigger: triggerForPreset(presetOf(id).trigger, chosenTrigger) });
  /** Click on a preset in the list: it is applied to the selected element at once (no extra Add press), and the next click swaps it. */
  const applyPreset = (id: string) => {
    const next: AnimConfig = { ...configFromPreset(id), trigger: triggerForPreset(presetOf(id).trigger, chosenTrigger) };
    setCfg(next); setGhost(null);
    if (!editingId && block && finalSelector && validSelector(finalSelector)) addAnimation(next, true);
  };
  const copyPreset = (id: string) => {
    const c: AnimConfig = { ...configFromPreset(id), trigger: triggerForPreset(presetOf(id).trigger, chosenTrigger) };
    const b = buildRuleCss(c, finalSelector || '.element', 'p2c3d-1');
    copy([`/* CSS */\n${b.css}`, b.js && `// JavaScript\n${b.js}`].filter(Boolean).join('\n'), `${presetOf(id).label} code`);
  };
  const chooseTarget = (c: string) => { setTarget(c); setCustom(''); };
  const surprise = () => { const p = PRESETS[Math.floor(Math.random() * PRESETS.length)]; pickPreset(p.id); props.toast(`Preset: ${p.label}.`); };

  // LIVE EDIT: after an animation is added (or tapped in the list) every slider / chip change updates it, debounced, so the
  // person never has to press "Add" again to see a change. Changing the element chip re-targets the same animation.
  useEffect(() => {
    if (!editingId || !block || !finalSelector || !validSelector(finalSelector)) return;
    const h = setTimeout(() => setItems((cur) => {
      const me = cur.find((x) => x.id === editingId);
      if (!me || (me.cfg === cfg && me.selector === finalSelector)) return cur;
      return cur
        .filter((x) => x.id === editingId || !(x.blockPid === block.id && x.selector === finalSelector))
        .map((x) => (x.id === editingId ? { ...x, selector: finalSelector, cfg, label: labelFor, target, custom, scoped } : x));
    }), 60);
    return () => clearTimeout(h);
  }, [cfg, finalSelector, editingId, block, labelFor, target, custom, scoped]);

  const addAnimation = (use: AnimConfig = cfg, stay = false) => {
    if (!block) { props.toast('Add a block to your page and select it first.'); return; }
    if (!finalSelector || !validSelector(finalSelector)) { props.toast('Pick an element of the block, or type a valid selector like .bk-card'); return; }
    checkpoint();
    const item: Item = { id: uid(), blockPid: block.id, selector: finalSelector, label: labelFor, cfg: use, target, custom, scoped };
    setItems((cur) => [...cur.filter((x) => !(x.blockPid === block.id && x.selector === finalSelector && !x.fx)), item]);
    setEditingId(item.id); setFocusId(null); if (!stay) setInsp('tune');
    bump();
    props.toast(`${presetOf(use.preset).label} added to ${finalSelector}. Keep adjusting: changes update live.`);
  };

  const editItem = (x: Item) => {
    if (x.fx) { setSel(x.blockPid); setEditingId(null); setInsp('special'); props.toast(`${fxOf(x.fx)?.label ?? 'Effect'} on ${x.selector}. Switch it off or remove it in Layers.`); if (!wide) setView('animate'); return; }
    checkpoint();
    setSel(x.blockPid); setCfg(x.cfg); setChosenTrigger(x.cfg.trigger); setPose('to'); setPickMode(false); setInsp('tune');
    if (x.target === undefined && x.custom === undefined) { setTarget(''); setCustom(x.selector); setScoped(true); }
    else { setTarget(x.target ?? ''); setCustom(x.custom ?? ''); setScoped(x.scoped ?? true); }
    setEditingId(x.id); setFocusId(x.id); setPlayToken(reload + 1); bump();
    if (!wide) setView('animate');
  };
  const copyToNew = (x: Item) => {
    setSel(x.blockPid); setCfg(x.cfg); setChosenTrigger(x.cfg.trigger); resetPicker(); setEditingId(null); setInsp('style');
    props.toast('Settings copied. Pick another element, then press Add 3D animation.');
    if (!wide) setView('animate');
  };
  const removeItem = (id: string) => { checkpoint(); setItems((c) => c.filter((y) => y.id !== id)); if (editingId === id) setEditingId(null); bump(); };
  const toggleItem = (id: string) => { checkpoint(); setItems((c) => c.map((y) => (y.id === id ? { ...y, off: !y.off } : y))); bump(); };
  const toggleInfinity = (x: Item) => { checkpoint(); setItems((c) => c.map((y) => (y.id === x.id ? { ...y, cfg: withInfinity(y.cfg, !isInfinite(y.cfg)) } : y))); if (editingId === x.id) setCfg((c) => withInfinity(c, !isInfinite(c))); bump(); };
  const setInfinity = (on: boolean) => { setCfg((c) => withInfinity(c, on)); if (on && cfg.trigger === 'hover') props.toast('Infinity on: it loops while the mouse is over the element.'); };
  const removeFx = (id: string) => {
    checkpoint();
    setItems((cur) => cur.filter((x) => !(x.blockPid === sel && x.selector === finalSelector && x.fx === id)));
    bump(); props.toast(`${fxOf(id)?.label ?? 'Effect'} removed from ${finalSelector}. Pick another one.`);
  };
  const addFx = (id: string) => {
    if (!block) { props.toast('Add a block to your page and select it first.'); return; }
    if (!finalSelector || !validSelector(finalSelector)) { props.toast('Pick an element of the block, or type a valid selector like .bk-card'); return; }
    checkpoint();
    const f = fxOf(id);
    const item: Item = { id: uid(), blockPid: block.id, selector: finalSelector, label: labelFor, cfg, target, custom, scoped, fx: id };
    setItems((cur) => [...cur.filter((x) => !(x.blockPid === block.id && x.selector === finalSelector && x.fx === id)), item]);
    bump();
    props.toast(`${f?.label ?? 'Effect'} added to ${finalSelector}. Try it: ${f?.how ?? 'use the preview'}.`);
  };
  const playNow = (id?: string | null) => {
    if (!rules.length) { props.toast(fxRules.length ? 'Special effects react to your mouse, scroll or click. Try them in the preview.' : 'Add a 3D animation first, then press Play.'); return; }
    setFocusId(id ?? null); setPlayToken(reload + 1); bump();
  };

  /** Give the current preset to the outer element of every block on the page that has no animation yet. */
  const animateAll = () => {
    if (!placed.length) { props.toast('Add a block first.'); return; }
    const add: Item[] = [];
    placed.forEach((p) => {
      const sel_ = rootSelector(p.html);
      if (!sel_ || !validSelector(sel_)) return;
      if (items.some((x) => x.blockPid === p.id && x.selector === sel_)) return;
      add.push({ id: uid(), blockPid: p.id, selector: sel_, label: 'whole block', cfg: { ...cfg, from: { ...cfg.from }, to: { ...cfg.to } }, target: '', custom: '', scoped: true });
    });
    if (!add.length) { props.toast('Every block already has an animation on its outer element.'); return; }
    checkpoint(); setItems((c) => [...c, ...add]); setEditingId(null); bump();
    props.toast(`${presetOf(cfg.preset).label} added to ${add.length} block${add.length === 1 ? '' : 's'}.`);
  };

  // click an element INSIDE the preview to choose it (uses the preview's built-in inspector)
  const onPick = useCallback((el: PreviewElement) => {
    setPickMode(false);
    const hit = resolvePick(el.selector, placed);
    if (!hit) { props.toast('That element is not part of a block. Pick another one or type a selector.'); return; }
    setSel(hit.blockPid); setTarget(hit.target); setCustom(''); setScoped(true); setEditingId(null); setInsp('style');
    props.toast(hit.target ? `Selected .${hit.target}. Choose a preset, then press Add.` : 'Whole block selected. Choose a preset, then press Add.');
  }, [placed, props]);

  // ---------------------------------------------------------------- palette (same cards as Code blocks)
  const list = useMemo(() => BLOCKS.filter((b) => (cat === 'All' || cat === b.category) && (type === 'All' || tagsOf(b).includes(type)) && (!q.trim() || (b.name + ' ' + b.description + ' ' + b.category + ' ' + tagsOf(b).join(' ')).toLowerCase().includes(q.toLowerCase()))), [cat, type, q]);
  const showMine = cat === 'All' || cat === 'My components';
  const mineList = mine.filter((c) => !q.trim() || c.name.toLowerCase().includes(q.toLowerCase()));

  const palette = (
    <View style={{ gap: 10 }}>
      <Txt bold size={16}>Block library</Txt>
      <Txt sub size={12}>
        {dndEnabled ? 'Drag a block into "My page", or press Add. ' : 'Press Add to put a block into "My page". '}
        Then pick any part of it and give it a 3D animation.
      </Txt>
      <Input placeholder="Search blocks (hero, form, footer ...)" value={q} onChangeText={setQ} autoCapitalize="none" />
      <View style={row}>{CATEGORIES.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}</View>
      <Txt sub size={12}>Type (what the block does):</Txt>
      <View style={row}>{['All', ...TYPES].map((c) => <Chip key={c} label={c} active={type === c} onPress={() => setType(c)} />)}</View>
      {list.map((b) => (
        <Draggable key={b.id} data={'lib:' + b.id}>
          <Card style={{ gap: 6 }}>
            <View style={row}><Txt bold style={{ flexShrink: 1 }}>{b.name}</Txt><Txt sub size={11}>{b.category}</Txt></View>
            <View style={row}>{tagsOf(b).map((x) => <Txt key={x} size={11} bold style={{ color: TAG_COLOR[x] || t.text, borderWidth: 1, borderColor: TAG_COLOR[x] || t.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>{x}</Txt>)}</View>
            <Txt sub size={12}>{b.description}</Txt>
            <View style={row}>
              <Btn small label="Add" onPress={() => { insert(placeFromBlock(b)); props.toast(`"${b.name}" added to your page.`); if (!wide) setView('animate'); }} />
              <Btn small kind="ghost" label={openPreview === b.id ? 'Hide preview' : 'Preview'} onPress={() => setOpenPreview(openPreview === b.id ? null : b.id)} />
              <Btn small kind="ghost" label="Full screen" onPress={() => setFull({ title: b.name, files: blockPreviewFiles(placeFromBlock(b), accent, theme) })} />
              {!!b.specs && <Btn small kind="ghost" label={openSpecs === b.id ? 'Hide specs' : 'Specs'} onPress={() => setOpenSpecs(openSpecs === b.id ? null : b.id)} />}
            </View>
            {openSpecs === b.id && !!b.specs && <View style={{ gap: 3 }}>{b.specs.map((x) => <Txt key={x} sub size={12}>{'• ' + x}</Txt>)}</View>}
            {openPreview === b.id && (
              <View style={{ height: 300, borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden' }}>
                <Preview files={blockPreviewFiles(placeFromBlock(b), accent, theme)} width="full" reloadKey={0} onMessage={noop} />
              </View>
            )}
          </Card>
        </Draggable>
      ))}
      {showMine && mineList.length > 0 && <Txt bold style={{ marginTop: 6 }}>My components</Txt>}
      {showMine && mineList.map((c) => (
        <Draggable key={c.id} data={'saved:' + c.id}>
          <Card style={{ gap: 6 }}>
            <Txt bold>{c.name}</Txt>
            {!!c.notes && <Txt sub size={12}>{c.notes}</Txt>}
            <Btn small label="Add" onPress={() => { insert(placeFromSaved(c)); if (!wide) setView('animate'); }} />
          </Card>
        </Draggable>
      ))}
      {list.length === 0 && !(showMine && mineList.length) && <Card><Txt sub>No block matches. Try another word or category.</Txt></Card>}
    </View>
  );

  // ---------------------------------------------------------------- my page (placed blocks)
  const canvas = (
    <View style={{ gap: 10 }}>
      <Txt bold size={16}>My page ({placed.length} block{placed.length === 1 ? '' : 's'})</Txt>
      <Txt sub size={12}>
        {dndEnabled ? 'Drop blocks here and drag a block up or down to reorder. ' : ''}
        Tap a block to select it for 3D animation. Your page and animations are saved on this device.
      </Txt>
      <View style={row}>
        <Btn small kind="ghost" label="+ Blank block (paste my code)" onPress={() => { const b = blockFromCode('My code', ''); insert(b); setEditCode(b.id); }} />
        {placed.length > 0 && <Btn small kind="danger" label="Clear page" onPress={() => confirmAction('Clear the page?', 'All blocks and 3D animations on this page are removed. The block library and My components are not touched.', 'Clear', () => { checkpoint(); setPlaced([]); setItems([]); setSel(null); setEditingId(null); setEditCode(null); bump(); })} />}
      </View>
      <DropArea onData={(d) => onData(d)} onText={onText} style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: t.border, borderRadius: 14, padding: 10, minHeight: 90 }} overStyle={{ borderColor: VIOLET, backgroundColor: VIOLET + '22' }}>
        <View style={{ gap: 8 }}>
          {placed.length === 0 && <Txt sub>{dndEnabled ? 'Drag a block here' : 'Press Add on a block'} to start your page.</Txt>}
          {placed.map((p, i) => {
            const n = live.filter((x) => x.blockPid === p.id).length;
            const on = sel === p.id;
            return (
              <DropArea key={p.id} onData={(d) => onData(d, i)} onText={onText} style={{ borderRadius: 12 }} overStyle={{ outline: `2px solid ${VIOLET}` }}>
                <Draggable data={'move:' + p.id}>
                  <Pressable onPress={() => selectBlock(p.id)}>
                    <Card style={{ gap: 6, borderColor: on ? VIOLET : t.border, borderLeftWidth: on ? 5 : 1 }}>
                      <View style={row}>
                        <Txt sub>{dndEnabled ? '::' : ''}</Txt>
                        <Txt bold style={{ flexShrink: 1 }}>{i + 1}. {p.name}</Txt>
                        {n > 0 && <Badge label={`3D × ${n}`} color={VIOLET} />}
                      </View>
                      <View style={row}>
                        <Btn small label="Animate in 3D" onPress={() => selectBlock(p.id)} />
                        <Btn small kind="ghost" label="Up" onPress={() => move(p.id, i - 1)} disabled={i === 0} />
                        <Btn small kind="ghost" label="Down" onPress={() => move(p.id, i + 2)} disabled={i === placed.length - 1} />
                        <Btn small kind="ghost" label={editCode === p.id ? 'Close code' : 'Edit code'} onPress={() => setEditCode(editCode === p.id ? null : p.id)} />
                        <Btn small kind="ghost" label="Duplicate" onPress={() => insert({ ...p, id: uid() }, i + 1)} />
                        <Btn small kind="danger" label="Remove" onPress={() => remove(p.id)} />
                      </View>
                      {editCode === p.id && (
                        <View style={{ gap: 6 }}>
                          <Input value={p.name} onChangeText={(v) => updateBlock(p.id, { name: v })} placeholder="Block name" />
                          <Txt bold size={12}>HTML</Txt>
                          <Input mono multiline value={p.html} onChangeText={(v) => updateBlock(p.id, { html: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 140, textAlignVertical: 'top', fontSize: 12 }} />
                          <Txt bold size={12}>CSS</Txt>
                          <Input mono multiline value={p.css} onChangeText={(v) => updateBlock(p.id, { css: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 100, textAlignVertical: 'top', fontSize: 12 }} />
                          <Txt bold size={12}>JavaScript</Txt>
                          <Input mono multiline value={p.js} onChangeText={(v) => updateBlock(p.id, { js: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 80, textAlignVertical: 'top', fontSize: 12 }} />
                          <Txt sub size={11}>3D animations pick elements by their class names, so keep the classes when you edit the HTML.</Txt>
                        </View>
                      )}
                    </Card>
                  </Pressable>
                </Draggable>
              </DropArea>
            );
          })}
        </View>
      </DropArea>
    </View>
  );

  // ---------------------------------------------------------------- 3D inspector
  const cur = cfg[pose] as Required<Pose>;
  const g = (k: keyof Pose, fallback = 0) => (cur[k] ?? fallback);
  const presetGroups = ['All', 'Favorites', ...Array.from(new Set(PRESETS.map((p) => p.group)))];
  const shownPresets = useMemo(() => {
    const base = searchPresets(presetQ, group === 'Favorites' ? 'All' : group);
    return group === 'Favorites' ? base.filter((p) => favs.includes(p.id)) : base;
  }, [presetQ, group, favs]);

  const stylePanel = (
    <View style={{ gap: 10 }}>
      <Group title={`1. Element in “${block?.name ?? ''}”`} right={<Chip label={pickMode ? 'Click an element…' : 'Pick in preview'} active={pickMode} onPress={() => { setPickMode((v) => !v); if (!wide) setView('preview'); if (center !== 'preview') setCenter('preview'); }} />}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Whole block" active={!target && !custom.trim()} onPress={() => chooseTarget('')} />
          {classes.filter((c) => '.' + c !== root).map((c) => <Chip key={c} label={'.' + c} active={target === c && !custom.trim()} onPress={() => chooseTarget(c)} />)}
        </View>
        <Input value={custom} onChangeText={setCustom} placeholder="or type a selector, e.g. .bk-card" autoCapitalize="none" autoCorrect={false} />
        {!customOk && <Txt size={11} style={{ color: t.danger }}>Use only letters, numbers, - _ . # &gt; and spaces.</Txt>}
        <View style={row}>
          <Chip label="Only inside this block" active={scoped} onPress={() => setScoped(true)} />
          <Chip label="Everywhere on the page" active={!scoped} onPress={() => setScoped(false)} />
        </View>
        <Txt sub size={11}>Selector: <Txt size={11} bold>{finalSelector || '(none)'}</Txt></Txt>
      </Group>

      <Group title={`2. Animation preset (${shownPresets.length}/${PRESETS.length})`} hint={block ? 'Point at a preset to see it on the selected element right away. Click to apply it, click another to swap. Copy gives its code.' : undefined} right={<Btn small kind="ghost" label="Surprise me" onPress={surprise} />}>
        <Input value={presetQ} onChangeText={setPresetQ} placeholder="Search presets (flip, card, blur, entrance ...)" autoCapitalize="none" autoCorrect={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {presetGroups.map((x) => <Chip key={x} label={x === 'Favorites' ? `★ Favorites (${favs.length})` : x} active={group === x} onPress={() => setGroup(x)} />)}
        </ScrollView>
        <View style={{ gap: 6 }}>
          {shownPresets.map((p) => {
            const on = cfg.preset === p.id;
            return (
              <Pressable key={p.id} onPress={() => applyPreset(p.id)} onHoverIn={() => showGhost(p.id)} onHoverOut={() => showGhost(null)}
                onLongPress={() => { showGhost(p.id); setTimeout(() => showGhost(null), 3500); }} accessibilityRole="button" accessibilityState={{ selected: on }}
                style={[row, { flexWrap: 'nowrap', gap: 8, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: on ? VIOLET : t.border, backgroundColor: on ? VIOLET + '1f' : 'transparent' }]}>
                <View style={{ flex: 1 }}>
                  <Txt bold size={13}>{p.label}</Txt>
                  <Txt sub size={10}>{p.group} · {MODE_SHORT[p.trigger]} · {(p.duration / 1000).toFixed(2).replace(/\.?0+$/, '')}s · {p.easing}</Txt>
                </View>
                <Pressable onPress={() => copyPreset(p.id)} accessibilityLabel={`Copy code of ${p.label}`} hitSlop={6}>
                  <Txt bold size={11} style={{ color: VIOLET }}>Copy</Txt>
                </Pressable>
                <Pressable onPress={() => toggleFav(p.id)} accessibilityLabel={favs.includes(p.id) ? `Remove ${p.label} from favorites` : `Add ${p.label} to favorites`} hitSlop={8}>
                  <Txt bold size={18} style={{ color: favs.includes(p.id) ? '#f59e0b' : t.sub }}>{favs.includes(p.id) ? '★' : '☆'}</Txt>
                </Pressable>
              </Pressable>
            );
          })}
          {shownPresets.length === 0 && <Txt sub size={12}>{group === 'Favorites' ? 'Tap the ☆ on a preset to keep it here.' : 'No preset matches. Try another word.'}</Txt>}
        </View>
      </Group>

      <Group title="3. When does it run?">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{TRIGGERS.map((x) => <Chip key={x} label={MODE_LABEL[x]} active={cfg.trigger === x} onPress={() => setTrigger(x)} />)}</View>
        <InfinityToggle on={isInfinite(cfg)} onChange={setInfinity} />
        <Txt sub size={11}>
          {cfg.trigger === 'hover' ? (hoverUsesTransition(cfg) ? 'Glides from the start pose to the end pose while hovered and back when the mouse leaves.' : 'Plays only while the mouse is over the element (repeat 0 = keeps looping while hovered, stops on leave).')
            : cfg.trigger === 'press' ? 'Plays while the element is pressed.' : cfg.trigger === 'scroll' ? 'Plays once when the element scrolls into view.' : 'Runs on its own as soon as the page loads (repeat 0 = infinite).'}
        </Txt>
      </Group>
      {tips.length > 0 && <Tips tips={tips} />}
      {!editing && <Btn label="Add 3D animation to element" onPress={() => addAnimation()} />}
      <Btn kind="ghost" label="Animate every block with this preset" onPress={animateAll} />
    </View>
  );

  const tunePanel = (
    <View style={{ gap: 10 }}>
      <Group title="Quick tools">
        <InfinityToggle on={isInfinite(cfg)} onChange={setInfinity} />
        <View style={row}>
          <Btn small kind="ghost" label="Swap start / end" onPress={() => setCfg((c) => swapPoses(c))} />
          <Btn small kind="ghost" label="Mirror left ↔ right" onPress={() => setCfg((c) => mirrorConfig(c))} />
          <Btn small kind="ghost" label="Subtler (−30%)" onPress={() => setCfg((c) => scaleIntensity(c, 0.7))} />
          <Btn small kind="ghost" label="Stronger (+40%)" onPress={() => setCfg((c) => scaleIntensity(c, 1.4))} />
          <Btn small kind="ghost" label="Reset" onPress={() => pickPreset(cfg.preset)} />
        </View>
      </Group>
      <Group title="Pose" right={<View style={row}><Chip label="Start" active={pose === 'from'} onPress={() => setPose('from')} /><Chip label="End" active={pose === 'to'} onPress={() => setPose('to')} /></View>}
        hint={pose === 'from' ? 'Start = how the element looks at rest (hover) or before it plays.' : 'End = how the element looks when the animation is on.'}>
        <Txt bold size={12}>Rotate</Txt>
        <Slider label="Rotate X" value={cur.rotX} min={-360} max={360} unit="°" onChange={(v) => updatePose({ rotX: v })} />
        <Slider label="Rotate Y" value={cur.rotY} min={-360} max={360} unit="°" onChange={(v) => updatePose({ rotY: v })} />
        <Slider label="Rotate Z" value={cur.rotZ} min={-360} max={360} unit="°" onChange={(v) => updatePose({ rotZ: v })} />
        <Txt bold size={12}>Scale</Txt>
        <Slider label="Scale X" value={cur.scaleX} min={0.1} max={3} step={0.05} onChange={(v) => updatePose({ scaleX: v })} />
        <Slider label="Scale Y" value={cur.scaleY} min={0.1} max={3} step={0.05} onChange={(v) => updatePose({ scaleY: v })} />
        <Slider label="Scale Z" value={cur.scaleZ} min={0.1} max={3} step={0.05} onChange={(v) => updatePose({ scaleZ: v })} />
        <Txt bold size={12}>Move</Txt>
        <Slider label="Translate X" value={cur.transX} min={-200} max={200} unit="px" onChange={(v) => updatePose({ transX: v })} />
        <Slider label="Translate Y" value={cur.transY} min={-200} max={200} unit="px" onChange={(v) => updatePose({ transY: v })} />
        <Slider label="Translate Z (depth)" value={cur.transZ} min={-400} max={400} unit="px" onChange={(v) => updatePose({ transZ: v })} />
        <Txt bold size={12}>Look</Txt>
        <Slider label="Skew X" value={g('skewX')} min={-45} max={45} unit="°" onChange={(v) => updatePose({ skewX: v })} />
        <Slider label="Skew Y" value={g('skewY')} min={-45} max={45} unit="°" onChange={(v) => updatePose({ skewY: v })} />
        <Slider label="Blur" value={g('blur')} min={0} max={20} step={0.5} unit="px" onChange={(v) => updatePose({ blur: v })} />
        <Slider label="Opacity" value={cur.opacity} min={0} max={1} step={0.05} onChange={(v) => updatePose({ opacity: v })} />
      </Group>
      <Group title="Camera & timing">
        <Slider label="Perspective" value={cfg.perspective} min={100} max={2000} step={10} unit="px" onChange={(v) => update({ perspective: v })} />
        <Slider label="Origin X" value={cfg.originX} min={0} max={100} unit="%" onChange={(v) => update({ originX: v })} />
        <Slider label="Origin Y" value={cfg.originY} min={0} max={100} unit="%" onChange={(v) => update({ originY: v })} />
        <Slider label="Duration" value={cfg.duration} min={100} max={8000} step={50} unit="ms" onChange={(v) => update({ duration: v })} />
        <Slider label="Delay" value={cfg.delay} min={0} max={4000} step={50} unit="ms" onChange={(v) => update({ delay: v })} />
        <Slider label="Speed" value={cfg.speed} min={0.25} max={3} step={0.25} unit="×" onChange={(v) => update({ speed: v })} />
        <Slider label="Repeat (0 = infinite)" value={cfg.repeat} min={0} max={20} onChange={(v) => update({ repeat: v })} />
        <Slider label="Stagger per sibling (auto / scroll)" value={cfg.stagger ?? 0} min={0} max={500} step={10} unit="ms" onChange={(v) => update({ stagger: v })} />
        <Txt sub size={11}>Easing</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{EASINGS.map((e) => <Chip key={e} label={e} active={cfg.easing === e} onPress={() => update({ easing: e })} />)}</View>
        <Txt sub size={11}>Direction</Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{DIRECTIONS.map((d) => <Chip key={d} label={d} active={cfg.direction === d} onPress={() => update({ direction: d })} />)}</View>
      </Group>
      {tips.length > 0 && <Tips tips={tips} />}
    </View>
  );

  const fxGroups: FxGroupName[] = ['Cursor', 'Click', 'Scroll', 'Ambient'];
  const specialPanel = (
    <View style={{ gap: 10 }}>
      <Group title="Element" right={<Chip label={pickMode ? 'Click an element…' : 'Pick in preview'} active={pickMode} onPress={() => { setPickMode((v) => !v); if (!wide) setView('preview'); if (center !== 'preview') setCenter('preview'); }} />}
        hint="Special effects react to the cursor, a click or the scroll. They are real code you can copy, not just a start and end pose.">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Chip label="Whole block" active={!target && !custom.trim()} onPress={() => chooseTarget('')} />
          {classes.filter((c) => '.' + c !== root).map((c) => <Chip key={c} label={'.' + c} active={target === c && !custom.trim()} onPress={() => chooseTarget(c)} />)}
        </View>
        <Input value={custom} onChangeText={setCustom} placeholder="or type a selector, e.g. .bk-card" autoCapitalize="none" autoCorrect={false} />
        <Txt sub size={11}>Selector: <Txt size={11} bold>{finalSelector || '(none)'}</Txt></Txt>
      </Group>
      {fxGroups.map((gname) => (
        <Group key={gname} title={gname === 'Ambient' ? 'Ambient (always on)' : gname === 'Cursor' ? 'Follows the cursor' : gname === 'Click' ? 'On click' : 'On scroll'}>
          {FX.filter((f) => f.group === gname).map((f) => {
            const added = blockItems.some((x) => x.fx === f.id && x.selector === finalSelector);
            return (
              <View key={f.id} style={{ gap: 4, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: added ? '#db2777' : t.border }}>
                <View style={row}><Txt bold size={13} style={{ flexShrink: 1 }}>{f.label}</Txt>{added && <Badge label="added" color="#db2777" />}</View>
                <Txt sub size={11}>{f.description}</Txt>
                <Txt sub size={10}>Try it: {f.how}</Txt>
                <View style={row}>
                  <Btn small kind={added ? 'danger' : 'primary'} label={added ? 'Remove' : 'Add to element'} onPress={() => (added ? removeFx(f.id) : addFx(f.id))} />
                  <Btn small kind="ghost" label="Copy code" onPress={() => { const b = f.build(finalSelector || '.element', 'p2c3dfx-x'); copy([b.css && `/* CSS */\n${b.css}`, b.js && `// JavaScript\n${b.js}`].filter(Boolean).join('\n'), f.label + ' code'); }} />
                </View>
              </View>
            );
          })}
        </Group>
      ))}
    </View>
  );

  const cssOf = (x: Item) => { const r_ = rules[anim.findIndex((y) => y.id === x.id)]; return buildRuleCss(x.cfg, x.selector, r_ ? r_.key : 'p2c3d-x').css; };
  const layersPanel = (
    <View style={{ gap: 10 }}>
      <Group title={`All animations on this page (${live.length})`} hint="Switch one off to compare, or open it to edit. Switched-off animations are not in the preview or in the exported code.">
        {live.length === 0 && <Txt sub size={12}>None yet. Select a block, choose a preset and press “Add 3D animation”.</Txt>}
        {live.map((x) => {
          const owner = placed.find((p) => p.id === x.blockPid);
          const on = x.id === editingId;
          return (
            <View key={x.id} style={{ gap: 6, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: on ? VIOLET : t.border, opacity: x.off ? 0.55 : 1 }}>
              <Pressable onPress={() => editItem(x)}>
                <View style={row}><Txt bold size={12} style={{ flexShrink: 1 }}>{x.selector}</Txt><Badge label={x.fx ? 'special' : MODE_SHORT[x.cfg.trigger]} color={x.fx ? '#db2777' : VIOLET} />{!x.fx && isInfinite(x.cfg) && <Badge label="∞" color="#0891b2" />}{x.off && <Badge label="off" color={t.sub} />}</View>
                <Txt sub size={10}>{owner?.name ?? 'Block'} · {x.fx ? (fxOf(x.fx)?.label ?? 'Effect') : `${presetOf(x.cfg.preset).label} · ${describeRule(x.cfg)}`}</Txt>
              </Pressable>
              <View style={row}>
                <Btn small kind="ghost" label="Edit" onPress={() => editItem(x)} />
                {!x.fx && <Btn small kind={isInfinite(x.cfg) ? 'primary' : 'ghost'} label="∞ Infinity" onPress={() => toggleInfinity(x)} />}
                <Btn small kind="ghost" label={x.off ? 'Switch on' : 'Switch off'} onPress={() => toggleItem(x.id)} />
                {!x.fx && <Btn small kind="ghost" label="Play" onPress={() => playNow(x.id)} disabled={!!x.off} />}
                {!x.fx && <Btn small kind="ghost" label="Copy to another element" onPress={() => copyToNew(x)} />}
                {!x.fx && <Btn small kind="ghost" label="Copy CSS" onPress={() => copy(cssOf(x), 'Animation CSS')} />}
                <Btn small kind="danger" label="Remove" onPress={() => removeItem(x.id)} />
              </View>
            </View>
          );
        })}
      </Group>
      {live.length > 0 && <Btn small kind="danger" label="Remove all animations" onPress={() => confirmAction('Remove all 3D animations?', 'The blocks stay on the page.', 'Remove', () => { checkpoint(); setItems([]); setEditingId(null); bump(); })} />}
    </View>
  );

  const inspector = (
    <View style={{ gap: 10 }}>
      <Txt bold size={16}>3D animation</Txt>
      {!block ? (
        <>
          <Card><Txt sub>Select a block in “My page”, or click “Pick in preview” and click an element.</Txt></Card>
          {insp === 'layers' || live.length > 0 ? layersPanel : null}
        </>
      ) : (
        <>
          {editing && (
            <View style={{ padding: 10, borderRadius: 10, backgroundColor: VIOLET + '22', borderWidth: 1, borderColor: VIOLET, gap: 6 }}>
              <Txt bold size={12}>Editing {editing.selector}</Txt>
              <Txt sub size={11}>Every change is applied live. Nothing else to press.</Txt>
              <View style={row}>
                <Btn small label="Play" onPress={() => playNow(editing.id)} />
                <Btn small kind={isInfinite(cfg) ? 'primary' : 'ghost'} label={isInfinite(cfg) ? '∞ Infinity: ON' : '∞ Infinity'} onPress={() => setInfinity(!isInfinite(cfg))} />
                <Btn small kind="ghost" label="Done" onPress={() => { setEditingId(null); setInsp('style'); props.toast('Saved.'); }} />
                <Btn small kind="ghost" label="Animate another element" onPress={() => { setEditingId(null); resetPicker(); setInsp('style'); }} />
              </View>
            </View>
          )}
          <Segment value={insp} onChange={setInsp} options={[['style', 'Style'], ['tune', 'Tune'], ['special', '✦ Special'], ['layers', `Layers (${live.length})`]]} />
          {insp === 'style' ? stylePanel : insp === 'tune' ? tunePanel : insp === 'special' ? specialPanel : layersPanel}
          {insp !== 'layers' && blockItems.length > 0 && (
            <Group title={`On this block (${blockItems.length})`}>
              {blockItems.map((x) => (
                <Pressable key={x.id} onPress={() => editItem(x)} style={{ padding: 6, borderRadius: 8, borderWidth: 1, borderColor: x.id === editingId ? VIOLET : 'transparent' }}>
                  <Txt bold size={12}>{x.selector}{x.off ? ' (off)' : ''}</Txt>
                  <Txt sub size={10}>{x.fx ? (fxOf(x.fx)?.label ?? 'Effect') + ' · special effect' : `${presetOf(x.cfg.preset).label} · ${MODE_LABEL[x.cfg.trigger]} · tap to edit`}</Txt>
                </Pressable>
              ))}
            </Group>
          )}
        </>
      )}
    </View>
  );

  // ---------------------------------------------------------------- code preview (like Code blocks)
  const codePanel = (
    <View style={{ gap: 8 }}>
      <Txt bold size={16}>Copy the code</Txt>
      <View style={row}>
        <Txt sub size={12}>Accent color:</Txt>
        {SWATCHES.map((c) => (
          <Pressable key={c} onPress={() => applyAccent(c)} accessibilityRole="button" accessibilityLabel={'Accent color ' + c}
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, borderWidth: accent === c ? 3 : 1, borderColor: accent === c ? t.text : t.border }} />
        ))}
        <Input style={{ width: 110 }} value={accentText} onChangeText={applyAccent} autoCapitalize="none" placeholder="#2563eb" />
      </View>
      <Txt bold size={13}>Design settings (Pro blocks)</Txt>
      <View style={row}>
        <Txt sub size={12}>Corners:</Txt>
        {([['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']] as [Theme['radius'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.radius === k} onPress={() => setThemePart({ radius: k })} />)}
        <Txt sub size={12}>Headings:</Txt>
        {([['sans', 'Modern'], ['serif', 'Classic serif']] as [Theme['font'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.font === k} onPress={() => setThemePart({ font: k })} />)}
        <Txt sub size={12}>Block motion:</Txt>
        {([['full', 'Full'], ['subtle', 'Subtle'], ['off', 'Off']] as [Theme['motion'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.motion === k} onPress={() => setThemePart({ motion: k })} />)}
      </View>
      <View style={row}>
        {([['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript'], ['anim', '3D only'], ['page', 'Full page']] as [Out, string][]).map(([k, l]) => <Chip key={k} label={l} active={out === k} onPress={() => setOut(k)} />)}
      </View>
      <View style={row}>
        <Btn small label={`Copy ${out === 'page' ? 'full page' : out === 'anim' ? '3D code' : out.toUpperCase()}`} onPress={() => copy(text, out === 'page' ? 'Full page' : out === 'anim' ? '3D code' : out.toUpperCase())} />
        <Btn small kind="ghost" label="Copy HTML + CSS + JS together" onPress={() => copy(`<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JS\n${js}`, 'All code')} />
        <Btn small kind="ghost" label="Download index.html" onPress={async () => { if (!placed.length) { props.toast('Add a block first.'); return; } props.toast(await saveSingleFile({ path: 'index.html', content: page })); }} />
        <Btn small kind="ghost" label="Download 3d-animations.css" onPress={async () => { if (!bundle.css) { props.toast('Add a 3D animation first.'); return; } props.toast(await saveSingleFile({ path: '3d-animations.css', content: bundle.css })); }} />
        {!!bundle.js && <Btn small kind="ghost" label="Download 3d-animations.js" onPress={async () => props.toast(await saveSingleFile({ path: '3d-animations.js', content: bundle.js }))} />}
      </View>
      <Input mono multiline editable={false} value={text || '(empty: add a block, then add a 3D animation)'} style={{ minHeight: 320, maxHeight: wide ? Math.max(360, winH - 360) : 420, textAlignVertical: 'top', fontSize: 12 }} />
      <Txt sub size={12}>
        How to use: paste the HTML where the section should be, the CSS into your stylesheet and the JS before the closing body tag. “3D only” is just the animation CSS/JS so you can add it to an existing site: the rules target the same bk- classes, so they work on any page that uses these blocks. Animations respect “reduce motion” in the visitor’s system settings. The Play helper is for this preview only and is never part of the exported code.
      </Txt>
    </View>
  );

  // ---------------------------------------------------------------- big output preview
  const openFull = () => { if (!placed.length) { props.toast('Add a block first.'); return; } setFull({ title: 'My 3D page', files }); };
  const toolbar = (
    <View style={[row, { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4, gap: 6 }]}>
      {DEV.map(([l, w]) => <Chip key={l} label={l} active={device === w} onPress={() => setDevice(w)} />)}
      <View style={{ flex: 1 }} />
      <Chip label={autoPlay ? 'Auto-play: on' : 'Auto-play: off'} active={autoPlay} onPress={() => setAutoPlay((v) => !v)} />
      <Btn small label="▶ Play" onPress={() => playNow(null)} />
      <Btn small kind="ghost" label="Refresh" onPress={() => { setPlayToken(-1); bump(); }} />
      <Btn small kind="ghost" label="Full screen" onPress={openFull} />
    </View>
  );
  const infoBar = (
    <View style={[row, { justifyContent: 'space-between', flexWrap: 'nowrap', paddingHorizontal: 4 }]}>
      <Txt sub size={11} style={{ flex: 1 }}>
        {pickMode ? 'Pick mode: click any element in the page to select it.'
          : !total ? 'No 3D animation yet. Select an element, choose a preset, then press “Add 3D animation”.'
          : editing ? `Editing ${editing.selector} · ${MODE_LABEL[editing.cfg.trigger]} · ${describeRule(editing.cfg)}`
          : `${total} animation${total === 1 ? '' : 's'} on this page · ${Platform.OS === 'web' ? 'hover or click an element' : 'touch an element'} (Play shows them without a mouse)`}
      </Txt>
      <Txt sub size={11}>{stage.w || ''}{stage.w ? 'px' : ''} · {stage.pct}%</Txt>
    </View>
  );
  const emptyState = placed.length === 0 ? (
    <View style={{ alignItems: 'center', gap: 8, maxWidth: 360 }}>
      <Txt bold size={18} style={{ color: '#fff' }}>Your page preview</Txt>
      <Txt size={13} style={{ color: '#9aa1c2', textAlign: 'center' }}>Add a block from the library. It appears here at full size, and your 3D animations play on it.</Txt>
    </View>
  ) : undefined;
  const stageEl = (height?: number) => (
    <DeviceStage files={previewFiles} device={device} reloadKey={reload} height={height} empty={emptyState}
      inspectMode={pickMode} onInspect={onPick} onScale={(p, w) => setStage((s) => (s.pct === p && s.w === w ? s : { pct: p, w }))} />
  );

  if (!loaded) return <View style={{ padding: 20 }}><Txt>Loading...</Txt></View>;
  if (full) return <FullView files={full.files} title={full.title} onClose={() => setFull(null)} toast={props.toast} />;

  const canUndo = hist.current.past.length > 0;
  const canRedo = hist.current.future.length > 0;
  const header = (
    <View style={[row, { padding: 10, borderBottomWidth: 1, borderColor: t.border }]}>
      <Btn small kind="ghost" label="< Back" onPress={props.onBack} />
      <Txt bold size={20}>3D animation studio</Txt>
      <Badge label={`${total} animation${total === 1 ? '' : 's'}`} color={VIOLET} />
      <View style={{ flex: 1 }} />
      <Btn small kind="ghost" label="↶ Undo" onPress={undo} disabled={!canUndo} />
      <Btn small kind="ghost" label="↷ Redo" onPress={redo} disabled={!canRedo} />
      <Btn small kind="ghost" label="Full screen preview" onPress={openFull} />
    </View>
  );

  if (wide) {
    const sideL = winW >= 1500 ? 380 : 340;
    const sideR = winW >= 1500 ? 400 : 370;
    // flexGrow/flexShrink 0 are REQUIRED: on the web a ScrollView grows by default, which made both side panels eat the middle column.
    const fixed = (w: number, side: 'borderRightWidth' | 'borderLeftWidth') => ({ width: w, flexGrow: 0, flexShrink: 0, [side]: 1, borderColor: t.border } as any);
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={fixed(sideL, 'borderRightWidth')}>
            <View style={{ padding: 10 }}>
              <Segment value={left} onChange={setLeft} options={[['blocks', 'Blocks'], ['page', `My page (${placed.length})`]]} />
            </View>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, paddingTop: 2 }}>{left === 'blocks' ? palette : canvas}</ScrollView>
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 10, gap: 8, alignItems: 'center' }}>
              <View style={{ width: 220 }}>
                <Segment value={center} onChange={setCenter} options={[['preview', 'Preview'], ['code', 'Code']]} />
              </View>
              <Chip label={pickMode ? 'Click an element…' : 'Pick in preview'} active={pickMode} onPress={() => { setCenter('preview'); setPickMode((v) => !v); }} />
              {block && <Txt sub size={12} style={{ flexShrink: 1 }}>Selected: <Txt bold size={12}>{block.name}</Txt></Txt>}
            </View>
            {center === 'preview' ? (
              <>
                {toolbar}
                <View style={{ flex: 1, paddingHorizontal: 12, paddingBottom: 10, gap: 6 }}>
                  {stageEl()}
                  {infoBar}
                </View>
              </>
            ) : (
              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>{codePanel}</ScrollView>
            )}
          </View>
          <ScrollView style={fixed(sideR, 'borderLeftWidth')} contentContainerStyle={{ padding: 12 }}>{inspector}</ScrollView>
        </View>
      </View>
    );
  }

  const phoneH = Math.max(420, winH - 300);
  const previewPanel = (
    <View style={{ gap: 6 }}>
      <Txt bold size={16}>Live preview</Txt>
      {toolbar}
      {stageEl(phoneH)}
      {infoBar}
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      {header}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: t.border }} contentContainerStyle={{ padding: 8 }}>
        {([['blocks', 'Blocks'], ['page', `My page (${placed.length})`], ['animate', '3D'], ['preview', 'Preview'], ['code', 'Copy code']] as [View_, string][]).map(([k, l]) => <Chip key={k} label={l} active={view === k} onPress={() => setView(k)} />)}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
        {view === 'blocks' ? palette : view === 'page' ? canvas : view === 'animate' ? inspector : view === 'code' ? codePanel : previewPanel}
      </ScrollView>
    </View>
  );
}

/** Yellow advice box shown under the controls (see warningsFor in the engine). */
function Tips({ tips }: { tips: string[] }) {
  return (
    <View style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f59e0b', backgroundColor: '#f59e0b22', gap: 3 }}>
      <Txt bold size={12}>Tips for this animation</Txt>
      {tips.map((x) => <Txt key={x} size={11}>{'• ' + x}</Txt>)}
    </View>
  );
}