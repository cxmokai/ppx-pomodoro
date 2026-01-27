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
  const modeInfo = modeColors[mode]

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // Pixel art style segments for digits
  const Digit = ({ value }: { value: number }) => {
    const digits = value.toString().padStart(2, '0')
    return (
      <div className="flex gap-2">
        {digits.split('').map((digit, i) => (
          <div
            key={i}
            className={`w-14 h-18 flex items-center justify-center text-4xl font-bold pixel-digit ${theme.text} pixel-no-select`}
            style={{
              background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
              border: `4px solid ${theme.border.replace('border-[', '').replace(']', '')}`,
              boxShadow: `
                inset -2px -2px 0 0 rgba(0,0,0,0.25),
                inset 2px 2px 0 0 rgba(0,0,0,0.1),
                2px 2px 0 0 rgba(0,0,0,0.15)
              `,
              imageRendering: 'pixelated',
              textShadow: '0 0 8px rgba(0, 255, 65, 0.5)',
            }}
          >
            {digit}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Pixel Progress Bar */}
      <div className="w-full max-w-[300px] mb-4 pixel-progress-bar terminal-border-glow">
        <div
          className="h-7 relative overflow-hidden"
          style={{
            border: `4px solid ${theme.border.replace('border-[', '').replace(']', '')}`,
            background: theme.bg.replace('bg-[', '').replace(']', ''),
            boxShadow: `inset 2px 2px 0 0 rgba(0,0,0,0.2)`,
          }}
        >
          {/* Progress fill */}
          <div
            className="h-full transition-all duration-1000 ease-linear relative"
            style={{
              width: `${(timeLeft / initialDuration) * 100}%`,
              background: modeInfo.color,
              boxShadow: `inset 0 -3px 0 0 rgba(0,0,0,0.25)`,
            }}
          >
            {/* Pixel segments overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 6px,
                  rgba(0,0,0,0.15) 6px,
                  rgba(0,0,0,0.15) 8px
                )`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Time Display */}
      <div className="flex items-center gap-4 terminal-glow">
        <Digit value={minutes} />
        <div className={`text-4xl font-bold ${theme.text} pixel-blink`} style={{
          textShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        }}>:</div>
        <Digit value={seconds} />
      </div>

      {/* Mode indicator as pixel badge */}
      <div
        className="mt-3 text-[10px] tracking-widest px-4 py-2 pixel-card-raised terminal-glow-box"
        style={{
          background: modeInfo.color,
          color: '#fff',
          border: `3px solid ${modeInfo.color}dd`,
          textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
        }}
      >
        {modeInfo.name}
      </div>
    </div>
  )
}
