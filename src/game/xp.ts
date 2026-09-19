import type { Difficulty } from '../data/types';

/** XP ranges per difficulty, plus the value suggested when you pick one. */
export const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  min: number;
  max: number;
  suggested: number;
}[] = [
  { id: 'easy', label: 'Easy', min: 10, max: 25, suggested: 20 },
  { id: 'normal', label: 'Normal', min: 25, max: 50, suggested: 35 },
  { id: 'hard', label: 'Hard', min: 50, max: 100, suggested: 75 },
  { id: 'challenge', label: 'Challenge', min: 100, max: 500, suggested: 150 },
];

export function getDifficulty(id: Difficulty) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}

/** Absolute limits, whatever the difficulty. Blocks negative / silly XP. */
export const MIN_XP = 1;
export const MAX_XP = 500;

/** Force any user input into a sane whole number of XP. */
export function clampXp(value: number): number {
  if (!Number.isFinite(value)) return MIN_XP;
  return Math.min(MAX_XP, Math.max(MIN_XP, Math.round(value)));
}
