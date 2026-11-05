/** Small, dependency-free frontend utilities used by the CSS tools and accessibility audit. */
export type AuditSeverity = 'error' | 'warning' | 'info';
export interface AuditIssue { rule: string; severity: AuditSeverity; message: string; suggestion: string; location: string }

export function hexToRgb(input: string): [number, number, number] | null {
  const value = input.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(value)) return value.split('').map((x) => parseInt(x + x, 16)) as [number, number, number];
  if (!/^[\da-f]{6}$/i.test(value)) return null;
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}
function luminance(rgb: [number, number, number]): number {
  const c = rgb.map((v) => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4; });
  return .2126 * c[0] + .7152 * c[1] + .0722 * c[2];
}
export function contrastRatio(foreground: string, background: string): number | null {
  const a = hexToRgb(foreground), b = hexToRgb(background); if (!a || !b) return null;
  const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export function contrastPalette(color: string): string[] {
  const rgb = hexToRgb(color); if (!rgb) return [];
  return ['#000000', '#ffffff', '#0f172a', '#334155', '#64748b'].sort((a, b) => (contrastRatio(color, b) || 0) - (contrastRatio(color, a) || 0));
}
export function makeGradient(from: string, to: string, angle = 135): string { return `background: linear-gradient(${Math.max(0, Math.min(360, angle))}deg, ${from}, ${to});`; }
export function makeShadow(x = 0, y = 12, blur = 30, spread = 0, color = 'rgba(15,23,42,.16)'): string { return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color};`; }
export function makeRadius(tl = 16, tr = tl, br = tl, bl = tl): string { return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`; }
export function makeFlex(gap = 16, align = 'center', justify = 'space-between'): string { return `display: flex;\nflex-wrap: wrap;\nalign-items: ${align};\njustify-content: ${justify};\ngap: ${gap}px;`; }
export function makeGrid(columns = 3, gap = 20): string { return `display: grid;\ngrid-template-columns: repeat(${Math.max(1, Math.min(12, columns))}, minmax(0, 1fr));\ngap: ${gap}px;\n@media (max-width: 720px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n@media (max-width: 480px) { grid-template-columns: 1fr; }`; }

export function auditHtml(html: string): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const add = (rule: string, severity: AuditSeverity, message: string, suggestion: string, location = 'document') => issues.push({ rule, severity, message, suggestion, location });
  if (!/<title\b[^>]*>\s*[^<]+/i.test(html)) add('document-title', 'error', 'The page has no descriptive title.', 'Add a meaningful <title> inside <head>.');
  if (!/<html\b[^>]*\blang\s*=/i.test(html)) add('document-language', 'warning', 'The root HTML element has no language.', 'Set a valid lang attribute, for example <html lang="en">.');
  let m: RegExpExecArray | null;
  const imgs = /<img\b[^>]*>/gi; while ((m = imgs.exec(html))) if (!/\balt\s*=/i.test(m[0])) add('image-alt', 'error', 'An image is missing alternative text.', 'Add concise alt text, or alt="" for a decorative image.', `img at character ${m.index}`);
  const buttons = /<button\b[^>]*>[\s\S]*?<\/button>/gi; while ((m = buttons.exec(html))) if (!/(aria-label|title)\s*=|>\s*[^<\s]/i.test(m[0])) add('button-name', 'error', 'A button may not have an accessible name.', 'Add visible text or an aria-label.', `button at character ${m.index}`);
  const inputs = /<(input|select|textarea)\b[^>]*>/gi; while ((m = inputs.exec(html))) if (!/\baria-label\s*=|\bid\s*=|\btitle\s*=/.test(m[0])) add('input-label', 'warning', 'A form control may not have a label.', 'Associate a <label for="…"> or provide an aria-label.', `${m[1]} at character ${m.index}`);
  const links = /<a\b[^>]*>([\s\S]*?)<\/a>/gi; while ((m = links.exec(html))) if (!m[1].replace(/<[^>]+>/g, '').trim() && !/aria-label|title\s*=/.test(m[0])) add('link-name', 'error', 'A link has no discernible name.', 'Add link text or an aria-label.', `link at character ${m.index}`);
  if (!/<meta\b[^>]*name=["']viewport/i.test(html)) add('viewport', 'warning', 'A responsive viewport declaration is missing.', 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.');
  const h1 = (html.match(/<h1\b/gi) || []).length; if (!h1) add('heading-h1', 'warning', 'No primary page heading was found.', 'Add one descriptive h1 that identifies the page.');
  return issues;
}
