import React from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { getHistory } from '../game/stats';
import { formatDayHeading } from '../data/dates';
import { Card, EmptyState } from '../ui/components';
import { space, useTheme } from '../ui/theme';

/** Every completed task, grouped by day. Opens on top of the stats screen. */
export function HistoryScreen({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { state } = useGame();
  const days = getHistory(state);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: space.xxl + space.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: space.lg,
            paddingBottom: space.md,
          }}
        >
          <Text style={{ color: t.text, fontSize: 24, fontWeight: '800' }}>History</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={{ color: t.textDim, fontSize: 22 }}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }}>
          {days.length === 0 ? (
            <Card>
              <EmptyState icon="🕘" title="Nothing here yet" hint="Completed tasks will show up day by day." />
            </Card>
          ) : (
            days.map((day) => (
              <Card key={day.date}>
                <Text style={{ color: t.textDim, fontSize: 12, fontWeight: '800', letterSpacing: 1.6 }}>
                  {formatDayHeading(day.date)}
                </Text>
                <View style={{ marginTop: space.md }}>
                  {day.items.map((item) => (
                    <View
                      key={item.id}
                      style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
                    >
                      <Text style={{ color: t.text, fontSize: 14, flex: 1 }} numberOfLines={1}>
                        ✓ {item.title}
                      </Text>
                      <Text style={{ color: t.success, fontWeight: '700', fontSize: 14 }}>+{item.xp} XP</Text>
                    </View>
                  ))}
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: t.border, marginTop: space.md, paddingTop: space.md }}>
                  <Text style={{ color: t.accent, fontWeight: '800' }}>Total: +{day.totalXp} XP</Text>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
