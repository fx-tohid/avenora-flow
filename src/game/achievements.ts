import type { GameState } from '../data/types';
import { getLevel } from './levels';

export type Achievement = {
  id: string;
  title: string;
  icon: string;
  /** Shown while still locked. */
  hint: string;
  /** Bonus XP granted once, when unlocked. 0 = no XP reward. */
  rewardXp: number;
  /** How far along the player is, 0..1 — used for the little progress line. */
  progress: (s: GameState, totalXp: number) => { value: number; goal: number };
};

/** XP the player has earned in one category (task XP only). */
export function xpByCategory(state: GameState, category: string): number {
  return state.completions
    .filter((c) => c.category === category)
    .reduce((sum, c) => sum + c.xp, 0);
}

/** Number of distinct days on which at least one task was completed. */
export function activeDays(state: GameState): number {
  return new Set(state.completions.map((c) => c.date)).size;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'First Step',
    icon: '👣',
    hint: 'Complete your first task',
    rewardXp: 50,
    progress: (s) => ({ value: Math.min(s.completions.length, 1), goal: 1 }),
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: '🌱',
    hint: 'Reach Level 5',
    rewardXp: 0,
    progress: (s, totalXp) => ({ value: Math.min(getLevel(totalXp), 5), goal: 5 }),
  },
  {
    id: 'consistent',
    title: 'Consistent',
    icon: '📅',
    hint: 'Complete tasks on 7 different days',
    rewardXp: 0,
    progress: (s) => ({ value: Math.min(activeDays(s), 7), goal: 7 }),
  },
  {
    id: 'dedicated',
    title: 'Dedicated',
    icon: '🛡️',
    hint: 'Complete 100 tasks',
    rewardXp: 0,
    progress: (s) => ({ value: Math.min(s.completions.length, 100), goal: 100 }),
  },
  {
    id: 'scholar',
    title: 'Scholar',
    icon: '📚',
    hint: 'Earn 1,000 Study XP',
    rewardXp: 0,
    progress: (s) => ({ value: Math.min(xpByCategory(s, 'study'), 1000), goal: 1000 }),
  },
  {
    id: 'athlete',
    title: 'Fitness',
    icon: '💪',
    hint: 'Earn 1,000 Fitness XP',
    rewardXp: 0,
    progress: (s) => ({ value: Math.min(xpByCategory(s, 'fitness'), 1000), goal: 1000 }),
  },
];

/**
 * Returns the achievements that are met but not yet recorded as unlocked.
 * The caller decides what to do with them (store them, grant the bonus XP,
 * show a message).
 */
export function findNewlyUnlocked(state: GameState, totalXp: number): Achievement[] {
  return ACHIEVEMENTS.filter((a) => {
    if (state.unlocked[a.id]) return false;
    const { value, goal } = a.progress(state, totalXp);
    return value >= goal;
  });
}
