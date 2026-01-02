import { useState, useEffect } from "react";
import { X, Settings2, Keyboard } from "lucide-react";
import { themes, type Settings } from "../utils/themes";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  currentTheme: string;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  settings,
  updateSettings,
  currentTheme,
}: SettingsProps) => {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const theme = themes[currentTheme];

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (
    key: keyof Settings,
    value: number | boolean | string,
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings({ [key]: value });
  };

  const shortcuts = [
    { key: "Space / K", action: "Toggle Start/Pause" },
    { key: "R", action: "Reset Timer" },
    { key: "S", action: "Skip to Next Mode" },
    { key: "T", action: "Toggle Settings" },
    { key: "Esc", action: "Close Settings" },
    { key: "1-4", action: "Quick Theme Switch" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`rounded-xl p-6 w-full max-w-lg border shadow-2xl ${theme.modal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings2 size={24} className={theme.text} />
            <h2 className={`text-xl font-bold ${theme.text}`}>Settings</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ${theme.textMuted}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
            >
              Work Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="60"
              value={localSettings.workDuration}
              onChange={(e) =>
                handleChange("workDuration", parseInt(e.target.value))
              }
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
            >
              Short Break (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={localSettings.shortBreakDuration}
              onChange={(e) =>
                handleChange("shortBreakDuration", parseInt(e.target.value))
              }
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
            >
              Long Break (minutes)
            </label>
            <input
              type="number"
              min="5"
              max="30"
              value={localSettings.longBreakDuration}
              onChange={(e) =>
                handleChange("longBreakDuration", parseInt(e.target.value))
              }
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
            >
              Long Break After (work sessions)
            </label>
            <input
              type="number"
              min="2"
              max="8"
              value={localSettings.longBreakInterval}
              onChange={(e) =>
                handleChange("longBreakInterval", parseInt(e.target.value))
              }
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="sound"
              checked={localSettings.soundEnabled}
              onChange={(e) => handleChange("soundEnabled", e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <label
              htmlFor="sound"
              className={`text-sm font-medium cursor-pointer ${theme.text}`}
            >
              Enable Sound Notifications
            </label>
          </div>

          <div>
            <label
              className={`block text-sm font-medium mb-2 ${theme.textMuted}`}
            >
              Theme
            </label>
            <select
              value={localSettings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${theme.input}`}
            >
              {Object.entries(themes).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Keyboard size={20} className={theme.textMuted} />
            <h3 className={`text-sm font-semibold ${theme.textMuted}`}>
              Keyboard Shortcuts
            </h3>
          </div>
          <div className="space-y-2">
            {shortcuts.map((shortcut) => (
              <div key={shortcut.key} className="flex justify-between">
                <kbd
                  className={`px-2 py-1 rounded text-xs font-mono ${theme.button}`}
                >
                  {shortcut.key}
                </kbd>
                <span className={`text-sm ${theme.textMuted}`}>
                  {shortcut.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
