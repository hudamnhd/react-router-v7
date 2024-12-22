import { useContext, useState } from "react";
import { Button } from "#app/components/ui/button";

import { TimerContext } from "#app/components/timer/TimerContext";
import {
  PomodoroConfig,
  PomodoroPropertyNames,
  TimePropertyNames,
} from "#app/components/timer/types";
import { MODE } from "#app/components/timer/enum";
import { Minus, Plus } from "lucide-react";

const TIME_INCREMENT = 5;

interface counterProps {
  mode: MODE;
  isMinutes: boolean;
}

export function Counter({ mode, isMinutes }: counterProps) {
  const { config, setConfig } = useContext(TimerContext);
  function findMode() {
    let modeToChange: PomodoroPropertyNames;
    if (mode === MODE.POMO) {
      modeToChange = "pomo";
    } else if (mode === MODE.LONGBREAK) {
      modeToChange = "lbreak";
    } else {
      modeToChange = "sbreak";
    }
    return modeToChange;
  }

  const [modeToChange] = useState<PomodoroPropertyNames>(findMode());
  const [timeToChange] = useState<TimePropertyNames>(
    isMinutes ? "minutes" : "seconds",
  );

  function clampValue(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
  }

  function handleIncrementDecrement(
    prev: PomodoroConfig,
    isInrement: boolean,
    min = 0,
    max = 60,
  ): PomodoroConfig {
    const updatedModeConfig = {
      ...prev[modeToChange],
      [timeToChange]: clampValue(
        prev[modeToChange][timeToChange] +
          (isInrement ? TIME_INCREMENT : -TIME_INCREMENT),
        min,
        max,
      ),
    };

    return {
      ...prev,
      [modeToChange]: updatedModeConfig,
    };
  }

  return (
    <div className="flex items-center justify-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => {
          console.log(config);
          setConfig((prev) => handleIncrementDecrement(prev, false));
        }}
      >
        <Minus className="h-4 w-4" />
        <span className="sr-only">Decrease</span>
      </Button>
      <div className="flex-1 text-center">
        <div className="text-7xl font-bold tracking-tighter">
          {config[modeToChange][timeToChange]}
        </div>
        <div className="text-[0.70rem] uppercase text-muted-foreground">
          {timeToChange}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 shrink-0 rounded-full"
        onClick={() => {
          console.log(config);
          setConfig((prev) => handleIncrementDecrement(prev, true));
        }}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Increase</span>
      </Button>
    </div>
  );
}
