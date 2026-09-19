import type { GameState, Task } from './types';

export const STATE_VERSION = 1;

/** Simple unique id — good enough for a local, single-user app. */
export function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function task(
  title: string,
  xp: number,
  difficulty: Task['difficulty'],
  category: Task['category'],
): Task {
  return {
    id: newId(),
    title,
    description: '',
    xp,
    difficulty,
    category,
    repeatsDaily: true,
    createdAt: new Date().toISOString(),
  };
}

/** Starter routine so the app is not empty on first launch. */
export function starterTasks(): Task[] {
  return [
    task('Wake up early', 20, 'easy', 'personal'),
    task('Exercise', 30, 'normal', 'fitness'),
    task('Study', 50, 'hard', 'study'),
    task('Read', 20, 'easy', 'learning'),
    task("Review today's work", 30, 'normal', 'productivity'),
  ];
}

export function createInitialState(): GameState {
  return {
    version: STATE_VERSION,
    profile: { name: 'Adventurer', createdAt: new Date().toISOString() },
    settings: { theme: 'system' },
    tasks: starterTasks(),
    completions: [],
    bonusXp: 0,
    streak: { current: 0, longest: 0, lastDate: null },
    unlocked: {},
  };
}
