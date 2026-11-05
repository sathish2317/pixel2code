import React, { useState } from 'react';
import { View } from 'react-native';
import { Btn, Card, Chip, Txt, row, useTheme } from '../ui';
import { EditorSettings, defaultEditorSettings } from '../../lib/editorSettings';
import { Capabilities, capabilities, serverCreateProject, serverGetFiles, serverSyncProject } from '../../api';
import { confirmAction } from '../../lib/confirm';
import { hashFiles } from '../../lib/hash';
import { WBCtx } from './types';

const SHORTCUTS: [string, string][] = [
  ['Ctrl/Cmd + S', 'Save now'], ['Ctrl/Cmd + F', 'Find in project'], ['Ctrl/Cmd + H', 'Find and replace'], ['Ctrl/Cmd + G', 'Go to line'],
  ['Alt + Shift + F', 'Format file'], ['Ctrl/Cmd + /', 'Toggle comment'], ['Tab / Shift + Tab', 'Indent / outdent lines'],
  ['Alt + ↑ / ↓', 'Move line'], ['Alt + Shift + ↑ / ↓', 'Copy line'], ['Ctrl/Cmd + Z / Y', 'Undo / redo'], ['Esc', 'Leave full-screen'],
  ['Monaco only', 'Multi-cursor (Alt+click), folding, minimap, IntelliSense'],
];

