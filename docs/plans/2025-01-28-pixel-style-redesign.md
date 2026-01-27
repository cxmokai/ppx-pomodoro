# Terminal Hacker Pixel Style Redesign - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the pomodoro timer with a terminal hacker pixel art aesthetic featuring green phosphor CRT style, scanlines, and consistent pixel icons.

**Architecture:** Update theme system with terminal color palette, replace emoji icons with pixelarticons, refine CSS for CRT effects (scanlines, glow), and ensure all UI components follow the terminal aesthetic.

**Tech Stack:** React, TypeScript, Tailwind CSS, pixelarticons, Press Start 2P font (already installed)

---

## Task 1: Install pixelarticons dependency

**Files:**
- Modify: `package.json` (via npm command)

**Step 1: Install pixelarticons package**

```bash
npm install pixelarticons
```

Expected: Package added to dependencies

**Step 2: Verify installation**

```bash
cat package.json | grep pixelarticons
```

Expected: `"pixelarticons": "^version"` in dependencies

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add pixelarticons dependency"
```

---

## Task 2: Create new terminal theme in themes.ts

**Files:**
- Modify: `src/utils/themes.ts`

**Step 1: Add terminal color palette**

After the existing `neonPalette`, add:

```typescript
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
```

**Step 2: Add terminal theme to themes export**

Add to the `themes` object:

```typescript
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
```

**Step 3: Update modeColors for terminal theme**

Replace `modeColors` with terminal-friendly colors:

```typescript
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
```

**Step 4: Update defaultSettings theme**

```typescript
export const defaultSettings: Settings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  theme: 'terminal',  // Changed from 'neon'
}
```

**Step 5: Commit**

```bash
git add src/utils/themes.ts
git commit -m "feat: add terminal hacker theme"
```

---

## Task 3: Update index.css with terminal CRT effects

**Files:**
- Modify: `src/index.css`

**Step 1: Update pixel grid background for terminal**

Replace `.pixel-grid` and `.pixel-grid-dark` with:

```css
/* ========== Terminal Grid Background ========== */
.pixel-grid {
    background-image:
        linear-gradient(rgba(0, 255, 65, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 65, 0.02) 1px, transparent 1px);
    background-size: 8px 8px;
}

.pixel-grid-dark {
    background-image:
        linear-gradient(rgba(0, 255, 65, 0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 255, 65, 0.015) 1px, transparent 1px);
    background-size: 8px 8px;
}
```

**Step 2: Update scanlines for terminal CRT effect**

Replace `.scanlines::before` with:

```css
/* Terminal Scanline effect */
.scanlines::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.08),
        rgba(0, 0, 0, 0.08) 1px,
        transparent 1px,
        transparent 3px
    );
    pointer-events: none;
    z-index: 9999;
}
```

**Step 3: Add terminal glow utility**

Add after CRT effects section:

```css
/* ========== Terminal Glow Effects ========== */
.terminal-glow {
    text-shadow: 0 0 5px rgba(0, 255, 65, 0.5),
                 0 0 10px rgba(0, 255, 65, 0.3),
                 0 0 20px rgba(0, 255, 65, 0.1);
}

.terminal-glow-box {
    box-shadow: 0 0 5px rgba(0, 255, 65, 0.3),
                0 0 10px rgba(0, 255, 65, 0.2),
                inset 0 0 20px rgba(0, 255, 65, 0.05);
}

.terminal-border-glow {
    box-shadow: 0 0 3px rgba(0, 255, 65, 0.4),
                inset 0 0 3px rgba(0, 255, 65, 0.1);
}
```

**Step 4: Update scrollbar for terminal style**

Replace scrollbar styles with:

```css
/* ========== Terminal Scrollbar ========== */
::-webkit-scrollbar {
    width: 12px;
    height: 12px;
}

::-webkit-scrollbar-track {
    background: #0a0a0a;
    border: 2px solid #333333;
}

::-webkit-scrollbar-thumb {
    background: #00ff41;
    border: 2px solid #333333;
}

::-webkit-scrollbar-thumb:hover {
    background: #00cc33;
}

