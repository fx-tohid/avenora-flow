import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Text, View } from 'react-native';
import { Button, Card } from './components';
import { radius, space, useTheme } from './theme';
import type { Achievement } from '../game/achievements';

/**
 * The floating "+50 XP" that rises and fades after completing a task.
 * `pop` changes identity each time, which restarts the animation.
 */
export function XpPop({ pop }: { pop: { id: string; amount: number } | null }) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pop) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 1100,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [pop, anim]);

  if (!pop) return null;

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 1, 1, 0] });
  const scale = anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0.8, 1.1, 1] });

  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 120, alignItems: 'center' }}>
      <Animated.View
        style={{
          transform: [{ translateY }, { scale }],
          opacity,
          backgroundColor: t.accentSoft,
          borderColor: t.accent,
          borderWidth: 1,
          paddingVertical: 8,
          paddingHorizontal: 18,
          borderRadius: radius.pill,
        }}
      >
        <Text style={{ color: t.accent, fontWeight: '900', fontSize: 18 }}>✨ +{pop.amount} XP</Text>
      </Animated.View>
    </View>
  );
}

export function LevelUpModal({ level, onClose }: { level: number | null; onClose: () => void }) {
  const t = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (level === null) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
  }, [level, anim]);

  return (
    <Modal visible={level !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Animated.View style={{ width: '100%', transform: [{ scale: anim }] }}>
          <Card style={{ alignItems: 'center', paddingVertical: space.xxl, borderColor: t.gold }}>
            <Text style={{ fontSize: 46 }}>🎉</Text>
            <Text style={{ color: t.gold, fontSize: 13, fontWeight: '800', letterSpacing: 3, marginTop: space.md }}>
              LEVEL UP
            </Text>
            <Text style={{ color: t.text, fontSize: 44, fontWeight: '900', marginTop: space.sm }}>
              LEVEL {level ?? ''}
            </Text>
            <Text style={{ color: t.textDim, marginTop: space.sm, marginBottom: space.xl }}>
              Congratulations, keep the streak alive!
            </Text>
            <Button label="CONTINUE" onPress={onClose} style={{ alignSelf: 'stretch' }} />
          </Card>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function AchievementModal({
  achievement,
  onClose,
}: {
  achievement: Achievement | null;
  onClose: () => void;
}) {
  const t = useTheme();
  return (
    <Modal visible={achievement !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: space.xl }}>
        <Card style={{ width: '100%', alignItems: 'center', paddingVertical: space.xl, borderColor: t.accent }}>
          <Text style={{ fontSize: 40 }}>{achievement?.icon ?? '🏆'}</Text>
          <Text style={{ color: t.accent, fontSize: 12, fontWeight: '800', letterSpacing: 2.5, marginTop: space.md }}>
            ACHIEVEMENT UNLOCKED
          </Text>
          <Text style={{ color: t.text, fontSize: 24, fontWeight: '800', marginTop: space.sm }}>
            {achievement?.title ?? ''}
          </Text>
          {achievement && achievement.rewardXp > 0 ? (
            <Text style={{ color: t.gold, marginTop: space.sm, fontWeight: '700' }}>
              +{achievement.rewardXp} bonus XP
            </Text>
          ) : null}
          <Button label="NICE" onPress={onClose} style={{ alignSelf: 'stretch', marginTop: space.xl }} />
        </Card>
      </View>
    </Modal>
  );
}
