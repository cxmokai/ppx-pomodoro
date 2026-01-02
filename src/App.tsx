import { useEffect, useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { TimerDisplay } from "./components/TimerDisplay";
import { Controls } from "./components/Controls";
import { ModeIndicator } from "./components/ModeIndicator";
import { TaskInput } from "./components/TaskInput";
import { SettingsModal } from "./components/SettingsModal";
import { Settings2, SkipForward } from "lucide-react";
import { themes } from "./utils/themes";

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

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          toggleTimer();
          break;
        case "r":
          resetTimer();
          break;
        case "s":
          skipMode();
          break;
        case "t":
          setIsSettingsOpen((prev) => !prev);
          break;
        case "escape":
          setIsSettingsOpen(false);
          break;
        case "1":
          updateSettings({ theme: "zedDark" });
          break;
        case "2":
          updateSettings({ theme: "zedLight" });
          break;
        case "3":
          updateSettings({ theme: "midnight" });
          break;
        case "4":
          updateSettings({ theme: "forest" });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleTimer, resetTimer, skipMode, updateSettings]);

  const theme = themes[settings.theme];

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme.bg}`}
    >
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${theme.text}`}>Pomodoro Timer</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${theme.textMuted}`}
          >
            <Settings2 size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <ModeIndicator mode={mode} currentTheme={settings.theme} />

          <TimerDisplay
            timeLeft={timeLeft}
            initialDuration={initialDuration}
            mode={mode}
            currentTheme={settings.theme}
          />

          <div className="mt-8 flex gap-4">
            <Controls
              isRunning={isRunning}
              onToggle={toggleTimer}
              onReset={resetTimer}
              currentTheme={settings.theme}
            />
            <button
              onClick={skipMode}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${theme.button}`}
              title="Skip to next mode"
            >
              <SkipForward size={20} />
              Skip
            </button>
          </div>

          <div className="mt-8 w-full max-w-md">
            <TaskInput currentTheme={settings.theme} />
          </div>

          <div className={`mt-8 text-center ${theme.textMuted}`}>
            <p className="text-sm">
              Completed {sessionCount} work session
              {sessionCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
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