export default function SettingsPanel(ctx: WBCtx & { set: (s: EditorSettings) => void }) {
  const t = useTheme();
  const s = ctx.editor, set = ctx.set;
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [capErr, setCapErr] = useState('');
  const [busy, setBusy] = useState(false);
  const sync = ctx.project.sync;
  const hash = hashFiles(ctx.files);
  const changed = !!sync && sync.filesHash !== hash;
  const Opt = ({ label, children }: { label: string; children: React.ReactNode }) => <View style={{ gap: 4 }}><Txt size={12} sub>{label}</Txt><View style={row}>{children}</View></View>;

  const push = async () => {
    setBusy(true);
    try {
      const body = { id: ctx.project.id, name: ctx.project.name, target: ctx.project.target, files: ctx.files };
      let serverId = sync?.serverId ?? ctx.project.id;
      if (sync) {
        try { await serverSyncProject(ctx.server, serverId, { name: body.name, files: body.files }); }
        catch (e: any) { if (e.status === 404) await serverCreateProject(ctx.server, body); else throw e; }
      } else {
        try { await serverCreateProject(ctx.server, body); }
        catch (e: any) { if (e.status === 409) await serverSyncProject(ctx.server, serverId, { name: body.name, files: body.files }); else throw e; }
      }
      ctx.patchProject({ sync: { serverId, serverUrl: ctx.server.serverUrl, lastSyncAt: Date.now(), filesHash: hash } });
      ctx.toast('Pushed to the server.');
    } catch (e: any) { ctx.toast('Sync failed: ' + e.message); } finally { setBusy(false); }
  };
  const pull = () => confirmAction('Replace local files with the server copy?', 'Your current files are saved as a version first, then replaced by what is on the server.', 'Pull', async () => {
    setBusy(true);
    try {
      const r = await serverGetFiles(ctx.server, sync!.serverId);
      const files = r.items.map((f) => ({ path: f.path, content: f.content }));
      ctx.applyFiles(files, 'Pull from server');
      ctx.patchProject({ sync: { ...sync!, lastSyncAt: Date.now(), filesHash: hashFiles(files) } });
      ctx.toast(`Pulled ${files.length} file(s).`);
    } catch (e: any) { ctx.toast('Pull failed: ' + e.message); } finally { setBusy(false); }
  });

  return (
    <View style={{ gap: 10 }}>
      <Card style={{ gap: 8 }}>
        <Txt bold size={15}>Editor</Txt>
        <Opt label="Theme">{(['dark', 'light'] as const).map((v) => <Chip key={v} label={v} active={s.theme === v} onPress={() => set({ ...s, theme: v })} />)}</Opt>
        <Opt label={`Font size: ${s.fontSize}px`}>
          <Btn small kind="ghost" label="A−" onPress={() => set({ ...s, fontSize: Math.max(9, s.fontSize - 1) })} /><Btn small kind="ghost" label="A+" onPress={() => set({ ...s, fontSize: Math.min(28, s.fontSize + 1) })} />
        </Opt>
        <Opt label="Font family">{([['system-mono', 'System mono'], ['fira-code', 'Fira Code*'], ['jetbrains-mono', 'JetBrains Mono*'], ['consolas', 'Consolas']] as const).map(([v, l]) => <Chip key={v} label={l} active={s.fontFamily === v} onPress={() => set({ ...s, fontFamily: v })} />)}</Opt>
        <Opt label={`Line height: ${s.lineHeight.toFixed(2)}`}>
          <Btn small kind="ghost" label="−" onPress={() => set({ ...s, lineHeight: Math.max(1.1, Math.round((s.lineHeight - 0.1) * 100) / 100) })} /><Btn small kind="ghost" label="+" onPress={() => set({ ...s, lineHeight: Math.min(2.4, Math.round((s.lineHeight + 0.1) * 100) / 100) })} />
        </Opt>
        <Opt label="Tab size">{([2, 4, 8] as const).map((v) => <Chip key={v} label={String(v)} active={s.tabSize === v} onPress={() => set({ ...s, tabSize: v })} />)}</Opt>
        <Opt label="Word wrap"><Chip label={s.wordWrap ? 'On (line numbers hidden in built-in editor)' : 'Off'} active={s.wordWrap} onPress={() => set({ ...s, wordWrap: !s.wordWrap })} /></Opt>
        <Opt label="Auto-save"><Chip label={s.autoSave ? 'On (saves ~1 s after you stop typing)' : 'Off (press Ctrl+S)'} active={s.autoSave} onPress={() => set({ ...s, autoSave: !s.autoSave })} /></Opt>
        <Opt label={`Live preview delay: ${s.previewDebounce} ms`}>
          {[0, 200, 400, 800, 1500].map((v) => <Chip key={v} label={String(v)} active={s.previewDebounce === v} onPress={() => set({ ...s, previewDebounce: v })} />)}
        </Opt>
        <Opt label="Editor engine">
          <Chip label="Built-in" active={s.engine === 'builtin'} onPress={() => set({ ...s, engine: 'builtin' })} />
          <Chip label="Monaco (VS Code engine, web, needs internet)" active={s.engine === 'monaco'} onPress={() => set({ ...s, engine: 'monaco' })} />
        </Opt>
        {s.engine === 'monaco' && <Opt label="Monaco minimap"><Chip label={s.minimap ? 'On' : 'Off'} active={s.minimap} onPress={() => set({ ...s, minimap: !s.minimap })} /></Opt>}
        <Txt size={11} sub>* Fira Code / JetBrains Mono are used only if installed on your computer.</Txt>
        <Btn small kind="ghost" label="Reset editor settings" onPress={() => set(defaultEditorSettings)} />
      </Card>

      <Card style={{ gap: 6 }}>
        <Txt bold size={15}>Where is this project stored?</Txt>
        <Txt size={13} style={{ color: sync ? t.ok : '#f5a524', fontWeight: '700' }}>{sync ? (changed ? 'Server copy is OUTDATED (local changes not pushed)' : 'Synced with the server') : 'Local only — saved in this browser/device'}</Txt>
        <Txt size={12} sub>{sync ? `Last sync ${new Date(sync.lastSyncAt).toLocaleString()} · ${sync.serverUrl}` : 'Your work is saved automatically on this device (IndexedDB / app storage). It is NOT in the cloud and is not shared. Clearing browser data deletes it, so export a ZIP or push it to your server for a backup.'}</Txt>
        <View style={row}>
          <Btn small label={sync ? 'Push to server' : 'Push to server (create)'} disabled={busy} onPress={push} />
          {sync && <Btn small kind="ghost" label="Pull from server" disabled={busy} onPress={pull} />}
        </View>
        <Txt size={11} sub>The server stores it in its own SQLite database (your server, your disk). It is only as durable as that machine and its backups.</Txt>
      </Card>

      <Card style={{ gap: 6 }}>
        <Txt bold size={15}>Server features</Txt>
        <Btn small kind="ghost" label="Check what the server supports" onPress={async () => { setCapErr(''); try { setCaps(await capabilities(ctx.server)); } catch (e: any) { setCapErr(e.message); } }} />
        {!!capErr && <Txt size={12} style={{ color: t.danger }}>{capErr}</Txt>}
        {caps && (
          <View style={{ gap: 2 }}>
            <Txt size={12}>AI: {caps.ai.configured ? `ready (${caps.ai.provider}, ${caps.ai.model})` : 'NOT configured: set the API key in server/.env'}</Txt>
            <Txt size={12}>PDF input to AI: {caps.ai.pdfInput ? 'yes' : 'no (needs Gemini)'} · PDF text extraction: {caps.pdfTextExtraction ? 'yes' : 'no'}</Txt>
            <Txt size={12}>OCR: {caps.ocr.configured ? 'yes' : 'not configured'}</Txt>
            <Txt size={12}>Run PHP/Python/Java: {caps.codeRunner.configured ? 'yes' : 'not available (no sandboxed runner configured)'}</Txt>
          </View>
        )}
      </Card>

      <Card style={{ gap: 3 }}>
        <Txt bold size={15}>Keyboard shortcuts</Txt>
        {SHORTCUTS.map(([k, d]) => <Txt key={k} size={12}><Txt size={12} bold>{k}</Txt>  {d}</Txt>)}
      </Card>
    </View>
  );
}
