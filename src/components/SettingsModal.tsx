import { useState, useEffect } from "react";
import { Volume2, VolumeX, X } from "pixelarticons";
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
    { key: "SPACE / K", action: "Start/Pause" },
    { key: "R", action: "Reset" },
    { key: "S", action: "Skip Mode" },
    { key: "T", action: "Settings" },
    { key: "ESC", action: "Close" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 crt-vignette"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border-4 ${theme.border} ${theme.modal} ${theme.shadow} pixel-slide-in`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `8px 8px 0 0 rgba(0,0,0,0.4)`,
        }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b-4 ${theme.border} ${theme.surface}`}>
          <h2 className={`text-base ${theme.text} pixel-no-select flex items-center gap-3`} style={{
            textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
          }}>
            <span className="text-2xl">⚙</span>
            <span>SETTINGS</span>
          </h2>
          <button
            onClick={onClose}
            className={`pixel-btn px-4 py-2 border-4 cursor-pointer flex items-center justify-center ${theme.border} ${theme.button} pixel-no-select`}
            style={{
              textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Duration Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] mb-2 ${theme.textMuted} pixel-no-select`}>
                WORK (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.workDuration}
                onChange={(e) =>
                  handleChange("workDuration", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 text-[10px] border-4 ${theme.input} pixel-input pixel-no-select`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: `inset 2px 2px 0 0 rgba(0,0,0,0.15)`,
                }}
              />
            </div>
            <div>
              <label className={`block text-[10px] mb-2 ${theme.textMuted} pixel-no-select`}>
                SHORT BREAK (min)
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={localSettings.shortBreakDuration}
                onChange={(e) =>
                  handleChange("shortBreakDuration", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 text-[10px] border-4 ${theme.input} pixel-input pixel-no-select`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: `inset 2px 2px 0 0 rgba(0,0,0,0.15)`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-[10px] mb-2 ${theme.textMuted} pixel-no-select`}>
                LONG BREAK (min)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={localSettings.longBreakDuration}
                onChange={(e) =>
                  handleChange("longBreakDuration", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 text-[10px] border-4 ${theme.input} pixel-input pixel-no-select`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: `inset 2px 2px 0 0 rgba(0,0,0,0.15)`,
                }}
              />
            </div>
            <div>
              <label className={`block text-[10px] mb-2 ${theme.textMuted} pixel-no-select`}>
                INTERVAL
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={localSettings.longBreakInterval}
                onChange={(e) =>
                  handleChange("longBreakInterval", parseInt(e.target.value))
                }
                className={`w-full px-3 py-2 text-[10px] border-4 ${theme.input} pixel-input pixel-no-select`}
                style={{
                  fontFamily: "'Press Start 2P', cursive",
                  boxShadow: `inset 2px 2px 0 0 rgba(0,0,0,0.15)`,
                }}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <div className={`p-4 border-4 ${theme.border} ${theme.bg}`}>
            <label className="flex items-center justify-between cursor-pointer pixel-cursor-pointer">
              <span className={`text-[10px] ${theme.text} pixel-no-select`}>
                ENABLE SOUND
              </span>
              <div className="flex items-center gap-3">
                {localSettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) => handleChange("soundEnabled", e.target.checked)}
                  className="pixel-checkbox"
                />
              </div>
            </label>
          </div>

          {/* Keyboard Shortcuts */}
          <div className={`p-4 border-4 ${theme.border} ${theme.bg}`}>
            <h3 className={`text-[10px] mb-3 ${theme.textMuted} pixel-no-select`}>CONTROLS</h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex justify-between items-center">
                  <kbd
                    className={`px-3 py-2 text-[8px] border-4 ${theme.border} ${theme.surface} pixel-no-select`}
                    style={{
                      boxShadow: `2px 2px 0 0 rgba(0,0,0,0.2)`,
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                  <span className={`text-[9px] ${theme.textMuted} pixel-no-select`}>
                    {shortcut.action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
