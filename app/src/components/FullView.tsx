import React, { useCallback, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { ProjectAsset, ProjectFile } from '../types';
import { Btn, Chip, Txt, row, useTheme } from './ui';
import Preview, { PreviewMsg } from './Preview';
import { openInBrowserTab } from '../lib/openInTab';



/** Device presets: [label, CSS width, CSS height used for "rotate" and for the All-screens view]. */
const DEVICES: [string, number, number][] = [
  ['Small phone 320', 320, 568],
  ['Phone 390', 390, 844],
  ['Large phone 430', 430, 932],
  ['Tablet 768', 768, 1024],
  ['Tablet landscape 1024', 1024, 768],
  ['Laptop 1280', 1280, 800],
  ['Desktop 1440', 1440, 900],
  ['Wide 1920', 1920, 1080],
];

// "All screens" view: every device side by side, drawn at a fixed on-screen height.
const OVERVIEW: [string, number, number][] = [
  ['Desktop 1440', 1440, 0.42],
  ['Tablet 768', 768, 0.6],
  ['Phone 390', 390, 0.8],
  ['Small phone 320', 320, 0.8],
];

/**
 * Full-screen responsive viewer (like Chrome DevTools device mode).
 * - Single: pick a device, rotate it, drag the width with - / +, fit to screen or 100% with scroll.
 * - All screens: desktop, tablet and phones side by side so you can compare the whole layout at once.
 */
export default function FullView(props: { files: ProjectFile[]; assets?: ProjectAsset[]; title: string; onClose: () => void; widths?: number[]; startWidth?: number; toast?: (s: string) => void; entry?: string }) {
  const t = useTheme();
  const { width: winW, height: winH } = useWindowDimensions();
  const [mode, setMode] = useState<'single' | 'all'>('single');
  const [w, setW] = useState<number | 'full'>(props.startWidth ?? 'full');
  const [h, setH] = useState<number | null>(null); // device height, only for fixed devices (not "Responsive")
  const [fit, setFit] = useState(true);
  const [reload, setReload] = useState(0);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [consoleTab, setConsoleTab] = useState<'console' | 'network'>('console');
  const [messages, setMessages] = useState<PreviewMsg[]>([]);
  const receiveMessage = useCallback((m: PreviewMsg) => setMessages((old) => [...old.slice(-199), m]), []);

  const bw = box.width || winW;
  const bh = box.height || Math.max(winH - 120, 300);
  const devW = w === 'full' ? Math.max(bw, 1) : w;
  const scale = fit && bw > 0 ? Math.min(1, (bw - 24) / devW) : 1;
  // A real device has a fixed screen height; "Responsive" fills the area.
  const frameH = h ? h : Math.max(bh, 1) / scale;
  const shownH = h ? h * scale : bh;
  const outerW = Math.max(bw, devW * scale + 24);

  const pick = (dw: number | 'full', dh: number | null) => { setW(dw); setH(dh); };
  const rotate = () => { if (w !== 'full' && h) { setW(h); setH(w); } };
  const step = (d: number) => { setH(null); setW((cur) => Math.max(280, Math.min(2400, (cur === 'full' ? Math.round(bw) : cur) + d))); };

  const toolbar = (
    <View style={{ borderBottomWidth: 1, borderColor: t.border, backgroundColor: t.bg }}>
      <View style={[row, { padding: 8 }]}>
        <Btn small kind="danger" label="Exit full screen" onPress={props.onClose} />
        <Txt bold style={{ flexShrink: 1 }}>{props.title}</Txt>
        <Chip label="One screen" active={mode === 'single'} onPress={() => setMode('single')} />
        <Chip label="All screens" active={mode === 'all'} onPress={() => setMode('all')} />
        <Btn small kind="ghost" label={`Console (${messages.filter((m) => m.type === 'error').length})`} onPress={() => setConsoleOpen((v) => !v)} />
        <Btn small kind="ghost" label="Refresh" onPress={() => { setMessages([]); setReload((r) => r + 1); }} />
        <Btn small kind="ghost" label="Open in Chrome tab" onPress={() => { if (!openInBrowserTab(props.files, props.assets, props.title, props.entry)) props.toast?.('A new tab can only be opened on the web version, and the browser must allow pop-ups.'); }} />
      </View>
      {mode === 'single' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[row, { padding: 8, paddingTop: 0, flexWrap: 'nowrap' }]}>
          <Chip label="Responsive (fill)" active={w === 'full'} onPress={() => pick('full', null)} />
          {DEVICES.map(([label, dw, dh]) => <Chip key={label} label={label} active={w === dw && h === dh} onPress={() => pick(dw, dh)} />)}
          {(props.widths || []).filter((n) => !DEVICES.some(([, dw]) => dw === n)).map((n) => <Chip key={'w' + n} label={`${n}px`} active={w === n && h === null} onPress={() => pick(n, null)} />)}
          <Btn small kind="ghost" label="Rotate" onPress={rotate} disabled={w === 'full' || !h} />
          <Btn small kind="ghost" label="-20" onPress={() => step(-20)} />
          <Btn small kind="ghost" label="+20" onPress={() => step(20)} />
          <Chip label={fit ? 'Fit to screen' : '100% (scroll)'} active={fit} onPress={() => setFit(!fit)} />
          <Txt sub size={12}>{Math.round(devW)}px{h ? ` x ${h}px` : ''} · {Math.round(scale * 100)}%</Txt>
        </ScrollView>
      )}
    </View>
  );

  const single = (
    <View style={{ flex: 1, backgroundColor: '#2a2d3a', overflow: 'scroll' } as any}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      <View style={{ width: outerW, height: Math.max(shownH + 24, bh) }}>
        <View style={{
          position: 'absolute', top: h ? 12 : 0, left: Math.max(0, (outerW - devW * scale) / 2),
          width: devW, height: frameH, backgroundColor: '#fff', overflow: 'hidden',
          borderRadius: h ? 14 / scale : 0,
          transform: [{ scale }], transformOrigin: 'top left',
        } as any}>
          <Preview files={props.files} assets={props.assets} entry={props.entry} width={devW} reloadKey={reload} onMessage={receiveMessage} />
        </View>
      </View>
    </View>
  );

  const SHOW_H = Math.max(360, Math.min(720, winH - 190));
  const all = (
    <ScrollView style={{ flex: 1, backgroundColor: '#2a2d3a' }} contentContainerStyle={{ padding: 16, gap: 18, alignItems: 'flex-start' }} horizontal>
      {OVERVIEW.map(([label, dw, s]) => (
        <View key={label} style={{ gap: 6 }}>
          <Txt bold style={{ color: '#fff' }}>{label}</Txt>
          <View style={{ width: dw * s, height: SHOW_H, overflow: 'hidden', borderRadius: 12, backgroundColor: '#fff' }}>
            <View style={{ width: dw, height: SHOW_H / s, transform: [{ scale: s }], transformOrigin: 'top left' } as any}>
              <Preview files={props.files} assets={props.assets} entry={props.entry} width={dw} reloadKey={reload} onMessage={receiveMessage} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.bg, zIndex: 50 } as any}>
      {toolbar}
      {mode === 'single' ? single : all}
      {consoleOpen && (
        <View style={{ maxHeight: 230, borderTopWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 10 }}>
          <View style={[row, { justifyContent: 'space-between' }]}>
            <Txt bold>Preview diagnostics</Txt>
            <View style={row}>
              <Btn small kind={consoleTab === 'console' ? 'primary' : 'ghost'} label="Console" onPress={() => setConsoleTab('console')} />
              <Btn small kind={consoleTab === 'network' ? 'primary' : 'ghost'} label="Network" onPress={() => setConsoleTab('network')} />
              <Btn small kind="ghost" label="Clear" onPress={() => setMessages([])} />
              <Btn small kind="ghost" label="Close" onPress={() => setConsoleOpen(false)} />
            </View>
          </View>
          <ScrollView style={{ maxHeight: 165 }}>
            {messages.filter((m) => consoleTab === 'network' ? m.type === 'network' : m.type !== 'network').length === 0 && <Txt sub size={12}>{consoleTab === 'network' ? 'No network requests captured. Fetch/XHR requests and resource timing appear here.' : 'No console messages yet. Refresh the preview to capture startup errors.'}</Txt>}
            {messages.filter((m) => consoleTab === 'network' ? m.type === 'network' : m.type !== 'network').slice().reverse().map((m, i) => (
              <View key={`${i}-${m.msg}`} style={{ paddingVertical: 5, borderBottomWidth: 1, borderColor: t.border }}>
                <Txt size={12} style={{ color: m.type === 'error' || (m.type === 'network' && m.level === 'error') ? '#ef4444' : m.type === 'asset' || m.level === 'warn' ? '#f59e0b' : t.text }}>
                  [{m.type === 'error' ? 'ERROR' : m.type === 'asset' ? 'ASSET' : m.type === 'network' ? 'NETWORK' : (m.level || 'LOG').toUpperCase()}] {m.msg}
                </Txt>
                {!!m.source && <Txt sub size={11}>{m.source}{m.line ? `:${m.line}${m.column ? `:${m.column}` : ''}` : ''}</Txt>}
                {!!m.stack && <Txt sub size={11}>{m.stack}</Txt>}
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}