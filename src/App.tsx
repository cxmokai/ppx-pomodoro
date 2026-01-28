import { useEffect, useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useData } from './contexts/DataContext';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { ModeIndicator } from './components/ModeIndicator';
import { QuestInput } from './components/QuestInput';
import { HistoryDrawer } from './components/HistoryDrawer';
import { YesterdayQuestModal } from './components/YesterdayQuestModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthButton } from './components/AuthButton';
import { AuthProvider } from './contexts/AuthContext';
import { AccountLinkingProvider } from './contexts/AccountLinkingContext';
import { DataProvider } from './contexts/DataContext';
import { themes } from './utils/themes';
import {
  Settings,
  Sun,
  Moon,
  History,
  Timer,
  Target,
} from './components/icons';

function AppContent() {
  const {
    timeLeft,
    mode,
    isRunning,
    settings,
    initialDuration,
    toggleTimer,
    resetTimer,
    skipMode,
  } = useTimer();
  const {
    updateSettings: updateDataSettings,
    yesterdayIncompleteQuest,
    dismissYesterdayQuest,
    moveYesterdayQuestToToday,
    todayCompletedPomodoros,
  } = useData();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          toggleTimer();
          break;
        case 'r':
          resetTimer();
          break;
        case 's':
          skipMode();
          break;
        case 't':
          setIsSettingsOpen((prev) => !prev);
          break;
        case 'h':
          setIsHistoryOpen((prev) => !prev);
          break;
        case 'escape':
          setIsSettingsOpen(false);
          setIsHistoryOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer, skipMode]);

  const theme = themes[settings.theme];

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme.bg} brutal-fade-in`}
    >
      <div className="container mx-auto px-4 py-6 max-w-2xl brutal-slide-in">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <h1
            className={`text-2xl tracking-tight ${theme.text} no-select flex items-center gap-2`}
          >
            <Timer className="w-4 h-4" />
            PPX POMODORO
            {todayCompletedPomodoros > 0 && (
              <span
                className="text-sm no-select"
                style={{
                  color: '#FF6B35',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
              >
                +{todayCompletedPomodoros}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3">
            <AuthButton theme={theme} currentTheme={settings.theme} />
            <button
              onClick={() =>
                updateDataSettings({
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
              className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center justify-center cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
              title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center justify-center cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Timer Card */}
        <div className={`p-8 mb-8 brutal-card ${theme.surface}`}>
          <ModeIndicator mode={mode} currentTheme={settings.theme} />

          <div className="flex justify-center my-8">
            <TimerDisplay
              timeLeft={timeLeft}
              initialDuration={initialDuration}
              mode={mode}
              currentTheme={settings.theme}
              isRunning={isRunning}
            />
          </div>

          <Controls
            isRunning={isRunning}
            onToggle={toggleTimer}
            onReset={resetTimer}
            onSkip={skipMode}
            currentTheme={settings.theme}
          />
        </div>

        {/* Quest Input */}
        <div className={`p-5 brutal-card ${theme.surface}`}>
          <div
            className={`flex items-center justify-between mb-3 ${theme.textMuted}`}
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="text-sm no-select">CURRENT QUEST</span>
            </div>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className={`brutal-btn px-3 py-1 flex items-center justify-center cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
              title="Completed quests history"
            >
              <History className="w-4 h-4" />
            </button>
          </div>
          <QuestInput currentTheme={settings.theme} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={settings.theme}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentTheme={settings.theme}
      />

      <YesterdayQuestModal
        isOpen={!!yesterdayIncompleteQuest}
        yesterdayQuest={yesterdayIncompleteQuest}
        onDismiss={dismissYesterdayQuest}
        onMoveToToday={moveYesterdayQuestToToday}
        currentTheme={settings.theme}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AccountLinkingProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AccountLinkingProvider>
    </AuthProvider>
  );
}

export default App;
