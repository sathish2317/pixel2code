/** Type-only compatibility declarations for the optional Monaco adapter.
 * The active web editor does not import this package unless it is installed and enabled.
 */
declare module '@monaco-editor/react' {
  import type React from 'react';
  export type OnMount = (editor: any, monaco: any) => void;
  export const loader: { config: (options: { paths?: Record<string, string> }) => void };
  const Editor: React.ComponentType<{
    path?: string;
    language?: string;
    value?: string;
    theme?: string;
    onChange?: (value: string | undefined) => void;
    onMount?: OnMount;
    loading?: React.ReactNode;
    options?: Record<string, unknown>;
  }>;
  export default Editor;
}
