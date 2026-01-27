import { useEffect, useState, useRef } from 'react';
import { useTimer } from './hooks/useTimer';
import { TimerDisplay } from './components/TimerDisplay';
import { Controls } from './components/Controls';
import { ModeIndicator } from './components/ModeIndicator';
import { TaskInput } from './components/TaskInput';
import { CompletedQuests } from './components/CompletedQuests';
import { SettingsModal } from './components/SettingsModal';
import { themes } from './utils/themes';
import { Settings, Sun, Moon, Diamond, Timer } from './components/icons';

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
  const [questUpdateTrigger, setQuestUpdateTrigger] = useState(0);
  const [showPlusIndicator, setShowPlusIndicator] = useState(false);
  const [plusCount, setPlusCount] = useState(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleTimer, resetTimer, skipMode]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const theme = themes[settings.theme];

  const previousSessionCount = useRef(0);

  useEffect(() => {
    if (sessionCount > previousSessionCount.current) {
      const completed = sessionCount - previousSessionCount.current;
      setPlusCount(completed);
      setShowPlusIndicator(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setShowPlusIndicator(false);
      }, 2000);

      previousSessionCount.current = sessionCount;
    }
  }, [sessionCount]);

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
            {showPlusIndicator && (
              <span
                className="text-sm brutal-pop no-select"
                style={{
                  color: '#FF6B35',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
              >
                +{plusCount}
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
        <div className={`p-5 brutal-card mb-6 ${theme.surface}`}>
          <div
            className={`flex items-center gap-2 mb-3 ${theme.textMuted} no-select`}
          >
            <Timer className="w-5 h-5" />
            <span className="text-sm">CURRENT QUEST</span>
          </div>
          <TaskInput
            currentTheme={settings.theme}
            onQuestComplete={handleQuestComplete}
          />
        </div>

        {/* Completed Quests */}
        <CompletedQuests
          currentTheme={settings.theme}
          triggerUpdate={questUpdateTrigger}
        />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        updateSettings={updateSettings}
        currentTheme={settings.theme}
      />
    </div>
  );
}

export default App;
