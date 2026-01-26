import { useState, useEffect, useCallback, useRef } from "react";
import { defaultSettings, type Settings } from "../utils/themes";
import { playNotificationSound } from "../utils/sounds";

export type TimerMode = "work" | "shortBreak" | "longBreak";

export const useTimer = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("pomodoro-settings");
    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  });

  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [initialDuration, setInitialDuration] = useState(
    settings.workDuration * 60,
  );

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getModeDuration = useCallback(
    (currentMode: TimerMode): number => {
      switch (currentMode) {
        case "work":
          return settings.workDuration * 60;
        case "shortBreak":
          return settings.shortBreakDuration * 60;
        case "longBreak":
          return settings.longBreakDuration * 60;
        default:
          return settings.workDuration * 60;
      }
    },
    [settings],
  );

  useEffect(() => {
    localStorage.setItem("pomodoro-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const duration = getModeDuration(mode);
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, getModeDuration]);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const duration = getModeDuration(mode);
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, settings, getModeDuration]);

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }, [isRunning, startTimer, pauseTimer]);

  const skipMode = useCallback(() => {
    setIsRunning(false);
    if (mode === "work") {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);

      if (newSessionCount % settings.longBreakInterval === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("work");
    }
    const newMode =
      mode === "work"
        ? (sessionCount + 1) % settings.longBreakInterval === 0
          ? "longBreak"
          : "shortBreak"
        : "work";
    const duration = getModeDuration(newMode);
    setTimeLeft(duration);
    setInitialDuration(duration);
  }, [mode, sessionCount, settings, getModeDuration]);

  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setIsRunning(false);
      setMode(newMode);
      const duration = getModeDuration(newMode);
      setTimeLeft(duration);
      setInitialDuration(duration);
    },
    [settings, getModeDuration],
  );

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);

      if (settings.soundEnabled) {
        playNotificationSound();
      }

      if (mode === "work") {
        const newSessionCount = sessionCount + 1;
        setSessionCount(newSessionCount);

        if (newSessionCount % settings.longBreakInterval === 0) {
          setMode("longBreak");
          const duration = settings.longBreakDuration * 60;
          setTimeLeft(duration);
          setInitialDuration(duration);
        } else {
          setMode("shortBreak");
          const duration = settings.shortBreakDuration * 60;
          setTimeLeft(duration);
          setInitialDuration(duration);
        }
      } else {
        setMode("work");
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
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
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
