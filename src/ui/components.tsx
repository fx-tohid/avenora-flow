import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { radius, space, useTheme } from './theme';

/** A rounded surface used for nearly every block in the app. */
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  return (
    <View
      style={[
        { backgroundColor: t.card, borderRadius: radius.lg, padding: space.lg, borderWidth: 1, borderColor: t.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function ProgressBar({
  progress,
  color,
  height = 10,
}: {
  progress: number; // 0..1
  color?: string;
  height?: number;
}) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={{ height, borderRadius: radius.pill, backgroundColor: t.cardAlt, overflow: 'hidden' }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: radius.pill, backgroundColor: color ?? t.accent }} />
    </View>
  );
}

export function SectionTitle({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.sectionRow}>
      <Text style={{ color: t.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.4 }}>
        {String(children).toUpperCase()}
      </Text>
      {right}
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const bg = variant === 'primary' ? t.accent : variant === 'danger' ? t.danger : 'transparent';
  const fg = variant === 'ghost' ? t.textDim : '#FFFFFF';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 14,
          paddingHorizontal: space.lg,
          alignItems: 'center',
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: t.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '700', fontSize: 15, letterSpacing: 0.4 }}>{label}</Text>
    </Pressable>
  );
}

/** Small selectable chip — used for difficulty, category and theme pickers. */
export function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const t = useTheme();
  const tint = color ?? t.accent;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: selected ? tint : t.border,
        backgroundColor: selected ? tint + '22' : t.cardAlt,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ color: selected ? tint : t.textDim, fontWeight: '600', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl }}>
      <Text style={{ fontSize: 34, marginBottom: space.sm }}>{icon}</Text>
      <Text style={{ color: t.text, fontWeight: '700', fontSize: 16 }}>{title}</Text>
      {hint ? (
        <Text style={{ color: t.textFaint, marginTop: space.xs, textAlign: 'center', fontSize: 13 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function Loading() {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={t.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.md,
  },
});
