import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../ui';
import { Candidate, Resolution, fromPaste, fromProject, planImport } from '../../lib/attach';
import { pickFolderWeb, pickOne, pickSourceFiles } from '../../lib/pickCode';
import { listProjects } from '../../storage';
import { Project } from '../../types';
import { confirmAction } from '../../lib/confirm';
import { languageName } from '../../lib/langs';
import { WBCtx } from './types';

const BADGE: Record<string, [string, string]> = { ok: ['READY', '#3ddc97'], duplicate: ['DUPLICATE', '#f5a524'], rejected: ['REJECTED', '#ff5d6c'] };
const kb = (n: number) => (n < 1024 ? n + ' B' : (n / 1024).toFixed(1) + ' KB');

export default function AttachPanel(ctx: WBCtx & {
  cands: Candidate[]; setCands: (c: Candidate[]) => void; resolve: Record<string, Resolution>; setResolve: (r: Record<string, Resolution>) => void;
  notes: string[]; setNotes: (n: string[]) => void; busy: boolean; setBusy: (b: boolean) => void;
  add: (raws: { name: string; bytes: Uint8Array }[]) => Promise<void>; onImported: (created: string[]) => void;
}) {
  const t = useTheme();
  const { cands, setCands, resolve, setResolve } = ctx;
  const [pasteName, setPasteName] = useState('snippet.js');
  const [pasteText, setPasteText] = useState('');
  const [others, setOthers] = useState<Project[] | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const guard = async (fn: () => Promise<void>) => { ctx.setBusy(true); try { await fn(); } catch (e: any) { ctx.setNotes([e.message || 'Could not read that.']); } finally { ctx.setBusy(false); } };
  const merge = (add: Candidate[]) => setCands([...cands, ...add]);

  const selectedOk = cands.filter((c) => c.selected && c.status !== 'rejected');
  const plan = planImport(ctx.files, cands, resolve);
  const doImport = () => {
    const summary = `${plan.created.length} file(s) will be added${plan.replaced.length ? `, ${plan.replaced.length} replaced (${plan.replaced.join(', ')})` : ''}${plan.skipped.length ? `, ${plan.skipped.length} skipped` : ''}.\n\nYour current files stay as they are until you confirm. A snapshot is saved first.`;
    confirmAction('Import into the project?', summary, 'Import', () => {
      ctx.applyFiles(plan.files, 'Import code');
      ctx.onImported([...plan.created, ...plan.replaced]);
      ctx.toast(`Imported ${plan.created.length + plan.replaced.length} file(s).`);
    });
  };

  return (
    <View style={{ gap: 10 }}>
      <Card style={{ gap: 8 }}>
        <Txt bold size={15}>Attach Code</Txt>
        <Txt size={12} sub>Bring existing code into this project. You review everything first; nothing changes and nothing is run until you press Import. Executables, binaries, oversized (&gt;1 MB) and non-text files are rejected.</Txt>
        <View style={row}>
          <Btn small label="Upload files" disabled={ctx.busy} onPress={() => guard(async () => ctx.add(await pickSourceFiles()))} />
          {Platform.OS === 'web' && <Btn small label="Upload folder" disabled={ctx.busy} onPress={() => guard(async () => ctx.add(await pickFolderWeb()))} />}
          <Btn small label="Import ZIP" disabled={ctx.busy} onPress={() => guard(async () => { const f = await pickOne(['application/zip', 'application/x-zip-compressed', 'application/octet-stream']); if (f) await ctx.add([f]); })} />
          <Btn small label="PDF → text" disabled={ctx.busy} onPress={() => guard(async () => { const f = await pickOne(['application/pdf']); if (f) await ctx.add([f]); })} />
          <Btn small kind="ghost" label={showPaste ? 'Hide paste box' : 'Paste code'} onPress={() => setShowPaste(!showPaste)} />
          <Btn small kind="ghost" label="From another project" onPress={async () => setOthers((await listProjects()).filter((p) => p.id !== ctx.project.id && !p.deletedAt))} />
        </View>
        {Platform.OS === 'web' && <Txt size={12} sub>You can also drag and drop files or a ZIP anywhere on the editor.</Txt>}
        {ctx.busy && <Txt size={12} sub>Reading…</Txt>}
      </Card>

      {showPaste && (
        <Card style={{ gap: 6 }}>
          <Input value={pasteName} onChangeText={setPasteName} autoCapitalize="none" placeholder="File name, e.g. utils/helpers.py (the extension sets the language)" />
          <Input multiline mono value={pasteText} onChangeText={setPasteText} style={{ minHeight: 140, textAlignVertical: 'top', fontSize: 12 }} placeholder="Paste your code here" autoCapitalize="none" autoCorrect={false} spellCheck={false} />
          <Btn small label="Add to review list" disabled={!pasteText.trim()} onPress={() => { merge(fromPaste(pasteName, pasteText, ctx.files)); setPasteText(''); setShowPaste(false); }} />
        </Card>
      )}

      {others && (
        <Card style={{ gap: 6 }}>
          <Txt bold size={13}>Your other Pixel2Code projects</Txt>
          {!others.length && <Txt size={12} sub>No other projects.</Txt>}
          {others.map((p) => (
            <View key={p.id} style={row}>
              <Txt size={13} style={{ flexShrink: 1 }}>{p.name} <Txt size={11} sub>({p.files.length} files)</Txt></Txt>
              <Btn small kind="ghost" label="Review its files" onPress={() => { merge(fromProject(p.files, ctx.files, `${p.name.replace(/[^\w-]+/g, '-').slice(0, 30)}/`)); setOthers(null); }} />
              <Btn small kind="ghost" label="Same paths (merge)" onPress={() => { merge(fromProject(p.files, ctx.files)); setOthers(null); }} />
            </View>
          ))}
          <Btn small kind="ghost" label="Close" onPress={() => setOthers(null)} />
        </Card>
      )}

      {ctx.notes.map((n, i) => <Txt key={i} size={12} style={{ color: '#f5a524' }}>ℹ {n}</Txt>)}

      {cands.length > 0 && (
        <Card style={{ gap: 6 }}>
          <View style={row}>
            <Txt bold size={14}>Review ({cands.length})</Txt>
            <Btn small kind="ghost" label="Select all ready" onPress={() => setCands(cands.map((c) => (c.status === 'ok' ? { ...c, selected: true } : c)))} />
            <Btn small kind="ghost" label="Select none" onPress={() => setCands(cands.map((c) => ({ ...c, selected: false })))} />
          </View>
          {cands.map((c) => {
            const [label, color] = BADGE[c.status];
            return (
              <View key={c.id} style={{ borderTopWidth: 1, borderColor: t.border, paddingTop: 6, gap: 4, opacity: c.status === 'rejected' ? 0.75 : 1 }}>
                <View style={row}>
                  {c.status !== 'rejected' && <Chip label={c.selected ? '☑' : '☐'} active={c.selected} onPress={() => setCands(cands.map((x) => (x.id === c.id ? { ...x, selected: !x.selected } : x)))} />}
                  <Txt size={13} bold style={{ flexShrink: 1 }}>{c.path}</Txt>
                  <Txt size={10} style={{ color, fontWeight: '700' }}>{label}</Txt>
                  <Txt size={11} sub>{kb(c.bytes)}{c.status !== 'rejected' ? ' · ' + languageName(c.path) : ''} · {c.source}</Txt>
                </View>
                {!!c.reason && <Txt size={12} sub>{c.reason}</Txt>}
                {!!c.sameName?.length && <Txt size={12} style={{ color: '#f5a524' }}>Same file name also exists at: {c.sameName.join(', ')}</Txt>}
                {c.status === 'duplicate' && !c.identical && (
                  <View style={row}>
                    {(['skip', 'replace', 'rename'] as Resolution[]).map((r) => <Chip key={r} label={r === 'skip' ? 'Keep mine (skip)' : r === 'replace' ? 'Replace mine' : 'Keep both (rename)'} active={(resolve[c.id] ?? 'skip') === r} onPress={() => setResolve({ ...resolve, [c.id]: r })} />)}
                  </View>
                )}
                {c.status !== 'rejected' && <Btn small kind="ghost" label={preview === c.id ? 'Hide code' : 'View code'} onPress={() => setPreview(preview === c.id ? null : c.id)} />}
                {preview === c.id && (
                  <View style={{ backgroundColor: t.input, borderRadius: 8, padding: 8 }}>
                    <Txt size={11} style={{ fontFamily: 'monospace' }}>{c.content.split('\n').slice(0, 60).join('\n')}{c.content.split('\n').length > 60 ? '\n…' : ''}</Txt>
                  </View>
                )}
              </View>
            );
          })}
          <View style={row}>
            <Btn small label={`Import ${plan.created.length + plan.replaced.length} file(s)`} disabled={!plan.created.length && !plan.replaced.length} onPress={doImport} />
            <Btn small kind="ghost" label="Use as AI context only" disabled={!selectedOk.length} onPress={() => {
              const have = new Map(ctx.extraContext.map((f) => [f.path, f]));
              for (const c of selectedOk) have.set(c.path, { path: c.path, content: c.content });
              ctx.setExtraContext([...have.values()].slice(0, 20));
              ctx.toast(`${selectedOk.length} file(s) attached to AI requests (not added to the project).`);
              setCands([]); setResolve({});
            }} />
            <Btn small kind="danger" label="Discard list" onPress={() => { setCands([]); setResolve({}); ctx.setNotes([]); }} />
          </View>
        </Card>
      )}
    </View>
  );
}
