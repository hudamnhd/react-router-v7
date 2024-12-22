import { startOfYear, endOfYear, eachMonthOfInterval } from "date-fns";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Button } from "#app/components/ui/button";
import { cn } from "#app/utils/misc";
import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { Provider } from "react-redux";
import store from "#app/store/store";
import { setTasks } from "#app/features/daily-tasks/actions";
import { useAppSelector } from "#app/store/hooks";

let initial_data = true;

const calculateGlobalSessionCount = (data) => {
  const result = {};

  for (const [date, todos] of Object.entries(data)) {
    // Menghitung total sesi untuk setiap tanggal
    const totalSessionsForDate = todos.reduce((total, todo) => {
      return total + todo.sessions.length; // Menambahkan jumlah sesi dari setiap todo
    }, 0);

    // Menyimpan total sesi untuk setiap tanggal
    result[date] = totalSessionsForDate;
  }

  return result;
};

async function load_data_daily_tasks() {
  const data_tasks = localStorage.getItem("daily-tasks");
  const initialTasks = data_tasks ? JSON.parse(data_tasks) : {};

  try {
    if (initialTasks) {
      store.dispatch(setTasks(initialTasks));
    } else {
      store.dispatch(setTasks({}));
    }
  } catch (error) {
    console.warn("DEBUGPRINT[2]: todo.tsx:81: error=", error);
  } finally {
    initial_data = false;
  }
}
const Layout = () => {
  const todos = useAppSelector((state) => state.tasks.tasks);

  React.useEffect(() => {
    load_data_daily_tasks();
  }, []);

  if (!initial_data) {
    const all_session = calculateGlobalSessionCount(todos);
    return <CalendarYears total_sessions={all_session} />;
  }
};

const CalendarYears = ({ total_sessions }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthsInYear, setMonthsInYear] = useState([]);

  // Fungsi untuk memperbarui kalender
  const updateCalendar = () => {
    // Menghitung tanggal mulai dan akhir tahun di waktu lokal
    const startOfCurrentYear = startOfYear(new Date(currentYear, 0, 1));
    const endOfCurrentYear = endOfYear(startOfCurrentYear);

    // Mengambil semua bulan dalam tahun ini
    const months = eachMonthOfInterval({
      start: startOfCurrentYear,
      end: endOfCurrentYear,
    });

    // Menampilkan setiap bulan dalam tahun
    setMonthsInYear(months);
  };

  // Update kalender saat currentYear berubah
  useEffect(() => {
    updateCalendar();
  }, [currentYear]);

  // Menangani navigasi tahun berikutnya dan sebelumnya
  const handleNextYear = () => {
    setCurrentYear((prevYear) => prevYear + 1);
  };

  const handlePreviousYear = () => {
    setCurrentYear((prevYear) => prevYear - 1);
  };

  return (
    <div className="w-full max-h-screen overflow-y-auto">
      <div className="bg-background z-10">
        <div className="text-center text-3xl font-bold">Garden of Focus</div>
        <div className="flex w-full items-center justify-center gap-2">
          <Button
            onClick={handlePreviousYear}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="text-center text-2xl">{currentYear}</div>
          <Button
            onClick={handleNextYear}
            variant="outline"
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 pb-5">
          <GardenSessionBadge text={true} sessionCount={1} />
          <GardenSessionBadge text={true} sessionCount={4} />
          <GardenSessionBadge text={true} sessionCount={8} />
          <GardenSessionBadge text={true} sessionCount={12} />
          <GardenSessionBadge text={true} sessionCount={16} />
          <GardenSessionBadge text={true} sessionCount={20} />
        </div>
      </div>
      <div className="w-fit mx-auto grid grid-cols-1 gap-5 gap-y-10 md:grid-cols-3 mt-5 p-3">
        {monthsInYear.map((monthStart) => {
          const monthName = monthStart.toLocaleString("default", {
            month: "long",
          });
          const daysInMonth = [];
          const startOfCurrentMonth = startOfMonth(monthStart);
          const endOfCurrentMonth = endOfMonth(monthStart);
          const days = eachDayOfInterval({
            start: startOfCurrentMonth,
            end: endOfCurrentMonth,
          });
          const firstDayOfMonth = getDay(startOfCurrentMonth);
          const adjustedFirstDay =
            firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
          const paddedDays = Array(adjustedFirstDay).fill(null).concat(days);

          // Menambahkan nama bulan dan hari-hari dalam bulan tersebut
          daysInMonth.push(
            <div key={monthStart} className="border p-2">
              <div className="text-lg font-bold">{monthName}</div>
              <div className="grid w-full grid-cols-7 items-start justify-center gap-2 rounded-lg bg-gradient-to-t from-white to-green-50 p-2 dark:bg-gradient-to-t dark:from-gray-900 dark:to-green-950 md:w-max">
                <div className="rounded-t border-b text-center font-bold">
                  Sn
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Sl
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Rb
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Km
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Jm
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Sb
                </div>
                <div className="rounded-t border-b text-center font-bold">
                  Mg
                </div>

                {paddedDays.map((day, index) => {
                  if (day) {
                    const dataKey = day ? format(day, "yyyy-MM-dd") : null;
                    const sessions = total_sessions[dataKey] || 0;
                    return (
                      <div key={index} className=" flex flex-col items-center">
                        <div className="text-center text-sm text-muted-foreground">
                          {day.getDate()}
                        </div>
                        <button data-state="closed">
                          <div className="flex h-12 w-12 items-center justify-center overflow-visible p-1 rounded-lg border border-orange-200 bg-orange-50 dark:border-gray-700 dark:bg-gray-950/50">
                            <GardenSessionBadge sessionCount={sessions} />
                          </div>
                        </button>
                      </div>
                    );
                  } else {
                    return <div key={index} className="h-12 w-12" />;
                  }
                })}
              </div>
            </div>,
          );
          return daysInMonth;
        })}
      </div>
    </div>
  );
};

const GardenSessionBadge = ({ sessionCount, text }) => {
  let icon;
  let sessionText;

  if (sessionCount > 16) {
    icon = (
      <div className="relative">
        <div className="absolute right-0 top-0 text-2xl">🔥</div>
        <div className="text-5xl">🌳</div>
      </div>
    );
    sessionText = ">16 session";
  } else if (sessionCount === 16) {
    icon = "🌳";
    sessionText = "16 session";
  } else if (sessionCount >= 12) {
    icon = "🌲";
    sessionText = "12 session";
  } else if (sessionCount >= 8) {
    icon = (
      <div className="relative">
        <div className="absolute left-1 top-1 scale-75 text-2xl">🌿</div>
        <div className="-ml-3 scale-x-[-1] text-2xl">🌿</div>
      </div>
    );
    sessionText = "8 session";
  } else if (sessionCount >= 4) {
    icon = "☘";
    sessionText = "4 session";
  } else if (sessionCount >= 1) {
    icon = "🌱";
    sessionText = "1 session";
  } else {
    // icon = "❌"; // Ini opsional untuk ketika sessionCount === 0 atau tidak valid
    icon = " "; // Ini opsional untuk ketika sessionCount === 0 atau tidak valid
    sessionText = "No session";
  }

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-2 dark:border-gray-600 dark:bg-green-950/50",
      )}
    >
      <div className={cn("text-4xl ", text ? "" : "absolute")}>{icon}</div>
      {text && <div className="absolute-10">{sessionText}</div>}
    </div>
  );
};

export default function Route() {
  return (
    <ClientOnly fallback={<Loader />}>
      {() => (
        <Provider store={store}>
          <Layout />
        </Provider>
      )}
    </ClientOnly>
  );
}
