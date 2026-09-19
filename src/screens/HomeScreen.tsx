import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { useToday } from '../state/useToday';
import { greeting } from '../data/dates';
import { Button, Card, EmptyState, ProgressBar, SectionTitle } from '../ui/components';
import { HeroCard } from '../ui/HeroCard';
import { TaskRow } from '../ui/TaskRow';
import { space, useTheme } from '../ui/theme';
import type { Task } from '../data/types';

export function HomeScreen({
  onAddTask,
  onCompleted,
}: {
  onAddTask: () => void;
  onCompleted: (task: Task) => void;
}) {
  const t = useTheme();
  const { state, completeTask, undoTask } = useGame();
  const today = useToday();

  function toggle(task: Task) {
    if (today.doneToday.has(task.id)) {
      undoTask(task.id);
    } else {
      completeTask(task);
      onCompleted(task); // let the parent show the "+XP" animation
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg }}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={{ color: t.textDim, fontSize: 14 }}>{greeting()},</Text>
        <Text style={{ color: t.text, fontSize: 26, fontWeight: '800' }}>{state.profile.name}</Text>
      </View>

      <HeroCard />

      <Card>
        <SectionTitle
          right={
            <Text style={{ color: t.textFaint, fontSize: 12 }}>
              {today.earnedXp} / {today.possibleXp} XP
            </Text>
          }
        >
          Today
        </SectionTitle>

        {today.tasks.length === 0 ? (
          <EmptyState icon="🗒️" title="No tasks yet" hint="Add your first routine task to start earning XP." />
        ) : (
          <View style={{ marginHorizontal: -space.md }}>
            {today.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                done={today.doneToday.has(task.id)}
                onPress={() => toggle(task)}
              />
            ))}
          </View>
        )}

        {today.tasks.length > 0 ? (
          <View style={{ marginTop: space.lg }}>
            <ProgressBar progress={today.progress} color={t.success} />
            <Text style={{ color: t.textFaint, fontSize: 12, marginTop: space.sm }}>
              Today's progress {Math.round(today.progress * 100)}% · {today.completedCount} of{' '}
              {today.tasks.length} done
            </Text>
          </View>
        ) : null}
      </Card>

      <Button label="+  Add Task" onPress={onAddTask} />
    </ScrollView>
  );
}
