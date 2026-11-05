// Built-in web editor: a real <textarea> (native undo/redo, copy/paste, IME, selection) with a syntax-colored layer behind it,
// line-number gutter, auto-indent, bracket auto-close, Tab indent, comment toggle, line move/duplicate and shortcuts.
// Multi-cursor, folding and IntelliSense need Monaco: switch "Editor engine" to Monaco in the editor settings.
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { CodeEditorProps, SelectionInfo, lineColOf } from './codeEditorTypes';
import { FONT_STACKS } from '../lib/editorSettings';
import { highlight, highlightCss } from '../lib/highlight';
import { commentStyle } from '../lib/langs';

// Keep the web editor dependency-free: the built-in editor is always available.
// Monaco is not a declared project dependency, so do not statically bundle its optional module.

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSE = new Set([')', ']', '}', '"', "'", '`']);
const isWord = (c: string | undefined) => !!c && /[\w$]/.test(c);

function Builtin(p: CodeEditorProps) {
  const ta = useRef<HTMLTextAreaElement>(null);
  const pre = useRef<HTMLDivElement>(null);
  const gut = useRef<HTMLDivElement>(null);
  const [cw, setCw] = useState(0);
  const s = p.settings, vs = p.chrome === 'vscode', dark = s.theme === 'dark';
  const lh = Math.round(s.fontSize * s.lineHeight * 100) / 100;
  const font = FONT_STACKS[s.fontFamily];
  const pad = 10;
  const html = useMemo(() => highlight(p.value, p.language) + '\n ', [p.value, p.language]);
  const lines = useMemo(() => p.value.split('\n').length, [p.value]);
  const showGutter = !s.wordWrap;
  const marks = useMemo(() => { const m = new Map<number, 'error' | 'warning' | 'info'>(); for (const d of p.markers || []) { const cur = m.get(d.line); if (!cur || d.severity === 'error' || (d.severity === 'warning' && cur === 'info')) m.set(d.line, d.severity); } return m; }, [p.markers]);

  // Keep the colored layer exactly as wide as the textarea's text area (a visible scrollbar would otherwise change the wrapping).
  useLayoutEffect(() => {
    const el = ta.current; if (!el) return;
    const measure = () => setCw(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, [s.wordWrap, s.fontSize, p.path]);

  const syncScroll = () => {
    const el = ta.current; if (!el) return;
    if (pre.current) pre.current.style.transform = `translate(${-el.scrollLeft}px, ${-el.scrollTop}px)`;
    if (gut.current) gut.current.scrollTop = el.scrollTop;
  };
  useEffect(syncScroll, [p.value, s.fontSize, s.lineHeight, s.wordWrap]);

  const report = () => {
    const el = ta.current; if (!el || !p.onSelection) return;
    const a = Math.min(el.selectionStart, el.selectionEnd), b = Math.max(el.selectionStart, el.selectionEnd);
    const st = lineColOf(el.value, a), en = lineColOf(el.value, b);
    const info: SelectionInfo = { start: a, end: b, text: el.value.slice(a, b), startLine: st.line, endLine: en.line, line: st.line, col: st.col };
    p.onSelection(info);
  };

  useEffect(() => {
    if (!p.goTo || !ta.current) return;
    const el = ta.current;
    const ls = el.value.split('\n');
    const line = Math.max(1, Math.min(p.goTo.line, ls.length));
    let idx = 0; for (let i = 0; i < line - 1; i++) idx += ls[i].length + 1;
    const col = Math.min((p.goTo.col ?? 1) - 1, ls[line - 1].length);
    el.focus(); el.setSelectionRange(idx + col, idx + col + 0);
    el.scrollTop = Math.max(0, (line - 1) * lh - el.clientHeight / 3);
    syncScroll(); report();
  }, [p.goTo?.nonce]);
  useEffect(() => { if (p.focusNonce) ta.current?.focus(); }, [p.focusNonce]);

  // Replace a range through execCommand so the browser's own undo stack keeps working (falls back to setRangeText).
  const edit = (from: number, to: number, text: string, selStart: number, selEnd = selStart) => {
    const el = ta.current!;
    el.focus(); el.setSelectionRange(from, to);
    let ok = false;
    try { ok = document.execCommand('insertText', false, text); } catch {}
    if (!ok || el.value.slice(from, from + text.length) !== text) { el.setRangeText(text, from, to, 'end'); p.onChange(el.value); }
    el.setSelectionRange(selStart, selEnd);
    report();
  };
  const lineRange = (el: HTMLTextAreaElement) => {
    const v = el.value, a = el.selectionStart;
    let b = el.selectionEnd; if (b > a && v[b - 1] === '\n') b--;
    const from = v.lastIndexOf('\n', a - 1) + 1; let to = v.indexOf('\n', b); if (to < 0) to = v.length;
    return { from, to };
  };
  const indentUnit = ' '.repeat(s.tabSize);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = ta.current!, v = el.value, a = el.selectionStart, b = el.selectionEnd;
    const mod = e.ctrlKey || e.metaKey, k = e.key;
    if (p.readOnly) return;
    if (mod && !e.shiftKey && !e.altKey && k.toLowerCase() === 's') { e.preventDefault(); e.stopPropagation(); p.onSave?.(); return; }
    if (mod && !e.altKey && k.toLowerCase() === 'f' && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); p.onFind?.(false); return; }
    if (mod && !e.altKey && k.toLowerCase() === 'h') { e.preventDefault(); e.stopPropagation(); p.onFind?.(true); return; }
    if (mod && !e.altKey && k.toLowerCase() === 'g') { e.preventDefault(); e.stopPropagation(); p.onGoToLine?.(); return; }
    if (e.shiftKey && e.altKey && k.toLowerCase() === 'f') { e.preventDefault(); e.stopPropagation(); p.onFormat?.(); return; }

    if (mod && k === '/') { // toggle comment on the selected lines
      e.preventDefault();
      const cs = commentStyle(p.language); const { from, to } = lineRange(el); const block = v.slice(from, to); const ls = block.split('\n');
      let out: string[];
      if (cs.line) {
        const all = ls.every((l) => !l.trim() || l.trimStart().startsWith(cs.line!));
        out = ls.map((l) => (!l.trim() ? l : all ? l.replace(new RegExp('^(\\s*)' + cs.line!.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + ' ?'), '$1') : l.replace(/^(\s*)/, '$1' + cs.line + ' ')));
      } else if (cs.block) {
        const [o, c] = cs.block; const t = block.trim();
        out = [t.startsWith(o) && t.endsWith(c) ? block.replace(o + ' ', '').replace(o, '').replace(' ' + c, '').replace(c, '') : o + ' ' + block + ' ' + c];
      } else return;
      const text = out.join('\n'); edit(from, to, text, from, from + text.length); return;
    }
    if (e.altKey && !mod && (k === 'ArrowUp' || k === 'ArrowDown')) { // move line(s); with Shift: copy line(s)
      e.preventDefault();
      const { from, to } = lineRange(el); const block = v.slice(from, to);
      if (e.shiftKey) { edit(k === 'ArrowDown' ? to : from, k === 'ArrowDown' ? to : from, k === 'ArrowDown' ? '\n' + block : block + '\n', a + (k === 'ArrowDown' ? block.length + 1 : 0), b + (k === 'ArrowDown' ? block.length + 1 : 0)); return; }
      if (k === 'ArrowUp' && from > 0) { const ps = v.lastIndexOf('\n', from - 2) + 1; const prev = v.slice(ps, from - 1); edit(ps, to, block + '\n' + prev, a - prev.length - 1, b - prev.length - 1); }
      if (k === 'ArrowDown' && to < v.length) { const ne = v.indexOf('\n', to + 1) < 0 ? v.length : v.indexOf('\n', to + 1); const next = v.slice(to + 1, ne); edit(from, ne, next + '\n' + block, a + next.length + 1, b + next.length + 1); }
      return;
    }
    if (k === 'Tab' && !mod) {
      e.preventDefault();
      if (a === b && !e.shiftKey) { edit(a, b, indentUnit, a + indentUnit.length); return; }
      const { from, to } = lineRange(el); const ls = v.slice(from, to).split('\n');
      const out = ls.map((l) => (e.shiftKey ? l.replace(new RegExp('^( {1,' + s.tabSize + '}|\\t)'), '') : indentUnit + l));
      const text = out.join('\n'); edit(from, to, text, Math.max(from, a + (out[0].length - ls[0].length)), b + (text.length - (to - from))); return;
    }
    if (k === 'Enter' && !mod && !e.shiftKey) {
      const ls = v.lastIndexOf('\n', a - 1) + 1; const lineStart = v.slice(ls, a); const ind = /^[ \t]*/.exec(lineStart)![0];
      const prev = v[a - 1], next = v[b];
      const opens = prev === '{' || prev === '(' || prev === '[';
      if (opens && next && PAIRS[prev] === next) { e.preventDefault(); const ins = '\n' + ind + indentUnit + '\n' + ind; edit(a, b, ins, a + 1 + ind.length + indentUnit.length); return; }
      if (ind || opens) { e.preventDefault(); const extra = opens || (/>\s*$/.test(lineStart) && p.language === 'html' && /<(div|section|ul|ol|nav|header|footer|main|article|form|table|tr|body|head|html)\b[^>]*>$/i.test(lineStart.trim())) ? indentUnit : ''; edit(a, b, '\n' + ind + extra, a + 1 + ind.length + extra.length); return; }
      return;
    }
    if (!mod && !e.altKey && k.length === 1) {
      if (CLOSE.has(k) && a === b && v[a] === k && (k !== '"' && k !== "'" && k !== '`' ? true : true)) { e.preventDefault(); el.setSelectionRange(a + 1, a + 1); report(); return; } // type over the closing char
      if (PAIRS[k]) {
        const quote = k === '"' || k === "'" || k === '`';
        if (a !== b) { e.preventDefault(); edit(a, b, k + v.slice(a, b) + PAIRS[k], a + 1, b + 1); return; }
        if (quote && (isWord(v[a - 1]) || isWord(v[a]))) return; // apostrophes in words (don't) and quotes before words stay single
        if (!quote && isWord(v[a])) return;
        if (p.language === 'plaintext' || p.language === 'markdown') return;
        e.preventDefault(); edit(a, b, k + PAIRS[k], a + 1); return;
      }
    }
    if (k === 'Backspace' && a === b && a > 0 && PAIRS[v[a - 1]] && PAIRS[v[a - 1]] === v[a] && !mod) { e.preventDefault(); edit(a - 1, a + 1, '', a - 1); return; }
  };

  const colors = vs ? (dark ? { bg: '#1e1e1e', fg: '#d4d4d4', gut: '#858585', gutBg: '#1e1e1e', sel: '#264f78', border: '#2b2b2b' } : { bg: '#ffffff', fg: '#333333', gut: '#237893', gutBg: '#ffffff', sel: '#add6ff', border: '#e5e5e5' }) : dark ? { bg: '#0d1020', fg: '#e6e9f5', gut: '#5b6485', gutBg: '#0a0d1a', sel: '#6c8cff55', border: '#2a3050' } : { bg: '#ffffff', fg: '#1b1f33', gut: '#9aa1bd', gutBg: '#f3f4fa', sel: '#3b5bdb33', border: '#dfe2f0' };
  const common: React.CSSProperties = { fontFamily: font, fontSize: s.fontSize, lineHeight: lh + 'px', tabSize: s.tabSize, padding: pad, margin: 0, boxSizing: 'border-box', letterSpacing: 'normal', fontVariantLigatures: 'none' };
  const wrapCss: React.CSSProperties = s.wordWrap ? { whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'normal' } : { whiteSpace: 'pre', overflowWrap: 'normal' };

  return (
    <div className={dark ? 'p2c-dark' : 'p2c-light'} style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', background: colors.bg, border: vs ? 0 : `1px solid ${colors.border}`, borderRadius: vs ? 0 : 10, overflow: 'hidden', position: 'relative' }}>
      <style>{highlightCss(dark, vs) + `.p2c-ta::selection{background:${colors.sel}} .p2c-ta{caret-color:${colors.fg}} .p2c-ta::-webkit-scrollbar{width:12px;height:12px} .p2c-ta::-webkit-scrollbar-thumb{background:${vs ? (dark ? '#424242' : '#c1c1c1') : dark ? '#2a3050' : '#cfd3e6'};border-radius:${vs ? 0 : 6}px}`}</style>
      {showGutter && (
        <div ref={gut} aria-hidden style={{ ...common, width: Math.max(3, String(lines).length) * (s.fontSize * 0.62) + 22, padding: `${pad}px 8px ${pad}px 4px`, textAlign: 'right', color: colors.gut, background: colors.gutBg, overflow: 'hidden', userSelect: 'none', flexShrink: 0, borderRight: vs ? 0 : `1px solid ${colors.border}` }}>
          {Array.from({ length: lines }, (_, i) => {
            const m = marks.get(i + 1);
            return <div key={i} title={m ? (p.markers || []).filter((d) => d.line === i + 1).map((d) => d.message).join('\n') : undefined} style={{ height: lh, color: m === 'error' ? '#ff5d6c' : m === 'warning' ? '#f5a524' : m === 'info' ? '#5aa9ff' : undefined, fontWeight: m ? 700 : 400 }}>{i + 1}</div>;
          })}
          <div style={{ height: 40 }} />
        </div>
      )}
      <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <div ref={pre} style={{ ...common, ...wrapCss, color: colors.fg, width: s.wordWrap && cw ? cw : undefined, minWidth: s.wordWrap ? undefined : '100%', willChange: 'transform' }} dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <textarea
          ref={ta} className="p2c-ta" value={p.value} readOnly={p.readOnly} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" wrap={s.wordWrap ? 'soft' : 'off'}
          aria-label={'Code editor for ' + p.path}
          onChange={(e) => p.onChange(e.target.value)} onScroll={syncScroll} onKeyDown={onKeyDown} onKeyUp={report} onMouseUp={report} onSelect={report} onFocus={report}
          style={{ ...common, ...wrapCss, position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'transparent', background: 'transparent', border: 0, outline: 'none', resize: 'none', overflow: 'auto' }}
        />
      </div>
    </div>
  );
}

export default function CodeEditor(p: CodeEditorProps) {
  // Use the native textarea editor unless Monaco is explicitly added as a dependency.
  // This prevents a missing optional package from breaking the complete web bundle.
  return <Builtin {...p} />;
}