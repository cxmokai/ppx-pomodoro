import { Play, Pause, RotateCcw } from "lucide-react";
import { themes } from "../utils/themes";

interface ControlsProps {
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  currentTheme: string;
}

export const Controls = ({
  isRunning,
  onToggle,
  onReset,
  currentTheme,
}: ControlsProps) => {
  const theme = themes[currentTheme];

  return (
    <div className="flex gap-4">
      <button
        onClick={onToggle}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${theme.buttonPrimary}`}
      >
        {isRunning ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
        {isRunning ? "Pause" : "Start"}
      </button>

      <button
        onClick={onReset}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ${theme.buttonSecondary}`}
      >
        <RotateCcw size={20} />
        Reset
      </button>
    </div>
  );
};
