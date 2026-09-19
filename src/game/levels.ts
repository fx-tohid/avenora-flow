/**
 * LEVEL FORMULA — this is the one file to edit if you want a different curve.
 *
 * Total XP is never reset. The level and the progress bar are always
 * *calculated* from total XP, so the two can never disagree.
 */

/** XP needed to go from `level` to `level + 1`. Level 1 -> 100, 2 -> 150, 3 -> 225, 4 -> 325 ... */
export function xpForLevel(level: number): number {
  const raw = 100 * Math.pow(1.5, level - 1);
  return Math.floor(raw / 25) * 25; // rounded down to a tidy multiple of 25
}

export type LevelInfo = {
  level: number;
  /** XP already earned inside the current level. */
  xpIntoLevel: number;
  /** XP the current level requires in total. */
  xpForNextLevel: number;
  /** XP still missing to level up. */
  xpRemaining: number;
  /** 0..1, for the progress bar. */
  progress: number;
};

/** Safety net so a corrupted XP value can never spin forever. */
const MAX_LEVEL = 999;

export function getLevelInfo(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, Math.floor(totalXp));

  while (level < MAX_LEVEL && remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }

  const need = xpForLevel(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: need,
    xpRemaining: Math.max(0, need - remaining),
    progress: need > 0 ? remaining / need : 0,
  };
}

/** Convenience: just the level number. */
export function getLevel(totalXp: number): number {
  return getLevelInfo(totalXp).level;
}
