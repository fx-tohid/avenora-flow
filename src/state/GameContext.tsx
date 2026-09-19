import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { GameState, Task } from '../data/types';
import { createInitialState, newId } from '../data/defaults';
import { clearState, loadState, saveState } from '../data/storage';
import { todayKey, yesterdayKey } from '../data/dates';
import { getLevelInfo } from '../game/levels';
import { ACHIEVEMENTS, findNewlyUnlocked, type Achievement } from '../game/achievements';

/**
 * One context holds the whole game. Screens read what they need and call the
 * actions below; every change is saved to storage automatically.
 */

type GameContextValue = {
  state: GameState;
  loading: boolean;

  // derived values (always computed from total XP, never stored separately)
  totalXp: number;
  level: ReturnType<typeof getLevelInfo>;
  /** Streak shown to the user: 0 once a day has been missed. */
  streak: number;

  // actions
  completeTask: (task: Task) => void;
  undoTask: (taskId: string) => void;
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  setName: (name: string) => void;
  setTheme: (theme: GameState['settings']['theme']) => void;
  resetProgress: () => void;
  resetTasks: () => void;

  // one-off celebrations the UI shows then dismisses
  levelUp: number | null;
  dismissLevelUp: () => void;
  unlockedNotice: Achievement | null;
  dismissUnlocked: () => void;
};

export type TaskInput = Omit<Task, 'id' | 'createdAt'>;

const GameContext = createContext<GameContextValue | null>(null);

/** Total XP = every completion's XP + achievement bonuses. Nothing else. */
export function calcTotalXp(state: GameState): number {
  return state.completions.reduce((sum, c) => sum + c.xp, 0) + state.bonusXp;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(createInitialState);
  const [loading, setLoading] = useState(true);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [unlockedNotice, setUnlockedNotice] = useState<Achievement | null>(null);
  const unlockQueue = useRef<Achievement[]>([]);

  // Load once on startup.
  useEffect(() => {
    let active = true;
    loadState().then((saved) => {
      if (!active) return;
      setState(saved);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Save on every change (but not the placeholder state before loading).
  useEffect(() => {
    if (loading) return;
    saveState(state);
  }, [state, loading]);

  const totalXp = useMemo(() => calcTotalXp(state), [state]);
  const level = useMemo(() => getLevelInfo(totalXp), [totalXp]);

  const streak = useMemo(() => {
    const { current, lastDate } = state.streak;
    if (!lastDate) return 0;
    // The streak is only "alive" if it was fed today or yesterday.
    if (lastDate === todayKey() || lastDate === yesterdayKey()) return current;
    return 0;
  }, [state.streak]);

  function showNextUnlock() {
    const next = unlockQueue.current.shift() ?? null;
    setUnlockedNotice(next);
  }

  /**
   * Applies a change, then checks for level-ups and achievements.
   * Achievements can grant XP, which can trigger another level-up, so the
   * check repeats until nothing new happens.
   *
   * Everything is worked out here rather than inside the setState updater, so
   * the celebration pop-ups fire exactly once per action.
   */
  function applyAndCheck(change: (prev: GameState) => GameState) {
    const levelBefore = getLevelInfo(calcTotalXp(state)).level;
    let next = change(state);
    const fresh: Achievement[] = [];

    for (let pass = 0; pass < ACHIEVEMENTS.length; pass++) {
      const unlocked = findNewlyUnlocked(next, calcTotalXp(next));
      if (unlocked.length === 0) break;
      const now = new Date().toISOString();
      next = {
        ...next,
        bonusXp: next.bonusXp + unlocked.reduce((sum, a) => sum + a.rewardXp, 0),
        unlocked: {
          ...next.unlocked,
          ...Object.fromEntries(unlocked.map((a) => [a.id, now])),
        },
      };
      fresh.push(...unlocked);
    }

    setState(next);

    const levelAfter = getLevelInfo(calcTotalXp(next)).level;
    if (levelAfter > levelBefore) setLevelUp(levelAfter);
    if (fresh.length > 0) {
      unlockQueue.current.push(...fresh);
      if (!unlockedNotice) showNextUnlock();
    }
  }

  const value: GameContextValue = {
    state,
    loading,
    totalXp,
    level,
    streak,

    completeTask(task) {
      const day = todayKey();
      // Guard: never award XP twice for the same task on the same day.
      const already = state.completions.some((c) => c.taskId === task.id && c.date === day);
      if (already) return;

      applyAndCheck((prev) => {
        const completion = {
          id: newId(),
          taskId: task.id,
          date: day,
          completedAt: new Date().toISOString(),
          title: task.title,
          xp: task.xp,
          category: task.category,
        };

        // Streak: one completion a day is enough to keep it going.
        let { current, longest, lastDate } = prev.streak;
        if (lastDate !== day) {
          current = lastDate === yesterdayKey() ? current + 1 : 1;
          longest = Math.max(longest, current);
          lastDate = day;
        }

        return {
          ...prev,
          completions: [...prev.completions, completion],
          streak: { current, longest, lastDate },
        };
      });
    },

    undoTask(taskId) {
      const day = todayKey();
      setState((prev) => ({
        ...prev,
        // Only today's completion is removed; history stays untouched.
        completions: prev.completions.filter((c) => !(c.taskId === taskId && c.date === day)),
      }));
    },

    addTask(input) {
      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, { ...input, id: newId(), createdAt: new Date().toISOString() }],
      }));
    },

    updateTask(id, input) {
      setState((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...input } : t)),
      }));
    },

    deleteTask(id) {
      setState((prev) => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }));
    },

    setName(name) {
      setState((prev) => ({ ...prev, profile: { ...prev.profile, name: name.trim() || 'Adventurer' } }));
    },

    setTheme(theme) {
      setState((prev) => ({ ...prev, settings: { ...prev.settings, theme } }));
    },

    resetProgress() {
      setState((prev) => ({
        ...prev,
        completions: [],
        bonusXp: 0,
        streak: { current: 0, longest: 0, lastDate: null },
        unlocked: {},
      }));
      unlockQueue.current = [];
      setLevelUp(null);
      setUnlockedNotice(null);
    },

    resetTasks() {
      setState((prev) => ({ ...prev, tasks: [] }));
    },

    levelUp,
    dismissLevelUp: () => setLevelUp(null),
    unlockedNotice,
    dismissUnlocked: showNextUnlock,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}

/** Clears storage too — used by Settings > Reset all progress. */
export async function wipeStorage() {
  await clearState();
}
