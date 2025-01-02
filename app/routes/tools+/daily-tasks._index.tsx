import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import lodash from "lodash";
import React, { useMemo, useState, useRef, useCallback } from "react";
import { ClientOnly } from "remix-utils/client-only";
import Loader from "#app/components/ui/loader";
import { Link, useBeforeUnload } from "@remix-run/react";
import { toast } from "sonner";
import { Badge } from "#app/components/ui/badge";
import { Label } from "#app/components/ui/label";
import { useAppSelector, useAppDispatch } from "#app/store/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#app/components/ui/dropdown-menu";

import {
  addTask,
  copyTask,
  addSubTask,
  updateTask,
  deleteTask,
  deleteSubTask,
  updateSubTask,
  updateSessionTask,
  updateTasksColumn,
  updateSubTasksColumn,
  Task,
  setTasks,
} from "#app/features/daily-tasks/actions";
import {
  ChevronsUpDown,
  Info,
  Download,
  Upload,
  EllipsisVertical,
  Activity,
  Trees,
  Plus,
  Coffee,
  Flame,
  Badge as BadgeIcon,
  Play,
  Pause,
  Rocket,
  X,
  GripVertical,
  ArrowRight,
  Crosshair,
  Circle,
  CircleCheckBig,
  CirclePlus,
  Squircle,
  Trash2,
  History,
  Check,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#app/components/ui/collapsible";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#app/components/ui/popover";
import { AutosizeTextarea } from "#app/components/ui/autosize-textarea";
import { cn } from "#app/utils/misc";
import { Button, buttonVariants } from "#app/components/ui/button-shadcn";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

let initial_data = true;
async function load_data_daily_tasks() {
  const data_tasks = localStorage.getItem("daily-tasks");
  const initialTasks = data_tasks ? JSON.parse(data_tasks) : {};
  // const initialTasks = await getCache("daily-tasks");
  const now = new Date();

  // Fungsi untuk memperbarui status
  function updateStatus(data) {
    for (const date in data) {
      const tasks = data[date];

      for (const task of tasks) {
        // Cek jika status progress
        if (task.status === "progress") {
          // Ambil waktu terakhir dari sessions
          const lastSessionTime = new Date(
            task.sessions[task.sessions.length - 1],
          );

          // Jika sudah lebih dari 25 menit
          const diffMinutes =
            (now.getTime() - lastSessionTime.getTime()) / 1000 / 60;

          if (diffMinutes > 25) {
            task.status = "pending";
            console.log(
              `Status updated to 'pending' for task ${task.id} due to timeout.`,
            );
          } else {
            console.log(`No status update needed for task ${task.id}.`);
          }
        }
      }
    }

    return data;
  }

  try {
    if (initialTasks) {
      const updatedData = updateStatus(initialTasks);
      store.dispatch(setTasks(updatedData));
    } else {
      store.dispatch(setTasks({}));
    }
    initial_data = false;
  } catch (error) {
    console.warn("DEBUGPRINT[2]: todo.tsx:81: error=", error);
    initial_data = false;
  } finally {
    if (spinner) {
      spinner.style.display = "none";
    }
  }
}

const findTodosByStatusWithReduce = (data, status: string) => {
  const todosWithStatus = Object.values(data).reduce((acc, todos) => {
    const filteredTodos = todos.filter((todo) => todo.status === status);
    return acc.concat(filteredTodos);
  }, []);

  return todosWithStatus.length > 0 ? todosWithStatus[0] : null;
};

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

const calculateStreak = (data) => {
  // Ambil semua tanggal dari data dan urutkan
  const sortedDates = Object.keys(data).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  if (sortedDates.length === 0) return { current_streak: 0, longest_streak: 0 };

  const startDate = new Date(sortedDates[0]);
  const endDate = new Date(sortedDates[sortedDates.length - 1]);

  // Ambil semua hari dari tanggal awal hingga akhir
  const allDays = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (date) => ({
      formatted: format(date, "yyyy-MM-dd"),
      dayOfWeek: getDay(date), // Dapatkan hari dalam angka (0 = Minggu, 6 = Sabtu)
    }),
  );

  let current_streak = 0;
  let longest_streak = 0;

  for (const { formatted, dayOfWeek } of allDays) {
    if (data[formatted]) {
      // Jika tanggal ada di data, cek apakah ada sesi aktif
      const hasActiveSessions = data[formatted].some(
        (todo) => todo.sessions.length > 0,
      );
      if (hasActiveSessions) {
        current_streak++; // Tambah streak jika aktif
        longest_streak = Math.max(longest_streak, current_streak);
      } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Reset streak jika tidak aktif, kecuali hari Sabtu (6) atau Minggu (0)
        current_streak = 0;
      }
    } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Reset streak jika tanggal tidak ada, kecuali akhir pekan
      current_streak = 0;
    }
  }

  return {
    current_streak,
    longest_streak,
  };
};

const TodoNavigator = ({ data }) => {
  const [day_timestamp, set_day_timestamp] = useState<number | undefined>();
  const date_key = get_formatted_date(day_timestamp);
  // Fungsi untuk mendapatkan task berdasarkan tanggal
  const todos = data[date_key.key] || [];

  // Fungsi untuk navigasi ke tanggal berikutnya
  const goToNextDate = () => {
    set_day_timestamp(date_key.timestamp + 86400000);
  };

  // Fungsi untuk navigasi ke tanggal sebelumnya
  const goToPreviousDate = () => {
    set_day_timestamp(date_key.timestamp - 86400000);
  };

  const active_task = findTodosByStatusWithReduce(data, "progress");
  const all_session = calculateGlobalSessionCount(data);
  const streak_data = calculateStreak(data);

  return (
    <div className="pb-6">
      <TaskApp
        todos={todos}
        goToNextDate={goToNextDate}
        goToPreviousDate={goToPreviousDate}
        date={date_key}
        active_task={active_task}
        all_session={all_session}
        streak_data={streak_data}
      />

      <BreakState data={todos} />

      <div id="container-task">
        <DragDropList
          data={data}
          tasks={todos}
          date={date_key}
          active_task={active_task}
          all_session={all_session}
          streak_data={streak_data}
        />
      </div>

      <Unload data={data} date={date_key} active_task={active_task} />
      {/*<Debug data={todos} />*/}
    </div>
  );
};

const BreakState = () => {
  return (
    <div
      id="container-break-time"
      style={{ display: "none" }}
      className="flex mx-auto w-full flex-col items-center justify-center rounded py-20 text-center text-xl "
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={50}
        height={50}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="lucide lucide-coffee text-gray-600"
      >
        <path d="M10 2v2" />
        <path d="M14 2v2" />
        <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
        <path d="M6 2v2" />
      </svg>
      Nikmati istirahatmu! Lupakan sejenak tasks yang ada, relax!
      <div className="mt-2 text-base">Kamu sedang break untuk 5 menit.</div>
    </div>
  );
};

const exportTodos = (todos) => {
  // Mengonversi data todos ke format JSON
  const jsonData = JSON.stringify(todos);

  // Membuat Blob untuk file JSON
  const blob = new Blob([jsonData], { type: "application/json" });

  // Membuat URL untuk Blob
  const url = URL.createObjectURL(blob);

  // Membuat elemen <a> untuk mendownload file
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json"; // Nama file yang akan diunduh
  a.click(); // Men-trigger klik untuk mendownload

  // Membersihkan URL objek
  URL.revokeObjectURL(url);
};

// Fungsi untuk memvalidasi format data
const validateTodoData = (todosData) => {
  // Memeriksa apakah data sesuai dengan format yang diinginkan
  if (typeof todosData !== "object") return false;

  // Iterasi setiap tanggal menggunakan for...of
  for (const date of Object.keys(todosData)) {
    const tasks = todosData[date];

    // Memeriksa apakah setiap tanggal memiliki array
    if (!Array.isArray(tasks)) return false;

    // Iterasi setiap task di dalam array
    for (const task of tasks) {
      // Memeriksa apakah task memiliki struktur yang benar
      if (!task.id || !task.created_at) {
        return false; // Jika ada field yang tidak ada, data tidak valid
      }
    }
  }
  return true;
};

const mergeSubTasks = (existingSubTasks, newSubTasks) => {
  // Gabungkan sub_tasks yang ada, dan hindari duplikat berdasarkan ID
  const mergedSubTasks = [...existingSubTasks];

  for (const newSubTask of newSubTasks) {
    // Memeriksa apakah sub_task dengan id yang sama sudah ada
    const exists = mergedSubTasks.some(
      (subTask) => subTask.id === newSubTask.id,
    );

    if (!exists) {
      mergedSubTasks.push(newSubTask); // Jika tidak ada, tambahkan sub_task baru
    }
  }

  return mergedSubTasks;
};
// Fungsi untuk menggabungkan tugas berdasarkan tanggal
const mergeTasksByDate = (todosData, oldData = {}) => {
  const mergedData = { ...oldData };

  // Iterasi setiap tanggal dari todosData
  for (const date of Object.keys(todosData)) {
    const tasks = todosData[date];

    // Memastikan bahwa tanggal dan tasks ada
    if (!Array.isArray(tasks) || tasks.length === 0) {
      continue; // Jika tidak ada tasks pada tanggal ini, lanjutkan ke tanggal berikutnya
    }

    // Jika tanggal ini belum ada di mergedData, buat array untuk menyimpan tugasnya
    if (!mergedData[date]) {
      mergedData[date] = [];
    }

    // Iterasi setiap task pada tanggal tertentu
    for (const newTask of tasks) {
      if (!newTask.id || !newTask.created_at) {
        continue; // Jika task tidak memiliki id atau title, lanjutkan ke task berikutnya
      }

      // Memeriksa apakah task dengan ID yang sama sudah ada pada tanggal ini
      const existingTaskIndex = mergedData[date].findIndex(
        (task) => task.id === newTask.id,
      );

      if (existingTaskIndex === -1) {
        // Jika task dengan ID tersebut belum ada, tambahkan task baru
        mergedData[date].push(newTask);
      } else {
        // Jika sudah ada task dengan ID yang sama, gabungkan data
        const existingTask = mergedData[date][existingTaskIndex];
        mergedData[date][existingTaskIndex] = {
          ...existingTask,
          ...newTask,
          // Gabungkan sub_tasks tanpa duplikat
          sub_tasks: mergeSubTasks(existingTask.sub_tasks, newTask.sub_tasks),
        };
      }
    }
  }

  return mergedData;
};

