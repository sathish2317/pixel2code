import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, View, useWindowDimensions } from 'react-native';
import { Btn, Card, Chip, Input, Txt, row, useTheme } from '../components/ui';
import { UI_KIT, UI_KIT_CATEGORIES, type UIKitItem, type UIKitCategory } from '../lib/anim/uiKit';


function formatSource(value: string, language: 'HTML' | 'CSS' | 'JS') {
  const input = value.replace(/\r\n?/g, '\n').trim();
  if (!input) return '';
  if (language === 'HTML') {
    const tokens = input.replace(/>\s*</g, '>\n<').match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) || [];
    const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i;
    let depth = 0;
    return tokens.map(token => token.trim()).filter(Boolean).map(token => {
      if (/^<\//.test(token)) depth = Math.max(0, depth - 1);
      const line = `${'  '.repeat(depth)}${token}`;
      const open = token.match(/^<([a-z][\w:-]*)\b[^>]*>$/i);
      if (open && !token.startsWith('</') && !token.endsWith('/>') && !voidTags.test(open[1]) && !/<\/[\w:-]+>\s*$/.test(token)) depth++;
      return line;
    }).join('\n');
  }
  if (language === 'CSS') {
    let depth = 0;
    return input.replace(/\s*([{};])\s*/g, '$1\n').split('\n').map(raw => {
      const line = raw.trim(); if (!line) return '';
      if (line.startsWith('}')) depth = Math.max(0, depth - 1);
      const result = `${'  '.repeat(depth)}${line}`;
      if (line.endsWith('{')) depth++;
      return result;
    }).filter(Boolean).join('\n');
  }
  // Readable structural formatting for vanilla JS snippets without changing their behavior.
  let depth = 0;
  const spaced = input.replace(/\s*([{};])\s*/g, '$1\n');
  return spaced.split('\n').map(raw => {
    const line = raw.trim(); if (!line) return '';
    if (line.startsWith('}')) depth = Math.max(0, depth - 1);
    const result = `${'  '.repeat(depth)}${line}`;
    if (line.endsWith('{')) depth++;
    return result;
  }).filter(Boolean).join('\n');
}

function documentFor(item: UIKitItem) {
  const script = item.js ? `<script>${item.js.replace(/<\/script/gi, '<\\/script')}</script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{margin:0;min-height:100%;background:#0b1220;color:#e8ecf7}body{padding:14px;font-family:Inter,system-ui,sans-serif}${item.css}</style></head><body>${item.html}${script}</body></html>`;
}

