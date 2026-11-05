import type { HoverFx } from './engine';

/**
 * Canonical list of hover effects exposed by the Animation Studio.
 * Keep this data outside the screen component so it can be tested, searched,
 * and extended without coupling the catalog to the UI implementation.
 */
export const HOVER_EFFECTS: readonly HoverFx[] = [
  'lift', 'scale', 'glow', 'image-zoom', 'underline', 'border', 'gradient', 'icon-move',
  'shrink', 'rotate', 'tilt', 'slide-left', 'slide-right', 'slide-up', 'slide-down',
  'background-fade', 'text-color', 'shadow', 'soft-shadow', 'hard-shadow', 'inset-shadow',
  'outline', 'radius', 'brightness', 'grayscale', 'saturate', 'sepia', 'blur', 'invert',
  'opacity', 'text-shadow', 'letter-spacing', 'border-glow', 'skew', 'flip', 'pulse',
  'bounce', 'ripple', 'gradient-shift', 'image-overlay', 'button-press', 'underline-grow',
  'underline-slide', 'color-wash', 'raise', 'perspective', 'focus-ring', 'rotate-small',
  'shine-sweep', 'wobble', 'swing', 'heartbeat', 'float', 'jelly', 'skew-x', 'skew-y',
  'image-white', 'contrast', 'hue-rotate', 'border-dash', 'underline-center', 'text-reveal',
];

export interface EffectCategory {
  id: 'hover' | 'background' | 'text' | 'image' | 'transform' | 'shadow';
  label: string;
  effects: readonly HoverFx[];
}

export const EFFECT_CATEGORIES: readonly EffectCategory[] = [
  { id: 'hover', label: 'Hover', effects: HOVER_EFFECTS },
  { id: 'background', label: 'Background', effects: ['background-fade', 'gradient', 'gradient-shift', 'color-wash', 'image-overlay'] },
  { id: 'text', label: 'Text', effects: ['text-color', 'underline', 'underline-grow', 'underline-slide', 'text-shadow', 'letter-spacing', 'underline-center', 'text-reveal'] },
  { id: 'image', label: 'Image', effects: ['image-zoom', 'brightness', 'grayscale', 'saturate', 'sepia', 'blur', 'invert', 'opacity', 'image-overlay', 'image-white', 'contrast', 'hue-rotate'] },
  { id: 'transform', label: 'Transform', effects: ['lift', 'scale', 'shrink', 'rotate', 'tilt', 'skew', 'skew-x', 'skew-y', 'flip', 'slide-left', 'slide-right', 'slide-up', 'slide-down', 'icon-move', 'raise', 'perspective', 'rotate-small', 'button-press', 'wobble', 'swing', 'heartbeat', 'float', 'jelly'] },
  { id: 'shadow', label: 'Shadow', effects: ['glow', 'shadow', 'soft-shadow', 'hard-shadow', 'inset-shadow', 'border-glow', 'focus-ring', 'outline', 'border-dash'] },
];

export function searchEffects(query: string, effects: readonly HoverFx[] = HOVER_EFFECTS): HoverFx[] {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ');
  const unique = Array.from(new Set(effects));
  if (!normalized) return unique;
  return unique.filter((effect) => effect.replace(/-/g, ' ').includes(normalized));
}
