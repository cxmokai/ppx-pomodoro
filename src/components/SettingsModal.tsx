import { useState, useEffect } from "react";
import { Volume2, VolumeX, X } from "./icons";
import { themes, type Settings } from "../utils/themes";

const SettingsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="terminal-glow">
    <circle cx="12" cy="12" r="3" fill="currentColor"/>
    <path d="M19.4 15C19.2784 15.3038 19.2448 15.6398 19.3045 15.9643C19.3642 16.2888 19.5141 16.5869 19.7348 16.8232L19.7948 16.8832C19.9709 17.059 20.1105 17.2683 20.2049 17.4988C20.2994 17.7293 20.3467 17.9762 20.3442 18.2253C20.3417 18.4744 20.2895 18.7202 20.1906 18.9487C20.0917 19.1772 19.9482 19.3836 19.7687 19.5559L19.7087 19.6159C19.4879 19.8521 19.3381 20.1502 19.2784 20.4747C19.2186 20.7992 19.2523 21.1352 19.3739 21.439V21.499C19.4976 21.7992 19.7044 22.0576 19.9705 22.2446C20.2366 22.4315 20.5502 22.5393 20.8748 22.5544H21.0048C21.3353 22.5544 21.6523 22.423 21.8863 22.189C22.1204 21.955 22.2518 21.638 22.2518 21.3075V21.1875C22.2543 20.9384 22.3071 20.6926 22.406 20.4641C22.5049 20.2356 22.6484 20.0292 22.8279 19.8569L22.8879 19.7969C23.1087 19.5607 23.2585 19.2626 23.3182 18.9381C23.378 18.6136 23.3443 18.2776 23.2227 17.9736V17.9136C23.099 17.6135 22.8922 17.3551 22.6261 17.1681C22.36 16.9811 22.0464 16.8734 21.7218 16.8583H21.5918C21.2613 16.8583 20.9443 16.7269 20.7103 16.4929C20.4762 16.2589 20.3448 15.9418 20.3448 15.6113V15.4913C20.3448 15.1608 20.4762 14.8438 20.7103 14.6098C20.9443 14.3757 21.2613 14.2443 21.5918 14.2443H21.7218C22.0523 14.2443 22.3694 14.113 22.6034 13.8789C22.8374 13.6449 22.9688 13.3278 22.9688 12.9973V12.8773C22.9688 12.5468 22.8374 12.2298 22.6034 11.9958C22.3694 11.7617 22.0523 11.6303 21.7218 11.6303H21.5918C21.2613 11.6303 20.9443 11.499 20.7103 11.2649C20.4762 11.0309 20.3448 10.7138 20.3448 10.3833V10.2633C20.3448 9.93284 20.4762 9.6158 20.7103 9.38177C20.9443 9.14774 21.2613 9.01636 21.5918 9.01636H21.7218C22.0464 9.00128 22.36 8.89351 22.6261 8.70655C22.8922 8.51959 23.099 8.26118 23.2227 7.96103V7.90103C23.3443 7.59703 23.378 7.26103 23.3182 6.93653C23.2585 6.61203 23.1087 6.31393 22.8879 6.07773L22.8279 6.01773C22.6484 5.84542 22.5049 5.63901 22.406 5.41052C22.3071 5.18203 22.2543 4.93623 22.2518 4.68713V4.56713C22.2518 4.23663 22.1204 3.91959 21.8863 3.68556C21.6523 3.45153 21.3353 3.32015 21.0048 3.32015H20.8748C20.5502 3.30507 20.2366 3.1973 19.9705 3.01034C19.7044 2.82338 19.4976 2.56497 19.3739 2.26482V2.20482C19.2523 1.90082 19.2186 1.56482 19.2784 1.24032C19.3381 0.915819 19.4879 0.617719 19.7087 0.381519L19.7687 0.321519C19.9482 0.149209 20.0917 -0.0572057 20.1906 -0.285696C20.2895 -0.514186 20.3417 -0.759987 20.3442 -1.00908V-1.12908C20.3467 -1.37818 20.2994 -1.62509 20.2049 -1.8556C20.1105 -2.0861 19.9709 -2.29537 19.7948 -2.47118L19.7348 -2.53118C19.559 -2.70719 19.4198 -2.91668 19.3257 -3.14729C19.2317 -3.37791 19.1847 -3.62483 19.1877 -3.87393C19.1907 -4.12304 19.2435 -4.36868 19.3429 -4.59695C19.4424 -4.82523 19.5862 -5.03131 19.7657 -5.20368L19.8257 -5.26368C20.0465 -5.49988 20.1963 -5.79798 20.256 -6.12248C20.3157 -6.44698 20.282 -6.78298 20.1604 -7.08698V-7.14698C20.0367 -7.44713 19.8299 -7.70554 19.5638 -7.8925C19.2977 -8.07946 18.9841 -8.18723 18.6595 -8.20231H18.5295C18.199 -8.20231 17.882 -8.33369 17.6479 -8.56772C17.4139 -8.80175 17.2825 -9.11879 17.2825 -9.44929V-9.56929C17.2825 -9.89979 17.4139 -10.2168 17.6479 -10.4509C17.882 -10.6849 18.199 -10.8163 18.5295 -10.8163H18.6595C18.9841 -10.8313 19.2977 -10.9391 19.5638 -11.1261C19.8299 -11.313 20.0367 -11.5714 20.1604 -11.8716V-11.9316C20.282 -12.2356 20.3157 -12.5716 20.256 -12.8961C20.1963 -13.2206 20.0465 -13.5187 19.8257 -13.7549L19.7657 -13.8149C19.5862 -13.9872 19.4424 -14.1936 19.3429 -14.4219C19.2435 -14.6501 19.1907 -14.8958 19.1877 -15.1449C19.1847 -15.394 19.2317 -15.6409 19.3257 -15.8715C19.4198 -16.1022 19.559 -16.3116 19.7348 -16.4876L19.7948 -16.5476C19.9709 -16.7235 20.1105 -16.9328 20.2049 -17.1633C20.2994 -17.3938 20.3467 -17.6407 20.3442 -17.8898C20.3417 -18.1389 20.2895 -18.3847 20.1906 -18.6132C20.0917 -18.8417 19.9709 -19.0491 19.7657 -19.2214L19.7057 -19.2814C19.4879 -19.5176 19.3381 -19.8157 19.2784 -20.1402C19.2186 -20.4647 19.2523 -20.8007 19.3739 -21.1047V-21.1647C19.4976 -21.4649 19.7044 -21.7233 19.9705 -21.9103C20.2366 -22.0972 20.5502 -22.205 20.8748 -22.2201H21.0048C21.3353 -22.2201 21.6523 -22.0887 21.8863 -21.8547C22.1204 -21.6207 22.2518 -21.3036 22.2518 -20.9731V-20.8531C22.2543 -20.604 22.3071 -20.3582 22.406 -20.1297C22.5049 -19.9012 22.6484 -19.6948 22.8279 -19.5225L22.8879 -19.4625C23.1087 -19.2263 23.2585 -18.9282 23.3182 -18.6037C23.378 -18.2792 23.3443 -17.9432 23.2227 -17.6392V-17.5792C23.099 -17.279 22.8922 -17.0206 22.6261 -16.8337C22.36 -16.6467 22.0464 -16.5389 21.7218 -16.5239H21.5918C21.2613 -16.5239 20.9443 -16.3925 20.7103 -16.1584C20.4762 -15.9244 20.3448 -15.6074 20.3448 -15.2769V-15.1569C20.3448 -14.8264 20.4762 -14.5094 20.7103 -14.2753C20.9443 -14.0413 21.2613 -13.9099 21.5918 -13.9099H21.7218C22.0523 -13.9099 22.3694 -14.0413 22.6034 -14.2753C22.8374 -14.5094 22.9688 -14.8264 22.9688 -15.1569V-15.2769C22.9688 -15.6074 22.8374 -15.9244 22.6034 -16.1584C22.3694 -16.3925 22.0523 -16.5239 21.7218 -16.5239H21.5918C21.2613 -16.5239 20.9443 -16.3925 20.7103 -16.1584C20.4762 -15.9244 20.3448 -15.6074 20.3448 -15.2769V-15.1569Z" fill="currentColor"/>
  </svg>
);

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
          <h2 className={`text-base ${theme.text} pixel-no-select flex items-center gap-3 terminal-glow`}>
            <SettingsIcon />
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
              <label className={`block text-[10px] mb-2 ${theme.text} pixel-no-select terminal-glow`}>
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
              <label className={`block text-[10px] mb-2 ${theme.text terminal-glow} pixel-no-select`}>
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
              <label className={`block text-[10px] mb-2 ${theme.text terminal-glow} pixel-no-select`}>
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
              <label className={`block text-[10px] mb-2 ${theme.text terminal-glow} pixel-no-select`}>
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
            <h3 className={`text-[10px] mb-3 ${theme.text terminal-glow} pixel-no-select`}>CONTROLS</h3>
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
                  <span className={`text-[9px] ${theme.text terminal-glow} pixel-no-select`}>
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
