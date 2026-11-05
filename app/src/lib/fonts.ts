import { FontChoice } from '../types';

// Small curated list that works offline. The user can also type any Google Fonts family name.
// Full catalog (needs a free API key): https://developers.google.com/fonts/docs/developer_api
export const FONT_CATALOG: { family: string; weights: number[]; generic: string }[] = [
  { family: 'Poppins', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'Inter', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'Roboto', weights: [300, 400, 500, 700], generic: 'sans-serif' },
  { family: 'Montserrat', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'Open Sans', weights: [300, 400, 600, 700], generic: 'sans-serif' },
  { family: 'Lato', weights: [300, 400, 700], generic: 'sans-serif' },
  { family: 'Nunito', weights: [300, 400, 600, 700], generic: 'sans-serif' },
  { family: 'Raleway', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'Work Sans', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'DM Sans', weights: [300, 400, 500, 700], generic: 'sans-serif' },
  { family: 'Playfair Display', weights: [400, 500, 600, 700], generic: 'serif' },
  { family: 'Merriweather', weights: [300, 400, 700], generic: 'serif' },
  { family: 'Lora', weights: [400, 500, 600, 700], generic: 'serif' },
  { family: 'Oswald', weights: [300, 400, 500, 600, 700], generic: 'sans-serif' },
  { family: 'Source Code Pro', weights: [400, 500, 600], generic: 'monospace' },
];

export function genericFor(family: string): string {
  return FONT_CATALOG.find((f) => f.family === family)?.generic ?? 'sans-serif';
}

export function stackFor(f: FontChoice): string {
  return `'${f.family}', ${genericFor(f.family)}`;
}

// Builds ONE Google Fonts CSS2 URL for all selected families (only the weights actually chosen).
export function googleFontsUrl(choices: (FontChoice | undefined)[]): string | null {
  const merged = new Map<string, Set<number>>();
  for (const c of choices) {
    if (!c) continue;
    const set = merged.get(c.family) ?? new Set<number>();
    (c.weights.length ? c.weights : [400]).forEach((w) => set.add(w));
    merged.set(c.family, set);
  }
  if (!merged.size) return null;
  const parts = [...merged.entries()].map(([fam, ws]) => {
    const w = [...ws].sort((a, b) => a - b).join(';');
    return `family=${fam.trim().replace(/ /g, '+')}:wght@${w}`;
  });
  return `https://fonts.googleapis.com/css2?${parts.join('&')}&display=swap`;
}
