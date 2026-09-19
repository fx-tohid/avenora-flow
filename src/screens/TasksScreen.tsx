import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { Task } from '../data/types';
import { CATEGORIES, getCategory } from '../game/categories';
import { useGame } from '../state/GameContext';
import { Button, Card, EmptyState, SectionTitle } from '../ui/components';
import { space, useTheme } from '../ui/theme';

/** The full task library, grouped by category. Tap a task to edit it. */
export function TasksScreen({
  onAddTask,
  onEditTask,
}: {
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
}) {
  const t = useTheme();
  const { state } = useGame();
  const [showDaily, setShowDaily] = useState<'all' | 'daily' | 'once'>('all');

  const tasks = state.tasks.filter((task) =>
    showDaily === 'all' ? true : showDaily === 'daily' ? task.repeatsDaily : !task.repeatsDaily,
  );

  const groups = CATEGORIES.map((c) => ({
    category: c,
    items: tasks.filter((task) => task.category === c.id),
  })).filter((g) => g.items.length > 0);

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>Tasks</Text>

      <View style={{ flexDirection: 'row', gap: space.sm }}>
        {(['all', 'daily', 'once'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setShowDaily(key)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: showDaily === key ? t.accent : t.card,
              borderWidth: 1,
              borderColor: showDaily === key ? t.accent : t.border,
            }}
          >
            <Text style={{ color: showDaily === key ? '#fff' : t.textDim, fontWeight: '700', fontSize: 13 }}>
              {key === 'all' ? 'All' : key === 'daily' ? 'Daily' : 'One-off'}
            </Text>
          </Pressable>
        ))}
      </View>

      {groups.length === 0 ? (
        <Card>
          <EmptyState icon="📋" title="No tasks here" hint="Create a task to build your routine." />
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group.category.id}>
            <SectionTitle>{`${group.category.icon} ${group.category.label}`}</SectionTitle>
            {group.items.map((task) => (
              <Pressable
                key={task.id}
                onPress={() => onEditTask(task)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  opacity: pressed ? 0.6 : 1,
                })}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.text, fontWeight: '600', fontSize: 15 }}>{task.title}</Text>
                  <Text style={{ color: t.textFaint, fontSize: 12, marginTop: 2 }}>
                    {task.difficulty} · {task.repeatsDaily ? 'Daily' : 'One-off'}
                    {task.description ? ` · ${task.description}` : ''}
                  </Text>
                </View>
                <Text style={{ color: getCategory(task.category).color, fontWeight: '800' }}>+{task.xp}</Text>
              </Pressable>
            ))}
          </Card>
        ))
      )}

      <Button label="+  Add Task" onPress={onAddTask} />
      <Text style={{ color: t.textFaint, fontSize: 12, textAlign: 'center' }}>
        Tap any task to edit or delete it.
      </Text>
    </ScrollView>
  );
}
