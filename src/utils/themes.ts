export interface Theme {
  name: string
  bg: string
  text: string
  textMuted: string
  accent: string
  accentHover: string
  border: string
  input: string
  ring: string
  button: string
  buttonPrimary: string
  buttonSecondary: string
  modal: string
}

export interface ModeColors {
  name: string
  color: string
}

// Terminal Hacker palette
const terminalPalette = {
  bg: '#0a0a0a',
  surface: '#111111',
  green: '#00ff41',
  greenDark: '#008f11',
  greenMuted: '#4a664a',
  text: '#00ff41',
  textMuted: '#3d5c3d',
  border: '#333333',
}

export const themes: Record<string, Theme> = {
  zedDark: {
    name: 'Zed Dark',
    bg: 'bg-[#0d1117]',
    text: 'text-white',
    textMuted: 'text-gray-400',
    accent: '#58a6ff',
    accentHover: 'hover:text-[#79c0ff]',
    border: 'border-[#30363d]',
    input: 'bg-[#0d1117] border-[#30363d] text-white placeholder:text-gray-500',
    ring: '#58a6ff',
    button: 'bg-[#21262d] hover:bg-[#30363d] text-white border-[#30363d]',
    buttonPrimary: 'bg-[#58a6ff] hover:bg-[#79c0ff] text-white border-[#58a6ff]',
    buttonSecondary: 'bg-[#da3633] hover:bg-[#f85149] text-white border-[#da3633]',
    modal: 'bg-[#161b22] border-[#30363d]',
  },
  zedLight: {
    name: 'Zed Light',
    bg: 'bg-[#ffffff]',
    text: 'text-[#24292f]',
    textMuted: 'text-gray-600',
    accent: '#0969da',
    accentHover: 'hover:text-[#1f6feb]',
    border: 'border-[#d0d7de]',
    input: 'bg-[#f6f8fa] border-[#d0d7de] text-[#24292f] placeholder:text-gray-400',
    ring: '#0969da',
    button: 'bg-[#f6f8fa] hover:bg-[#eaeef2] text-[#24292f] border-[#d0d7de]',
    buttonPrimary: 'bg-[#0969da] hover:bg-[#1f6feb] text-white border-[#0969da]',
    buttonSecondary: 'bg-[#cf222e] hover:bg-[#da3633] text-white border-[#cf222e]',
    modal: 'bg-white border-[#d0d7de]',
  },
  midnight: {
    name: 'Midnight',
    bg: 'bg-[#1a1b26]',
    text: 'text-[#a9b1d6]',
    textMuted: 'text-[#565f89]',
    accent: '#7aa2f7',
    accentHover: 'hover:text-[#89b4fa]',
    border: 'border-[#414868]',
    input: 'bg-[#1f2335] border-[#414868] text-[#a9b1d6] placeholder:text-[#565f89]',
    ring: '#7aa2f7',
    button: 'bg-[#1f2335] hover:bg-[#24283b] text-[#a9b1d6] border-[#414868]',
    buttonPrimary: 'bg-[#7aa2f7] hover:bg-[#89b4fa] text-[#1a1b26] border-[#7aa2f7]',
    buttonSecondary: 'bg-[#f7768e] hover:bg-[#ff9eb5] text-[#1a1b26] border-[#f7768e]',
    modal: 'bg-[#1f2335] border-[#414868]',
  },
  forest: {
    name: 'Forest',
    bg: 'bg-[#1a1b26]',
    text: 'text-[#c0caf5]',
    textMuted: 'text-[#565f89]',
    accent: '#9ece6a',
    accentHover: 'hover:text-[#b9f27c]',
    border: 'border-[#565f89]',
    input: 'bg-[#24283b] border-[#565f89] text-[#c0caf5] placeholder:text-[#565f89]',
    ring: '#9ece6a',
    button: 'bg-[#24283b] hover:bg-[#2f3549] text-[#c0caf5] border-[#565f89]',
    buttonPrimary: 'bg-[#9ece6a] hover:bg-[#b9f27c] text-[#1a1b26] border-[#9ece6a]',
    buttonSecondary: 'bg-[#f7768e] hover:bg-[#ff9eb5] text-[#1a1b26] border-[#f7768e]',
    modal: 'bg-[#24283b] border-[#565f89]',
  },
  terminal: {
    name: 'Terminal',
    bg: 'bg-[#0a0a0a]',
    text: 'text-[#00ff41]',
    textMuted: 'text-[#3d5c3d]',
    accent: '#00ff41',
    accentHover: 'hover:text-[#008f11]',
    border: 'border-[#333333]',
    input: 'bg-[#0a0a0a] border-[#333333] text-[#00ff41] placeholder:text-[#3d5c3d]',
    ring: '#00ff41',
    button: 'bg-[#111111] hover:bg-[#008f11] text-[#00ff41] border-[#333333]',
    buttonPrimary: 'bg-[#00ff41] hover:bg-[#008f11] text-[#0a0a0a] border-[#00ff41]',
    buttonSecondary: 'bg-[#111111] hover:bg-[#008f11] text-[#00ff41] border-[#333333]',
    modal: 'bg-[#111111] border-[#333333]',
  },
}

export const modeColors: Record<string, ModeColors> = {
  work: {
    name: 'WORK MODE',
    color: '#00ff41',
  },
  shortBreak: {
    name: 'SHORT BREAK',
    color: '#00cc33',
  },
  longBreak: {
    name: 'LONG BREAK',
    color: '#009926',
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
  theme: 'terminal',
}
