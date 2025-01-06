import React, { useEffect, useState } from "react";
import { cn } from "#app/utils/misc.tsx";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isToday,
  isWeekend,
  isBefore,
  startOfMonth,
  subDays,
  addDays,
  subMonths,
} from "date-fns";
import { Button } from "#app/components/ui/button-shadcn";
import { Input } from "#app/components/ui/input";
import { Plus, PencilLine, Trash2, Check, X } from "lucide-react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { type MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Habit | Doti App" }];

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
  const currentWeek = eachDayOfInterval({
    start: subDays(today, 2), // 2 hari yang lalu
    end: addDays(today, 1), // 1 hari ke depan
    // start: startOfWeek(today, { weekStartsOn: 1 }), // Mulai minggu, Senin (weekStartsOn: 1)
    // end: endOfWeek(today, { weekStartsOn: 1 }), // Akhir minggu, Minggu
  });
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
  function getStatistics(habits) {
    const stats = {};

    // Hitung total habits di awal
    const totalHabits = habits.length;

    for (const habit of habits) {
      for (const [date, completed] of Object.entries(habit.dates)) {
        if (!stats[date]) {
          // Inisialisasi hanya completed, total disamakan untuk semua tanggal
          stats[date] = { total: totalHabits, completed: 0 };
        }
        if (completed) {
          stats[date].completed += 1;
        }
      }
    }

    return stats;
  }

  // Hitung statistik
  const statistics = getStatistics(habits);
  return (
    <div className="grid xl:grid-cols-2 gap-5 sm:p-4 place-items-start max-w-4xl sm:max-w-full  w-full">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mt-2 mb-4 sm:text-start text-center">
          {monthName}
        </h1>

        <div className="grid grid-cols-7 justify-center place-items-strecth rounded-lg max-w-md border  p-0.5">
          <React.Fragment>
            <div className="text-sm  font-bold col-span-3 py-1 flex items-center justify-center border-r-2 border-b">
              Habit
            </div>
            {currentWeek.map((date, index) => {
              const today = isToday(date);
              return (
                <div
                  key={date}
                  className={cn(
                    "flex flex-col items-center uppercase font-semibold text-sm py-2 border-b",
                    today && "bg-accent",
                  )}
                >
                  <span>{format(date, "EEE")}</span>
                  <span className="text-muted-foreground">
                    {format(date, "d")}
                  </span>
                </div>
              );
            })}
          </React.Fragment>

          {habits.length > 0 ? (
            habits.map((habit, index) => {
              const last_index = habits.length - 1 === index;
              return (
                <React.Fragment key={habit.id}>
                  <div
                    className={cn(
                      "group col-span-3 p-2 border-r-2 border-b",
                      last_index && "border-b-0",
                    )}
                  >
                    <div className="group-hover:hidden block">{habit.name}</div>
                    <div className="group-hover:flex hidden gap-x-2 text-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditHabit(habit.id)}
                      >
                        <PencilLine />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6"
                        onClick={() => deleteHabit(habit.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                  {currentWeek.map((date) => {
                    const formattedDate = format(date, "yyyy-MM-dd");
                    const isCompleted = habit.dates[formattedDate] || false;

                    const td = new Date();
                    const todayStart = new Date(
                      td.getFullYear(),
                      td.getMonth(),
                      td.getDate(),
                    );
                    const yesterday = isBefore(date, todayStart);
                    const today = isToday(date);

                    return (
                      <div
                        key={formattedDate}
                        className={cn(
                          "p-2 border-b ",
                          today && "bg-accent",
                          last_index && "border-b-0",
                        )}
                      >
                        <div className="group flex flex-col items-center gap-y-2 relative transition-all duration-500 ease-in-out">
                          <button
                            disabled={!today}
                            onClick={() =>
                              toggleHabitCompletion(habit.id, formattedDate)
                            }
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full",
                              !isCompleted &&
                                "bg-gray-300 dark:bg-gray-700 text-white",
                              today && "bg-foreground/50 dark:bg-foreground",
                              isCompleted &&
                                "bg-green-500 dark:bg-green-500 text-white",
                              yesterday &&
                                !isCompleted &&
                                "bg-red-500 dark:bg-red-500 text-white",
                            )}
                          >
                            <span>
                              {isCompleted ? (
                                <Check />
                              ) : yesterday && !isCompleted ? (
                                <X />
                              ) : (
                                ""
                              )}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })
          ) : (
            <div className="col-span-7 text-center p-2 text-sm text-muted-foreground">
              No data
            </div>
          )}
        </div>
        {/* Add Habit Input */}
        <div className="flex gap-2 mt-4 w-full">
          <Input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Enter a new habit"
          />
          <Button size="icon" disabled={newHabit.lengh == 0} onClick={addHabit}>
            <Plus />
          </Button>
        </div>
      </div>
      <CalendarMonth total_sessions={6} statistics={statistics} />
    </div>
  );
};

const CalendarMonth = ({ total_sessions, statistics }) => {
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
    <div className="bg-background w-full max-w-md sm:max-w-full border p-2 rounded-lg">
      <div className="flex justify-center sm:justify-start items-center gap-3 items-center mb-4">
        <Button
          onClick={handlePreviousMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          onClick={handleNextMonth}
          variant="outline"
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-10 items-start">
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
            const sessions = total_sessions[dataKey] || 0;
            const statistic = statistics[dataKey] || { total: 0, completed: 0 };
            return (
              <div
                key={index}
                className={`flex flex-col items-center rounded-lg cursor-pointer
            ${day ? "" : "bg-transparent"}  // Handle empty cells
            ${isToday(day) ? "" : ""}
            ${isWeekend(day) ? "" : ""}`}
              >
                <div className="text-center">{day ? format(day, "d") : ""}</div>
                {day && (
                  <button data-state="closed">
                    <FocusDisplay
                      statistic={statistic}
                      total_sessions={sessions}
                    />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="sm:block hidden w-full max-w-[240px] rounded bg-gray-50 p-5 dark:bg-gray-800">
          <div className="">Perisai Target</div>
          <hr className="my-3" />
          <FocusList />
        </div>
      </div>
    </div>
  );
};

const FocusDisplay = ({ statistic, total_sessions, isBtn }) => {
  return <div>{getFocusComponent(statistic, total_sessions, isBtn)}</div>;
};

const habitBadges = [
  {
    level: 1,
    badge: "Complete Mastery",
    styles: {
      outerBorder:
        "border-white bg-gradient-to-r from-blue-500 to-blue-300 ring-4 ring-orange-400",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    level: 0.75,
    badge: "Great Progress",
    styles: {
      outerBorder: "border-blue-500 bg-gradient-to-r from-blue-500 to-blue-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    level: 0.5,
    badge: "Good Effort",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    level: 0.25,
    badge: "Needs Improvement",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    level: 0.0,
    badge: "Just Starting",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder: "border-gray-300",
    },
  },
];

// Fungsi untuk menghitung persentase dan menentukan badge
function getHabitBadge(totalHabits, completedHabits) {
  if (totalHabits === 0) return habitBadges[habitBadges.length - 1]; // Jika tidak ada habit
  const progress = completedHabits / totalHabits;
  for (const badge of habitBadges) {
    if (progress >= badge.level) {
      return badge;
    }
  }

  return habitBadges[habitBadges.length - 1];
}

const getFocusComponent = (statistic) => {
  // Cari data yang cocok berdasarkan nilai fokus
  const badge = getHabitBadge(statistic.total, statistic.completed);

  // Return JSX sesuai gaya yang ditemukan
  return (
    <div className="flex items-center gap-2">
      <div>
        <div
          className={`shrink-0 rounded-full border-2 p-1.5 ${badge.styles.outerBorder}`}
        >
          <div
            className={`rounded-full border-2 p-1.5 ${badge.styles.middleBorder}`}
          >
            <div
              className={`rounded-full border-2 h-2 w-2 ${badge.styles.innerBorder}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusList = () => {
  return (
    <div>
      {habitBadges.map((item, index) => (
        <div key={index} className="mb-2 flex items-center gap-3 ">
          <div>
            <div
              className={`shrink-0 rounded-full border-2 p-1.5 ${item.styles.outerBorder}`}
            >
              <div
                className={`rounded-full border-2 p-1.5 ${item.styles.middleBorder}`}
              >
                <div
                  className={`rounded-full border-2 h-2 w-2 ${item.styles.innerBorder}`}
                />
              </div>
            </div>
          </div>
          <div>{item.badge}</div>
        </div>
      ))}
    </div>
  );
};

import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
export default function Route() {
  return (
    <ClientOnly fallback={<Loader />}>{() => <HabitTracker />}</ClientOnly>
  );
}
