import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { PlacedBlock, Project, ProjectAsset, SavedComponent } from './types';

/**
 * Storage layer.
 * - Web: IndexedDB (hundreds of MB). The old localStorage limit (~5 MB) was too small for projects with a reference image + versions.
 * - Phone: AsyncStorage (app-private storage).
 * Old data that was saved in localStorage on web is still read, and is moved to IndexedDB the next time the project is saved.
 */
const useIdb = Platform.OS === 'web' && typeof indexedDB !== 'undefined';

let dbPromise: Promise<IDBDatabase> | null = null;
function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('pixel2code', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('kv');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    // Ask the browser not to evict our data when disk space is low (it may ignore this).
    try { (navigator as any).storage?.persist?.(); } catch {}
  }
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction('kv', mode);
        const r = fn(t.objectStore('kv'));
        t.oncomplete = () => resolve(r.result);
        t.onerror = () => reject(t.error || r.error);
        t.onabort = () => reject(t.error || r.error);
      })
  );
}

async function kvGet(key: string): Promise<string | null> {
  if (!useIdb) return AsyncStorage.getItem(key);
  const v = await tx<string | undefined>('readonly', (s) => s.get(key));
  if (v !== undefined) return v;
  return AsyncStorage.getItem(key); // old localStorage data
}

async function kvSet(key: string, value: string): Promise<void> {
  if (!useIdb) return AsyncStorage.setItem(key, value);
  await tx('readwrite', (s) => s.put(value, key));
  try { await AsyncStorage.removeItem(key); } catch {} // frees the old localStorage copy
}

async function kvRemove(key: string): Promise<void> {
  if (useIdb) await tx('readwrite', (s) => s.delete(key));
  await AsyncStorage.removeItem(key);
}

const INDEX_KEY = 'p2c:index';
const PROJECT_KEY = (id: string) => `p2c:project:${id}`;
const SETTINGS_KEY = 'p2c:settings';

export interface Settings {
  serverUrl: string;
  appToken: string;
  dark: boolean;
}

export const defaultSettings: Settings = {
  serverUrl: 'http://localhost:8787',
  appToken: '',
  dark: true,
};

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(s: Settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

async function readIndex(): Promise<string[]> {
  const raw = await kvGet(INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function listProjects(): Promise<Project[]> {
  const ids = await readIndex();
  const items = await Promise.all(ids.map((id) => kvGet(PROJECT_KEY(id))));
  const out: Project[] = [];
  for (const raw of items) {
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch {
      // A corrupt record is skipped, never deleted.
    }
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveProject(p: Project): Promise<void> {
  try {
    await kvSet(PROJECT_KEY(p.id), JSON.stringify(p));
  } catch (e: any) {
    const msg = String(e?.name || '') + ' ' + String(e?.message || e);
    if (/quota|full|space/i.test(msg))
      throw new Error('Storage is full. Export a ZIP backup, then permanently delete old projects or versions.');
    throw e;
  }
  const ids = await readIndex();
  if (!ids.includes(p.id)) await kvSet(INDEX_KEY, JSON.stringify([...ids, p.id]));
}

// Permanent delete. Only called after the user confirms.
export async function deleteProjectForever(id: string): Promise<void> {
  await kvRemove(PROJECT_KEY(id));
  await deleteAssets(id);
  const ids = await readIndex();
  await kvSet(INDEX_KEY, JSON.stringify(ids.filter((x) => x !== id)));
}

export async function approxStorageBytes(): Promise<number> {
  const ids = await readIndex();
  let n = 0;
  for (const id of ids) n += (await kvGet(PROJECT_KEY(id)))?.length ?? 0;
  return n;
}

const COMPONENTS_KEY = 'p2c:components';

export async function loadComponents(): Promise<SavedComponent[]> {
  try {
    const raw = await kvGet(COMPONENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveComponents(list: SavedComponent[]): Promise<void> {
  try {
    await kvSet(COMPONENTS_KEY, JSON.stringify(list));
  } catch (e: any) {
    if (/quota|full|space/i.test(String(e?.name || '') + String(e?.message || e)))
      throw new Error('Storage is full. Delete old projects or components first.');
    throw e;
  }
}


// ---------------------------------------------------------------------------------------------
// Project images (assets)
// Kept OUT of the project record on purpose: the editor autosaves the project after every keystroke, and
// re-writing megabytes of base64 each time would be slow. Web: IndexedDB. Phone: a JSON file in the app's
// private document folder (AsyncStorage on Android has a small total limit, so it is not used for images).
// ---------------------------------------------------------------------------------------------
const ASSETS_KEY = (id: string) => `p2c:assets:${id}`;
export const ASSET_TOTAL_LIMIT = Platform.OS === 'web' ? 100 * 1024 * 1024 : 40 * 1024 * 1024;

async function assetFile(id: string) {
  const FS = await import('expo-file-system');
  const dir = new FS.Directory(FS.Paths.document, 'p2c-assets');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return new FS.File(dir, id.replace(/[^\w-]/g, '') + '.json');
}

export async function loadAssets(projectId: string): Promise<ProjectAsset[]> {
  try {
    if (Platform.OS === 'web') {
      const raw = await kvGet(ASSETS_KEY(projectId));
      return raw ? JSON.parse(raw) : [];
    }
    const f = await assetFile(projectId);
    return f.exists ? JSON.parse(await f.text()) : [];
  } catch {
    return [];
  }
}

export async function saveAssets(projectId: string, list: ProjectAsset[]): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      if (!list.length) { await kvRemove(ASSETS_KEY(projectId)); return; }
      await kvSet(ASSETS_KEY(projectId), JSON.stringify(list));
      return;
    }
    const f = await assetFile(projectId);
    if (!list.length) { if (f.exists) f.delete(); return; }
    if (!f.exists) f.create();
    f.write(JSON.stringify(list));
  } catch (e: any) {
    if (/quota|full|space/i.test(String(e?.name || '') + String(e?.message || e)))
      throw new Error('Storage is full. Remove some images or export a ZIP backup and delete old projects.');
    throw e;
  }
}

export async function deleteAssets(projectId: string): Promise<void> {
  try { await saveAssets(projectId, []); } catch { /* nothing to delete */ }
}

export async function copyAssets(fromId: string, toId: string): Promise<void> {
  const list = await loadAssets(fromId);
  if (list.length) await saveAssets(toId, list);
}

// ---------------------------------------------------------------------------------------------
// Code Blocks canvas (the blocks you dragged in). Saved so you do not lose your page when you leave the screen.
// ---------------------------------------------------------------------------------------------
const BUILDER_KEY = 'p2c:builder';

export async function loadBuilder(): Promise<PlacedBlock[]> {
  try {
    const raw = await kvGet(BUILDER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveBuilder(list: PlacedBlock[]): Promise<void> {
  await kvSet(BUILDER_KEY, JSON.stringify(list));
}


// ---- editor preferences (font, tab size, theme ...) ----
import { EditorSettings, defaultEditorSettings, sanitizeEditorSettings } from './lib/editorSettings';
const EDITOR_KEY = 'p2c:editor';
export async function loadEditorSettings(): Promise<EditorSettings> {
  try { const raw = await kvGet(EDITOR_KEY); return raw ? sanitizeEditorSettings(JSON.parse(raw)) : defaultEditorSettings; } catch { return defaultEditorSettings; }
}
export async function saveEditorSettings(s: EditorSettings): Promise<void> {
  try { await kvSet(EDITOR_KEY, JSON.stringify(s)); } catch {}
}
