import React, { useEffect, useRef, useState } from 'react';
import { Image, Platform, ScrollView, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Btn, Card, Chip, Input, Txt, row } from '../components/ui';
import { Project, ProjectAsset, SavedComponent, Target, uid } from '../types';
import { prepareImages, readBase64, PickedImage, ImageQuality } from '../lib/image';
import { generate, refine } from '../api';
import { ASSET_TOTAL_LIMIT, Settings, saveAssets } from '../storage';
import { assetsFromZipUri, pickLooseAssets, pickZipAssets } from '../lib/pickImages';
import { dataUri, fixRefs, formatBytes, mergeAssets, totalBytes } from '../lib/assets';
import { describeAssets } from '../lib/imageMeta';
import { kitInstructions, kitSummary } from '../lib/layoutKit';
import { defaultMotion, paletteFromFiles, paletteFromImage } from '../lib/autoMotion';
import { applyManaged } from '../lib/managed';

const TARGETS: { id: Target; label: string; help: string }[] = [
  { id: 'bootstrap', label: 'HTML + CSS + Bootstrap 5 + JS', help: 'One combined option: index.html, styles.css, script.js, using Bootstrap 5 grid/classes plus your custom CSS. Recommended.' },
  { id: 'html', label: 'HTML + CSS + JS (no framework)', help: 'Plain files without any CSS framework.' },
  { id: 'tailwind', label: 'Tailwind CSS', help: 'HTML using Tailwind utility classes (CDN).' },
];

const MAX_PDF_BYTES = 12 * 1024 * 1024;

interface PickedPdf { name: string; size: number; base64: string }

