import React, { useState } from 'react';
import { View } from 'react-native';
import { ProjectFile } from '../types';
import { useTheme } from './ui';
import Preview, { PreviewElement, PreviewMsg } from './Preview';

interface Props {
  files: ProjectFile[];
  /** 'full' = fill the stage. A number = real CSS pixel width of that device (scaled down to fit when needed). */
  device: number | 'full';
  reloadKey: number;
  /** Fixed pixel height (phone layout). Leave empty to fill the parent (desktop layout). */
  height?: number;
  inspectMode?: boolean;
  onInspect?: (item: PreviewElement) => void;
  onMessage?: (m: PreviewMsg) => void;
  /** Shown instead of the page while there is nothing to preview. */
  empty?: React.ReactNode;
  /** Called with the real (scaled) percentage so the toolbar can show it. */
  onScale?: (percent: number, cssWidth: number) => void;
}

const PAD = 16;
const noop = () => {};

/**
 * The preview takes all the room the screen gives it. A 1280px laptop or a 390px phone is rendered at its REAL CSS width
 * and then scaled to fit, so media queries behave exactly like on the device (not like in a small box).
 */
export default function DeviceStage(props: Props) {
  const t = useTheme();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const dev = props.device;
  const full = dev === 'full';
  const availW = Math.max(0, box.width - PAD * 2);
  const availH = Math.max(0, box.height - PAD * 2);
  const cssW = dev === 'full' ? Math.max(availW, 1) : dev;
  const scale = full ? 1 : Math.min(1, availW / Math.max(cssW, 1));
  // A phone / tablet keeps its own proportions; "Fit" uses the whole stage.
  const cssH = Math.max(availH / scale, 1);
  const left = Math.max(PAD, (box.width - cssW * scale) / 2);

  React.useEffect(() => {
    if (box.width > 0) props.onScale?.(Math.round(scale * 100), Math.round(cssW));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, cssW, box.width]);

  const outer: any = props.height
    ? { height: props.height, width: '100%' }
    : { flex: 1, minHeight: 240, minWidth: 0 };

  return (
    <View
      style={{ ...outer, backgroundColor: '#161927', borderRadius: 12, borderWidth: 1, borderColor: t.border, overflow: 'hidden' }}
      onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {box.width > 0 && (props.empty ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>{props.empty}</View>
      ) : (
        <View
          style={{
            position: 'absolute', top: PAD, left, width: cssW, height: cssH, backgroundColor: '#fff', overflow: 'hidden',
            borderRadius: full ? 8 : 14 / Math.max(scale, 0.2), borderWidth: 0,
            transform: [{ scale }], transformOrigin: 'top left',
            // soft device shadow (web) so the page reads as a screen floating on the stage
            boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          } as any}
        >
          <Preview
            files={props.files}
            width={cssW}
            reloadKey={props.reloadKey}
            onMessage={props.onMessage ?? noop}
            inspectMode={props.inspectMode}
            onInspect={props.onInspect}
          />
        </View>
      ))}
    </View>
  );
}