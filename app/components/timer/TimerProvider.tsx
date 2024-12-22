import { ReactNode, useEffect, useState } from "react";
import { TimerContext } from "#app/components/timer/TimerContext";
import { MODE } from "#app/components/timer/enum";
import {
  ModeTimesProps,
  PomodoroConfig,
  TimerContextProps,
} from "#app/components/timer/types";

const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timerText, setTimerText] = useState<ModeTimesProps>({
    pomo: "25:00",
    lbreak: "15:00",
    sbreak: "5:00",
  });
  const [mode, setMode] = useState(MODE.POMO);

  // Load initial config from localStorage
  const [config, setConfig] = useState<PomodoroConfig>(() => {
    try {
      const storedConfig = localStorage.getItem("timerConfig");
      if (storedConfig) {
        return JSON.parse(storedConfig);
      }
    } catch (error) {
      console.error("Error loading config from localStorage:", error);
    }
    return {
      pomo: { minutes: 25, seconds: 0 },
      sbreak: { minutes: 5, seconds: 0 },
      lbreak: { minutes: 15, seconds: 0 },
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem("timerConfig", JSON.stringify(config));
    } catch (error) {
      console.error("Error saving config to localStorage:", error);
    }
  }, [config]);

  const value: TimerContextProps = {
    isStarted,
    setIsStarted,
    timerText,
    setTimerText,
    mode,
    setMode,
    config,
    setConfig,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
};

export default TimerProvider;
