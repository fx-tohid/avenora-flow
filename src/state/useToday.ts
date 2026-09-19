import { useMemo } from 'react';
import { useGame } from './GameContext';
import { todayKey } from '../data/dates';

/**
 * Works out today's routine from the task list and the completion log.
 *
 * There is no "daily reset" job: a daily task simply has no completion for
 * the new calendar day, so it shows up unticked again. Yesterday's
 * completions stay in the log for history and statistics.
 */
export function useToday() {
  const { state } = useGame();
  const day = todayKey();

  return useMemo(() => {
    const doneToday = new Set(
      state.completions.filter((c) => c.date === day).map((c) => c.taskId),
    );
    const everDone = new Set(state.completions.map((c) => c.taskId));

    // Daily tasks always appear. A one-off task appears until it is done,
    // and stays visible for the rest of the day it was completed on.
    const tasks = state.tasks.filter(
      (t) => t.repeatsDaily || !everDone.has(t.id) || doneToday.has(t.id),
    );

    const possibleXp = tasks.reduce((sum, t) => sum + t.xp, 0);
    const earnedXp = state.completions
      .filter((c) => c.date === day)
      .reduce((sum, c) => sum + c.xp, 0);

    return {
      day,
      tasks,
      doneToday,
      completedCount: tasks.filter((t) => doneToday.has(t.id)).length,
      possibleXp,
      earnedXp,
      progress: possibleXp > 0 ? Math.min(1, earnedXp / possibleXp) : 0,
    };
  }, [state.tasks, state.completions, day]);
}
