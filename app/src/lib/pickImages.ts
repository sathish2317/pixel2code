import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { ProjectAsset } from '../types';
import { ASSET_TOTAL_LIMIT } from '../storage';
import { IMAGE_EXT, MAX_ASSET_BYTES, assetsFromZip, formatBytes, mergeAssets, mimeFromPath, sanitizeAssetPath, totalBytes } from './assets';
import { readBase64 } from './image';

export interface PickResult {
  assets: ProjectAsset[]; // the NEW images (already merged with nothing: the caller merges)
  message: string; // human summary: what was added and what was skipped and why
}

/** Reads a ZIP of images (blob url on web, file uri on phone) and puts every image under images/. */
export async function assetsFromZipUri(uri: string, existing: ProjectAsset[]): Promise<PickResult> {
  const room = ASSET_TOTAL_LIMIT - totalBytes(existing);
  if (room <= 0) throw new Error(`The image limit of ${formatBytes(ASSET_TOTAL_LIMIT)} is already used. Remove some images first.`);
  const buf = await (await fetch(uri)).arrayBuffer();
  const r = await assetsFromZip(buf, { prefix: 'images/', sanitize: true, maxTotalBytes: room });
  if (!r.assets.length) {
    throw new Error(r.skipped.length ? `No image could be added. ${r.skipped.slice(0, 3).map((s) => `${s.name}: ${s.reason}`).join('; ')}` : 'That ZIP has no images (PNG, JPG, WebP, GIF, SVG, ICO, AVIF).');
  }
  const bits = [`${r.assets.length} image(s) added (${formatBytes(totalBytes(r.assets))}), saved under images/.`];
  if (r.ignored) bits.push(`${r.ignored} file(s) that are not images were ignored.`);
  if (r.skipped.length) bits.push(`Skipped ${r.skipped.length}: ${r.skipped.slice(0, 3).map((s) => `${s.name} (${s.reason})`).join(', ')}${r.skipped.length > 3 ? ' ...' : ''}.`);
  return { assets: r.assets, message: bits.join(' ') };
}

export async function pickZipAssets(existing: ProjectAsset[]): Promise<PickResult | null> {
  const r = await DocumentPicker.getDocumentAsync({ type: ['application/zip', 'application/x-zip-compressed', 'application/octet-stream'], copyToCacheDirectory: true });
  if (r.canceled) return null;
  const f = r.assets[0];
  if (!/\.zip$/i.test(f.name)) throw new Error('Please choose a .zip file. (.rar is not supported: unzip it and zip it again as .zip.)');
  return assetsFromZipUri(f.uri, existing);
}

/** Several loose image files picked from the gallery/disk. They are saved as images/<file name>. */
export async function pickLooseAssets(existing: ProjectAsset[]): Promise<PickResult | null> {
  const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 1 });
  if (r.canceled) return null;
  let room = ASSET_TOTAL_LIMIT - totalBytes(existing);
  const out: ProjectAsset[] = [];
  const skipped: string[] = [];
  const taken = new Set(existing.map((a) => a.path.toLowerCase()));
  let n = 0;
  for (const a of r.assets) {
    n++;
    const raw = a.fileName || `image-${n}.${(a.mimeType || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg')}`;
    const name = IMAGE_EXT.test(raw) ? raw : raw + '.' + (a.mimeType || 'image/jpeg').split('/')[1].replace('jpeg', 'jpg');
    let path = sanitizeAssetPath(name, 'images/');
    if (!path) { skipped.push(raw); continue; }
    // A second file with the same name must not silently replace the first one.
    if (taken.has(path.toLowerCase())) {
      const dot = path.lastIndexOf('.');
      let k = 2;
      while (taken.has((path.slice(0, dot) + '-' + k + path.slice(dot)).toLowerCase())) k++;
      path = path.slice(0, dot) + '-' + k + path.slice(dot);
    }
    const base64 = await readBase64(a.uri);
    const size = Math.floor((base64.length * 3) / 4);
    if (size > MAX_ASSET_BYTES || size > room) { skipped.push(raw + (size > MAX_ASSET_BYTES ? ' (bigger than 8 MB)' : ' (storage limit)')); continue; }
    room -= size;
    taken.add(path.toLowerCase());
    out.push({ path, mime: mimeFromPath(path), base64 });
  }
  if (!out.length) throw new Error('No image could be added.' + (skipped.length ? ' Skipped: ' + skipped.slice(0, 3).join(', ') : ''));
  return { assets: out, message: `${out.length} image(s) added under images/.` + (skipped.length ? ` Skipped ${skipped.length}: ${skipped.slice(0, 3).join(', ')}.` : '') };
}

export { mergeAssets };
