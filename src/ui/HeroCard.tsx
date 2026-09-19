import React from 'react';
import { Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { Card, ProgressBar } from './components';
import { radius, space, useTheme } from './theme';
import { useCountUp } from './useCountUp';

/** The level / XP / streak block shown at the top of the home screen. */
export function HeroCard() {
  const t = useTheme();
  const { totalXp, level, streak } = useGame();
  const shownXp = useCountUp(totalXp);

  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: t.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 2 }}>LEVEL</Text>
          <Text style={{ color: t.text, fontSize: 44, fontWeight: '900', lineHeight: 50 }}>{level.level}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: t.accent, fontSize: 22, fontWeight: '800' }}>
            {shownXp.toLocaleString()} XP
          </Text>
          <Text style={{ color: t.textFaint, fontSize: 12 }}>total earned</Text>
        </View>
      </View>

      <View style={{ marginTop: space.lg }}>
        <ProgressBar progress={level.progress} height={12} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm }}>
          <Text style={{ color: t.textDim, fontSize: 12 }}>
            {level.xpIntoLevel} / {level.xpForNextLevel} XP
          </Text>
          <Text style={{ color: t.textDim, fontSize: 12 }}>
            {level.xpRemaining} XP to level {level.level + 1}
          </Text>
        </View>
      </View>

      {streak > 0 ? (
        <View
          style={{
            alignSelf: 'flex-start',
            marginTop: space.lg,
            backgroundColor: t.cardAlt,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: radius.pill,
          }}
        >
          <Text style={{ color: t.gold, fontWeight: '800', fontSize: 13 }}>
            🔥 {streak} Day Streak
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
