import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Btn, Input, Txt, row, useTheme } from '../ui';
import { TreeNode, buildTree } from '../../lib/fileTree';
import { ProjectFile } from '../../types';
import { languageOf } from '../../lib/langs';

const DOT: Record<string, string> = { html: '#e86a33', css: '#3b8eea', scss: '#cd6799', javascript: '#e8d44d', javascriptreact: '#61dafb', typescript: '#3178c6', typescriptreact: '#61dafb', json: '#9aa1c2', php: '#8892bf', python: '#4b8bbe', java: '#e76f00', markdown: '#9aa1c2', sql: '#e38c00' };

type Edit = { mode: 'new' | 'folder' | 'rename'; path: string; value: string } | null;

export default function Explorer(p: {
  files: ProjectFile[]; current: string; dirty: Set<string>; contextPaths: string[]; extraDirs: string[];
  onOpen: (path: string) => void; onCreate: (path: string) => string | undefined; onFolder: (path: string) => string | undefined;
  onRename: (from: string, to: string) => string | undefined; onDuplicate: (path: string) => void; onDelete: (path: string, isDir: boolean) => void;
  onToggleContext: (path: string) => void;
}) {
  const t = useTheme();
  const tree = useMemo(() => buildTree(p.files, p.extraDirs), [p.files, p.extraDirs]);
  const [closed, setClosed] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<string | null>(null);
  const [edit, setEdit] = useState<Edit>(null);
  const [err, setErr] = useState('');

  const commit = () => {
    if (!edit) return;
    const v = edit.value.trim();
    if (!v) return setEdit(null);
    const e = edit.mode === 'new' ? p.onCreate(v) : edit.mode === 'folder' ? p.onFolder(v) : p.onRename(edit.path, v);
    if (e) setErr(e); else { setEdit(null); setErr(''); }
  };
  const base = (path: string, isDir: boolean) => (isDir ? path + '/' : path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : '');

  const render = (nodes: TreeNode[], depth: number): React.ReactNode[] => nodes.flatMap((n) => {
    const active = !n.dir && n.path === p.current;
    const items: React.ReactNode[] = [(
      <View key={n.path}>
        <Pressable onPress={() => (n.dir ? setClosed({ ...closed, [n.path]: !closed[n.path] }) : p.onOpen(n.path))} onLongPress={() => setMenu(menu === n.path ? null : n.path)}
          accessibilityRole="button" accessibilityLabel={(n.dir ? 'Folder ' : 'File ') + n.path}
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingLeft: 6 + depth * 14, paddingRight: 4, backgroundColor: active ? t.primary + '33' : 'transparent', borderRadius: 6, gap: 6 }}>
          <Txt size={12} sub style={{ width: 12 }}>{n.dir ? (closed[n.path] ? '▸' : '▾') : ''}</Txt>
          {!n.dir && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT[languageOf(n.path)] || t.sub }} />}
          <Txt size={13} bold={n.dir} style={{ flex: 1 }} numberOfLines={1}>{n.name}{p.dirty.has(n.path) ? ' ●' : ''}</Txt>
          {!n.dir && <Pressable accessibilityLabel={'Use ' + n.path + ' as AI context'} onPress={() => p.onToggleContext(n.path)} hitSlop={6}><Txt size={13} sub>{p.contextPaths.includes(n.path) ? '☑' : '☐'}</Txt></Pressable>}
          <Pressable accessibilityLabel={'Actions for ' + n.path} onPress={() => setMenu(menu === n.path ? null : n.path)} hitSlop={6}><Txt size={14} sub>⋯</Txt></Pressable>
        </Pressable>
        {menu === n.path && (
          <View style={[row, { paddingLeft: 10 + depth * 14, paddingVertical: 4 }]}>
            {n.dir && <Btn small kind="ghost" label="+ File here" onPress={() => { setEdit({ mode: 'new', path: '', value: n.path + '/' }); setMenu(null); }} />}
            <Btn small kind="ghost" label="Rename" onPress={() => { setEdit({ mode: 'rename', path: n.path, value: n.path }); setMenu(null); }} />
            {!n.dir && <Btn small kind="ghost" label="Duplicate" onPress={() => { p.onDuplicate(n.path); setMenu(null); }} />}
            <Btn small kind="danger" label="Delete" onPress={() => { p.onDelete(n.path, n.dir); setMenu(null); }} />
          </View>
        )}
      </View>
    )];
    if (n.dir && !closed[n.path]) items.push(...render(n.children || [], depth + 1));
    return items;
  });

  return (
    <View style={{ flex: 1, minHeight: 0 }}>
      <View style={[row, { padding: 6 }]}>
        <Btn small kind="ghost" label="+ File" onPress={() => { setEdit({ mode: 'new', path: '', value: base(p.current, false) }); setErr(''); }} />
        <Btn small kind="ghost" label="+ Folder" onPress={() => { setEdit({ mode: 'folder', path: '', value: '' }); setErr(''); }} />
      </View>
      {edit && (
        <View style={{ padding: 6, gap: 4 }}>
          <Txt size={11} sub>{edit.mode === 'new' ? 'New file path (e.g. js/app.js)' : edit.mode === 'folder' ? 'New folder name (it appears once it has a file)' : 'New name / path'}</Txt>
          <Input autoFocus value={edit.value} onChangeText={(v) => setEdit({ ...edit, value: v })} autoCapitalize="none" autoCorrect={false} onSubmitEditing={commit} style={{ paddingVertical: 6, fontSize: 13 }} />
          {!!err && <Txt size={11} style={{ color: t.danger }}>{err}</Txt>}
          <View style={row}><Btn small label="OK" onPress={commit} /><Btn small kind="ghost" label="Cancel" onPress={() => { setEdit(null); setErr(''); }} /></View>
        </View>
      )}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
        {render(tree, 0)}
        {!p.files.length && <Txt size={12} sub style={{ padding: 10 }}>No files yet. Create one, or use Attach Code.</Txt>}
      </ScrollView>
      <Txt size={10} sub style={{ padding: 6 }}>☐ = send this file to the AI as context · ⋯ = rename / duplicate / delete</Txt>
    </View>
  );
}
