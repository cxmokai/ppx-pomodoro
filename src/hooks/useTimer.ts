import { useState, useEffect, useCallback, useRef } from 'react';
import type { Settings, PomodoroSession } from '../utils/themes';
import { playNotificationSound } from '../utils/sounds';
import { useData } from '../contexts/DataContext';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export const useTimer = () => {
  const { settings, updateSettings: updateDataSettings, sessions, setSessions } = useData();
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [initialDuration, setInitialDuration] = useState(
    settings.workDuration * 60
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTimeRef = useRef<number | null>(null);

  const getModeDuration = useCallback(
    (currentMode: TimerMode): number => {
      switch (currentMode) {
        case 'work':
          return settings.workDuration * 60;
        case 'shortBreak':
          return settings.shortBreakDuration * 60;
        case 'longBreak':
          return settings.longBreakDuration * 60;
        default:
          return settings.workDuration * 60;
      }
    },
    [
      settings.workDuration,
      settings.shortBreakDuration,
      settings.longBreakDuration,
    ]
  );

  useEffect(() => {
    const duration = getModeDuration(mode);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, getModeDuration]);

  const startTimer = useCallback(() => {
    // Record session start time for work sessions
    if (mode === 'work' && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = Date.now();
    }
    setIsRunning(true);
  }, [mode]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  // Save incomplete session when user skips
  const saveIncompleteSession = useCallback((currentMode: TimerMode) => {
    const startTime = sessionStartTimeRef.current;
    if (startTime && currentMode === 'work') {
      const incompleteSession: PomodoroSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startTime,
        endTime: Date.now(),
        type: currentMode,
        completed: false,
      };
      setSessions([incompleteSession, ...sessions]);
      sessionStartTimeRef.current = null;
    }
  }, [sessions, setSessions]);

  const resetTimer = useCallback(() => {
    saveIncompleteSession(mode);
    setIsRunning(false);
    const duration = getModeDuration(mode);
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, getModeDuration, saveIncompleteSession]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, pauseTimer]);

  const skipMode = useCallback(() => {
    saveIncompleteSession(mode);
    setIsRunning(false);
    if (mode === 'work') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      if (newSessionCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
    const newMode =
      mode === 'work'
        ? (sessionCount + 1) % settings.longBreakInterval === 0
          ? 'longBreak'
          : 'shortBreak'
        : 'work';
    const duration = getModeDuration(newMode);
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, sessionCount, settings, getModeDuration, saveIncompleteSession]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      saveIncompleteSession(mode);
      setIsRunning(false);
      setMode(newMode);
      const duration = getModeDuration(newMode);
      setTimeLeft(duration);
      setInitialDuration(duration);
    },
    [getModeDuration, mode, saveIncompleteSession]
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRunning(false);

      if (settings.soundEnabled) {
        playNotificationSound();
      }

      // Save completed session to history
      const startTime = sessionStartTimeRef.current;
      if (startTime) {
        const newSession: PomodoroSession = {
          id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          startTime,
          endTime: Date.now(),
          type: mode,
          completed: true,
        };
        setSessions([newSession, ...sessions]);
        sessionStartTimeRef.current = null;
      }

      if (mode === 'work') {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);

        if (newSessionCount % settings.longBreakInterval === 0) {
          setMode('longBreak');
          const duration = settings.longBreakDuration * 60;
          setTimeLeft(duration);
          setInitialDuration(duration);
        } else {
          setMode('shortBreak');
          const duration = settings.shortBreakDuration * 60;
          setTimeLeft(duration);
          setInitialDuration(duration);
        }
      } else {
        setMode('work');
        const duration = settings.workDuration * 60;
        setTimeLeft(duration);
        setInitialDuration(duration);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timeLeft, mode, sessionCount, settings]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    updateDataSettings(newSettings);
  };

  return {
    timeLeft,
    mode,
    isRunning,
    sessionCount,
    settings,
    initialDuration,
    formatTime,
    toggleTimer,
    resetTimer,
    skipMode,
    switchMode,
    updateSettings,
  };
};
