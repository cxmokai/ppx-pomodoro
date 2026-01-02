# Pomodoro Timer

A beautiful, feature-rich Pomodoro timer web application built with React, TypeScript, and Tailwind CSS, inspired by the [Zed](https://zed.dev/) code editor design.

## Features

- **Timer Display**: Circular progress ring with digital time display (MM:SS format)
- **Multiple Modes**: Work, Short Break, and Long Break
- **Auto Long Break**: Automatically triggers long break after configurable number of work sessions (default: 4)
- **Task Display**: Simple input field to display and edit your current task
- **Sound Notifications**: Audio alerts when timer completes
- **4 Themes**:
  - Zed Dark (default)
  - Zed Light
  - Midnight
  - Forest
- **Keyboard Shortcuts**:
  - `Space` / `K`: Start/Pause timer
  - `R`: Reset timer
  - `S`: Skip to next mode
  - `T`: Toggle settings panel
  - `Esc`: Close settings panel
  - `1-4`: Quick switch between themes

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm run dev
```

The application will be available at `http://localhost:5173/`

### Build

```bash
pnpm run build
```

### Preview

```bash
pnpm run preview
```

## Project Structure

```
src/
├── components/
│   ├── Controls.tsx          # Start/Pause/Reset buttons
│   ├── ModeIndicator.tsx     # Current mode indicator
│   ├── SettingsModal.tsx     # Settings panel
│   ├── TaskInput.tsx         # Current task input
│   └── TimerDisplay.tsx      # Circular timer display
├── hooks/
│   └── useTimer.ts           # Timer logic and state management
├── utils/
│   ├── sounds.ts             # Audio notification functions
│   └── themes.ts             # Theme definitions and types
├── App.tsx                   # Main application component
└── main.tsx                  # Application entry point
```

## Customization

### Adjusting Durations

Open the Settings panel (press `T`) to customize:
- Work duration (1-60 minutes, default: 25)
- Short break (1-15 minutes, default: 5)
- Long break (5-30 minutes, default: 15)
- Long break interval (2-8 work sessions, default: 4)

### Adding New Themes

Edit `src/utils/themes.ts` and add a new theme to the `themes` object:

```typescript
export const themes: Record<string, Theme> = {
  // ... existing themes
  yourTheme: {
    name: 'Your Theme',
    bg: 'bg-[#123456]',
    text: 'text-white',
    // ... other theme properties
  },
}
```

## License

MIT
