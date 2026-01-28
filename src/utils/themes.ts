export interface Theme {
  name: string;
  bg: string;
  surface: string;
  surfaceHighlight: string;
  shadow: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  input: string;
  ring: string;
  button: string;
  buttonPrimary: string;
  buttonSecondary: string;
  modal: string;
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'Dark',
    bg: 'bg-[#1a1a1a]',
    surface: 'bg-[#2d2d2d]',
    surfaceHighlight: 'bg-[#3d3d3d]',
    shadow: 'shadow-[4px_4px_0px_0px_#555555]',
    text: 'text-[#ffffff]',
    textMuted: 'text-[#aaaaaa]',
    accent: '#FF6B35',
    accentHover: 'hover:text-[#ff8555]',
    border: 'border-[#4a4a4a]',
    input:
      'bg-[#1a1a1a] border-[#4a4a4a] text-[#ffffff] placeholder:text-[#aaaaaa]',
    ring: '#FF6B35',
    button: 'bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#ffffff] border-[#4a4a4a]',
    buttonPrimary:
      'bg-[#FF6B35] hover:bg-[#ff8555] text-[#000000] border-[#4a4a4a]',
    buttonSecondary:
      'bg-[#3d3d3d] hover:bg-[#4d4d4d] text-[#ffffff] border-[#4a4a4a]',
    modal: 'bg-[#2d2d2d] border-[#4a4a4a]',
  },
  light: {
    name: 'Light',
    bg: 'bg-[#ffffff]',
    surface: 'bg-[#f5f5f5]',
    surfaceHighlight: 'bg-[#e8e8e8]',
    shadow: 'shadow-[4px_4px_0px_0px_#000000]',
    text: 'text-[#000000]',
    textMuted: 'text-[#666666]',
    accent: '#FF6B35',
    accentHover: 'hover:text-[#ff8555]',
    border: 'border-[#000000]',
    input:
      'bg-[#ffffff] border-[#000000] text-[#000000] placeholder:text-[#666666]',
    ring: '#FF6B35',
    button: 'bg-[#e8e8e8] hover:bg-[#d8d8d8] text-[#000000] border-[#000000]',
    buttonPrimary:
      'bg-[#FF6B35] hover:bg-[#ff8555] text-[#ffffff] border-[#000000]',
    buttonSecondary:
      'bg-[#e8e8e8] hover:bg-[#d8d8d8] text-[#000000] border-[#000000]',
    modal: 'bg-[#f5f5f5] border-[#000000]',
  },
};

export const modeColors: Record<
  string,
  { name: string; color: string; bg: string }
> = {
  work: {
    name: 'WORK MODE',
    color: '#FF6B35',
    bg: 'bg-[#FF6B35]',
  },
  shortBreak: {
    name: 'SHORT BREAK',
    color: '#FFB347',
    bg: 'bg-[#FFB347]',
  },
  longBreak: {
    name: 'LONG BREAK',
    color: '#FF8C42',
    bg: 'bg-[#FF8C42]',
  },
};

// ============================================================================
// Firebase Types
// ============================================================================

export interface PomodoroSession {
  id: string;
  startTime: number;
  endTime?: number;
  type: 'work' | 'shortBreak' | 'longBreak';
  questId?: string;
  completed: boolean;
  endReason?: 'skipped' | 'reset';
}

export interface PomodoroQuest {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  soundEnabled: boolean;
  theme: string;
  timezone?: Timezone;
}

// Daily record for organizing data by date
export interface DailyRecord {
  date: string;  // ISO date: "2025-01-28"
  completedPomodoros: number;
  activeQuest: PomodoroQuest | null;
  completedQuests: PomodoroQuest[];
  sessions: PomodoroSession[];
  createdAt: number;
  updatedAt: number;
}

export interface PomodoroData {
  // Legacy flat arrays (for backward compatibility during migration)
  sessions: PomodoroSession[];
  quests: PomodoroQuest[];
  settings: PomodoroSettings;
  lastUpdated: number;
  // New daily records structure
  dailyRecords: Record<string, DailyRecord>;  // key: date string
}

export interface FirestoreUserData {
  // Keep flat structure for Firestore simplicity
  sessions: PomodoroSession[];
  quests: PomodoroQuest[];
  settings: PomodoroSettings;
  dailyRecords: Record<string, DailyRecord>;
  updatedAt: number;
}

// Account Linking Types
import type { OAuthCredential } from 'firebase/auth';

export interface PendingLinkCredential {
  credential: OAuthCredential;
  email: string;
  attemptedProvider: string;
  existingProvider: string;
}

// Timezone Types
export const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Winnipeg',
  'America/Edmonton',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Zurich',
  'Europe/Moscow',
  'Europe/Istanbul',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Australia/Sydney',
  'Australia/Melbourne',
] as const;

export type Timezone = (typeof TIMEZONES)[number];

export const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  theme: 'dark',
  timezone: 'Asia/Shanghai',
};
