import React, { useMemo, useState } from 'react';
import { Image, View } from 'react-native';
import { ProjectAsset, ProjectFile } from '../types';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from './ui';
import { analyzeRefs, dataUri, fixRefs, formatBytes, mergeAssets, remapRef, assetBytes, totalBytes, unusedAssets } from '../lib/assets';
import { pickLooseAssets, pickZipAssets } from '../lib/pickImages';
import { ASSET_TOTAL_LIMIT } from '../storage';
import { confirmAction } from '../lib/confirm';

interface Props {
  files: ProjectFile[];
  assets: ProjectAsset[];
  onAssets: (next: ProjectAsset[]) => Promise<void>;
  onFiles: (next: ProjectFile[], label: string) => void;
  toast: (s: string) => void;
}

const STATUS_LABEL = { ok: 'OK', fixable: 'Wrong path, can be fixed', placeholder: 'Placeholder image', missing: 'Image not found' } as const;

export default function ImagesPanel({ files, assets, onAssets, onFiles, toast }: Props) {
  const t = useTheme();
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [mapping, setMapping] = useState<string | null>(null); // "file|ref" of the row whose picker is open
  const [search, setSearch] = useState('');

  const refs = useMemo(() => analyzeRefs(files, assets), [files, assets]);
  const unused = useMemo(() => unusedAssets(files, assets), [files, assets]);
  const count = (s: string) => refs.filter((r) => r.status === s).length;
  const problems = refs.filter((r) => r.status !== 'ok');
  const used = totalBytes(assets);

  const add = async (picker: typeof pickZipAssets) => {
    setBusy(true);
    try {
      const r = await picker(assets);
      if (!r) return;
      await onAssets(mergeAssets(assets, r.assets));
      toast(r.message);
    } catch (e: any) { toast(e.message || 'Could not add images.'); }
    finally { setBusy(false); }
  };

  const shown = showAll ? assets : assets.slice(0, 30);
  const matches = (q: string) => assets.filter((a) => a.path.toLowerCase().includes(q.toLowerCase())).slice(0, 12);

  return (
    <View style={{ gap: 12 }}>
      <Card style={{ gap: 8 }}>
        <Txt bold size={16}>Images in this project</Txt>
        <Txt sub size={12}>
          {assets.length} image(s), {formatBytes(used)} of {formatBytes(ASSET_TOTAL_LIMIT)}. Images are saved under <Txt bold size={12}>images/</Txt> and exported as real files in the ZIP next to index.html.
        </Txt>
        <View style={row}>
          <Btn small label="Add images ZIP" onPress={() => add(pickZipAssets)} disabled={busy} />
          <Btn small kind="ghost" label="Add loose images" onPress={() => add(pickLooseAssets)} disabled={busy} />
        </View>
        {assets.length === 0 && <Txt sub size={12}>No images yet. Add a ZIP and the code will be checked against the file names.</Txt>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {shown.map((a) => (
            <View key={a.path} style={{ width: 150, borderWidth: 1, borderColor: t.border, borderRadius: 10, padding: 6, gap: 4 }}>
              <Image source={{ uri: dataUri(a) }} resizeMode="contain" style={{ width: '100%', height: 70, backgroundColor: '#0002' }} />
              <Txt size={11} style={{ fontFamily: 'monospace' }}>{a.path}</Txt>
              <Txt sub size={11}>{formatBytes(assetBytes(a))}</Txt>
              <Btn small kind="ghost" label="Remove" onPress={() => confirmAction('Remove image?', `"${a.path}" will be removed from this project. Code that points to it will show a broken image.`, 'Remove',
                () => onAssets(assets.filter((x) => x.path !== a.path)).catch((e) => toast(e.message)))} />
            </View>
          ))}
        </View>
        {assets.length > 30 && <Btn small kind="ghost" label={showAll ? 'Show fewer' : `Show all ${assets.length}`} onPress={() => setShowAll(!showAll)} />}
      </Card>

      <Card style={{ gap: 8 }}>
        <Txt bold size={16}>Image paths in the code</Txt>
        <Txt sub size={12}>
          Every image used in index.html and the CSS files is checked against your files. {refs.length === 0 ? 'No image references were found.' : `${count('ok')} correct, ${count('fixable')} fixable, ${count('placeholder')} placeholder, ${count('missing')} not found.`}
        </Txt>
        {count('fixable') > 0 && (
          <Btn label={`Fix ${count('fixable')} path(s) automatically`} onPress={() => {
            const r = fixRefs(files, assets);
            onFiles(r.files, `Fixed ${r.fixed} image path(s)`);
            toast(`Fixed ${r.fixed} image path(s). Placeholders and missing images are not touched.`);
          }} />
        )}
        {problems.length === 0 && refs.length > 0 && <Txt style={{ color: t.ok }}>All image paths are correct.</Txt>}
        {problems.map((r) => {
          const key = r.file + '|' + r.ref;
          const open = mapping === key;
          return (
            <View key={key} style={{ borderTopWidth: 1, borderColor: t.border, paddingTop: 8, gap: 6 }}>
              <Txt size={12} style={{ fontFamily: 'monospace' }}>{r.file}: {r.ref.length > 90 ? r.ref.slice(0, 90) + '...' : r.ref}</Txt>
              <Txt size={12} style={{ color: r.status === 'missing' ? t.danger : t.sub }}>
                {STATUS_LABEL[r.status]}{r.target ? ' -> ' + r.target : ''}
              </Txt>
              <View style={row}>
                {r.status === 'fixable' && r.target && (
                  <Btn small label="Use suggested" onPress={() => onFiles(remapRef(files, r.file, r.ref, r.target!), 'Image path changed')} />
                )}
                <Btn small kind="ghost" label={open ? 'Close' : 'Choose image'} onPress={() => { setMapping(open ? null : key); setSearch(''); }} disabled={assets.length === 0} />
              </View>
              {open && (
                <View style={{ gap: 6 }}>
                  <Input placeholder="Search your images" value={search} onChangeText={setSearch} autoCapitalize="none" />
                  <View style={row}>
                    {matches(search).map((a) => (
                      <Chip key={a.path} label={a.path} onPress={() => { onFiles(remapRef(files, r.file, r.ref, a.path), 'Image path changed'); setMapping(null); }} />
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </Card>

      {unused.length > 0 && (
        <Card style={{ gap: 4 }}>
          <Txt bold>Not used in the code yet ({unused.length})</Txt>
          <Txt sub size={12}>These files are in the project but no HTML/CSS/JS points to them. Ask the Chat tab to use them, or choose one for a placeholder above.</Txt>
          <Txt size={12} style={{ fontFamily: 'monospace' }}>{unused.slice(0, 25).map((a) => a.path).join('\n')}{unused.length > 25 ? '\n...' : ''}</Txt>
        </Card>
      )}
    </View>
  );
}
