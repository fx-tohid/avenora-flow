import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { space, useTheme } from './theme';

export type TabKey = 'home' | 'tasks' | 'stats' | 'achievements' | 'teams' | 'settings';

export const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'home', label: 'Home', icon: '🏠' },
  { key: 'tasks', label: 'Tasks', icon: '📋' },
  { key: 'stats', label: 'Stats', icon: '📊' },
  { key: 'achievements', label: 'Awards', icon: '🏆' },
  { key: 'teams', label: 'Teams', icon: '⚔️' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

/** A plain bottom tab bar — no navigation library needed for five screens. */
export function TabBar({ active, onChange }: { active: TabKey; onChange: (key: TabKey) => void }) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.card,
        borderTopWidth: 1,
        borderTopColor: t.border,
        paddingTop: space.sm,
        paddingBottom: Platform.OS === 'ios' ? space.xl : space.md,
      }}
    >
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => ({ flex: 1, alignItems: 'center', opacity: pressed ? 0.6 : 1 })}
          >
            <Text style={{ fontSize: 20, opacity: selected ? 1 : 0.45 }}>{tab.icon}</Text>
            <Text
              style={{
                fontSize: 11,
                marginTop: 2,
                fontWeight: selected ? '800' : '600',
                color: selected ? t.accent : t.textFaint,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
