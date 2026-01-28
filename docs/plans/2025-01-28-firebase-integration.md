# Firebase 集成开发计划

## 项目概述

为番茄钟应用添加 Firebase 云同步功能，支持多设备数据同步、离线使用，以及账号关联。

## 设计原则（基于最佳实践研究）

### 参考：Firestore 离线/在线最佳实践

根据 2025-2026 年最新 Firebase 实践指南：

1. **Firestore 内置离线支持**
   - Web 端需要显式启用 `enableIndexedDbPersistence()`
   - SDK 自动处理离线写入队列和上线同步
   - 使用 `serverTimestamp()` 处理时间冲突

2. **混合存储架构（推荐方案）**
   - **localStorage**：即时读写（同步操作），保留永久本地记录
   - **Firestore**：防抖同步（1.2秒），多设备数据源
   - **原因**：Web 端缓存大小限制 (~50-100MB)，且应用需要永久本地历史记录

3. **同步策略**
   - 监听 `online/offline` 事件
   - 上线时检查未同步数据
   - 使用 SyncManager 防抖写入 + 冲突检测

### 架构决策

```typescript
┌─────────────────────────────────────────────────────────┐
│                    应用层 (UI/Hooks)                      │
│              useTimer, TaskInput, Settings, etc.         │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   localStorage   │              │    Firestore     │
│   (即时读写)      │◄─────────────┤    (防抖同步)     │
│                  │  SyncManager │                  │
│  • sessions      │              │  • sessions      │
│  • tasks         │              │  • tasks         │
│  • settings      │              │  • settings      │
│  • completed_quests│            │  • completed_quests│
└──────────────────┘              └──────────────────┘
```

## 代码复用来源

以下代码可直接从 `/Users/kai/Work/SideProjects/ppx-toolbox` 复制并修改：

| 文件 | 来源 | 用途 |
|------|------|------|
| `lib/firebase.ts` | ppx-toolbox/lib/firebase.ts | Firebase 初始化 |
| `services/authService.ts` | ppx-toolbox/services/authService.ts | 认证服务（Google 登录） |
| `services/storageService.ts` | ppx-toolbox/services/storage.ts | 数据同步核心（SyncManager） |
| `contexts/AuthContext.tsx` | ppx-toolbox/contexts/AuthContext.tsx | 认证状态 Context |
| `contexts/AccountLinkingContext.tsx` | ppx-toolbox/contexts/AccountLinkingContext.tsx | 账号关联（可选，后期功能） |

## 实施阶段（10 个阶段，预计 8-10 天）

### 阶段 0：依赖安装

```bash
pnpm add firebase
```

---

### 阶段 1：Firebase 初始化配置

**新建文件：** `src/lib/firebase.ts`

从 `ppx-toolbox/lib/firebase.ts` 复制，修改环境变量名称：

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// 启用离线持久化
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Firebase persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Firebase persistence not supported');
  }
});
```

**新建文件：** `.env.example`

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

### 阶段 2：类型定义

**修改文件：** `src/types.ts`

```typescript
// Firebase 相关类型
import type { User } from 'firebase/auth';

// 现有类型保持不变，添加以下类型：

export interface PomodoroSession {
  id: string;
  startTime: number;
  endTime?: number;
  type: 'focus' | 'shortBreak' | 'longBreak';
  taskId?: string;
  completed: boolean;
}

export interface PomodoroTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsUntilLongBreak: number;
  soundEnabled: boolean;
  theme: string;
  timezone?: string; // 新增：用户时区
}

export interface PomodoroData {
  sessions: PomodoroSession[];
  tasks: PomodoroTask[];
  settings: PomodoroSettings;
  lastUpdated: number;
}

// Firestore 文档结构
export interface FirestoreUserData {
  sessions: PomodoroSession[];
  tasks: PomodoroTask[];
  settings: PomodoroSettings;
  updatedAt: number; // serverTimestamp()
}
```

---

### 阶段 3：认证服务

**新建文件：** `src/services/authService.ts`

从 `ppx-toolbox/services/authService.ts` 复制，简化为仅支持 Google 登录：

```typescript
import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export type SignInResult =
  | { type: 'success'; user: User }
  | { type: 'cancelled' };

export const signInWithGoogle = async (): Promise<SignInResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { type: 'success', user: result.user };
  } catch (error) {
    const authError = error as { code?: string };
    if (authError.code === 'auth/popup-closed-by-user') {
      return { type: 'cancelled' };
    }
    throw error;
  }
};

export const signOut = () => firebaseSignOut(auth);

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback);
```

---

### 阶段 4：数据同步服务（核心）

**新建文件：** `src/services/storageService.ts`

从 `ppx-toolbox/services/storage.ts` 复制并修改：

```typescript
import { doc, getDoc, setDoc, onSnapshot, Unsubscribe, serverTimestamp } from 'firebase/firestore';
import { FirestoreError } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { PomodoroData, PomodoroSession, PomodoroTask, PomodoroSettings } from '../types';