::-webkit-scrollbar-corner {
    background: #0a0a0a;
    border: 2px solid #333333;
}
```

**Step 5: Update selection style**

```css
/* ========== Terminal Selection ========== */
::selection {
    background: #00ff41;
    color: #0a0a0a;
}
```

**Step 6: Update input focus styles**

```css
/* ========== Terminal Input Focus ========== */
.pixel-input:focus {
    outline: none;
    border-color: #00ff41;
    box-shadow:
        0 0 0 2px rgba(0, 255, 65, 0.2),
        0 0 10px rgba(0, 255, 65, 0.1),
        inset 0 0 10px rgba(0, 255, 65, 0.05);
}
```

**Step 7: Commit**

```bash
git add src/index.css
git commit -m "style: add terminal CRT effects and glow"
```

---

## Task 4: Update Controls component with pixel icons

**Files:**
- Modify: `src/components/Controls.tsx`

**Step 1: Import pixel icons**

Add at the top of the file:

```typescript
import { Play, Pause, RefreshCw, SkipForward } from 'pixelarticons';
```

**Step 2: Update Start/Pause button**

Replace the button content with:

```typescript
<button
  onClick={onToggle}
  className={`pixel-btn pixel-btn-hover px-6 py-3 font-bold border-3 cursor-pointer flex items-center gap-2 ${
    isRunning ? theme.buttonSecondary : theme.buttonPrimary
  } transition-all duration-100 pixel-no-select`}
>
  {isRunning ? (
    <>
      <Pause size={20} />
      <span className="text-[10px]">PAUSE</span>
    </>
  ) : (
    <>
      <Play size={20} />
      <span className="text-[10px]">START</span>
    </>
  )}
</button>
```

**Step 3: Update Reset button**

```typescript
<button
  onClick={onReset}
  className={`pixel-btn pixel-btn-hover px-6 py-3 font-bold border-3 cursor-pointer flex items-center gap-2 ${theme.button} transition-all duration-100 pixel-no-select`}
>
  <RefreshCw size={20} />
  <span className="text-[10px]">RESET</span>
</button>
```

**Step 4: Update Skip button**

```typescript
<button
  onClick={onSkip}
  className={`pixel-btn pixel-btn-hover px-6 py-3 font-bold border-3 cursor-pointer flex items-center gap-2 ${theme.button} transition-all duration-100 pixel-no-select`}
>
  <SkipForward size={20} />
  <span className="text-[10px]">SKIP</span>
</button>
```

**Step 5: Commit**

```bash
git add src/components/Controls.tsx
git commit -m "feat: replace emoji with pixel icons in Controls"
```

---

## Task 5: Update App.tsx header and footer with pixel icons

**Files:**
- Modify: `src/App.tsx`

**Step 1: Import pixel icons**

Add at top with other imports:

```typescript
import { Settings, Gamepad2 } from 'pixelarticons';
```

**Step 2: Update Settings button**

Replace the settings button:

```typescript
<button
  onClick={() => setIsSettingsOpen(true)}
  className={`pixel-btn text-[10px] px-4 py-2 border-3 cursor-pointer flex items-center gap-2 ${theme.border} ${theme.surface} hover:opacity-80 transition-opacity pixel-no-select`}
>
  <Settings size={14} />
  <span>SETTINGS</span>
</button>
```

**Step 3: Update footer stats**

Replace the footer:

```typescript
<footer className="flex justify-between items-center mt-6">
  <div className={`flex items-center gap-2 ${theme.textMuted} pixel-no-select`}>
    <Gamepad2 size={18} className={theme.text} />
    <span className="text-[10px]">
      SESSIONS: <span className={`${theme.text} terminal-glow`}>{sessionCount}</span>
    </span>
  </div>
</footer>
```

**Step 4: Remove inline textShadow styles**

Clean up by removing the inline `textShadow` and `style` props, using the `terminal-glow` class instead.

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace emoji with pixel icons in header and footer"
```

---

## Task 6: Update TaskInput component with pixel icons

**Files:**
- Modify: `src/components/TaskInput.tsx`

**Step 1: Read the current file**

Read the file to understand current structure:

```bash
cat src/components/TaskInput.tsx
```

**Step 2: Import pixel icons**

Add import:

```typescript
import { Target, Check } from 'pixelarticons';
```

**Step 3: Replace sword emoji with Target icon**

Replace the sword emoji (`⚔`) with:

```typescript
<Target size={18} className={theme.text} />
```

**Step 4: Replace check icon if present**

If there's a check icon in the complete button, replace with:

```typescript
<Check size={16} />
```

**Step 5: Commit**

```bash
git add src/components/TaskInput.tsx
git commit -m "feat: replace emoji with pixel icons in TaskInput"
```

---

## Task 7: Update CompletedQuests component with pixel icons

**Files:**
- Modify: `src/components/CompletedQuests.tsx`

**Step 1: Read the current file**

```bash
cat src/components/CompletedQuests.tsx
```

**Step 2: Import pixel icons**

