import { MODE } from "#app/components/timer/enum";
import { Dispatch, SetStateAction } from "react";

export type ModeTimesProps = {
  pomo: string;
  sbreak: string;
  lbreak: string;
};

export type CountdownTimerProps = {
  callbackFn?: () => void;
  mode?: ModeTimesProps;
};

export type TimerContextProps = {
  isStarted: boolean;
  setIsStarted: Dispatch<SetStateAction<boolean>>;
  mode: number;
  setMode: Dispatch<SetStateAction<MODE>>;
  timerText: ModeTimesProps;
  setTimerText: Dispatch<SetStateAction<ModeTimesProps>>;
  config: PomodoroConfig;
  setConfig: Dispatch<SetStateAction<PomodoroConfig>>;
};

export type TimePropertyNames = "minutes" | "seconds";
export type PomodoroDuration = {
  [key in TimePropertyNames]: number;
};

export type PomodoroPropertyNames = "pomo" | "lbreak" | "sbreak";

export type PomodoroConfig = {
  [key in PomodoroPropertyNames]: PomodoroDuration;
};
