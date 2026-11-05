// "My components": saved header / footer / section code. The editor is a VS Code-style workbench:
// activity bar, explorer, tabs, syntax-colored editor, live responsive preview, and a bottom panel (Problems / Console / Analysis) + status bar.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Platform, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ProjectAsset, ProjectFile, SavedComponent, uid } from '../types';
import { useTheme } from '../components/ui';
import { dark as darkTheme } from '../theme';
import Preview, { PreviewMsg } from '../components/Preview';
import FullView from '../components/FullView';
import CodeEditor from '../components/CodeEditor';
import { SelectionInfo } from '../components/codeEditorTypes';
import { componentPreviewFiles } from '../lib/blocks';
import { confirmAction } from '../lib/confirm';
import { pickOne } from '../lib/pickCode';
import { KitAnalysis, KitKind, analyzeKitZip } from '../lib/layoutKit';
import { openInBrowserTab } from '../lib/openInTab';
import { IMAGE_EXT, RefReport, analyzeRefs, assetBytes, dataUri, formatBytes } from '../lib/assets';
import { TreeNode, buildTree } from '../lib/fileTree';
import { Diagnostic, diagnoseAll } from '../lib/diagnostics';
import { formatCss, formatHtml } from '../lib/format';
import { languageName, languageOf } from '../lib/langs';
import { saveSingleFile } from '../lib/exporter';
import { EditorSettings, defaultEditorSettings } from '../lib/editorSettings';
import { loadEditorSettings } from '../storage';
import type { Settings } from '../storage';

// ------------------------------------------------------------------ palette (VS Code Dark+ / Light+)
const VSD = {
  activity: '#333333', activityFg: '#ffffff', activityDim: '#858585', side: '#252526', sideHead: '#bbbbbb', editor: '#1e1e1e', tabBar: '#252526', tab: '#2d2d2d', tabActive: '#1e1e1e',
  title: '#323233', border: '#3c3c3c', text: '#cccccc', sub: '#858585', hover: '#2a2d2e', select: '#37373d', accent: '#007acc', button: '#0e639c', buttonText: '#ffffff', status: '#007acc', statusFg: '#ffffff',
  input: '#3c3c3c', error: '#f14c4c', warn: '#cca700', ok: '#89d185', info: '#3794ff',
};
type VS = typeof VSD;
const VSL: VS = {
  activity: '#2c2c2c', activityFg: '#ffffff', activityDim: '#858585', side: '#f3f3f3', sideHead: '#616161', editor: '#ffffff', tabBar: '#f3f3f3', tab: '#ececec', tabActive: '#ffffff',
  title: '#dddddd', border: '#e5e5e5', text: '#333333', sub: '#6e6e6e', hover: '#e8e8e8', select: '#e4e6f1', accent: '#007acc', button: '#007acc', buttonText: '#ffffff', status: '#007acc', statusFg: '#ffffff',
  input: '#ffffff', error: '#e51400', warn: '#bf8803', ok: '#388a34', info: '#1a85ff',
};
const MONO = Platform.OS === 'web' ? "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace" : 'monospace';
const FILE_DOT: Record<string, string> = { html: '#e37933', css: '#519aba', scss: '#cd6799', javascript: '#cbcb41', javascriptreact: '#61dafb', typescript: '#3178c6', typescriptreact: '#61dafb', json: '#cbcb41', php: '#a074c4', markdown: '#519aba', xml: '#e37933' };

// ------------------------------------------------------------------ model
const KINDS: [KitKind, string][] = [['header', 'Header'], ['footer', 'Footer'], ['header+footer', 'Header + footer'], ['section', 'Other section']];
const COMBINED: [string, 'html' | 'css' | 'js'][] = [['index.html', 'html'], ['style.css', 'css'], ['script.js', 'js']];
const CP = '[combined]/';
const DEVICES: [string, number | 'full'][] = [['Responsive', 'full'], ['Laptop 1280', 1280], ['Tablet 768', 768], ['Mobile 390', 390]];

const empty = (): SavedComponent => ({ id: uid(), name: '', notes: '', html: '', css: '', js: '', updatedAt: Date.now() });
const hasZipOf = (e: SavedComponent) => !!e.sourceFiles?.length;
const combinedPath = (e: SavedComponent, name: string) => (hasZipOf(e) ? CP + name : name);
const isCombinedPath = (e: SavedComponent, path: string) => (hasZipOf(e) ? path.startsWith(CP) : COMBINED.some(([n]) => n === path));

/** Every file shown in the explorer: the ZIP files (if any) plus the three combined preview-source files. */
function filesOf(e: SavedComponent): ProjectFile[] {
  return [...(e.sourceFiles ?? []), ...COMBINED.map(([n, k]) => ({ path: combinedPath(e, n), content: e[k] }))];
}

function firstTab(e: SavedComponent): string {
  const src = e.sourceFiles ?? [];
  const html = src.find((f) => /(^|\/)index\.html?$/i.test(f.path)) || src.find((f) => /\.html?$/i.test(f.path)) || src[0];
  return html ? html.path : combinedPath(e, 'index.html');
}

/** Applies one edited file back onto the component. ZIP edits also refresh the combined html / css / js (same rules as before). */
function applyEdit(e: SavedComponent, path: string, v: string): SavedComponent {
  if (isCombinedPath(e, path)) {
    const name = hasZipOf(e) ? path.slice(CP.length) : path;
    const key = COMBINED.find(([n]) => n === name)?.[1];
    return key ? { ...e, [key]: v } : e;
  }
  const nextFiles = (e.sourceFiles || []).map((f) => (f.path === path ? { ...f, content: v } : f));
  const current = nextFiles.find((f) => f.path === path);
  const ext = path.split('.').pop()?.toLowerCase();
  return {
    ...e, sourceFiles: nextFiles,
    ...(ext === 'css' ? { css: nextFiles.filter((f) => /\.css$/i.test(f.path)).map((f) => f.content).join('\n\n') } : {}),
    ...(ext === 'js' || ext === 'mjs' ? { js: nextFiles.filter((f) => /\.(js|mjs|cjs)$/i.test(f.path)).map((f) => f.content).join('\n\n') } : {}),
    ...(ext === 'html' || ext === 'htm' ? { html: current?.content || v } : {}),
  };
}

function isDirty(e: SavedComponent, b: SavedComponent): boolean {
  if (e.name !== b.name || e.notes !== b.notes || e.kind !== b.kind || e.html !== b.html || e.css !== b.css || e.js !== b.js) return true;
  const a = e.sourceFiles ?? [], o = b.sourceFiles ?? [];
  if (a.length !== o.length) return true;
  return a.some((f, i) => f.path !== o[i].path || f.content !== o[i].content);
}