```typescript
import { Trash2, CheckCircle } from 'pixelarticons';
```

**Step 3: Replace any emoji icons**

Replace any emoji with corresponding pixel icons:
- `🗑` → `<Trash2 size={14} />`
- `✓` → `<CheckCircle size={14} />`

**Step 4: Commit**

```bash
git add src/components/CompletedQuests.tsx
git commit -m "feat: replace emoji with pixel icons in CompletedQuests"
```

---

## Task 8: Update SettingsModal component with pixel icons

**Files:**
- Modify: `src/components/SettingsModal.tsx`

**Step 1: Read the current file**

```bash
cat src/components/SettingsModal.tsx
```

**Step 2: Import pixel icons**

```typescript
import { Volume2, VolumeX, X } from 'pixelarticons';
```

**Step 3: Replace close button icon**

Replace close button X with pixel icon.

**Step 4: Replace sound toggle icons**

Replace speaker emoji with:

```typescript
{settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
```

**Step 5: Commit**

```bash
git add src/components/SettingsModal.tsx
git commit -m "feat: replace emoji with pixel icons in SettingsModal"
```

---

## Task 9: Update TimerDisplay with terminal styling

**Files:**
- Modify: `src/components/TimerDisplay.tsx`

**Step 1: Update progress bar styling**

Update the progress bar container to use terminal colors:

```typescript
<div
  className="h-7 relative overflow-hidden terminal-border-glow"
  style={{
    border: `3px solid ${theme.border.replace('border-[', '').replace(']', '')}`,
    background: theme.bg.replace('bg-[', '').replace(']', ''),
  }}
>
```

**Step 2: Update digit display styling**

Update the Digit component to use terminal glow:

```typescript
<div
  className={`w-14 h-18 flex items-center justify-center text-4xl font-bold pixel-digit ${theme.text} pixel-no-select terminal-glow`}
  style={{
    background: theme.surfaceHighlight.replace('bg-[', '').replace(']', ''),
    border: `3px solid ${theme.border.replace('border-[', '').replace(']', '')}`,
  }}
>
  {digit}
</div>
```

**Step 3: Update mode badge styling**

Update the mode badge:

```typescript
<div
  className="mt-3 text-[10px] tracking-widest px-4 py-2 terminal-glow-box"
  style={{
    background: modeInfo.color,
    color: '#0a0a0a',
    border: `2px solid ${modeInfo.color}`,
  }}
>
  {modeInfo.name}
</div>
```

**Step 4: Commit**

```bash
git add src/components/TimerDisplay.tsx
git commit -m "style: update TimerDisplay with terminal styling"
```

---

## Task 10: Update ModeIndicator component

**Files:**
- Modify: `src/components/ModeIndicator.tsx`

**Step 1: Read current file**

```bash
cat src/components/ModeIndicator.tsx
```

**Step 2: Update styling for terminal theme**

Ensure the mode indicator uses terminal colors and glow effects.

**Step 3: Commit**

```bash
git add src/components/ModeIndicator.tsx
git commit -m "style: update ModeIndicator with terminal styling"
```

---

## Task 11: Test the complete redesign

**Files:**
- No file modifications

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Verify all elements**

Check:
- [ ] Terminal green theme is applied
- [ ] Scanlines effect is visible
- [ ] All icons are pixel style (no emoji)
- [ ] Glow effects work on timer and buttons
- [ ] Scrollbar is terminal style
- [ ] Text selection is green on black
- [ ] All buttons work correctly
- [ ] Mode transitions work

**Step 3: Test all components**

- Start/pause timer
- Reset timer
- Skip mode
- Add task
- Complete task
- Open/close settings
- Toggle sound
- Switch themes

**Step 4: Check accessibility**

- Keyboard navigation works
- Focus states visible
- Color contrast sufficient

**Step 5: Final commit if any tweaks needed**

```bash
git commit -m "fix: minor tweaks after testing"
```

---

## Task 12: Update documentation (optional)

**Files:**
- Create: `README.md` (if doesn't exist) or Modify: `README.md`

**Step 1: Document the new terminal theme**

Add section about the terminal hacker theme and how to switch themes.

**Step 2: Document pixel icons**

Mention pixelarticons as the icon library used.

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document terminal theme and pixel icons"
```

---

## Completion Criteria

- [x] All emoji icons replaced with pixelarticons
- [x] Terminal theme with green phosphor aesthetic
- [x] CRT scanline effect overlay
- [x] Glow effects on key elements
- [x] Terminal-style scrollbar
- [x] All components styled consistently
- [x] No visual regressions
- [x] All functionality preserved
