import { useEffect, useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { useData } from './contexts/DataContext';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { ModeIndicator } from './components/ModeIndicator';
import { TaskInput } from './components/TaskInput';
import { CompletedQuestsDrawer } from './components/CompletedQuestsDrawer';
import { SessionHistoryDrawer } from './components/SessionHistoryDrawer';
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
  Diamond,
  Timer,
  History,
  Clock,
} from './components/icons';

function AppContent() {
  const {
    timeLeft,
    mode,
    isRunning,
    sessionCount,
    settings,
    initialDuration,
    toggleTimer,
    resetTimer,
    skipMode,
  } = useTimer();
  const { updateSettings: updateDataSettings } = useData();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);

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
          setIsSessionHistoryOpen((prev) => !prev);
          break;
        case 'escape':
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          setIsSessionHistoryOpen(false);
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
            <Diamond className="w-4 h-4" />
            POMODORO
            {sessionCount > 0 && (
              <span
                className="text-sm no-select"
                style={{
                  color: '#FF6B35',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
              >
                +{sessionCount}
              </span>
            )}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSessionHistoryOpen(true)}
              className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
              title="Session History (H)"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">HISTORY</span>
            </button>
            <AuthButton theme={theme} />
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
              className={`brutal-btn text-sm px-3 py-2 h-10 flex items-center gap-2 cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            >
              <Settings className="w-4 h-4" />
              <span>SETTINGS</span>
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

        {/* Task Input */}
        <div className={`p-5 brutal-card ${theme.surface}`}>
          <div
            className={`flex items-center justify-between mb-3 ${theme.textMuted}`}
          >
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span className="text-sm no-select">CURRENT QUEST</span>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`brutal-btn px-3 py-1 text-xs flex items-center gap-2 cursor-pointer no-select`}
              style={{
                background: theme.surfaceHighlight
                  .replace('bg-[', '')
                  .replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            >
              <History className="w-4 h-4" />
              <span>COMPLETED</span>
            </button>
          </div>
          <TaskInput currentTheme={settings.theme} />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={settings.theme}
      />

      <CompletedQuestsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTheme={settings.theme}
      />

      <SessionHistoryDrawer
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
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
