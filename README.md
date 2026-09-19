# Avenor Flow

A personal, offline real-life RPG: build a daily routine, complete tasks, earn XP, level up.

No account, no server, no internet. Everything lives in AsyncStorage on the device.

## Run it

```bash
cd life-rpg
npm install          # only the first time
npx expo start       # then press "a" for Android, or scan the QR with Expo Go
```

## Where things are

```
App.tsx                    tab switching + which modal is open
src/data/types.ts          every stored type
src/data/dates.ts          local-calendar day keys ('YYYY-MM-DD')
src/data/storage.ts        load / save / clear AsyncStorage
src/data/defaults.ts       starter routine + new-game state
src/game/levels.ts         THE LEVEL FORMULA — edit here to change the curve
src/game/xp.ts             difficulty ranges and XP clamping
src/game/categories.ts     the seven categories
src/game/achievements.ts   achievement list + unlock check
src/game/stats.ts          statistics and history grouping
src/state/GameContext.tsx  the whole game state and every action
src/state/useToday.ts      works out today's routine
src/ui/                    theme, shared components, animations, tab bar
src/screens/               one file per screen
```

## Two ideas worth knowing

**Total XP is the only source of truth.** Level, progress bar and "XP to next level"
are all calculated from it by `getLevelInfo()`, so they can never disagree, and
levelling up never spends or resets XP.

**There is no daily reset job.** A daily task is shown unticked simply because no
completion exists for today's date yet. Yesterday's completions stay in the log
forever, which is what history and statistics read.

## Changing the level curve

Edit `xpForLevel()` in `src/game/levels.ts`. Everything else follows automatically.

```ts
export function xpForLevel(level: number): number {
  const raw = 100 * Math.pow(1.5, level - 1);
  return Math.floor(raw / 25) * 25;   // 100, 150, 225, 325, 500, 750 ...
}
```
