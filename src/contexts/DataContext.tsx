import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PomodoroData, PomodoroSettings, PomodoroQuest, PomodoroSession, DailyRecord } from '../utils/themes';
import { loadData, saveData, subscribeToData } from '../services/storageService';
import { useAuth } from './AuthContext';
import { defaultSettings } from '../utils/themes';
import { runMigration } from '../utils/migrateData';
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
  // Daily records functions
  getDailyRecord: (date: string) => DailyRecord | null;
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
    sessions: [],
    quests: [],
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

      // Check if migration is needed
      const migratedData = runMigration();
      if (migratedData) {
        console.log('[DataContext] Using migrated data');
        setData(migratedData);
      } else {
        const loadedData = await loadData();
        setData(loadedData);
      }

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
      const newQuests = quest
        ? [{ id: 'current', title: quest, completed: false, createdAt: now }]
        : [];

      // Update today's daily record with active quest
      const updatedDailyRecords = { ...prev.dailyRecords };
      if (!updatedDailyRecords[today]) {
        updatedDailyRecords[today] = {
          date: today,
          completedPomodoros: 0,
          activeQuest: quest || null,
          completedQuests: [],
          sessions: [],
          createdAt: now,
          updatedAt: now,
        };
      } else {
        updatedDailyRecords[today] = {
          ...updatedDailyRecords[today],
          activeQuest: quest || null,
          updatedAt: now,
        };
      }

      return {
        ...prev,
        quests: newQuests,
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

      // Add to daily record for the quest's completion date
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
        quests: [...prev.quests.filter(t => t.id !== 'current'), newPomodoroQuest],
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, [timezone]);

  const deletePomodoroQuest = useCallback((id: string) => {
    const now = Date.now();

    setData((prev) => {
      // Remove from all daily records
      const updatedDailyRecords: Record<string, DailyRecord> = {};
      Object.entries(prev.dailyRecords).forEach(([date, record]) => {
        updatedDailyRecords[date] = {
          ...record,
          completedQuests: record.completedQuests.filter(q => q.id !== id),
          updatedAt: now,
        };
      });

      return {
        ...prev,
        quests: prev.quests.filter(t => t.id !== id),
        dailyRecords: updatedDailyRecords,
        lastUpdated: now,
      };
    });
  }, []);

  const setSessions = useCallback((sessions: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[])) => {
    setData((prev) => ({
      ...prev,
      sessions: typeof sessions === 'function' ? sessions(prev.sessions) : sessions,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Get daily record for a specific date
  const getDailyRecord = useCallback((date: string): DailyRecord | null => {
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
    const currentQuest = data.quests.find(t => t.id === 'current');
    if (!currentQuest) return null;

    const questDate = getDateInTimezone(new Date(currentQuest.createdAt), timezone);
    const today = getUserLocalDate(timezone);

    // Check if quest was created yesterday (or earlier)
    const isFromYesterday = questDate !== today;

    if (isFromYesterday) {
      return { id: currentQuest.id, title: currentQuest.title };
    }
    return null;
  }, [data.quests, timezone]);

  const yesterdayIncompleteQuest = getYesterdayIncompleteQuest();

  const dismissYesterdayQuest = useCallback(() => {
    setData((prev) => ({
      ...prev,
      quests: prev.quests.filter(t => t.id !== 'current'),
      lastUpdated: Date.now(),
    }));
  }, []);

  const moveYesterdayQuestToToday = useCallback(() => {
    const now = Date.now();
    const today = getUserLocalDate(timezone);

    setData((prev) => ({
      ...prev,
      quests: prev.quests.map(t =>
        t.id === 'current'
          ? { ...t, createdAt: now }
          : t
      ),
      dailyRecords: {
        ...prev.dailyRecords,
        [today]: {
          ...(prev.dailyRecords[today] || {
            date: today,
            completedPomodoros: 0,
            activeQuest: null,
            completedQuests: [],
            sessions: [],
            createdAt: now,
            updatedAt: now,
          }),
          activeQuest: prev.quests.find(t => t.id === 'current')?.title || null,
          updatedAt: now,
        },
      },
      lastUpdated: now,
    }));
  }, [timezone]);

  // Get current quest from quests array
  const currentQuest = data.quests.find(t => t.id === 'current')?.title || '';
  const completedQuests: PomodoroQuest[] = data.quests
    .filter(t => t.completed);

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
        sessions: data.sessions,
        setSessions,
        isLoading,
        yesterdayIncompleteQuest,
        dismissYesterdayQuest,
        moveYesterdayQuestToToday,
        getDailyRecord,
        getPomodoroQuestsByDateRange,
        incrementTodayPomodoroCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
