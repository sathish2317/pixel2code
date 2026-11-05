import * as ImageManipulator from 'expo-image-manipulator';
import { ImageQuality, planTiles } from './tilePlan';

export interface PickedImage {
  base64: string;
  mime: string;
}

export { planTiles } from './tilePlan';
export type { ImageQuality, TilePlan } from './tilePlan';

/**
 * Prepares a design image for analysis.
 * - Scales it to 1920px (HD) or 3840px (4K) wide. Small images are enlarged: this helps the AI read small text, it does NOT add real detail.
 * - Cuts tall pages into overlapping slices so the AI sees each part at full resolution.
 * - Also makes a small preview (1000px) to keep with the project.
 */
export async function prepareImages(uri: string, quality: ImageQuality = 'hd'): Promise<{ preview: PickedImage; tiles: PickedImage[]; width: number; height: number; bytes: number }> {
  const IM = ImageManipulator;
  const first = await IM.ImageManipulator.manipulate(uri).renderAsync();
  const srcW = first.width;
  const srcH = first.height;
  const plan = planTiles(srcW, srcH, quality);

  const save = async (ctx: any, q: number) => {
    const img = await ctx.renderAsync();
    const res = await img.saveAsync({ format: IM.SaveFormat.JPEG, compress: q, base64: true });
    if (!res.base64) throw new Error('Could not read the image.');
    return { base64: res.base64 as string, mime: 'image/jpeg' };
  };
  const tiles: PickedImage[] = [];
  if (plan.crops.length === 1 && plan.crops[0].y === 0 && plan.crops[0].height === plan.scaledHeight) {
    tiles.push(await save(IM.ImageManipulator.manipulate(uri).resize({ width: plan.width }), plan.jpeg));
  } else {
    for (const c of plan.crops) {
      const ctx = IM.ImageManipulator.manipulate(uri).resize({ width: plan.width }).crop({ originX: 0, originY: c.y, width: plan.width, height: c.height });
      tiles.push(await save(ctx, plan.jpeg));
    }
  }
  const preview = await save(IM.ImageManipulator.manipulate(uri).resize({ width: Math.min(1000, srcW) }), 0.7);
  const bytes = tiles.reduce((n, t) => n + Math.floor((t.base64.length * 3) / 4), 0);
  return { preview, tiles, width: srcW, height: srcH, bytes };
}

/** Reads any picked file (web blob url or phone file uri) as base64 without the data: prefix. */
export async function readBase64(uri: string): Promise<string> {
  const blob = await (await fetch(uri)).blob();
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error('Could not read the file.'));
    r.onload = () => resolve(String(r.result).split(',')[1] || '');
    r.readAsDataURL(blob);
  });
}
