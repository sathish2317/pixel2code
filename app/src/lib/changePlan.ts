// Plan-then-apply flow for design changes:
//  1. "Analyze": the AI compares the reference with the current page and LISTS what differs (no code change).
//  2. The user ticks / edits what should change and may add own instructions.
//  3. "Apply": only the chosen changes are sent as one precise request.
// The plan is read from the AI's plain-text answer, so it keeps working with the existing /api/refine endpoint.

export interface PlanItem { id: string; section: string; text: string; selected: boolean }

export const PLAN_REQUEST = `ANALYSIS ONLY. Do NOT change, add or return any file; return no code.
Compare the reference image with the current page, section by section, from the top header to the footer.
Write a numbered list in the "notes" text. Every line must be exactly: "<number>. <Section name> | <what is different and what it should be>".
Cover, for every section: layout and alignment, spacing, font family/size/weight, colours and background, images and icons, borders/radius/shadows, buttons, text content, and mobile/tablet behaviour.
Mention even small differences. If a section already matches the reference, write "<number>. <Section name> | matches".`;

/** Reads "1. Header | logo is 20px too small" lines. Lines that say "matches" are dropped. */
export function parsePlan(notes: string): PlanItem[] {
  const out: PlanItem[] = [];
  for (const raw of notes.split('\n')) {
    const m = /^\s*(?:[-*]\s*)?(\d{1,3})[.)]\s*(.+)$/.exec(raw);
    if (!m) continue;
    const body = m[2].trim();
    const parts = body.split('|');
    const section = (parts.length > 1 ? parts[0] : 'General').trim().replace(/^\*+|\*+$/g, '') || 'General';
    const text = (parts.length > 1 ? parts.slice(1).join('|') : body).trim();
    if (!text || /^(matches|ok|no change|same)\.?$/i.test(text)) continue;
    out.push({ id: `p${m[1]}`, section, text, selected: true });
  }
  return out;
}

/** The request sent for the "apply" step. Only the selected items and the user's own words are included. */
export function buildApplyRequest(items: PlanItem[], extra: string): string {
  const chosen = items.filter((i) => i.selected);
  const lines: string[] = [];
  if (chosen.length) {
    lines.push('Apply exactly these changes so the page matches the reference image pixel for pixel. Change nothing else.');
    chosen.forEach((i, n) => lines.push(`${n + 1}. [${i.section}] ${i.text}`));
  }
  if (extra.trim()) lines.push('Also, the owner asks: ' + extra.trim());
  lines.push('Keep the page fully responsive (320px to 1920px). Return the complete updated files.');
  return lines.join('\n');
}
