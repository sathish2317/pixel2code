import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../ui';
import ProposalView, { Proposal } from './ProposalView';
import { CodeAction, CodeResult, codeAction } from '../../api';
import { ChatTurn, uid } from '../../types';
import { diagnoseAll } from '../../lib/diagnostics';
import { stripManaged } from '../../lib/managed';
import { languageName } from '../../lib/langs';
import { WBCtx } from './types';

const ACTIONS: [CodeAction, string][] = [['explain', 'Explain'], ['generate', 'Generate'], ['refactor', 'Refactor'], ['fix', 'Fix errors'], ['review', 'Review'], ['tests', 'Write tests']];

// One-tap prompts. Each maps onto one of the six server actions with a ready-made instruction.
export const QUICK: { label: string; action: CodeAction; text: string }[] = [
  { label: 'Accessibility', action: 'refactor', text: 'Improve accessibility (semantic tags, labels, alt text, focus states, contrast, keyboard use) without changing the visual design.' },
  { label: 'Performance', action: 'refactor', text: 'Improve performance (reduce layout shifts, lazy-load images, avoid heavy scripts, tidy CSS) without changing behaviour.' },
  { label: 'SEO', action: 'refactor', text: 'Improve SEO (title, meta description, headings order, Open Graph tags, semantic markup, image alt text) without changing the design.' },
  { label: 'Responsive', action: 'refactor', text: 'Make this fully responsive for phone, tablet and desktop. Keep the desktop look the same.' },
  { label: 'HTML/CSS → React', action: 'generate', text: 'Convert the attached HTML/CSS into React function components (JSX) with one CSS file per component. Keep the same look and behaviour.' },
  { label: 'Reusable component', action: 'generate', text: 'Extract the selected/current markup into a reusable, well-named component with props. Show how to use it.' },
  { label: 'Comments & docs', action: 'refactor', text: 'Add meaningful comments and short documentation (JSDoc/docstrings). Do NOT change any code logic.' },
  { label: 'Security check', action: 'review', text: 'Look for security problems: injection, XSS, unsafe auth, secrets in code, unsafe file handling, missing validation.' },
  { label: 'Backend API', action: 'generate', text: 'Generate a small REST API (routes, controller, validation, error handling) for the feature described by the current files.' },
  { label: 'Database schema', action: 'generate', text: 'Generate a database schema (SQL) with keys, indexes and sample queries for the data used in the current files.' },
  { label: 'Auth example', action: 'generate', text: 'Generate a secure login/registration example (password hashing, sessions or JWT, validation). Explain each step.' },
  { label: 'Teach me this backend', action: 'explain', text: 'Explain this backend code step by step like a tutor, so I can learn while implementing it.' },
];

const limitChars = 60_000;

