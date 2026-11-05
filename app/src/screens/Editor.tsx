import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { Image, ScrollView, useWindowDimensions, View } from 'react-native';
import { AnimConfig, AnimKind, FontChoice, Instruction, Project, ProjectAsset, ProjectFile, SectionStyle, uid } from '../types';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { MotionSettings, defaultMotion, paletteFromFiles, paletteFromImage } from '../lib/autoMotion';
import { PLAN_REQUEST, PlanItem, buildApplyRequest, parsePlan } from '../lib/changePlan';
import { openInBrowserTab } from '../lib/openInTab';
import Preview, { PreviewElement, PreviewMsg } from '../components/Preview';
import CodeEditor from '../components/CodeEditor';
import { applyManaged, detectSections, stripManaged } from '../lib/managed';
import { FONT_CATALOG, googleFontsUrl } from '../lib/fonts';
import { exportZip, exportProjectZip, ExportKind } from '../lib/exporter';
import { confirmAction } from '../lib/confirm';
import { refine } from '../api';
import { Settings, loadAssets, saveAssets, loadEditorSettings, saveEditorSettings } from '../storage';
import ImagesPanel from '../components/ImagesPanel';
import { analyzeRefs } from '../lib/assets';
import { describeAssets } from '../lib/imageMeta';
import { Platform } from 'react-native';
import Workbench from '../components/workbench/Workbench';
import Splitter from '../components/Splitter';
import { EditorSettings, defaultEditorSettings } from '../lib/editorSettings';
import { bundleForPreview } from '../lib/managed';
import { auditProject, extractDesignTokens, tokensToCss, makeSeoTags, fixAllSafe, summarizeIssues } from '../lib/quality';
import { commandToCss, convertFramework, FrameworkTarget, repeatedMarkupReport, responsiveAudit } from '../lib/proTools';
import { pageFilesFor } from '../lib/pageTemplates';

type Tab = 'code' | 'images' | 'design' | 'quality' | 'protools' | 'chat' | 'rules' | 'versions' | 'compare' | 'preview';
const lineCount = (s: string) => (s ? s.split('\n').length : 0);