// Fungsi untuk mengimpor data
const importTodos = (event, data) => {
  const file = event.target.files[0]; // Ambil file yang dipilih

  if (file && file.type === "application/json") {
    const reader = new FileReader();

    reader.onload = (e) => {
      const jsonData = e.target.result;
      try {
        const todosData = JSON.parse(jsonData);

        // Validasi data
        if (!validateTodoData(todosData)) {
          alert("Invalid data format.");
          return;
        }

        store.dispatch(setTasks({}));
        // Gabungkan tugas dengan tanggal yang sama
        const mergedTodos = mergeTasksByDate(todosData, data);

        store.dispatch(setTasks(mergedTodos));
        alert("Data imported successfully.");
      } catch (error) {
        console.warn("DEBUGPRINT[5]: index.tsx:438: error=", error);
        alert("Error reading JSON file.");
      }
    };

    reader.readAsText(file);
  } else {
    alert("Please upload a valid JSON file.");
  }
};

const Layout = () => {
  const todos = useAppSelector((state) => state.tasks.tasks);

  console.warn("DEBUGPRINT[25]: privacy.tsx:2: lodash=", lodash.debounce);
  React.useEffect(() => {
    load_data_daily_tasks();
    askNotificationPermission();
  }, []);

  if (!initial_data) {
    return (
      <div className="mx-auto max-w-3xl w-full h-[100vh] border-x p-2.5 sm:p-4">
        {/*<Debug data={todos} />*/}
        <TodoNavigator data={todos} />
      </div>
    );
  }
};

const Unload = ({ data }) => {
  useBeforeUnload(
    React.useCallback(() => {
      localStorage.setItem("daily-tasks", JSON.stringify(data));
    }, [data]),
  );

  return null;
};

// Fungsi untuk menghitung ukuran yang digunakan di localStorage
const getLocalStorageSize = () => {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);
    totalSize += key.length + value!.length; // Menghitung ukuran key dan value dalam byte
  }
  return totalSize; // Mengembalikan dalam byte
};

// Mengonversi ukuran dalam byte ke format yang lebih mudah dibaca (KB)
const formatSize = (sizeInBytes: number) => {
  return (sizeInBytes / 1024).toFixed(2) + " KB"; // Mengonversi byte ke KB
};

const LocalStorageProgressBar: React.FC = () => {
  const [progress, setProgress] = useState(0);

  // Maksimum kapasitas localStorage (5MB)
  const MAX_LOCAL_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB dalam byte

  // Hitung persentase penggunaan ruang setiap kali komponen dimuat
  useEffect(() => {
    const localStorageSize = getLocalStorageSize();
    const usagePercentage = (localStorageSize / MAX_LOCAL_STORAGE_SIZE) * 100;
    setProgress(usagePercentage);
  }, []); // Hanya dijalankan sekali saat komponen dimount

  return (
    <div className="col-span-2 pb-1">
      <Label>Local Storage</Label>
      <div className="mt-2">
        <div className="relative h-6 w-full rounded-md bg-muted">
          <div
            className={cn(
              "relative h-6 w-full rounded-md ",
              progress >= 90 ? "bg-destructive" : "bg-chart-2",
            )}
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
        <div className="flex gap-2 items-center justify-between mt-1">
          <Label>{formatSize(getLocalStorageSize())} / 5MB</Label>
          <Label>{progress.toFixed(2)}% terpakai</Label>
        </div>
      </div>
    </div>
  );
};

function get_formatted_date(timestamp?: number | null) {
  const currentDate = timestamp ? new Date(timestamp) : new Date();
  currentDate.setHours(0, 1, 0, 0);

  return {
    key: format(currentDate, "yyyy-MM-dd"),
    q: format(currentDate, "EEEE, dd MMM yyyy"),
    timestamp: currentDate.getTime(),
    is_today: isToday(currentDate),
    is_yesterday: isYesterday(currentDate),
    is_tomorrow: isTomorrow(currentDate),
  };
}

// Daftar warna Tailwind yang umum

import { useEffect } from "react";

const formatFocusTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hrs ${minutes} mins`;
  } else {
    return `${minutes} mins`;
  }
};

const TaskApp = ({
  todos,
  date,
  goToNextDate,
  goToPreviousDate,
  streak_data,
  all_session,
  active_task,
}) => {
  const totalTargetSessions = todos?.reduce(
    (sum, todo) => sum + todo.target_sessions,
    0,
  );

  const sessionDuration = 25 * 60 * 1000; // 25 menit
  // Fungsi untuk menghitung total sesi dari seluruh todos
  const calculateTotalSessions = (todos: Array<{ sessions: Array<any> }>) => {
    return todos.reduce(
      (total_sessions, todo) =>
        total_sessions +
          todo.sessions.filter((d) => d + sessionDuration < Date.now())
            .length || 0,
      0,
    );
  };

  const total_sessions = calculateTotalSessions(todos);
  const calculateTotalTime = (
    todos: Array<{ sessions: Array<number>; completed_at?: number }>,
  ) => {
    // Durasi sesi normal (misalnya 25 menit) dalam milidetik
    const sessionDuration = 25 * 60 * 1000; // 25 menit

    return todos.reduce((total_elapsed_time, todo) => {
      const sessionTime = todo.sessions.reduce(
        (sessionTotal, session, index, sessions) => {
          // Pastikan session time lebih besar dari Date.now()
          if (session + sessionDuration < Date.now()) {
            // Menjumlahkan durasi sesi biasa (25 menit) ke sessionTotal
            sessionTotal += sessionDuration;

            // Jika ini adalah sesi terakhir dan ada completed_at
            if (index === sessions.length - 1 && todo.completed_at) {
              const lastSessionTime = sessions[index];
              const timeDifference = todo.completed_at - lastSessionTime;

              // Jika jarak antara completed_at dan waktu sesi terakhir kurang dari durasi normal (25 menit),
              // kurangi durasi sesi terakhir
              if (timeDifference > 0 && timeDifference < sessionDuration) {
                sessionTotal -= sessionDuration - timeDifference; // Kurangi sisa waktu dari sesi terakhir
              }
            }
          }

          return sessionTotal;
        },
        0,
      );

      // Tambahkan sessionTime ke total_elapsed_time untuk semua task
      return total_elapsed_time + sessionTime;
    }, 0);
  };

  // Menghitung total waktu dari semua todo
  const total_elapsed_time = calculateTotalTime(todos);

  return (
    <div className="">
      {/*<RenderTracker name="TASK APP" stateName={totalTargetSessions} />*/}
      <section className="relative mx-auto flex items-center justify-between w-full items-center mb-4">
        <Popover>
          <PopoverTrigger className="rounded-lg lg p-1 border">
            <FocusDisplay total_sessions={total_sessions} isBtn={true} />
          </PopoverTrigger>
          <PopoverContent className="w-auto">
            <CalendarMonth total_sessions={all_session} />
          </PopoverContent>
        </Popover>
        <div className="flex-none flex items-center gap-2">
          <Link
            to="./garden"
            className={cn(
              buttonVariants({ size: "icon", variant: "secondary" }),
            )}
          >
            <Trees />
          </Link>

          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "secondary" }),
              )}
            >
              <Activity />
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0">
              <List03 tasks={todos} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger
              className={cn(
                buttonVariants({ size: "icon", variant: "secondary" }),
                "relative",
              )}
            >
              <Flame />
              <Badge className="absolute px-1.5 -top-2 -right-2">
                {streak_data?.current_streak}
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <CalendarWeek
                total_sessions={all_session}
                streak_data={streak_data}
              />
            </PopoverContent>
          </Popover>
        </div>
      </section>

      <TodoTimer todos={todos} date={date} active_task={active_task} />

      <div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] flex flex-col items-end"
        >
          <div className="flex items-center gap-x-1">{date.q}</div>
        </div>
        <div
          style={{ animationDelay: `0.1s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] ml-auto flex w-full items-center  bg-gradient-to-r from-background to-accent py-2 pr-2 mt-1 mb-2 rounded-md"
        >
          <div className="mb-1 mt-3 flex justify-end">
            <div className="text-sm md:text-sm ml-3">
              Total focus time:{" "}
              <strong>{formatFocusTime(total_elapsed_time)}</strong>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button onClick={goToPreviousDate} variant="outline" size="icon">
              <ChevronLeft />
            </Button>
            <Button onClick={goToNextDate} variant="outline" size="icon">
              <ChevronRight />
            </Button>
          </div>
        </div>

        <ProgressBarIndicator
          totalTargetSessions={totalTargetSessions}
          total_sessions={total_sessions}
          active_task={active_task}
        />
      </div>
    </div>
  );
};
const ProgressBarIndicator = ({
  totalTargetSessions,
  total_sessions,
  active_task,
}: { totalTargetSessions: number; total_sessions: number }) => {
  return (
    <React.Fragment>
      <div
        style={{ animationDelay: `0.1s` }}
        className="animate-roll-reveal [animation-fill-mode:backwards] mb-3 rounded-md transition-all duration-500 ease-in-out"
      >
        <div className="relative h-8 w-full rounded-md bg-muted">
          <div className="flex h-8 items-center justify-end gap-1 px-2">
            Max 16
            <Rocket className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden rounded-l-md backdrop-blur-md bg-primary/20 px-2 transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(totalTargetSessions > 16 ? 16 / 16 : totalTargetSessions / 16) * 100}%`,
            }}
          >
            {totalTargetSessions}
            <Crosshair className="h-5 w-5" />
          </div>
          <div
            className={cn(
              "z-10 absolute top-0 flex h-8 items-center justify-end gap-1 overflow-hidden bg-chart-2 text-primary-foreground px-2 rounded-l-md transition-all duration-500 ease-in-out",
              totalTargetSessions >= 16 && "rounded-md",
            )}
            style={{
              width: `${(total_sessions > 16 ? 16 / 16 : total_sessions / 16) * 100}%`,
            }}
          >
            <div
              className="flex shrink-0 items-center gap-1 font-medium"
              style={{ opacity: 1 }}
            >
              {totalTargetSessions >= 16 ? (
                <CircleCheckBig className="ml-2 h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
              {total_sessions} sesi
              <ArrowRight
                className={cn(
                  "h-5 w-5 ",
                  active_task && "ml-2 bounce-left-right",
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

const AddTodo = ({ date }) => {
  const dispatch = useAppDispatch();
  return (
    <Button
      onClick={() => dispatch(addTask({ key: date.timestamp }))}
      variant="link"
    >
      <Plus /> Add Task
    </Button>
  );
};

const TWENTY_FIVE_MINUTES = 25 * 60 * 1000; // 25 menit dalam milidetik
// const TWENTY_FIVE_MINUTES = 10.5 * 60 * 1000; // 25 menit dalam milidetik
const radius = 40; // Radius lingkaran
const circumference = 2 * Math.PI * radius; // Keliling lingkaran

function askNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
    return;
  }

  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
    } else {
      console.log("Notification permission denied.");
    }
  });
}

function showNotification(title: string, description: string) {
  if (Notification.permission === "granted") {
    const options: NotificationOptions = {
      body: description,
      // icon: "/path/to/icon.png",
    };
    new Notification(title, options);
  } else {
    console.log("Notification permission not granted.");
  }
}

const TodoTimer = ({
  date,
  todos,
  active_task,
}: { todos: Task[]; date: any; active_task: Task }) => {
  const dispatch = useAppDispatch();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const activeTaskRef = useRef(null);
  const FIVE_MINUTES = 5 * 60 * 1000; // 25 menit dalam milidetik
  const [break_time, set_break_time] = useState(null);
  let progress = 0;

  if (activeTaskRef.current) {
    const filter = todos.find((d) => d.id === activeTaskRef.current?.id);
    if ((filter && filter.status === "completed") || !filter) {
      const circleElement = document.getElementById("progress-circle");
      if (circleElement) {
        circleElement.setAttribute("stroke-dashoffset", "0");
      }

      const timerFields = document.querySelectorAll(".todo-progress");
      for (const timerField of timerFields) {
        if (timerField instanceof HTMLDivElement) {
          timerField.innerHTML = "00:00";
        }
      }
      activeTaskRef.current = null;
    }
  }

  useEffect(() => {
    const task = active_task;
    const sessions_length = task?.sessions?.length > 0;
    if (active_task && sessions_length) {
      const last_start = sessions_length
        ? task.sessions[task.sessions.length - 1]
        : null;

      if (!timerRef.current && last_start) {
        timerRef.current = setInterval(() => {
          const lastStartDate = new Date(last_start);

          // Dapatkan waktu sekarang dalam milidetik
          const currentTime = Date.now();

          // Hitung selisih waktu (total waktu yang telah berlalu dalam milidetik)
          const updatedTotalTime = currentTime - lastStartDate.getTime();

          progress = Math.min(
            (updatedTotalTime / TWENTY_FIVE_MINUTES) * circumference,
            circumference,
          );

          const timer = new Date(updatedTotalTime).toISOString().substr(14, 5);

          // Update DOM manually
          const circleElement = document.getElementById("progress-circle");
          if (circleElement) {
            circleElement.setAttribute(
              "stroke-dashoffset",
              (circumference - progress).toString(),
            );
          }

          const timerFields = document.querySelectorAll(".todo-progress");
          for (const timerField of timerFields) {
            if (timerField instanceof HTMLDivElement) {
              timerField.innerHTML = timer;
            }
          }

          document.title = `${timer} ${active_task.title ? active_task.title.slice(0, 10) : "Untitled"}`;

          if (updatedTotalTime >= TWENTY_FIVE_MINUTES) {
            activeTaskRef.current = active_task;
            clearInterval(timerRef.current);

            const notif = {
              title: "Saatnya istirahat",
              description:
                "Sesion " +
                (active_task.sessions.length + 1) +
                " has completed",
            };
            showNotification(notif.title, notif.description);

            dispatch(
              updateTask({
                id: active_task.id,
                key: date.timestamp,
                updated_task: {
                  status: "pending",
                },
              }),
            );
          }
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    }

    if (break_time) {
      const container_task = document.getElementById("container-task");
      const container_break_time = document.getElementById(
        "container-break-time",
      );
      timerRef.current = setInterval(() => {
        const updatedTotalTime = Date.now() - break_time;

        progress = Math.min(
          (updatedTotalTime / FIVE_MINUTES) * circumference,
          circumference,
        );

        const timer = new Date(updatedTotalTime).toISOString().substr(14, 5);

        // Update DOM manually

        if (
          container_task instanceof HTMLDivElement &&
          container_task instanceof HTMLDivElement
        ) {
          container_break_time.style.display = "flex";
          container_task.style.display = "none";
        }
        const circleElement = document.getElementById("progress-circle");
        if (circleElement) {
          circleElement.setAttribute(
            "stroke-dashoffset",
            (circumference - progress).toString(),
          );
        }

        const timerFields = document.querySelectorAll(".todo-progress");
        for (const timerField of timerFields) {
          if (timerField instanceof HTMLDivElement) {
            timerField.innerHTML = timer;
          }
        }

        document.title = `${timer} Break`;

        if (updatedTotalTime >= FIVE_MINUTES) {
          clearInterval(timerRef.current);
          set_break_time(null);

          if (
            container_task instanceof HTMLDivElement &&
            container_task instanceof HTMLDivElement
          ) {
            container_break_time.style.display = "none";
            container_task.style.display = "block";
          }
          const notif = {
            title: "Istirahat Selesai",
            description: "Saatnya lanjut",
          };
          showNotification(notif.title, notif.description);
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        document.title = "Todo";
      }
    };
  }, [break_time, active_task]); // Make sure the effect reruns when active_task changes

  return (
    <div className="flex items-start justify-between gap-x-3 px-4 md:gap-x-5 h-[110px]">
      <div className="flex items-start gap-6 md:gap-8">
        <div
          style={{ animationDelay: `0.05s` }}
          className="animate-roll-reveal [animation-fill-mode:backwards] w-[90px] rounded-full bg-secondary/50 dark:bg-muted"
        >
          <div className="relative">
            <div className="absolute flex h-full w-full justify-center">
              <div className="flex flex-col justify-center items-center">
                {break_time ? (
                  <Coffee className="text-chart-1" />
                ) : (
                  (active_task || activeTaskRef.current) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`[&_svg]:size-6 transition-all duration-500 ease-in-out animate-roll-reveal [animation-fill-mode:backwards] z-10 mx-auto p-0 rounded-full`}
                      onClick={
                        active_task
                          ? () => {
                              const last_session_index =
                                active_task?.sessions?.length - 1;
                              const last_session =
                                active_task?.sessions[last_session_index];

                              dispatch(
                                updateSessionTask({
                                  id: active_task.id,
                                  key: date.timestamp,
                                  updated_session_task: {
                                    id: last_session,
                                  },
                                }),
                              );

                              const circleElement =
                                document.getElementById("progress-circle");
                              if (circleElement) {
                                circleElement.setAttribute(
                                  "stroke-dashoffset",
                                  "0",
                                );
                              }

                              const timerFields =
                                document.querySelectorAll(".todo-progress");
                              for (const timerField of timerFields) {
                                if (timerField instanceof HTMLDivElement) {
                                  timerField.innerHTML = "00:00";
                                }
                              }
                              activeTaskRef.current = null;
                            }
                          : () => {
                              dispatch(
                                updateSessionTask({
                                  id: activeTaskRef.current?.id,
                                  key: date.timestamp,
                                  updated_session_task: {
                                    id: new Date().toISOString(),
                                  },
                                }),
                              );
                            }
                      }
                      style={{ animationDelay: `0.1s` }}
                    >
                      {active_task ? (
                        <Pause
                          style={{ animationDelay: `0.3s` }}
                          className={cn(
                            active_task &&
                              "animate-roll-reveal [animation-fill-mode:backwards]",
                          )}
                        />
                      ) : (
                        activeTaskRef.current && (
                          <Play
                            className={cn(
                              !activeTaskRef.current &&
                                "animate-slide-top [animation-fill-mode:backwards]",
                            )}
                          />
                        )
                      )}
                    </Button>
                  )
                )}
                <div
                  style={{ animationDelay: `0.1s` }}
                  className="animate-roll-reveal [animation-fill-mode:backwards] todo-progress mx-auto flex justify-center font-medium transition-all duration-500 ease-in-out"
                >
                  00:00
                </div>
              </div>
            </div>
            <div
              style={{ animationDelay: `0.1s` }}
              className={cn(
                "animate-roll-reveal [animation-fill-mode:backwards] text-chart-2",
                break_time ? "text-chart-1" : "text-chart-2",
              )}
            >
              <svg
                width={90}
                height={90}
                xmlns="http://www.w3.org/2000/svg"
                className="-rotate-90"
              >
                {/* Background Circle */}
                <circle
                  cx={45}
                  cy={45}
                  r={40}
                  fill="none"
                  className="stroke-secondary dark:stroke-background"
                  strokeWidth={6}
                  strokeDasharray="251.32741228718345"
                />

                {/* Progress Circle */}
                <circle
                  id="progress-circle"
                  cx={45}
                  cy={45}
                  r={40}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={6}
                  strokeDasharray="251.32741228718345"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-in-out "
                />
              </svg>
            </div>
          </div>
        </div>

        {active_task && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              {active_task?.title !== "" ? (
                <div dangerouslySetInnerHTML={{ __html: active_task.title }} />
              ) : (
                "Untitled"
              )}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => {
                  const active = active_task?.sessions?.length - 1;

                  return (
                    <div className="relative inline-flex gap-1" key={index}>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                          active >= index
                            ? "bg-chart-2"
                            : active_task?.target_sessions >= index
                              ? "bg-primary/30"
                              : active_task.status === "progress" &&
                                  active_task === index
                                ? "bg-chart-1"
                                : "bg-muted hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                      {active === index && (
                        <React.Fragment>
                          <div className="w-3 h-3 bg-chart-1 rounded-full absolute -top-0.5 left-0 animate-ping" />
                          <div className="w-2.5 h-2.5 bg-chart-1 rounded-full absolute top-0 left-0 animate-pulse" />
                        </React.Fragment>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1">
              {active_task?.sessions?.length} dari{" "}
              {active_task?.target_sessions} target sesi
            </div>
            <div className="mt-2 flex w-full flex-col gap-2 pr-14 md:flex-row md:items-center md:pr-0">
              <Button
                className="bg-chart-2 hover:bg-chart-2/90"
                onClick={() => {
                  const todo = active_task as Task;
                  const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);

                  dispatch(
                    updateTask({
                      id: active_task.id,
                      key: date.timestamp,
                      updated_task: {
                        title: active_task.title,
                        status: "completed",
                        completed_at: new Date().toISOString(),
                      },
                    }),
                  );
                }}
              >
                <CircleCheckBig />
                Mark as Done
              </Button>
              <button className="hidden items-center justify-center font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-md flex h-auto gap-1 p-1 py-1 bg-transparent text-foreground hover:bg-red-600 hover:text-white">
                <div className="mr-1 px-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={18}
                    height={18}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-ban"
                  >
                    <circle cx={12} cy={12} r={10} />
                    <path d="m4.9 4.9 14.2 14.2" />
                  </svg>
                </div>
                Cancel
              </button>
            </div>
          </div>
        )}
        {!break_time && activeTaskRef.current && !active_task && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              {activeTaskRef.current?.title !== "" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: activeTaskRef.current.title,
                  }}
                />
              ) : (
                "Untitled"
              )}
            </div>

            <div className="h-2.5">
              <div className="absolute flex gap-1">
                {new Array(16).fill(null).map((_, index) => {
                  const active = activeTaskRef.current?.sessions?.length;

                  return (
                    <div className="relative inline-flex gap-1" key={index}>
                      <div
                        className={cn(
                          "h-2.5 w-2.5 shrink-0 cursor-pointer rounded-full ",
                          active >= index + 1
                            ? "bg-chart-2"
                            : activeTaskRef.current?.target_sessions >=
                                index + 1
                              ? "bg-primary/30"
                              : activeTaskRef.current.status === "progress" &&
                                  activeTaskRef.current === index
                                ? "bg-chart-1"
                                : "bg-muted hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-1">
              {activeTaskRef.current?.sessions?.length} dari{" "}
              {activeTaskRef.current?.target_sessions} target sesi
            </div>
            <div className="mt-2 flex w-full flex-col gap-2 pr-14 md:flex-row md:items-center md:pr-0">
              <Button
                className="bg-chart-2 hover:bg-chart-2/90"
                onClick={() => {
                  const todo = activeTaskRef.current as Task;
                  const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                  const notif = {
                    title: "Saatnya istirahat",
                    description:
                      "Sesion " + (sessionData.length + 1) + " has completed",
                  };
                  showNotification(notif.title, notif.description);
                  dispatch(
                    updateTask({
                      id: activeTaskRef.current.id,
                      key: date.timestamp,
                      updated_task: {
                        title: activeTaskRef.current.title,
                        status: "completed",
                        completed_at: new Date().toISOString(),
                      },
                    }),
                  );
                }}
              >
                <CircleCheckBig />
                Mark as Done
              </Button>
              <Button
                onClick={() => set_break_time(Date.now())}
                variant="destructive"
              >
                <Coffee /> 5 mins
              </Button>
            </div>
          </div>
        )}
        {break_time && (
          <div
            style={{ animationDelay: `0.05s` }}
            className="animate-roll-reveal [animation-fill-mode:backwards] relative w-full"
          >
            <div className="font-bold md:text-xl line-clamp-1 max-w-[250px]">
              Nikmati istirahatmu!
            </div>

            <div className="mt-1">Lupakan sejenak tasks yang ada, relax!</div>
          </div>
        )}
      </div>
    </div>
  );
};

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isYesterday,
  isTomorrow,
  isWeekend,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
  subWeeks,
} from "date-fns";

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
            const sessions = total_sessions[dataKey] || 0;
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
                    <FocusDisplay total_sessions={sessions} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full max-w-[240px] rounded bg-gray-50 p-5 dark:bg-gray-800">
          <div className="">Perisai fokus</div>
          <hr className="my-3" />
          <FocusList />
        </div>
      </div>
    </div>
  );
};

const CalendarWeek = ({ total_sessions, streak_data }) => {
  const [daysInMonth, setDaysInMonth] = useState([]);

  // Fungsi untuk memperbarui kalender

  const updateCalendar = () => {
    // Tanggal hari ini
    const today = new Date();

    // Awal dan akhir minggu ini
    const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 }); // Senin sebagai awal minggu
    const endOfThisWeek = endOfWeek(today, { weekStartsOn: 1 });

    // Awal dan akhir minggu lalu
    const startOfLastWeek = startOfWeek(subWeeks(today, 1), {
      weekStartsOn: 1,
    });
    const endOfLastWeek = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

    // Mengambil semua hari dari minggu lalu dan minggu ini
    const lastWeekDays = eachDayOfInterval({
      start: startOfLastWeek,
      end: endOfLastWeek,
    });

    const thisWeekDays = eachDayOfInterval({
      start: startOfThisWeek,
      end: endOfThisWeek,
    });

    // Gabungkan minggu lalu dan minggu ini
    const twoWeeksDays = [...lastWeekDays, ...thisWeekDays];

    // Update state dengan 2 minggu tersebut
    setDaysInMonth(twoWeeksDays);
  };

  // Update kalender saat currentMonth berubah
  useEffect(() => {
    updateCalendar();
  }, []);

  return (
    <div className="bg-background">
      <div className="flex gap-10">
        <div>
          <div className="flex items-center py-5">
            <div>
              <div className="text-xl">
                {streak_data?.current_streak} day streak
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-400">
                Your longest streak is {streak_data?.longest_streak} days
              </div>
            </div>
            <div className="ml-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={84}
                height={84}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-flame-kindling text-orange-400"
              >
                <path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a2 2 0 1 0 3.3-2C8 4.5 11 2 12 2Z" />
                <path d="m5 22 14-4" />
                <path d="m5 18 14 4" />
              </svg>
            </div>
          </div>
          <div className="grid grid-cols-7 justify-center gap-5 rounded-lg bg-orange-400 p-2 px-3 text-white">
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>Su</div>

            {daysInMonth.map((day, index) => {
              const dataKey = day ? format(day, "yyyy-MM-dd") : null;
              const sessions = total_sessions[dataKey] || 0;
              const isNow = new Date() >= day;

              const _day = day ? format(day, "d") : "";
              return (
                <React.Fragment key={index}>
                  <div className="group flex flex-col items-center gap-y-2 relative transition-all duration-500 ease-in-out">
                    <div
                      key={index}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full",
                        sessions > 0
                          ? " bg-green-500 text-white"
                          : " bg-red-500 text-white",
                        isWeekend(day) && sessions === 0
                          ? " bg-gray-300 text-black"
                          : isWeekend(day) && sessions > 0
                            ? "bg-green-600 text-white"
                            : "",
                        !isNow && " bg-background text-foreground",
                      )}
                    >
                      <span className="group-hover:block hidden">{_day}</span>
                      {isNow && (
                        <span className="group-hover:hidden">
                          {sessions > 0 ? <Check /> : <X />}
                        </span>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="mt-2 text-gray-500 dark:text-gray-400">
            *Weekend is not affecting streak calculation
          </div>
        </div>
      </div>
    </div>
  );
};

const FocusDisplay = ({ total_sessions, isBtn }) => {
  return <div>{getFocusComponent(total_sessions, isBtn)}</div>;
};

const focusSessions = [
  {
    minFocus: 16,
    sessions: "≥ 16 sesi fokus",
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
    minFocus: 12,
    sessions: "≥ 12 sesi fokus",
    styles: {
      outerBorder: "border-blue-500 bg-gradient-to-r from-blue-500 to-blue-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 4,
    sessions: "≥ 4 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder:
        "border-white bg-gradient-to-r from-yellow-300 to-yellow-100",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 1,
    sessions: "≥ 1 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder:
        "border-green-500 bg-gradient-to-r from-green-500 to-green-300",
    },
  },
  {
    minFocus: 0,
    sessions: "0 sesi fokus",
    styles: {
      outerBorder: "border-gray-300",
      middleBorder: "border-gray-300",
      innerBorder: "border-gray-300",
    },
  },
];

const getFocusComponent = (focusValue, isBtn) => {
  // Cari data yang cocok berdasarkan nilai fokus
  const focusData = focusSessions.find((item) => focusValue >= item.minFocus);

  // Jika tidak ada data yang cocok, return null (atau fallback)
  if (!focusData) return null;

  if (isBtn)
    return (
      <div className="flex items-center gap-2 ">
        <div>
          <div
            className={`shrink-0 rounded-full border-2 p-1 ${focusData.styles.outerBorder} transition-all duration-500 ease-in-out`}
          >
            <div
              className={`rounded-full border-2 p-1 ${focusData.styles.middleBorder} transition-all duration-500 ease-in-out`}
            >
              <div
                className={`rounded-full border-2 h-1.5 w-1.5 ${focusData.styles.innerBorder} transition-all duration-500 ease-in-out`}
              />
            </div>
          </div>
        </div>
      </div>
    );
  // Return JSX sesuai gaya yang ditemukan
  return (
    <div className="flex items-center gap-2">
      <div>
        <div
          className={`shrink-0 rounded-full border-2 p-1.5 ${focusData.styles.outerBorder}`}
        >
          <div
            className={`rounded-full border-2 p-1.5 ${focusData.styles.middleBorder}`}
          >
            <div
              className={`rounded-full border-2 h-2 w-2 ${focusData.styles.innerBorder}`}
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
      {focusSessions.map((item, index) => (
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
          <div>{item.sessions}</div>
        </div>
      ))}
    </div>
  );
};

type WeeklyBadgeProps = {
  total_sessions: number; // Total sesi minggu ini
};

const WeeklyBadge: React.FC<WeeklyBadgeProps> = ({ total_sessions }) => {
  // Tentukan tingkat lencana berdasarkan sesi
  const getBadgeData = (sessions: number) => {
    if (sessions >= 48) {
      return {
        label: "Master Fokus",
        color: "from-red-500 to-red-700",
        emoji: "🔥",
      };
    } else if (sessions >= 40) {
      return {
        label: "Ahli Fokus",
        color: "from-orange-500 to-orange-600",
        emoji: "🚀",
      };
    } else if (sessions >= 32) {
      return {
        label: "Pro Fokus",
        color: "from-yellow-500 to-yellow-600",
        emoji: "🌟",
      };
    } else if (sessions >= 24) {
      return {
        label: "Fokus Tinggi",
        color: "from-green-500 to-green-600",
        emoji: "💪",
      };
    } else if (sessions >= 16) {
      return {
        label: "Fokus Bagus",
        color: "from-blue-500 to-blue-600",
        emoji: "🎯",
      };
    } else if (sessions >= 8) {
      return {
        label: "Awal Fokus",
        color: "from-purple-500 to-purple-600",
        emoji: "✨",
      };
    } else {
      return {
        label: "Mulai Fokus",
        color: "from-gray-400 to-gray-500",
        emoji: "🌀",
      };
    }
  };

  const { label, color, emoji } = getBadgeData(total_sessions);

  return (
    <div
      className={`flex-shrink-0 relative overflow-hidden bg-gradient-to-r ${color} rounded-lg w-full max-w-[250px] mx-auto shadow-lg`}
    >
      <svg
        className="absolute bottom-0 left-0 mb-8"
        viewBox="0 0 375 283"
        fill="none"
        style={{ transform: "scale(1.5)", opacity: "0.1" }}
      >
        <rect
          x="159.52"
          y={175}
          width={152}
          height={152}
          rx={8}
          transform="rotate(-45 159.52 175)"
          fill="white"
        />
        <rect
          y="107.48"
          width={152}
          height={152}
          rx={8}
          transform="rotate(-45 0 107.48)"
          fill="white"
        />
      </svg>
      <div className="relative pt-10 px-10 flex items-center justify-center">
        <div
          className="block absolute w-48 h-48 bottom-0 left-0 -mb-24 ml-3"
          style={{
            background: "radial-gradient(black, transparent 60%)",
            transform: "rotate3d(0, 0, 1, 20deg) scale3d(1, 0.6, 1)",
            opacity: "0.2",
          }}
        />
        {/* Icon */}
        <div className="relative mb-4 ">
          <div
            className={`absolute inset-0 animate-pulse bg-gradient-to-r ${color} rounded-full blur-lg opacity-75`}
          ></div>
          <div
            className={`relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-b ${color} p-4 shadow-xl ring ring-gray-200`}
          >
            <span className="text-4xl">{emoji}</span>
          </div>
        </div>
      </div>
      <div className="relative text-white px-6 pb-6 mt-6 w-[200px]">
        <span className="block opacity-75 -mb-1">{label}</span>
        <div className="flex justify-between">
          <span className="block font-semibold text-xl">
            {total_sessions} sesi hari ini
          </span>
        </div>
        <div className="relative w-full bg-gray-200 dark:bg-gray-700 h-4 rounded-full overflow-hidden mt-4">
          <div
            className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full"
            style={{ width: `${(total_sessions / 48) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

function List03({ tasks }) {
  const flattenedSubTasks = tasks.flatMap((task) => task.sub_tasks);
  const subtask_checked = flattenedSubTasks.filter((d) => d.checked).length;
  const date = new Date();
  const formattedDate = format(date, "MMMM dd, yyyy"); // Format menjadi "June 12, 2024"
  return (
    <div className={cn("w-full max-w-xl mx-auto")}>
      <div className="p-4 flex items-center gap-x-2 justify-between border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Today's Tasks
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {formattedDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {subtask_checked}/{flattenedSubTasks.length} done
          </span>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {flattenedSubTasks
          .filter((d) => d.checked)
          .map((d) => (
            <div key={d.id} className="p-3 flex items-center gap-3 group">
              <button type="button" className="flex-none">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-400 dark:text-zinc-500 line-through">
                  {d.title !== "" ? d.title : "Untitled"}
                </p>
              </div>
            </div>
          ))}
        {flattenedSubTasks
          .filter((d) => !d.checked)
          .map((d) => (
            <div key={d.id} className="p-3 flex items-center gap-3 group">
              <button type="button" className="flex-none">
                <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100">
                    {d.title !== "" ? d.title : "Untitled"}
                  </p>
                  {/*<Flag className="w-3.5 h-3.5 text-rose-500" />*/}
                </div>
                {/*<div className="flex items-center gap-0.5 mt-1">
                  <Squircle
                    className="w-4 h-4"
                    fill={d.category.color}
                    color={d.category.color}
                  />
                  <Label className="text-sm">{d.category.label}</Label>
                </div>*/}
              </div>
              <button
                type="button"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

function SelectFilter({ data, date, setValue, tasks }) {
  const taskCategories = [
    { label: "Urgent", color: "#e11d48" },
    { label: "High Priority", color: "#f97316" },
    { label: "Medium Priority", color: "#f59e0b" },
    { label: "Low Priority", color: "#6ee7b7" },
    { label: "Personal", color: "#4ade80" },
    { label: "Work", color: "#0284c7" },
    { label: "Important Meetings", color: "#2563eb" },
    { label: "Research", color: "#4f46e5" },
    { label: "Creative", color: "#7c3aed" },
    { label: "Review", color: "#9d4edd" },
    { label: "Reports", color: "#c026d3" },
    { label: "Follow-up", color: "#d946ef" },
    { label: "General", color: "#9ca3af" },
    { label: "Team Collaboration", color: "#f472b6" },
    { label: "Client", color: "#fb923c" },
    { label: "Training", color: "#fbbf24" },
    { label: "Deadline", color: "#a3e635" },
    { label: "Admin", color: "#38bdf8" },
    { label: "Development", color: "#9333ea" },
    { label: "Miscellaneous", color: "#1e3a8a" },
  ];
  // Menggabungkan colorCount dengan taskCategories

  const colorCount = tasks.reduce((acc, task) => {
    const color = task.category?.color;
    if (color) {
      acc[color] = (acc[color] || 0) + 1; // Menambahkan count untuk warna yang sama
    }
    return acc;
  }, {});
  const mergedCategories = taskCategories
    .map((category) => {
      const count = colorCount[category.color]; // Ambil count berdasarkan warna
      if (count) {
        return { ...category, count }; // Menambahkan count ke kategori jika ada
      }
      return null; // Jika count 0, kembalikan null
    })
    .filter(Boolean); // Menghapus semua kategori yang bernilai null (yang tidak memiliki count)

  return (
    <div className="flex items-center w-full justify-between mb-2">
      {(date.is_today || date.is_tomorrow) && <AddTodo date={date} />}
      <div className="flex items-center gap-x-2">
        <Popover>
          <PopoverTrigger>
            <Info className="w-4 h-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4">
            <div className="grid gap-2">
              <label
                htmlFor="upload-file"
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                <Upload /> Import
                <input
                  id="upload-file"
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={(e) => importTodos(e, data)}
                />
              </label>

              <Button variant="outline" onClick={() => exportTodos(data)}>
                <Download /> Export
              </Button>

              <LocalStorageProgressBar />
            </div>
          </PopoverContent>
        </Popover>

        <ComboboxPopoverFilter data={mergedCategories} handler={setValue} />
      </div>
    </div>
  );
}

interface MainTaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export type TaskType = "Task";

export interface TaskDragData {
  type: TaskType;
  task: Task;
}

const MainTaskCard = React.memo(
  ({
    index,
    date,
    active_task,
    task,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    totalTargetSessions,
  }: MainTaskCardProps) => {
    const todo = task;

    const sessionDuration = 25 * 60 * 1000; // 25 menit
    const totalSessionTime = todo.sessions.reduce(
      (sessionTotal, session, index, sessions) => {
        // Pastikan session time lebih besar dari Date.now()
        if (session + sessionDuration < Date.now()) {
          // Menjumlahkan durasi sesi biasa (25 menit) ke sessionTotal
          sessionTotal += sessionDuration;

          // Jika ini adalah sesi terakhir dan ada completed_at
          if (index === sessions.length - 1 && todo.completed_at) {
            const lastSessionTime = sessions[index];
            const timeDifference = todo.completed_at - lastSessionTime;

            // Jika jarak antara completed_at dan waktu sesi terakhir kurang dari durasi normal (25 menit),
            // kurangi durasi sesi terakhir
            if (timeDifference > 0 && timeDifference < sessionDuration) {
              sessionTotal -= sessionDuration - timeDifference; // Kurangi sisa waktu dari sesi terakhir
            }
          }
        }

        return sessionTotal;
      },
      0,
    );

    const is_today = date.is_today;
    const dispatch = useAppDispatch();

    return (
      <Collapsible
        {...(active_task ? { open: active_task.id === task.id } : {})}
        defaultOpen={active_task?.id === task?.id ? true : false}
      >
        <div
          draggable
          onDragStart={(event) => handleDragStart(event, index)}
          onDragEnd={(event) => handleDragEnd(event, index)}
          onDragOver={handleDragOver}
          onDrop={(event) => handleDrop(event, index)}
          className={cn(
            "relative flex items-start overflow-hidden mb-2 rounded-md",
            active_task && todo.status !== "progress"
              ? "text-muted-foreground bg-muted/20 blur-sm transition-all duration-300"
              : active_task && todo.status === "progress"
                ? "shadow-md shadow-chart-2"
                : todo.status === "completed"
                  ? ""
                  : "",
          )}
        >
          <div
            className={cn(
              "rounded-md border bg-card text-card-foreground w-full",
              active_task &&
                todo.status === "progress" &&
                "border-2 border-chart-2",
            )}
          >
            <div
              className={cn(
                "p-6 px-3 py-1.5 space-between flex gap-4 items-center flex-row border-b-2 border-secondary relative rounded-t-md",
                active_task && todo.status === "progress"
                  ? " bg-gradient-to-r from-accent to-muted"
                  : " bg-gradient-to-l from-background to-secondary",
                todo.status === "completed" &&
                  " bg-gradient-to-r from-background to-chart-2/40",
              )}
            >
              <div className="flex items-center gap-x-2">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="ml-auto flex items-center">
                {todo.sub_tasks.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <Badge
                      className="flex flex-1 border-none items-center gap-1 justify-between font-medium transition-all text-left [&[data-state=close]>svg.chev]:block [&[data-state=open]>svg.cross]:block [&[data-state=open]>svg.chev]:hidden"
                      variant="outline"
                    >
                      <ChevronsUpDown className="chev h-4 w-4 shrink-0 transition-all duration-200" />
                      <X className="cross hidden h-4 w-4 shrink-0 transition-all duration-200" />
                      <span>{todo.sub_tasks.length}</span>
                    </Badge>
                  </CollapsibleTrigger>
                )}
                <DropdownMenuTask
                  todo={todo}
                  date={date}
                  active_task={active_task}
                />
              </div>
            </div>
            <div className="p-2 relative rounded-b-md">
              {todo.status === "completed" && (
                <CircleCheckBig className="absolute top-0 -right-4 w-28 h-28 text-chart-2 dark:text-chart-2 opacity-40" />
              )}
              <div className="flex items-start gap-1 px-1">
                {is_today ? (
                  <React.Fragment>
                    {todo.status === "completed" ? (
                      <CircleCheckBig className="w-6 h-6 text-chart-2 rounded-full" />
                    ) : todo.status === "progress" ? (
                      <button
                        onClick={() => {
                          const last_session_index =
                            active_task?.sessions?.length - 1;
                          const last_session =
                            active_task?.sessions[last_session_index];

                          dispatch(
                            updateSessionTask({
                              id: active_task.id,
                              key: date.timestamp,
                              updated_session_task: {
                                id: last_session,
                              },
                            }),
                          );

                          const circleElement =
                            document.getElementById("progress-circle");
                          if (circleElement) {
                            circleElement.setAttribute(
                              "stroke-dashoffset",
                              "0",
                            );
                          }

                          const timerFields =
                            document.querySelectorAll(".todo-progress");
                          for (const timerField of timerFields) {
                            if (timerField instanceof HTMLDivElement) {
                              timerField.innerHTML = "00:00";
                            }
                          }
                        }}
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground",
                          active_task &&
                            "animate-roll-reveal [animation-fill-mode:backwards]",
                        )}
                      >
                        <Pause className="h-5 w-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            dispatch(
                              updateSessionTask({
                                id: todo.id,
                                key: date.timestamp,
                                updated_session_task: {
                                  id: new Date().toISOString(),
                                },
                              }),
                            );
                          }}
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary pl-0.5 text-primary-foreground",
                            active_task &&
                              "animate-roll-reveal [animation-fill-mode:backwards]",
                          )}
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </React.Fragment>
                ) : (
                  <button
                    onClick={() => {
                      dispatch(copyTask({ id: task.id, key: date.timestamp }));

                      toast({
                        title: "Added in today",
                        description: `The task has been successfully added in today.`,
                      });
                    }}
                    className="h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-500 "
                  >
                    <ArrowRight />
                  </button>
                )}

                <AutosizeTextarea
                  key={`title-${todo.id}`}
                  name="title"
                  defaultValue={todo.title}
                  onBlur={(e) => {
                    dispatch(
                      updateTask({
                        id: task.id,
                        key: date.timestamp,
                        updated_task: {
                          title: e.target.value,
                        },
                      }),
                    );
                  }}
                  style={{ resize: "none" }}
                  className="py-0.5 px-1.5 w-full bg-transparent outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
                  maxHeight={800}
                  placeholder="Untitled"
                  autoComplete="off"
                />
              </div>
              <div className="w-full group px-2">
                <div className="relative block py-0.5 ">
                  <div className="flex items-end">
                    <div className="flex items-center justify-start gap-1 h-4">
                      {new Array(16).fill(null).map((_, index) => {
                        const active = task?.sessions?.length - 1;

                        return (
                          <div
                            className="relative inline-flex gap-1"
                            key={index}
                          >
                            <button
                              onClick={() => {
                                const total = index + 1 + totalTargetSessions;
                                if (total > 16)
                                  return toast.error("Maximal 16 Session");
                                dispatch(
                                  updateTask({
                                    id: task.id,
                                    key: date.timestamp,
                                    updated_task: {
                                      title: todo.title,
                                      target_sessions: index + 1,
                                    },
                                  }),
                                );
                              }}
                              type="button"
                              style={{ animationDelay: `${index * 0.03}s` }}
                              className={cn(
                                "h-[12px] w-[12px] shrink-0 cursor-pointer rounded-full ",
                                active >= index
                                  ? "bg-chart-2"
                                  : todo?.target_sessions >= index
                                    ? "bg-primary/30"
                                    : todo.status === "progress" &&
                                        active === index
                                      ? "bg-chart-1"
                                      : "bg-muted hover:bg-primary/50 duration-300 hidden group-hover:block transition-all duration-300 animate-roll-reveal [animation-fill-mode:backwards] ",
                              )}
                            />

                            {todo.status === "progress" && active === index && (
                              <React.Fragment>
                                <div className="w-3 h-3 bg-chart-1 rounded-full absolute top-0 left-0 animate-ping" />
                                <div className="h-[12px] w-[12px]  bg-chart-1 rounded-full absolute top-0 left-0 animate-pulse" />
                              </React.Fragment>
                            )}
                          </div>
                        );
                      })}

                      <button
                        style={{ animationDelay: `${16 * 0.03}s` }}
                        onClick={() => {
                          dispatch(
                            updateTask({
                              id: task.id,
                              key: date.timestamp,
                              updated_task: {
                                title: todo.title,
                                target_sessions: 0,
                              },
                            }),
                          );
                        }}
                        className="h-3 w-3 shrink-0 cursor-pointer rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hidden group-hover:flex  animate-roll-reveal [animation-fill-mode:backwards] "
                      >
                        <X />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-x-1.5 mt-1.5 justify-between">
                    <div className="flex items-center gap-x-1.5">
                      {task.status !== "progress" &&
                        task.sessions.length > 0 && (
                          <Popover>
                            <PopoverTrigger>
                              <History className="w-4 h-4 text-muted-foreground" />
                            </PopoverTrigger>
                            <PopoverContent className="max-h-[40vh] overflow-y-auto py-0">
                              <TimelineInfo
                                sessions={task.sessions}
                                completed_at={task.completed_at}
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      <div className="text-sm">
                        {new Date(totalSessionTime).toISOString().substr(11, 8)}
                      </div>
                    </div>
                    <ComboboxPopover task={task} date={date} />
                  </div>
                  {!is_today && (
                    <div className="flex">
                      <button
                        onClick={() => {
                          dispatch(
                            copyTask({ id: task.id, key: date.timestamp }),
                          );

                          toast({
                            title: "Added in today",
                            description: `The task has been successfully added in today.`,
                          });
                        }}
                        className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-sm hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 "
                      >
                        Move to today <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {todo.sub_tasks.length > 0 && (
          <div>
            <CollapsibleContent className="space-y-2 text-text font-base mt-1">
              <DragDropListSubTask
                task={task}
                sub_tasks={todo.sub_tasks}
                date={date}
                active_task={active_task}
              />
            </CollapsibleContent>
          </div>
        )}
      </Collapsible>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.task) === JSON.stringify(nextProps.task) &&
      JSON.stringify(prevProps.active_task) ===
        JSON.stringify(nextProps.active_task)
    );
  },
);

const SubTaskComponentCard = React.memo(
  ({
    index,
    subtask,
    date,
    active_task,
    task,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  }) => {
    const todo = task;
    const dispatch = useAppDispatch();

    return (
      <div
        draggable
        onDragStart={(event) => handleDragStart(event, index)}
        onDragEnd={(event) => handleDragEnd(event, index)}
        onDragOver={handleDragOver}
        onDrop={(event) => handleDrop(event, index)}
        className={cn(
          "group relative flex items-start overflow-hidden p-2 mb-1.5 rounded-md border",
          active_task && todo.status !== "progress"
            ? "text-muted-foreground opacity-80"
            : active_task && todo.status === "progress"
              ? "border-2 border-chart-2 shadow-md shadow-chart-2"
              : subtask.checked
                ? ""
                : "opacity-100",
        )}
      >
        {subtask.checked && (
          <CircleCheckBig className="absolute top-0 -right-4 w-16 h-16 text-green-500 dark:text-green-400 opacity-30" />
        )}
        <div className="w-full">
          <div className="relative flex w-full items-start gap-2">
            <GripVertical className="w-5 h-5" />
            <input
              type="hidden"
              defaultValue={subtask.id}
              key={`sub_tasks[${index}].id`}
              name={`sub_tasks[${index}].id`}
              id={`sub_tasks[${index}].id`}
            />
            <input
              type="checkbox"
              defaultChecked={subtask.checked}
              onChange={(e) => {
                dispatch(
                  updateSubTask({
                    id: task.id,
                    key: date.timestamp,
                    sub_task_id: subtask.id,
                    updated_sub_task: {
                      title: subtask.title,
                      checked: e.target.checked,
                      completed_at: e.target.checked ? Date.now() : null,
                    },
                  }),
                );
              }}
              className="accent-chart-2 scale-[125%] translate-y-1"
              key={`sub_tasks[${index}].checked`}
              name={`sub_tasks[${index}].checked`}
              id={`sub_tasks[${index}].checked`}
            />
            <AutosizeTextarea
              defaultValue={subtask.title}
              key={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
              name={`sub_tasks[${index}].title`} // Dinamis berdasarkan index
              id={`sub_tasks[${index}].title`} // Dinamis ber
              onBlur={(e) => {
                dispatch(
                  updateSubTask({
                    id: task.id,
                    key: date.timestamp,
                    sub_task_id: subtask.id,
                    updated_sub_task: {
                      title: e.target.value,
                    },
                  }),
                );
              }}
              style={{ resize: "none" }}
              className="w-full bg-transparent py-0 px-1 outline-none text-md border-none focus-visible:ring-offset-0 focus-visible:ring-0 outline-none"
              maxHeight={800}
              minHeight={20}
              placeholder="Untitled"
              autoComplete="off"
            />
            <div className="ml-auto flex items-center">
              <DropdownMenuSubTask
                task_id={task.id}
                sub_task_id={subtask.id}
                task_title={todo.title}
                sub_task_title={subtask.title}
                timestamp={date.timestamp}
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.subtask) === JSON.stringify(nextProps.subtask) &&
      JSON.stringify(prevProps.task) === JSON.stringify(nextProps.task) &&
      JSON.stringify(prevProps.active_task) ===
        JSON.stringify(nextProps.active_task)
    );
  },
);

const TimelineInfo: React.FC<{ sessions: any[] }> = ({
  sessions,
  completed_at,
}) => {
  // Mengambil sesi yang sudah diformat
  function adjustSessions(sessions: string[], completedAt: string): string[] {
    const intervalInMillis = 25 * 60 * 1000; // 25 minutes in milliseconds
    const formattedSessions: string[] = [];

    // Convert completedAt string to Date object
    const completedAtDate = new Date(completedAt);

    // Loop through all the sessions
    for (let i = 0; i < sessions.length; i++) {
      const startTime = new Date(sessions[i]); // Convert session start time (ISO string) to Date
      let endTime = new Date(startTime.getTime() + intervalInMillis); // Add 25 minutes to start time

      // Format start time as HH:mm
      const startStr = `${startTime.getHours().toString().padStart(2, "0")}:${startTime.getMinutes().toString().padStart(2, "0")}`;

      // Format end time as HH:mm or adjust it based on completedAt
      let endStr = "";

      // For the last session, check if it should be adjusted based on completedAt
      if (i === sessions.length - 1) {
        if (endTime > completedAtDate) {
          // If the session end time is greater than completedAt, adjust it to completedAt
          endStr = `${completedAtDate.getHours().toString().padStart(2, "0")}:${completedAtDate.getMinutes().toString().padStart(2, "0")}`;
        } else {
          // Otherwise, keep the normal end time
          endStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
        }
      } else {
        // For other sessions, just use the calculated end time
        endStr = `${endTime.getHours().toString().padStart(2, "0")}:${endTime.getMinutes().toString().padStart(2, "0")}`;
      }

      // Add the formatted session to the result array
      formattedSessions.push(`${startStr} - ${endStr}`);
    }

    return formattedSessions;
  }

  const adjustedSessions = adjustSessions(sessions, completed_at);

  return (
    <div>
      <ul
        role="list"
        className="divide-y divide-gray-200 bg-background p-2 rounded-md"
      >
        {adjustedSessions.map((sessionInfo, index) => (
          <li key={index} className="py-2">
            <div className="flex space-x-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Session {index + 1}</h3>
                  <p className="text-sm ">{sessionInfo}</p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#app/components/ui/command";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "#app/components/ui/alert-dialog";

const DropdownMenuTask = ({ todo, date, active_task }) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const dispatch = useAppDispatch();
  return (
    <DropdownMenu
      open={showDropdownMenu}
      modal={false}
      onOpenChange={(change) => setShowDropdownMenu(change)}
    >
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <EllipsisVertical className="w-4 h-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => dispatch(addSubTask({ id: todo.id }))}>
          <Plus /> Add Subtask
        </DropdownMenuItem>
        {todo.status !== "completed" ? (
          <DropdownMenuItem
            className="text-green-600 focus:text-green-600 dark:text-green-400 dark:focus:text-white focus:bg-green-100 dark:focus:bg-green-900"
            onClick={() => {
              if (active_task) {
                const todo = active_task as Task;
                const sessionData = todo.sessions ? [...todo.sessions] : []; // Copy the old sessions array, or start with an empty array

                const notif = {
                  title: "Saatnya istirahat",
                  description:
                    "Sesion " + (sessionData.length + 1) + " has completed",
                };
                showNotification(notif.title, notif.description);

                dispatch(
                  updateTask({
                    id: todo.current.id,
                    key: date.timestamp,
                    updated_task: {
                      title: todo.current.title,
                      status: "completed",
                      completed_at: new Date().toISOString(),
                    },
                  }),
                );
              }
              dispatch(
                updateTask({
                  id: todo.id,
                  key: date.timestamp,
                  updated_task: {
                    title: todo.title,
                    status: "completed",
                    completed_at: new Date().toISOString(),
                  },
                }),
              );
            }}
          >
            <CircleCheckBig className="w-5 h-5" />
            Mark as done
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              dispatch(
                updateTask({
                  id: todo.id,
                  key: date.timestamp,
                  updated_task: {
                    title: todo.title,
                    status: "pending",
                    completed_at: null,
                  },
                }),
              );
            }}
          >
            <CirclePlus className="rotate-45 w-5 h-5" />
            Unmark as done
          </DropdownMenuItem>
        )}
        <AlertDialog onOpenChange={(change) => setShowDropdownMenu(change)}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-white focus:bg-red-100 dark:focus:bg-red-900"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 />
              Delete task
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                task
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(
                    deleteTask({
                      id: todo.id,
                      key: date.timestamp,
                      title: todo.title,
                    }),
                  );
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DropdownMenuSubTask = ({
  task_title,
  task_id,
  sub_task_id,
  sub_task_title,
  timestamp,
}: {
  task_id: number;
  task_title: string;
  sub_task_id?: number;
  sub_task_title?: string;
  timestamp: number;
}) => {
  const [showDropdownMenu, setShowDropdownMenu] = useState(false);
  const dispatch = useAppDispatch();
  return (
    <DropdownMenu
      open={showDropdownMenu}
      modal={false}
      onOpenChange={(change) => setShowDropdownMenu(change)}
    >
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <EllipsisVertical className="w-4 h-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>

        <AlertDialog onOpenChange={(change) => setShowDropdownMenu(change)}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-white focus:bg-red-100 dark:focus:bg-red-900"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 />
              Delete subtask
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                task
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  dispatch(
                    deleteSubTask({
                      id: task_id,
                      key: timestamp,
                      sub_task_id,
                      title: task_title,
                      sub_task_title,
                    }),
                  );
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const taskCategories = [
  { label: "Urgent", color: "#e11d48" },
  { label: "High Priority", color: "#f97316" },
  { label: "Medium Priority", color: "#f59e0b" },
  { label: "Low Priority", color: "#6ee7b7" },
  { label: "Personal", color: "#4ade80" },
  { label: "Work", color: "#0284c7" },
  { label: "Important Meetings", color: "#2563eb" },
  { label: "Research", color: "#4f46e5" },
  { label: "Creative", color: "#7c3aed" },
  { label: "Review", color: "#9d4edd" },
  { label: "Reports", color: "#c026d3" },
  { label: "Follow-up", color: "#d946ef" },
  { label: "General", color: "#9ca3af" },
  { label: "Team Collaboration", color: "#f472b6" },
  { label: "Client", color: "#fb923c" },
  { label: "Training", color: "#fbbf24" },
  { label: "Deadline", color: "#a3e635" },
  { label: "Admin", color: "#38bdf8" },
  { label: "Development", color: "#9333ea" },
  { label: "Miscellaneous", color: "#1e3a8a" },
];

function ComboboxPopover({ task, subtask, date }: { task: Task }) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<Status | null>(
    subtask ? subtask.category.color : task.category.color,
  );

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="[&_svg]:size-5 p-0 h-auto w-auto"
          >
            {selectedStatus ? (
              <>
                <Squircle fill={selectedStatus} color={selectedStatus} />
              </>
            ) : (
              <Squircle className="fill-primary text-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {taskCategories.map((item) => (
                  <CommandItem
                    key={item.color}
                    value={item.color}
                    onSelect={(color) => {
                      setSelectedStatus(color);

                      const _category = taskCategories.find(
                        (item) => item.color === color,
                      );
                      if (subtask) {
                        dispatch(
                          updateSubTask({
                            id: task.id,
                            sub_task_id: subtask.id,
                            updated_sub_task: {
                              category: _category,
                            },
                          }),
                        );
                      } else {
                        dispatch(
                          updateTask({
                            id: task.id,
                            key: date.timestamp,
                            updated_task: {
                              title: task.title,
                              category: _category,
                            },
                          }),
                        );
                      }
                      setOpen(false);
                    }}
                  >
                    <Squircle
                      fill={item.color}
                      color={item.color}
                      className={cn(
                        "mr-2 h-5 w-5",
                        item.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40",
                      )}
                    />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ComboboxPopoverFilter({ data, handler }) {
  const [open, setOpen] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<String | null>(
    null,
  );

  const selected_category = taskCategories.find(
    (item) => item.color === selectedStatus,
  );
  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="[&_svg]:size-4">
            {selectedStatus ? (
              <>
                <span className="pb-0.5 font-medium">
                  {selected_category?.label}
                </span>
                <Squircle fill={selectedStatus} color={selectedStatus} />
              </>
            ) : (
              <React.Fragment>
                <span className="pb-0.5 font-medium">Filter task</span>
                <ChevronsUpDown className="text-muted-foreground" />
              </React.Fragment>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="right" align="start">
          <Command>
            <CommandInput placeholder="Change category..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.color}
                    value={item.color}
                    onSelect={(color) => {
                      setSelectedStatus(color);
                      handler(color);

                      const _category = taskCategories.find(
                        (item) => item.color === color,
                      );
                      setOpen(false);
                    }}
                  >
                    <Squircle
                      fill={item.color}
                      color={item.color}
                      className={cn(
                        "mr-2 h-5 w-5",
                        item.value === selectedStatus?.value
                          ? "opacity-100"
                          : "opacity-40",
                      )}
                    />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}

                {selectedStatus && (
                  <CommandItem
                    onSelect={() => {
                      setSelectedStatus(null);
                      handler("all");

                      setOpen(false);
                    }}
                  >
                    <X className={cn("mr-2 h-5 w-5")} />
                    <span>Delete filte</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
import { Provider } from "react-redux";
import store from "#app/store/store";

// Komponen Item yang menggunakan React.memo untuk mencegah re-render

const DragDropList: React.FC = ({ data, tasks: _tasks, date, active_task }) => {
  const [items, setItems] = useState<string[]>(_tasks);

  const [value, setValue] = useState("all");
  const filteredTasks =
    value !== "all"
      ? items
          .filter((task) => {
            // Memfilter items yang memiliki kategori utama yang cocok
            const taskMatches = task.category?.color === value;

            return taskMatches;
          })
          .map((task) => ({
            ...task,
            sub_tasks: task.sub_tasks.filter(
              (subTask) => subTask.category?.color === value,
            ), // Filter sub_tasks setelah task terpilih
          }))
      : items;

  useEffect(() => {
    setItems(_tasks);
  }, [_tasks]); // Dependency on _tasks, so it will update whenever _tasks changes

  const dispatch = useAppDispatch();

  // Debounced function to dispatch the action after a delay
  const debounceOnChange = lodash.debounce(() => {
    dispatch(updateTasksColumn({ key: date.timestamp, updated_task: items }));
  }, 3000); // Set delay to 3 seconds

  useEffect(() => {
    if (JSON.stringify(_tasks) !== JSON.stringify(items)) {
      debounceOnChange(); // Call the debounced function whenever tasks change
    }
    // Cleanup the debounce function when the component is unmounted or before next render
    return () => {
      debounceOnChange.cancel();
    };
  }, [items]);

  // Gunakan useRef untuk menyimpan draggedIndex
  const draggedIndexRef = useRef<number | null>(null);

  // Fungsi untuk menangani drag start
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, index: number) => {
      draggedIndexRef.current = index; // Simpan index ke dalam ref
      // event.target.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      const element = event.currentTarget.cloneNode(true) as HTMLDivElement;
      const dragImage = document.createElement("div");

      const isDarkMode = document.documentElement.classList.contains("dark");

      // Atur warna berdasarkan tema
      if (isDarkMode) {
        dragImage.style.backgroundColor = "black";
        dragImage.style.border = "1px solid white";
        dragImage.style.color = "white"; // Warna teks jika ada
      } else {
        dragImage.style.backgroundColor = "white";
        dragImage.style.border = "1px solid black";
        dragImage.style.color = "black"; // Warna teks jika ada
      }
      dragImage.style.width = "732px";
      dragImage.style.paddingBottom = "2px"; // Hanya padding bawah
      dragImage.style.paddingTop = "10px"; // Pastikan padding lainnya diatur sesuai kebutuhan
      dragImage.style.paddingLeft = "10px";
      dragImage.style.paddingRight = "10px";
      dragImage.appendChild(element);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 25, 25);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    [],
  );

  // Fungsi untuk menangani drag over
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Mengizinkan drop
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.target.classList.remove("dragging"); // Hapus kelas 'dragging'
    draggedIndexRef.current = null;
  };
  // Fungsi untuk menangani drop
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      event.preventDefault();

      const draggedIndex = draggedIndexRef.current;
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      // Gunakan callback untuk memastikan state terbaru digunakan
      setItems((prevItems) => {
        const updatedItems = [...prevItems];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(dropIndex, 0, movedItem);

        return updatedItems;
      });

      draggedIndexRef.current = null; // Reset drag index setelah selesai
    },
    [],
  );

  const totalTargetSessions = _tasks?.reduce(
    (sum, todo) => sum + todo.target_sessions,
    0,
  );
  return (
    <div className="">
      {filteredTasks.map((task, index) => {
        return (
          <MainTaskCard
            key={task.id}
            date={date}
            index={index}
            active_task={active_task}
            totalTargetSessions={totalTargetSessions}
            task={task}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
          />
        );
      })}

      <SelectFilter
        data={data}
        date={date}
        value={value}
        setValue={setValue}
        tasks={items}
      />
    </div>
  );
};
const DragDropListSubTask: React.FC = ({
  sub_tasks,
  task,
  date,
  active_task,
}) => {
  const dispatch = useAppDispatch();
  const [subtasks, setSubtasks] = useState<Task[]>(sub_tasks);

  useEffect(() => {
    setSubtasks(sub_tasks);
  }, [sub_tasks]); // Dependency on _tasks, so it will update whenever _tasks changes

  // Debounced function to dispatch the action after a delay
  const debounceOnChange = lodash.debounce(() => {
    dispatch(
      updateSubTasksColumn({
        id: task.id,
        key: date.timestamp,
        updated_sub_task: subtasks,
      }),
    );
  }, 3000); // Set delay to 3 seconds

  useEffect(() => {
    if (JSON.stringify(subtasks) !== JSON.stringify(sub_tasks)) {
      debounceOnChange(); // Call the debounced function whenever tasks change
    }
    // Cleanup the debounce function when the component is unmounted or before next render
    return () => {
      debounceOnChange.cancel();
    };
  }, [subtasks]);

  // Gunakan useRef untuk menyimpan draggedIndex
  const draggedIndexRef = useRef<number | null>(null);

  // Fungsi untuk menangani drag start
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>, index: number) => {
      draggedIndexRef.current = index; // Simpan index ke dalam ref
      // event.target.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
      const element = event.currentTarget.cloneNode(true) as HTMLDivElement;
      const dragImage = document.createElement("div");

      const isDarkMode = document.documentElement.classList.contains("dark");

      // Atur warna berdasarkan tema
      if (isDarkMode) {
        dragImage.style.backgroundColor = "black";
        dragImage.style.border = "1px solid white";
        dragImage.style.color = "white"; // Warna teks jika ada
      } else {
        dragImage.style.backgroundColor = "white";
        dragImage.style.border = "1px solid black";
        dragImage.style.color = "black"; // Warna teks jika ada
      }
      dragImage.style.width = "732px";
      dragImage.style.paddingBottom = "2px"; // Hanya padding bawah
      dragImage.style.paddingTop = "10px"; // Pastikan padding lainnya diatur sesuai kebutuhan
      dragImage.style.paddingLeft = "10px";
      dragImage.style.paddingRight = "10px";
      dragImage.appendChild(element);
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 25, 25);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    },
    [],
  );

  // Fungsi untuk menangani drag over
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault(); // Mengizinkan drop
      event.dataTransfer.dropEffect = "move";
    },
    [],
  );

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.target.classList.remove("dragging"); // Hapus kelas 'dragging'
    draggedIndexRef.current = null;
  };
  // Fungsi untuk menangani drop
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      event.preventDefault();

      const draggedIndex = draggedIndexRef.current;
      if (draggedIndex === null || draggedIndex === dropIndex) return;

      // Gunakan callback untuk memastikan state terbaru digunakan
      setSubtasks((prevItems) => {
        const updatedItems = [...prevItems];
        const [movedItem] = updatedItems.splice(draggedIndex, 1);
        updatedItems.splice(dropIndex, 0, movedItem);

        return updatedItems;
      });

      draggedIndexRef.current = null; // Reset drag index setelah selesai
    },
    [],
  );

  return (
    <div className="ml-2.5 sm:ml-5 ">
      <Label className="mb-1">Subtask ({subtasks.length})</Label>
      {subtasks.map((sub_task, index) => {
        return (
          <SubTaskComponentCard
            index={index}
            key={sub_task.id}
            date={date}
            active_task={active_task}
            subtask={sub_task}
            task={task}
            handleDragStart={handleDragStart}
            handleDragEnd={handleDragEnd}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
          />
        );
      })}
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