export default function AssistantPanel(ctx: WBCtx & { initial?: { action: CodeAction; text: string; run?: boolean; nonce: number } | null; onApplied: (before: typeof ctx.files) => void }) {
  const t = useTheme();
  const [action, setAction] = useState<CodeAction>(ctx.initial?.action ?? 'explain');
  const [text, setText] = useState(ctx.initial?.text ?? '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<CodeResult | null>(null);
  const [useSel, setUseSel] = useState(true);
  const lastNonce = React.useRef(0);

  // context: selected files (+ attached-only files) or the current file (+ the rest of the project when it is small)
  const clean = useMemo(() => stripManaged(ctx.files), [ctx.files]); // generated font/animation blocks are managed by the Design tab, not sent to the AI
  const context = useMemo(() => {
    const byPath = new Map(clean.map((f) => [f.path, f]));
    let list = ctx.contextPaths.map((p) => byPath.get(p)).filter(Boolean) as typeof ctx.files;
    if (!list.length) {
      const cur = byPath.get(ctx.current);
      const total = clean.reduce((n, f) => n + f.content.length, 0);
      list = total <= limitChars ? clean : cur ? [cur] : [];
    }
    return [...list, ...ctx.extraContext.map((f) => ({ path: 'attached/' + f.path.replace(/^attached\//, ''), content: f.content }))];
  }, [clean, ctx.contextPaths, ctx.current, ctx.extraContext]);
  const ctxChars = context.reduce((n, f) => n + f.content.length, 0);
  const selection = useSel && ctx.selection && ctx.selection.text.trim() ? ctx.selection : null;

  const run = async (a = action, instruction = text) => {
    if (a === 'generate' && !instruction.trim()) { setErr('Describe what to generate first.'); return; }
    setBusy(true); setErr(''); setRes(null);
    try {
      const diags = diagnoseAll(ctx.files).filter((d) => d.severity === 'error').slice(0, 30).map((d) => ({ path: d.path, line: d.line, message: d.message }));
      const out = await codeAction(ctx.server, a, {
        files: context, instruction: instruction.trim() || undefined, selection: selection ? { path: selection.path, text: selection.text, startLine: selection.startLine, endLine: selection.endLine } : undefined,
        diagnostics: a === 'fix' ? diags : undefined, instructions: ctx.project.instructions.filter((i) => i.enabled).map((i) => i.text), language: languageName(ctx.current),
      });
      setRes(out);
      const turn: ChatTurn = { id: uid(), at: Date.now(), action: a, instruction: instruction.trim() || `(${a})`, summary: (out.explanation || out.notes || '').slice(0, 280), files: out.files.map((f) => ({ path: f.path, status: f.status })), applied: false };
      ctx.patchProject({ chat: [...(ctx.project.chat ?? []), turn].slice(-100) });
    } catch (e: any) {
      setErr(e.quota ? `AI quota reached.${e.retryAfterSec ? ` Retry in ${e.retryAfterSec}s.` : ' Wait a minute.'} (${e.message})` : e.unconfigured ? `AI is not configured on the server: ${e.message}` : e.message || 'Request failed.');
    } finally { setBusy(false); }
  };

  React.useEffect(() => {
    const i = ctx.initial;
    if (!i || i.nonce === lastNonce.current) return;
    lastNonce.current = i.nonce; setAction(i.action); setText(i.text);
    if (i.run) run(i.action, i.text);
  }, [ctx.initial?.nonce]);

  const proposal: Proposal | null = res && {
    title: ACTIONS.find(([a]) => a === res.action)![1] + ' — result', explanation: res.explanation, files: res.files, issues: res.issues, dependencies: res.dependencies, notes: res.notes, warnings: res.warnings, disclaimer: res.disclaimer,
  };

  return (
    <View style={{ gap: 8 }}>
      <View style={row}>{ACTIONS.map(([a, l]) => <Chip key={a} label={l} active={action === a} onPress={() => setAction(a)} />)}</View>
      <View style={row}>{QUICK.map((q) => <Chip key={q.label} label={q.label} onPress={() => { setAction(q.action); setText(q.text); }} />)}</View>
      <Card style={{ gap: 4 }}>
        <Txt size={12} sub>Context sent to the AI: {context.length} file{context.length === 1 ? '' : 's'} ({Math.round(ctxChars / 1000)}K chars)
          {ctx.contextPaths.length ? ' — the files you ticked in the explorer' : ctxChars > limitChars ? ' — current file only (project is large; tick files in the explorer to add more)' : ' — whole project'}
          {ctx.extraContext.length ? ` + ${ctx.extraContext.length} attached` : ''}</Txt>
        {ctx.selection && ctx.selection.text.trim() ? (
          <View style={row}><Chip label={useSel ? `Selected code: lines ${ctx.selection.startLine}-${ctx.selection.endLine} (on)` : 'Selected code (off)'} active={useSel} onPress={() => setUseSel(!useSel)} /></View>
        ) : <Txt size={12} sub>Tip: select code in the editor to work on just that part.</Txt>}
        {ctx.extraContext.length > 0 && <View style={row}>{ctx.extraContext.map((f) => <Chip key={f.path} label={'✕ ' + f.path} onPress={() => ctx.setExtraContext(ctx.extraContext.filter((x) => x.path !== f.path))} />)}</View>}
      </Card>
      <Input multiline value={text} onChangeText={setText} style={{ minHeight: 80 }}
        placeholder={action === 'generate' ? 'Describe what to build, e.g. "a pricing section with a monthly/yearly toggle"' : 'Optional: tell the AI what to focus on…'} />
      <Btn label={busy ? 'Working…' : ACTIONS.find(([a]) => a === action)![1]} onPress={() => run()} disabled={busy} />
      {!!err && <Card><Txt style={{ color: t.danger }}>{err}</Txt></Card>}
      {proposal && res && (
        <ProposalView proposal={proposal} current={clean} onOpen={ctx.openFile} onReject={() => setRes(null)}
          onApply={(next, created, modified) => {
            const before = ctx.files;
            ctx.applyFiles(next, 'AI ' + res.action);
            ctx.onApplied(before);
            const last = ctx.project.chat?.[ctx.project.chat.length - 1];
            if (last) ctx.patchProject({ chat: ctx.project.chat!.map((c) => (c.id === last.id ? { ...c, applied: true } : c)) });
            ctx.toast(`Applied: ${created.length} new, ${modified.length} modified. Snapshot saved in Versions.`);
            setRes(null);
          }} />
      )}
      {!!ctx.project.chat?.length && (
        <Card style={{ gap: 4 }}>
          <View style={row}><Txt bold size={13}>Project chat history</Txt><Btn small kind="ghost" label="Clear" onPress={() => ctx.patchProject({ chat: [] })} /></View>
          {[...ctx.project.chat].reverse().slice(0, 12).map((c) => (
            <View key={c.id} style={{ gap: 1, paddingVertical: 3, borderTopWidth: 1, borderColor: t.border }}>
              <Txt size={12} bold>{c.action} {c.applied ? '· applied' : ''} <Txt size={11} sub>{new Date(c.at).toLocaleString()}</Txt></Txt>
              <Txt size={12} sub numberOfLines={2}>{c.instruction}</Txt>
              {!!c.summary && <Txt size={12} numberOfLines={3}>{c.summary}</Txt>}
              <Btn small kind="ghost" label="Use this prompt again" onPress={() => { setAction(c.action as CodeAction); setText(c.instruction); }} />
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
