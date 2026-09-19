// Every type the app stores or passes around lives here.

export type Difficulty = 'easy' | 'normal' | 'hard' | 'challenge';

export type CategoryId =
  | 'study'
  | 'fitness'
  | 'learning'
  | 'productivity'
  | 'personal'
  | 'chores'
  | 'custom';

export type Task = {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: Difficulty;
  category: CategoryId;
  repeatsDaily: boolean;
  createdAt: string; // ISO timestamp
};

/**
 * One completed task on one specific day.
 * Daily tasks produce one Completion per calendar day; this is what makes
 * "a new instance every day" work without copying tasks around.
 */
export type Completion = {
  id: string;
  taskId: string;
  date: string; // local calendar day, 'YYYY-MM-DD'
  completedAt: string; // ISO timestamp
  // Title/xp/category are copied in so history stays correct even if the
  // task is later edited or deleted.
  title: string;
  xp: number;
  category: CategoryId;
};

export type ThemeMode = 'dark' | 'light' | 'system';

export type GameState = {
  version: number;
  profile: {
    name: string;
    createdAt: string;
  };
  settings: {
    theme: ThemeMode;
  };
  tasks: Task[];
  completions: Completion[];
  /** XP granted by achievements (kept separate from task XP). */
  bonusXp: number;
  streak: {
    current: number;
    longest: number;
    lastDate: string | null; // 'YYYY-MM-DD'
  };
  /** achievement id -> ISO timestamp it was unlocked */
  unlocked: Record<string, string>;
};
