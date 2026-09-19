import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { DIFFICULTIES } from '../game/xp';
import { xpForLevel } from '../game/levels';
import { Button, Card, Chip, SectionTitle } from '../ui/components';
import { radius, space, useTheme } from '../ui/theme';
import type { ThemeMode } from '../data/types';

export function SettingsScreen() {
  const t = useTheme();
  const { state, setName, setTheme, resetProgress, resetTasks } = useGame();
  const [draftName, setDraftName] = useState(state.profile.name);

  function confirm(title: string, message: string, onConfirm: () => void) {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]);
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Settings</Text>

      <Card>
        <SectionTitle>Display name</SectionTitle>
        <TextInput
          value={draftName}
          onChangeText={setDraftName}
          onEndEditing={() => setName(draftName)}
          placeholder="Your name"
          placeholderTextColor={t.textFaint}
          style={{
            backgroundColor: t.cardAlt,
            borderRadius: radius.md,
            paddingHorizontal: space.md,
            paddingVertical: 12,
            color: t.text,
            fontSize: 15,
          }}
        />
        <Button label="SAVE NAME" onPress={() => setName(draftName)} style={{ marginTop: space.md }} />
      </Card>

      <Card>
        <SectionTitle>Theme</SectionTitle>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {(['dark', 'light', 'system'] as ThemeMode[]).map((mode) => (
            <Chip
              key={mode}
              label={mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}
              selected={state.settings.theme === mode}
              onPress={() => setTheme(mode)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionTitle>How XP works</SectionTitle>
        {DIFFICULTIES.map((d) => (
          <View key={d.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
            <Text style={{ color: t.textDim }}>{d.label}</Text>
            <Text style={{ color: t.text, fontWeight: '600' }}>
              {d.min}-{d.max} XP
            </Text>
          </View>
        ))}
        <Text style={{ color: t.textFaint, fontSize: 12, marginTop: space.md, lineHeight: 18 }}>
          Each level needs more XP than the last: level 1 needs {xpForLevel(1)} XP, level 2 needs{' '}
          {xpForLevel(2)}, level 3 needs {xpForLevel(3)}, and so on. Your total XP is never spent or
          reset when you level up.
        </Text>
      </Card>

      <Card>
        <SectionTitle>Danger zone</SectionTitle>
        <Button
          label="RESET ALL PROGRESS"
          variant="danger"
          onPress={() =>
            confirm(
              'Are you sure?',
              'This will permanently delete your XP, levels, achievements and history. Your tasks are kept.',
              resetProgress,
            )
          }
        />
        <Button
          label="DELETE ALL TASKS"
          variant="ghost"
          style={{ marginTop: space.md }}
          onPress={() =>
            confirm('Delete all tasks?', 'Your XP and history are kept, but every task is removed.', resetTasks)
          }
        />
      </Card>

      <Card>
        <SectionTitle>About</SectionTitle>
        <Text style={{ color: t.textDim, fontSize: 13, lineHeight: 20 }}>
          Avenor Flow turns your real-life routine into a game. Everything is stored on this device
          only — no account, no server, no internet needed.
        </Text>
        <Text style={{ color: t.textFaint, fontSize: 12, marginTop: space.md }}>Version 1.0.0</Text>
      </Card>
    </ScrollView>
  );
}
