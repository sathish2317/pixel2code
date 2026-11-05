import { Project, ProjectFile } from '../../types';
import { Settings } from '../../storage';
import { EditorSettings } from '../../lib/editorSettings';

/** Everything the Workbench panels need from the Editor screen. */
export interface WBCtx {
  project: Project;
  files: ProjectFile[];
  server: Settings;            // server URL + token (the AI key never leaves the server)
  editor: EditorSettings;
  current: string;
  selection: { path: string; text: string; startLine: number; endLine: number } | null;
  openFile: (path: string, line?: number) => void;
  /** Replace the project's files. Saves a version snapshot first and registers undo. */
  applyFiles: (next: ProjectFile[], label: string) => void;
  patchProject: (p: Partial<Project>) => void;
  toast: (s: string) => void;
  contextPaths: string[];
  setContextPaths: (p: string[]) => void;
  extraContext: ProjectFile[];
  setExtraContext: (f: ProjectFile[]) => void;
}
