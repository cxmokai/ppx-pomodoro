/**
 * Data Migration Utility
 *
 * Migrates existing localStorage data to the new Firebase-compatible format.
 * Run this in the browser console or call it on app startup.
 */

import type { PomodoroData, PomodoroQuest } from '../utils/themes';
import { defaultSettings } from '../utils/themes';

const OLD_KEYS = {
  SETTINGS: 'pomodoro-settings',
  TASK: 'pomodoro-task',
  COMPLETED_QUESTS: 'pomodoro-completed-quests',
  SESSION_COUNT: 'pomodoro-session-count',
};

const NEW_KEY = 'pomodoro_data_v3';

/**
 * Check if migration is needed
 */
export function needsMigration(): boolean {
  const hasOldData = !!(
    localStorage.getItem(OLD_KEYS.SETTINGS) ||
    localStorage.getItem(OLD_KEYS.COMPLETED_QUESTS)
  );

  const hasNewData = !!localStorage.getItem(NEW_KEY);

  return hasOldData && !hasNewData;
}

/**
 * Migrate data from old localStorage format to new format
 */
export function migrateData(): PomodoroData {
  console.log('[Migration] Starting data migration...');

  // 1. Migrate settings
  const oldSettings = localStorage.getItem(OLD_KEYS.SETTINGS);
  let settings = { ...defaultSettings };

  if (oldSettings) {
    try {
      const parsed = JSON.parse(oldSettings) as Partial<typeof defaultSettings>;
      settings = {
        workDuration: parsed.workDuration || defaultSettings.workDuration,
        shortBreakDuration: parsed.shortBreakDuration || defaultSettings.shortBreakDuration,
        longBreakDuration: parsed.longBreakDuration || defaultSettings.longBreakDuration,
        longBreakInterval: parsed.longBreakInterval || defaultSettings.longBreakInterval,
        soundEnabled: parsed.soundEnabled === true ? true : defaultSettings.soundEnabled,
        theme: parsed.theme || defaultSettings.theme,
      };
      console.log('[Migration] Migrated settings:', settings);
    } catch (e) {
      console.warn('[Migration] Failed to parse settings, using defaults');
    }
  }

  // 2. Migrate completed quests
  const oldPomodoroQuests = localStorage.getItem(OLD_KEYS.COMPLETED_QUESTS);
  const quests: PomodoroQuest[] = [];

  if (oldPomodoroQuests) {
    try {
      const parsed = JSON.parse(oldPomodoroQuests);
      if (Array.isArray(parsed)) {
        parsed.forEach((quest: { id: string; title: string; completedAt: number }) => {
          quests.push({
            id: quest.id,
            title: quest.title,
            completed: true,
            createdAt: quest.completedAt,
            completedAt: quest.completedAt,
          });
        });
        console.log(`[Migration] Migrated ${quests.length} completed quests`);
      }
    } catch (e) {
      console.warn('[Migration] Failed to parse completed quests');
    }
  }

  // 3. Migrate current task (if any)
  const oldTask = localStorage.getItem(OLD_KEYS.TASK);
  if (oldTask && oldTask.trim()) {
    quests.push({
      id: 'current',
      title: oldTask,
      completed: false,
      createdAt: Date.now(),
    });
    console.log('[Migration] Migrated current task:', oldTask);
  }

  // 4. Create new data structure
  const newData: PomodoroData = {
    sessions: [], // No session history in old format
    quests,
    settings,
    dailyRecords: {}, // Initialize with empty daily records
    lastUpdated: Date.now(),
  };

  // 5. Save new data
  localStorage.setItem(NEW_KEY, JSON.stringify(newData));
  console.log('[Migration] Migration complete!');

  return newData;
}

/**
 * Clean up old localStorage keys after successful migration
 */
export function cleanupOldData(): void {
  console.log('[Migration] Cleaning up old data...');
  localStorage.removeItem(OLD_KEYS.SETTINGS);
  localStorage.removeItem(OLD_KEYS.TASK);
  localStorage.removeItem(OLD_KEYS.COMPLETED_QUESTS);
  localStorage.removeItem(OLD_KEYS.SESSION_COUNT);
  console.log('[Migration] Cleanup complete!');
}

/**
 * Run full migration process
 */
export function runMigration(): PomodoroData | null {
  if (!needsMigration()) {
    console.log('[Migration] No migration needed');
    return null;
  }

  try {
    const data = migrateData();
    // Uncomment to automatically clean up old data after migration
    // cleanupOldData();
    return data;
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    return null;
  }
}

/**
 * Export data for backup
 */
export function exportData(): string {
  const data = localStorage.getItem(NEW_KEY);
  if (!data) {
    throw new Error('No data to export');
  }
  return JSON.stringify(JSON.parse(data), null, 2);
}

/**
 * Import data from backup
 */
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);
    localStorage.setItem(NEW_KEY, JSON.stringify(data));
    console.log('[Migration] Data imported successfully');
    return true;
  } catch (error) {
    console.error('[Migration] Import failed:', error);
    return false;
  }
}
