import type { CategoryId } from '../data/types';

export const CATEGORIES: { id: CategoryId; label: string; icon: string; color: string }[] = [
  { id: 'study', label: 'Study', icon: '📚', color: '#6C8CFF' },
  { id: 'fitness', label: 'Fitness', icon: '💪', color: '#FF7A6B' },
  { id: 'learning', label: 'Learning', icon: '🧠', color: '#C77DFF' },
  { id: 'productivity', label: 'Productivity', icon: '🎯', color: '#4ECDC4' },
  { id: 'personal', label: 'Personal', icon: '🕌', color: '#FFC46B' },
  { id: 'chores', label: 'Chores', icon: '🏠', color: '#8FA3B0' },
  { id: 'custom', label: 'Custom', icon: '⭐', color: '#F5D547' },
];

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
