import { useContext, useEffect, useState } from "react";
import { Button } from "#app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#app/components/ui/dialog";
import { Settings as Gear } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#app/components/ui/card";
import { Counter } from "#app/components/timer/counter";
import { MODE } from "#app/components/timer/enum";
import { PomodoroPropertyNames } from "#app/components/timer/types";
import { TimerContext } from "#app/components/timer/TimerContext";

export function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, setTimerText, isStarted, setIsStarted } =
    useContext(TimerContext);

  function saveConfigToTimerText(): void {
    const modes: PomodoroPropertyNames[] = ["pomo", "lbreak", "sbreak"];

    for (const mode of modes) {
      // Ensure config[mode] exists and has valid values
      if (
        !config[mode] ||
        typeof config[mode].minutes !== "number" ||
        typeof config[mode].seconds !== "number"
      ) {
        console.error("Invalid", mode, "configuration in config!");
        continue;
      }

      // Format minutes and seconds with leading zeros
      const formattedMinutes = String(config[mode].minutes).padStart(2, "0");
      const formattedSeconds = String(config[mode].seconds).padStart(2, "0");

      // Update timerText property for the current mode
      setTimerText((prev) => {
        return {
          ...prev,
          [mode]: `${formattedMinutes}:${formattedSeconds}`,
        };
      });
    }
    setIsOpen(false);
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(e) => {
        if (!e) {
          saveConfigToTimerText();
        } else {
          setIsStarted(false);
          setIsOpen(true);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" variant={"outline"}>
          <Gear />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80%] overflow-y-scroll w-11/12">
        <DialogHeader className="text-left">
          <DialogTitle>Timer Settings</DialogTitle>
          <DialogDescription>
            Changes save automatically. Close to exit.
          </DialogDescription>
        </DialogHeader>

        <Card className="flex-col p-2">
          <CardHeader>
            <CardTitle>Pomodoro</CardTitle>
            <CardDescription>Set Pomodoro duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <section className="flex flex-wrap gap-4 justify-evenly">
              <Counter mode={MODE.POMO} isMinutes={true} />
              <Counter mode={MODE.POMO} isMinutes={false} />
            </section>
          </CardContent>
        </Card>

        <Card className="flex-col p-2">
          <CardHeader>
            <CardTitle>Short Break</CardTitle>
            <CardDescription>Set Short Break duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <section className="flex flex-wrap gap-4 justify-evenly px-4">
              <Counter mode={MODE.SHORTBREAK} isMinutes={true} />
              <Counter mode={MODE.SHORTBREAK} isMinutes={false} />
            </section>
          </CardContent>
        </Card>
        <Card className="flex-col p-2">
          <CardHeader>
            <CardTitle>Long Break</CardTitle>
            <CardDescription>Set Long Break duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <section className="flex flex-wrap gap-4 justify-evenly">
              <Counter mode={MODE.LONGBREAK} isMinutes={true} />
              <Counter mode={MODE.LONGBREAK} isMinutes={false} />
            </section>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
