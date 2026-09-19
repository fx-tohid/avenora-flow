import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import type { CategoryId, Difficulty, Task } from '../data/types';
import { CATEGORIES } from '../game/categories';
import { clampXp, DIFFICULTIES, getDifficulty, MAX_XP, MIN_XP } from '../game/xp';
import { useGame, type TaskInput } from '../state/GameContext';
import { Button, Chip, SectionTitle } from '../ui/components';
import { radius, space, useTheme } from '../ui/theme';

/**
 * Create / edit a task. Pass `task` to edit an existing one, or nothing to
 * create a new one.
 */
export function TaskFormModal({
  visible,
  task,
  onClose,
}: {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
}) {
  const t = useTheme();
  const { addTask, updateTask, deleteTask } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryId>('study');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [xpText, setXpText] = useState('35');
  const [repeatsDaily, setRepeatsDaily] = useState(true);

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setDescription(task?.description ?? '');
    setCategory(task?.category ?? 'study');
    setDifficulty(task?.difficulty ?? 'normal');
    setXpText(String(task?.xp ?? getDifficulty('normal').suggested));
    setRepeatsDaily(task?.repeatsDaily ?? true);
  }, [visible, task]);

  function pickDifficulty(id: Difficulty) {
    setDifficulty(id);
    setXpText(String(getDifficulty(id).suggested)); // suggest, but stay editable
  }

  const xp = clampXp(Number(xpText));
  const range = getDifficulty(difficulty);
  const outsideRange = xp < range.min || xp > range.max;
  const canSave = title.trim().length > 0;

  function save() {
    if (!canSave) return;
    const input: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      xp,
      difficulty,
      category,
      repeatsDaily,
    };
    if (task) updateTask(task.id, input);
    else addTask(input);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: t.bg,
            borderTopLeftRadius: radius.lg,
            borderTopRightRadius: radius.lg,
            maxHeight: '92%',
            paddingTop: space.lg,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space.lg }}>
            <Text style={{ color: t.text, fontSize: 20, fontWeight: '800' }}>
              {task ? 'Edit Task' : 'Create Task'}
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={{ color: t.textDim, fontSize: 22 }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg }} keyboardShouldPersistTaps="handled">
            <Field label="Task name">
              <Input value={title} onChangeText={setTitle} placeholder="Study Physics" />
            </Field>

            <Field label="Description (optional)">
              <Input value={description} onChangeText={setDescription} placeholder="Chapter 4 problems" multiline />
            </Field>

            <View>
              <SectionTitle>Category</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    label={`${c.icon} ${c.label}`}
                    color={c.color}
                    selected={category === c.id}
                    onPress={() => setCategory(c.id)}
                  />
                ))}
              </View>
            </View>

            <View>
              <SectionTitle>Difficulty</SectionTitle>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
                {DIFFICULTIES.map((d) => (
                  <Chip
                    key={d.id}
                    label={`${d.label} · ${d.min}-${d.max}`}
                    selected={difficulty === d.id}
                    onPress={() => pickDifficulty(d.id)}
                  />
                ))}
              </View>
            </View>

            <Field label="XP reward">
              <Input value={xpText} onChangeText={setXpText} keyboardType="number-pad" placeholder="50" />
              <Text style={{ color: outsideRange ? t.gold : t.textFaint, fontSize: 12, marginTop: space.sm }}>
                {outsideRange
                  ? `Outside the ${range.label} range (${range.min}-${range.max}) — saving as ${xp} XP.`
                  : `Will be saved as ${xp} XP (allowed: ${MIN_XP}-${MAX_XP}).`}
              </Text>
            </Field>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ color: t.text, fontWeight: '700' }}>Repeat daily</Text>
                <Text style={{ color: t.textFaint, fontSize: 12 }}>Appears in today's routine every day</Text>
              </View>
              <Switch value={repeatsDaily} onValueChange={setRepeatsDaily} trackColor={{ true: t.accent }} />
            </View>

            <Button label={task ? 'SAVE CHANGES' : 'CREATE'} onPress={save} disabled={!canSave} />

            {task ? (
              <Button
                label="DELETE TASK"
                variant="danger"
                onPress={() => {
                  deleteTask(task.id);
                  onClose();
                }}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View>
      <Text style={{ color: t.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: space.sm }}>
        {label.toUpperCase()}
      </Text>
      {children}
    </View>
  );
}

function Input(props: React.ComponentProps<typeof TextInput>) {
  const t = useTheme();
  return (
    <TextInput
      placeholderTextColor={t.textFaint}
      {...props}
      style={[
        {
          backgroundColor: t.card,
          borderWidth: 1,
          borderColor: t.border,
          borderRadius: radius.md,
          paddingHorizontal: space.md,
          paddingVertical: 12,
          color: t.text,
          fontSize: 15,
          minHeight: props.multiline ? 70 : undefined,
          textAlignVertical: props.multiline ? 'top' : 'center',
        },
        props.style,
      ]}
    />
  );
}