function formatContent(path: string, content: string): string {
  const lang = languageOf(path);
  const c = content.replace(/\r\n/g, '\n');
  if (lang === 'json') { try { return JSON.stringify(JSON.parse(c), null, 2) + '\n'; } catch { /* fall through to light cleanup */ } }
  if (lang === 'html') return formatHtml(c);
  if (lang === 'css') return formatCss(c);
  return c.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'); // light cleanup only: never re-indent code we cannot parse fully
}

// ------------------------------------------------------------------ saved layout (web localStorage; phones use defaults)
interface Layout { sideW: number; prevW: number; panelH: number; side: boolean; preview: boolean; panel: boolean; device: number | 'full' }
const LAYOUT_KEY = 'p2c:components-layout';
const defaultLayout: Layout = { sideW: 240, prevW: 480, panelH: 180, side: true, preview: true, panel: true, device: 'full' };
const clampN = (n: unknown, lo: number, hi: number, d: number) => (typeof n === 'number' && isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d);
function loadLayout(): Layout {
  if (Platform.OS !== 'web') return defaultLayout;
  try {
    const raw = localStorage.getItem(LAYOUT_KEY); if (!raw) return defaultLayout;
    const x = JSON.parse(raw);
    return {
      sideW: clampN(x.sideW, 150, 420, defaultLayout.sideW), prevW: clampN(x.prevW, 280, 1000, defaultLayout.prevW), panelH: clampN(x.panelH, 100, 520, defaultLayout.panelH),
      side: x.side !== false, preview: x.preview !== false, panel: x.panel !== false, device: x.device === 'full' ? 'full' : clampN(x.device, 240, 2400, 0) || 'full',
    };
  } catch { return defaultLayout; }
}

// ------------------------------------------------------------------ small UI pieces
function Sash({ onDelta, vertical = true, c }: { onDelta: (px: number) => void; vertical?: boolean; c: VS }) {
  if (Platform.OS !== 'web') return null;
  const down = (e: any) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    let last = vertical ? e.clientX : e.clientY;
    const move = (m: PointerEvent) => { const cur = vertical ? m.clientX : m.clientY; onDelta(cur - last); last = cur; };
    const up = () => { el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', move as any); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };
  return React.createElement('div', {
    role: 'separator', 'aria-orientation': vertical ? 'vertical' : 'horizontal', title: 'Drag to resize', onPointerDown: down,
    style: { flex: '0 0 4px', cursor: vertical ? 'col-resize' : 'row-resize', background: c.border, touchAction: 'none', alignSelf: 'stretch', transition: 'background .15s' },
    onMouseEnter: (e: any) => (e.currentTarget.style.background = c.accent), onMouseLeave: (e: any) => (e.currentTarget.style.background = c.border),
  });
}

function Btn2({ label, onPress, c, primary, disabled, active, title, small }: { label: string; onPress: () => void; c: VS; primary?: boolean; disabled?: boolean; active?: boolean; title?: string; small?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title || label} onPress={onPress} disabled={disabled}
      style={(s: any) => ({ paddingHorizontal: small ? 8 : 10, height: small ? 22 : 26, justifyContent: 'center', borderRadius: 3, opacity: disabled ? 0.45 : 1,
        backgroundColor: primary ? (s.hovered ? c.accent : c.button) : active ? c.select : s.hovered || s.pressed ? c.hover : 'transparent' })}>
      <Text numberOfLines={1} style={{ color: primary ? c.buttonText : c.text, fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}

function ActivityBtn({ glyph, label, active, onPress, c }: { glyph: string; label: string; active: boolean; onPress: () => void; c: VS }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active }} onPress={onPress}
      style={(s: any) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 2, borderLeftColor: active ? c.activityFg : 'transparent', opacity: active || s.hovered ? 1 : 0.65 })}>
      <Text style={{ fontSize: 20, color: c.activityFg }}>{glyph}</Text>
    </Pressable>
  );
}

function Field({ label, value, onChange, c, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; c: VS; placeholder?: string; multiline?: boolean }) {
  return (
    <View style={{ gap: 3 }}>
      <Text style={{ color: c.sub, fontSize: 11 }}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={c.sub} multiline={multiline} autoCapitalize="none" autoCorrect={false} accessibilityLabel={label}
        style={{ backgroundColor: c.input, color: c.text, borderWidth: 1, borderColor: c.border, borderRadius: 3, paddingVertical: 5, paddingHorizontal: 8, fontSize: 13, minHeight: multiline ? 52 : undefined, textAlignVertical: multiline ? 'top' : 'center' }} />
    </View>
  );
}

function SectionHead({ label, open, onToggle, c, right }: { label: string; open: boolean; onToggle: () => void; c: VS; right?: React.ReactNode }) {
  return (
    <Pressable onPress={onToggle} accessibilityRole="button" accessibilityState={{ expanded: open }} style={(s: any) => ({ flexDirection: 'row', alignItems: 'center', height: 24, paddingHorizontal: 8, gap: 6, backgroundColor: s.hovered ? c.hover : 'transparent' })}>
      <Text style={{ color: c.sideHead, fontSize: 10 }}>{open ? '▾' : '▸'}</Text>
      <Text style={{ color: c.sideHead, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, flex: 1 }}>{label}</Text>
      {right}
    </Pressable>
  );
}

const ASSET = 'asset:';
const isFontPath = (p: string) => /\.(woff2?|ttf|otf|eot)$/i.test(p);

