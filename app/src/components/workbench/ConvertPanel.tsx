import React, { useState } from 'react';
import { Platform, View } from 'react-native';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../ui';
import ProposalView, { Proposal } from './ProposalView';
import { ConvertOptions, convertImage, convertPdf, refine } from '../../api';
import { prepareImages, PickedImage } from '../../lib/image';
import { pickOne, toBase64 } from '../../lib/pickCode';
import { toProposed } from '../../lib/proposal';
import { stripManaged } from '../../lib/managed';
import { WBCtx } from './types';

const BP = [360, 480, 640, 768, 1024, 1280, 1536];

export default function ConvertPanel(ctx: WBCtx) {
  const t = useTheme();
  const [opts, setOpts] = useState<ConvertOptions>({ framework: 'html', language: 'javascript', cssFramework: 'none', breakpoints: [480, 768, 1024], animation: 'subtle' });
  const [src, setSrc] = useState<{ name: string; kind: 'image' | 'pdf'; tiles?: PickedImage[]; pdf?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [prop, setProp] = useState<Proposal | null>(null);
  const clean = stripManaged(ctx.files);
  const o = (p: Partial<ConvertOptions>) => setOpts({ ...opts, ...p });
  const fail = (e: any) => setErr(e.quota ? `AI quota reached. ${e.message}` : e.unconfigured ? `AI is not configured on the server: ${e.message}` : e.message || 'Failed.');

  const pick = async () => {
    setErr(''); setBusy(true);
    try {
      const f = await pickOne(['image/png', 'image/jpeg', 'image/webp', 'application/pdf']);
      if (!f) return;
      if (/\.pdf$/i.test(f.name) || (f.bytes[0] === 0x25 && f.bytes[1] === 0x50)) setSrc({ name: f.name, kind: 'pdf', pdf: toBase64(f.bytes) });
      else { const r = await prepareImages(f.uri); setSrc({ name: f.name, kind: 'image', tiles: r.tiles }); }
    } catch (e: any) { fail(e); } finally { setBusy(false); }
  };

  const toProposal = (title: string, files: { path: string; content: string }[], notes?: string, extra?: Partial<Proposal>) => {
    const { files: pf, warnings } = toProposed(files, clean);
    setProp({ title, files: pf, notes, warnings: [...warnings, ...(extra?.warnings || [])], explanation: extra?.explanation, disclaimer: 'Generated code is a starting point: check it against the design and test it.' });
  };

  const convert = async () => {
    if (!src) return;
    setBusy(true); setErr(''); setProp(null);
    try {
      const styling = opts.cssFramework === 'bootstrap' || opts.cssFramework === 'tailwind' ? opts.cssFramework : undefined;
      const body = { options: { ...opts, styling }, instructions: ctx.project.instructions.filter((i) => i.enabled).map((i) => i.text) };
      const r = src.kind === 'pdf' ? await convertPdf(ctx.server, { base64: src.pdf!, ...body }) : await convertImage(ctx.server, { images: src.tiles!, ...body });
      toProposal('Generated project', r.files, r.notes, { explanation: r.pdf ? `PDF: ${r.pdf.pages} page(s), ${r.pdf.textChars} characters of text, read via ${r.pdf.method}.` : undefined });
    } catch (e: any) { fail(e); } finally { setBusy(false); }
  };

  // Re-generate ONE file against the reference image (existing /api/refine endpoint, which already accepts an image).
  const ref = ctx.project.referenceImage ?? (src?.tiles?.[0] ? { base64: src.tiles[0].base64, mime: src.tiles[0].mime } : null);
  const regenerate = async () => {
    const cur = clean.find((f) => f.path === ctx.current);
    if (!cur) return;
    setBusy(true); setErr(''); setProp(null);
    try {
      const r = await refine(ctx.server, { files: clean, request: `Regenerate ONLY the file "${cur.path}" so it matches the attached design image more closely. Return only that file. Keep every other file and every section id unchanged.`, target: ctx.project.target,
        instructions: ctx.project.instructions.filter((i) => i.enabled).map((i) => i.text), ...(ref ? { imageBase64: ref.base64, mime: ref.mime } : {}) });
      toProposal(`Regenerated ${cur.path}`, r.files.filter((f) => f.path === cur.path), r.notes);
    } catch (e: any) { fail(e); } finally { setBusy(false); }
  };

  const Group = ({ label, children }: { label: string; children: React.ReactNode }) => <View style={{ gap: 4 }}><Txt size={12} sub>{label}</Txt><View style={row}>{children}</View></View>;

  return (
    <View style={{ gap: 10 }}>
      <Card style={{ gap: 8 }}>
        <Txt bold size={15}>Image / PDF → code</Txt>
        <Txt size={12} sub>Upload a screenshot, wireframe or PDF design. The result is shown as a proposal next to your current files: you accept or reject it, and nothing is overwritten before that.</Txt>
        <View style={row}>
          <Btn small label={src ? 'Choose another' : 'Choose image or PDF'} onPress={pick} disabled={busy} />
          {src && <Txt size={12}>{src.kind === 'pdf' ? '📄' : '🖼'} {src.name}{src.tiles ? ` (${src.tiles.length} slice${src.tiles.length > 1 ? 's' : ''})` : ''}</Txt>}
        </View>
        <Txt size={11} sub>PDFs need AI_PROVIDER=gemini on the server. Scanned PDFs are read visually by the AI model; there is no separate OCR engine.</Txt>
      </Card>

      <Card style={{ gap: 8 }}>
        <Txt bold size={14}>Output options</Txt>
        <Group label="Framework">{(['html', 'react', 'vue', 'svelte', 'nextjs'] as const).map((f) => <Chip key={f} label={f === 'html' ? 'HTML/CSS/JS' : f} active={opts.framework === f} onPress={() => o({ framework: f })} />)}</Group>
        <Group label="Language">{(['javascript', 'typescript'] as const).map((f) => <Chip key={f} label={f} active={opts.language === f} onPress={() => o({ language: f })} />)}</Group>
        <Group label="CSS framework">{(['none', 'bootstrap', 'tailwind'] as const).map((f) => <Chip key={f} label={f} active={opts.cssFramework === f} onPress={() => o({ cssFramework: f })} />)}</Group>
        <Group label="Styling approach">{['css', 'scss', 'css-modules', 'styled-components'].map((f) => <Chip key={f} label={f} active={opts.styling === f} onPress={() => o({ styling: opts.styling === f ? undefined : f })} />)}</Group>
        <Group label="Responsive breakpoints (px)">{BP.map((b) => <Chip key={b} label={String(b)} active={!!opts.breakpoints?.includes(b)} onPress={() => o({ breakpoints: opts.breakpoints?.includes(b) ? opts.breakpoints.filter((x) => x !== b) : [...(opts.breakpoints || []), b].sort((a, c) => a - c).slice(0, 6) })} />)}</Group>
        <Group label="Animation">{(['none', 'subtle', 'rich'] as const).map((f) => <Chip key={f} label={f} active={opts.animation === f} onPress={() => o({ animation: f })} />)}</Group>
        <Input value={opts.font ?? ''} onChangeText={(v) => o({ font: v.replace(/[^\w \-]/g, '').slice(0, 40) || undefined })} placeholder="Preferred font (e.g. Inter, Poppins)" autoCapitalize="words" />
        <Btn label={busy ? 'Working…' : 'Generate multi-file project'} disabled={busy || !src} onPress={convert} />
      </Card>

      <Card style={{ gap: 6 }}>
        <Txt bold size={14}>Fix one file</Txt>
        <Txt size={12} sub>Regenerate only the file open in the editor ({ctx.current || 'none'}) against {ref ? 'the reference image' : 'a design image (choose one above first)'}. Other files stay untouched.</Txt>
        <Btn small kind="ghost" label="Regenerate this file" disabled={busy || !ref || !ctx.current} onPress={regenerate} />
        <Txt size={12} sub>To change just one section: select the code in the editor, then use Assistant → Refactor with your instruction.</Txt>
      </Card>

      {!!err && <Card><Txt style={{ color: t.danger }}>{err}</Txt></Card>}
      {prop && (
        <ProposalView proposal={prop} current={clean} onOpen={ctx.openFile} onReject={() => setProp(null)}
          onApply={(next, created, modified) => { ctx.applyFiles(next, 'Image/PDF conversion'); ctx.toast(`Applied: ${created.length} created, ${modified.length} modified. Snapshot saved.`); setProp(null); }} />
      )}
      {Platform.OS !== 'web' && <Txt size={11} sub>On phones, very large images are scaled and sliced before upload.</Txt>}
    </View>
  );
}
