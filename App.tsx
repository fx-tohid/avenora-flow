import React, { useState } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGame } from './src/state/GameContext';
import { AuthProvider } from './src/state/AuthContext';
import { useTheme } from './src/ui/theme';
import { Loading } from './src/ui/components';
import { TabBar, type TabKey } from './src/ui/TabBar';
import { HomeScreen } from './src/screens/HomeScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { AchievementsScreen } from './src/screens/AchievementsScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TaskFormModal } from './src/screens/TaskFormModal';
import { AchievementModal, LevelUpModal, XpPop } from './src/ui/Celebrations';
import type { Task } from './src/data/types';
import { newId } from './src/data/defaults';

export default function App() {
  return (
    <GameProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </GameProvider>
  );
}

/**
 * Holds which tab is showing and which modal is open. Five screens do not
 * need a navigation library — swapping components is enough.
 */
function AppShell() {
  const t = useTheme();
  const { loading, levelUp, dismissLevelUp, unlockedNotice, dismissUnlocked } = useGame();

  const [tab, setTab] = useState<TabKey>('home');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [xpPop, setXpPop] = useState<{ id: string; amount: number } | null>(null);

  if (loading) return <Loading />;

  function openNewTask() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEditTask(task: Task) {
    setEditing(task);
    setFormOpen(true);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.bg,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 44,
      }}
    >
      <StatusBar style={t.dark ? 'light' : 'dark'} />

      <View style={{ flex: 1 }}>
        {tab === 'home' ? (
          <HomeScreen
            onAddTask={openNewTask}
            onCompleted={(task) => setXpPop({ id: newId(), amount: task.xp })}
          />
        ) : null}
        {tab === 'tasks' ? <TasksScreen onAddTask={openNewTask} onEditTask={openEditTask} /> : null}
        {tab === 'stats' ? <StatsScreen onOpenHistory={() => setHistoryOpen(true)} /> : null}
        {tab === 'achievements' ? <AchievementsScreen /> : null}
        {tab === 'teams' ? <TeamsScreen /> : null}
        {tab === 'settings' ? <SettingsScreen /> : null}
      </View>

      <XpPop pop={xpPop} />
      <TabBar active={tab} onChange={setTab} />

      <TaskFormModal visible={formOpen} task={editing} onClose={() => setFormOpen(false)} />
      <HistoryScreen visible={historyOpen} onClose={() => setHistoryOpen(false)} />
      <LevelUpModal level={levelUp} onClose={dismissLevelUp} />
      <AchievementModal achievement={unlockedNotice} onClose={dismissUnlocked} />
    </View>
  );
}
