import { MODE } from "#app/components/timer/enum";
import { TimerContext } from "#app/components/timer/TimerContext";
import { CountdownTimerProps } from "#app/components/timer/types";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const CountdownTimer = ({ callbackFn }: CountdownTimerProps) => {
  const { mode, timerText, isStarted } = useContext(TimerContext);
  const intervalRef = useRef<unknown>();
  const currDate = useRef(Date.now());
  const [currText, setCurrText] = useState("00:00");

  const handleSetCurrText = () => {
    let currText;
    if (mode === MODE.POMO) currText = timerText.pomo;
    else if (mode === MODE.SHORTBREAK) currText = timerText.sbreak;
    else currText = timerText.lbreak;
    setCurrText(currText);
  };

  useEffect(() => handleSetCurrText(), [mode, timerText, isStarted]);

  useEffect(() => {
    function startTimer(duration: number) {
      if (duration < 1) {
        toast.error("Timer cannot be started with zero duration");
        return;
      }
      currDate.current = Date.now();

      let diff: number, minutes, seconds;

      function timer() {
        diff = duration - (((Date.now() - currDate.current) / 1000) | 0);

        minutes = (diff / 60) | 0;
        seconds = (diff % 60) | 0;

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        setCurrText(`${minutes}:${seconds}`);
        if (diff < 1) {
          callbackFn?.();
          clearInterval(Number(intervalRef.current));
        }
      }

      intervalRef.current = setInterval(timer, 1000);
    }

    function textToSeconds(text: string) {
      const [minutes, seconds] = text.split(":").map(Number);
      return minutes * 60 + seconds;
    }

    if (isStarted) {
      if (!intervalRef.current) {
        // Start the interval only if it's not already running
        const duration = textToSeconds(currText);
        startTimer(duration);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as number);
        intervalRef.current = null;
      }
    }
  }, [isStarted, mode]);

  return <p className="text-8xl md:text-9xl font-bold">{currText}</p>;
};

export default CountdownTimer;
