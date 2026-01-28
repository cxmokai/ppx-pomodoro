# PPX Pomodoro

A beautiful, feature-rich Pomodoro timer web application built with React, TypeScript, and Tailwind CSS.

![PPX Pomodoro](https://img.shields.io/badge/version-v1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Timer

- **Three Modes**: Work, Short Break, and Long Break with configurable durations
- **Visual Progress**: Brutalist digital display with animated progress bar
- **Auto Long Break**: Automatically triggers long break after configurable work sessions (default: 4)
- **Sound Notifications**: Custom three-tone melody when timer completes
- **Timer Persistence**: State saved across page refreshes

### Quest/Task Management

- **Active Quest**: Set and track your current quest for each pomodoro session
- **Yesterday's Quest Recovery**: Prompt to continue or discard incomplete quests from previous days
- **Completion Confirmation**: Dialog to confirm quest completion
- **Quest History**: View all completed quests grouped by date

### Session Tracking

- **Automatic Recording**: All sessions automatically logged with duration and status
- **History Drawer**: View complete session history grouped by date
- **Statistics Summary**: Total sessions, completed count, and skipped count
- **Status Tracking**: Sessions marked as completed, skipped, or reset

### Authentication & Cloud Sync

- **Social Login**: Sign in with Google or GitHub
- **Account Linking**: Connect multiple providers to a single account
- **Real-time Sync**: Settings, quests, and sessions sync across devices
- **Offline Support**: Local storage fallback with automatic sync on reconnect

### Keyboard Shortcuts

| Shortcut      | Action               |
| ------------- | -------------------- |
| `Space` / `K` | Start/Pause timer    |
| `R`           | Reset timer          |
| `S`           | Skip to next mode    |
| `T`           | Toggle settings      |
| `H`           | Toggle history       |
| `Esc`         | Close modals/drawers |

### Themes

- **Dark Theme** (default)
- **Light Theme**
- Quick theme switch in settings or header

### Settings

- **Timer Durations**: Work (1-60 min), Short Break (1-15 min), Long Break (5-30 min)
- **Long Break Interval**: Configure after how many work sessions (2-8)
- **Sound Toggle**: Enable/disable notification sound
- **Timezone**: 27 timezone options for accurate date tracking

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Firebase** - Authentication and cloud sync (Firestore)
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/cxmokai/ppx-pomodoro.git
cd ppx-pomodoro

# Install dependencies
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

### Preview Production Build

```bash
pnpm run preview
```

## Live Demo

[https://ppx.kai.moe](https://ppx.kai.moe)

## License

MIT

---

Made with ❤️ by [kai](https://github.com/cxmokai)
