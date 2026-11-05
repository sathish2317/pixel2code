import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { PlacedBlock, ProjectFile, SavedComponent, uid } from '../types';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { Draggable, DropArea, dndEnabled } from '../components/dnd';
import Preview from '../components/Preview';
import FullView from '../components/FullView';
import {
  ACCENT, BLOCKS, CATEGORIES, DEFAULT_THEME, TYPES, Theme, tagsOf, blockFromCode, blockPreviewFiles, blocksFromFiles, composeCss, composeHtml, composeJs,
  composePage, pageFiles, placeFromBlock, placeFromSaved, sharedJsFor,
} from '../lib/blocks';
import { loadBuilder, saveBuilder } from '../storage';
import { saveSingleFile } from '../lib/exporter';
import { confirmAction } from '../lib/confirm';

type View_ = 'blocks' | 'page' | 'code' | 'preview';
type Out = 'html' | 'css' | 'js' | 'page';
const TAG_COLOR: Record<string, string> = { 'Live API': '#0891b2', 'E-commerce': '#ea580c', Form: '#7c3aed', Interactive: '#2563eb', Animated: '#db2777', Classic: '#a16207', Static: '#64748b' };
const SWATCHES = ['#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#0f766e', '#0f172a'];
const noop = () => {};

export default function Blocks(props: {
  components: SavedComponent[];
  onSaveComponent: (c: SavedComponent) => Promise<void>;
  onBack: () => void;
  toast: (s: string) => void;
}) {
  const t = useTheme();
  const { width: winW } = useWindowDimensions();
  const wide = winW >= 1000;

  const [placed, setPlaced] = useState<PlacedBlock[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [cat, setCat] = useState('All');
  const [type, setType] = useState('All');
  const [q, setQ] = useState('');
  const [openPreview, setOpenPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [out, setOut] = useState<Out>('html');
  const [accent, setAccent] = useState(ACCENT);
  const [accentText, setAccentText] = useState(ACCENT);
  const [view, setView] = useState<View_>('blocks');
  const [reload, setReload] = useState(0);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [openSpecs, setOpenSpecs] = useState<string | null>(null);
  const [full, setFull] = useState<{ title: string; files: ProjectFile[] } | null>(null);
  const [device, setDevice] = useState<number | 'full'>('full');
  const first = useRef(true);

  useEffect(() => { loadBuilder().then((l) => { setPlaced(l); setLoaded(true); }); }, []);

  // Save the canvas (debounced) so the page you built is still there next time.
  useEffect(() => {
    if (!loaded) return;
    if (first.current) { first.current = false; return; }
    const h = setTimeout(() => { saveBuilder(placed).catch((e) => props.toast(e.message || 'Could not save the page.')); }, 500);
    return () => clearTimeout(h);
  }, [placed, loaded]);

  const insert = (b: PlacedBlock, at?: number) => {
    setPlaced((cur) => { const a = [...cur]; a.splice(at === undefined ? a.length : Math.max(0, Math.min(at, a.length)), 0, b); return a; });
    setReload((r) => r + 1);
  };
  const update = (id: string, patch: Partial<PlacedBlock>) => { setPlaced((cur) => cur.map((p) => (p.id === id ? { ...p, ...patch } : p))); setReload((r) => r + 1); };
  const move = (id: string, to: number) => {
    setPlaced((cur) => {
      const from = cur.findIndex((p) => p.id === id);
      if (from < 0) return cur;
      const a = [...cur];
      const [item] = a.splice(from, 1);
      a.splice(Math.max(0, Math.min(to > from ? to - 1 : to, a.length)), 0, item);
      return a;
    });
    setReload((r) => r + 1);
  };
  const remove = (id: string) => { setPlaced((cur) => cur.filter((p) => p.id !== id)); setReload((r) => r + 1); if (editing === id) setEditing(null); };

  /** Something was dropped (or the Add button pressed) at position `at`. */
  const onData = useCallback((data: string, at?: number) => {
    const [kind, ...rest] = data.split(':');
    const id = rest.join(':');
    if (kind === 'lib') { const b = BLOCKS.find((x) => x.id === id); if (b) insert(placeFromBlock(b), at); }
    else if (kind === 'saved') { const c = props.components.find((x) => x.id === id); if (c) insert(placeFromSaved(c), at); }
    else if (kind === 'move') move(id, at === undefined ? Number.MAX_SAFE_INTEGER : at);
  }, [props.components]);

  const onText = (text: string) => { if (text.trim()) { insert(blockFromCode('Pasted code', text)); props.toast('Code added as a block. Use Edit code to name or fix it.'); } };
  const onFiles = async (files: File[]) => {
    const ok = files.filter((f) => /\.(html?|css|js|txt)$/i.test(f.name) && f.size < 300_000);
    if (!ok.length) { props.toast('Drop .html, .css, .js or .txt files (max 300 KB each).'); return; }
    try {
      const list = await Promise.all(ok.map(async (f) => ({ name: f.name, text: await f.text() })));
      const blocks = blocksFromFiles(list);
      blocks.forEach((b) => insert(b));
      props.toast(`${blocks.length} block(s) added from ${ok.length} file(s). Files with the same name (card.html + card.css) became one block.`);
    } catch { props.toast('Could not read the dropped files.'); }
  };

  // ---- output ----
  const html = useMemo(() => composeHtml(placed, accent), [placed, accent]);
  const css = useMemo(() => composeCss(placed, accent, theme), [placed, accent, theme]);
  const js = useMemo(() => composeJs(placed), [placed]);
  const page = useMemo(() => composePage(placed, accent, 'My page', theme), [placed, accent, theme]);
  const text = out === 'html' ? html : out === 'css' ? css : out === 'js' ? js : page;
  const files = useMemo(() => pageFiles(placed, accent, theme), [placed, accent, theme]);

  const copy = async (s: string, label: string) => {
    if (!s.trim()) { props.toast('Nothing to copy yet. Add a block first.'); return; }
    await Clipboard.setStringAsync(s);
    props.toast(`${label} copied.`);
  };

  const applyAccent = (v: string) => {
    setAccentText(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) setAccent(v.toLowerCase());
  };

  // ---- palette ----
  const list = useMemo(() => BLOCKS.filter((b) => (cat === 'All' || cat === b.category) && (type === 'All' || tagsOf(b).includes(type)) && (!q.trim() || (b.name + ' ' + b.description + ' ' + b.category + ' ' + tagsOf(b).join(' ')).toLowerCase().includes(q.toLowerCase()))), [cat, type, q]);
  const showMine = cat === 'All' || cat === 'My components';
  const mine = props.components.filter((c) => !q.trim() || c.name.toLowerCase().includes(q.toLowerCase()));

  const palette = (
    <View style={{ gap: 10 }}>
      <Txt bold size={16}>Block library</Txt>
      <Txt sub size={12}>
        {dndEnabled ? 'Drag a block into "My page", or press Add. ' : 'Press Add to put a block into "My page". '}
        All blocks are plain HTML + CSS (+ a little JS), no framework, and every class starts with bk- so they never clash with your site.
      </Txt>
      <Input placeholder="Search blocks (hero, form, footer ...)" value={q} onChangeText={setQ} autoCapitalize="none" />
      <View style={row}>{CATEGORIES.map((c) => <Chip key={c} label={c} active={cat === c} onPress={() => setCat(c)} />)}</View>
      <Txt sub size={12}>Type (what the block does):</Txt>
      <View style={row}>{['All', ...TYPES].map((c) => <Chip key={c} label={c} active={type === c} onPress={() => setType(c)} />)}</View>
      {list.map((b) => (
        <Draggable key={b.id} data={'lib:' + b.id}>
          <Card style={{ gap: 6 }}>
            <View style={row}><Txt bold style={{ flexShrink: 1 }}>{b.name}</Txt><Txt sub size={11}>{b.category}</Txt></View>
            <View style={row}>{tagsOf(b).map((x) => <Txt key={x} size={11} bold style={{ color: TAG_COLOR[x] || t.text, borderWidth: 1, borderColor: TAG_COLOR[x] || t.border, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>{x}</Txt>)}</View>
            <Txt sub size={12}>{b.description}</Txt>
            <View style={row}>
              <Btn small label="Add" onPress={() => { insert(placeFromBlock(b)); if (!wide) props.toast(`"${b.name}" added to My page.`); }} />
              <Btn small kind="ghost" label={openPreview === b.id ? 'Hide preview' : 'Preview'} onPress={() => setOpenPreview(openPreview === b.id ? null : b.id)} />
              <Btn small kind="ghost" label="Full screen" onPress={() => setFull({ title: b.name, files: blockPreviewFiles(placeFromBlock(b), accent, theme) })} />
              {!!b.specs && <Btn small kind="ghost" label={openSpecs === b.id ? 'Hide specs' : 'Specs'} onPress={() => setOpenSpecs(openSpecs === b.id ? null : b.id)} />}
            </View>
            {openSpecs === b.id && !!b.specs && (
              <View style={{ gap: 3 }}>
                {b.specs.map((x) => <Txt key={x} sub size={12}>{'• ' + x}</Txt>)}
              </View>
            )}
            {openPreview === b.id && (
              <View style={{ height: 300, borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden' }}>
                <Preview files={blockPreviewFiles(placeFromBlock(b), accent, theme)} width="full" reloadKey={0} onMessage={noop} />
              </View>
            )}
          </Card>
        </Draggable>
      ))}
      {showMine && mine.length > 0 && <Txt bold style={{ marginTop: 6 }}>My components</Txt>}
      {showMine && mine.map((c) => (
        <Draggable key={c.id} data={'saved:' + c.id}>
          <Card style={{ gap: 6 }}>
            <Txt bold>{c.name}</Txt>
            {!!c.notes && <Txt sub size={12}>{c.notes}</Txt>}
            <Btn small label="Add" onPress={() => insert(placeFromSaved(c))} />
          </Card>
        </Draggable>
      ))}
      {list.length === 0 && !(showMine && mine.length) && <Card><Txt sub>No block matches. Try another word or category.</Txt></Card>}
    </View>
  );

  // ---- canvas ----
  const dropStyle = { borderWidth: 2, borderStyle: 'dashed', borderColor: t.border, borderRadius: 14, padding: 10, minHeight: 90 };
  const overStyle = { borderColor: t.primary, backgroundColor: t.primary + '22' };

  const canvas = (
    <View style={{ gap: 10 }}>
      <Txt bold size={16}>My page ({placed.length} block{placed.length === 1 ? '' : 's'})</Txt>
      <Txt sub size={12}>
        {dndEnabled ? 'Drop blocks here, drag a block up or down to reorder. You can also drop .html / .css / .js files, or selected code text. ' : ''}
        Your page is saved on this device.
      </Txt>
      <View style={row}>
        <Btn small kind="ghost" label="+ Blank block (paste my code)" onPress={() => { const b = blockFromCode('My code', ''); insert(b); setEditing(b.id); }} />
        {placed.length > 0 && <Btn small kind="danger" label="Clear page" onPress={() => confirmAction('Clear the page?', 'All blocks on "My page" are removed. The block library and My components are not touched.', 'Clear', () => { setPlaced([]); setEditing(null); setReload((r) => r + 1); })} />}
      </View>
      <DropArea onData={(d) => onData(d)} onFiles={onFiles} onText={onText} style={dropStyle} overStyle={overStyle}>
        <View style={{ gap: 8 }}>
          {placed.length === 0 && <Txt sub>{dndEnabled ? 'Drag a block here' : 'Press Add on a block'} to start your page.</Txt>}
          {placed.map((p, i) => (
            <DropArea key={p.id} onData={(d) => onData(d, i)} onFiles={onFiles} onText={onText} style={{ borderRadius: 12 }} overStyle={{ outline: `2px solid ${t.primary}` }}>
              <Draggable data={'move:' + p.id}>
                <Card style={{ gap: 6 }}>
                  <View style={row}>
                    <Txt sub>{dndEnabled ? '::' : ''}</Txt>
                    <Txt bold style={{ flexShrink: 1 }}>{i + 1}. {p.name}</Txt>
                  </View>
                  <View style={row}>
                    <Btn small kind="ghost" label="Up" onPress={() => move(p.id, i - 1)} disabled={i === 0} />
                    <Btn small kind="ghost" label="Down" onPress={() => move(p.id, i + 2)} disabled={i === placed.length - 1} />
                    <Btn small kind="ghost" label={editing === p.id ? 'Close code' : 'Edit code'} onPress={() => setEditing(editing === p.id ? null : p.id)} />
                    <Btn small kind="ghost" label="Duplicate" onPress={() => insert({ ...p, id: uid() }, i + 1)} />
                    <Btn small kind="ghost" label="Save to My components" onPress={async () => {
                      try {
                        await props.onSaveComponent({ id: uid(), name: p.name, notes: 'Saved from Code Blocks', html: p.html, css: composeCss([p], accent, theme), js: [sharedJsFor([p]), p.js].filter(Boolean).join('\n'), updatedAt: Date.now() });
                        props.toast('Saved to My components. The AI can reuse it when you generate a project.');
                      } catch (e: any) { props.toast(e.message || 'Save failed.'); }
                    }} />
                    <Btn small kind="danger" label="Remove" onPress={() => remove(p.id)} />
                  </View>
                  {editing === p.id && (
                    <View style={{ gap: 6 }}>
                      <Input value={p.name} onChangeText={(v) => update(p.id, { name: v })} placeholder="Block name" />
                      <Txt bold size={12}>HTML</Txt>
                      <Input mono multiline value={p.html} onChangeText={(v) => update(p.id, { html: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 140, textAlignVertical: 'top', fontSize: 12 }} />
                      <Txt bold size={12}>CSS</Txt>
                      <Input mono multiline value={p.css} onChangeText={(v) => update(p.id, { css: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 100, textAlignVertical: 'top', fontSize: 12 }} />
                      <Txt bold size={12}>JavaScript</Txt>
                      <Input mono multiline value={p.js} onChangeText={(v) => update(p.id, { js: v })} autoCapitalize="none" autoCorrect={false} spellCheck={false} style={{ minHeight: 80, textAlignVertical: 'top', fontSize: 12 }} />
                      <Txt sub size={11}>Shared button / form / layout CSS of library blocks is added automatically in the combined CSS.</Txt>
                    </View>
                  )}
                </Card>
              </Draggable>
            </DropArea>
          ))}
        </View>
      </DropArea>
    </View>
  );

  // ---- code output ----
  const codePanel = (
    <View style={{ gap: 8 }}>
      <Txt bold size={16}>Copy the code</Txt>
      <View style={row}>
        <Txt sub size={12}>Accent color:</Txt>
        {SWATCHES.map((c) => (
          <Pressable key={c} onPress={() => applyAccent(c)} accessibilityRole="button" accessibilityLabel={'Accent color ' + c}
            style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, borderWidth: accent === c ? 3 : 1, borderColor: accent === c ? t.text : t.border }} />
        ))}
        <Input style={{ width: 110 }} value={accentText} onChangeText={applyAccent} autoCapitalize="none" placeholder="#2563eb" />
      </View>
      <Txt bold size={13}>Design settings (Pro blocks)</Txt>
      <View style={row}>
        <Txt sub size={12}>Corners:</Txt>
        {([['sharp', 'Sharp'], ['soft', 'Soft'], ['round', 'Round']] as [Theme['radius'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.radius === k} onPress={() => { setTheme({ ...theme, radius: k }); setReload((r) => r + 1); }} />)}
        <Txt sub size={12}>Headings:</Txt>
        {([['sans', 'Modern'], ['serif', 'Classic serif']] as [Theme['font'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.font === k} onPress={() => { setTheme({ ...theme, font: k }); setReload((r) => r + 1); }} />)}
        <Txt sub size={12}>Motion:</Txt>
        {([['full', 'Full'], ['subtle', 'Subtle'], ['off', 'Off']] as [Theme['motion'], string][]).map(([k, l]) => <Chip key={k} label={l} active={theme.motion === k} onPress={() => { setTheme({ ...theme, motion: k }); setReload((r) => r + 1); }} />)}
      </View>
      <View style={row}>
        {([['html', 'HTML'], ['css', 'CSS'], ['js', 'JavaScript'], ['page', 'Full page']] as [Out, string][]).map(([k, l]) => <Chip key={k} label={l} active={out === k} onPress={() => setOut(k)} />)}
      </View>
      <View style={row}>
        <Btn small label={`Copy ${out === 'page' ? 'full page' : out.toUpperCase()}`} onPress={() => copy(text, out === 'page' ? 'Full page' : out.toUpperCase())} />
        <Btn small kind="ghost" label="Copy HTML + CSS + JS together" onPress={() => copy(`<!-- HTML -->\n${html}\n\n/* CSS */\n${css}\n\n// JS\n${js}`, 'All code')} />
        <Btn small kind="ghost" label="Download index.html" onPress={async () => { if (!placed.length) { props.toast('Add a block first.'); return; } props.toast(await saveSingleFile({ path: 'index.html', content: page })); }} />
      </View>
      <Input mono multiline editable={false} value={text || '(empty: add a block to My page)'} style={{ minHeight: 260, maxHeight: 420, textAlignVertical: 'top', fontSize: 12 }} />
      <Txt sub size={12}>
        How to use: paste the HTML where the section should be, the CSS into your stylesheet (or a style tag), and the JS before the closing body tag. "Full page" is one file that already has all three. Replace the picsum.photos images with your own, for example images/hero.jpg. Forms only check the fields in the browser; connect them to your server to really send data.
      </Txt>
    </View>
  );

  const DEV: [string, number | 'full'][] = [['Fit', 'full'], ['Phone 390', 390], ['Tablet 820', 820], ['Laptop 1280', 1280]];
  const previewPanel = (
    <View style={{ gap: 6 }}>
      <View style={row}>
        <Txt bold size={16}>Live preview</Txt>
        <Btn small kind="ghost" label="Refresh" onPress={() => setReload((r) => r + 1)} />
        <Btn small label="Full screen (all devices)" onPress={() => { if (!placed.length) { props.toast('Add a block first.'); return; } setFull({ title: 'My page', files }); }} />
      </View>
      <View style={row}>{DEV.map(([l, w]) => <Chip key={l} label={l} active={device === w} onPress={() => setDevice(w)} />)}</View>
      <View style={{ height: 560, borderWidth: 1, borderColor: t.border, borderRadius: 10, overflow: 'hidden', backgroundColor: '#2a2d3a' }}>
        <Preview files={files} width={device} reloadKey={reload} onMessage={noop} />
      </View>
    </View>
  );

  if (!loaded) return <View style={{ padding: 20 }}><Txt>Loading...</Txt></View>;
  if (full) return <FullView files={full.files} title={full.title} onClose={() => setFull(null)} />;

  const header = (
    <View style={[row, { padding: 10, borderBottomWidth: 1, borderColor: t.border }]}>
      <Btn small kind="ghost" label="< Back" onPress={props.onBack} />
      <Txt bold size={20}>Code blocks</Txt>
      <Btn small kind="ghost" label="Full screen preview" onPress={() => { if (!placed.length) { props.toast('Add a block first.'); return; } setFull({ title: 'My page', files }); }} />
    </View>
  );

  if (wide) {
    return (
      <View style={{ flex: 1 }}>
        {header}
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <ScrollView style={{ width: 400, borderRightWidth: 1, borderColor: t.border }} contentContainerStyle={{ padding: 12 }}>{palette}</ScrollView>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12, gap: 18 }}>
            {canvas}
            {codePanel}
            {previewPanel}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {header}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderColor: t.border }} contentContainerStyle={{ padding: 8 }}>
        {([['blocks', 'Blocks'], ['page', `My page (${placed.length})`], ['code', 'Copy code'], ['preview', 'Preview']] as [View_, string][]).map(([k, l]) => <Chip key={k} label={l} active={view === k} onPress={() => setView(k)} />)}
      </ScrollView>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }} keyboardShouldPersistTaps="handled">
        {view === 'blocks' ? palette : view === 'page' ? canvas : view === 'code' ? codePanel : previewPanel}
      </ScrollView>
    </View>
  );
}
