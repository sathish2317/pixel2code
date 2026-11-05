import { ProjectFile } from '../types';
import { safePath, sanitizePath } from './langs';

export interface TreeNode { name: string; path: string; dir: boolean; children?: TreeNode[] }

export function buildTree(files: ProjectFile[], extraDirs: string[] = []): TreeNode[] {
  const root: TreeNode = { name: '', path: '', dir: true, children: [] };
  const ensureDir = (parts: string[]) => {
    let cur = root;
    parts.forEach((name, i) => {
      const path = parts.slice(0, i + 1).join('/');
      let n = cur.children!.find((c) => c.dir && c.name === name);
      if (!n) { n = { name, path, dir: true, children: [] }; cur.children!.push(n); }
      cur = n;
    });
    return cur;
  };
  for (const d of extraDirs) ensureDir(d.split('/'));
  for (const f of files) {
    const parts = f.path.split('/');
    const dir = ensureDir(parts.slice(0, -1));
    dir.children!.push({ name: parts[parts.length - 1], path: f.path, dir: false });
  }
  const sort = (n: TreeNode) => { n.children?.sort((a, b) => (a.dir === b.dir ? a.name.localeCompare(b.name) : a.dir ? -1 : 1)); n.children?.forEach(sort); };
  sort(root);
  return root.children!;
}

export type OpResult = { files: ProjectFile[]; error?: string; renamed?: Record<string, string> };

/** Renames a file, or a folder (every file under it). Fails instead of overwriting. */
export function renamePath(files: ProjectFile[], from: string, toRaw: string): OpResult {
  const to = sanitizePath(toRaw);
  if (!to) return { files, error: 'That name is not allowed (use letters, numbers, - _ . / and no "..").' };
  if (to === from) return { files };
  const isFile = files.some((f) => f.path === from);
  const under = (p: string) => p === from || p.startsWith(from + '/');
  const moved = files.filter((f) => (isFile ? f.path === from : under(f.path)));
  if (!moved.length) return { files, error: 'Nothing to rename.' };
  if (!isFile && (to === from || to.startsWith(from + '/'))) return { files, error: 'A folder cannot be moved into itself.' };
  const renamed: Record<string, string> = {};
  for (const f of moved) renamed[f.path] = isFile ? to : to + f.path.slice(from.length);
  const taken = new Set(files.filter((f) => !(f.path in renamed)).map((f) => f.path));
  for (const np of Object.values(renamed)) {
    if (!safePath(np)) return { files, error: 'Resulting path is not allowed.' };
    if (taken.has(np)) return { files, error: `"${np}" already exists.` };
  }
  return { files: files.map((f) => (f.path in renamed ? { ...f, path: renamed[f.path] } : f)), renamed };
}

export function uniquePath(files: { path: string }[], wanted: string): string {
  const have = new Set(files.map((f) => f.path));
  if (!have.has(wanted)) return wanted;
  const i = wanted.lastIndexOf('.'), slash = wanted.lastIndexOf('/');
  const base = i > slash ? wanted.slice(0, i) : wanted, ext = i > slash ? wanted.slice(i) : '';
  for (let n = 2; n < 1000; n++) if (!have.has(`${base} (${n})${ext}`)) return `${base} (${n})${ext}`;
  return `${base}-${Date.now()}${ext}`;
}

export function duplicatePath(files: ProjectFile[], path: string): OpResult {
  const f = files.find((x) => x.path === path);
  if (!f) return { files, error: 'File not found.' };
  const i = path.lastIndexOf('.'), slash = path.lastIndexOf('/');
  const copy = uniquePath(files, i > slash ? path.slice(0, i) + '-copy' + path.slice(i) : path + '-copy');
  return { files: [...files, { path: copy, content: f.content }], renamed: { [path]: copy } };
}

export function deletePath(files: ProjectFile[], path: string): ProjectFile[] {
  return files.filter((f) => f.path !== path && !f.path.startsWith(path + '/'));
}

export function createFile(files: ProjectFile[], raw: string): OpResult {
  const p = sanitizePath(raw);
  if (!p) return { files, error: 'That name is not allowed (use letters, numbers, - _ . / and no "..").' };
  if (files.some((f) => f.path === p)) return { files, error: `"${p}" already exists.` };
  if (files.some((f) => p.startsWith(f.path + '/') || f.path.startsWith(p + '/'))) return { files, error: 'A file and a folder cannot share a name.' };
  return { files: [...files, { path: p, content: '' }], renamed: { '': p } };
}
