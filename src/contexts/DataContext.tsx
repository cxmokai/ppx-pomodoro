import { createContext, useContext, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { PomodoroData, PomodoroSettings, PomodoroQuest, PomodoroSession, PomodoroDailyRecord } from '../utils/themes';
import { loadData, saveData, subscribeToData } from '../services/storageService';
import { useAuth } from './AuthContext';
import { defaultSettings } from '../utils/themes';
import {
  getUserLocalDate,
  getDateInTimezone,
} from '../utils/dateUtils';

interface DataContextType {
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  currentQuest: string;
  setCurrentQuest: (quest: string) => void;
  completedQuests: PomodoroQuest[];
  addPomodoroQuest: (quest: PomodoroQuest) => void;
  deletePomodoroQuest: (id: string) => void;
  sessions: PomodoroSession[];
  setSessions: (sessions: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[])) => void;
  isLoading: boolean;
  yesterdayIncompleteQuest: { id: string; title: string } | null;
  dismissYesterdayQuest: () => void;
  moveYesterdayQuestToToday: () => void;
  todayCompletedPomodoros: number;
  // Daily records functions
  getDailyRecord: (date: string) => PomodoroDailyRecord | null;
  getPomodoroQuestsByDateRange: (startDate: string, endDate: string) => PomodoroQuest[];
  incrementTodayPomodoroCount: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const isDataFromCloudRef = useRef(false);
  const isInitializedRef = useRef(false);
  const [data, setData] = useState<PomodoroData>({
    settings: defaultSettings,
    lastUpdated: Date.now(),
    dailyRecords: {},
  });

  // Get user's timezone
  const timezone = data.settings.timezone || 'Asia/Shanghai';

  // Load data on mount and when user changes
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      isInitializedRef.current = false;

      const loadedData = await loadData();
      setData(loadedData);

      setIsLoading(false);
      // Mark as initialized after data is loaded
      isInitializedRef.current = true;
    };
    init();
  }, [user]);

  // Subscribe to Firestore updates (only when logged in)
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToData((cloudData) => {
        isDataFromCloudRef.current = true;
        setData(cloudData);
      });
      return () => unsubscribe?.();
    }
  }, [user]);

  // Save data whenever it changes (but not if it came from cloud or during initial load)
  useEffect(() => {
    if (!isLoading && isInitializedRef.current && !isDataFromCloudRef.current) {
      saveData(data);
    }
    isDataFromCloudRef.current = false;
  }, [data, isLoading]);

  const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
      lastUpdated: Date.now(),
    }));
  }, []);

  const setCurrentQuest = useCallback((quest: string) => {
    const now = Date.now();
    const today = getUserLocalDate(timezone);

    setData((prev) => {
      const activeQuestObj = quest
        ? { id: 'current', title: quest, completed: false, createdAt: now }
        : null;

      const updatedDailyRecords = { ...prev.dailyRecords };

      if (!updatedDailyRecords[today]) {
        updatedDailyRecords[today] = {
          date: today,
          completedPomodoros: 0,
          activeQuest: activeQuestObj,
          completedQuests: [],
          sessions: [],
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[today] = {
          ...updatedDailyRecords[today],
          activeQuest: activeQuestObj,
          updatedAt: now,
        };
      }

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  const addPomodoroQuest = useCallback((quest: PomodoroQuest) => {
    const now = Date.now();
    const completedAt = quest.completedAt || quest.createdAt;
    const questDate = getDateInTimezone(new Date(completedAt), timezone);

    setData((prev) => {
      const newPomodoroQuest = {
        ...quest,
        completed: true,
        createdAt: quest.completedAt,
      } as PomodoroQuest & { completed: boolean; createdAt: number };

      const updatedDailyRecords = { ...prev.dailyRecords };

      if (!updatedDailyRecords[questDate]) {
        updatedDailyRecords[questDate] = {
          date: questDate,
          completedPomodoros: 0,
          activeQuest: null,
          completedQuests: [newPomodoroQuest],
          sessions: [],
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[questDate] = {
          ...updatedDailyRecords[questDate],
          completedQuests: [...updatedDailyRecords[questDate].completedQuests, newPomodoroQuest],
          updatedAt: now,
        };
      }

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  const deletePomodoroQuest = useCallback((id: string) => {
    const now = Date.now();

    setData((prev) => {
      // Remove from all daily records
      const updatedDailyRecords: Record<string, PomodoroDailyRecord> = {};
      Object.entries(prev.dailyRecords).forEach(([date, record]) => {
        updatedDailyRecords[date] = {
          ...record,
          completedQuests: record.completedQuests.filter(q => q.id !== id),
          updatedAt: now,
        };
      });

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, []);

  const setSessions = useCallback((sessions: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[])) => {
    const now = Date.now();
    const today = getUserLocalDate(timezone);

    setData((prev) => {
      const newSessions = typeof sessions === 'function' ? sessions(getAllSessions(prev.dailyRecords)) : sessions;

      const updatedDailyRecords = { ...prev.dailyRecords };

      if (!updatedDailyRecords[today]) {
        updatedDailyRecords[today] = {
          date: today,
          completedPomodoros: 0,
          activeQuest: null,
          completedQuests: [],
          sessions: newSessions,
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[today] = {
          ...updatedDailyRecords[today],
          sessions: newSessions,
          updatedAt: now,
        };
      }

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  // Get daily record for a specific date
  const getDailyRecord = useCallback((date: string): PomodoroDailyRecord | null => {
    return data.dailyRecords[date] || null;
  }, [data.dailyRecords]);

  // Get completed quests within a date range
  const getPomodoroQuestsByDateRange = useCallback((
    startDate: string,
    endDate: string
  ): PomodoroQuest[] => {
    const quests: PomodoroQuest[] = [];
    const dates = Object.keys(data.dailyRecords).sort();

    for (const date of dates) {
      if (date >= startDate && date <= endDate) {
        quests.push(...data.dailyRecords[date].completedQuests);
      }
    }

    return quests;
  }, [data.dailyRecords]);

  // Increment today's pomodoro count
  const incrementTodayPomodoroCount = useCallback(() => {
    const now = Date.now();
    const today = getUserLocalDate(timezone);

    setData((prev) => {
      const updatedDailyRecords = { ...prev.dailyRecords };

      if (!updatedDailyRecords[today]) {
        updatedDailyRecords[today] = {
          date: today,
          completedPomodoros: 1,
          activeQuest: null,
          completedQuests: [],
          sessions: [],
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[today] = {
          ...updatedDailyRecords[today],
          completedPomodoros: updatedDailyRecords[today].completedPomodoros + 1,
          updatedAt: now,
        };
      }

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  // Check if there's an incomplete quest from yesterday (timezone-aware)
  const getYesterdayIncompleteQuest = useCallback((): { id: string; title: string } | null => {
    const today = getUserLocalDate(timezone);
    const dates = Object.keys(data.dailyRecords).sort().reverse();

    for (const date of dates) {
      if (date === today) continue;

      const record = data.dailyRecords[date];
      if (record.activeQuest && record.activeQuest.id === 'current') {
        return { id: record.activeQuest.id, title: record.activeQuest.title };
      }
    }

    return null;
  }, [data.dailyRecords, timezone]);

  const yesterdayIncompleteQuest = getYesterdayIncompleteQuest();

  const dismissYesterdayQuest = useCallback(() => {
    const today = getUserLocalDate(timezone);

    setData((prev) => {
      const updatedDailyRecords: Record<string, PomodoroDailyRecord> = {};

      Object.entries(prev.dailyRecords).forEach(([date, record]) => {
        if (date !== today && record.activeQuest?.id === 'current') {
          updatedDailyRecords[date] = {
            ...record,
            activeQuest: null,
            updatedAt: Date.now(),
          };
        } else {
          updatedDailyRecords[date] = record;
        }
      });

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: Date.now(),
      };
    });
  }, [timezone]);

  const moveYesterdayQuestToToday = useCallback(() => {
    const now = Date.now();
    const today = getUserLocalDate(timezone);

    setData((prev) => {
      let foundQuest: PomodoroQuest | null = null;
      const updatedDailyRecords: Record<string, PomodoroDailyRecord> = {};

      // Find and remove the current quest from non-today records
      Object.entries(prev.dailyRecords).forEach(([date, record]) => {
        if (date !== today && record.activeQuest?.id === 'current') {
          foundQuest = { ...record.activeQuest, createdAt: now };
          updatedDailyRecords[date] = {
            ...record,
            activeQuest: null,
            updatedAt: now,
          };
        } else {
          updatedDailyRecords[date] = record;
        }
      });

      if (!foundQuest) {
        return prev;
      }

      // Add to today's record
      if (!updatedDailyRecords[today]) {
        updatedDailyRecords[today] = {
          date: today,
          completedPomodoros: 0,
          activeQuest: foundQuest,
          completedQuests: [],
          sessions: [],
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[today] = {
          ...updatedDailyRecords[today],
          activeQuest: foundQuest,
          updatedAt: now,
        };
      }

      return {
        ...prev,
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  // Computed values from dailyRecords
  const today = getUserLocalDate(timezone);
  const currentQuest = useMemo(() => {
    const todayRecord = data.dailyRecords[today];
    return todayRecord?.activeQuest?.title || '';
  }, [data.dailyRecords, today]);

  const completedQuests = useMemo(() => {
    const quests: PomodoroQuest[] = [];
    Object.values(data.dailyRecords).forEach(record => {
      quests.push(...record.completedQuests);
    });
    return quests;
  }, [data.dailyRecords]);

  const sessions = useMemo(() => {
    return getAllSessions(data.dailyRecords);
  }, [data.dailyRecords]);

  const todayCompletedPomodoros = useMemo(() => {
    const todayRecord = data.dailyRecords[today];
    return todayRecord?.completedPomodoros || 0;
  }, [data.dailyRecords, today]);

  return (
    <DataContext.Provider
      value={{
        settings: data.settings,
        updateSettings,
        currentQuest,
        setCurrentQuest,
        completedQuests,
        addPomodoroQuest,
        deletePomodoroQuest,
        sessions,
        setSessions,
        isLoading,
        yesterdayIncompleteQuest,
        dismissYesterdayQuest,
        moveYesterdayQuestToToday,
        todayCompletedPomodoros,
        getDailyRecord,
        getPomodoroQuestsByDateRange,
        incrementTodayPomodoroCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Helper function to get all sessions from dailyRecords
function getAllSessions(dailyRecords: Record<string, PomodoroDailyRecord>): PomodoroSession[] {
  const sessions: PomodoroSession[] = [];
  Object.values(dailyRecords).forEach(record => {
    sessions.push(...record.sessions);
  });
  // Sort by startTime descending (newest first)
  return sessions.sort((a, b) => b.startTime - a.startTime);
}
