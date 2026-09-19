import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { getCategoryBreakdown, getStats } from '../game/stats';
import { Button, Card, EmptyState, ProgressBar, SectionTitle } from '../ui/components';
import { space, useTheme } from '../ui/theme';

export function StatsScreen({ onOpenHistory }: { onOpenHistory: () => void }) {
  const t = useTheme();
  const { state, totalXp, level, streak } = useGame();
  const stats = getStats(state);
  const categories = getCategoryBreakdown(state);

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Statistics</Text>

      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          <Stat label="Total XP" value={totalXp.toLocaleString()} />
          <Stat label="Level" value={String(level.level)} />
          <Stat label="Tasks completed" value={String(stats.tasksCompleted)} />
          <Stat label="Active days" value={String(stats.activeDays)} />
          <Stat label="Current streak" value={`${streak} 🔥`} />
          <Stat label="Longest streak" value={String(state.streak.longest)} />
        </View>
      </Card>

      <Card>
        <SectionTitle>XP earned</SectionTitle>
        <Row label="Today" value={`${stats.xpToday} XP`} />
        <Row label="Last 7 days" value={`${stats.xpThisWeek} XP`} />
        <Row label="Last 30 days" value={`${stats.xpThisMonth} XP`} />
      </Card>

      <Card>
        <SectionTitle>XP by category</SectionTitle>
        {categories.length === 0 ? (
          <EmptyState icon="📊" title="No XP yet" hint="Complete a task to see your breakdown." />
        ) : (
          categories.map((c) => (
            <View key={c.id} style={{ marginBottom: space.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ color: t.text, fontSize: 14 }}>
                  {c.icon} {c.label}
                </Text>
                <Text style={{ color: t.textDim, fontSize: 14, fontWeight: '700' }}>{c.xp} XP</Text>
              </View>
              <ProgressBar progress={c.share} color={c.color} height={8} />
            </View>
          ))
        )}
      </Card>

      <Button label="VIEW HISTORY" variant="ghost" onPress={onOpenHistory} />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ width: '50%', paddingVertical: space.sm }}>
      <Text style={{ color: t.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: t.textFaint, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 }}>
      <Text style={{ color: t.textDim, fontSize: 14 }}>{label}</Text>
      <Text style={{ color: t.text, fontSize: 14, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
