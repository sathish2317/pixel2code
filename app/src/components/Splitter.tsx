import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from './ui';

/** Draggable divider between two panes (web: mouse/touch/pen via pointer events). Phones stack panes instead, so it renders nothing there. */
export default function Splitter({ onDelta, vertical = true }: { onDelta: (px: number) => void; vertical?: boolean }) {
  const t = useTheme();
  if (Platform.OS !== 'web') return null;
  const down = (e: any) => {
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    let last = vertical ? e.clientX : e.clientY;
    const move = (m: PointerEvent) => { const cur = vertical ? m.clientX : m.clientY; onDelta(cur - last); last = cur; };
    const up = () => { el.removeEventListener('pointermove', move as any); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', move as any); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  };
  return React.createElement('div', {
    role: 'separator', 'aria-orientation': vertical ? 'vertical' : 'horizontal', title: 'Drag to resize',
    onPointerDown: down,
    style: { flex: '0 0 6px', cursor: vertical ? 'col-resize' : 'row-resize', background: t.border, touchAction: 'none', alignSelf: 'stretch', opacity: 0.7 },
    onMouseEnter: (e: any) => (e.currentTarget.style.background = t.primary), onMouseLeave: (e: any) => (e.currentTarget.style.background = t.border),
  });
}
