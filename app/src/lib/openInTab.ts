import { Platform } from 'react-native';
import { ProjectAsset, ProjectFile } from '../types';
import { bundleForPreview } from './managed';
import { tabDocument } from './tabDoc';

/**
 * Opens the page in its own browser tab (web only), so it can be tested in real Chrome:
 * resize the window or use the DevTools device toolbar to see every screen size. Images are embedded, so it works offline.
 *
 * Why an iframe inside the tab: the tab is on the app's own address, so the generated or imported code must NOT run there
 * (it could read the app's stored projects). The sandboxed iframe keeps it isolated, like the preview inside the app.
 * Returns false (and does nothing) on phone or when the browser blocks pop-ups.
 */
export function openInBrowserTab(files: ProjectFile[], assets: ProjectAsset[] = [], title?: string, entry?: string): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof Blob === 'undefined') return false;
  const doc = tabDocument(bundleForPreview(files, assets, entry), title);
  const url = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
  const w = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 10 * 60 * 1000); // long enough for reloads
  return !!w;
}
