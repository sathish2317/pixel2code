import React, { useState } from 'react';
import { Platform, View } from 'react-native';

/**
 * Drag and drop for the Code Blocks screen.
 * Web: real HTML5 drag and drop (blocks, files and selected text).
 * Phone: no dragging (touch drag needs a gesture library); the same actions are available as buttons.
 */
export const dndEnabled = Platform.OS === 'web';
export const BLOCK_MIME = 'application/x-pixel2code-block';

export function Draggable(props: { data: string; children: React.ReactNode; style?: any }) {
  if (!dndEnabled) return <View style={props.style}>{props.children}</View>;
  return React.createElement(
    'div',
    {
      draggable: true,
      onDragStart: (e: any) => {
        e.dataTransfer.setData(BLOCK_MIME, props.data);
        e.dataTransfer.setData('text/plain', props.data);
        e.dataTransfer.effectAllowed = 'copyMove';
      },
      style: { cursor: 'grab', ...props.style },
    },
    props.children
  );
}

export function DropArea(props: {
  onData: (data: string) => void; // a block that was dragged from the list or inside the canvas
  onFiles?: (files: File[]) => void; // files dropped from the computer
  onText?: (text: string) => void; // code text that was selected and dragged from an editor
  children: React.ReactNode;
  style?: any;
  overStyle?: any;
}) {
  const [over, setOver] = useState(false);
  if (!dndEnabled) return <View style={props.style}>{props.children}</View>;
  return React.createElement(
    'div',
    {
      onDragOver: (e: any) => { e.preventDefault(); e.stopPropagation(); setOver(true); },
      onDragLeave: (e: any) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); },
      onDrop: (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        const dt = e.dataTransfer;
        const own = dt.getData(BLOCK_MIME);
        if (own) { props.onData(own); return; }
        if (dt.files && dt.files.length) { props.onFiles?.(Array.from(dt.files) as File[]); return; }
        const text = dt.getData('text/plain');
        if (text) props.onText?.(text);
      },
      style: { ...props.style, ...(over ? props.overStyle : {}) },
    },
    props.children
  );
}
