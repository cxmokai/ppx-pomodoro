import { useEffect, useState } from 'react';
import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { ModeIndicator } from './components/ModeIndicator';
import { TaskInput } from './components/TaskInput';
import { CompletedQuestsDrawer } from './components/CompletedQuestsDrawer';
import { SettingsModal } from './components/SettingsModal';
import { themes } from './utils/themes';
import {
  Settings,
  Sun,
  Moon,
  Diamond,
  Timer,
  History,
} from './components/icons';

function App() {
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
    updateSettings,
  } = useTimer();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [questUpdateTrigger, setQuestUpdateTrigger] = useState(0);

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
        case 'escape':
          setIsSettingsOpen(false);
          setIsDrawerOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer, skipMode]);

  const theme = themes[settings.theme];

  const handleQuestComplete = () => {
    setQuestUpdateTrigger((prev) => prev + 1);
  };

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
              onClick={() =>
                updateSettings({
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
              className={`brutal-btn text-sm px-3 py-2 flex items-center justify-center cursor-pointer no-select`}
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
              className={`brutal-btn text-sm px-3 py-2 flex items-center gap-2 cursor-pointer no-select`}
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
          <TaskInput
            currentTheme={settings.theme}
            onQuestComplete={handleQuestComplete}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        currentTheme={settings.theme}
      />

      <CompletedQuestsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentTheme={settings.theme}
        triggerUpdate={questUpdateTrigger}
      />
    </div>
  );
}

export default App;
