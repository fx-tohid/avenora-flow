import type { Completion, GameState } from '../data/types';
import { addDays, todayKey } from '../data/dates';
import { CATEGORIES } from './categories';

/** Sum of XP for completions on or after `fromDay` (inclusive). */
function xpSince(completions: Completion[], fromDay: string): number {
  return completions.filter((c) => c.date >= fromDay).reduce((sum, c) => sum + c.xp, 0);
}

export function getStats(state: GameState) {
  const today = todayKey();
  return {
    tasksCompleted: state.completions.length,
    xpToday: xpSince(state.completions, today),
    xpThisWeek: xpSince(state.completions, addDays(today, -6)),
    xpThisMonth: xpSince(state.completions, addDays(today, -29)),
    activeDays: new Set(state.completions.map((c) => c.date)).size,
  };
}

/** XP per category, biggest first, with a 0..1 share for the bars. */
export function getCategoryBreakdown(state: GameState) {
  const rows = CATEGORIES.map((c) => ({
    ...c,
    xp: state.completions.filter((x) => x.category === c.id).reduce((sum, x) => sum + x.xp, 0),
  }))
    .filter((r) => r.xp > 0)
    .sort((a, b) => b.xp - a.xp);

  const max = rows.length > 0 ? rows[0].xp : 0;
  return rows.map((r) => ({ ...r, share: max > 0 ? r.xp / max : 0 }));
}

/** Completions grouped by day, newest day first — used by the history screen. */
export function getHistory(state: GameState) {
  const byDay = new Map<string, Completion[]>();
  for (const c of state.completions) {
    const list = byDay.get(c.date) ?? [];
    list.push(c);
    byDay.set(c.date, list);
  }
  return [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => (a.completedAt < b.completedAt ? -1 : 1)),
      totalXp: items.reduce((sum, c) => sum + c.xp, 0),
    }));
}
