import React, { createContext, useContext } from 'react';
import { Pressable, Text, TextInput, TextInputProps, View, ViewStyle, StyleSheet } from 'react-native';
import { Theme, dark } from '../theme';

export const ThemeCtx = createContext<Theme>(dark);
export const useTheme = () => useContext(ThemeCtx);

export function Btn(props: {
  label: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'danger'; disabled?: boolean; small?: boolean; style?: ViewStyle;
}) {
  const t = useTheme();
  const kind = props.kind ?? 'primary';
  const bg = kind === 'primary' ? t.primary : kind === 'danger' ? t.danger : 'transparent';
  const color = kind === 'ghost' ? t.text : '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={props.label}
      onPress={props.onPress}
      disabled={props.disabled}
      style={[
        { backgroundColor: bg, borderColor: kind === 'ghost' ? t.border : bg, borderWidth: 1, borderRadius: 10,
          paddingVertical: props.small ? 7 : 12, paddingHorizontal: props.small ? 12 : 16, opacity: props.disabled ? 0.5 : 1,
          minHeight: props.small ? 36 : 44, justifyContent: 'center', alignItems: 'center' },
        props.style,
      ]}
    >
      <Text style={{ color, fontWeight: '600', fontSize: props.small ? 13 : 15 }}>{props.label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.card, borderColor: t.border, borderWidth: 1, borderRadius: 14, padding: 14 }, style]}>{children}</View>;
}

export function Txt({ children, sub, bold, size, style, numberOfLines, onPress, selectable }: { children: React.ReactNode; sub?: boolean; bold?: boolean; size?: number; style?: any; numberOfLines?: number; onPress?: () => void; selectable?: boolean }) {
  const t = useTheme();
  return <Text numberOfLines={numberOfLines} onPress={onPress} selectable={selectable} style={[{ color: sub ? t.sub : t.text, fontWeight: bold ? '700' : '400', fontSize: size ?? 14 }, style]}>{children}</Text>;
}

export function Input(props: TextInputProps & { mono?: boolean }) {
  const t = useTheme();
  const { mono, style, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={t.sub}
      {...rest}
      style={[
        { backgroundColor: t.input, color: t.text, borderColor: t.border, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 14,
          fontFamily: mono ? 'monospace' : undefined },
        style,
      ]}
    />
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!active }}
      style={{ paddingVertical: 7, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, marginRight: 6, marginBottom: 6,
        borderColor: active ? t.primary : t.border, backgroundColor: active ? t.primary : 'transparent' }}>
      <Text style={{ color: active ? '#fff' : t.text, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export const row = StyleSheet.create({ r: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 } }).r;
