import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from "#app/components/ui/full-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { addDays, addHours, subDays } from "date-fns";

const generateRandomEvents = (numEvents: number) => {
  const events = [];

  for (let i = 0; i < numEvents; i++) {
    // Randomize start date within the past 7 days
    const start = subDays(new Date(), Math.floor(Math.random() * 7));

    // Randomize duration (3 days, 4 days, or a week)
    const duration = [3, 4, 7][Math.floor(Math.random() * 3)];
    const end = addDays(start, duration);

    // Randomize title and color
    const title = `Event ${String.fromCharCode(65 + i)}`;
    const colors = ["pink", "blue", "green", "yellow", "purple"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    events.push({
      id: (i + 1).toString(),
      start,
      end,
      title,
      color,
    });
  }

  return events;
};

// Generate 10 random events
export default function Page() {
  return (
    <Calendar events={generateRandomEvents(10)}>
      <div className="h-dvh px-6 flex flex-col mt-4">
        <div className="flex px-6 items-center gap-2 mb-6">
          <CalendarViewTrigger
            className="aria-[current=true]:bg-accent"
            view="day"
          >
            Day
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="week"
            className="aria-[current=true]:bg-accent"
          >
            Week
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="month"
            className="aria-[current=true]:bg-accent"
          >
            Month
          </CalendarViewTrigger>
          <CalendarViewTrigger
            view="year"
            className="aria-[current=true]:bg-accent"
          >
            Year
          </CalendarViewTrigger>

          <span className="flex-1" />

          <CalendarCurrentDate />

          <CalendarPrevTrigger>
            <ChevronLeft size={20} />
            <span className="sr-only">Previous</span>
          </CalendarPrevTrigger>

          <CalendarTodayTrigger>Today</CalendarTodayTrigger>

          <CalendarNextTrigger>
            <ChevronRight size={20} />
            <span className="sr-only">Next</span>
          </CalendarNextTrigger>
        </div>

        <div className="flex-1 px-6 pb-5 overflow-hidden">
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
      </div>
    </Calendar>
  );
}
