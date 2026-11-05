import { ProposedFile } from '../api';
import { ProjectFile } from '../types';
import { checkFileKind, languageOf, safePath } from './langs';

/** Turns files returned by the generate/refine/convert endpoints into a proposal (new / modified / unchanged vs. the current project). Unsafe files are dropped with a warning. */
export function toProposed(incoming: ProjectFile[], current: ProjectFile[]): { files: ProposedFile[]; warnings: string[] } {
  const have = new Map(current.map((f) => [f.path, f.content]));
  const files: ProposedFile[] = [], warnings: string[] = [];
  for (const f of incoming) {
    const bad = !safePath(f.path) ? 'unsafe path' : checkFileKind(f.path, f.content.length).reason;
    if (bad) { warnings.push(`Ignored ${f.path}: ${bad}`); continue; }
    const old = have.get(f.path);
    files.push({ path: f.path, content: f.content, language: languageOf(f.path), status: old === undefined ? 'new' : old === f.content ? 'unchanged' : 'modified' });
  }
  return { files, warnings };
}
