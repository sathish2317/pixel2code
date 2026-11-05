import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../ui';
import { replaceInFiles, searchFiles } from '../../lib/search';
import { confirmAction } from '../../lib/confirm';
import { WBCtx } from './types';

export default function SearchPanel(ctx: WBCtx & { prefillReplace?: boolean }) {
  const t = useTheme();
  const [q, setQ] = useState('');
  const [rep, setRep] = useState('');
  const [cs, setCs] = useState(false), [ww, setWw] = useState(false), [rx, setRx] = useState(false), [cur, setCur] = useState(false);
  const [showRep, setShowRep] = useState(!!ctx.prefillReplace);
  const opts = { query: q, caseSensitive: cs, wholeWord: ww, regex: rx };
  const scope = useMemo(() => (cur ? ctx.files.filter((f) => f.path === ctx.current) : ctx.files), [ctx.files, ctx.current, cur]);
  const res = useMemo(() => (q ? searchFiles(scope, opts) : { matches: [], truncated: false, error: undefined }), [q, cs, ww, rx, scope]);
  const groups = useMemo(() => { const m = new Map<string, typeof res.matches>(); for (const x of res.matches) m.set(x.path, [...(m.get(x.path) || []), x]); return [...m.entries()]; }, [res]);

  return (
    <View style={{ gap: 8 }}>
      <Input value={q} onChangeText={setQ} placeholder="Find in project" autoCapitalize="none" autoCorrect={false} />
      <View style={row}>
        <Chip label="Aa" active={cs} onPress={() => setCs(!cs)} /><Chip label="Whole word" active={ww} onPress={() => setWw(!ww)} /><Chip label=".* Regex" active={rx} onPress={() => setRx(!rx)} />
        <Chip label={cur ? 'Current file only' : 'All files'} active={cur} onPress={() => setCur(!cur)} />
        <Chip label={showRep ? 'Hide replace' : 'Replace…'} onPress={() => setShowRep(!showRep)} />
      </View>
      {showRep && (
        <View style={{ gap: 6 }}>
          <Input value={rep} onChangeText={setRep} placeholder={rx ? 'Replace with (use $1, $2 for groups)' : 'Replace with'} autoCapitalize="none" autoCorrect={false} />
          <Btn small label={`Replace all (${res.matches.length}${res.truncated ? '+' : ''})`} disabled={!res.matches.length} onPress={() =>
            confirmAction('Replace in project?', `Replace ${res.matches.length}${res.truncated ? '+' : ''} match(es) in ${groups.length} file(s)? A snapshot is saved first.`, 'Replace all', () => {
              const out = replaceInFiles(ctx.files, opts, rep, cur ? ctx.current : undefined);
              if (out.error) return ctx.toast(out.error);
              ctx.applyFiles(out.files, `Replace "${q.slice(0, 20)}"`);
              ctx.toast(`${out.count} replacement(s) in ${out.changed.length} file(s).`);
            })} />
        </View>
      )}
      {!!q && res.error && <Txt size={12} style={{ color: t.danger }}>{res.error}</Txt>}
      {!!q && !res.error && <Txt size={12} sub>{res.matches.length}{res.truncated ? '+' : ''} result(s) in {groups.length} file(s)</Txt>}
      {groups.map(([path, ms]) => (
        <Card key={path} style={{ gap: 2, padding: 8 }}>
          <Txt bold size={12}>{path} <Txt size={11} sub>({ms.length})</Txt></Txt>
          {ms.slice(0, 40).map((m, i) => (
            <Txt key={i} size={12} numberOfLines={1} onPress={() => ctx.openFile(path, m.line)} style={{ fontFamily: 'monospace' }}>
              <Txt size={12} sub>{m.line}: </Txt>{m.text.trim()}
            </Txt>
          ))}
          {ms.length > 40 && <Txt size={11} sub>…{ms.length - 40} more in this file</Txt>}
        </Card>
      ))}
    </View>
  );
}