export default function Editor(props: {
  project: Project;
  settings: Settings;
  onSave: (p: Project) => Promise<void>;
  onClose: () => void;
  toast: (s: string) => void;
}) {
  const t = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const wide = winW >= 1000;

  const [project, setProject] = useState(props.project);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [tab, setTab] = useState<Tab>('code');
  const [current, setCurrent] = useState(props.project.files[0]?.path ?? '');
  const [vp, setVp] = useState<number | 'full'>('full');
  const [reload, setReload] = useState(0);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [selSection, setSelSection] = useState<string | null>(null);
  const [pending, setPending] = useState<{ summary: string[]; before: ProjectFile[]; notes: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [fullView, setFullView] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [variantFiles, setVariantFiles] = useState<{ a: ProjectFile[]; b: ProjectFile[] } | null>(null);
  const [variantBusy, setVariantBusy] = useState(false);
  const [showVariants, setShowVariants] = useState(false);
  const [contactBusy, setContactBusy] = useState<'contact' | 'appointment' | 'both' | null>(null);
  const [inspected, setInspected] = useState<PreviewElement | null>(null);
  const [inspectTab, setInspectTab] = useState<'html' | 'css' | 'js'>('css');
  const [editText, setEditText] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editBg, setEditBg] = useState('');
  const [editFontSize, setEditFontSize] = useState('');
  const [editPadding, setEditPadding] = useState('');
  const [editRadius, setEditRadius] = useState('');
  const [sourceDraft, setSourceDraft] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [fit, setFit] = useState(true);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [editorSettings, setEditorSettingsState] = useState<EditorSettings>(defaultEditorSettings);
  const [savedFiles, setSavedFiles] = useState<ProjectFile[]>(props.project.files); // what is stored, to show unsaved dots
  const [codeFull, setCodeFull] = useState(false);
  const [leftW, setLeftW] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<PreviewMsg[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [pvFiles, setPvFiles] = useState<ProjectFile[]>(props.project.files);
  // Preview follows the active HTML tab, so Contact Us / Book Appointment pages are really rendered.
  const previewEntry = /\.html?$/i.test(current) ? current : undefined;
  const [proTarget, setProTarget] = useState<FrameworkTarget>('react');
  const [originalShot, setOriginalShot] = useState<string | null>(null);
  const [renderedShot, setRenderedShot] = useState<string | null>(null);
  const [shotScore, setShotScore] = useState<number | null>(null);
  const [shotDiff, setShotDiff] = useState<string | null>(null);
  const [region, setRegion] = useState({ x: 0, y: 0, width: 320, height: 180 });
  const [regionImage, setRegionImage] = useState<string | null>(null);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandText, setCommandText] = useState('');
  const [commandBusy, setCommandBusy] = useState(false);

  const projRef = useRef(project);
  projRef.current = project;
  const undoS = useRef<ProjectFile[][]>([]);
  const redoS = useRef<ProjectFile[][]>([]);
  const lastPush = useRef(0);
  const firstRun = useRef(true);

  // ---- autosave (debounced; can be switched off in Settings, then Ctrl+S saves) ----
  const saveNow = async () => {
    const snap = { ...projRef.current, updatedAt: Date.now() };
    setSaveState('saving');
    try { await props.onSave(snap); setSaveState('saved'); setSavedFiles(snap.files); }
    catch (e: any) { setSaveState('error'); props.toast(e.message || 'Save failed.'); }
  };
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    setSaveState('unsaved');
    if (!editorSettings.autoSave) return;
    const h = setTimeout(saveNow, 700);
    return () => clearTimeout(h);
  }, [project, editorSettings.autoSave]);

  // editor preferences
  useEffect(() => { loadEditorSettings().then(setEditorSettingsState); }, []);
  const setEditorSettings = (s: EditorSettings) => { setEditorSettingsState(s); saveEditorSettings(s); };

  // warn before the page is closed with unsaved work (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: BeforeUnloadEvent) => { if (saveState !== 'saved') { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [saveState]);

  // the live preview follows the code after a short pause (the delay is an editor setting)
  useEffect(() => {
    const h = setTimeout(() => setPvFiles(project.files), editorSettings.previewDebounce);
    return () => clearTimeout(h);
  }, [project.files, editorSettings.previewDebounce]);

  const flushAndClose = async () => {
    try { const snap = { ...projRef.current, updatedAt: Date.now() }; await props.onSave(snap); setSavedFiles(snap.files); } catch (e: any) { props.toast(e.message || 'Save failed.'); }
    props.onClose();
  };

  const patch = (p: Partial<Project>) => setProject((cur) => ({ ...cur, ...p }));
  const rebuild = (next: Project) => setProject({ ...next, files: applyManaged(next) });

  // ---- images (stored separately from the project, see storage.ts) ----
  useEffect(() => {
    let alive = true;
    loadAssets(props.project.id).then((list) => {
      if (!alive) return;
      setAssets(list);
      // Right after "Generate": if some images still need attention, open the Images tab so the user sees it.
      const fresh = Date.now() - props.project.createdAt < 120_000;
      if (fresh && list.length && analyzeRefs(props.project.files, list).some((r) => r.status !== 'ok')) setTab('images');
    });
    return () => { alive = false; };
  }, []);

  const changeAssets = async (next: ProjectAsset[]) => {
    await saveAssets(projRef.current.id, next); // throws a clear message if storage is full
    setAssets(next);
    patch({ assets: next.map((a) => ({ path: a.path, mime: a.mime, bytes: Math.floor((a.base64.length * 3) / 4) })) });
    setReload((r) => r + 1);
  };
  // Changes made by the Images panel (fixing paths) go through a version snapshot, so they can be undone.
  const changeFilesFromImages = (files: ProjectFile[], label: string) => {
    const cur = projRef.current;
    patch({ versions: [{ id: uid(), label: 'Before: ' + label, createdAt: Date.now(), files: cur.files }, ...cur.versions], files });
    pushUndo(cur.files);
    setReload((r) => r + 1);
  };

  const pushUndo = (files: ProjectFile[]) => {
    if (Date.now() - lastPush.current > 1500) {
      undoS.current.push(files);
      if (undoS.current.length > 50) undoS.current.shift();
      redoS.current = [];
      lastPush.current = Date.now();
    }
  };
  const editFile = (path: string, content: string) => {
    pushUndo(projRef.current.files);
    patch({ files: projRef.current.files.map((f) => (f.path === path ? { ...f, content } : f)) });
  };
  const undo = () => {
    const prev = undoS.current.pop();
    if (!prev) return;
    redoS.current.push(projRef.current.files);
    lastPush.current = 0;
    patch({ files: prev });
  };
  const redo = () => {
    const nxt = redoS.current.pop();
    if (!nxt) return;
    undoS.current.push(projRef.current.files);
    patch({ files: nxt });
  };

  // keyboard shortcuts (web): Ctrl+S save, Ctrl+Z / Ctrl+Y
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 's') { e.preventDefault(); saveNow().then(() => props.toast('Saved.')); }
      if (k === 'k') { e.preventDefault(); setCommandOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && commandOpen) setCommandOpen(false); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [commandOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !fullView) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullView(false); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [fullView]);

  const onPreviewMsg = useCallback((m: PreviewMsg) => setMsgs((e) => [...e.slice(-199), m]), []);
  const errors = useMemo(() => msgs.filter((m) => m.type !== 'log').slice(-10), [msgs]);
  const logs = useMemo(() => msgs.filter((m) => m.type === 'log'), [msgs]);
  const setErrors = (_: PreviewMsg[]) => setMsgs([]);
  const sections = useMemo(() => detectSections(project.files), [project.files]);
  const instructionTexts = () => project.instructions.filter((i) => i.enabled).map((i) => i.text);
  const file = project.files.find((f) => f.path === current) ?? project.files[0];

  const snapshot = (label: string, files = projRef.current.files) =>
    ({ id: uid(), label, createdAt: Date.now(), files });

  // Replace the project's files (AI changes, imports, renames, search/replace ...). A snapshot is saved first and Undo works.
  const applyFiles = (next: ProjectFile[], label: string) => {
    const cur = projRef.current;
    undoS.current.push(cur.files); if (undoS.current.length > 50) undoS.current.shift(); redoS.current = [];
    const nextP: Project = { ...cur, files: next, versions: [snapshot('Before: ' + label, cur.files), ...cur.versions].slice(0, 60) };
    setProject({ ...nextP, files: applyManaged(nextP) });
    setReload((r) => r + 1);
  };

  // Web: open the preview in its own browser tab. The page is wrapped in a SANDBOXED iframe (no same-origin), so the generated code can never touch this app's data.
  const openPreviewTab = () => {
    if (Platform.OS !== 'web') { props.toast('Use "Full view" on a phone.'); return; }
    const html = bundleForPreview(projRef.current.files, assets, previewEntry);
    const attr = html.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const wrapper = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${projRef.current.name.replace(/[<>&]/g, '')} - preview</title><style>html,body{margin:0;height:100%;background:#fff}iframe{border:0;width:100%;height:100%;display:block}</style><iframe sandbox="allow-scripts allow-forms" srcdoc="${attr}"></iframe>`;
    const url = URL.createObjectURL(new Blob([wrapper], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) props.toast('The browser blocked the new tab. Allow pop-ups for this site.');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  // ================= PANELS =================
  // The workbench must fit its actual flex parent; a tall fixed minimum caused the editor and
  // preview columns to drift out of alignment on shorter desktop windows.
  const wbHeight = codeFull ? winH : Math.max(320, winH - 190);
  const codePanel = (
    <View style={[{ flex: 1, minHeight: 0, minWidth: 0 }, codeFull && Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: t.bg, padding: 0 } as any) : undefined]}>
      <Workbench project={project} files={project.files} savedFiles={savedFiles} server={props.settings} editor={editorSettings} setEditor={setEditorSettings}
        current={file?.path ?? ''} setCurrent={setCurrent} editFile={editFile} applyFiles={applyFiles} patchProject={patch} toast={props.toast}
        undo={undo} redo={redo} saveNow={saveNow} saveState={saveState} full={codeFull} setFull={setCodeFull} openPreviewTab={openPreviewTab} height={wbHeight} />
    </View>
  );

  const fontRole = (role: 'heading' | 'body' | 'button', label: string) => {
    const cur = project.fonts[role];
    const setFont = (c: FontChoice | undefined) => rebuild({ ...project, fonts: { ...project.fonts, [role]: c } });
    return (
      <View style={{ gap: 4, marginBottom: 8 }}>
        <Txt bold>{label}: {cur ? cur.family : 'not set'}</Txt>
        <View style={row}>
          {FONT_CATALOG.map((f) => (
            <Chip key={f.family} label={f.family} active={cur?.family === f.family}
              onPress={() => setFont({ family: f.family, weights: cur?.family === f.family ? cur.weights : [400, 700].filter((w) => f.weights.includes(w)) })} />
          ))}
          {cur && <Chip label="Clear" onPress={() => setFont(undefined)} />}
        </View>
        <Input placeholder="Or type any Google Fonts family name, press enter" autoCapitalize="words"
          onSubmitEditing={(e) => { const v = e.nativeEvent.text.trim(); if (v) setFont({ family: v, weights: [400, 700] }); }} />
        {cur && (
          <View style={row}>
            {[300, 400, 500, 600, 700, 800].map((w) => (
              <Chip key={w} label={String(w)} active={cur.weights.includes(w)}
                onPress={() => {
                  const ws = cur.weights.includes(w) ? cur.weights.filter((x) => x !== w) : [...cur.weights, w];
                  setFont({ ...cur, weights: ws.length ? ws : [400] });
                }} />
            ))}
          </View>
        )}
        {cur && Platform.OS === 'web' && <FontSample choice={cur} />}
      </View>
    );
  };

  const styleOf = (id: string): SectionStyle => project.sectionStyles[id] ?? {};
  const setStyle = (id: string, s: SectionStyle) => rebuild({ ...project, sectionStyles: { ...project.sectionStyles, [id]: s } });
  const setAnim = (a: AnimConfig) => rebuild({ ...project, animations: project.animations.map((x) => (x.id === a.id ? a : x)) });
  const num = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(/[^\d.]/g, '')) || 0);

  const KINDS: AnimKind[] = ['fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in', 'hover-lift', 'hover-scale', 'hover-shadow'];

  // ---- Motion: light hover / reveal animations for cards and boxes ----
  const [hexDraft, setHexDraft] = useState('');
  const motion: MotionSettings = project.motion ?? { ...defaultMotion(), enabled: false };
  const setMotion = (m: Partial<MotionSettings>) => {
    const base = project.motion ?? defaultMotion(paletteFromFiles(project.files));
    rebuild({ ...project, motion: { ...base, ...m } });
    setReload((r) => r + 1);
  };
  const detectColours = async () => {
    const found = project.referenceImage ? await paletteFromImage(project.referenceImage.base64, project.referenceImage.mime) : [];
    const list = found.length ? found : paletteFromFiles(project.files);
    if (!list.length) { props.toast('No brand colours found. Type one below, for example #E22728.'); return; }
    setMotion({ palette: list }); props.toast('Colours updated: ' + list.join(' '));
  };

  const motionCard = (
    <Card style={{ gap: 6 }}>
      <Txt bold size={16}>Motion (cards and boxes)</Txt>
      <Txt sub size={12}>Light hover animation, scroll reveal and a light background tint taken from the design colours. Never dark. Written into a managed block, so your own code is untouched.</Txt>
      <View style={row}>
        <Chip label={motion.enabled ? 'Motion: on' : 'Motion: off'} active={motion.enabled} onPress={() => setMotion({ enabled: !motion.enabled })} />
        <Chip label="Card hover" active={motion.enabled && motion.hover} onPress={() => setMotion({ enabled: true, hover: !motion.hover })} />
        <Chip label="Scroll reveal" active={motion.enabled && motion.reveal} onPress={() => setMotion({ enabled: true, reveal: !motion.reveal })} />
        <Chip label="Light hover tint" active={motion.enabled && motion.tint} onPress={() => setMotion({ enabled: true, tint: !motion.tint })} />
        <Chip label="No animation on button click" active={motion.noButtonClick} onPress={() => setMotion({ enabled: true, noButtonClick: !motion.noButtonClick })} />
      </View>
      <View style={row}>
        {motion.palette.map((c) => <View key={c} style={{ width: 26, height: 26, borderRadius: 6, backgroundColor: c, borderWidth: 1, borderColor: t.border }} />)}
        <Txt sub size={12}>{motion.palette.length ? motion.palette.join(' ') : 'No colours yet'}</Txt>
        <Btn small kind="ghost" label="Detect from reference" onPress={detectColours} />
      </View>
      <Input placeholder={`Main colour, e.g. #E22728 (now: ${motion.palette[0] || 'none'}). The hover tint is a light version of it.`} value={hexDraft} autoCapitalize="none" autoCorrect={false}
        onChangeText={(v) => { setHexDraft(v); if (/^#[\da-f]{6}$/i.test(v.trim())) setMotion({ palette: [v.trim().toLowerCase(), ...motion.palette.slice(1)] }); }} />
    </Card>
  );

  const designPanel = (
    <View style={{ gap: 12 }}>
      {motionCard}
      <Card style={{ gap: 4 }}>
        <Txt bold size={16}>Google Fonts</Txt>
        <Txt sub size={12}>Applied through a managed block in index.html (CSS2 link + font-family with fallbacks). Needs internet to load fonts.</Txt>
        {fontRole('heading', 'Headings')}
        {fontRole('body', 'Body text')}
        {fontRole('button', 'Buttons')}
      </Card>
      <Card style={{ gap: 6 }}>
        <Txt bold size={16}>Sections</Txt>
        {sections.length === 0 && <Txt sub>No sections with an id were found in index.html. Ask the chat: "give every section a unique id".</Txt>}
        <View style={row}>
          {sections.map((s) => (
            <Chip key={s.id} label={`${s.id} <${s.tag}>`} active={selSection === s.id}
              onPress={() => { setSelSection(s.id); setHighlight(null); setTimeout(() => setHighlight(s.id), 10); }} />
          ))}
        </View>
      </Card>
      {selSection && (
        <Card style={{ gap: 8 }}>
          <Txt bold size={16}>#{selSection}</Txt>
          <Txt sub size={12}>Only this section is changed. Values are written as CSS in the managed block.</Txt>
          <View style={row}>
            <Input style={{ width: 130 }} placeholder="Background #hex" autoCapitalize="none" value={styleOf(selSection).bg ?? ''}
              onChangeText={(v) => setStyle(selSection, { ...styleOf(selSection), bg: v || undefined })} />
            <Input style={{ width: 110 }} placeholder="Padding Y px" keyboardType="numeric" value={styleOf(selSection).paddingY?.toString() ?? ''}
              onChangeText={(v) => setStyle(selSection, { ...styleOf(selSection), paddingY: num(v) })} />
            <Input style={{ width: 120 }} placeholder="Min height px" keyboardType="numeric" value={styleOf(selSection).minHeight?.toString() ?? ''}
              onChangeText={(v) => setStyle(selSection, { ...styleOf(selSection), minHeight: num(v) })} />
          </View>
          <View style={row}>
            {(['left', 'center', 'right'] as const).map((a) => (
              <Chip key={a} label={a} active={styleOf(selSection).textAlign === a}
                onPress={() => setStyle(selSection, { ...styleOf(selSection), textAlign: styleOf(selSection).textAlign === a ? undefined : a })} />
            ))}
          </View>
          <View style={row}>
            <Chip label="Hide on mobile" active={!!styleOf(selSection).hideMobile} onPress={() => setStyle(selSection, { ...styleOf(selSection), hideMobile: !styleOf(selSection).hideMobile })} />
            <Chip label="Hide on tablet" active={!!styleOf(selSection).hideTablet} onPress={() => setStyle(selSection, { ...styleOf(selSection), hideTablet: !styleOf(selSection).hideTablet })} />
            <Chip label="Hide on desktop" active={!!styleOf(selSection).hideDesktop} onPress={() => setStyle(selSection, { ...styleOf(selSection), hideDesktop: !styleOf(selSection).hideDesktop })} />
          </View>
          <Btn small kind="ghost" label="Reset section style" onPress={() => {
            const { [selSection]: _x, ...rest } = project.sectionStyles;
            rebuild({ ...project, sectionStyles: rest });
          }} />

          <Txt bold size={16} style={{ marginTop: 8 }}>Animations for #{selSection}</Txt>
          <View style={row}>
            {KINDS.map((k) => (
              <Chip key={k} label={'+ ' + k} onPress={() =>
                rebuild({ ...project, animations: [...project.animations, { id: uid(), sectionId: selSection, scope: 'section', kind: k, duration: 600, delay: 0, enabled: true }] })} />
            ))}
          </View>
          {project.animations.filter((a) => a.sectionId === selSection).map((a) => (
            <Card key={a.id} style={{ gap: 6 }}>
              <Txt bold>{a.kind}{a.enabled ? '' : ' (off)'}</Txt>
              <View style={row}>
                <Input style={{ width: 110 }} placeholder="Duration ms" keyboardType="numeric" value={String(a.duration)} onChangeText={(v) => setAnim({ ...a, duration: num(v) ?? 600 })} />
                <Input style={{ width: 100 }} placeholder="Delay ms" keyboardType="numeric" value={String(a.delay)} onChangeText={(v) => setAnim({ ...a, delay: num(v) ?? 0 })} />
              </View>
              <View style={row}>
                {a.kind.startsWith('hover') && (
                  <Chip label={a.scope === 'items' ? 'Applies to: cards/items only' : 'Applies to: whole section'} onPress={() => setAnim({ ...a, scope: a.scope === 'items' ? 'section' : 'items' })} />
                )}
                <Btn small kind="ghost" label={a.enabled ? 'Disable' : 'Enable'} onPress={() => setAnim({ ...a, enabled: !a.enabled })} />
                <Btn small kind="ghost" label="Preview" onPress={() => { setReload((r) => r + 1); if (!wide) setTab('preview'); }} />
                <Btn small kind="danger" label="Remove" onPress={() => rebuild({ ...project, animations: project.animations.filter((x) => x.id !== a.id) })} />
              </View>
            </Card>
          ))}
          <Txt sub size={12}>Entrance animations use IntersectionObserver (no library). Reduced-motion users get no animation. To preview a scroll animation, scroll the preview after it reloads.</Txt>
        </Card>
      )}
    </View>
  );

  const [chatText, setChatText] = useState('');
  const [chatImg, setChatImg] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatErr, setChatErr] = useState('');

  const sendChat = async (override?: string) => {
    const req = (override ?? chatText).trim();
    if (!req) return;
    setChatBusy(true); setChatErr('');
    try {
      const before = projRef.current.files;
      const res = await refine(props.settings, {
        files: stripManaged(before), request: req, target: project.target, instructions: instructionTexts(),
        assets: assets.length ? await describeAssets(assets) : undefined,
        ...((chatImg || override) && project.referenceImage ? { imageBase64: project.referenceImage.base64, mime: project.referenceImage.mime } : {}),
      });
      const merged = new Map(stripManaged(before).map((f) => [f.path, f]));
      const summary: string[] = [];
      for (const f of res.files) {
        const old = merged.get(f.path);
        summary.push(`${old ? 'Changed' : 'Added'} ${f.path}: ${lineCount(old?.content ?? '')} -> ${lineCount(f.content)} lines`);
        merged.set(f.path, f);
      }
      const next: Project = { ...projRef.current, files: [...merged.values()],
        versions: [snapshot('Before: ' + req.slice(0, 40), before), ...projRef.current.versions] };
      setProject({ ...next, files: applyManaged(next) });
      setPending({ summary, before, notes: res.notes });
      if (override === undefined) setChatText(''); else setPlanItems([]);
      setReload((r) => r + 1);
    } catch (e: any) { setChatErr(e.message || 'Refinement failed.'); }
    finally { setChatBusy(false); }
  };

  // ---- Step 1 / Step 2: analyze the design, list the changes, then apply only the chosen ones ----
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [planBusy, setPlanBusy] = useState(false);
  const [planErr, setPlanErr] = useState('');
  const [planRaw, setPlanRaw] = useState('');
  const [planExtra, setPlanExtra] = useState('');

  const analyzePlan = async () => {
    if (!project.referenceImage) { setPlanErr('This project has no reference image (PDF designs are not kept in the project). Upload the design in the Compare tab (Upload reference) or use "Send reference image" below.'); return; }
    setPlanBusy(true); setPlanErr(''); setPlanRaw(''); setPlanItems([]);
    try {
      const res = await refine(props.settings, {
        files: stripManaged(projRef.current.files), request: PLAN_REQUEST, target: project.target, instructions: instructionTexts(),
        assets: assets.length ? await describeAssets(assets) : undefined,
        imageBase64: project.referenceImage.base64, mime: project.referenceImage.mime,
      });
      // Only the text is used. Any file the server may send back is ignored: this step never changes the project.
      const items = parsePlan(res.notes || '');
      if (!items.length) { setPlanRaw(res.notes || ''); setPlanErr('The AI did not return a numbered list I could read. Its answer is shown below. Try again, or type the changes yourself in the box.'); }
      setPlanItems(items);
    } catch (e: any) { setPlanErr(e.message || 'Analysis failed.'); }
    finally { setPlanBusy(false); }
  };
  const applyPlan = () => { const req = buildApplyRequest(planItems, planExtra); setPlanExtra(''); sendChat(req); };

  const planCard = (
    <Card style={{ gap: 8 }}>
      <Txt bold size={16}>Step 1: find the differences</Txt>
      <Txt sub size={12}>The AI compares the reference image with the page, section by section, and lists what should change. Nothing is changed in this step.</Txt>
      <Btn label={planBusy ? 'Analyzing...' : 'Analyze design and list changes'} onPress={analyzePlan} disabled={planBusy || chatBusy} />
      {!!planErr && <Txt style={{ color: t.danger }} size={12}>{planErr}</Txt>}
      {!!planRaw && <Txt sub size={12} selectable>{planRaw}</Txt>}
      {planItems.length > 0 && (
        <>
          <View style={row}>
            <Btn small kind="ghost" label="Select all" onPress={() => setPlanItems(planItems.map((i) => ({ ...i, selected: true })))} />
            <Btn small kind="ghost" label="Select none" onPress={() => setPlanItems(planItems.map((i) => ({ ...i, selected: false })))} />
            <Txt sub size={12}>{planItems.filter((i) => i.selected).length} of {planItems.length} will be applied</Txt>
          </View>
          {planItems.map((i) => (
            <View key={i.id} style={[row, { flexWrap: 'nowrap', alignItems: 'flex-start' }]}>
              <Chip label={i.selected ? 'Change' : 'Skip'} active={i.selected} onPress={() => setPlanItems(planItems.map((x) => (x.id === i.id ? { ...x, selected: !x.selected } : x)))} />
              <Txt size={12} style={{ flex: 1 }}><Txt bold size={12}>{i.section}: </Txt>{i.text}</Txt>
            </View>
          ))}
        </>
      )}
      {(planItems.length > 0 || !!planErr) && (
        <>
          <Txt bold size={16}>Step 2: your own changes (optional) and apply</Txt>
          <Input multiline value={planExtra} onChangeText={setPlanExtra} style={{ minHeight: 70 }} placeholder={'Anything else, in your words. e.g. make the banner taller, use my logo, remove the second carousel'} />
          <Btn label={chatBusy ? 'Working...' : 'Apply selected changes'} onPress={applyPlan} disabled={chatBusy || (!planItems.some((i) => i.selected) && !planExtra.trim())} />
        </>
      )}
    </Card>
  );

  const chatPanel = (
    <View style={{ gap: 10 }}>
      {planCard}
      <Card style={{ gap: 6 }}>
        <Txt bold>Active instructions (applied to this request)</Txt>
        {instructionTexts().length ? instructionTexts().map((x, i) => <Txt key={i} sub size={12}>• {x}</Txt>) : <Txt sub size={12}>None. Add some in the Rules tab.</Txt>}
      </Card>
      <Input multiline value={chatText} onChangeText={setChatText} style={{ minHeight: 90 }}
        placeholder={'e.g. Make the hero taller\nChange the button color to #E22728\nFix the mobile overflow'} />
      <View style={row}>
        {project.referenceImage && <Chip label={chatImg ? 'Reference image: sent' : 'Send reference image'} active={chatImg} onPress={() => setChatImg(!chatImg)} />}
      </View>
      <Txt sub size={12}>This request is one-time. It is NOT saved as a permanent rule.</Txt>
      <Btn label={chatBusy ? 'Working...' : 'Apply change'} onPress={() => sendChat()} disabled={chatBusy || !chatText.trim()} />
      {!!chatErr && <Card><Txt style={{ color: t.danger }}>{chatErr}</Txt></Card>}
      {pending && (
        <Card style={{ gap: 6 }}>
          <Txt bold>Change applied. Review it in the preview.</Txt>
          {!!pending.notes && <Txt sub size={12}>{pending.notes}</Txt>}
          {pending.summary.map((s, i) => <Txt key={i} size={12}>• {s}</Txt>)}
          <View style={row}>
            <Btn small label="Keep" onPress={() => setPending(null)} />
            <Btn small kind="danger" label="Undo this change" onPress={() => { patch({ files: pending.before }); setPending(null); setReload((r) => r + 1); }} />
          </View>
        </Card>
      )}
    </View>
  );

  const [newRule, setNewRule] = useState('');
  const setRules = (instructions: Instruction[]) => patch({ instructions });
  const move = (i: number, d: number) => {
    const a = [...project.instructions]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; setRules(a);
  };
  const rulesPanel = (
    <View style={{ gap: 8 }}>
      <Txt sub size={12}>Project-wide rules. They are sent with every generation and refinement while enabled.</Txt>
      {project.instructions.map((r, i) => (
        <Card key={r.id} style={{ gap: 6 }}>
          <Input value={r.text} onChangeText={(v) => setRules(project.instructions.map((x) => (x.id === r.id ? { ...x, text: v } : x)))} />
          <View style={row}>
            <Btn small kind="ghost" label={r.enabled ? 'On' : 'Off'} onPress={() => setRules(project.instructions.map((x) => (x.id === r.id ? { ...x, enabled: !x.enabled } : x)))} />
            <Btn small kind="ghost" label="Up" onPress={() => move(i, -1)} />
            <Btn small kind="ghost" label="Down" onPress={() => move(i, 1)} />
            <Btn small kind="danger" label="Delete" onPress={() => setRules(project.instructions.filter((x) => x.id !== r.id))} />
          </View>
        </Card>
      ))}
      <Input value={newRule} onChangeText={setNewRule} placeholder="New rule, e.g. Keep the header unchanged" />
      <Btn label="Add rule" disabled={!newRule.trim()} onPress={() => { setRules([...project.instructions, { id: uid(), text: newRule.trim(), enabled: true }]); setNewRule(''); }} />
    </View>
  );

  const versionsPanel = (
    <View style={{ gap: 8 }}>
      <Btn label="Save version now" onPress={() => { patch({ versions: [snapshot('Manual save'), ...project.versions] }); props.toast('Version saved.'); }} />
      {project.versions.length === 0 && <Txt sub>No versions yet.</Txt>}
      {project.versions.map((v) => (
        <Card key={v.id} style={{ gap: 6 }}>
          <Txt bold>{v.label}</Txt>
          <Txt sub size={12}>{new Date(v.createdAt).toLocaleString()} · {v.files.length} files</Txt>
          <View style={row}>
            <Btn small label="Restore" onPress={() => {
              patch({ versions: [snapshot('Before restore'), ...project.versions], files: v.files });
              setReload((r) => r + 1); props.toast('Restored. Your previous state was saved as a version.');
            }} />
            <Btn small kind="danger" label="Delete version" onPress={() => confirmAction('Delete this version?', 'Only this saved version is removed. Your current files are not touched.', 'Delete version',
              () => patch({ versions: project.versions.filter((x) => x.id !== v.id) }))} />
          </View>
        </Card>
      ))}
    </View>
  );

  const generateTwoPreviews = async () => {
    setVariantBusy(true);
    try {
      const base = { files: projRef.current.files, target: projRef.current.target, instructions: projRef.current.instructions.filter(x => x.enabled).map(x => x.text), imageBase64: projRef.current.referenceImage?.base64, mime: projRef.current.referenceImage?.mime };
      const [a, b] = await Promise.all([
        refine(props.settings, { ...base, request: 'Create a polished design alternative A for this complete website. Keep the same business identity and content, but use a premium editorial layout, refined typography, generous spacing and elegant interactions. Return the complete working project files.' }),
        refine(props.settings, { ...base, request: 'Create a distinctly different design alternative B for this complete website. Keep the same business identity and content, but use a modern bold visual system, different section compositions, strong cards and contemporary interactions. Return the complete working project files.' }),
      ]);
      setVariantFiles({ a: a.files, b: b.files }); setShowVariants(true); setFullView(true); props.toast('Two design alternatives are ready. Compare them and choose one.');
    } catch (e: any) { props.toast(e.message || 'Could not generate design alternatives. Check server settings.'); }
    finally { setVariantBusy(false); }
  };

  const chooseVariant = (which: 'a' | 'b') => {
    if (!variantFiles) return;
    changeFilesFromImages(variantFiles[which], `selected preview ${which.toUpperCase()}`);
    setShowVariants(false); setVariantFiles(null); setInspectMode(false); setInspected(null);
    props.toast(`Preview ${which.toUpperCase()} is now your project code.`);
  };

  const generateContactPages = async (kind: 'contact' | 'appointment' | 'both' = 'both') => {
    if (contactBusy) return;
    setContactBusy(kind);
    try {
      // These page buttons intentionally work locally. They must not call the AI
      // provider, because provider quota/rate limits should never block page creation.
      const starterFiles = pageFilesFor(kind);
      const map = new Map(projRef.current.files.map((file) => [file.path, file]));
      for (const file of starterFiles) map.set(file.path, file);
      const updatedFiles = Array.from(map.values());

      changeFilesFromImages(updatedFiles, `add ${kind} page files`);
      const entryPath = kind === 'appointment' ? 'book-appointment.html' : 'contact.html';
      setCurrent(entryPath);
      setTab('code');

      const pageNames = kind === 'both'
        ? 'Contact Us and Book Appointment'
        : kind === 'contact' ? 'Contact Us' : 'Book Appointment';
      props.toast(`${pageNames} page files added to Code. Open the six file tabs to edit HTML, CSS and JavaScript. AI is not required for this action.`);
    } catch (e: any) {
      props.toast(e?.message || 'Could not add the page files.');
    } finally {
      setContactBusy(null);
    }
  };

  const handleInspect = (item: PreviewElement) => {
    setInspected(item); setEditText(item.text); setEditColor(item.color); setEditBg(item.backgroundColor);
    setEditFontSize(item.fontSize); setEditPadding(item.padding); setEditRadius(item.borderRadius); setInspectTab('html');
    const firstHtml = projRef.current.files.find(f => /\.html?$/i.test(f.path));
    setSourcePath(firstHtml?.path || ''); setSourceDraft(firstHtml?.content || item.outerHTML);
  };

  const sourceForTab = (tab: 'html' | 'css' | 'js') => project.files.find(f => tab === 'html' ? /\.html?$/i.test(f.path) : tab === 'css' ? /\.css$/i.test(f.path) : /\.m?js$/i.test(f.path));
  const loadSourceTab = (tab: 'html' | 'css' | 'js') => {
    setInspectTab(tab); const file = sourceForTab(tab); setSourcePath(file?.path || ''); setSourceDraft(file?.content || '');
  };
  const applySourceDraft = () => {
    if (!sourcePath) { props.toast('No matching source file exists for this tab.'); return; }
    const files = projRef.current.files.map(f => f.path === sourcePath ? { ...f, content: sourceDraft } : f);
    changeFilesFromImages(files, `edit ${sourcePath} in visual inspector`);
    props.toast(`${sourcePath} updated. Preview will refresh automatically.`);
  };

  const comparePanel = (
    <View style={{ gap: 8 }}>
      <Txt bold>Reference screenshot</Txt>
      {project.referenceFile && !project.referenceImage ? (
        <Card><Txt>Reference was a PDF: {project.referenceFile.name} ({(project.referenceFile.size / 1024 / 1024).toFixed(1)} MB). PDFs are not stored in the app (too big for browser storage), so keep your original file and open it next to the preview.</Txt></Card>
      ) : project.referenceImage ? (
        <Image source={{ uri: `data:${project.referenceImage.mime};base64,${project.referenceImage.base64}` }} resizeMode="contain" style={{ width: '100%', height: 420, backgroundColor: '#0003' }} />
      ) : <Txt sub>This project has no reference image.</Txt>}
      <Txt sub size={12}>Side-by-side only. There is no automatic similarity score or pixel diff yet. Compare by eye, then use Chat: "make the output closer to the screenshot" with the reference image enabled.</Txt>
    </View>
  );

  const previewPane = (
    <View style={{ flex: 1, minHeight: 0, minWidth: 0, gap: 6 }}>
      <View style={row}>
        <Chip label="Desktop" active={vp === 'full'} onPress={() => setVp('full')} />
        <Chip label="Tablet" active={vp === 768} onPress={() => setVp(768)} />
        <Chip label="Mobile" active={vp === 375} onPress={() => setVp(375)} />
        <Btn small kind="ghost" label="-" onPress={() => setVp((w) => Math.max(280, (w === 'full' ? 900 : w) - 40))} />
        <Btn small kind="ghost" label="+" onPress={() => setVp((w) => Math.min(1400, (w === 'full' ? 900 : w) + 40))} />
        <Btn small kind="ghost" label={variantBusy ? 'Generating two...' : 'Generate 2 previews'} disabled={variantBusy} onPress={generateTwoPreviews} />
        <Btn small kind="ghost" label="Refresh" onPress={() => { setReload((r) => r + 1); setErrors([]); }} />
        <Btn small label="Full view" onPress={() => setFullView(true)} />
        <Btn small kind="ghost" label="Open in Chrome tab" onPress={() => { if (!openInBrowserTab(pvFiles, assets, project.name, previewEntry)) props.toast('A new tab can only be opened on the web version, and the browser must allow pop-ups.'); }} />
      </View>
      <View style={{ flex: 1, minHeight: 0, minWidth: 0, alignSelf: 'stretch', borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden' }}>
        <Preview files={pvFiles} assets={assets} entry={previewEntry} width={vp} reloadKey={reload} highlightId={highlight} onMessage={onPreviewMsg} />
      </View>
      {errors.length > 0 && (
        <Card style={{ gap: 2 }}>
          <View style={row}><Txt bold style={{ color: t.danger }}>Preview problems</Txt><Btn small kind="ghost" label="Clear" onPress={() => setErrors([])} /></View>
          {errors.map((e, i) => <Txt key={i} size={12} sub>{e.type === 'asset' ? 'Missing asset: ' : 'Runtime error: '}{e.msg}</Txt>)}
        </Card>
      )}
      {logs.length > 0 && (
        <Card style={{ gap: 2, maxHeight: 160 }}>
          <View style={row}><Txt bold>Console</Txt><Btn small kind="ghost" label="Clear" onPress={() => setMsgs((m) => m.filter((x) => x.type !== 'log'))} /></View>
          <ScrollView style={{ maxHeight: 110 }}>
            {logs.slice(-60).map((l, i) => <Txt key={i} size={12} style={{ fontFamily: 'monospace', color: l.level === 'error' ? t.danger : l.level === 'warn' ? '#f5a524' : t.text }}>{l.level === 'error' ? '✖ ' : l.level === 'warn' ? '▲ ' : '› '}{l.msg}</Txt>)}
          </ScrollView>
        </Card>
      )}
    </View>
  );


  const qualityIssues = useMemo(() => auditProject(project.files, assets.map((a) => a.path)), [project.files, assets]);
  const qualitySummary = useMemo(() => summarizeIssues(qualityIssues), [qualityIssues]);
  const runFix = (only?: Parameters<typeof fixAllSafe>[1]) => {
    const r = fixAllSafe(projRef.current.files, only);
    if (!r.applied.length) { props.toast('Nothing could be fixed automatically.'); return; }
    changeFilesFromImages(r.files, 'Quality: ' + (only ? only.join(', ') : 'fix all safe issues'));
    props.toast('Fixed: ' + r.applied.join('; ') + '. Undo or Versions can restore the previous code.');
  };
  const designTokens = useMemo(() => extractDesignTokens(project.files), [project.files]);
  const qualityPanel = (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 8 }}>
        <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}>
          <Txt bold size={17}>Website quality checker</Txt>
          <Txt sub size={12}>{qualitySummary.errors} errors · {qualitySummary.warnings} warnings · {qualitySummary.tips} tips</Txt>
        </View>
        <Txt sub size={12}>Checks HTML structure, CSS (duplicates, unused classes, overflow), JavaScript references, missing images and files, broken links, accessibility, SEO and performance. It reads your code; it does not run it, so also test in Preview.</Txt>
        <View style={row}>
          <Btn label={`Fix all safe issues (${qualitySummary.fixable})`} disabled={!qualitySummary.fixable} onPress={() => runFix()} />
        </View>
        {qualityIssues.map((issue, i) => (
          <View key={`${issue.title}-${i}`} style={{ padding: 10, borderRadius: 10, borderWidth: 1, borderColor: issue.severity === 'error' ? t.danger : t.border, gap: 3 }}>
            <Txt bold style={{ color: issue.severity === 'error' ? t.danger : issue.severity === 'warning' ? '#d97706' : t.text }}>{issue.severity.toUpperCase()} · {issue.title}</Txt>
            <Txt size={12}>{issue.detail}</Txt>
            {!!issue.suggestion && <Txt size={12} sub>Suggestion: {issue.suggestion}</Txt>}
            <View style={[row, { flexWrap: 'wrap' }]}>
              {!!issue.file && <Txt sub size={11} onPress={() => { setCurrent(issue.file!); setTab('code'); }}>{issue.file}{issue.line ? `:${issue.line}` : ''} (open)</Txt>}
              {!!issue.area && <Txt sub size={11}>· {issue.area}</Txt>}
              {!!issue.fix && <Btn small kind="ghost" label="Fix this" onPress={() => runFix([issue.fix!])} />}
            </View>
          </View>
        ))}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={17}>Design tokens</Txt>
        <Txt sub size={12}>Extracts recurring colours, font families, spacing values and border radii from your current HTML/CSS source. Screenshot-based inference is not included in this local scan.</Txt>
        {!designTokens.length ? <Txt sub>No common design tokens found yet. Add CSS to your project first.</Txt> : designTokens.map((token) => (
          <View key={token.name} style={[row, { justifyContent: 'space-between', paddingVertical: 3 }]}>
            <View style={[row, { flex: 1 }]}>
              {token.kind === 'color' && <View style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: token.value, borderWidth: 1, borderColor: t.border }} />}
              <Txt size={12}>{token.name}</Txt>
            </View>
            <Txt size={12} style={{ maxWidth: '55%' }}>{token.value} · {token.count}×</Txt>
          </View>
        ))}
        <View style={row}>
          <Btn label="Copy token CSS" disabled={!designTokens.length} onPress={async () => { await Clipboard.setStringAsync(tokensToCss(designTokens)); props.toast('Design token CSS copied.'); }} />
          <Btn kind="ghost" label="Apply to project" disabled={!designTokens.length} onPress={() => {
            const css = `/* PIXEL2CODE DESIGN TOKENS START */\n${tokensToCss(designTokens)}/* PIXEL2CODE DESIGN TOKENS END */`;
            const files = [...projRef.current.files];
            const target = files.findIndex((f) => /\.css$/i.test(f.path));
            const idx = target >= 0 ? target : files.findIndex((f) => /(^|\/)index\.html$/i.test(f.path));
            if (idx < 0) { props.toast('Add a CSS or index.html file first.'); return; }
            const f = files[idx];
            const content = /\.css$/i.test(f.path)
              ? (f.content.includes('/* PIXEL2CODE DESIGN TOKENS START */') ? f.content.replace(/\/\* PIXEL2CODE DESIGN TOKENS START \*\/[\s\S]*?\/\* PIXEL2CODE DESIGN TOKENS END \*\//, css) : `${f.content.trimEnd()}\n\n${css}\n`)
              : (f.content.includes('<!-- PIXEL2CODE DESIGN TOKENS START -->') ? f.content.replace(/<!-- PIXEL2CODE DESIGN TOKENS START -->[\s\S]*?<!-- PIXEL2CODE DESIGN TOKENS END -->/, `<!-- PIXEL2CODE DESIGN TOKENS START -->\n<style>\n${tokensToCss(designTokens)}</style>\n<!-- PIXEL2CODE DESIGN TOKENS END -->`) : f.content.replace(/<\/head>/i, `<!-- PIXEL2CODE DESIGN TOKENS START -->\n<style>\n${tokensToCss(designTokens)}</style>\n<!-- PIXEL2CODE DESIGN TOKENS END -->\n</head>`));
            files[idx] = { ...f, content };
            changeFilesFromImages(files, 'design tokens');
            props.toast('Design tokens applied. Review the preview.');
          }} />
        </View>
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={17}>SEO starter pack</Txt>
        <Input value={seoTitle} onChangeText={setSeoTitle} placeholder="Page title (e.g. Acme — Modern Web Design)" />
        <Input multiline value={seoDescription} onChangeText={setSeoDescription} placeholder="Meta description (about 150–160 characters)" style={{ minHeight: 70 }} />
        <Btn label="Add SEO tags to index.html" onPress={() => {
          let idx = projRef.current.files.findIndex((f) => /(^|\/)index\.html$/i.test(f.path));
          if (idx < 0) idx = projRef.current.files.findIndex((f) => /\.html?$/i.test(f.path));
          if (idx < 0) { props.toast('No HTML file found.'); return; }
          const files = [...projRef.current.files];
          const f = files[idx];
          const tags = makeSeoTags(seoTitle || projRef.current.name, seoDescription || `Discover ${projRef.current.name}. Explore our services, features and latest updates.`);
          let html = f.content;
          const titleTag = tags.match(/<title>[\s\S]*?<\/title>/)?.[0] || '';
          const descTag = tags.match(/<meta name="description"[^>]+>/)?.[0] || '';
          html = /<title[\s>][\s\S]*?<\/title>/i.test(html) ? html.replace(/<title[\s>][\s\S]*?<\/title>/i, titleTag) : html.replace(/<\/head>/i, `${titleTag}\n</head>`);
          html = /<meta[^>]+name=["']description["'][^>]*>/i.test(html) ? html.replace(/<meta[^>]+name=["']description["'][^>]*>/i, descTag) : html.replace(/<\/head>/i, `${descTag}\n</head>`);
          if (!/<meta[^>]+property=["']og:title["']/i.test(html)) html = html.replace(/<\/head>/i, `${tags.split('\n').filter((x) => x.includes('property="og:')).join('\n')}\n</head>`);
          if (!/<meta[^>]+name=["']viewport["']/i.test(html)) html = html.replace(/<\/head>/i, `<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>`);
          files[idx] = { ...f, content: html };
          changeFilesFromImages(files, 'SEO tags');
          props.toast('SEO tags added. Review the HTML before publishing.');
        }} />
        <Txt sub size={11}>This adds basic title, description, viewport and Open Graph tags. A sitemap requires a deployment URL and route list, so it is not generated automatically here.</Txt>
      </Card>
    </View>
  );

  const pickScreenshot = (which: 'original' | 'rendered') => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') { props.toast('Screenshot tools currently require the web editor.'); return; }
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { const value = String(reader.result || ''); if (which === 'original') setOriginalShot(value); else setRenderedShot(value); setShotScore(null); setShotDiff(null); };
      reader.readAsDataURL(file);
    };
    input.click();
  };
  const compareScreenshots = () => {
    if (!originalShot || !renderedShot || typeof document === 'undefined') return;
    const load = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => { const img = new window.Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = src; });
    Promise.all([load(originalShot), load(renderedShot)]).then(([a, b]) => {
      const w = Math.min(320, a.naturalWidth, b.naturalWidth), h = Math.min(320, a.naturalHeight, b.naturalHeight);
      const c1 = document.createElement('canvas'), c2 = document.createElement('canvas'), cd = document.createElement('canvas');
      [c1, c2, cd].forEach((c) => { c.width = w; c.height = h; });
      const x1 = c1.getContext('2d'), x2 = c2.getContext('2d'), xd = cd.getContext('2d'); if (!x1 || !x2 || !xd) return;
      x1.drawImage(a, 0, 0, w, h); x2.drawImage(b, 0, 0, w, h);
      const d1 = x1.getImageData(0, 0, w, h).data, d2 = x2.getImageData(0, 0, w, h).data, out = xd.createImageData(w, h);
      let total = 0;
      for (let i = 0; i < d1.length; i += 4) {
        const delta = (Math.abs(d1[i]-d2[i]) + Math.abs(d1[i+1]-d2[i+1]) + Math.abs(d1[i+2]-d2[i+2])) / 3;
        total += delta; out.data[i] = Math.min(255, delta * 2); out.data[i+1] = 0; out.data[i+2] = 0; out.data[i+3] = 190;
      }
      xd.putImageData(out, 0, 0); setShotScore(Math.max(0, Math.round((1 - total / (w*h*255)) * 100))); setShotDiff(cd.toDataURL('image/png'));
    }).catch(() => props.toast('Could not read one of the screenshots. Try PNG or JPEG.'));
  };
  const cropRegion = () => {
    if (!originalShot || typeof document === 'undefined') { props.toast('Upload the original screenshot first.'); return; }
    const img = new window.Image(); img.onload = () => {
      const x = document.createElement('canvas');
      const left = Math.max(0, Math.min(img.naturalWidth - 1, region.x)); const top = Math.max(0, Math.min(img.naturalHeight - 1, region.y));
      const width = Math.max(1, Math.min(region.width, img.naturalWidth - left)); const height = Math.max(1, Math.min(region.height, img.naturalHeight - top));
      x.width = width; x.height = height; const ctx = x.getContext('2d'); if (!ctx) return;
      ctx.drawImage(img, left, top, width, height, 0, 0, width, height); setRegionImage(x.toDataURL('image/png'));
    }; img.src = originalShot;
  };
  const applyCommand = async () => {
    const text = commandText.trim(); if (!text) return;
    const direct = commandToCss(text);
    if (direct) {
      const files = [...projRef.current.files]; let idx = files.findIndex((f) => /\.css$/i.test(f.path));
      if (idx >= 0) files[idx] = { ...files[idx], content: `${files[idx].content.trimEnd()}\n\n/* Pixel2Code command palette */\n${direct.css}\n` };
      else { files.push({ path: 'pixel2code-generated.css', content: `/* Pixel2Code command palette */\n${direct.css}\n` }); }
      changeFilesFromImages(files, `command: ${text.slice(0, 35)}`); props.toast(direct.message); setCommandOpen(false); setCommandText(''); return;
    }
    setCommandBusy(true);
    try { setChatText(text); setTab('chat'); setCommandOpen(false); props.toast('Command moved to AI Chat. Review it and press Apply change.'); }
    finally { setCommandBusy(false); }
  };
  const proToolsPanel = (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Screenshot similarity engine</Txt>
        <Txt sub size={12}>Upload the reference and a screenshot of the rendered preview. The local pixel score is an approximate visual metric, not an AI judgement.</Txt>
        <View style={row}><Btn label={originalShot ? 'Replace reference screenshot' : 'Upload reference'} onPress={() => pickScreenshot('original')} /><Btn label={renderedShot ? 'Replace rendered screenshot' : 'Upload rendered result'} onPress={() => pickScreenshot('rendered')} /></View>
        <View style={row}><Btn label="Compare pixels" disabled={!originalShot || !renderedShot} onPress={compareScreenshots} /><Txt bold>{shotScore === null ? 'No score yet' : `${shotScore}% pixel similarity`}</Txt></View>
        {shotDiff && <View style={{ gap: 5 }}><Txt sub size={12}>Difference heatmap (red indicates pixel differences)</Txt><Image source={{ uri: shotDiff }} resizeMode="contain" style={{ width: '100%', height: 220, backgroundColor: '#111' }} /></View>}
        {shotScore !== null && <Btn kind="ghost" label="Ask AI to refine toward 95%" onPress={() => { if (originalShot) { const parts = originalShot.split(','); const mime = parts[0].match(/data:([^;]+)/)?.[1] || 'image/png'; patch({ referenceImage: { base64: parts[1] || '', mime } }); setChatImg(true); } else setChatImg(!!project.referenceImage); setChatText(`Compare the page with the reference screenshot and refine layout, spacing, colours, typography, and image sizing to improve visual similarity. Target at least 95% similarity. Current local pixel score: ${shotScore}%.`); setTab('chat'); props.toast('Refinement request prepared in AI Chat with the reference screenshot. Review it and press Apply change.'); }} />}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Region selection / crop</Txt>
        <Txt sub size={12}>Upload the screenshot above, then enter pixel coordinates for the navbar, hero, card, or any region. The crop can be copied or saved as a reference image.</Txt>
        <View style={row}><View style={{ flex: 1 }}><Input value={String(region.x)} onChangeText={(v) => setRegion((r) => ({ ...r, x: Number(v) || 0 }))} placeholder="X" /></View><View style={{ flex: 1 }}><Input value={String(region.y)} onChangeText={(v) => setRegion((r) => ({ ...r, y: Number(v) || 0 }))} placeholder="Y" /></View></View>
        <View style={row}><View style={{ flex: 1 }}><Input value={String(region.width)} onChangeText={(v) => setRegion((r) => ({ ...r, width: Math.max(1, Number(v) || 1) }))} placeholder="Width" /></View><View style={{ flex: 1 }}><Input value={String(region.height)} onChangeText={(v) => setRegion((r) => ({ ...r, height: Math.max(1, Number(v) || 1) }))} placeholder="Height" /></View></View>
        <Btn label="Crop selected region" onPress={cropRegion} disabled={!originalShot} />
        {regionImage && <><Image source={{ uri: regionImage }} resizeMode="contain" style={{ width: '100%', height: 180, backgroundColor: '#eee' }} /><View style={row}><Btn label="Use as project reference" onPress={() => { const base64 = regionImage.split(',')[1]; patch({ referenceImage: { base64, mime: 'image/png' } }); props.toast('Cropped region set as the project reference image.'); }} /><Btn kind="ghost" label="Copy image data" onPress={async () => { await Clipboard.setStringAsync(regionImage); props.toast('Data URL copied.'); }} /></View></>}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Contact & appointment pages</Txt>
        <Txt sub size={12}>Analyze this project's existing design and generate two separate pages with matching branding, responsive layouts, editable business details, contact form, map embed and appointment form.</Txt>
        <View style={row}>
          <Btn small label={contactBusy === 'contact' ? 'Generating...' : 'Contact Us page'} disabled={contactBusy !== null} onPress={() => generateContactPages('contact')} />
          <Btn small label={contactBusy === 'appointment' ? 'Generating...' : 'Book Appointment page'} disabled={contactBusy !== null} onPress={() => generateContactPages('appointment')} />
          <Btn small kind="ghost" label={contactBusy === 'both' ? 'Generating...' : 'Generate both'} disabled={contactBusy !== null} onPress={() => generateContactPages('both')} />
        </View>
        <Txt sub size={11}>Missing phone, address or email details are left as editable placeholders. Real appointment submission requires a booking integration.</Txt>
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Framework conversion</Txt><Txt sub size={12}>Generate starter files from your current HTML/CSS. Review JSX and framework-specific details before using in production.</Txt>
        <View style={row}>{(['html','react','next','vue','tailwind'] as FrameworkTarget[]).map((x) => <Chip key={x} label={x === 'html' ? 'HTML/CSS' : x === 'next' ? 'Next.js' : x[0].toUpperCase()+x.slice(1)} active={proTarget === x} onPress={() => setProTarget(x)} />)}</View>
        <Btn label={`Generate ${proTarget === 'html' ? 'HTML/CSS' : proTarget} files`} onPress={() => {
          const converted = convertFramework(project.files, proTarget);
          const files = [...projRef.current.files];
          for (const f of converted) { const idx = files.findIndex((x) => x.path === f.path); if (idx >= 0) files[idx] = f; else files.push(f); }
          changeFilesFromImages(files, `convert to ${proTarget}`); setCurrent(converted[0]?.path ?? current); setTab('code'); props.toast(`Generated ${converted.length} ${proTarget} starter file(s). Review before exporting.`);
        }} />
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Component intelligence</Txt><Txt sub size={12}>Find repeated class-based HTML elements that may be reusable components.</Txt>
        {repeatedMarkupReport(project.files).length ? repeatedMarkupReport(project.files).map((x) => <View key={x.pattern} style={[row, { justifyContent: 'space-between' }]}><Txt size={12}>{x.pattern}</Txt><Txt bold size={12}>{x.count}×</Txt></View>) : <Txt sub>No repeated class-based HTML elements found yet. This scan currently targets HTML files.</Txt>}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold size={18}>Responsive auto-pass</Txt><Txt sub size={12}>Static checks for common responsive problems. The Preview tab has live device-width presets for manual testing.</Txt>
        {responsiveAudit(project.files).length ? responsiveAudit(project.files).map((issue, i) => <Txt key={i} size={12}>• {issue}</Txt>) : <Txt>Basic responsive checks passed.</Txt>}
        <View style={row}><Btn label="Test mobile preview" onPress={() => { setVp(375); setTab('preview'); }} /><Btn label="Test tablet preview" onPress={() => { setVp(768); setTab('preview'); }} /></View>
      </Card>
      <Card style={{ gap: 8 }}><Txt bold size={18}>Command palette</Txt><Txt sub size={12}>Press Ctrl+K (or click below) to ask for a code change. Common colour, radius, shadow, responsive and hover commands apply local CSS; other requests are forwarded to AI Chat.</Txt><Btn label="Open command palette · Ctrl+K" onPress={() => setCommandOpen(true)} /></Card>
    </View>
  );

  const imagesPanel = <ImagesPanel files={project.files} assets={assets} onAssets={changeAssets} onFiles={changeFilesFromImages} toast={props.toast} />;

  const tabs: [Tab, string][] = [['code', 'Code'], ['images', 'Images'], ['design', 'Design'], ['quality', 'Quality'], ['protools', 'Pro Tools'], ['chat', 'Chat'], ['rules', 'Rules'], ['versions', 'Versions'], ['compare', 'Compare']];
  if (!wide) tabs.splice(1, 0, ['preview', 'Preview']);

  const body = tab === 'code' ? codePanel : tab === 'images' ? imagesPanel : tab === 'design' ? designPanel : tab === 'chat' ? chatPanel
    : tab === 'quality' ? qualityPanel : tab === 'protools' ? proToolsPanel : tab === 'rules' ? rulesPanel : tab === 'versions' ? versionsPanel : tab === 'compare' ? comparePanel : previewPane;

  const statusColor = saveState === 'saved' ? t.ok : saveState === 'error' ? t.danger : t.sub;

  // ===== Full-screen preview (like Chrome DevTools device mode) =====
  const DEVICES: [string, number | 'full'][] = [['Responsive', 'full'], ['Phone 375', 375], ['Phone 430', 430], ['Tablet 768', 768], ['Laptop 1280', 1280], ['Desktop 1440', 1440]];
  // onLayout can report 0 on first paint; fall back to the window size so the preview always renders.
  const bw = box.width || winW;
  const bh = box.height || Math.max(winH - 56, 300);
  const devW = vp === 'full' ? Math.max(bw, 1) : vp;
  const scale = fit && bw > 0 ? Math.min(1, bw / devW) : 1;
  const frameH = Math.max(bh, 1) / scale;
  const applyVisualStyle = () => {
    if (!inspected) return;
    const declarations = [
      editColor.trim() ? `color: ${editColor.trim()}` : '',
      editBg.trim() ? `background-color: ${editBg.trim()}` : '',
      editFontSize.trim() ? `font-size: ${editFontSize.trim()}` : '',
      editPadding.trim() ? `padding: ${editPadding.trim()}` : '',
      editRadius.trim() ? `border-radius: ${editRadius.trim()}` : '',
    ].filter(Boolean);
    if (!declarations.length) { props.toast('Enter at least one CSS value.'); return; }
    const files = [...projRef.current.files];
    let idx = files.findIndex((f) => /\.css$/i.test(f.path));
    const rule = `\n/* Pixel2Code visual edit */\n${inspected.selector}{${declarations.join('; ')}}\n`;
    if (idx >= 0) files[idx] = { ...files[idx], content: `${files[idx].content.trimEnd()}${rule}` };
    else {
      const htmlIdx = files.findIndex((f) => /\.html?$/i.test(f.path));
      if (htmlIdx < 0) { props.toast('Add an HTML or CSS file before applying visual styles.'); return; }
      const html = files[htmlIdx].content;
      const styleTag = `<style id=\"p2c-visual-edits\">${rule.replace(/<\/style/gi, '<\\/style')}</style>`;
      files[htmlIdx] = { ...files[htmlIdx], content: /<\/head>/i.test(html) ? html.replace(/<\/head>/i, styleTag + '\n</head>') : styleTag + html };
    }
    changeFilesFromImages(files, 'visual CSS edit'); props.toast('CSS changes saved to your project.');
  };

  const applyVisualText = () => {
    if (!inspected) return;
    const before = inspected.text;
    if (!before || before === editText) { props.toast('Select an element with text and make a change first.'); return; }
    const files = [...projRef.current.files];
    const idx = files.findIndex((f) => /\.html?$/i.test(f.path));
    if (idx < 0) { props.toast('No HTML file was found.'); return; }
    const html = files[idx].content;
    const escaped = before.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = html.replace(new RegExp(escaped), editText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    if (next === html) { props.toast('Could not safely locate this text in the source HTML.'); return; }
    files[idx] = { ...files[idx], content: next };
    changeFilesFromImages(files, 'visual text edit'); props.toast('HTML text updated.');
  };

  const fullJsx = (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.bg, overflow: 'hidden' } as any}>
      <View style={[row, { padding: 8, borderBottomWidth: 1, borderColor: t.border }]}>
        <Btn small kind="danger" label="Exit full view" onPress={() => setFullView(false)} />
        {DEVICES.map(([label, w]) => <Chip key={label} label={label} active={vp === w || (w === 'full' && vp === 'full')} onPress={() => setVp(w)} />)}
        <Btn small kind="ghost" label="-" onPress={() => setVp((w) => Math.max(280, (w === 'full' ? Math.round(bw) : w) - 20))} />
        <Btn small kind="ghost" label="+" onPress={() => setVp((w) => Math.min(2000, (w === 'full' ? Math.round(bw) : w) + 20))} />
        <Txt sub size={12}>{vp === 'full' ? Math.round(bw) : vp}px · {Math.round(scale * 100)}%</Txt>
        <Chip label={fit ? 'Fit to screen' : '100% (scroll)'} active={fit} onPress={() => setFit(!fit)} />
        <Btn small kind="ghost" label={variantBusy ? 'Generating two...' : 'Generate 2 previews'} disabled={variantBusy} onPress={generateTwoPreviews} />
        <Btn small kind="ghost" label={contactBusy === 'contact' ? 'Generating...' : 'Contact Us page'} disabled={contactBusy !== null} onPress={() => generateContactPages('contact')} />
        <Btn small kind="ghost" label={contactBusy === 'appointment' ? 'Generating...' : 'Book Appointment page'} disabled={contactBusy !== null} onPress={() => generateContactPages('appointment')} />
        <Btn small kind="ghost" label={contactBusy === 'both' ? 'Generating...' : 'Generate both pages'} disabled={contactBusy !== null} onPress={() => generateContactPages('both')} />
        <Btn small kind={inspectMode ? 'primary' : 'ghost'} label={inspectMode ? 'Stop selecting' : 'Click to edit'} onPress={() => { setInspectMode((v) => !v); if (!inspectMode) setInspected(null); }} />
        <Btn small kind="ghost" label="Refresh" onPress={() => { setReload((r) => r + 1); setErrors([]); }} />
        {errors.length > 0 && <Txt size={12} style={{ color: t.danger }}>{errors.length} problem(s): {errors[errors.length - 1].msg.slice(0, 80)}</Txt>}
      </View>
      {showVariants && variantFiles ? <View style={{ flex: 1, flexDirection: 'row', gap: 8, padding: 8, backgroundColor: '#2a2d3a' } as any}>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}><View style={{ padding: 8, backgroundColor: t.card }}><Txt bold>Preview 1 · Editorial</Txt><Btn small label="Choose Preview 1" onPress={() => chooseVariant('a')} /></View><Preview files={variantFiles.a} assets={assets} width="full" reloadKey={reload + 1} onMessage={onPreviewMsg} /></View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}><View style={{ padding: 8, backgroundColor: t.card }}><Txt bold>Preview 2 · Bold modern</Txt><Btn small label="Choose Preview 2" onPress={() => chooseVariant('b')} /></View><Preview files={variantFiles.b} assets={assets} width="full" reloadKey={reload + 2} onMessage={onPreviewMsg} /></View>
        <Btn small kind="danger" label="Close comparison" onPress={() => setShowVariants(false)} />
      </View> : <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 } as any}>
        <View style={{ flex: 1, backgroundColor: '#2a2d3a', overflow: 'scroll' } as any}
          onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
          <View style={{ width: Math.max(bw, devW * scale), height: bh }}>
            <View style={{ position: 'absolute', top: 0, left: Math.max(0, (Math.max(bw, devW * scale) - devW * scale) / 2), width: devW, height: frameH, backgroundColor: '#fff', transform: [{ scale }], transformOrigin: 'top left' } as any}>
              <Preview files={pvFiles} assets={assets} entry={previewEntry} width={devW} reloadKey={reload} highlightId={highlight} onMessage={onPreviewMsg} inspectMode={inspectMode} onInspect={handleInspect} />
            </View>
          </View>
        </View>
        {inspectMode && <View style={{ width: 350, maxWidth: '42%', borderLeftWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 12, gap: 8 } as any}>
          <Txt bold size={17}>Visual inspector</Txt>
          <Txt sub size={12}>Click an element in the preview. Its source and editable properties appear here.</Txt>
          {inspected ? <>
            <Txt bold>{`<${inspected.tag}>`}</Txt><Txt sub size={11}>{inspected.selector}</Txt>
            <View style={[row, { backgroundColor: '#0d1325', padding: 5, borderRadius: 10 }]}>{(['html','css','js'] as const).map((x) => <Chip key={x} label={x.toUpperCase()} active={inspectTab===x} onPress={() => loadSourceTab(x)} />)}</View>
            <View style={{ backgroundColor: '#0b1020', borderWidth: 1, borderColor: '#283653', borderRadius: 10, padding: 8, gap: 6 }}>
              <Txt size={11} style={{ color: '#9db6e9' }}>{sourcePath || `No ${inspectTab.toUpperCase()} file found`}</Txt>
              <View style={{ height: 280, overflow: 'hidden', borderRadius: 7, borderWidth: 1, borderColor: '#263654' }}>
                <CodeEditor path={sourcePath || `${inspectTab}.txt`} value={sourceDraft} language={inspectTab === 'js' ? 'javascript' : inspectTab} settings={editorSettings} onChange={setSourceDraft} readOnly={!sourcePath} chrome="vscode" />
              </View>
              <Btn small label={`Save ${inspectTab.toUpperCase()} code to project`} disabled={!sourcePath} onPress={applySourceDraft} />
            </View>
            <Txt bold size={13}>Text content</Txt><Input value={editText} onChangeText={setEditText} multiline style={{ minHeight: 65 }} />
            <Btn small label="Apply text to HTML" onPress={applyVisualText} />
            <Txt bold size={13}>CSS properties</Txt>
            <Input value={editColor} onChangeText={setEditColor} placeholder="Text colour e.g. #222222" />
            <Input value={editBg} onChangeText={setEditBg} placeholder="Background e.g. #ffffff" />
            <Input value={editFontSize} onChangeText={setEditFontSize} placeholder="Font size e.g. 18px" />
            <Input value={editPadding} onChangeText={setEditPadding} placeholder="Padding e.g. 16px 24px" />
            <Input value={editRadius} onChangeText={setEditRadius} placeholder="Radius e.g. 12px" />
            <Btn label="Apply CSS to project" onPress={applyVisualStyle} />
          </> : <Card><Txt sub>No element selected yet. Turn on click-to-edit and click text, cards, images, buttons or sections.</Txt></Card>}
        </View>}
      </View>}
    </View>
  );
  if (fullView) return fullJsx;

  return (
    <View style={{ flex: 1 }}>
      {commandOpen && <View style={{ position: 'absolute', zIndex: 1000, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0009', justifyContent: 'flex-start', paddingTop: 70, paddingHorizontal: 18 } as any}>
        <Card style={{ gap: 10, maxWidth: 720, width: '100%', alignSelf: 'center' } as any}>
          <View style={[row, { justifyContent: 'space-between' }]}><Txt bold size={18}>Pixel2Code command palette</Txt><Btn small kind="ghost" label="Close · Esc" onPress={() => setCommandOpen(false)} /></View>
          <Input autoFocus value={commandText} onChangeText={setCommandText} onSubmitEditing={applyCommand} placeholder={'e.g. make it responsive, add hover animation, heading color #2563eb'} />
          <View style={row}><Btn label={commandBusy ? 'Working...' : 'Run command'} disabled={!commandText.trim() || commandBusy} onPress={applyCommand} /><Btn kind="ghost" label="Ask AI instead" onPress={() => { setChatText(commandText); setTab('chat'); setCommandOpen(false); }} /></View>
          <Txt sub size={12}>Tip: try “set heading color to #2563eb”, “add 16px radius”, “add shadow”, or “make responsive”.</Txt>
        </Card>
      </View>}

      <View style={[row, { padding: 10, borderBottomWidth: 1, borderColor: t.border }]}>
        <Btn small kind="ghost" label="< Library" onPress={flushAndClose} />
        <Txt bold style={{ flexShrink: 1 }}>{project.name}</Txt>
        <Txt size={12} style={{ color: statusColor }}>
          {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Save failed' : 'Unsaved'}
        </Txt>
        <Txt size={11} sub>{project.sync ? 'Synced to server' : 'Local only'}</Txt>
        <View style={{ flex: 1 }} />
        <Btn small kind="ghost" label="Undo" onPress={undo} />
        <Btn small kind="ghost" label="Redo" onPress={redo} />
        <Btn small kind="ghost" label={contactBusy === 'contact' ? 'Generating contact…' : 'Contact Us'} disabled={contactBusy !== null} onPress={() => generateContactPages('contact')} />
        <Btn small kind="ghost" label={contactBusy === 'appointment' ? 'Generating appointment…' : 'Book Appointment'} disabled={contactBusy !== null} onPress={() => generateContactPages('appointment')} />
        <Btn small kind="ghost" label={contactBusy === 'both' ? 'Generating both…' : 'Generate both pages'} disabled={contactBusy !== null} onPress={() => generateContactPages('both')} />
        <Btn small kind="ghost" label={exportMenu ? 'More ▴' : 'More export ▾'} onPress={() => setExportMenu((v) => !v)} />
        <Btn small label={exporting ? 'Exporting...' : 'Export ZIP'} disabled={exporting} onPress={async () => {
          setExporting(true);
          try {
            await props.onSave({ ...projRef.current, updatedAt: Date.now() }); // make sure pending edits are stored first
            props.toast(await exportZip(projRef.current, assets));
            patch({ exportedAt: Date.now() });
          } catch (e: any) { props.toast('Export failed: ' + (e.message || e)); }
          finally { setExporting(false); }
        }} />
      </View>
      {exportMenu && (
        <View style={{ position: 'absolute', zIndex: 900, top: 52, right: 10, width: 300 } as any}>
          <Card style={{ gap: 8 }}>
            <Txt bold>Export as…</Txt>
            <Txt sub size={12}>HTML/CSS/JS (Bootstrap or Tailwind as chosen for this project) is the main “Export ZIP” button. These convert it:</Txt>
            {(['react', 'react-ts', 'assets'] as ExportKind[]).map((k) => (
              <Btn key={k} kind="ghost" disabled={exporting} label={k === 'react' ? 'React project (JavaScript) ZIP' : k === 'react-ts' ? 'React project (TypeScript) ZIP' : 'Images only ZIP'} onPress={async () => {
                setExporting(true); setExportMenu(false);
                try {
                  await props.onSave({ ...projRef.current, updatedAt: Date.now() });
                  const r = await exportProjectZip(projRef.current, assets, k);
                  props.toast(r.message + (r.notes.length ? ` (${r.notes.length} conversion note${r.notes.length > 1 ? 's' : ''} are in the README)` : ''));
                } catch (e: any) { props.toast('Export failed: ' + (e.message || e)); }
                finally { setExporting(false); }
              }} />
            ))}
          </Card>
        </View>
      )}
      <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column' }}>
        <View style={{ minHeight: 0, minWidth: 0, ...(wide && leftW ? { width: leftW, flexShrink: 0 } : { flex: 1 }) }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: t.border }} contentContainerStyle={{ padding: 8 }}>
            {tabs.map(([k, l]) => <Chip key={k} label={l} active={tab === k} onPress={() => setTab(k)} />)}
          </ScrollView>
          {tab === 'code' ? (
            <View style={{ flex: 1, minHeight: 0, minWidth: 0, padding: 8 }}>{body}</View>
          ) : (
            <ScrollView style={{ flex: 1, minHeight: 0 }} contentContainerStyle={{ padding: 12, flexGrow: 1 }} keyboardShouldPersistTaps="handled">{body}</ScrollView>
          )}
        </View>
        {wide && <Splitter onDelta={(d) => setLeftW((w) => Math.min(winW - 300, Math.max(380, (w ?? Math.round(winW / 2)) + d)))} />}
        {wide && <View style={{ flex: 1, padding: 10, borderLeftWidth: 1, borderColor: t.border }}>{previewPane}</View>}
      </View>
    </View>
  );
}

// Web-only: loads the chosen Google font so the sample text really renders in it.
function FontSample({ choice }: { choice: FontChoice }) {
  useEffect(() => {
    const url = googleFontsUrl([choice]);
    if (!url) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = url;
    document.head.appendChild(l);
    return () => { l.remove(); };
  }, [choice.family, choice.weights.join(',')]);
  const t = useTheme();
  return <Txt style={{ fontFamily: `'${choice.family}', sans-serif`, color: t.text, fontSize: 18 }}>The quick brown fox jumps over the lazy dog 0123</Txt>;
}