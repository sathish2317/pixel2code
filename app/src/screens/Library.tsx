import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { confirmAction as confirm } from '../lib/confirm';
import * as DocumentPicker from 'expo-document-picker';
import { Project, ProjectAsset, uid } from '../types';
import { copyAssets, loadAssets, saveAssets } from '../storage';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { importZipFromUri, exportZip } from '../lib/exporter';
import FullView from '../components/FullView';

type Filter = 'all' | 'recent' | 'favorites' | 'drafts' | 'exported' | 'trash';

export default function Library(props: {
  projects: Project[];
  onOpen: (p: Project) => void;
  onNew: () => void;
  onSettings: () => void;
  onComponents: () => void;
  onBlocks: () => void;
  onAnimation: () => void;
  onComponentLab: () => void;
  onAdvanced: () => void;
  onAnimation3D: () => void;
  onChange: (p: Project) => Promise<void>;
  onDeleteForever: (id: string) => Promise<void>;
  onImported: (p: Project) => Promise<void>;
  toast: (s: string) => void;
}) {
  const t = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [viewing, setViewing] = useState<{ p: Project; assets: ProjectAsset[] } | null>(null);
  const binCount = props.projects.filter((p) => !!p.deletedAt).length;

  const viewOutput = async (p: Project) => {
    let assets: ProjectAsset[] = [];
    try { assets = await loadAssets(p.id); } catch { /* preview still works without images */ }
    setViewing({ p, assets });
  };

  const list = useMemo(() => {
    let l = props.projects.filter((p) => (filter === 'trash' ? !!p.deletedAt : !p.deletedAt));
    if (filter === 'recent') l = l.slice(0, 5);
    if (filter === 'favorites') l = l.filter((p) => p.favorite);
    if (filter === 'drafts') l = l.filter((p) => !p.exportedAt);
    if (filter === 'exported') l = l.filter((p) => p.exportedAt);
    if (q.trim()) l = l.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return l;
  }, [props.projects, filter, q]);

  const importZip = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'application/x-zip-compressed'], copyToCacheDirectory: true });
      if (r.canceled) return;
      const { files, assets } = await importZipFromUri(r.assets[0].uri);
      const now = Date.now();
      const id = uid();
      if (assets.length) await saveAssets(id, assets);
      await props.onImported({
        id, name: r.assets[0].name.replace(/\.zip$/i, ''), createdAt: now, updatedAt: now, target: 'html', favorite: false,
        files, assets: assets.length ? assets.map((a) => ({ path: a.path, mime: a.mime, bytes: Math.floor((a.base64.length * 3) / 4) })) : undefined,
        instructions: [], fonts: {}, animations: [], sectionStyles: {}, versions: [],
      });
      props.toast(assets.length ? `ZIP imported as a new project with ${assets.length} image(s).` : 'ZIP imported as a new project.');
    } catch (e: any) {
      props.toast(e.message || 'Import failed.');
    }
  };

  const dup = async (p: Project) => {
    const now = Date.now();
    const id = uid();
    try { await copyAssets(p.id, id); } catch (e: any) { props.toast(e.message || 'Could not copy the images.'); return; } // images first: a copy without its images would be broken
    await props.onChange({ ...p, id, name: p.name + ' (copy)', createdAt: now, updatedAt: now, exportedAt: undefined, deletedAt: undefined });
    props.toast('Duplicated.');
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, maxWidth: 1100, width: '100%', alignSelf: 'center' }}>
      <View style={row}>
        <Txt bold size={22}>Pixel2Code</Txt>
        <View style={{ flex: 1 }} />
        <Btn small kind="ghost" label="Settings" onPress={props.onSettings} />
      </View>
      <View style={row}>
        <Btn label="+ New from screenshot" onPress={props.onNew} />
        <Btn kind="ghost" label="Code blocks" onPress={props.onBlocks} />
        <Btn kind="ghost" label="Animation Studio" onPress={props.onAnimation} />
        <Btn kind="ghost" label="UI Components Lab" onPress={props.onComponentLab} />
        <Btn kind="ghost" label="Advanced Studio" onPress={props.onAdvanced} />
        <Btn kind="ghost" label="3D Animation Studio" onPress={props.onAnimation3D} />
        <Btn kind="ghost" label="My components" onPress={props.onComponents} />
        <Btn kind="ghost" label="Import ZIP" onPress={importZip} />
      </View>
      <Input placeholder="Search projects" value={q} onChangeText={setQ} accessibilityLabel="Search projects" />
      <View style={row}>
        {(['all', 'recent', 'favorites', 'drafts', 'exported', 'trash'] as Filter[]).map((f) => (
          <Chip key={f} label={f === 'trash' ? 'Recycle bin' : f[0].toUpperCase() + f.slice(1)} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {filter === 'trash' && binCount > 0 && (
        <View style={row}>
          <Txt sub size={12}>{binCount} project(s) in the bin. Use View output to check a project before restoring or deleting it.</Txt>
          <Btn small kind="danger" label={`Empty bin (${binCount})`} onPress={() =>
            confirm('Empty the recycle bin?', `${binCount} project(s) will be removed from this device permanently. This cannot be undone.`, 'Delete all', async () => {
              for (const x of props.projects.filter((q) => !!q.deletedAt)) await props.onDeleteForever(x.id);
              props.toast('Recycle bin emptied.');
            })} />
        </View>
      )}
      {list.length === 0 && (
        <Card>
          <Txt sub>
            {props.projects.length === 0
              ? 'No projects yet. Tap "New from screenshot" to start. Projects stay saved on this device until YOU permanently delete them.'
              : 'Nothing here for this filter.'}
          </Txt>
        </Card>
      )}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {list.map((p) => (
          <Card key={p.id} style={{ flexGrow: 1, flexBasis: 300, minWidth: 260 }}>
            <Txt bold size={16}>{(p.favorite ? '★ ' : '') + p.name}</Txt>
            <Txt sub size={12}>
              {p.target.toUpperCase()} · {p.files.length} files · {new Date(p.updatedAt).toLocaleString()}
            </Txt>
            {p.exportedAt && <Txt sub size={12}>Exported {new Date(p.exportedAt).toLocaleDateString()}</Txt>}
            {!!p.deletedAt && <Txt sub size={12}>Moved to bin {new Date(p.deletedAt).toLocaleString()}</Txt>}
            {renaming === p.id ? (
              <View style={[row, { marginTop: 8 }]}>
                <Input style={{ flex: 1, minWidth: 140 }} value={newName} onChangeText={setNewName} autoFocus />
                <Btn small label="Save" onPress={async () => { await props.onChange({ ...p, name: newName.trim() || p.name, updatedAt: Date.now() }); setRenaming(null); }} />
              </View>
            ) : (
              <View style={[row, { marginTop: 10 }]}>
                {!p.deletedAt ? (
                  <>
                    <Btn small label="Open" onPress={() => props.onOpen(p)} />
                    <Btn small kind="ghost" label={p.favorite ? 'Unfavorite' : 'Favorite'} onPress={() => props.onChange({ ...p, favorite: !p.favorite })} />
                    <Btn small kind="ghost" label="Rename" onPress={() => { setRenaming(p.id); setNewName(p.name); }} />
                    <Btn small kind="ghost" label="Duplicate" onPress={() => dup(p)} />
                    <Btn small kind="ghost" label="Export ZIP" onPress={async () => {
                      try { props.toast(await exportZip(p, await loadAssets(p.id))); await props.onChange({ ...p, exportedAt: Date.now() }); } catch (e: any) { props.toast(e.message); }
                    }} />
                    <Btn small kind="ghost" label="Move to bin" onPress={() => props.onChange({ ...p, deletedAt: Date.now() })} />
                  </>
                ) : (
                  <>
                    <Btn small kind="ghost" label="View output" onPress={() => viewOutput(p)} />
                    <Btn small label="Restore" onPress={() => props.onChange({ ...p, deletedAt: undefined })} />
                    <Btn small kind="danger" label="Delete forever" onPress={() =>
                      confirm('Delete permanently?',
                        `"${p.name}" and all its files, images and versions will be removed from this device. This cannot be undone. ZIP backups you already exported are not affected.`,
                        'Delete forever', async () => { await props.onDeleteForever(p.id); props.toast('Project permanently deleted.'); })} />
                  </>
                )}
              </View>
            )}
          </Card>
        ))}
      </View>
      <Txt sub size={12}>
        Projects are stored only on this device/browser. Clearing browser data, private windows or phone storage cleanup can remove them, and they do NOT sync between web and phone. Export a ZIP regularly as a backup.
      </Txt>
    </ScrollView>
    {viewing && <FullView files={viewing.p.files} assets={viewing.assets} title={viewing.p.name + ' (in bin)'} onClose={() => setViewing(null)} />}
    </View>
  );
}