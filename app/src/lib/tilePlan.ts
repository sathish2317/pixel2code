export type ImageQuality = 'hd' | '4k';

export interface TilePlan { width: number; tileHeight: number; overlap: number; scaledHeight: number; crops: { y: number; height: number }[]; jpeg: number }

/**
 * Works out how a design is scaled and sliced (pure maths, no image library: easy to test).
 * hd: 1920px wide, 1600px slices. 4k: 3840px wide, 3200px slices (more real detail for small text, but much bigger uploads).
 * Slices overlap so nothing at a cut line is lost; the slice height grows when the page would need more than maxTiles slices.
 */
export function planTiles(srcW: number, srcH: number, quality: ImageQuality = 'hd'): TilePlan {
  const k = quality === '4k' ? 2 : 1;
  const width = 1920 * k;
  const overlap = 80 * k;
  const maxTiles = quality === '4k' ? 8 : 12;
  const scaledHeight = Math.round((srcH * width) / srcW);
  let tileHeight = 1600 * k;
  while (scaledHeight > tileHeight && Math.ceil((scaledHeight - overlap) / (tileHeight - overlap)) > maxTiles) tileHeight += 200 * k;
  const crops: { y: number; height: number }[] = [];
  if (scaledHeight <= tileHeight + 400 * k) crops.push({ y: 0, height: scaledHeight });
  else {
    for (let y = 0; y < scaledHeight; y += tileHeight - overlap) {
      const h = Math.min(tileHeight, scaledHeight - y);
      if (h < 120 * k) break; // tiny leftover strip is already covered by the overlap
      crops.push({ y, height: h });
      if (y + h >= scaledHeight) break;
    }
  }
  return { width, tileHeight, overlap, scaledHeight, crops, jpeg: quality === '4k' ? 0.88 : 0.92 };
}
