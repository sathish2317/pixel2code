import { Diagnostic } from '../lib/diagnostics';
import { EditorSettings } from '../lib/editorSettings';

export interface SelectionInfo { start: number; end: number; text: string; startLine: number; endLine: number; line: number; col: number }

export interface CodeEditorProps {
  path: string;
  value: string;
  language: string;
  settings: EditorSettings;
  onChange: (v: string) => void;
  onSelection?: (s: SelectionInfo) => void;
  /** Move the caret to a line (change `nonce` to jump again to the same line). */
  goTo?: { line: number; col?: number; nonce: number } | null;
  markers?: Diagnostic[];
  readOnly?: boolean;
  onSave?: () => void;
  onFind?: (replace: boolean) => void;
  onGoToLine?: () => void;
  onFormat?: () => void;
  focusNonce?: number;
  /** 'vscode' = flat VS Code Dark+ look (no rounded border, #1e1e1e background, VS Code token colors). */
  chrome?: 'vscode';
}

export const lineColOf = (text: string, index: number) => {
  const before = text.slice(0, index);
  const line = before.split('\n').length;
  return { line, col: index - (before.lastIndexOf('\n') + 1) + 1 };
};