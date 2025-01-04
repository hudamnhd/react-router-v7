import React, { useState, useEffect, useRef } from "react";
import { cn } from "#app/utils/misc";
import { TimerReset } from "lucide-react";
import { Coffee, Play, Activity, Pause } from "lucide-react";
import { Button } from "#app/components/ui/button";
import { useBeforeUnload } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";

enum MODE {
  POMO = "Pomo",
  SHORTBREAK = "ShortBreak",
  LONGBREAK = "LongBreak",
}

const App: React.FC = () => {
  const [mode, setMode] = useState<MODE>(MODE.POMO);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // Initial 25:00 minutes in seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  // Timer Durations
  const durations = {
    [MODE.POMO]: 25 * 60, // 25 minutes
    [MODE.SHORTBREAK]: 5 * 60, // 5 minutes
    [MODE.LONGBREAK]: 15 * 60, // 15 minutes
  };

  // Load state from Local Storage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setMode(parsedState.mode || MODE.POMO);
      setTimeLeft(parsedState.timeLeft || durations[MODE.POMO]);
      setIsRunning(parsedState.isRunning || false);
    }
  }, []);

  // Save state to Local Storage on change
  useEffect(() => {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({ mode, timeLeft, isRunning }),
    );
  }, [mode, timeLeft, isRunning]);

  // Save state before unload
  useBeforeUnload(() => {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({ mode, timeLeft, isRunning }),
    );
  });

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current!);
    }

    return () => clearInterval(timerRef.current!);
  }, [isRunning]);

  const handleModeChange = (newMode: MODE) => {
    // Cek apakah timer sedang berjalan
    if (isRunning) {
      const confirmChange = window.confirm(
        "Timer sedang berjalan. Apakah Anda yakin ingin mengganti mode? Timer akan diatur ulang.",
      );
      if (!confirmChange) return; // Jika pengguna membatalkan, tidak ada perubahan
    }

    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const progress = 1 - timeLeft / durations[mode];
  const strokeDashoffset = isRunning ? (1 - progress) * 2 * Math.PI * 45 : 0;

  return (
    <div className="grid place-items-center sm:py-4 px-4 text-center space-y-4 sm:max-w-md mx-auto">
      <div className="my-4 grid grid-cols-3 gap-2">
        <Button
          variant={mode === MODE.POMO ? "default" : "outline"}
          onPress={() => handleModeChange(MODE.POMO)}
        >
          <Activity />
          <span className="sm:flex hidden">Pomodoro</span>
          <span className="sm:hidden flex">Pomo</span>
        </Button>
        <Button
          variant={mode === MODE.SHORTBREAK ? "default" : "outline"}
          onPress={() => handleModeChange(MODE.SHORTBREAK)}
        >
          <Coffee />
          <span className="sm:flex hidden">Short Break</span>
          <span className="sm:hidden flex">5 m</span>
        </Button>
        <Button
          variant={mode === MODE.LONGBREAK ? "default" : "outline"}
          onPress={() => handleModeChange(MODE.LONGBREAK)}
        >
          <Coffee />
          <span className="sm:flex hidden">Long Break</span>
          <span className="sm:hidden flex">15 m</span>
        </Button>
      </div>
      {/* Modes */}

      {/* Timer */}

      <div className="relative w-48 h-48 mb-6">
        <div className="absolute flex h-full w-full justify-center">
          <div className="flex flex-col justify-center items-center">
            {mode !== "Pomo" ? (
              <Button
                onPress={() => setIsRunning(!isRunning)}
                variant="ghost"
                size="icon"
                className={`h-16 w-16 [&_svg]:size-10 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                style={{ animationDelay: `0.1s` }}
              >
                <Coffee
                  style={{ animationDelay: `0.3s` }}
                  className={cn(
                    isRunning &&
                      "animate-roll-reveal [animation-fill-mode:backwards]",
                  )}
                />
              </Button>
            ) : (
              <Button
                onPress={() => setIsRunning(!isRunning)}
                variant="ghost"
                size="icon"
                className={`h-16 w-16 [&_svg]:size-10 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                style={{ animationDelay: `0.1s` }}
              >
                {isRunning ? (
                  <Pause
                    style={{ animationDelay: `0.3s` }}
                    className={cn(
                      isRunning &&
                        "animate-roll-reveal [animation-fill-mode:backwards]",
                    )}
                  />
                ) : (
                  <Play
                    className={cn(
                      "animate-slide-top [animation-fill-mode:backwards]",
                    )}
                  />
                )}
              </Button>
            )}
            <div
              style={{ animationDelay: `0.1s` }}
              className="text-3xl font-bold animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center transition-all duration-500 ease-in-out"
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        <svg className="dark:bg-white/30 rounded-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-secondary"
            strokeWidth="6"
            fill="none"
          />
          <circle
            className={cn(
              mode === "Pomo"
                ? "dark:stroke-lime-400 stroke-lime-500"
                : "dark:stroke-orange-400 stroke-orange-500",
              " transition-all duration-500 ease-in-out",
            )}
            cx="50"
            cy="50"
            r="45"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-2 sm:w-[70%] mx-auto">
        <Button onPress={() => setIsRunning(!isRunning)}>
          {isRunning ? <Pause /> : <Play />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          variant="secondary"
          onPress={() => {
            setIsRunning(false);
            setTimeLeft(durations[mode]);
          }}
        >
          <TimerReset />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default function Route() {
  return (
    <ClientOnly fallback={<Loader />}>
      {() => (
        <React.Fragment>
          <Example>
            <App />
          </Example>
        </React.Fragment>
      )}
    </ClientOnly>
  );
}

function Example({ children }) {
  return (
    <div className="relative sm:py-4 bg-background overflow-hidden">
      <div className="relative px-4 sm:px-6 lg:px-8">
        <div className="text-lg max-w-prose mx-auto">
          <h1>
            <span className="block text-2xl text-center leading-8 font-extrabold tracking-tight sm:text-3xl">
              Pomodoro
            </span>
          </h1>

          {children}
          <div className="space-y-4 mt-2">
            <details
              className="group [&_summary::-webkit-details-marker]:hidden"
              open
            >
              <summary className="flex cursor-pointer items-center justify-between gap-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 px-4 py-2.5">
                <h2 className="font-medium">Apa itu Pomodoro ?</h2>

                <svg
                  className="size-5 shrink-0 transition duration-300 group-open:-rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>

              <p className="text-muted-foreground px-4 py-2.5">
                Kata <strong>pomodoro</strong> berasal dari bahasa Italia yang
                berarti <strong>tomat</strong>. Metode Pomodoro Technique
                dinamai demikian karena Francesco Cirillo, pencipta metode ini,
                awalnya menggunakan timer dapur berbentuk tomat untuk mengatur
                waktu kerjanya. Pomodoro Technique Ini adalah teknik manajemen
                waktu yang membagi waktu kerja menjadi interval fokus (biasanya{" "}
                <strong>25 menit</strong>), yang disebut{" "}
                <strong>pomodoros</strong>, diikuti dengan istirahat singkat
                (biasanya <strong>5 menit</strong>
                ).
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}
