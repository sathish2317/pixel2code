import { Image } from 'react-native';
import { AssetInfo, ProjectAsset } from '../types';
import { dataUri, infoOf } from './assets';

/** Width/height of an image (works on web and phone). Gives up after 3 seconds, SVG and broken files return undefined. */
export function imageSize(a: ProjectAsset): Promise<{ width: number; height: number } | undefined> {
  if (a.mime === 'image/svg+xml') return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), 3000);
    Image.getSize(
      dataUri(a),
      (width, height) => { clearTimeout(timer); resolve({ width, height }); },
      () => { clearTimeout(timer); resolve(undefined); }
    );
  });
}

/** Light description (path, type, size in bytes, pixel size) of all images. This is what the AI receives instead of the image bytes. */
export async function describeAssets(list: ProjectAsset[]): Promise<AssetInfo[]> {
  const out: AssetInfo[] = [];
  for (let i = 0; i < list.length; i += 6) {
    const chunk = list.slice(i, i + 6);
    const dims = await Promise.all(chunk.map(imageSize));
    chunk.forEach((a, j) => out.push(infoOf(a, dims[j])));
  }
  return out;
}
