import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { FirestoreError } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { PomodoroData, PomodoroSettings } from '../utils/themes';

const STORAGE_KEY = 'pomodoro_data_v3';
const COLLECTION = 'user_data';
const PENDING_WRITE_KEY = 'pomodoro_pending_write';
const LAST_SYNCED_KEY = 'pomodoro_last_synced';

const isLoggedIn = (): boolean => auth.currentUser !== null;
const getUserId = (): string => auth.currentUser?.uid || 'guest';

// ============================================================================
// SyncManager: Handles debounced writes with conflict detection
// ============================================================================
class SyncManager {
  private isDirty: boolean = false;
  private lastSyncedAt: number = 0;
  private pendingWrite: PomodoroData | null = null;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isWriting: boolean = false;
  private writeRequestedDuringFlush: boolean = false;

  private readonly DEBOUNCE_MS = 1200;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 2000;

  constructor() {
    try {
      this.lastSyncedAt = Number(localStorage.getItem(LAST_SYNCED_KEY) || 0);
      const pendingData = localStorage.getItem(PENDING_WRITE_KEY);
      if (pendingData) {
        this.pendingWrite = JSON.parse(pendingData);
        this.isDirty = true;
        console.log('[SyncManager] Restored pending write from localStorage');
      }
    } catch {
      this.lastSyncedAt = 0;
      this.pendingWrite = null;
    }
  }

  hasPendingChanges(): boolean {
    return this.pendingWrite !== null || this.isWriting || this.isDirty;
  }

  getLastSyncedAt(): number {
    return this.lastSyncedAt;
  }

  markDirty(): void {
    this.isDirty = true;
  }

  scheduleWrite(data: PomodoroData): void {
    console.log('[SyncManager] scheduleWrite called, will flush in', this.DEBOUNCE_MS, 'ms');
    this.pendingWrite = data;
    this.persistPendingWrite(data);

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      console.log('[SyncManager] Debounce timer fired');
      this.flushWrite();
    }, this.DEBOUNCE_MS);
  }

  async forceWrite(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    await this.flushWrite();
  }

  retryPendingWrite(): void {
    if (this.pendingWrite && !this.isWriting && isLoggedIn()) {
      console.log('[SyncManager] Retrying pending write on reconnect/login');
      this.scheduleWrite(this.pendingWrite);
    }
  }

  private persistPendingWrite(data: PomodoroData): void {
    try {
      localStorage.setItem(PENDING_WRITE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[SyncManager] Failed to persist pending write:', e);
    }
  }

  private clearPendingWrite(): void {
    try {
      localStorage.removeItem(PENDING_WRITE_KEY);
    } catch {
      // silently ignore
    }
  }

  private async flushWrite(): Promise<void> {
    if (this.isWriting) {
      this.writeRequestedDuringFlush = true;
      return;
    }

    if (!this.pendingWrite) return;
    if (!isLoggedIn()) {
      console.warn('[SyncManager] User logged out, keeping pending write for later');
      return;
    }

    const dataToWrite = this.pendingWrite;
    this.isWriting = true;

    let retries = 0;
    let success = false;

    while (retries < this.MAX_RETRIES && !success) {
      try {
        const docRef = doc(db, COLLECTION, getUserId());
        await setDoc(docRef, {
          sessions: dataToWrite.sessions || [],
          tasks: dataToWrite.tasks || [],
          settings: dataToWrite.settings,
          updatedAt: serverTimestamp(),
        });

        console.log('[SyncManager] Write successful');
        success = true;
        this.pendingWrite = null;
        this.isDirty = false;
        this.clearPendingWrite();
        this.lastSyncedAt = Date.now();
        localStorage.setItem(LAST_SYNCED_KEY, this.lastSyncedAt.toString());
      } catch (error) {
        retries++;
        const isPermissionDenied =
          error instanceof FirestoreError && error.code === 'permission-denied';

        if (isPermissionDenied) {
          console.warn('[SyncManager] Permission denied (rate limit?), will retry later');
          setTimeout(() => this.scheduleWrite(dataToWrite), this.RETRY_DELAY_MS);
          break;
        }

        console.warn(`[SyncManager] Write failed, retry ${retries}/${this.MAX_RETRIES}`, error);
        if (retries < this.MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, retries - 1)));
        }
      }
    }

    this.isWriting = false;

    if (!success && retries >= this.MAX_RETRIES) {
      console.error('[SyncManager] Failed to write after all retries, keeping for later');
    }

    if (this.writeRequestedDuringFlush) {
      this.writeRequestedDuringFlush = false;
      if (this.pendingWrite) {
        this.flushWrite();
      }
    }
  }

  shouldAcceptCloudData(hasPendingWrites: boolean): boolean {
    if (hasPendingWrites) {
      console.debug('[SyncManager] Ignoring snapshot: local echo (hasPendingWrites=true)');
      return false;
    }
    if (this.pendingWrite !== null) {
      console.debug('[SyncManager] Rejecting cloud data: pending write exists');
      return false;
    }
    if (this.isWriting) {
      console.debug('[SyncManager] Rejecting cloud data: write in progress');
      return false;
    }
    return true;
  }

  clearDirty(): void {
    this.isDirty = false;
    this.pendingWrite = null;
    this.clearPendingWrite();
  }
}

