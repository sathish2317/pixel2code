// Phone / non-web editor: React Native TextInput (no syntax colors, no gutter). The web build uses CodeEditor.web.tsx.
import React, { useEffect, useRef } from 'react';
import { TextInput } from 'react-native';
import { useTheme } from './ui';
import { CodeEditorProps, lineColOf } from './codeEditorTypes';
import { FONT_STACKS } from '../lib/editorSettings';

export default function CodeEditor(p: CodeEditorProps) {
  const t = useTheme();
  const ref = useRef<React.ElementRef<typeof TextInput>>(null);
  const sel = useRef({ start: 0, end: 0 });
  useEffect(() => {
    if (!p.goTo) return;
    const lines = p.value.split('\n');
    let idx = 0;
    for (let i = 0; i < Math.min(p.goTo.line - 1, lines.length - 1); i++) idx += lines[i].length + 1;
    ref.current?.focus();
    ref.current?.setNativeProps({ selection: { start: idx, end: idx } });
  }, [p.goTo?.nonce]);
  return (
    <TextInput
      ref={ref} multiline value={p.value} editable={!p.readOnly} onChangeText={p.onChange}
      autoCapitalize="none" autoCorrect={false} spellCheck={false} accessibilityLabel={'Code editor for ' + p.path}
      onSelectionChange={(e) => {
        const { start, end } = e.nativeEvent.selection; sel.current = { start, end };
        const a = Math.min(start, end), b = Math.max(start, end);
        const s = lineColOf(p.value, a), e2 = lineColOf(p.value, b);
        p.onSelection?.({ start: a, end: b, text: p.value.slice(a, b), startLine: s.line, endLine: e2.line, line: s.line, col: s.col });
      }}
      style={{ flex: 1, minHeight: 320, textAlignVertical: 'top', color: p.chrome === 'vscode' ? (p.settings.theme === 'dark' ? '#d4d4d4' : '#333333') : t.text, backgroundColor: p.chrome === 'vscode' ? (p.settings.theme === 'dark' ? '#1e1e1e' : '#ffffff') : t.input, borderColor: t.border, borderWidth: p.chrome === 'vscode' ? 0 : 1, borderRadius: p.chrome === 'vscode' ? 0 : 10, padding: 10,
        fontSize: p.settings.fontSize, lineHeight: Math.round(p.settings.fontSize * p.settings.lineHeight), fontFamily: 'monospace' }}
    />
  );
}
void FONT_STACKS;