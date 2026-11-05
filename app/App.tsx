import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StatusBar, View, Text } from 'react-native';
import { Project, SavedComponent } from './src/types';
import { Settings, defaultSettings, deleteProjectForever, listProjects, loadComponents, loadSettings, saveComponents, saveProject, saveSettings } from './src/storage';
import { ThemeCtx } from './src/components/ui';
import { dark, light } from './src/theme';
import Library from './src/screens/Library';
import NewProject from './src/screens/NewProject';
import Editor from './src/screens/Editor';
import SettingsScreen from './src/screens/Settings';
import Components from './src/screens/Components';
import Blocks from './src/screens/Blocks';
import AnimationStudio from './src/screens/AnimationStudio';
import ComponentLab from './src/screens/ComponentLab';
import AdvancedStudio from './src/screens/AdvancedStudio';
import Animation3DStudio from './src/screens/Animation3DStudio';

type Screen =
  | { name: 'library' }
  | { name: 'new' }
  | { name: 'settings' }
  | { name: 'components' }
  | { name: 'blocks' }
  | { name: 'animation' }
  | { name: 'advanced' }
  | { name: 'animation3d' }
  | { name: 'componentlab'; from: 'library' | 'animation' }
  | { name: 'editor'; id: string };

export default function App() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [projects, setProjects] = useState<Project[]>([]);
  const [components, setComponents] = useState<SavedComponent[]>([]);
  const [screen, setScreen] = useState<Screen>({ name: 'library' });
  const [ready, setReady] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // One timer for all toasts: a new message restarts the 4 seconds instead of being hidden by the previous message's timer.
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toast = useCallback((s: string) => {
    setToastMsg(s);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(''), 4000);
  }, []);
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const refresh = useCallback(async () => setProjects(await listProjects()), []);

  useEffect(() => {
    (async () => {
      // Each step is guarded: if one read fails the app still opens (before, it stayed on "Loading your projects..." forever).
      try { setSettings(await loadSettings()); } catch { /* keep default settings */ }
      try { setComponents(await loadComponents()); } catch { /* start with no saved components */ }
      try { await refresh(); } catch { toast('Could not read your saved projects.'); }
      setReady(true);
    })();
  }, [refresh, toast]);

  const save = useCallback(async (p: Project) => {
    await saveProject(p);
    setProjects((cur) => [p, ...cur.filter((x) => x.id !== p.id)].sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const theme = settings.dark ? dark : light;
  const editing = screen.name === 'editor' ? projects.find((p) => p.id === screen.id) : undefined;

  // An editor screen whose project no longer exists (deleted or not loaded) used to render a blank page: go back to the library.
  useEffect(() => {
    if (ready && screen.name === 'editor' && !editing) setScreen({ name: 'library' });
  }, [ready, screen, editing]);

  return (
    <ThemeCtx.Provider value={theme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar barStyle={settings.dark ? 'light-content' : 'dark-content'} />
        {!ready ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: theme.text }}>Loading your projects...</Text>
          </View>
        ) : screen.name === 'library' ? (
          <Library
            projects={projects}
            onOpen={(p) => setScreen({ name: 'editor', id: p.id })}
            onNew={() => setScreen({ name: 'new' })}
            onSettings={() => setScreen({ name: 'settings' })}
            onComponents={() => setScreen({ name: 'components' })}
            onBlocks={() => setScreen({ name: 'blocks' })}
            onAnimation={() => setScreen({ name: 'animation' })}
            onComponentLab={() => setScreen({ name: 'componentlab', from: 'library' })}
            onAdvanced={() => setScreen({ name: 'advanced' })}
            onAnimation3D={() => setScreen({ name: 'animation3d' })}
            onChange={save}
            onDeleteForever={async (id) => { await deleteProjectForever(id); await refresh(); }}
            onImported={save}
            toast={toast}
          />
        ) : screen.name === 'new' ? (
          <NewProject
            settings={settings}
            components={components}
            onOpenComponents={() => setScreen({ name: 'components' })}
            onBack={() => setScreen({ name: 'library' })}
            onCreated={async (p) => { await save(p); setScreen({ name: 'editor', id: p.id }); }}
          />
        ) : screen.name === 'animation' ? (
          <AnimationStudio
            settings={settings}
            toast={toast}
            onBack={() => setScreen({ name: 'library' })}
            onComponentLab={() => setScreen({ name: 'componentlab', from: 'animation' })}
          />
        ) : screen.name === 'animation3d' ? (
          <Animation3DStudio
            components={components}
            toast={toast}
            onBack={() => setScreen({ name: 'library' })}
          />
        ) : screen.name === 'advanced' ? (
          <AdvancedStudio
            projects={projects}
            onBack={() => setScreen({ name: 'library' })}
            onOpenProject={(p) => setScreen({ name: 'editor', id: p.id })}
            onAnimation={() => setScreen({ name: 'animation' })}
            toast={toast}
          />
        ) : screen.name === 'componentlab' ? (
          <ComponentLab
            onBack={() => setScreen(screen.from === 'animation' ? { name: 'animation' } : { name: 'library' })}
            toast={toast}
          />
        ) : screen.name === 'blocks' ? (
          <Blocks
            components={components}
            toast={toast}
            onBack={() => setScreen({ name: 'library' })}
            onSaveComponent={async (c) => {
              const list = [...components, c];
              await saveComponents(list);
              setComponents(list);
            }}
          />
        ) : screen.name === 'components' ? (
          <Components
            items={components}
            settings={settings}
            toast={toast}
            onBack={() => setScreen({ name: 'library' })}
            onSave={async (list) => { await saveComponents(list); setComponents(list); }}
          />
        ) : screen.name === 'settings' ? (
          <SettingsScreen
            settings={settings}
            onBack={() => setScreen({ name: 'library' })}
            onSave={async (s) => { setSettings(s); await saveSettings(s); }}
          />
        ) : editing ? (
          <Editor
            key={editing.id}
            project={editing}
            settings={settings}
            onSave={save}
            onClose={() => setScreen({ name: 'library' })}
            toast={toast}
          />
        ) : null}
        {!!toastMsg && (
          <View style={{
            position: 'absolute', left: 16, right: 16, bottom: 20,
            backgroundColor: theme.card, borderColor: theme.border,
            borderWidth: 1, padding: 12, borderRadius: 10,
          }}>
            <Text style={{ color: theme.text }}>{toastMsg}</Text>
          </View>
        )}
      </SafeAreaView>
    </ThemeCtx.Provider>
  );
}