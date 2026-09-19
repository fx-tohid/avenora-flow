import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState } from './types';
import { createInitialState, STATE_VERSION } from './defaults';

// Kept as 'life-rpg' from the original project name: changing this key would
// orphan any progress already saved on a device.
const STORAGE_KEY = 'life-rpg:state:v1';

/**
 * Loads the saved game. Anything missing or unreadable falls back to a fresh
 * state rather than crashing — a personal app should always open.
 */
export async function loadState(): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    return mergeWithDefaults(parsed);
  } catch (error) {
    console.warn('Could not load saved game, starting fresh.', error);
    return createInitialState();
  }
}

export async function saveState(state: GameState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Could not save game.', error);
  }
}

export async function clearState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/** Fills in any field an older save did not have yet. */
function mergeWithDefaults(saved: Partial<GameState>): GameState {
  const base = createInitialState();
  return {
    version: STATE_VERSION,
    profile: { ...base.profile, ...saved.profile },
    settings: { ...base.settings, ...saved.settings },
    tasks: saved.tasks ?? base.tasks,
    completions: saved.completions ?? [],
    bonusXp: saved.bonusXp ?? 0,
    streak: { ...base.streak, ...saved.streak },
    unlocked: saved.unlocked ?? {},
  };
}