export default function NewProject(props: {
  settings: Settings;
  components: SavedComponent[];
  onOpenComponents: () => void;
  onBack: () => void;
  onCreated: (p: Project) => Promise<void>;
}) {
  const [img, setImg] = useState<PickedImage | null>(null); // small preview kept with the project
  const [tiles, setTiles] = useState<PickedImage[]>([]); // full-quality slices sent to the AI
  const [deep, setDeep] = useState(true);
  const [quality, setQuality] = useState<ImageQuality>('hd');
  const [imgBytes, setImgBytes] = useState(0);
  const [palette, setPalette] = useState<string[]>([]);
  const [autoMotion, setAutoMotion] = useState(true);
  const [makeContactPage, setMakeContactPage] = useState(false);
  const [makeAppointmentPage, setMakeAppointmentPage] = useState(false);
  const lastUri = useRef('');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [pdf, setPdf] = useState<PickedPdf | null>(null);
  const [assets, setAssets] = useState<ProjectAsset[]>([]); // the user's own images (from a ZIP or picked one by one)
  const [assetMsg, setAssetMsg] = useState('');
  const assetsRef = useRef<ProjectAsset[]>([]);
  assetsRef.current = assets;
  const [name, setName] = useState('My website');
  const [target, setTarget] = useState<Target>('bootstrap');
  const [instr, setInstr] = useState('');
  const [busy, setBusy] = useState('');
  const [working, setWorking] = useState(false); // true only while the AI is generating
  const [elapsed, setElapsed] = useState(0);
  const [err, setErr] = useState('');
  const [big, setBig] = useState(false);
  const started = useRef(0);

  // Elapsed-seconds counter so a long PDF analysis visibly "waits" instead of looking frozen.
  useEffect(() => {
    if (!working) return;
    started.current = Date.now();
    setElapsed(0);
    const h = setInterval(() => setElapsed(Math.floor((Date.now() - started.current) / 1000)), 1000);
    return () => clearInterval(h);
  }, [working]);

  const loadImage = async (uri: string, q: ImageQuality = quality) => {
    try {
      lastUri.current = uri;
      setBusy(`Enhancing image: scaling to ${q === '4k' ? '4K (3840px)' : 'HD (1920px)'} width and slicing it so every part is analyzed at full detail...`); setErr('');
      const r = await prepareImages(uri, q);
      setImg(r.preview); setTiles(r.tiles); setPdf(null); setImgBytes(r.bytes);
      paletteFromImage(r.preview.base64, r.preview.mime).then(setPalette); // brand colours for the light hover tints
      setBusy('');
      setErr('');
    } catch (e: any) { setErr(e.message || 'Could not open that image.'); }
    finally { setBusy(''); }
  };

  const loadPdf = async (uri: string, fileName: string, size?: number) => {
    try {
      if (size && size > MAX_PDF_BYTES) throw new Error('PDF is too large (max 12 MB). Compress it or export fewer pages.');
      setBusy(`Reading PDF "${fileName}"...`); setErr('');
      const base64 = await readBase64(uri);
      const realSize = Math.round((base64.length * 3) / 4);
      if (realSize > MAX_PDF_BYTES) throw new Error('PDF is too large (max 12 MB). Compress it or export fewer pages.');
      setPdf({ name: fileName, size: realSize, base64 }); setImg(null); setTiles([]);
    } catch (e: any) { setErr(e.message || 'Could not read that PDF.'); }
    finally { setBusy(''); }
  };

  const pickImage = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: false });
    if (!r.canceled) await loadImage(r.assets[0].uri);
  };
  const pickCrop = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1, allowsEditing: true });
    if (!r.canceled) await loadImage(r.assets[0].uri);
  };
  const pickPdf = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
    if (!r.canceled) await loadPdf(r.assets[0].uri, r.assets[0].name, r.assets[0].size ?? undefined);
  };

  const addAssets = async (getter: (existing: ProjectAsset[]) => Promise<{ assets: ProjectAsset[]; message: string } | null>) => {
    try {
      setBusy('Reading images...'); setErr('');
      const r = await getter(assetsRef.current);
      if (r) { setAssets((cur) => mergeAssets(cur, r.assets)); setAssetMsg(r.message); }
    } catch (e: any) { setErr(e.message || 'Could not read the images.'); }
    finally { setBusy(''); }
  };

  // Clipboard paste + drag-drop (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const fromFile = (f: File) => {
      // A ZIP is always "my images". A single PNG/JPG/WebP is the design, a PDF is the design.
      if (/\.zip$/i.test(f.name) || f.type === 'application/zip' || f.type === 'application/x-zip-compressed') { addAssets((existing) => assetsFromZipUri(URL.createObjectURL(f), existing)); return; }
      if (f.type === 'application/pdf') { loadPdf(URL.createObjectURL(f), f.name, f.size); return; }
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(f.type)) { setErr('Drop a design (PNG, JPG, WebP or PDF) or a ZIP with your images.'); return; }
      loadImage(URL.createObjectURL(f));
    };
    const onPaste = (e: ClipboardEvent) => { const f = Array.from(e.clipboardData?.files || [])[0]; if (f) fromFile(f); };
    const onDrop = (e: DragEvent) => { e.preventDefault(); const f = e.dataTransfer?.files?.[0]; if (f) fromFile(f); };
    const onOver = (e: DragEvent) => e.preventDefault();
    window.addEventListener('paste', onPaste);
    window.addEventListener('drop', onDrop);
    window.addEventListener('dragover', onOver);
    return () => { window.removeEventListener('paste', onPaste); window.removeEventListener('drop', onDrop); window.removeEventListener('dragover', onOver); };
  }, []);

  const go = async () => {
    if ((!img || !tiles.length) && !pdf) return;
    setErr('');
    setWorking(true);
    try {
      const instructions = instr.split('\n').map((x) => x.trim()).filter(Boolean);
      setBusy(pdf
        ? `Uploading ${(pdf.size / 1024 / 1024).toFixed(1)} MB PDF and analyzing every page. This can take 1-4 minutes. Keep this tab open.`
        : deep
          ? `Step 1/2: studying all ${tiles.length} image part(s) in detail, then Step 2/2: writing the code. This can take 2-6 minutes. Keep this tab open.`
          : 'Analyzing screenshot and generating code (can take up to a minute)...');
      const chosen = props.components.filter((c) => picked[c.id] !== false); // all selected unless switched off
      // Images that came inside a header/footer ZIP are added to the project so the reused code shows them.
      const allAssets = mergeAssets(assets, chosen.flatMap((c) => c.assets || []));
      const assetInfo = allAssets.length ? await describeAssets(allAssets) : undefined; // names + pixel sizes only, never the image bytes
      const res = await generate(props.settings, {
        images: pdf ? [{ base64: pdf.base64, mime: 'application/pdf' }] : tiles,
        target, instructions: [...instructions, ...kitInstructions(chosen)], // kit rules are sent now but not saved as permanent project rules
        components: chosen.map((c) => ({ name: c.name, notes: [c.notes, c.analysis ? kitSummary(c.analysis) : ''].filter(Boolean).join(' | '), html: c.html, css: c.css, js: c.js })),
        deep,
        assets: assetInfo,
      });
      if (res.notes) setErr('');
      const now = Date.now();
      // Safety net after the AI: rewrite image paths that only differ by case/folder (Logo.PNG -> images/logo.png).
      let files = allAssets.length ? fixRefs(res.files, allAssets).files : res.files;
      if (makeContactPage || makeAppointmentPage) {
        setBusy('Analyzing the generated homepage and creating your selected pages...');
        const pageNames = [makeContactPage ? 'contact.html' : '', makeAppointmentPage ? 'book-appointment.html' : ''].filter(Boolean).join(' and ');
        const pages = await refine(props.settings, {
          files, target, instructions, imageBase64: img?.base64, mime: img?.mime,
          request: `Analyze this generated homepage and its brand, services, colors, typography and layout. Create ${pageNames} as complete responsive pages matching the homepage identity while using distinct page layouts. ${makeContactPage ? 'Contact page must show real phone, email and address only if present in project content; otherwise use editable [ADD PHONE], [ADD EMAIL], [ADD ADDRESS] placeholders. Include a contact form and an embedded Google Maps iframe using an editable map query/address placeholder.' : ''} ${makeAppointmentPage ? 'Appointment page must include service, date, time, name, phone and email fields, client-side validation and a local confirmation state. Do not claim to submit a real booking.' : ''} Add navigation links from homepage to each generated page. Use accessible HTML, responsive CSS and tasteful motion with prefers-reduced-motion support. Preserve all existing files and return complete files.`
        });
        files = pages.files;
      }
      const id = uid();
      if (allAssets.length) await saveAssets(id, allAssets);
      const project: Project = {
        id, name: name.trim() || 'Untitled', createdAt: now, updatedAt: now, target, favorite: false,
        referenceImage: img ?? undefined,
        referenceFile: pdf ? { name: pdf.name, size: pdf.size, mime: 'application/pdf' } : undefined,
        files,
        assets: allAssets.length ? allAssets.map((a) => ({ path: a.path, mime: a.mime, bytes: Math.floor((a.base64.length * 3) / 4) })) : undefined,
        instructions: instructions.map((text) => ({ id: uid(), text, enabled: true })),
        fonts: {}, animations: [], sectionStyles: {},
        versions: [{ id: uid(), label: 'First generation', createdAt: now, files }],
      };
      // Light card hover + reveal animations, tinted with the design's own colours (can be switched off in the editor, Design tab).
      if (autoMotion) {
        project.motion = defaultMotion(palette.length ? palette : paletteFromFiles(files));
        project.files = applyManaged(project);
      }
      await props.onCreated(project);
    } catch (e: any) {
      setErr(e.message || 'Generation failed.');
    } finally { setBusy(''); setWorking(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12, maxWidth: 700, width: '100%', alignSelf: 'center' }}>
      <View style={row}><Btn small kind="ghost" label="< Back" onPress={props.onBack} disabled={working} /><Txt bold size={20}>New project</Txt></View>
      <Card style={{ gap: 8 }}>
        <Txt bold>1. Design file</Txt>
        <Txt sub size={12}>
          Screenshot (PNG, JPG, WebP) or a design PDF (up to 12 MB, all pages are analyzed). {Platform.OS === 'web' ? 'You can also drag a file here or paste an image with Ctrl+V. ' : ''}
          PDFs need AI_PROVIDER=gemini on the server. Images are scaled to 1920px wide and tall pages are sliced so every part is read in detail. Enlarging a small or blurry image helps the AI read it but cannot invent missing detail.
        </Txt>
        <View style={row}>
          <Btn label="Choose image" onPress={pickImage} disabled={working || !!busy} />
          <Btn kind="ghost" label="Choose PDF" onPress={pickPdf} disabled={working || !!busy} />
          {Platform.OS !== 'web' && <Btn kind="ghost" label="Choose + crop" onPress={pickCrop} disabled={working || !!busy} />}
        </View>
        <Txt bold size={13}>Analysis quality</Txt>
        <View style={row}>
          <Chip label="HD 1920px (recommended)" active={quality === 'hd'} onPress={() => { setQuality('hd'); if (lastUri.current && img) loadImage(lastUri.current, 'hd'); }} />
          <Chip label="4K 3840px (small text, big upload)" active={quality === '4k'} onPress={() => { setQuality('4k'); if (lastUri.current && img) loadImage(lastUri.current, '4k'); }} />
        </View>
        {quality === '4k' && <Txt sub size={12}>4K sends about 4x more pixels. The server must accept large requests and your AI provider may reject or shrink very large images. If generation fails, switch back to HD.</Txt>}
        {!!img && <Txt sub size={12}>{tiles.length} slice(s), about {(imgBytes / 1024 / 1024).toFixed(1)} MB will be sent{palette.length ? ` · design colours found: ${palette.join(' ')}` : ''}</Txt>}
        {img && (
          <>
            <Image source={{ uri: `data:${img.mime};base64,${img.base64}` }} resizeMode="contain" style={{ width: '100%', height: big ? 700 : 240, backgroundColor: '#0003' }} />
            <Btn small kind="ghost" label={big ? 'Shrink view' : 'Zoom view'} onPress={() => setBig(!big)} />
          </>
        )}
        {pdf && <Card><Txt bold>PDF loaded: {pdf.name}</Txt><Txt sub size={12}>{(pdf.size / 1024 / 1024).toFixed(1)} MB, ready to analyze</Txt></Card>}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold>1b. My images (optional)</Txt>
        <Txt sub size={12}>
          Put all images of the page in one ZIP (logo, banner, cards ...). They are unpacked into <Txt bold size={12}>images/</Txt>, the AI is told their names and sizes, and the code is written to use them. In the preview and the exported ZIP they are in the right place. {Platform.OS === 'web' ? 'You can drop the ZIP anywhere on this page. ' : ''}Name files clearly (hero-banner.jpg, logo.png): the AI matches by name first. Max {formatBytes(ASSET_TOTAL_LIMIT)} in total, 8 MB per image. Only .zip works (not .rar).
        </Txt>
        <View style={row}>
          <Btn label="Choose images ZIP" onPress={() => addAssets(pickZipAssets)} disabled={working || !!busy} />
          <Btn kind="ghost" label="Add loose images" onPress={() => addAssets(pickLooseAssets)} disabled={working || !!busy} />
          {assets.length > 0 && <Btn kind="ghost" label="Remove all images" onPress={() => { setAssets([]); setAssetMsg(''); }} disabled={working || !!busy} />}
        </View>
        {!!assetMsg && <Txt sub size={12}>{assetMsg}</Txt>}
        {assets.length > 0 && (
          <>
            <Txt bold size={13}>{assets.length} image(s) ready, {formatBytes(totalBytes(assets))}</Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {assets.slice(0, 24).map((a) => (
                <View key={a.path} style={{ width: 96, gap: 2 }}>
                  <Image source={{ uri: dataUri(a) }} resizeMode="contain" style={{ width: 96, height: 56, backgroundColor: '#0002' }} />
                  <Txt size={10} sub>{a.path.replace(/^images\//, '')}</Txt>
                </View>
              ))}
            </View>
            {assets.length > 24 && <Txt sub size={12}>... and {assets.length - 24} more.</Txt>}
          </>
        )}
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold>2. Output</Txt>
        <Input value={name} onChangeText={setName} placeholder="Project name" />
        <View style={row}>{TARGETS.map((t) => <Chip key={t.id} label={t.label} active={target === t.id} onPress={() => setTarget(t.id)} />)}</View>
        <Txt sub size={12}>{TARGETS.find((t) => t.id === target)?.help}</Txt>
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold>3. My saved components</Txt>
        {props.components.length === 0 ? (
          <Txt sub size={12}>None saved yet. Save your own banner, carousel and footer code and the AI will reuse it when the design matches.</Txt>
        ) : (
          <>
            <Txt sub size={12}>The AI reuses a selected component when a section of the design matches it. Tap to switch one off.</Txt>
            <View style={row}>
              {props.components.map((c) => <Chip key={c.id} label={c.name} active={picked[c.id] !== false} onPress={() => setPicked({ ...picked, [c.id]: picked[c.id] === false })} />)}
            </View>
          </>
        )}
        <Btn small kind="ghost" label="Manage components" onPress={props.onOpenComponents} />
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold>3. Extra pages (optional)</Txt>
        <Txt sub size={12}>After generating the homepage, analyze its design and create matching standalone pages. These can also be generated later from Full View.</Txt>
        <View style={row}>
          <Btn small kind={makeContactPage ? 'primary' : 'ghost'} label={makeContactPage ? '✓ Include Contact Us' : '+ Contact Us page'} onPress={() => setMakeContactPage(v => !v)} />
          <Btn small kind={makeAppointmentPage ? 'primary' : 'ghost'} label={makeAppointmentPage ? '✓ Include Appointment' : '+ Book Appointment page'} onPress={() => setMakeAppointmentPage(v => !v)} />
        </View>
        <Txt sub size={11}>Contact details are taken from your content; missing details become editable placeholders. Appointment forms need a booking integration to accept real bookings.</Txt>
      </Card>
      <Card style={{ gap: 6 }}>
        <Txt bold>Auto animations</Txt>
        <Chip label={autoMotion ? 'On: cards and boxes get a light hover + scroll reveal, colours from the design' : 'Off: no automatic animations'} active={autoMotion} onPress={() => setAutoMotion(!autoMotion)} />
        <Txt sub size={12}>Light tints only, never dark. You can switch parts off later in the editor (Design tab, Motion card), including press animations on buttons.</Txt>
      </Card>
      <Card style={{ gap: 6 }}>
        <Txt bold>Deep analysis</Txt>
        <Chip label={deep ? 'On: AI studies the design first, then writes code (slower, more accurate)' : 'Off: single fast pass'} active={deep} onPress={() => setDeep(!deep)} />
        <Txt sub size={12}>Uses 2 AI requests, so free limits are reached sooner.</Txt>
      </Card>
      <Card style={{ gap: 8 }}>
        <Txt bold>4. Instructions (optional, one per line)</Txt>
        <Input multiline value={instr} onChangeText={setInstr} style={{ minHeight: 80 }}
          placeholder={'Use my saved banner for the top banner section\nUse carousel 1 for the achievers slider\nUse my saved footer'} />
        <Txt sub size={12}>These are saved with the project and applied to every generation and refinement. You can edit them later.</Txt>
      </Card>
      {!!err && <Card><Txt style={{ color: '#ff5d6c' }}>{err}</Txt></Card>}
      {!!busy && (
        <Card style={{ gap: 4 }}>
          <Txt>{busy}</Txt>
          {working && <Txt sub size={12}>Waiting for the AI... {elapsed}s elapsed. Do not close this page.</Txt>}
        </Card>
      )}
      <Btn label={working ? 'Working...' : 'Generate code'} onPress={go} disabled={(!img && !pdf) || !!busy || working} />
    </ScrollView>
  );
}
