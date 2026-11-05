// The code workspace: file explorer, tabs, code editor(s), and the tool panels (Assistant, Attach Code, Convert, Search, Problems, Settings).
// It edits the same project the rest of the Editor screen uses, so Design / Images / Versions / Preview keep working.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Btn, Chip, Txt, row, useTheme } from '../ui';
import CodeEditor from '../CodeEditor';
import { SelectionInfo } from '../codeEditorTypes';
import Splitter from '../Splitter';
import { DropArea } from '../dnd';
import Explorer from './Explorer';
import AssistantPanel from './AssistantPanel';
import AttachPanel from './AttachPanel';
import ConvertPanel from './ConvertPanel';
import SearchPanel from './SearchPanel';
import SettingsPanel from './SettingsPanel';
import { WBCtx } from './types';
import { Project, ProjectFile } from '../../types';
import { Settings } from '../../storage';
import { EditorSettings } from '../../lib/editorSettings';
import { Candidate, Resolution } from '../../lib/attach';
import { ingest } from '../../lib/ingest';
import { readDropped } from '../../lib/pickCode';
import { createFile, deletePath, duplicatePath, renamePath } from '../../lib/fileTree';
import { diagnoseAll, Diagnostic } from '../../lib/diagnostics';
import { formatCss, formatHtml } from '../../lib/format';
import { languageName, languageOf, sanitizePath } from '../../lib/langs';
import { hashFiles } from '../../lib/hash';
import { confirmAction } from '../../lib/confirm';
import { saveSingleFile } from '../../lib/exporter';
import { CodeAction } from '../../api';

type Tool = 'assistant' | 'attach' | 'convert' | 'search' | 'problems' | 'settings';
const TOOLS: [Tool, string][] = [['assistant', '✨ Assistant'], ['attach', '📎 Attach Code'], ['convert', '🖼 Image/PDF'], ['search', '🔍 Search'], ['problems', '⚠ Problems'], ['settings', '⚙ Settings']];

export interface WorkbenchProps {
  project: Project; files: ProjectFile[]; savedFiles: ProjectFile[]; server: Settings; editor: EditorSettings; setEditor: (s: EditorSettings) => void;
  current: string; setCurrent: (p: string) => void; editFile: (path: string, content: string) => void;
  applyFiles: (next: ProjectFile[], label: string) => void; patchProject: (p: Partial<Project>) => void; toast: (s: string) => void;
  undo: () => void; redo: () => void; saveNow: () => void; saveState: string;
  full: boolean; setFull: (b: boolean) => void; openPreviewTab: () => void; height: number;
}

export function formatFile(f: ProjectFile): string {
  const lang = languageOf(f.path);
  const c = f.content.replace(/\r\n/g, '\n');
  if (lang === 'json') { try { return JSON.stringify(JSON.parse(c), null, 2) + '\n'; } catch { /* fall through to light cleanup */ } }
  if (lang === 'html') return formatHtml(c);
  if (lang === 'css') return formatCss(c);
  return c.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n'); // light cleanup only: never re-indent code we cannot parse fully
}

