export interface Theme {
  name: string
  bg: string
  surface: string
  surfaceHighlight: string
  text: string
  textMuted: string
  accent: string
  accentDark: string
  success: string
  warning: string
  danger: string
  border: string
  shadow: string
  input: string
  button: string
  buttonPrimary: string
  buttonSecondary: string
  modal: string
  pixelBorder: string
}

// Neon Cyberpunk palette
const neonPalette = {
  bg: '#0d0221',        // Deep purple-black
  surface: '#1a0a2e',   // Dark purple
  surfaceHighlight: '#2d1b4e',  // Lighter purple
  cyan: '#00fff5',      // Neon cyan
  magenta: '#ff00ff',   // Neon magenta
  pink: '#ff006e',      // Hot pink
  yellow: '#ffbe0b',    // Neon yellow
  text: '#ffffff',      // White
  textMuted: '#b8a8d8',  // Muted lavender
  border: '#4a3b69',    // Purple border
  shadow: '#1a0a2e',    // Shadow color
}

// Terminal Hacker palette
const terminalPalette = {
  bg: '#0a0a0a',        // Deep black
  surface: '#111111',   // Slightly lighter black for panels
  surfaceHighlight: '#1a1a1a',  // Highlight surface
  green: '#00ff41',     // Matrix green - primary
  greenDark: '#008f11', // Darker green - hover
  greenMuted: '#4a664a', // Dimmed green
  text: '#00ff41',      // Primary text in green
  textMuted: '#3d5c3d', // Subdued green for labels
  border: '#333333',    // Subtle gray borders
  shadow: '#050505',    // Shadow color
}

export const themes: Record<string, Theme> = {
  neon: {
    name: 'Neon',
    bg: `bg-[${neonPalette.bg}]`,
    surface: `bg-[${neonPalette.surface}]`,
    surfaceHighlight: `bg-[${neonPalette.surfaceHighlight}]`,
    text: `text-[${neonPalette.text}]`,
    textMuted: `text-[${neonPalette.textMuted}]`,
    accent: neonPalette.cyan,
    accentDark: '#00d4ce',
    success: '#00ff88',
    warning: neonPalette.yellow,
    danger: neonPalette.pink,
    border: `border-[${neonPalette.border}]`,
    shadow: `shadow-[6px_6px_0px_0px_${neonPalette.shadow}]`,
    input: `bg-[${neonPalette.bg}] border-[${neonPalette.border}] text-[${neonPalette.text}] placeholder:text-[${neonPalette.textMuted}]`,
    button: `bg-[${neonPalette.surfaceHighlight}] hover:bg-[${neonPalette.surface}] text-[${neonPalette.text}] border-[${neonPalette.border}] shadow-[4px_4px_0px_0px_${neonPalette.shadow}] active:shadow-[2px_2px_0px_0px_${neonPalette.shadow}] active:translate-x-[2px] active:translate-y-[2px]`,
    buttonPrimary: `bg-[${neonPalette.cyan}] hover:bg-[#33ffff] text-[${neonPalette.bg}] border-[${neonPalette.cyan}] shadow-[4px_4px_0px_0px_${neonPalette.bg}] active:shadow-[2px_2px_0px_0px_${neonPalette.bg}] active:translate-x-[2px] active:translate-y-[2px]`,
    buttonSecondary: `bg-[${neonPalette.magenta}] hover:bg-[#ff33ff] text-[${neonPalette.bg}] border-[${neonPalette.magenta}] shadow-[4px_4px_0px_0px_${neonPalette.bg}] active:shadow-[2px_2px_0px_0px_${neonPalette.bg}] active:translate-x-[2px] active:translate-y-[2px]`,
    modal: `bg-[${neonPalette.surface}] border-[${neonPalette.border}]`,
    pixelBorder: `border-[4px] border-[${neonPalette.border}]`,
  },
  terminal: {
    name: 'Terminal',
    bg: `bg-[${terminalPalette.bg}]`,
    surface: `bg-[${terminalPalette.surface}]`,
    surfaceHighlight: `bg-[${terminalPalette.surfaceHighlight}]`,
    text: `text-[${terminalPalette.text}]`,
    textMuted: `text-[${terminalPalette.textMuted}]`,
    accent: terminalPalette.green,
    accentDark: terminalPalette.greenDark,
    success: terminalPalette.green,
    warning: '#ffaa00',
    danger: '#ff3333',
    border: `border-[${terminalPalette.border}]`,
    shadow: `shadow-[4px_4px_0px_0px_${terminalPalette.shadow}]`,
    input: `bg-[${terminalPalette.bg}] border-[${terminalPalette.border}] text-[${terminalPalette.text}] placeholder:text-[${terminalPalette.textMuted}]`,
    button: `bg-[${terminalPalette.surfaceHighlight}] hover:bg-[${terminalPalette.greenDark}] text-[${terminalPalette.text}] border-[${terminalPalette.border}] shadow-[3px_3px_0px_0px_${terminalPalette.shadow}] active:shadow-[1px_1px_0px_0px_${terminalPalette.shadow}] active:translate-x-[2px] active:translate-y-[2px]`,
    buttonPrimary: `bg-[${terminalPalette.green}] hover:bg-[${terminalPalette.greenDark}] text-[${terminalPalette.bg}] border-[${terminalPalette.green}] shadow-[3px_3px_0px_0px_${terminalPalette.shadow}] active:shadow-[1px_1px_0px_0px_${terminalPalette.shadow}] active:translate-x-[2px] active:translate-y-[2px]`,
    buttonSecondary: `bg-[${terminalPalette.surfaceHighlight}] hover:bg-[${terminalPalette.greenDark}] text-[${terminalPalette.text}] border-[${terminalPalette.border}] shadow-[3px_3px_0px_0px_${terminalPalette.shadow}] active:shadow-[1px_1px_0px_0px_${terminalPalette.shadow}] active:translate-x-[2px] active:translate-y-[2px]`,
    modal: `bg-[${terminalPalette.surface}] border-[${terminalPalette.border}]`,
    pixelBorder: `border-[3px] border-[${terminalPalette.border}]`,
  },
}

export const modeColors: Record<string, { name: string; color: string; bg: string }> = {
  work: {
    name: 'WORK MODE',
    color: '#00ff41',  // Green for focus work
    bg: 'bg-[#00ff41]',
  },
  shortBreak: {
    name: 'SHORT BREAK',
    color: '#00cc33',  // Slightly dimmed green
    bg: 'bg-[#00cc33]',
  },
  longBreak: {
    name: 'LONG BREAK',
    color: '#009926',  // Even more dimmed
    bg: 'bg-[#009926]',
  },
}

export interface Settings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  soundEnabled: boolean
  theme: string
}

export const defaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  theme: 'terminal',  // Changed from 'neon'
}

export interface CompletedQuest {
  id: string
  title: string
  completedAt: number
}