/** Shows one image / font that came with the ZIP, so you can see it was imported (and how big it is). */
function AssetViewer({ a, c }: { a: ProjectAsset; c: VS }) {
  const uri = dataUri(a);
  const font = isFontPath(a.path);
  return (
    <View style={{ flex: 1, backgroundColor: c.editor, padding: 16, gap: 8 }}>
      <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>{a.path}</Text>
      <Text style={{ color: c.sub, fontSize: 12 }}>{a.mime} · {formatBytes(assetBytes(a))} · embedded in the preview{font ? ' (used by @font-face)' : ''}</Text>
      {font ? (
        Platform.OS === 'web'
          ? React.createElement('div', { style: { flex: 1, overflow: 'auto', color: c.text } },
              React.createElement('style', null, `@font-face{font-family:"p2c-asset";src:url(${uri})}`),
              React.createElement('div', { style: { fontFamily: 'p2c-asset, sans-serif', fontSize: 34, lineHeight: 1.3 } }, 'The quick brown fox jumps over the lazy dog'),
              React.createElement('div', { style: { fontFamily: 'p2c-asset, sans-serif', fontSize: 18, marginTop: 12 } }, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789'))
          : <Text style={{ color: c.sub, fontSize: 12 }}>Font preview is available on the web version.</Text>
      ) : (
        <View style={{ flex: 1, minHeight: 160, backgroundColor: c.side, borderWidth: 1, borderColor: c.border }}>
          <Image source={{ uri }} resizeMode="contain" style={{ flex: 1, width: '100%', height: '100%' }} accessibilityLabel={a.path} />
        </View>
      )}
    </View>
  );
}

/** Responsive analysis of the imported ZIP: what is inside, what makes it responsive, what is wrong. */
function AnalysisView({ a, c, onTest }: { a: KitAnalysis; c: VS; onTest: (w: number) => void }) {
  const good = a.responsiveScore >= 80, ok = a.responsiveScore >= 50;
  const line = { color: c.text, fontSize: 12, lineHeight: 18 } as const;
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: c.text, fontSize: 13, fontWeight: '700' }}>ZIP analysis: {a.sourceName}</Text>
      <Text style={{ color: good ? c.ok : ok ? c.warn : c.error, fontSize: 13, fontWeight: '700' }}>Responsive score {a.responsiveScore}/100 {good ? '(good)' : ok ? '(needs work)' : '(not responsive)'}</Text>
      <Text style={line}>{a.counts.html} HTML · {a.counts.css} CSS · {a.counts.js} JS · {a.counts.image} images · {a.counts.font} fonts · {a.counts.other} other</Text>
      <Text style={line}>Breakpoints: {a.breakpoints.length ? a.breakpoints.join(', ') + ' px' : 'none found'} · Viewport meta: {a.viewportMeta ? 'yes' : 'no'}{a.frameworks.length ? ' · Uses: ' + a.frameworks.join(', ') : ''}</Text>
      <Text style={{ ...line, color: c.sub }}>Combined HTML: {a.entry.join(', ')}</Text>
      <Text style={{ ...line, fontWeight: '700', marginTop: 4 }}>Files that make it responsive</Text>
      {a.files.filter((f) => f.responsive.length).length === 0 && <Text style={{ ...line, color: c.sub }}>No file contains responsive rules.</Text>}
      {a.files.filter((f) => f.responsive.length).map((f) => <Text key={f.path} style={line}>• {f.path} ({f.role}, {formatBytes(f.bytes)}): {f.responsive.join('; ')}</Text>)}
      <Text style={{ ...line, fontWeight: '700', marginTop: 4 }}>All files</Text>
      <Text style={{ ...line, color: c.sub }}>{a.files.slice(0, 40).map((f) => f.path).join(' · ')}{a.files.length > 40 ? ` · ... ${a.files.length - 40} more` : ''}</Text>
      {a.findings.length > 0 && <Text style={{ ...line, fontWeight: '700', marginTop: 4 }}>Problems and warnings</Text>}
      {a.findings.map((f, i) => <Text key={i} style={{ ...line, color: c.error }}>• {f}</Text>)}
      <Text style={{ ...line, fontWeight: '700', marginTop: 4 }}>Test it at these widths</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{a.testWidths.map((w) => <Btn2 key={w} small c={c} label={`${w}px`} onPress={() => onTest(w)} />)}</View>
    </View>
  );
}

