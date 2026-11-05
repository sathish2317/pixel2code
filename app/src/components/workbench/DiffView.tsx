import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useTheme, Txt, Btn } from '../ui';
import { diffLines, diffStats, hunks } from '../../lib/diff';

export default function DiffView({ oldText, newText, maxRows = 300 }: { oldText: string; newText: string; maxRows?: number }) {
  const t = useTheme();
  const [all, setAll] = useState(false);
  const rows = useMemo(() => hunks(diffLines(oldText, newText), 3), [oldText, newText]);
  const st = useMemo(() => diffStats(diffLines(oldText, newText)), [oldText, newText]);
  const shown = all ? rows : rows.slice(0, maxRows);
  return (
    <View style={{ borderWidth: 1, borderColor: t.border, borderRadius: 8, overflow: 'hidden' }}>
      <View style={{ padding: 6, flexDirection: 'row', gap: 10, backgroundColor: t.input }}>
        <Txt size={12} style={{ color: t.ok }}>+{st.added}</Txt><Txt size={12} style={{ color: t.danger }}>-{st.removed}</Txt>
        {!st.added && !st.removed && <Txt size={12} sub>No changes</Txt>}
      </View>
      {shown.map((r, i) => r.t === 'gap' ? (
        <View key={i} style={{ paddingVertical: 2, paddingHorizontal: 8, backgroundColor: t.input }}><Txt size={11} sub>⋯ {r.hidden} unchanged lines</Txt></View>
      ) : (
        <View key={i} style={{ flexDirection: 'row', backgroundColor: r.t === 'add' ? 'rgba(61,220,151,.14)' : r.t === 'del' ? 'rgba(255,93,108,.14)' : 'transparent' }}>
          <Txt size={11} sub style={{ width: 34, textAlign: 'right', paddingRight: 6, fontFamily: 'monospace' }}>{r.t === 'add' ? r.b : r.a}</Txt>
          <Txt size={11} style={{ width: 14, fontFamily: 'monospace', color: r.t === 'add' ? t.ok : r.t === 'del' ? t.danger : t.sub }}>{r.t === 'add' ? '+' : r.t === 'del' ? '-' : ' '}</Txt>
          <Txt size={11} style={{ flex: 1, fontFamily: 'monospace' }}>{r.text || ' '}</Txt>
        </View>
      ))}
      {!all && rows.length > maxRows && <View style={{ padding: 6 }}><Btn small kind="ghost" label={`Show ${rows.length - maxRows} more rows`} onPress={() => setAll(true)} /></View>}
    </View>
  );
}
