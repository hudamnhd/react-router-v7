import { useContext, useEffect } from "react";
import { Button } from "#app/components/ui/button";
import { TimerContext } from "#app/components/timer/TimerContext";
import CountdownTimer from "./countdownTimer";
import { Play, Pause } from "lucide-react";
import { MODE } from "#app/components/timer/enum";
import { toast } from "sonner";

const Timer = () => {
  const { isStarted, setIsStarted } = useContext(TimerContext);
  const { mode, setMode } = useContext(TimerContext);

  const handleChangeCurrMode = () => {
    setIsStarted(false);
    if (mode === MODE.POMO) setMode(MODE.SHORTBREAK);
    else if (mode === MODE.SHORTBREAK) setMode(MODE.LONGBREAK);
    else setMode(MODE.POMO);
    setTimeout(() => {
      setIsStarted(true);
    }, 1000);
  };

  const toggleTimer = () => {
    setIsStarted((prev) => !prev);
  };

  const changeCountDown = () => {
    handleChangeCurrMode();
  };

  useEffect(() => {
    if (mode) {
      const title = `Mode Changed to ${mode === 0 ? "Pomodoro" : mode === 1 ? "Short Break" : "Long Break"}`;
      toast.info(title);
    }
  }, [mode]);

  return (
    <div className="flex flex-col items-center justify-center gap-y-4">
      <CountdownTimer callbackFn={changeCountDown} />
      <div className="w-fit mx-auto">
        <Button
          variant={isStarted ? "secondary" : "outline"}
          onClick={() => {
            toggleTimer();
          }}
        >
          {isStarted ? <Pause /> : <Play />}
          {isStarted ? "Stop" : "Start"}
        </Button>
      </div>
    </div>
  );
};

export default Timer;
