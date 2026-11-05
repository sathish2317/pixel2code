// "Attach Code": turns uploaded files / a ZIP / pasted text / another project into REVIEWABLE candidates.
// Nothing here touches the project. The user reviews the list, then planImport() builds the new file list.
// Uploaded content is only ever read as text: it is never executed, evaluated or rendered as HTML by this module.
import JSZip from 'jszip';
import { ProjectFile, uid } from '../types';
import { FileProblem, MAX_FILE_BYTES, MAX_IMPORT_FILES, MAX_IMPORT_TOTAL_BYTES, checkFileKind, sanitizePath, safePath } from './langs';
import { uniquePath } from './fileTree';

export type Source = 'upload' | 'zip' | 'paste' | 'project' | 'pdf';
export interface Candidate {
  id: string;
  path: string;
  content: string;
  bytes: number;
  source: Source;
  /** ok = can be imported; duplicate = a file with this path already exists; rejected = cannot be imported. */
  status: 'ok' | 'duplicate' | 'rejected';
  problem?: FileProblem;
  reason?: string;
  identical?: boolean;   // duplicate with exactly the same content
  sameName?: string[];   // other files (other folders) with the same file name
  selected: boolean;
}
export interface RawFile { name: string; bytes: Uint8Array }
export type Resolution = 'skip' | 'replace' | 'rename';

const IGNORED = /(^|\/)(node_modules|\.git|__MACOSX|\.idea|\.vscode|dist|build|\.next)\/|(^|\/)(\.DS_Store|Thumbs\.db)$/;

export function decodeText(bytes: Uint8Array): { text?: string; problem?: 'binary' | 'encoding'; reason?: string } {
  let b = bytes, enc = 'utf-8';
  if (b.length >= 3 && b[0] === 0xef && b[1] === 0xbb && b[2] === 0xbf) b = b.subarray(3);
  else if (b.length >= 2 && b[0] === 0xff && b[1] === 0xfe) { enc = 'utf-16le'; b = b.subarray(2); }
  else if (b.length >= 2 && b[0] === 0xfe && b[1] === 0xff) { enc = 'utf-16be'; b = b.subarray(2); }
  if (enc === 'utf-8') {
    // NUL bytes (outside UTF-16) mean a binary file, not text
    const n = Math.min(b.length, 8000);
    for (let i = 0; i < n; i++) if (b[i] === 0) return { problem: 'binary', reason: 'Binary file (contains NUL bytes), not source code.' };
  }
  try {
    const text = new TextDecoder(enc, { fatal: true }).decode(b);
    return { text: text.replace(/\r\n?/g, '\n') };
  } catch {
    return { problem: 'encoding', reason: 'Not valid UTF-8 text (unknown encoding). Re-save it as UTF-8 and try again.' };
  }
}

function finish(list: Candidate[], existing: ProjectFile[]): Candidate[] {
  const have = new Map(existing.map((f) => [f.path, f.content]));
  const names = new Map<string, string[]>();
  for (const f of existing) { const n = f.path.split('/').pop()!; names.set(n, [...(names.get(n) || []), f.path]); }
  const seen = new Set<string>();
  let total = 0;
  for (const c of list) {
    if (c.status !== 'ok') continue;
    if (seen.has(c.path)) { c.status = 'rejected'; c.problem = undefined; c.reason = 'Same path appears twice in this upload; only the first is used.'; c.selected = false; continue; }
    seen.add(c.path);
    total += c.bytes;
    if (total > MAX_IMPORT_TOTAL_BYTES) { c.status = 'rejected'; c.problem = 'toolarge'; c.reason = `Import limit of ${MAX_IMPORT_TOTAL_BYTES / 1e6} MB reached.`; c.selected = false; continue; }
    if (have.has(c.path)) { c.status = 'duplicate'; c.identical = have.get(c.path) === c.content; c.reason = c.identical ? 'Already in the project with identical content.' : 'A file with this path already exists. Choose what to do.'; c.selected = !c.identical; }
    const n = c.path.split('/').pop()!;
    const same = (names.get(n) || []).filter((p) => p !== c.path);
    if (same.length) c.sameName = same.slice(0, 3);
    names.set(n, [...(names.get(n) || []), c.path]);
  }
  return list;
}

