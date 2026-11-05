import { ProjectFile } from '../types';
import { Settings } from '../storage';
import { pdfText } from '../api';
import { Candidate, RawFile, fromFiles, fromPdfText, fromZip } from './attach';
import { isPdf, isZip, toBase64 } from './pickCode';

/** Sorts what the user gave us (loose files, ZIPs, PDFs) into reviewable candidates. Nothing is added to the project here. */
export async function ingest(raws: RawFile[], existing: ProjectFile[], server: Settings): Promise<{ cands: Candidate[]; notes: string[] }> {
  const cands: Candidate[] = [];
  const notes: string[] = [];
  const loose: RawFile[] = [];
  for (const r of raws) {
    if (isZip(r.name, r.bytes)) {
      const z = await fromZip(r.bytes, [...existing, ...cands.filter((c) => c.status !== 'rejected').map((c) => ({ path: c.path, content: c.content }))]);
      if (z.error) notes.push(`${r.name}: ${z.error}`); else { cands.push(...z.candidates); if (z.ignored) notes.push(`${r.name}: ${z.ignored} folder/system files (node_modules, .git ...) were skipped.`); }
    } else if (isPdf(r.name, r.bytes)) {
      try {
        if (r.bytes.length > 14_000_000) throw new Error('PDF is larger than 14 MB.');
        const out = await pdfText(server, toBase64(r.bytes));
        if (out.scanned && out.text.trim().length < 40) notes.push(`${r.name}: no text layer (scanned PDF). No OCR engine is configured, so nothing could be extracted.`);
        else {
          cands.push(...fromPdfText(r.name, out.text, existing));
          notes.push(`${r.name}: extracted text from ${out.pages} page(s)${out.truncated ? ' (truncated)' : ''}${out.scanned ? '; the PDF looks scanned, text may be incomplete' : ''}. It is added as a .txt document.`);
        }
      } catch (e: any) { notes.push(`${r.name}: ${e.message}`); }
    } else loose.push(r);
  }
  if (loose.length) cands.unshift(...fromFiles(loose, existing));
  return { cands, notes };
}
