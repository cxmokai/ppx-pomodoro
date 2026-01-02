import { type TimerMode } from '../hooks/useTimer'
import { themes, modeColors } from '../utils/themes'

interface ModeIndicatorProps {
  mode: TimerMode
  currentTheme: string
}

export const ModeIndicator = ({ mode, currentTheme }: ModeIndicatorProps) => {
  const theme = themes[currentTheme]
  const modeInfo = modeColors[mode]
  
  return (
    <div className="flex items-center gap-2 mb-6">
      <div
        className="w-3 h-3 rounded-full animate-pulse-slow"
        style={{ backgroundColor: modeInfo.color }}
      />
      <span className={`text-sm font-medium ${theme.textMuted}`}>
        {modeInfo.name}
      </span>
    </div>
  )
}