function makeCand(path: string, bytes: Uint8Array, source: Source): Candidate {
  const base: Candidate = { id: uid(), path, content: '', bytes: bytes.length, source, status: 'rejected', selected: false };
  const kind = checkFileKind(path, bytes.length);
  if (kind.problem) return { ...base, problem: kind.problem, reason: kind.reason };
  const d = decodeText(bytes);
  if (d.problem || d.text === undefined) return { ...base, problem: d.problem, reason: d.reason };
  if (!d.text.trim()) return { ...base, problem: 'empty', reason: 'File is empty.' };
  return { ...base, content: d.text, status: 'ok', selected: true };
}

export function fromFiles(raws: RawFile[], existing: ProjectFile[], prefix = ''): Candidate[] {
  const list = raws.slice(0, MAX_IMPORT_FILES).map((r) => {
    const p = sanitizePath(prefix + r.name);
    return p ? makeCand(p, r.bytes, 'upload') : { id: uid(), path: r.name.slice(0, 120), content: '', bytes: r.bytes.length, source: 'upload' as Source, status: 'rejected' as const, problem: 'unsafe' as FileProblem, reason: 'Unsafe or invalid file name.', selected: false };
  });
  if (raws.length > MAX_IMPORT_FILES) list.push({ id: uid(), path: `(${raws.length - MAX_IMPORT_FILES} more files)`, content: '', bytes: 0, source: 'upload', status: 'rejected', problem: 'toolarge', reason: `Only ${MAX_IMPORT_FILES} files can be imported at once.`, selected: false });
  return finish(list, existing);
}

export function fromPaste(name: string, text: string, existing: ProjectFile[]): Candidate[] {
  const p = sanitizePath(name.trim());
  const bytes = new TextEncoder().encode(text);
  if (!p) return [{ id: uid(), path: name.slice(0, 120), content: '', bytes: bytes.length, source: 'paste', status: 'rejected', problem: 'unsafe', reason: 'Unsafe or invalid file name.', selected: false }];
  const c = makeCand(p, bytes, 'paste');
  return finish([{ ...c, content: c.status === 'ok' ? text.replace(/\r\n?/g, '\n') : c.content }], existing);
}

export function fromProject(files: ProjectFile[], existing: ProjectFile[], prefix = ''): Candidate[] {
  return finish(files.map((f) => {
    const p = sanitizePath(prefix + f.path);
    if (!p) return { id: uid(), path: f.path, content: '', bytes: 0, source: 'project' as Source, status: 'rejected' as const, problem: 'unsafe' as FileProblem, reason: 'Unsafe path.', selected: false };
    const c = makeCand(p, new TextEncoder().encode(f.content), 'project');
    return c;
  }), existing);
}