export default function Workbench(p: WorkbenchProps) {
  const t = useTheme();
  const { width: winW } = useWindowDimensions();
  const wide = winW >= 760;
  const [tabs, setTabs] = useState<string[]>(p.current ? [p.current] : []);
  const [tool, setTool] = useState<Tool | null>(null);
  const [view, setView] = useState<'files' | 'editor' | 'tools'>('editor'); // phones: one thing at a time
  const [zen, setZen] = useState(false);
  const [explW, setExplW] = useState(200);
  const [toolH, setToolH] = useState(300);
  const showExp = true;
  const [split, setSplit] = useState<string | null>(null);
  const [goTo, setGoTo] = useState<{ line: number; col?: number; nonce: number } | null>(null);
  const [sel, setSel] = useState<SelectionInfo | null>(null);
  const [extraDirs, setExtraDirs] = useState<string[]>([]);
  const [contextPaths, setContextPaths] = useState<string[]>([]);
  const [extraContext, setExtraContext] = useState<ProjectFile[]>([]);
  const [cands, setCands] = useState<Candidate[]>([]);
  const [resolve, setResolve] = useState<Record<string, Resolution>>({});
  const [notes, setNotes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [initial, setInitial] = useState<{ action: CodeAction; text: string; run?: boolean; nonce: number } | null>(null);
  const [findRep, setFindRep] = useState(false);
  const [lastApplied, setLastApplied] = useState<ProjectFile[] | null>(null);
  const [draft, setDraft] = useState<{ at: number; files: ProjectFile[] } | null>(null);
  const [diags, setDiags] = useState<Diagnostic[]>([]);
  const focusNonce = 0;

  const files = p.files;
  const file = files.find((f) => f.path === p.current) ?? files[0];
  const splitFile = split ? files.find((f) => f.path === split) : undefined;

  // ---- tabs follow the current file; tabs of deleted files disappear ----
  useEffect(() => { if (p.current && files.some((f) => f.path === p.current) && !tabs.includes(p.current)) setTabs((x) => [...x, p.current]); }, [p.current]);
  // Keep the generated Contact / Appointment source files visible as individual editor tabs.
  useEffect(() => {
    const pagePaths = new Set(['contact.html', 'contact.css', 'contact.js', 'book-appointment.html', 'appointment.css', 'appointment.js']);
    const generated = files.filter((f) => pagePaths.has(f.path.split('/').pop() || '')).map((f) => f.path);
    if (generated.length) setTabs((currentTabs) => Array.from(new Set([...currentTabs, ...generated])));
  }, [files]);
  useEffect(() => {
    const have = new Set(files.map((f) => f.path));
    setTabs((x) => { const y = x.filter((a) => have.has(a)); return y.length === x.length ? x : y; });
    if (split && !have.has(split)) setSplit(null);
    setContextPaths((x) => { const y = x.filter((a) => have.has(a)); return y.length === x.length ? x : y; });
  }, [files]);

  const open = useCallback((path: string, line?: number) => {
    p.setCurrent(path);
    if (line) setGoTo({ line, nonce: Date.now() });
    if (!wide) setView('editor');
  }, [p.setCurrent, wide]);
  const closeTab = (path: string) => {
    const rest = tabs.filter((x) => x !== path); setTabs(rest);
    if (p.current === path) p.setCurrent(rest[rest.length - 1] ?? files.find((f) => f.path !== path)?.path ?? '');
  };

  // ---- unsaved indicators (compared with what is stored) ----
  const saved = useMemo(() => new Map(p.savedFiles.map((f) => [f.path, f.content])), [p.savedFiles]);
  const dirty = useMemo(() => new Set(files.filter((f) => saved.get(f.path) !== f.content).map((f) => f.path)), [files, saved]);

  // ---- draft backup + recovery after an accidental refresh (web) ----
  const draftKey = 'p2c:draft:' + p.project.id;
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const d = JSON.parse(raw) as { at: number; files: ProjectFile[] };
      if (d.at > p.project.updatedAt && hashFiles(d.files) !== hashFiles(p.project.files)) setDraft(d); else localStorage.removeItem(draftKey);
    } catch {}
  }, []);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = setTimeout(() => {
      try {
        if (!dirty.size) { localStorage.removeItem(draftKey); return; }
        const s = JSON.stringify({ at: Date.now(), files });
        if (s.length < 3_000_000) localStorage.setItem(draftKey, s);
      } catch {}
    }, 400);
    return () => clearTimeout(h);
  }, [files, dirty]);

  // ---- diagnostics (debounced) ----
  useEffect(() => { const h = setTimeout(() => setDiags(diagnoseAll(files)), 450); return () => clearTimeout(h); }, [files]);
  const curDiags = useMemo(() => diags.filter((d) => d.path === file?.path), [diags, file?.path]);
  const errCount = diags.filter((d) => d.severity === 'error').length;

  // ---- file operations (all go through applyFiles = snapshot + undo) ----
  const create = (raw: string) => { const r = createFile(files, raw); if (r.error) return r.error; p.applyFiles(r.files, 'Create ' + raw); open(sanitizePath(raw)!); };
  const mkdir = (raw: string) => { const d = sanitizePath(raw); if (!d) return 'That folder name is not allowed.'; if (!extraDirs.includes(d)) setExtraDirs([...extraDirs, d]); setSel(null); };
  const rename = (from: string, to: string) => {
    const r = renamePath(files, from, to); if (r.error) return r.error;
    if (!r.renamed) return;
    p.applyFiles(r.files, `Rename ${from}`);
    const map = r.renamed;
    setTabs((x) => x.map((a) => map[a] ?? a)); if (map[p.current]) p.setCurrent(map[p.current]);
    setExtraDirs((x) => x.map((d) => (d === from ? sanitizePath(to) || d : d)));
  };
  const duplicate = (path: string) => { const r = duplicatePath(files, path); if (r.error) return p.toast(r.error); p.applyFiles(r.files, 'Duplicate ' + path); open(r.renamed![path]); };
  const remove = (path: string, isDir: boolean) => confirmAction(isDir ? 'Delete folder?' : 'Delete file?', `Delete "${path}"${isDir ? ' and everything inside it' : ''}? A snapshot is saved first, so you can restore it from Versions.`, 'Delete', () => {
    p.applyFiles(deletePath(files, path), 'Delete ' + path); setExtraDirs((x) => x.filter((d) => d !== path));
  });

  // ---- attach ----
  const add = async (raws: { name: string; bytes: Uint8Array }[]) => {
    if (!raws.length) return;
    setBusy(true); setTool('attach'); if (!wide) setView('tools');
    try {
      const { cands: c, notes: n } = await ingest(raws, files, p.server);
      setCands((x) => [...x, ...c]); setNotes(n);
    } catch (e: any) { setNotes([e.message || 'Could not read the files.']); } finally { setBusy(false); }
  };

  const ctx: WBCtx = {
    project: p.project, files, server: p.server, editor: p.editor, current: p.current,
    selection: sel && sel.text.trim() ? { path: p.current, text: sel.text, startLine: sel.startLine, endLine: sel.endLine } : null,
    openFile: open, applyFiles: p.applyFiles, patchProject: p.patchProject, toast: p.toast,
    contextPaths, setContextPaths, extraContext, setExtraContext,
  };

  const askAi = (action: CodeAction, text: string, run = true) => { setInitial({ action, text, run, nonce: Date.now() }); setTool('assistant'); if (!wide) setView('tools'); };
  const goToLine = () => {
    if (Platform.OS !== 'web') return p.toast('Use the Search panel on a phone.');
    const v = window.prompt('Go to line (1 - ' + (file?.content.split('\n').length ?? 1) + ')');
    const n = v ? parseInt(v, 10) : NaN; if (n > 0) setGoTo({ line: n, nonce: Date.now() });
  };
  const format = () => { if (file) { const out = formatFile(file); if (out !== file.content) p.editFile(file.path, out); p.toast('Formatted ' + file.path); } };
  const findOpen = (replace: boolean) => { setFindRep(replace); setTool('search'); if (!wide) setView('tools'); };

  // keyboard shortcuts when focus is not in the editor (Ctrl+Shift+F search, Esc leaves full-screen)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === 'Escape' && (p.full || zen)) { setZen(false); p.setFull(false); }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'f') { e.preventDefault(); findOpen(false); }
      if (mod && e.key.toLowerCase() === 'h' && !e.shiftKey) { e.preventDefault(); findOpen(true); }
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [p.full, zen, wide]);

  const editorFor = (f: ProjectFile | undefined, main: boolean) => f ? (
    <CodeEditor key={(main ? 'm:' : 's:') + f.path} path={f.path} value={f.content} language={languageOf(f.path)} settings={p.editor}
      onChange={(v) => p.editFile(f.path, v)} onSelection={main ? setSel : undefined} goTo={main ? goTo : null} markers={diags.filter((d) => d.path === f.path)}
      onSave={p.saveNow} onFind={findOpen} onGoToLine={goToLine} onFormat={format} focusNonce={main ? focusNonce : 0} />
  ) : <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}><Txt sub>No file open. Create one in the explorer or use Attach Code.</Txt></View>;

  // ================= pieces =================
  const tabBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: t.border }} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 4 }}>
      {tabs.map((path) => {
        const active = path === p.current;
        return (
          <View key={path} style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: active ? t.primary : 'transparent', paddingHorizontal: 8, paddingVertical: 8, gap: 6 }}>
            <Txt size={12} bold={active} sub={!active} onPress={() => open(path)}>{path.split('/').pop()}{dirty.has(path) ? ' ●' : ''}</Txt>
            <Txt size={12} sub onPress={() => closeTab(path)}>✕</Txt>
          </View>
        );
      })}
    </ScrollView>
  );

  const toolbar = (
    <View style={[row, { paddingVertical: 6, paddingHorizontal: 6, gap: 6 }]}>
      <Btn small kind="ghost" label={p.saveState === 'saving' ? 'Saving…' : dirty.size ? `Save (${dirty.size})` : 'Saved ✓'} onPress={p.saveNow} />
      <Btn small kind="ghost" label="↶" onPress={p.undo} /><Btn small kind="ghost" label="↷" onPress={p.redo} />
      <Btn small kind="ghost" label="Format file" onPress={format} />
      <Btn small kind="ghost" label="Format project" onPress={() => {
        const formatted = files.map((f) => ({ ...f, content: formatFile(f) }));
        const changed = formatted.filter((f, i) => f.content !== files[i].content).length;
        if (!changed) { p.toast('All supported files are already formatted.'); return; }
        p.applyFiles(formatted, 'Format project'); p.toast(`Formatted ${changed} file(s). Undo is available.`);
      }} />
      <Btn small kind="ghost" label="Go to line" onPress={goToLine} />
      <Btn small kind="ghost" label="Copy file" onPress={async () => { if (file) { await Clipboard.setStringAsync(file.content); p.toast('Copied current file.'); } }} />
      <Btn small kind="ghost" label="Copy project" onPress={async () => {
        const bundle = files.map((f) => `/* ===== ${f.path} ===== */\n${f.content}`).join('\n\n');
        await Clipboard.setStringAsync(bundle); p.toast(`Copied ${files.length} project file(s) with paths.`);
      }} />
      <Btn small kind="ghost" label="Download" onPress={async () => { if (file) p.toast(await saveSingleFile(file)); }} />
      {wide && <Btn small kind="ghost" label={split ? 'Close split' : 'Split'} onPress={() => setSplit(split ? null : files.find((f) => f.path !== p.current)?.path ?? null)} />}
      <Btn small kind="ghost" label="▶ Preview in tab" onPress={p.openPreviewTab} />
      <Btn small kind="ghost" label={zen ? 'Exit zen' : 'Zen'} onPress={() => setZen(!zen)} />
      <Btn small kind="ghost" label={p.full ? 'Exit full screen' : 'Full screen'} onPress={() => p.setFull(!p.full)} />
      <Txt size={11} sub>{file ? `${languageName(file.path)} · ${p.editor.tabSize} spaces` : ''}{sel ? ` · Ln ${sel.line}, Col ${sel.col}${sel.text ? ` (${sel.text.length} selected)` : ''}` : ''}</Txt>
    </View>
  );

  const selBar = sel && sel.text.trim().length > 1 && !zen ? (
    <View style={[row, { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: t.primary + '22' }]}>
      <Txt size={12}>Selected lines {sel.startLine}-{sel.endLine}:</Txt>
      <Chip label="Explain" onPress={() => askAi('explain', 'Explain this selected code in beginner-friendly language.')} />
      <Chip label="Refactor" onPress={() => askAi('refactor', 'Refactor the selected code for clarity without changing behaviour.')} />
      <Chip label="Fix" onPress={() => askAi('fix', 'Find and fix problems in the selected code.')} />
      <Chip label="Ask AI…" onPress={() => askAi('refactor', '', false)} />
    </View>
  ) : null;

  const draftBar = draft ? (
    <View style={[row, { padding: 8, backgroundColor: '#f5a52433' }]}>
      <Txt size={12} style={{ flex: 1 }}>Unsaved changes from {new Date(draft.at).toLocaleTimeString()} were found (the page was closed or refreshed before saving).</Txt>
      <Btn small label="Restore them" onPress={() => { p.applyFiles(draft.files, 'Recovered draft'); setDraft(null); try { localStorage.removeItem(draftKey); } catch {} }} />
      <Btn small kind="ghost" label="Discard" onPress={() => { setDraft(null); try { localStorage.removeItem(draftKey); } catch {} }} />
    </View>
  ) : null;

  const problems = (
    <View style={{ gap: 4 }}>
      <Txt size={12} sub>Quick checks for syntax and common problems (brackets, HTML tags, JSON, a few security hints). It is not a full compiler: use Assistant → Review or Fix for deeper analysis.</Txt>
      {!diags.length && <Txt size={13} style={{ color: t.ok }}>No problems found.</Txt>}
      {diags.slice(0, 200).map((d, i) => (
        <Txt key={i} size={12} onPress={() => open(d.path, d.line)} style={{ color: d.severity === 'error' ? t.danger : d.severity === 'warning' ? '#f5a524' : t.text }}>
          {d.severity === 'error' ? '✖' : d.severity === 'warning' ? '▲' : 'ℹ'} {d.path}:{d.line} — {d.message}
        </Txt>
      ))}
      {diags.some((d) => d.severity === 'error') && <Btn small label="Fix errors with AI" onPress={() => askAi('fix', 'Fix the syntax errors listed in the diagnostics.')} />}
    </View>
  );

  const toolBody = tool === 'assistant' ? <AssistantPanel {...ctx} initial={initial} onApplied={(b) => setLastApplied(b)} />
    : tool === 'attach' ? <AttachPanel {...ctx} cands={cands} setCands={setCands} resolve={resolve} setResolve={setResolve} notes={notes} setNotes={setNotes} busy={busy} setBusy={setBusy} add={add}
        onImported={(created) => { setCands([]); setResolve({}); setNotes([]); if (created[0]) open(created[0]); }} />
    : tool === 'convert' ? <ConvertPanel {...ctx} />
    : tool === 'search' ? <SearchPanel {...ctx} prefillReplace={findRep} />
    : tool === 'problems' ? problems
    : tool === 'settings' ? <SettingsPanel {...ctx} set={p.setEditor} />
    : null;

  const toolBar = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.border }} contentContainerStyle={{ padding: 6, alignItems: 'center' }}>
      {TOOLS.map(([k, l]) => <Chip key={k} label={k === 'problems' && diags.length ? `${l} (${errCount || diags.length})` : l} active={tool === k} onPress={() => { setTool(tool === k ? null : k); if (!wide) setView(tool === k ? 'editor' : 'tools'); }} />)}
    </ScrollView>
  );

  const toolPane = tool ? (
    <View style={{ borderTopWidth: wide ? 0 : 1, borderColor: t.border, ...(wide ? { height: toolH } : { flex: 1 }) }}>
      {lastApplied && tool === 'assistant' && (
        <View style={[row, { padding: 6, backgroundColor: t.primary + '22' }]}>
          <Txt size={12} style={{ flex: 1 }}>AI changes were applied.</Txt>
          <Btn small kind="danger" label="Revert them" onPress={() => { p.applyFiles(lastApplied, 'Revert AI change'); setLastApplied(null); }} />
          <Btn small kind="ghost" label="Keep" onPress={() => setLastApplied(null)} />
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10, gap: 8 }} keyboardShouldPersistTaps="handled">{toolBody}</ScrollView>
    </View>
  ) : null;

  const explorer = (
    <View style={{ width: wide ? explW : undefined, flex: wide ? undefined : 1, borderRightWidth: wide ? 0 : 0, backgroundColor: t.card }}>
      <Explorer files={files} current={p.current} dirty={dirty} contextPaths={contextPaths} extraDirs={extraDirs} onOpen={open} onCreate={create} onFolder={mkdir} onRename={rename}
        onDuplicate={duplicate} onDelete={remove} onToggleContext={(path) => setContextPaths(contextPaths.includes(path) ? contextPaths.filter((x) => x !== path) : [...contextPaths, path])} />
    </View>
  );

  const editorColumn = (
    <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
      {!zen && tabBar}
      {!zen && toolbar}
      {selBar}
      {draftBar}
      <View style={{ flex: 1, minHeight: 200, flexDirection: 'row', padding: zen ? 0 : 6, gap: 6 }}>
        <View style={{ flex: 1, minWidth: 0 }}>{editorFor(file, true)}</View>
        {split && wide && (
          <View style={{ flex: 1, minWidth: 0 }}>
            <ScrollView horizontal style={{ flexGrow: 0 }} showsHorizontalScrollIndicator={false}>{files.map((f) => <Chip key={f.path} label={f.path} active={f.path === split} onPress={() => setSplit(f.path)} />)}</ScrollView>
            {editorFor(splitFile, false)}
          </View>
        )}
      </View>
      {curDiags.length > 0 && !zen && <Txt size={11} sub style={{ paddingHorizontal: 8, paddingBottom: 4 }} onPress={() => { setTool('problems'); }}>{curDiags.filter((d) => d.severity === 'error').length} error(s), {curDiags.filter((d) => d.severity !== 'error').length} other in this file — tap for details</Txt>}
    </View>
  );

  const body = wide ? (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}>
        {showExp && !zen && (<>{explorer}<Splitter onDelta={(d) => setExplW((w) => Math.min(420, Math.max(120, w + d)))} /></>)}
        {editorColumn}
      </View>
      {!zen && toolBar}
      {tool && !zen && (<><Splitter vertical={false} onDelta={(d) => setToolH((h) => Math.min(640, Math.max(120, h - d)))} />{toolPane}</>)}
    </View>
  ) : (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={[row, { padding: 6 }]}>
        <Chip label="Files" active={view === 'files'} onPress={() => setView('files')} />
        <Chip label={'Editor' + (dirty.size ? ' ●' : '')} active={view === 'editor'} onPress={() => setView('editor')} />
        <Chip label="Tools" active={view === 'tools'} onPress={() => { setView('tools'); if (!tool) setTool('assistant'); }} />
      </View>
      {view === 'files' && explorer}
      {view === 'editor' && editorColumn}
      {view === 'tools' && (<View style={{ flex: 1 }}>{toolBar}{toolPane}</View>)}
    </View>
  );

  return (
    <DropArea onData={() => {}} onFiles={async (fs) => add(await readDropped(fs))} style={{ flex: 1, height: '100%', minHeight: 0, minWidth: 0 }} overStyle={{ outline: `2px dashed ${t.primary}`, outlineOffset: -4 }}>
      <View style={{ flex: 1, height: '100%', minHeight: 0, minWidth: 0, borderWidth: 1, borderColor: t.border, borderRadius: 12, overflow: 'hidden', backgroundColor: t.bg }}>
        {body}
      </View>
    </DropArea>
  );
}
