import { AssetInfo, ProjectFile, SavedComponent, Target } from './types';
import { Settings } from './storage';

async function post(s: Settings, path: string, body: unknown) {
  const base = s.serverUrl.replace(/\/+$/, '');
  let res: Response | undefined;
  let data: any = {};
  for (let attempt = 0; attempt < (path === '/api/refine' ? 3 : 1); attempt++) {
    try {
      res = await fetch(base + path, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-app-token': s.appToken },
        body: JSON.stringify(body),
      });
    } catch {
      throw new Error('Cannot reach the server at ' + base + '. Is it running? Check Settings > Server URL.');
    }
    data = await res.json().catch(() => ({}));
    if (res.status !== 503 || attempt >= 2) break;
    // Provider capacity spikes are often brief. Retry twice before returning the 503.
    await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
  }
  if (!res?.ok) throw Object.assign(new Error(data.error || 'Server error ' + (res?.status || 'unknown')), { status: res?.status });
  return data as { files: ProjectFile[]; notes: string };
}

export const generate = (
  s: Settings,
  p: {
    images: { base64: string; mime: string }[];
    target: Target;
    instructions: string[];
    components: Pick<SavedComponent, 'name' | 'notes' | 'html' | 'css' | 'js'>[];
    deep: boolean;
    assets?: AssetInfo[];
  }
) => post(s, '/api/generate', p) as Promise<{ files: ProjectFile[]; notes: string; analyzed?: boolean }>;

export const refine = (
  s: Settings,
  p: {
    files: ProjectFile[];
    request: string;
    target: Target;
    instructions: string[];
    imageBase64?: string;
    mime?: string;
    assets?: AssetInfo[];
  }
) => post(s, '/api/refine', p);

export async function checkHealth(s: Settings) {
  const res = await fetch(s.serverUrl.replace(/\/+$/, '') + '/health');
  return (await res.json()) as { ok: boolean; model: string; hasKey: boolean };
}


// ---------------------------------------------------------------------------------------------
// Code assistant, conversion, capabilities and server sync (all talk to server/src/routes/*)
// ---------------------------------------------------------------------------------------------
async function call(s: Settings, method: string, path: string, body?: unknown) {
  const base = s.serverUrl.replace(/\/+$/, '');
  let res: Response;
  try {
    res = await fetch(base + path, { method, headers: { 'content-type': 'application/json', 'x-app-token': s.appToken }, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error('Cannot reach the server at ' + base + '. Is it running? Check Settings > Server URL.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Server error ' + res.status), { status: res.status, quota: data.quota, unconfigured: data.unconfigured, retryAfterSec: data.retryAfterSec });
  return data;
}

export type CodeAction = 'explain' | 'generate' | 'refactor' | 'fix' | 'review' | 'tests';
export interface ProposedFile { path: string; content: string; language: string; status: 'new' | 'modified' | 'unchanged' }
export interface Issue { severity: 'critical' | 'high' | 'medium' | 'low' | 'info'; path: string; line?: number; message: string; fix?: string }
export interface CodeResult {
  action: CodeAction; explanation: string; files: ProposedFile[]; dependencies: { name: string; reason: string }[];
  issues: Issue[]; notes: string; warnings: string[]; requiresApproval: boolean; disclaimer: string;
}
export interface CodeRequest {
  files: ProjectFile[];
  instruction?: string;
  selection?: { path: string; text: string; startLine?: number; endLine?: number };
  diagnostics?: { path: string; line?: number; message: string }[];
  instructions?: string[];
  language?: string;
}
export const codeAction = (s: Settings, action: CodeAction, body: CodeRequest) => call(s, 'POST', '/api/code/' + action, body) as Promise<CodeResult>;

export interface ConvertOptions {
  framework?: 'html' | 'react' | 'vue' | 'svelte' | 'nextjs';
  language?: 'javascript' | 'typescript';
  styling?: string;
  cssFramework?: 'bootstrap' | 'tailwind' | 'none';
  breakpoints?: number[];
  font?: string;
  animation?: 'none' | 'subtle' | 'rich';
}
export interface ConvertResult { files: ProjectFile[]; notes: string; source: 'image' | 'pdf'; pdf?: { pages: number; scanned: boolean; textChars: number; method: string } }
export const convertImage = (s: Settings, p: { images: { base64: string; mime: string }[]; options: ConvertOptions; instructions?: string[]; deep?: boolean }) =>
  call(s, 'POST', '/api/convert/image-to-code', p) as Promise<ConvertResult>;
export const convertPdf = (s: Settings, p: { base64: string; options: ConvertOptions; instructions?: string[] }) =>
  call(s, 'POST', '/api/convert/pdf-to-code', p) as Promise<ConvertResult>;
export const pdfText = (s: Settings, base64: string) =>
  call(s, 'POST', '/api/convert/pdf-text', { base64 }) as Promise<{ text: string; pages: number; truncated: boolean; scanned: boolean; method: string }>;

export interface Capabilities {
  ai: { configured: boolean; provider: string; model: string; pdfInput: boolean; maxImages: number };
  pdfTextExtraction: boolean;
  ocr: { configured: boolean; note: string };
  codeRunner: { configured: boolean; note: string };
}
export const capabilities = (s: Settings) => call(s, 'GET', '/api/capabilities') as Promise<Capabilities>;

// Server sync (explicit, never automatic): "Push" creates/replaces the server copy, "Pull" reads it back.
export const serverCreateProject = (s: Settings, p: { id: string; name: string; target: string; files: ProjectFile[] }) => call(s, 'POST', '/api/projects', p) as Promise<{ id: string; updatedAt: number }>;
export const serverSyncProject = (s: Settings, id: string, p: { name: string; files: ProjectFile[] }) => call(s, 'PUT', `/api/projects/${id}/sync`, p) as Promise<{ synced: boolean; updatedAt: number }>;
export const serverGetProject = (s: Settings, id: string) => call(s, 'GET', `/api/projects/${id}`) as Promise<{ id: string; name: string; updatedAt: number; files: { id: string; path: string }[] }>;
export const serverGetFiles = (s: Settings, id: string) => call(s, 'GET', `/api/projects/${id}/files?content=1&limit=500`) as Promise<{ items: { path: string; content: string }[] }>;
