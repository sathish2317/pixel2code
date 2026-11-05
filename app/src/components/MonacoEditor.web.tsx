// Optional engine: Monaco (the editor of VS Code) through @monaco-editor/react.
// It loads Monaco's files from the jsDelivr CDN the first time, so it needs internet. If it cannot load, CodeEditor.web.tsx
// falls back to the built-in editor automatically (timeout below), so the editor never stays blank.
import React, { useEffect, useRef, useState } from 'react';
import Editor, { loader, OnMount } from '@monaco-editor/react';
import { CodeEditorProps, lineColOf } from './codeEditorTypes';
import { FONT_STACKS } from '../lib/editorSettings';

loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' } });

export default function MonacoEditor(p: CodeEditorProps) {
  const ed = useRef<any>(null);
  const mon = useRef<any>(null);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const cbs = useRef(p); cbs.current = p;

  useEffect(() => { const t = setTimeout(() => { if (!ed.current) setFailed(true); }, 12000); return () => clearTimeout(t); }, []);
  if (failed) throw new Error('Monaco did not load'); // caught by the boundary in CodeEditor.web.tsx -> built-in editor

  const onMount: OnMount = (editor, monaco) => {
    ed.current = editor; mon.current = monaco; setReady(true);
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => cbs.current.onSave?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG, () => cbs.current.onGoToLine?.());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => cbs.current.onFind?.(false));
    editor.onDidChangeCursorSelection(() => {
      const m = editor.getModel(); const s = editor.getSelection(); if (!m || !s) return;
      const a = m.getOffsetAt({ lineNumber: s.startLineNumber, column: s.startColumn }), b = m.getOffsetAt({ lineNumber: s.endLineNumber, column: s.endColumn });
      cbs.current.onSelection?.({ start: Math.min(a, b), end: Math.max(a, b), text: m.getValueInRange(s), startLine: s.startLineNumber, endLine: s.endLineNumber, line: s.startLineNumber, col: s.startColumn });
    });
  };

  useEffect(() => { // our diagnostics as Monaco squiggles
    if (!ready) return;
    const m = ed.current.getModel(); if (!m) return;
    const sev = mon.current.MarkerSeverity;
    mon.current.editor.setModelMarkers(m, 'pixel2code', (p.markers || []).filter((d) => d.line <= m.getLineCount()).map((d) => ({
      startLineNumber: d.line, endLineNumber: d.line, startColumn: d.col || 1, endColumn: (d.col || 1) + 1, message: d.message,
      severity: d.severity === 'error' ? sev.Error : d.severity === 'warning' ? sev.Warning : sev.Info,
    })));
  }, [p.markers, ready, p.value]);

  useEffect(() => {
    if (!ready || !p.goTo) return;
    ed.current.revealLineInCenter(p.goTo.line); ed.current.setPosition({ lineNumber: p.goTo.line, column: p.goTo.col || 1 }); ed.current.focus();
  }, [p.goTo?.nonce, ready]);

  void lineColOf;
  return (
    <div style={{ flex: 1, minHeight: 0, height: '100%', border: '1px solid ' + (p.settings.theme === 'dark' ? '#2a3050' : '#dfe2f0'), borderRadius: 10, overflow: 'hidden' }}>
      <Editor
        path={p.path} language={p.language} value={p.value} theme={p.settings.theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={(v) => p.onChange(v ?? '')} onMount={onMount} loading={<div style={{ padding: 12, color: '#9aa1c2', font: '13px sans-serif' }}>Loading Monaco…</div>}
        options={{
          fontSize: p.settings.fontSize, fontFamily: FONT_STACKS[p.settings.fontFamily], lineHeight: Math.round(p.settings.fontSize * p.settings.lineHeight),
          tabSize: p.settings.tabSize, wordWrap: p.settings.wordWrap ? 'on' : 'off', minimap: { enabled: p.settings.minimap }, readOnly: p.readOnly,
          automaticLayout: true, scrollBeyondLastLine: false, folding: true, bracketPairColorization: { enabled: true }, multiCursorModifier: 'alt',
          fontLigatures: false, renderWhitespace: 'selection', smoothScrolling: true,
        }}
      />
    </div>
  );
}
