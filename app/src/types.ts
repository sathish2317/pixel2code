import type { MotionSettings } from './lib/autoMotion';
import type { KitAnalysis, KitKind } from './lib/layoutKit';

export type Target = 'html' | 'bootstrap' | 'tailwind';

export interface ProjectFile {
  path: string;
  content: string;
}

export interface Instruction {
  id: string;
  text: string;
  enabled: boolean;
}

export interface FontChoice {
  family: string;
  weights: number[];
}

export interface FontSettings {
  heading?: FontChoice;
  body?: FontChoice;
  button?: FontChoice;
}

export type AnimKind =
  | 'fade-in'
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'hover-lift'
  | 'hover-scale'
  | 'hover-shadow';

export interface AnimConfig {
  id: string;
  sectionId: string; // id attribute of the target section
  scope: 'section' | 'items'; // hover only: whole section, or only cards/list items inside it
  kind: AnimKind;
  duration: number; // ms
  delay: number; // ms
  enabled: boolean;
}

export interface SectionStyle {
  bg?: string;
  paddingY?: number;
  minHeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  hideDesktop?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
}

/** One image of a project, as stored on disk: path is the exact path used in the exported ZIP (e.g. images/logo.png). */
export interface ProjectAsset {
  path: string;
  mime: string;
  base64: string;
}

/** Light description of an asset (no bytes). Sent to the AI so it uses the right file names. */
export interface AssetInfo {
  path: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface Version {
  id: string;
  label: string;
  createdAt: number;
  files: ProjectFile[];
}

/** One request/answer of the AI code assistant, kept per project (see Workbench > Assistant). */
export interface ChatTurn {
  id: string;
  at: number;
  action: string;
  instruction: string;
  summary: string;
  files: { path: string; status: 'new' | 'modified' | 'unchanged' }[];
  applied: boolean;
}

/** Present only when the project was pushed to the Pixel2Code server. Without it the project is local-only (this device). */
export interface SyncInfo {
  serverId: string;
  serverUrl: string;
  lastSyncAt: number;
  filesHash: string; // hash of the files at the last sync, to tell whether the project changed since
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  target: Target;
  favorite: boolean;
  exportedAt?: number;
  deletedAt?: number; // recycle bin: set when "deleted", removed for good only on explicit permanent delete
  referenceImage?: { base64: string; mime: string };
  // PDFs are too big to keep in browser storage, so only the file's name/size are remembered.
  referenceFile?: { name: string; size: number; mime: string };
  files: ProjectFile[];
  // Light list of the images that belong to this project (the image bytes are stored separately, see storage.ts).
  assets?: AssetInfo[];
  instructions: Instruction[];
  fonts: FontSettings;
  animations: AnimConfig[];
  sectionStyles: Record<string, SectionStyle>;
  versions: Version[];
  chat?: ChatTurn[];
  sync?: SyncInfo;
  /** Light card/box hover + reveal animations and the colours they use (see lib/autoMotion.ts). */
  motion?: MotionSettings;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// A block of the user's own approved code (banner, carousel 1, footer ...) that the AI must reuse.
export interface SavedComponent {
  id: string;
  name: string;
  notes: string; // what it is / where it is used, e.g. "main top banner with slider"
  html: string;
  css: string;
  js: string;
  updatedAt: number;
  /** header / footer / section: set when the component is a layout kit. */
  kind?: KitKind;
  /** Result of analyzing the ZIP this component came from (files, breakpoints, responsive score ...). */
  analysis?: KitAnalysis;
  /** Images that came with the ZIP (kept at their ZIP paths so the preview shows them). */
  assets?: ProjectAsset[];
  /** Original ZIP source files, preserved for the VS Code-style explorer/editor. */
  sourceFiles?: ProjectFile[];
}

// One block placed on the Code Blocks canvas. It is a COPY of the block's code, so you can edit it without changing the library.
export interface PlacedBlock {
  id: string;
  blockId: string;
  name: string;
  html: string;
  css: string;
  js: string;
  shared?: string[]; // ids of shared CSS this block needs (see blocks.ts)
}