export function fromPdfText(name: string, text: string, existing: ProjectFile[]): Candidate[] {
  const base = (name.replace(/\.pdf$/i, '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'document').slice(0, 60);
  const p = 'docs/' + base + '.txt';
  const c = makeCand(p, new TextEncoder().encode(text), 'pdf');
  return finish([{ ...c, source: 'pdf' }], existing);
}

export interface ZipResult { candidates: Candidate[]; ignored: number; error?: string }

/** Reads a ZIP safely: path traversal, absolute/drive/backslash paths, symlinks, zip bombs and executables are all rejected per entry. */
export async function fromZip(data: ArrayBuffer | Uint8Array, existing: ProjectFile[], maxEntries = 2000): Promise<ZipResult> {
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(data); } catch { return { candidates: [], ignored: 0, error: 'That file is not a valid ZIP archive (or it is encrypted).' }; }
  const entries = Object.values(zip.files).filter((e) => !e.dir);
  if (entries.length > maxEntries) return { candidates: [], ignored: 0, error: `ZIP has too many entries (${entries.length}, max ${maxEntries}).` };

  const names = entries.map((e) => e.name.replace(/\\/g, '/'));
  const top = names[0]?.split('/')[0];
  const strip = top && names.length > 0 && names.every((n) => n.startsWith(top + '/')) ? top + '/' : ''; // a single wrapper folder is removed

  const list: Candidate[] = [];
  let ignored = 0, read = 0, budget = MAX_IMPORT_TOTAL_BYTES * 3;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i], raw = names[i];
    if (IGNORED.test(raw)) { ignored++; continue; }
    if (list.length >= MAX_IMPORT_FILES) { list.push({ id: uid(), path: `(more files)`, content: '', bytes: 0, source: 'zip', status: 'rejected', problem: 'toolarge', reason: `Only ${MAX_IMPORT_FILES} files can be imported at once.`, selected: false }); break; }
    const rel = raw.slice(strip.length);
    const rej = (problem: FileProblem, reason: string, bytes = 0): Candidate => ({ id: uid(), path: rel.slice(0, 160), content: '', bytes, source: 'zip', status: 'rejected', problem, reason, selected: false });
    const clean = sanitizePath(rel);
    if (!clean || rel.split('/').includes('..')) { list.push(rej('unsafe', 'Unsafe path in ZIP (path traversal, absolute or drive path). Not imported.')); continue; }
    if (e.unixPermissions != null && (Number(e.unixPermissions) & 0o170000) === 0o120000) { list.push(rej('unsafe', 'Symbolic link. Not imported.')); continue; }
    const kind = checkFileKind(clean, 0);
    if (kind.problem) { list.push({ ...rej(kind.problem, kind.reason!), path: clean }); continue; }
    const declared: number | undefined = (e as any)._data?.uncompressedSize;
    if (declared !== undefined && declared > MAX_FILE_BYTES) { list.push({ ...rej('toolarge', `Larger than ${Math.round(MAX_FILE_BYTES / 1000)} KB.`, declared), path: clean }); continue; }
    if (read > budget) { list.push({ ...rej('toolarge', 'ZIP expands to too much data. Stopped reading.'), path: clean }); continue; }
    const bytes = await e.async('uint8array');
    read += bytes.length;
    list.push(makeCand(clean, bytes, 'zip'));
  }
  if (!list.length) return { candidates: [], ignored, error: 'No importable files found in that ZIP.' };
  return { candidates: finish(list, existing), ignored };
}

export interface ImportPlan { files: ProjectFile[]; created: string[]; replaced: string[]; skipped: string[]; renamed: Record<string, string> }

/** Builds the new file list. Existing files are only replaced when the user chose "replace" for that file. */
export function planImport(existing: ProjectFile[], cands: Candidate[], resolve: Record<string, Resolution> = {}): ImportPlan {
  let files = [...existing];
  const plan: ImportPlan = { files, created: [], replaced: [], skipped: [], renamed: {} };
  for (const c of cands) {
    if (!c.selected || c.status === 'rejected' || !safePath(c.path)) { if (c.status !== 'rejected' && !c.selected) plan.skipped.push(c.path); continue; }
    if (c.status === 'ok') { files.push({ path: c.path, content: c.content }); plan.created.push(c.path); continue; }
    const r = resolve[c.id] ?? 'skip';
    if (r === 'skip') plan.skipped.push(c.path);
    else if (r === 'replace') { files = files.map((f) => (f.path === c.path ? { ...f, content: c.content } : f)); plan.replaced.push(c.path); }
    else { const np = uniquePath(files, c.path); files.push({ path: np, content: c.content }); plan.created.push(np); plan.renamed[c.path] = np; }
  }
  plan.files = files;
  return plan;
}
