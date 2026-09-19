import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Task } from '../data/types';
import { getCategory } from '../game/categories';
import { radius, space, useTheme } from './theme';

/**
 * One line in the routine list. Tapping toggles completion; a long press
 * can be used by the parent for editing.
 */
export function TaskRow({
  task,
  done,
  onPress,
  onLongPress,
}: {
  task: Task;
  done: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const t = useTheme();
  const category = getCategory(task.category);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: space.md,
        borderRadius: radius.md,
        backgroundColor: done ? t.cardAlt : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: done ? t.success : t.border,
          backgroundColor: done ? t.success : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: space.md,
        }}
      >
        {done ? <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>✓</Text> : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            color: done ? t.textFaint : t.text,
            fontSize: 15,
            fontWeight: '600',
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
        <Text style={{ color: t.textFaint, fontSize: 12, marginTop: 2 }}>
          {category.icon} {category.label}
          {task.repeatsDaily ? ' · Daily' : ''}
        </Text>
      </View>

      <Text style={{ color: done ? t.success : t.accent, fontWeight: '800', fontSize: 14 }}>
        +{task.xp} XP
      </Text>
    </Pressable>
  );
}