const STORAGE_KEY = 'pomodoro_data_v3';
const COLLECTION = 'user_data';
const PENDING_WRITE_KEY = 'pomodoro_pending_write';
const LAST_SYNCED_KEY = 'pomodoro_last_synced';

const isLoggedIn = (): boolean => auth.currentUser !== null;
const getUserId = (): string => auth.currentUser?.uid || 'guest';

// ============================================================================
// SyncManager: 从 ppx-toolbox 复用，适配番茄钟数据结构
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
          sessions: dataToWrite.sessions,
          tasks: dataToWrite.tasks,
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
          const cloudData: PomodoroData = {
            sessions: data.sessions || [],
            tasks: data.tasks || [],
            settings: data.settings || getDefaultSettings(),
            lastUpdated: Date.now(),
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
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    theme: 'light',
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

// 监听 online/offline 事件
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Storage] Network online, retrying pending writes');
    syncManager.retryPendingWrite();
  });
}
```

---

### 阶段 5：AuthContext

**新建文件：** `src/contexts/AuthContext.tsx`

从 `ppx-toolbox/contexts/AuthContext.tsx` 直接复制：

```typescript
import { User } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthChange } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
```

---

### 阶段 6：修改 useTimer Hook

**修改文件：** `src/hooks/useTimer.ts`

集成 Firebase 数据同步：

```typescript
import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadData, saveData, subscribeToData } from '../services/storageService';
// ... 其他 import

export function useTimer() {
  const { user } = useAuth();

  // 加载数据
  useEffect(() => {
    const init = async () => {
      const data = await loadData();
      setSessions(data.sessions);
      setTasks(data.tasks);
      setSettings(data.settings);
    };
    init();
  }, [user]); // user 变化时重新加载

  // 订阅云端更新（仅登录用户）
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToData((data) => {
        setSessions(data.sessions);
        setTasks(data.tasks);
        setSettings(data.settings);
      });
      return () => unsubscribe?.();
    }
  }, [user]);

  // 保存数据（防抖到 Firestore）
  const saveCurrentData = useCallback(async () => {
    await saveData({
      sessions,
      tasks,
      settings,
      lastUpdated: Date.now(),
    });
  }, [sessions, tasks, settings]);

  // 在数据变化时保存
  useEffect(() => {
    saveCurrentData();
  }, [sessions, tasks, settings, saveCurrentData]);

  // ... 其他现有逻辑
}
```

---

### 阶段 7：UI 组件

**新建文件：** `src/components/AuthButton.tsx`

```typescript
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, signOut } from '../services/authService';

export function AuthButton() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <button onClick={signOut} className="...">
        登出 ({user.email})
      </button>
    );
  }

  return (
    <button onClick={() => signInWithGoogle()} className="...">
      使用 Google 登录
    </button>
  );
}
```

---

### 阶段 8：App.tsx 集成

**修改文件：** `src/App.tsx`

```typescript
import { AuthProvider } from './contexts/AuthContext';
import { AuthButton } from './components/AuthButton';

function App() {
  return (
    <AuthProvider>
      {/* 现有的 TimerProvider, ThemeProvider 等 */}
      <div className="app">
        <header>
          <h1>Pomodoro Timer</h1>
          <AuthButton />
        </header>
        {/* 现有组件 */}
      </div>
    </AuthProvider>
  );
}
```

---

### 阶段 9：Firestore 安全规则

在 Firebase 控制台设置：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /user_data/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

### 阶段 10：测试与验证

1. **本地测试**
   - 未登录状态下使用（仅 localStorage）
   - 登录后数据同步
   - 刷新页面数据保持

2. **离线测试**
   - 开启飞行模式
   - 完成番茄会话
   - 关闭飞行模式，检查数据同步

3. **多设备测试**
   - 设备 A 完成会话
   - 设备 B 查看更新

---

## 关键注意事项

1. **数据迁移**：localStorage key 从 `pomodoro_timer_*` 改为 `pomodoro_data_v3`
2. **时区处理**：使用 `serverTimestamp()` 或用户选择的时区
3. **错误处理**：网络错误时静默失败，保持离线可用
4. **性能**：防抖 1.2 秒避免频繁写入

---

## 参考资料

- [Firebase Firestore 最佳实践](https://firebase.google.com/docs/firestore/best-practices)
- [Firestore 离线持久化](https://firebase.google.com/docs/firestore/manage-data/enable-offline)
- [ppx-toolbox/storage.ts](https://github.com/your-repo/ppx-toolbox)