// ------------------------------------------------------------------ screen
export default function Components(props: {
  items: SavedComponent[];
  onSave: (list: SavedComponent[]) => Promise<void>;
  onBack: () => void;
  toast: (s: string) => void;
  settings?: Settings;
}) {
  const t = useTheme();
  const isDark = t.bg === darkTheme.bg;
  const c: VS = isDark ? VSD : VSL;
  const { width: winW, height: winH } = useWindowDimensions();
  const wide = winW >= 980;

  const [editorPrefs, setEditorPrefs] = useState<EditorSettings>(defaultEditorSettings);
  useEffect(() => { loadEditorSettings().then(setEditorPrefs).catch(() => {}); }, []);
  const ed: EditorSettings = { ...editorPrefs, theme: isDark ? 'dark' : 'light' };

  const [edit, setEdit] = useState<SavedComponent | null>(null);
  const [base, setBase] = useState<SavedComponent | null>(null);
  const [tabs, setTabs] = useState<string[]>([]);
  const [active, setActive] = useState('');
  const [closedDirs, setClosedDirs] = useState<Record<string, boolean>>({});
  const [secOpen, setSecOpen] = useState({ props: true, files: true });
  const [lay, setLay] = useState<Layout>(loadLayout);
  const [view, setView] = useState<'files' | 'code' | 'preview' | 'panel'>('code'); // phones / narrow windows: one pane at a time
  const [panelTab, setPanelTab] = useState<'problems' | 'console' | 'analysis'>('problems');
  const [sel, setSel] = useState<SelectionInfo | null>(null);
  const [goTo, setGoTo] = useState<{ line: number; col?: number; nonce: number } | null>(null);
  const [pv, setPv] = useState<ProjectFile[]>([]);
  const [reload, setReload] = useState(0);
  const [msgs, setMsgs] = useState<PreviewMsg[]>([]);
  const [diags, setDiags] = useState<Diagnostic[]>([]);
  const [pvBox, setPvBox] = useState(0);
  const [customW, setCustomW] = useState('');
  const [busy, setBusy] = useState('');
  const [full, setFull] = useState<SavedComponent | null>(null);
  const [fullW, setFullW] = useState<number | undefined>(undefined);
  const [show, setShow] = useState<string | null>(null);
  const [listReload, setListReload] = useState(0);
  const noop = useCallback(() => {}, []);
  const receive = useCallback((m: PreviewMsg) => setMsgs((old) => [...old.slice(-299), m]), []);
  const canView = (x: SavedComponent) => !!(x.html.trim() || x.css.trim() || x.js.trim());

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(lay)); } catch { /* storage blocked: layout is simply not remembered */ }
  }, [lay]);
  const patchLay = (p: Partial<Layout>) => setLay((l) => ({ ...l, ...p }));

  const vfiles = useMemo(() => (edit ? filesOf(edit) : []), [edit]);
  const baseFiles = useMemo(() => new Map((base ? filesOf(base) : []).map((f) => [f.path, f.content])), [base]);
  const dirtyPaths = useMemo(() => new Set(vfiles.filter((f) => baseFiles.get(f.path) !== f.content).map((f) => f.path)), [vfiles, baseFiles]);
  const dirty = !!edit && !!base && isDirty(edit, base);
  const file = vfiles.find((f) => f.path === active);

  // live preview follows the code after a short pause (delay comes from the editor settings)
  useEffect(() => {
    if (!edit) return;
    const h = setTimeout(() => setPv(componentPreviewFiles(edit)), ed.previewDebounce);
    return () => clearTimeout(h);
  }, [edit?.id, edit?.html, edit?.css, edit?.js, edit?.sourceFiles, edit?.name, ed.previewDebounce]);

  // quick syntax diagnostics (debounced)
  useEffect(() => {
    if (!edit) { setDiags([]); return; }
    const h = setTimeout(() => setDiags(diagnoseAll(vfiles)), 450);
    return () => clearTimeout(h);
  }, [vfiles]);
  // image references in the HTML / CSS that no imported asset satisfies (even with the forgiving preview lookup)
  const missingRefs = useMemo<RefReport[]>(() => {
    if (!edit) return [];
    const assets = edit.assets ?? [];
    const src = (edit.sourceFiles?.length ? edit.sourceFiles : [{ path: 'index.html', content: edit.html }, { path: 'style.css', content: edit.css }]).filter((f) => /\.(html?|css)$/i.test(f.path));
    return analyzeRefs(src, assets).filter((r) => r.status === 'missing');
  }, [edit?.html, edit?.css, edit?.sourceFiles, edit?.assets]);
  const errCount = diags.filter((d) => d.severity === 'error').length;
  const warnCount = diags.length - errCount + missingRefs.length;

  const openEditor = (x: SavedComponent) => {
    const first = firstTab(x);
    setEdit(x); setBase(x); setTabs([first]); setActive(first); setSel(null); setGoTo(null);
    setPv(componentPreviewFiles(x)); setMsgs([]); setReload((r) => r + 1); setView('code'); setClosedDirs({});
    setPanelTab(x.analysis ? 'analysis' : 'problems'); setShow(null);
  };
  const openFile = (path: string, line?: number) => {
    setTabs((tt) => (tt.includes(path) ? tt : [...tt, path])); setActive(path);
    if (line) setGoTo({ line, nonce: Date.now() });
    if (!wide) setView('code');
  };
  const closeTab = (path: string) => {
    setTabs((tt) => {
      const rest = tt.filter((x) => x !== path);
      if (active === path) setActive(rest[rest.length - 1] ?? '');
      return rest;
    });
  };
  const setContent = (path: string, v: string) => setEdit((e) => (e ? applyEdit(e, path, v) : e));

  // ---- actions
  const save = async () => {
    if (!edit) return;
    if (!edit.name.trim()) { props.toast('Give the component a name, for example: banner, carousel 1, footer.'); return; }
    if (!edit.html.trim() && !edit.css.trim() && !edit.js.trim()) { props.toast('Paste at least some HTML, CSS or JS.'); return; }
    const item: SavedComponent = { ...edit, name: edit.name.trim(), updatedAt: Date.now() };
    const exists = props.items.some((x) => x.id === item.id);
    try {
      await props.onSave(exists ? props.items.map((x) => (x.id === item.id ? item : x)) : [...props.items, item]);
      setBase(item);
      setEdit((e) => (e ? { ...e, name: item.name, updatedAt: item.updatedAt } : e));
      props.toast('Component saved.');
    } catch (e: any) { props.toast(e.message || 'Save failed.'); }
  };
  const saveRef = useRef(save); saveRef.current = save;
  const layRef = useRef(lay); layRef.current = lay;

  const goBack = () => {
    if (dirty) confirmAction('Discard changes?', 'This component has unsaved changes. Leave without saving?', 'Discard', () => setEdit(null));
    else setEdit(null);
  };

  const format = () => {
    if (!file) return;
    const out = formatContent(file.path, file.content);
    if (out !== file.content) setContent(file.path, out);
    props.toast('Formatted ' + file.path.replace(CP, ''));
  };
  const copyFile = async () => { if (file) { await Clipboard.setStringAsync(file.content); props.toast('Copied ' + file.path.replace(CP, '') + '.'); } };
  const copyAll = async () => {
    if (!edit) return;
    const txt = `<!-- index.html -->\n${edit.html}\n\n/* style.css */\n${edit.css}\n\n// script.js\n${edit.js}\n`;
    await Clipboard.setStringAsync(txt); props.toast('Copied HTML, CSS and JS.');
  };
  const download = async () => { if (file) { try { props.toast(await saveSingleFile({ path: file.path.replace(CP, ''), content: file.content })); } catch (e: any) { props.toast(e.message || 'Download failed.'); } } };
  const tab = (x: SavedComponent) => {
    if (!openInBrowserTab(componentPreviewFiles(x), x.assets, x.name || 'Component')) props.toast('A new tab can only be opened on the web version, and the browser must allow pop-ups.');
  };
  const needCode = (fn: () => void) => { if (!edit || !canView(edit)) { props.toast('Paste some HTML, CSS or JS first.'); return; } fn(); };

  const importZip = async () => {
    try {
      const f = await pickOne(['application/zip', 'application/x-zip-compressed', 'application/octet-stream']);
      if (!f) return;
      if (!/\.zip$/i.test(f.name)) { props.toast('Please choose a .zip file. (.rar is not supported: unzip it and zip it again as .zip.)'); return; }
      setBusy(`Analyzing ${f.name} ...`);
      const r = await analyzeKitZip(f.bytes, f.name);
      const name = f.name.replace(/\.zip$/i, '').replace(/[-_]+/g, ' ').trim() || 'Layout kit';
      openEditor({ ...empty(), name, kind: r.analysis.kind, notes: `${r.analysis.kind} from ${f.name}`, html: r.html, css: r.css, js: r.js, analysis: r.analysis, assets: r.assets.length ? r.assets : undefined, sourceFiles: r.sourceFiles });
      props.toast(`Analyzed: responsive score ${r.analysis.responsiveScore}/100. Check the Analysis panel, then save.`);
    } catch (e: any) { props.toast(e.message || 'Could not analyze that ZIP.'); }
    finally { setBusy(''); }
  };

  // keyboard shortcuts outside the text area: Ctrl/Cmd+S save, Ctrl/Cmd+B explorer, Ctrl/Cmd+J panel
  useEffect(() => {
    if (Platform.OS !== 'web' || !edit || full) return;
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey; if (!mod || e.altKey || e.shiftKey) return;
      const k = e.key.toLowerCase();
      if (k === 's') { e.preventDefault(); saveRef.current(); }
      else if (k === 'b') { e.preventDefault(); setLay((l) => ({ ...l, side: !l.side })); }
      else if (k === 'j') { e.preventDefault(); setLay((l) => ({ ...l, panel: !l.panel })); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [!!edit, !!full]);

  if (full) return <FullView files={componentPreviewFiles(full)} assets={full.assets} widths={full.analysis?.testWidths} startWidth={fullW} toast={props.toast} title={full.name || 'Component'} onClose={() => { setFull(null); setFullW(undefined); }} />;

  // ================================================================== EDITOR (VS Code workbench)
  if (edit) {
    const hasZip = hasZipOf(edit);
    const sourceTree = buildTree(edit.sourceFiles ?? []);
    const devW = lay.device === 'full' || !pvBox ? 'full' : Math.min(lay.device, Math.max(pvBox - 2, 200));
    const devLabel = lay.device === 'full' ? (pvBox ? Math.round(pvBox) + 'px (fills the pane)' : 'responsive') : lay.device + 'px' + (pvBox && lay.device > pvBox - 2 ? ` (pane is ${Math.round(pvBox)}px: use Full screen for the true width)` : '');
    const dot = (path: string) => FILE_DOT[languageOf(path)] || c.sub;
    const label = (path: string) => (path.startsWith(ASSET) ? path.slice(ASSET.length).split('/').pop() || path : path.startsWith(CP) ? path.slice(CP.length) + ' (combined)' : path.split('/').pop() || path);

    const renderTree = (nodes: TreeNode[], depth: number): React.ReactNode[] => nodes.flatMap((n) => {
      const isActive = !n.dir && n.path === active;
      const row = (
        <Pressable key={n.path} accessibilityRole="button" accessibilityLabel={(n.dir ? 'Folder ' : 'File ') + n.path}
          onPress={() => (n.dir ? setClosedDirs((m) => ({ ...m, [n.path]: !m[n.path] })) : openFile(n.path))}
          style={(s: any) => ({ flexDirection: 'row', alignItems: 'center', height: 22, paddingLeft: 10 + depth * 12, paddingRight: 6, gap: 6, backgroundColor: isActive ? c.select : s.hovered ? c.hover : 'transparent' })}>
          <Text style={{ color: c.sub, fontSize: 10, width: 10 }}>{n.dir ? (closedDirs[n.path] ? '▸' : '▾') : ''}</Text>
          {!n.dir && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot(n.path) }} />}
          <Text numberOfLines={1} style={{ color: dirtyPaths.has(n.path) ? c.warn : c.text, fontSize: 13, flex: 1 }}>{n.name}</Text>
          {dirtyPaths.has(n.path) && <Text style={{ color: c.warn, fontSize: 10 }}>●</Text>}
        </Pressable>
      );
      return n.dir && !closedDirs[n.path] ? [row, ...renderTree(n.children || [], depth + 1)] : [row];
    });

    const combinedRows = COMBINED.map(([n]) => {
      const path = combinedPath(edit, n), isActive = path === active;
      return (
        <Pressable key={path} accessibilityRole="button" accessibilityLabel={'File ' + path} onPress={() => openFile(path)}
          style={(s: any) => ({ flexDirection: 'row', alignItems: 'center', height: 22, paddingLeft: 22, paddingRight: 6, gap: 6, backgroundColor: isActive ? c.select : s.hovered ? c.hover : 'transparent' })}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot(n) }} />
          <Text numberOfLines={1} style={{ color: dirtyPaths.has(path) ? c.warn : c.text, fontSize: 13, flex: 1 }}>{n}</Text>
          {dirtyPaths.has(path) && <Text style={{ color: c.warn, fontSize: 10 }}>●</Text>}
        </Pressable>
      );
    });

    // ---------------- sidebar
    const sidebar = (
      <View style={{ backgroundColor: c.side, width: wide ? lay.sideW : undefined, flex: wide ? undefined : 1, minHeight: 0 }}>
        <View style={{ height: 35, justifyContent: 'center', paddingHorizontal: 14 }}><Text style={{ color: c.sideHead, fontSize: 11, letterSpacing: 0.6 }}>EXPLORER</Text></View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
          <SectionHead c={c} label="COMPONENT" open={secOpen.props} onToggle={() => setSecOpen((s) => ({ ...s, props: !s.props }))} />
          {secOpen.props && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 10, gap: 8 }}>
              <Field c={c} label="Name" placeholder="banner, carousel 1, footer" value={edit.name} onChange={(v) => setEdit((e) => (e ? { ...e, name: v } : e))} />
              <Field c={c} label="Notes" placeholder="What is it / where is it used" multiline value={edit.notes} onChange={(v) => setEdit((e) => (e ? { ...e, notes: v } : e))} />
              <Text style={{ color: c.sub, fontSize: 11 }}>Type</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {KINDS.map(([k, l]) => (
                  <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: edit.kind === k }} onPress={() => setEdit((e) => (e ? { ...e, kind: e.kind === k ? undefined : k } : e))}
                    style={{ paddingHorizontal: 9, height: 22, justifyContent: 'center', borderRadius: 11, backgroundColor: edit.kind === k ? c.button : 'transparent', borderWidth: 1, borderColor: edit.kind === k ? c.button : c.border }}>
                    <Text style={{ color: edit.kind === k ? c.buttonText : c.text, fontSize: 12 }}>{l}</Text>
                  </Pressable>
                ))}
              </View>
              {!!edit.assets?.length && <Text style={{ color: c.sub, fontSize: 11 }}>{edit.assets.length} image/font asset(s) from the ZIP are kept with this component.</Text>}
            </View>
          )}
          <SectionHead c={c} label={hasZip ? 'IMPORTED ZIP FILES' : 'FILES'} open={secOpen.files} onToggle={() => setSecOpen((s) => ({ ...s, files: !s.files }))} />
          {secOpen.files && (
            <View>
              {hasZip && renderTree(sourceTree, 0)}
              {hasZip && <Text style={{ color: c.sideHead, fontSize: 10, letterSpacing: 0.5, fontWeight: '700', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 3 }}>COMBINED PREVIEW SOURCE</Text>}
              {combinedRows}
              {!!edit.assets?.length && (
                <View>
                  <Text style={{ color: c.sideHead, fontSize: 10, letterSpacing: 0.5, fontWeight: '700', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 3 }}>IMAGES AND FONTS ({edit.assets.length})</Text>
                  {edit.assets.map((a) => {
                    const key = ASSET + a.path;
                    return (
                      <Pressable key={key} accessibilityRole="button" accessibilityLabel={'Asset ' + a.path} onPress={() => openFile(key)}
                        style={(s: any) => ({ flexDirection: 'row', alignItems: 'center', height: 24, paddingLeft: 22, paddingRight: 6, gap: 6, backgroundColor: active === key ? c.select : s.hovered ? c.hover : 'transparent' })}>
                        {IMAGE_EXT.test(a.path) && Platform.OS !== 'web'
                          ? <Image source={{ uri: dataUri(a) }} style={{ width: 16, height: 16 }} resizeMode="contain" />
                          : IMAGE_EXT.test(a.path)
                            ? <Image source={{ uri: dataUri(a) }} style={{ width: 16, height: 16 }} resizeMode="contain" />
                            : <Text style={{ color: c.ok, fontSize: 11, width: 16 }}>Aa</Text>}
                        <Text numberOfLines={1} style={{ color: c.text, fontSize: 13, flex: 1 }}>{a.path}</Text>
                        <Text style={{ color: c.sub, fontSize: 10 }}>{formatBytes(assetBytes(a))}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {hasZip && <Text style={{ color: c.sub, fontSize: 11, padding: 12 }}>The preview runs the ZIP files. The combined files are what is saved for the AI to reuse; ZIP edits update them automatically.</Text>}
            </View>
          )}
        </ScrollView>
      </View>
    );

    // ---------------- editor column
    const activeAsset = active.startsWith(ASSET) ? edit.assets?.find((a) => a.path === active.slice(ASSET.length)) : undefined;
    const tabBar = (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, backgroundColor: c.tabBar }} contentContainerStyle={{ alignItems: 'stretch' }}>
        {tabs.filter((p) => (p.startsWith(ASSET) ? !!edit.assets?.some((a) => a.path === p.slice(ASSET.length)) : vfiles.some((f) => f.path === p))).map((path) => {
          const on = path === active;
          return (
            <Pressable key={path} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={'Tab ' + path} onPress={() => setActive(path)}
              style={(s: any) => ({ flexDirection: 'row', alignItems: 'center', gap: 7, height: 35, paddingLeft: 12, paddingRight: 8, borderTopWidth: 1, borderTopColor: on ? c.accent : 'transparent', borderRightWidth: 1, borderRightColor: c.border,
                backgroundColor: on ? c.tabActive : s.hovered ? c.hover : c.tab })}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: path.startsWith(ASSET) ? c.ok : dot(path) }} />
              <Text numberOfLines={1} style={{ color: on ? c.text : c.sub, fontSize: 13 }}>{label(path)}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel={'Close ' + path} onPress={() => closeTab(path)} hitSlop={6} style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 3 }}>
                <Text style={{ color: dirtyPaths.has(path) ? c.text : c.sub, fontSize: dirtyPaths.has(path) ? 11 : 12 }}>{dirtyPaths.has(path) ? '●' : '✕'}</Text>
              </Pressable>
            </Pressable>
          );
        })}
      </ScrollView>
    );

    const breadcrumb = file && !activeAsset ? (
      <View style={{ height: 22, justifyContent: 'center', paddingHorizontal: 14, backgroundColor: c.editor }}>
        <Text numberOfLines={1} style={{ color: c.sub, fontSize: 12 }}>{[edit.name || 'component', ...file.path.replace(CP, 'combined/').split('/')].join('  ›  ')}</Text>
      </View>
    ) : null;

    const editorBody = activeAsset ? <AssetViewer a={activeAsset} c={c} /> : file ? (
      <View style={{ flex: 1, minHeight: 160, backgroundColor: c.editor }}>
        <CodeEditor key={file.path} path={file.path} value={file.content} language={languageOf(file.path)} settings={ed} chrome="vscode"
          onChange={(v) => setContent(file.path, v)} onSelection={setSel} goTo={goTo} markers={diags.filter((d) => d.path === file.path)}
          onSave={() => saveRef.current()} onFormat={format} />
      </View>
    ) : (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: c.editor, gap: 6 }}>
        <Text style={{ color: c.sub, fontSize: 40 }}>{'</>'}</Text>
        <Text style={{ color: c.text, fontSize: 14 }}>No file open</Text>
        <Text style={{ color: c.sub, fontSize: 12, textAlign: 'center' }}>Choose a file in the explorer.{Platform.OS === 'web' ? '  Ctrl+S save · Ctrl+B explorer · Ctrl+J panel · Shift+Alt+F format' : ''}</Text>
      </View>
    );

    const editorColumn = (
      <View style={{ flex: 1, minWidth: 0, minHeight: 0, backgroundColor: c.editor }}>
        {tabBar}
        {breadcrumb}
        {editorBody}
      </View>
    );

    // ---------------- preview
    const previewPane = (
      <View style={{ flex: wide ? undefined : 1, width: wide ? lay.prevW : undefined, minHeight: 0, backgroundColor: c.editor }}>
        <View style={{ minHeight: 35, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: c.tabBar, borderBottomWidth: 1, borderBottomColor: c.border }}>
          <Text style={{ color: c.sideHead, fontSize: 11, letterSpacing: 0.6, marginRight: 4 }}>PREVIEW</Text>
          {DEVICES.map(([l, w]) => <Btn2 key={l} small c={c} label={l} active={lay.device === w} onPress={() => patchLay({ device: w })} />)}
          <TextInput value={customW} onChangeText={(v) => setCustomW(v.replace(/[^\d]/g, '').slice(0, 4))} placeholder="px" placeholderTextColor={c.sub} keyboardType="number-pad" accessibilityLabel="Custom preview width in pixels"
            onSubmitEditing={() => { const n = parseInt(customW, 10); if (n >= 240 && n <= 2400) patchLay({ device: n }); else props.toast('Enter a width between 240 and 2400 px.'); }}
            style={{ width: 54, height: 22, paddingHorizontal: 6, paddingVertical: 0, fontSize: 12, color: c.text, backgroundColor: c.input, borderWidth: 1, borderColor: c.border, borderRadius: 3 }} />
          <View style={{ flex: 1 }} />
          <Btn2 small c={c} label="↻ Run" title="Refresh preview" onPress={() => { setPv(componentPreviewFiles(edit)); setReload((r) => r + 1); }} />
          <Btn2 small c={c} label="⤢ Full screen" onPress={() => needCode(() => setFull(edit))} />
          <Btn2 small c={c} label="↗ Chrome tab" onPress={() => needCode(() => tab(edit))} />
        </View>
        <Text numberOfLines={1} style={{ color: c.sub, fontSize: 11, paddingHorizontal: 10, paddingVertical: 3 }}>{devLabel}</Text>
        <View style={{ flex: 1, minHeight: 0 }} onLayout={(e) => setPvBox(e.nativeEvent.layout.width)}>
          {canView(edit)
            ? <Preview files={pv} assets={edit.assets} width={devW} reloadKey={reload} onMessage={receive} />
            : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}><Text style={{ color: c.sub, fontSize: 12, textAlign: 'center' }}>Nothing to preview yet. Write some HTML, CSS or JS and it appears here live.</Text></View>}
        </View>
      </View>
    );

    // ---------------- bottom panel
    const levelColor = (m: PreviewMsg) => (m.type === 'error' || m.level === 'error' ? c.error : m.type === 'asset' || m.level === 'warn' ? c.warn : m.type === 'network' ? c.info : c.text);
    const panelTabs: [typeof panelTab, string][] = [['problems', `PROBLEMS${diags.length + missingRefs.length ? ' ' + (diags.length + missingRefs.length) : ''}`], ['console', `CONSOLE${msgs.length ? ' ' + msgs.length : ''}`], ['analysis', 'ANALYSIS']];
    const panelPane = (
      <View style={{ height: wide ? lay.panelH : undefined, flex: wide ? undefined : 1, minHeight: 0, backgroundColor: c.editor }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 32, paddingHorizontal: 8, gap: 14, borderBottomWidth: 1, borderBottomColor: c.border }}>
          {panelTabs.map(([k, l]) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: panelTab === k }} onPress={() => setPanelTab(k)} style={{ height: 32, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: panelTab === k ? c.accent : 'transparent' }}>
              <Text style={{ color: panelTab === k ? c.text : c.sub, fontSize: 11, letterSpacing: 0.4 }}>{l}</Text>
            </Pressable>
          ))}
          <View style={{ flex: 1 }} />
          {panelTab === 'console' && <Btn2 small c={c} label="Clear" onPress={() => setMsgs([])} />}
          {wide && <Btn2 small c={c} label="✕" title="Close panel" onPress={() => patchLay({ panel: false })} />}
        </View>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, gap: 3 }}>
          {panelTab === 'problems' && (<>
            {!diags.length && !missingRefs.length && <Text style={{ color: c.ok, fontSize: 12 }}>No problems found in this component.</Text>}
            {missingRefs.map((r, i) => (
              <Pressable key={'m' + i} onPress={() => openFile(edit.sourceFiles?.some((f) => f.path === r.file) ? r.file : combinedPath(edit, r.file === 'style.css' ? 'style.css' : 'index.html'))} accessibilityRole="button" style={(s: any) => ({ paddingVertical: 2, backgroundColor: s.hovered ? c.hover : 'transparent' })}>
                <Text style={{ color: c.warn, fontSize: 12, fontFamily: MONO }}>▲ <Text style={{ color: c.text }}>Image "{r.ref}" is not in the ZIP</Text> <Text style={{ color: c.sub }}>{r.file}</Text></Text>
              </Pressable>
            ))}
            {diags.slice(0, 200).map((d, i) => (
              <Pressable key={i} onPress={() => openFile(d.path, d.line)} accessibilityRole="button" style={(s: any) => ({ paddingVertical: 2, backgroundColor: s.hovered ? c.hover : 'transparent' })}>
                <Text style={{ color: d.severity === 'error' ? c.error : d.severity === 'warning' ? c.warn : c.info, fontSize: 12, fontFamily: MONO }}>
                  {d.severity === 'error' ? '✖' : d.severity === 'warning' ? '▲' : 'ℹ'} <Text style={{ color: c.text }}>{d.message}</Text> <Text style={{ color: c.sub }}>{d.path.replace(CP, 'combined/')}:{d.line}</Text>
                </Text>
              </Pressable>
            ))}
            <Text style={{ color: c.sub, fontSize: 11, marginTop: 6 }}>Quick syntax checks only (brackets, tags, JSON). Runtime errors from the preview appear in CONSOLE.</Text>
          </>)}
          {panelTab === 'console' && (<>
            {!msgs.length && <Text style={{ color: c.sub, fontSize: 12 }}>The preview's console.log output, script errors and missing assets show up here.</Text>}
            {msgs.map((m, i) => (
              <Text key={i} selectable style={{ color: levelColor(m), fontSize: 12, fontFamily: MONO }}>
                {m.type === 'asset' ? 'asset  ' : m.type === 'network' ? 'net    ' : (m.level || m.type).padEnd(6, ' ') + ' '}{m.msg}{m.source ? `  (${m.source}${m.line ? ':' + m.line : ''})` : ''}
              </Text>
            ))}
          </>)}
          {panelTab === 'analysis' && (edit.analysis
            ? <AnalysisView a={edit.analysis} c={c} onTest={(w) => needCode(() => { setFullW(w); setFull(edit); })} />
            : <Text style={{ color: c.sub, fontSize: 12 }}>No ZIP analysis for this component. Use "Import header/footer ZIP" on the components list to get a responsive score and file report.</Text>)}
        </ScrollView>
      </View>
    );

    // ---------------- title bar + status bar
    const titleBar = (
      <View style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: c.title, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <Btn2 c={c} label="‹ Back" onPress={goBack} />
        <Text numberOfLines={1} style={{ color: c.text, fontSize: 13, fontWeight: '600', marginHorizontal: 6, maxWidth: 260 }}>{edit.name || 'Untitled component'}{dirty ? ' ●' : ''}</Text>
        <View style={{ flex: 1 }} />
        <Btn2 c={c} label="Format" title="Format current file (Shift+Alt+F)" onPress={format} disabled={!file} />
        <Btn2 c={c} label="Copy file" onPress={copyFile} disabled={!file} />
        <Btn2 c={c} label="Copy all" title="Copy HTML, CSS and JS" onPress={copyAll} />
        <Btn2 c={c} label="Download" title="Download current file" onPress={download} disabled={!file} />
        <Btn2 c={c} primary label={dirty ? 'Save (Ctrl+S)' : 'Saved ✓'} onPress={save} />
      </View>
    );

    const statusItem = (txt: string, onPress?: () => void) => (
      <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} style={(s: any) => ({ paddingHorizontal: 8, height: 22, justifyContent: 'center', backgroundColor: s.hovered && onPress ? 'rgba(255,255,255,.18)' : 'transparent' })}>
        <Text numberOfLines={1} style={{ color: c.statusFg, fontSize: 12 }}>{txt}</Text>
      </Pressable>
    );
    const statusBar = (
      <View style={{ height: 22, flexDirection: 'row', alignItems: 'center', backgroundColor: c.status }}>
        {statusItem(`✖ ${errCount}  ▲ ${warnCount}`, () => { setPanelTab('problems'); patchLay({ panel: true }); if (!wide) setView('panel'); })}
        {statusItem(dirty ? '● Unsaved' : '✓ Saved')}
        <View style={{ flex: 1 }} />
        {edit.analysis && statusItem(`Responsive ${edit.analysis.responsiveScore}/100`, () => { setPanelTab('analysis'); patchLay({ panel: true }); if (!wide) setView('panel'); })}
        {wide && sel ? statusItem(`Ln ${sel.line}, Col ${sel.col}${sel.text ? ` (${sel.text.length} selected)` : ''}`) : null}
        {wide && statusItem(`Spaces: ${ed.tabSize}`)}
        {wide && statusItem('UTF-8')}
        {file ? statusItem(languageName(file.path)) : null}
      </View>
    );

    // ---------------- assemble
    if (wide) {
      return (
        <View style={{ flex: 1, minHeight: 0, backgroundColor: c.editor }}>
          {titleBar}
          <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}>
            <View style={{ width: 44, backgroundColor: c.activity }}>
              <ActivityBtn c={c} glyph="🗂" label="Toggle explorer (Ctrl+B)" active={lay.side} onPress={() => patchLay({ side: !lay.side })} />
              <ActivityBtn c={c} glyph="👁" label="Toggle live preview" active={lay.preview} onPress={() => patchLay({ preview: !lay.preview })} />
              <ActivityBtn c={c} glyph="▤" label="Toggle panel (Ctrl+J)" active={lay.panel} onPress={() => patchLay({ panel: !lay.panel })} />
            </View>
            {lay.side && (<>{sidebar}<Sash c={c} onDelta={(d) => setLay((l) => ({ ...l, sideW: Math.min(420, Math.max(150, l.sideW + d)) }))} /></>)}
            <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
              <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}>
                {editorColumn}
                {lay.preview && (<><Sash c={c} onDelta={(d) => setLay((l) => ({ ...l, prevW: Math.min(1000, Math.max(280, l.prevW - d)) }))} />{previewPane}</>)}
              </View>
              {lay.panel && (<><Sash c={c} vertical={false} onDelta={(d) => setLay((l) => ({ ...l, panelH: Math.min(Math.max(120, winH - 200), Math.max(100, l.panelH - d)) }))} />{panelPane}</>)}
            </View>
          </View>
          {statusBar}
        </View>
      );
    }
    const views: [typeof view, string][] = [['files', 'Files'], ['code', 'Code' + (dirty ? ' ●' : '')], ['preview', 'Preview'], ['panel', 'Panel']];
    return (
      <View style={{ flex: 1, minHeight: 0, backgroundColor: c.editor }}>
        {titleBar}
        <View style={{ flexDirection: 'row', backgroundColor: c.activity }}>
          {views.map(([k, l]) => (
            <Pressable key={k} accessibilityRole="button" accessibilityState={{ selected: view === k }} onPress={() => setView(k)} style={{ flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: view === k ? c.accent : 'transparent' }}>
              <Text style={{ color: c.activityFg, fontSize: 13, opacity: view === k ? 1 : 0.65 }}>{l}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1, minHeight: 0 }}>
          {view === 'files' && sidebar}
          {view === 'code' && editorColumn}
          {view === 'preview' && previewPane}
          {view === 'panel' && panelPane}
        </View>
        {statusBar}
      </View>
    );
  }

  // ================================================================== LIST
  return (
    <View style={{ flex: 1, minHeight: 0, backgroundColor: c.editor }}>
      <View style={{ minHeight: 38, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: c.title, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <Btn2 c={c} label="‹ Back" onPress={props.onBack} />
        <Text style={{ color: c.text, fontSize: 13, fontWeight: '600', marginHorizontal: 6 }}>My components</Text>
        <View style={{ flex: 1 }} />
        <Btn2 c={c} primary label="+ Add component" onPress={() => openEditor(empty())} disabled={!!busy} />
        <Btn2 c={c} label="Import header/footer ZIP" onPress={importZip} disabled={!!busy} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, maxWidth: 960, width: '100%', alignSelf: 'center' }}>
        <Text style={{ color: c.sub, fontSize: 12, lineHeight: 18 }}>
          Save your own approved code here (header, footer, banner, carousel ...). When you generate from a design, the AI keeps the saved structure and responsive code and restyles it like the design. Stored only on this device.
          A ZIP is analyzed first: every file is listed, the files that make it responsive are shown, and a responsive score and problems are stored with the component.
        </Text>
        {!!busy && <View style={{ padding: 10, backgroundColor: c.side, borderWidth: 1, borderColor: c.border, borderRadius: 4 }}><Text style={{ color: c.text, fontSize: 13 }}>{busy}</Text></View>}
        {props.items.length === 0 && (
          <View style={{ padding: 28, alignItems: 'center', gap: 6, backgroundColor: c.side, borderWidth: 1, borderColor: c.border, borderRadius: 4 }}>
            <Text style={{ color: c.sub, fontSize: 36 }}>{'</>'}</Text>
            <Text style={{ color: c.text, fontSize: 14 }}>No components yet</Text>
            <Text style={{ color: c.sub, fontSize: 12 }}>Add one, or import a header/footer ZIP.</Text>
          </View>
        )}
        {props.items.map((x) => (
          <View key={x.id} style={{ backgroundColor: c.side, borderWidth: 1, borderColor: c.border, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: c.accent }}>
            <View style={{ padding: 12, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ color: c.text, fontSize: 15, fontWeight: '700' }}>{x.name}</Text>
                {!!x.kind && <View style={{ paddingHorizontal: 8, height: 18, justifyContent: 'center', borderRadius: 9, backgroundColor: c.button }}><Text style={{ color: c.buttonText, fontSize: 11 }}>{KINDS.find(([k]) => k === x.kind)?.[1] ?? x.kind}</Text></View>}
              </View>
              {!!x.notes && <Text style={{ color: c.sub, fontSize: 12 }}>{x.notes}</Text>}
              <Text style={{ color: c.sub, fontSize: 12, fontFamily: MONO }}>{x.html.length + x.css.length + x.js.length} chars · HTML {x.html ? '✓' : '–'} · CSS {x.css ? '✓' : '–'} · JS {x.js ? '✓' : '–'}{x.analysis ? ` · responsive ${x.analysis.responsiveScore}/100` : ''}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                <Btn2 c={c} primary label="Edit" onPress={() => openEditor(x)} />
                <Btn2 c={c} label={show === x.id ? 'Hide output' : 'View output'} onPress={() => { setShow(show === x.id ? null : x.id); setListReload((r) => r + 1); }} disabled={!canView(x)} />
                <Btn2 c={c} label="Full screen" onPress={() => setFull(x)} disabled={!canView(x)} />
                <Btn2 c={c} label="Chrome tab" onPress={() => tab(x)} disabled={!canView(x)} />
                <Btn2 c={c} label="Delete" onPress={() => confirmAction('Delete component?', `"${x.name}" will be removed from this device. Projects already generated keep their code.`, 'Delete',
                  async () => { try { await props.onSave(props.items.filter((y) => y.id !== x.id)); } catch (e: any) { props.toast(e.message); } })} />
              </View>
            </View>
            {show === x.id && (
              <View style={{ height: 560, width: '100%', borderTopWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                <Preview files={componentPreviewFiles(x)} assets={x.assets} width="full" reloadKey={listReload} onMessage={noop} />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}