export default function ComponentLab({ onBack, toast }: { onBack: () => void; toast: (s: string) => void }) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 1040;
  const [category, setCategory] = useState<'All' | UIKitCategory>('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(UI_KIT[0].id);
  const [tab, setTab] = useState<'HTML' | 'CSS' | 'JS'>('CSS');
  const [reload, setReload] = useState(0);
  const [sourceEdits, setSourceEdits] = useState<Record<string, string>>({});
  const selected = UI_KIT.find(x => x.id === selectedId) || UI_KIT[0];
  const editKey = `${selected.id}:${tab}`;
  const activeItem: UIKitItem = { ...selected, html: sourceEdits[`${selected.id}:HTML`] ?? selected.html, css: sourceEdits[`${selected.id}:CSS`] ?? selected.css, js: sourceEdits[`${selected.id}:JS`] ?? selected.js }; 
  const filtered = useMemo(() => UI_KIT.filter(x => (category === 'All' || x.category === category) && (!query.trim() || `${x.name} ${x.description} ${x.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()))), [category, query]);
  const rawSource = tab === 'HTML' ? activeItem.html : tab === 'JS' ? activeItem.js || '// No JavaScript required for this component.' : activeItem.css;
  const source = sourceEdits[editKey] ?? formatSource(rawSource, tab);
  const copy = async (value: string, label: string) => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try { await navigator.clipboard.writeText(value); toast(`${label} copied.`); }
      catch { toast('Clipboard permission was blocked. Select the code and copy it manually.'); }
    } else toast('Copy is available in the web version.');
  };
  const download = (name: string, value: string, mime: string) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') { toast('Download is available in the web version.'); return; }
    const url = URL.createObjectURL(new Blob([value], { type: mime }));
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast(`${name} downloaded.`);
  };
  const fullCode = `<!-- ${activeItem.name} · Pixel2Code UI Kit -->\n${activeItem.html}\n\n<style>\n${activeItem.css}\n</style>${activeItem.js ? `\n\n<script>\n${activeItem.js}\n</script>` : ''}`;
  const preview = <View style={{ flex: 1, minHeight: 300, borderWidth: 1, borderColor: t.border, borderRadius: 13, overflow: 'hidden', backgroundColor: '#0b1220' }}>
    {Platform.OS === 'web' ? React.createElement('iframe', { key: `${selected.id}-${reload}`, title: `${selected.name} live preview`, srcDoc: documentFor(activeItem), sandbox: 'allow-scripts', style: { width: '100%', height: '100%', minHeight: 300, border: 0, background: '#0b1220' } }) : <View style={{ padding: 18 }}><Txt sub>Open the web version to run the isolated interactive preview.</Txt></View>}
  </View>;
  const details = <View style={{ gap: 12, flex: 1, minWidth: 0 }}>
    <View style={{ gap: 4 }}><View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt bold size={18}>{selected.name}</Txt><View style={row}><Chip label={selected.level} active={selected.level === 'Pro'} onPress={() => {}}/><Chip label={selected.category} onPress={() => {}}/></View></View><Txt sub size={12}>{selected.description}</Txt></View>
    <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt bold size={13}>Live interactive preview</Txt><Btn small kind="ghost" label="↻ Replay" onPress={() => setReload(x => x + 1)}/></View>
    {preview}
    <Card style={{ gap: 10 }}>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt bold>Production source</Txt><View style={row}><Btn small kind="ghost" label="Copy all" onPress={() => copy(fullCode, 'HTML, CSS and JS')}/><Btn small label="Download .html" onPress={() => download(`${activeItem.id}.html`, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${activeItem.css}</style></head><body>${activeItem.html}${activeItem.js ? `<script>${activeItem.js.replace(/<\/script/gi,'<\\/script')}</script>` : ''}</body></html>`, 'text/html')}/></View></View>
      <View style={[row, { flexWrap: 'wrap', alignItems: 'center' }]}>{(['HTML','CSS','JS'] as const).map(x => <Chip key={x} label={x} active={tab === x} onPress={() => setTab(x)}/>)}</View>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt sub size={10}>{tab} source · formatted and editable</Txt><View style={row}><Btn small kind="ghost" label="Format code" onPress={() => setSourceEdits(cur => ({ ...cur, [editKey]: formatSource(source, tab) }))}/><Btn small kind="ghost" label="Reset" onPress={() => setSourceEdits(cur => { const next = { ...cur }; delete next[editKey]; return next; })}/></View></View>
      <Input multiline value={source} onChangeText={v => setSourceEdits(cur => ({ ...cur, [editKey]: v }))} selectTextOnFocus autoCapitalize="none" autoCorrect={false} spellCheck={false} mono style={{ minHeight: 260, maxHeight: 460, textAlignVertical: 'top', fontSize: 12, lineHeight: 20, padding: 14 }}/>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt sub size={10}>{source.split('\n').length} lines · {source.length.toLocaleString()} characters</Txt><Btn small label={`Copy ${tab}`} onPress={() => copy(source, tab)}/></View>
      {!!selected.tags.length && <Txt sub size={11}>Tags: {selected.tags.join(' · ')} · Edits are kept while you switch source tabs during this session.</Txt>}
    </Card>
  </View>;
  const gallery = <View style={{ gap: 10 }}>
    <View><Txt bold size={16}>Component catalog</Txt><Txt sub size={11}>{UI_KIT.length} ready-to-use patterns · choose a component to inspect its real preview and source.</Txt></View>
    <Input value={query} onChangeText={setQuery} placeholder="Search buttons, modal, sidebar, confetti…" autoCapitalize="none" autoCorrect={false}/>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}><View style={[row, { flexWrap: 'nowrap' }]}>{UI_KIT_CATEGORIES.map(c => <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)}/>)}</View></ScrollView>
    <View style={{ gap: 8 }}>
      {filtered.map(x => <Card key={x.id} style={{ gap: 7, borderColor: selectedId === x.id ? t.primary : t.border }}>
        <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><Txt bold size={13}>{x.name}</Txt><View style={row}><Txt sub size={10}>{x.level}</Txt><Txt sub size={10}>· {x.category}</Txt></View></View>
        <Txt sub size={11}>{x.description}</Txt>
        <View style={row}><Btn small label={selectedId === x.id ? 'Selected ✓' : 'Preview & code'} onPress={() => { setSelectedId(x.id); setTab('CSS'); setReload(n => n + 1); }}/><Btn small kind="ghost" label="Copy all" onPress={() => copy(`<!-- ${x.name} -->\n${x.html}\n<style>\n${x.css}\n</style>${x.js ? `\n<script>\n${x.js}\n</script>` : ''}`, 'Component source')}/></View>
      </Card>)}
      {!filtered.length && <Card><Txt sub>No components match that search.</Txt></Card>}
    </View>
  </View>;
  return <View style={{ flex: 1, backgroundColor: t.bg }}>
    <View style={{ paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderColor: t.border, backgroundColor: t.card, gap: 8 }}>
      <View style={[row, { justifyContent: 'space-between', flexWrap: 'wrap' }]}><View style={row}><Btn small kind="ghost" label="← Motion Lab" onPress={onBack}/><View><Txt bold size={17}>UI Components <Txt size={17} style={{ color: t.primary }}>Lab</Txt></Txt><Txt sub size={11}>Professional component patterns · vanilla HTML, CSS and JavaScript</Txt></View></View><View style={row}><Chip label={`${UI_KIT.length} components`} onPress={() => {}}/><Chip label="No framework lock-in" active onPress={() => {}}/></View></View>
      <Txt sub size={11}>Starter patterns for beginners, advanced interactions for experienced developers. All source is editable and can be copied into your own project.</Txt>
    </View>
    {wide ? <View style={{ flex: 1, flexDirection: 'row', minHeight: 0 }}><View style={{ width: 355, minWidth: 300, borderRightWidth: 1, borderColor: t.border, backgroundColor: t.card }}><ScrollView contentContainerStyle={{ padding: 12, gap: 10 }}>{gallery}</ScrollView></View><ScrollView style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ padding: 16, maxWidth: 1100, width: '100%', alignSelf: 'center' }}>{details}</ScrollView></View> : <ScrollView contentContainerStyle={{ padding: 12, gap: 14 }}>{details}<View style={{ height: 1, backgroundColor: t.border }}/>{gallery}</ScrollView>}
  </View>;
}