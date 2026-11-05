// File pickers for "Attach Code" (phone + web). They only READ bytes; nothing is executed or rendered.
import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { RawFile } from './attach';

async function bytesOf(uri: string): Promise<Uint8Array> {
  return new Uint8Array(await (await fetch(uri)).arrayBuffer());
}

export async function pickSourceFiles(): Promise<RawFile[]> {
  const r = await DocumentPicker.getDocumentAsync({ multiple: true, type: '*/*', copyToCacheDirectory: true });
  if (r.canceled) return [];
  const out: RawFile[] = [];
  for (const a of r.assets) out.push({ name: a.name, bytes: await bytesOf(a.uri) });
  return out;
}

export async function pickOne(types: string[]): Promise<{ name: string; bytes: Uint8Array; uri: string } | null> {
  const r = await DocumentPicker.getDocumentAsync({ multiple: false, type: types, copyToCacheDirectory: true });
  if (r.canceled) return null;
  const a = r.assets[0];
  return { name: a.name, bytes: await bytesOf(a.uri), uri: a.uri };
}

/** Web only: choose a whole folder (the browser gives every file with its relative path). */
export function pickFolderWeb(): Promise<RawFile[]> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') return resolve([]);
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; (input as any).webkitdirectory = true;
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const out: RawFile[] = [];
      for (const f of files) {
        const rel: string = (f as any).webkitRelativePath || f.name;
        out.push({ name: rel.split('/').slice(1).join('/') || f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
      }
      resolve(out);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

/** Files dropped on the editor (web). */
export async function readDropped(files: File[]): Promise<RawFile[]> {
  const out: RawFile[] = [];
  for (const f of files) out.push({ name: (f as any).webkitRelativePath || f.name, bytes: new Uint8Array(await f.arrayBuffer()) });
  return out;
}

export const toBase64 = (b: Uint8Array): string => {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000));
  return btoa(s);
};
export const isZip = (name: string, b: Uint8Array) => /\.zip$/i.test(name) || (b[0] === 0x50 && b[1] === 0x4b && b[2] === 3 && b[3] === 4);
export const isPdf = (name: string, b: Uint8Array) => /\.pdf$/i.test(name) || (b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46);
