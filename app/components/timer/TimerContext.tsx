import { MODE } from "#app/components/timer/enum";
import { TimerContextProps } from "#app/components/timer/types";
import { createContext } from "react";

const TimerContext = createContext<TimerContextProps>({
  isStarted: false,
  setIsStarted: () => {},
  timerText: {
    pomo: "25:00",
    lbreak: "15:00",
    sbreak: "5:00",
  },
  setTimerText: () => {},
  mode: MODE.POMO,
  setMode: () => {},
  config: {
    pomo: { minutes: 25, seconds: 0 },
    sbreak: { minutes: 5, seconds: 0 },
    lbreak: { minutes: 15, seconds: 0 },
  },
  setConfig: () => {},
});

export { TimerContext };
