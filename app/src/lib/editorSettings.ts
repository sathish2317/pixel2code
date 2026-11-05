// Editor preferences (persisted separately from projects, see storage.ts).
export interface EditorSettings {
  fontSize: number;
  fontFamily: 'system-mono' | 'fira-code' | 'jetbrains-mono' | 'consolas';
  lineHeight: number;      // multiplier, 1.2 - 2.2
  tabSize: 2 | 4 | 8;
  wordWrap: boolean;
  theme: 'dark' | 'light';
  autoSave: boolean;
  previewDebounce: number; // ms before the live preview refreshes after typing
  engine: 'builtin' | 'monaco';
  minimap: boolean;
}
export const defaultEditorSettings: EditorSettings = {
  fontSize: 13, fontFamily: 'system-mono', lineHeight: 1.55, tabSize: 2, wordWrap: false, theme: 'dark', autoSave: true, previewDebounce: 400, engine: 'builtin', minimap: false,
};
export const FONT_STACKS: Record<EditorSettings['fontFamily'], string> = {
  'system-mono': "ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace",
  'fira-code': "'Fira Code', ui-monospace, Menlo, Consolas, monospace",
  'jetbrains-mono': "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
  consolas: "Consolas, 'Courier New', monospace",
};
const clamp = (n: unknown, lo: number, hi: number, d: number) => (typeof n === 'number' && isFinite(n) ? Math.min(hi, Math.max(lo, n)) : d);
/** Accepts anything read back from storage and returns valid settings (bad/old values fall back to defaults). */
export function sanitizeEditorSettings(x: any): EditorSettings {
  const d = defaultEditorSettings;
  x = x && typeof x === 'object' ? x : {};
  return {
    fontSize: clamp(x.fontSize, 9, 28, d.fontSize), lineHeight: clamp(x.lineHeight, 1.1, 2.4, d.lineHeight),
    fontFamily: x.fontFamily in FONT_STACKS ? x.fontFamily : d.fontFamily, tabSize: [2, 4, 8].includes(x.tabSize) ? x.tabSize : d.tabSize,
    wordWrap: typeof x.wordWrap === 'boolean' ? x.wordWrap : d.wordWrap, theme: x.theme === 'light' ? 'light' : 'dark',
    autoSave: typeof x.autoSave === 'boolean' ? x.autoSave : d.autoSave, previewDebounce: clamp(x.previewDebounce, 0, 3000, d.previewDebounce),
    engine: x.engine === 'monaco' ? 'monaco' : 'builtin', minimap: !!x.minimap,
  };
}
