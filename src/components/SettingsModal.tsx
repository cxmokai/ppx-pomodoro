import { useState, useEffect } from 'react';
import { Volume2, VolumeX, X, Settings as SettingsIcon } from './icons';
import { themes, TIMEZONES, type Timezone } from '../utils/themes';
import { getTimezoneName } from '../utils/timezone';
import { useData } from '../contexts/DataContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  currentTheme,
}: SettingsProps) => {
  const { settings, updateSettings } = useData();
  const [localSettings, setLocalSettings] = useState(settings);
  const theme = themes[currentTheme];

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (
    key: string,
    value: number | boolean | string
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    updateSettings({ [key]: value });
  };

  const shortcuts = [
    { key: 'SPACE / K', action: 'Start/Pause' },
    { key: 'R', action: 'Reset' },
    { key: 'S', action: 'Skip Mode' },
    { key: 'T', action: 'Settings' },
    { key: 'ESC', action: 'Close' },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl brutal-slide-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: theme.surface.replace('bg-[', '').replace(']', ''),
          border: '4px solid #000000',
          boxShadow: '8px 8px 0 0 #000000',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-6 border-b-4"
          style={{
            borderColor: '#000000',
            background: theme.bg.replace('bg-[', '').replace(']', ''),
          }}
        >
          <h2
            className="text-lg no-select flex items-center gap-3"
            style={{ color: theme.text.replace('text-[', '').replace(']', '') }}
          >
            <SettingsIcon className="w-5 h-5" />
            <span>SETTINGS</span>
          </h2>
          <button
            onClick={onClose}
            className="brutal-btn px-4 py-2 flex items-center justify-center cursor-pointer no-select"
            style={{
              background: theme.surfaceHighlight
                .replace('bg-[', '')
                .replace(']', ''),
            }}
          >
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-8 space-y-6 max-h-[70vh] overflow-y-auto"
          style={{
            background: theme.surface.replace('bg-[', '').replace(']', ''),
          }}
        >
          {/* Duration Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm mb-2 no-select"
                style={{
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              >
                WORK (min)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.workDuration}
                onChange={(e) =>
                  handleChange('workDuration', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm brutal-input no-select"
                style={{
                  background: theme.bg.replace('bg-[', '').replace(']', ''),
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm mb-2 no-select"
                style={{
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              >
                SHORT BREAK (min)
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={localSettings.shortBreakDuration}
                onChange={(e) =>
                  handleChange('shortBreakDuration', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm brutal-input no-select"
                style={{
                  background: theme.bg.replace('bg-[', '').replace(']', ''),
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm mb-2 no-select"
                style={{
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              >
                LONG BREAK (min)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={localSettings.longBreakDuration}
                onChange={(e) =>
                  handleChange('longBreakDuration', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm brutal-input no-select"
                style={{
                  background: theme.bg.replace('bg-[', '').replace(']', ''),
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm mb-2 no-select"
                style={{
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              >
                INTERVAL
              </label>
              <input
                type="number"
                min="2"
                max="8"
                value={localSettings.longBreakInterval}
                onChange={(e) =>
                  handleChange('longBreakInterval', parseInt(e.target.value))
                }
                className="w-full px-3 py-2 text-sm brutal-input no-select"
                style={{
                  background: theme.bg.replace('bg-[', '').replace(']', ''),
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              />
            </div>
          </div>

          {/* Sound Toggle */}
          <div
            className="p-4 border-4"
            style={{
              borderColor: '#000000',
              background: theme.bg.replace('bg-[', '').replace(']', ''),
            }}
          >
            <label className="flex items-center justify-between cursor-pointer">
              <span
                className="text-sm no-select"
                style={{
                  color: theme.text.replace('text-[', '').replace(']', ''),
                }}
              >
                ENABLE SOUND
              </span>
              <div className="flex items-center gap-3">
                <span
                  style={{
                    color: theme.text.replace('text-[', '').replace(']', ''),
                  }}
                >
                  {localSettings.soundEnabled ? (
                    <Volume2 className="w-[18px] h-[18px]" />
                  ) : (
                    <VolumeX className="w-[18px] h-[18px]" />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={localSettings.soundEnabled}
                  onChange={(e) =>
                    handleChange('soundEnabled', e.target.checked)
                  }
                  className="brutal-checkbox"
                />
              </div>
            </label>
          </div>

          {/* Keyboard Shortcuts */}
          <div
            className="p-4 border-4"
            style={{
              borderColor: '#000000',
              background: theme.bg.replace('bg-[', '').replace(']', ''),
            }}
          >
            <h3
              className="text-sm mb-3 no-select"
              style={{
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            >
              CONTROLS
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.key}
                  className="flex justify-between items-center"
                >
                  <kbd
                    className="px-3 py-2 text-xs no-select brutal-card"
                    style={{
                      background: theme.surfaceHighlight
                        .replace('bg-[', '')
                        .replace(']', ''),
                      color: theme.text.replace('text-[', '').replace(']', ''),
                    }}
                  >
                    {shortcut.key}
                  </kbd>
                  <span
                    className="text-sm no-select"
                    style={{
                      color: theme.text.replace('text-[', '').replace(']', ''),
                    }}
                  >
                    {shortcut.action}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div
            className="p-4 border-4"
            style={{
              borderColor: '#000000',
              background: theme.bg.replace('bg-[', '').replace(']', ''),
            }}
          >
            <h3
              className="text-sm mb-3 no-select"
              style={{
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            >
              THEME
            </h3>
            <div className="flex gap-2">
              {Object.keys(themes).map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => handleChange('theme', themeName)}
                  className="flex-1 px-3 py-2 text-sm brutal-btn no-select"
                  style={{
                    background:
                      localSettings.theme === themeName
                        ? '#FF6B35'
                        : theme.surfaceHighlight
                            .replace('bg-[', '')
                            .replace(']', ''),
                    color:
                      localSettings.theme === themeName
                        ? '#000000'
                        : theme.text.replace('text-[', '').replace(']', ''),
                  }}
                >
                  {themes[themeName].name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Timezone Selector */}
          <div
            className="p-4 border-4"
            style={{
              borderColor: '#000000',
              background: theme.bg.replace('bg-[', '').replace(']', ''),
            }}
          >
            <h3
              className="text-sm mb-3 no-select"
              style={{
                color: theme.text.replace('text-[', '').replace(']', ''),
              }}
            >
              TIMEZONE
            </h3>
            <select
              value={localSettings.timezone || 'America/Los_Angeles'}
              onChange={(e) => handleChange('timezone', e.target.value as Timezone)}
              className={`w-full px-3 py-2 text-sm brutal-input no-select`}
              style={{
                background: theme.bg.replace('bg-[', '').replace(']', ''),
                color: theme.text.replace('text-[', '').replace(']', ''),
                border: '2px solid #000000',
              }}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {getTimezoneName(tz)}
                </option>
              ))}
            </select>
            <p
              className="text-xs mt-2 no-select"
              style={{ color: theme.textMuted.replace('text-[', '').replace(']', '') }}
            >
              Used for accurate daily statistics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
