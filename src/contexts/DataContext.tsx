import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { PomodoroData, PomodoroSettings, CompletedQuest, PomodoroSession } from '../utils/themes';
import { loadData, saveData, subscribeToData } from '../services/storageService';
import { useAuth } from './AuthContext';
import { defaultSettings } from '../utils/themes';
import { runMigration } from '../utils/migrateData';

interface DataContextType {
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;
  currentTask: string;
  setCurrentTask: (task: string) => void;
  completedQuests: CompletedQuest[];
  addCompletedQuest: (quest: CompletedQuest) => void;
  deleteCompletedQuest: (id: string) => void;
  sessions: PomodoroSession[];
  setSessions: (sessions: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[])) => void;
  isLoading: boolean;
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
    tasks: [],
    settings: defaultSettings,
    lastUpdated: Date.now(),
  });

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

  const setCurrentTask = useCallback((task: string) => {
    setData((prev) => {
      const newTasks = task
        ? [{ id: 'current', title: task, completed: false, createdAt: Date.now() }]
        : [];
      return {
        ...prev,
        tasks: newTasks,
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const addCompletedQuest = useCallback((quest: CompletedQuest) => {
    setData((prev) => {
      const newCompletedQuest = {
        ...quest,
        completed: true,
        createdAt: quest.completedAt,
      } as CompletedQuest & { completed: boolean; createdAt: number };
      return {
        ...prev,
        tasks: [...prev.tasks.filter(t => t.id !== 'current'), newCompletedQuest],
        lastUpdated: Date.now(),
      };
    });
  }, []);

  const deleteCompletedQuest = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
      lastUpdated: Date.now(),
    }));
  }, []);

  const setSessions = useCallback((sessions: PomodoroSession[] | ((prev: PomodoroSession[]) => PomodoroSession[])) => {
    setData((prev) => ({
      ...prev,
      sessions: typeof sessions === 'function' ? sessions(prev.sessions) : sessions,
      lastUpdated: Date.now(),
    }));
  }, []);

  // Get current task from tasks array
  const currentTask = data.tasks.find(t => t.id === 'current')?.title || '';
  const completedQuests: CompletedQuest[] = data.tasks
    .filter(t => t.completed)
    .map(t => ({
      id: t.id,
      title: t.title,
      completedAt: t.completedAt || t.createdAt,
    }));

  return (
    <DataContext.Provider
      value={{
        settings: data.settings,
        updateSettings,
        currentTask,
        setCurrentTask,
        completedQuests,
        addCompletedQuest,
        deleteCompletedQuest,
        sessions: data.sessions,
        setSessions,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