export const syncManager = new SyncManager();

// ============================================================================
// Firestore Operations
// ============================================================================

export const loadDataFromFirestore = async (): Promise<PomodoroData | null> => {
  if (!isLoggedIn()) return null;

  try {
    const docRef = doc(db, COLLECTION, getUserId());
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        sessions: data.sessions || [],
        tasks: data.tasks || [],
        settings: data.settings || getDefaultSettings(),
        lastUpdated: Date.now(),
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to load data from Firestore:', error);
    return null;
  }
};

export const subscribeToData = (
  callback: (data: PomodoroData) => void
): Unsubscribe | null => {
  if (!isLoggedIn()) return null;

  const docRef = doc(db, COLLECTION, getUserId());

  return onSnapshot(
    docRef,
    (docSnap) => {
      const hasPendingWrites = docSnap.metadata.hasPendingWrites;

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (syncManager.shouldAcceptCloudData(hasPendingWrites)) {
          // Use Firestore's updatedAt timestamp to avoid infinite loop
          const cloudData: PomodoroData = {
            sessions: data.sessions || [],
            tasks: data.tasks || [],
            settings: data.settings || getDefaultSettings(),
            lastUpdated: data.updatedAt ? data.updatedAt.toMillis() : Date.now(),
          };
          saveDataToLocalStorage(cloudData);
          callback(cloudData);
        }
      }
    },
    (error) => {
      console.error('[Storage] onSnapshot error:', error);
    }
  );
};

// ============================================================================
// LocalStorage Operations
// ============================================================================

const loadDataFromLocalStorage = (): PomodoroData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {
      sessions: [],
      tasks: [],
      settings: getDefaultSettings(),
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return {
      sessions: [],
      tasks: [],
      settings: getDefaultSettings(),
      lastUpdated: Date.now(),
    };
  }
};

const saveDataToLocalStorage = (data: PomodoroData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

function getDefaultSettings(): PomodoroSettings {
  return {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    soundEnabled: true,
    theme: 'dark',
    timezone: 'America/Los_Angeles',
  };
}

// ============================================================================
// Main API
// ============================================================================

export const loadData = async (): Promise<PomodoroData> => {
  if (isLoggedIn()) {
    const cloudData = await loadDataFromFirestore();
    if (cloudData) {
      saveDataToLocalStorage(cloudData);
      return cloudData;
    }
  }
  return loadDataFromLocalStorage();
};

export const saveData = async (data: PomodoroData): Promise<void> => {
  saveDataToLocalStorage(data);

  if (isLoggedIn()) {
    console.log('[Storage] User logged in, scheduling Firestore write');
    syncManager.markDirty();
    syncManager.scheduleWrite(data);
  } else {
    console.log('[Storage] User not logged in, saved to localStorage only');
  }
};

// Monitor online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Storage] Network online, retrying pending writes');
    syncManager.retryPendingWrite();
  });
}
