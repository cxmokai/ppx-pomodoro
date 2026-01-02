import { type TimerMode } from '../hooks/useTimer'
import { themes, modeColors } from '../utils/themes'

interface TimerDisplayProps {
  timeLeft: number
  initialDuration: number
  mode: TimerMode
  currentTheme: string
}

export const TimerDisplay = ({ timeLeft, initialDuration, mode, currentTheme }: TimerDisplayProps) => {
  const theme = themes[currentTheme]
  const modeColor = modeColors[mode]?.color || theme.accent
  
  const circumference = 2 * Math.PI * 140
  const progress = timeLeft / initialDuration
  const strokeDashoffset = circumference - progress * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg width="320" height="320" className="transform -rotate-90">
        <circle
          cx="160"
          cy="160"
          r="140"
          stroke={theme.border.replace('border-', '#').replace('-[', '#')}
          strokeWidth="8"
          fill="none"
          opacity="0.5"
        />
        <circle
          cx="160"
          cy="160"
          r="140"
          stroke={modeColor}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute text-center">
        <div className={`text-7xl font-bold tabular-nums ${theme.text}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  )
}
