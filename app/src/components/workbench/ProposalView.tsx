import React, { useState } from 'react';
import { View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Btn, Card, Chip, Txt, row, useTheme } from '../ui';
import DiffView from './DiffView';
import { Issue, ProposedFile } from '../../api';
import { ProjectFile } from '../../types';
import { confirmAction } from '../../lib/confirm';
import { checkFileKind } from '../../lib/langs';

export interface Proposal {
  title: string;
  explanation?: string;
  files: ProposedFile[];
  issues?: Issue[];
  dependencies?: { name: string; reason: string }[];
  notes?: string;
  warnings?: string[];
  disclaimer?: string;
}

const SEV: Record<string, string> = { critical: '#ff3b57', high: '#ff7a45', medium: '#f5a524', low: '#5aa9ff', info: '#9aa1c2' };

/** Proposed AI changes. NOTHING is applied until the user presses "Apply selected". Overwrites show a diff and need a confirmation. */
export default function ProposalView(props: {
  proposal: Proposal; current: ProjectFile[];
  onApply: (next: ProjectFile[], created: string[], modified: string[]) => void; onReject: () => void; onOpen?: (path: string, line?: number) => void;
}) {
  const t = useTheme();
  const { proposal: p, current } = props;
  const changed = p.files.filter((f) => f.status !== 'unchanged');
  const [sel, setSel] = useState<Record<string, boolean>>(() => Object.fromEntries(changed.map((f) => [f.path, true])));
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const old = (path: string) => current.find((f) => f.path === path)?.content ?? '';
  const chosen = changed.filter((f) => sel[f.path]);

  const apply = () => {
    // validate once more on the device: never trust a response blindly
    const bad = chosen.find((f) => checkFileKind(f.path, f.content.length).problem);
    if (bad) { confirmAction('File not allowed', `${bad.path}: ${checkFileKind(bad.path, bad.content.length).reason}`, 'OK', () => {}); return; }
    const run = () => {
      const map = new Map(current.map((f) => [f.path, f]));
      for (const f of chosen) map.set(f.path, { path: f.path, content: f.content });
      props.onApply([...map.values()], chosen.filter((f) => f.status === 'new').map((f) => f.path), chosen.filter((f) => f.status === 'modified').map((f) => f.path));
    };
    const mod = chosen.filter((f) => f.status === 'modified');
    if (mod.length) confirmAction('Overwrite existing files?', `${mod.map((f) => f.path).join(', ')} will be replaced by the AI version. A snapshot is saved first, so you can restore it from Versions.\n\nAI code can be wrong or insecure. Review the diff before accepting.`, 'Apply changes', run);
    else run();
  };

  return (
    <Card style={{ gap: 8 }}>
      <Txt bold size={15}>{p.title}</Txt>
      {!!p.explanation && <Txt size={13}>{p.explanation}</Txt>}
      {!!p.warnings?.length && p.warnings.map((w, i) => <Txt key={i} size={12} style={{ color: '#f5a524' }}>⚠ {w}</Txt>)}

      {!!p.issues?.length && (
        <View style={{ gap: 4 }}>
          <Txt bold size={13}>Issues, highest priority first</Txt>
          {p.issues.map((i, k) => (
            <View key={k} style={{ borderLeftWidth: 3, borderLeftColor: SEV[i.severity], paddingLeft: 8, paddingVertical: 2 }}>
              <Txt size={12}><Txt bold size={12} style={{ color: SEV[i.severity] }}>{i.severity.toUpperCase()}</Txt>  {i.message}</Txt>
              {!!i.path && <Txt size={11} sub onPress={() => props.onOpen?.(i.path, i.line)} style={{ textDecorationLine: props.onOpen ? 'underline' : 'none' } as any}>{i.path}{i.line ? ':' + i.line : ''}</Txt>}
              {!!i.fix && <Txt size={12} sub>Fix: {i.fix}</Txt>}
            </View>
          ))}
        </View>
      )}

      {changed.length > 0 && (
        <View style={{ gap: 6 }}>
          <Txt bold size={13}>{changed.filter((f) => f.status === 'new').length} new · {changed.filter((f) => f.status === 'modified').length} modified</Txt>
          {changed.map((f) => (
            <View key={f.path} style={{ gap: 4 }}>
              <View style={row}>
                <Chip label={(sel[f.path] ? '☑ ' : '☐ ') + f.path} active={!!sel[f.path]} onPress={() => setSel({ ...sel, [f.path]: !sel[f.path] })} />
                <Txt size={11} style={{ color: f.status === 'new' ? t.ok : '#f5a524', fontWeight: '700' }}>{f.status === 'new' ? 'NEW' : 'MODIFIED'}</Txt>
                <Btn small kind="ghost" label={open[f.path] ? 'Hide diff' : 'Show diff'} onPress={() => setOpen({ ...open, [f.path]: !open[f.path] })} />
              </View>
              {open[f.path] && <DiffView oldText={old(f.path)} newText={f.content} />}
            </View>
          ))}
        </View>
      )}
      {p.files.some((f) => f.status === 'unchanged') && <Txt size={12} sub>Unchanged by the AI: {p.files.filter((f) => f.status === 'unchanged').map((f) => f.path).join(', ')}</Txt>}

      {!!p.dependencies?.length && (
        <View style={{ gap: 2 }}>
          <Txt bold size={13}>Suggested packages (NOT installed automatically)</Txt>
          {p.dependencies.map((d, i) => <Txt key={i} size={12} sub>• {d.name}{d.reason ? ' — ' + d.reason : ''}</Txt>)}
          <Btn small kind="ghost" label="Copy npm install command" onPress={() => Clipboard.setStringAsync('npm install ' + p.dependencies!.map((d) => d.name).join(' '))} />
        </View>
      )}
      {!!p.notes && <Txt size={12} sub>{p.notes}</Txt>}
      {!!p.disclaimer && <Txt size={11} sub>{p.disclaimer}</Txt>}

      {changed.length > 0 ? (
        <View style={row}>
          <Btn small label={`Apply ${chosen.length} file${chosen.length === 1 ? '' : 's'}`} disabled={!chosen.length} onPress={apply} />
          <Btn small kind="danger" label="Reject" onPress={props.onReject} />
        </View>
      ) : <Btn small kind="ghost" label="Dismiss" onPress={props.onReject} />}
    </Card>
  );
}
