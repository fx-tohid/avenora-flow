import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { ACHIEVEMENTS } from '../game/achievements';
import { useGame } from '../state/GameContext';
import { Card, ProgressBar } from '../ui/components';
import { space, useTheme } from '../ui/theme';

export function AchievementsScreen() {
  const t = useTheme();
  const { state, totalXp } = useGame();
  const unlockedCount = ACHIEVEMENTS.filter((a) => state.unlocked[a.id]).length;

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Achievements</Text>
        <Text style={{ color: t.textFaint, fontSize: 13, marginTop: 2 }}>
          {unlockedCount} of {ACHIEVEMENTS.length} unlocked
        </Text>
      </View>

      {ACHIEVEMENTS.map((a) => {
        const unlocked = Boolean(state.unlocked[a.id]);
        const { value, goal } = a.progress(state, totalXp);
        return (
          <Card key={a.id} style={{ borderColor: unlocked ? t.gold : t.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 26, marginRight: space.md, opacity: unlocked ? 1 : 0.35 }}>
                {unlocked ? a.icon : '🔒'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: unlocked ? t.text : t.textDim, fontWeight: '800', fontSize: 16 }}>
                  {a.title}
                </Text>
                <Text style={{ color: t.textFaint, fontSize: 13, marginTop: 2 }}>
                  {unlocked ? 'Completed' : a.hint}
                </Text>
              </View>
              {a.rewardXp > 0 ? (
                <Text style={{ color: unlocked ? t.gold : t.textFaint, fontWeight: '700', fontSize: 13 }}>
                  +{a.rewardXp} XP
                </Text>
              ) : null}
            </View>

            {!unlocked ? (
              <View style={{ marginTop: space.md }}>
                <ProgressBar progress={goal > 0 ? value / goal : 0} height={6} color={t.textFaint} />
                <Text style={{ color: t.textFaint, fontSize: 11, marginTop: 6 }}>
                  {value} / {goal}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}
