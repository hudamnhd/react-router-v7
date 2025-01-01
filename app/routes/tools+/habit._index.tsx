import React, { useEffect, useState } from "react";
import { cn } from "#app/utils/misc.tsx";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  isSameMonth,
  isToday,
  isTomorrow,
  isWeekend,
  isYesterday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { Button } from "#app/components/ui/button";

import {
  Circle,
  PencilLine,
  Trash2,
  Activity,
  ArrowRight,
  Badge as BadgeIcon,
  Check,
  CheckCircle2,
    CircleCheckBig,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  CircleCheckBig,
  CirclePlus,
  Coffee,
  Crosshair,
  Download,
  EllipsisVertical,
  Flame,
  GripVertical,
  History,
  Info,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Rocket,
  Squircle,
  Trash2,
  Trees,
  Upload,
  X,
} from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

type Habit = {
  id: number;
  name: string;
  dates: Record<string, boolean>; // Track completion for each date
};

const getStoredHabits = (): Habit[] => {
  const storedHabits = localStorage.getItem("habits");
  return storedHabits ? JSON.parse(storedHabits) : [];
};

const saveHabitsToLocalStorage = (habits: Habit[]) => {
  localStorage.setItem("habits", JSON.stringify(habits));
};

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState("");

  const today = new Date();
  const monthName = format(startOfMonth(today), "MMMM yyyy");
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  });
  const isLoaded = React.useRef(false); // Track if habits have been loaded

  // Load habits from localStorage on initial render
  useEffect(() => {
    const data = getStoredHabits();
    setHabits(data);
    isLoaded.current = true; // Mark as loaded
  }, []);

  // Save to localStorage whenever habits change, but only after initial load
  useEffect(() => {
    if (isLoaded.current) {
      saveHabitsToLocalStorage(habits);
    }
  }, [habits]);
  // Save to localStorage whenever habits change

  const addHabit = () => {
    if (newHabit.trim() === "") return;

    const newHabitObj: Habit = {
      id: Date.now(),
      name: newHabit.trim(),
      dates: {}, // Empty record for dates
    };

    setHabits((prev) => [...prev, newHabitObj]);
    setNewHabit(""); // Clear input field
  };

  const toggleHabitCompletion = (habitId: number, date: string) => {
    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              dates: {
                ...habit.dates,
                [date]: !habit.dates[date], // Toggle completion
              },
            }
          : habit,
      ),
    );
  };

  const deleteHabit = (habitId: number) => {
    setHabits((prevHabits) =>
      prevHabits.filter((habit) => habit.id !== habitId),
    );
  };

  const editHabitName = (habitId: number, newName: string) => {
    if (!newName.trim()) {
      console.error("New name cannot be empty.");
      return;
    }

    setHabits((prevHabits) =>
      prevHabits.map((habit) =>
        habit.id === habitId
          ? { ...habit, name: newName.trim() } // Update the habit name
          : habit,
      ),
    );
  };

  const handleEditHabit = (habitId: number) => {
    const newName = prompt("Enter the new name for the habit:");
    if (newName) {
      editHabitName(habitId, newName);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Habit Tracker {monthName}</h1>

      {/* Add Habit Input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="Enter a new habit"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={addHabit}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Add Habit
        </button>
      </div>

      {/* Habit Table */}
      <div className="overflow-x-auto">
        <table className="table-auto border-collapse border border-gray-300 w-full text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Habit</th>
              {daysInMonth.map((date) => (
                <th
                  key={date.toString()}
                  className="border border-gray-300 p-2 text-center"
                  title={format(date, "EEEE, MMM d")}
                >
                  {format(date, "d")}
                </th>
              ))}
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => (
              <tr key={habit.id}>
                <td className="border border-gray-300 p-2">{habit.name}</td>
                {daysInMonth.map((date) => {
                  const formattedDate = format(date, "yyyy-MM-dd");
                  const isCompleted = habit.dates[formattedDate] || false;

                  return (
                    <td
                      key={formattedDate}
                      className="border border-gray-300 p-2 text-center"
                    >
                      <Button
                        size="icon"
                        className={cn(
                          "[&_svg]:size-5 ",
                          isCompleted &&
                            "bg-green-600 dark:bg-green-500 hover:bg-green-500 dark:hover:bg-green-600 ",
                        )}
                        onClick={() =>
                          toggleHabitCompletion(habit.id, formattedDate)
                        }
                        variant={isCompleted ? "default" : "outline"}
                      >
                        {isCompleted ? (
                          <CircleCheckBig />
                        ) : (
                          <Circle className="text-muted-foreground opacity-50" />
                        )}
                      </Button>
                    </td>
                  );
                })}
                <td className="flex gap-x-2 p-2 text-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditHabit(habit.id)}
                  >
                    <PencilLine />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => deleteHabit(habit.id)}
                  >
                    <Trash2 />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CalendarMonth = ({ total_sessions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir bulan di waktu lokal
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Mengambil semua hari dalam bulan ini
    const days = eachDayOfInterval({
      start: startOfCurrentMonth,
      end: endOfCurrentMonth,
    });

    // Menghitung hari pertama bulan ini
    const firstDayOfMonth = getDay(startOfCurrentMonth);

    // Menyesuaikan hari pertama kalender, agar selalu dimulai dari Senin
    // Jika firstDayOfMonth adalah 0 (Minggu), kita anggap sebagai 7 (Sabtu),
    // dan kita sesuaikan paddingnya.
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Menambahkan padding untuk hari-hari sebelum tanggal 1 bulan
    const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

    setDaysInMonth(paddedDays);
  };

  // Update kalender saat currentMonth berubah
  useEffect(() => {
    updateCalendar();
  }, [currentMonth]);

  // Menangani navigasi bulan berikutnya dan sebelumnya
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  return (
    <div className="bg-background">
      <div className="flex justify-start items-center gap-3 items-center mb-4">
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          onClick={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-10">
        <div className="w-full grid grid-cols-7 items-center justify-center gap-3">
          {/* Header hari (Senin, Selasa, Rabu, dll.) */}
          <div className="rounded-t border-b text-center font-bold">Mo</div>
          <div className="rounded-t border-b text-center font-bold">Tu</div>
          <div className="rounded-t border-b text-center font-bold">We</div>
          <div className="rounded-t border-b text-center font-bold">Th</div>
          <div className="rounded-t border-b text-center font-bold">Fr</div>
          <div className="rounded-t border-b text-center font-bold">Sa</div>
          <div className="rounded-t border-b text-center font-bold">Su</div>

          {daysInMonth.map((day, index) => {
            const dataKey = day ? format(day, "yyyy-MM-dd") : null;
            return (
              <div
                key={index}
                className={`rounded-lg cursor-pointer
            ${day ? "" : "bg-transparent"}  // Handle empty cells
            ${isToday(day) ? "" : ""}
            ${isWeekend(day) ? "" : ""}`}
              >
                <div className="text-center">{day ? format(day, "d") : ""}</div>
                {day && (
                  <button data-state="closed">
                    {/*<FocusDisplay total_sessions={sessions} />*/}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { useBeforeUnload } from "@remix-run/react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
export default function Route() {
  return (
    <ClientOnly fallback={<Loader />}>
      {() => (
        <React.Fragment>
          <HabitTracker />
          <CalendarMonth total_sessions={6} />
        </React.Fragment>
      )}
    </ClientOnly>
  );
}
