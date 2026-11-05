import { ProjectFile } from '../types';
/** Fast non-cryptographic hash of a file set (FNV-1a). Used only to notice "changed since last sync / save". */
export function hashFiles(files: ProjectFile[]): string {
  let h = 0x811c9dc5;
  const feed = (s: string) => { for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } h ^= 0xff; h = Math.imul(h, 0x01000193) >>> 0; };
  for (const f of [...files].sort((a, b) => (a.path < b.path ? -1 : 1))) { feed(f.path); feed(f.content); }
  return h.toString(16) + ':' + files.length;
}
