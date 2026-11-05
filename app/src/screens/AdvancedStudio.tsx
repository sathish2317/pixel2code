import React, { useMemo, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { Project } from '../types';
import { diagnoseAll } from '../lib/diagnostics';
import { Btn, Card, Chip, Txt, row, useTheme } from '../components/ui';

type Props = {
  projects: Project[];
  onBack: () => void;
  onOpenProject: (project: Project) => void;
  onAnimation: () => void;
  toast: (message: string) => void;
};

const Panel = ({ title, description, action, onPress, color }: {
  title: string; description: string; action: string; onPress: () => void; color: string;
}) => {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      flexGrow: 1, flexBasis: 260, minWidth: 230, padding: 16, borderRadius: 14,
      borderWidth: 1, borderColor: t.border, backgroundColor: t.card, opacity: pressed ? 0.78 : 1,
    })}>
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      </View>
      <Txt bold size={15}>{title}</Txt>
      <Txt sub size={12} style={{ marginTop: 6, lineHeight: 18 }}>{description}</Txt>
      <Txt bold size={12} style={{ color, marginTop: 14 }}>{action} →</Txt>
    </Pressable>
  );
};

export default function AdvancedStudio({ projects, onBack, onOpenProject, onAnimation, toast }: Props) {
  const t = useTheme();
  const activeProjects = useMemo(() => projects.filter((p) => !p.deletedAt), [projects]);
  const [selectedId, setSelectedId] = useState(activeProjects[0]?.id ?? '');
  const selected = activeProjects.find((p) => p.id === selectedId) ?? activeProjects[0];
  const diagnostics = useMemo(() => selected ? diagnoseAll(selected.files) : [], [selected]);
  const errors = diagnostics.filter((d) => d.severity === 'error');
  const warnings = diagnostics.filter((d) => d.severity === 'warning');
  const infos = diagnostics.filter((d) => d.severity === 'info');

  const openSelected = () => {
    if (!selected) { toast('Create or import a project first.'); return; }
    onOpenProject(selected);
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, maxWidth: 1120, width: '100%', alignSelf: 'center' }}>
        <View style={[row, { alignItems: 'center' }]}>
          <Btn small kind="ghost" label="← Back" onPress={onBack} />
          <View style={{ flex: 1 }} />
          <View style={{ paddingVertical: 7, paddingHorizontal: 11, borderRadius: 999, backgroundColor: t.primary }}><Txt bold size={10} style={{ color: "#ffffff" }}>FRONTEND WORKSPACE</Txt></View>
        </View>

        <View style={{ gap: 7 }}>
          <Txt bold size={27}>Advanced Studio</Txt>
          <Txt sub size={13} style={{ lineHeight: 20 }}>
            A frontend-only control center for visual refinement, animation, code inspection and project quality.
          </Txt>
        </View>

        <Card>
          <View style={[row, { alignItems: 'center' }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt bold size={16}>Current project</Txt>
              <Txt sub size={12}>{selected ? `${selected.files.length} files · ${selected.target.toUpperCase()}` : 'No project selected'}</Txt>
            </View>
            <Btn small label="Open editor" onPress={openSelected} disabled={!selected} />
          </View>
          {activeProjects.length > 0 ? (
            <View style={[row, { marginTop: 12, flexWrap: 'wrap' }]}>
              {activeProjects.slice(0, 8).map((p) => (
                <Chip key={p.id} label={p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name}
                  active={selected?.id === p.id} onPress={() => setSelectedId(p.id)} />
              ))}
            </View>
          ) : (
            <Txt sub size={12} style={{ marginTop: 10 }}>Create a project from a screenshot or import an existing ZIP to begin.</Txt>
          )}
        </Card>

        <View style={{ gap: 10 }}>
          <Txt bold size={17}>Frontend development tools</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            <Panel title="Code workspace" description="Edit project files, inspect changes, use the existing live preview and workbench tools." action="Open project editor" color={t.primary} onPress={openSelected} />
            <Panel title="Animation studio" description="Create and configure frontend motion presets and reusable animation effects." action="Open animation studio" color="#a78bfa" onPress={onAnimation} />
            <Panel title="Component library" description="Reuse saved frontend sections and components in your projects." action="Use component library" color="#22c55e" onPress={() => toast('Open My components from the main dashboard.')} />
            <Panel title="Project quality audit" description="Run local source checks for markup, CSS, JavaScript, accessibility and common project issues." action="View audit below" color="#f59e0b" onPress={() => toast('The local audit is shown below.')} />
          </View>
        </View>

        <Card>
          <View style={[row, { alignItems: 'center' }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <Txt bold size={17}>Local code audit</Txt>
              <Txt sub size={12}>{selected ? 'Checks run in this app on the selected project files.' : 'Select a project to inspect its files.'}</Txt>
            </View>
            <Btn small kind="ghost" label="Refresh" onPress={() => {
              if (!selected) toast('No project selected.');
              else toast(`Audit refreshed: ${diagnostics.length} finding(s).`);
            }} disabled={!selected} />
          </View>
          {selected ? (
            <>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                <View style={{ flex: 1, minWidth: 82, backgroundColor: t.input, borderRadius: 10, padding: 12 }}>
                  <Txt bold size={22} style={{ color: t.danger }}>{errors.length}</Txt><Txt sub size={11}>Errors</Txt>
                </View>
                <View style={{ flex: 1, minWidth: 82, backgroundColor: t.input, borderRadius: 10, padding: 12 }}>
                  <Txt bold size={22} style={{ color: '#e5a23b' }}>{warnings.length}</Txt><Txt sub size={11}>Warnings</Txt>
                </View>
                <View style={{ flex: 1, minWidth: 82, backgroundColor: t.input, borderRadius: 10, padding: 12 }}>
                  <Txt bold size={22} style={{ color: t.primary }}>{infos.length}</Txt><Txt sub size={11}>Suggestions</Txt>
                </View>
              </View>
              {diagnostics.length === 0 ? (
                <View style={{ paddingVertical: 18 }}>
                  <Txt bold style={{ color: t.ok }}>No local issues detected.</Txt>
                  <Txt sub size={12} style={{ marginTop: 4 }}>This is a lightweight source check, not a full browser or production test.</Txt>
                </View>
              ) : (
                <View style={{ marginTop: 12, gap: 8 }}>
                  {diagnostics.slice(0, 20).map((d, i) => (
                    <Pressable key={`${d.path}-${d.line}-${i}`} onPress={openSelected}
                      style={{ padding: 10, borderRadius: 9, borderWidth: 1, borderColor: t.border, backgroundColor: t.input }}>
                      <View style={[row, { alignItems: 'center' }]}>
                        <Txt bold size={11} style={{ color: d.severity === 'error' ? t.danger : d.severity === 'warning' ? '#e5a23b' : t.primary }}>
                          {d.severity.toUpperCase()}
                        </Txt>
                        <View style={{ flex: 1 }} />
                        <Txt sub size={10}>{d.path}:{d.line}</Txt>
                      </View>
                      <Txt size={12} style={{ marginTop: 4 }}>{d.message}</Txt>
                    </Pressable>
                  ))}
                  {diagnostics.length > 20 && <Txt sub size={11}>Showing first 20 of {diagnostics.length} findings. Open the editor for file-level diagnostics.</Txt>}
                </View>
              )}
            </>
          ) : null}
        </Card>

        <Card>
          <Txt bold size={16}>What this frontend workspace does</Txt>
          <Txt sub size={12} style={{ lineHeight: 19, marginTop: 7 }}>
            This screen uses the existing local project files and frontend tools. It does not claim to run AI vision, remote code generation, server-side browser automation, or deployment. Those require separate service integrations.
          </Txt>
        </Card>
      </ScrollView>
    </View>
  );
}
