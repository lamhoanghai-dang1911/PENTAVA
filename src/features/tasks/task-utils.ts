export const TASKS_PER_DAY = 5;
export const DAYS_PER_WEEK = 7;

export type TaskDate = {
  dateKey: string;
  day: number;
  weekday: string;
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonday(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  monday.setDate(monday.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function buildDateStrip(
  weekNumber: number,
  currentWeekNumber = 1,
): TaskDate[] {
  const monday = getMonday(new Date());
  monday.setDate(
    monday.getDate() + (weekNumber - currentWeekNumber) * DAYS_PER_WEEK,
  );

  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    return {
      dateKey: toDateKey(date),
      day: date.getDate(),
      weekday: date.toLocaleDateString("vi-VN", { weekday: "short" }),
    };
  });
}

export function getTasksForDay<T>(tasks: T[], dayIndex: number) {
  if (tasks.length === 0) {
    return [];
  }

  // Temporary fallback: the API has no day field and currently returns inconsistent record counts.
  return Array.from({ length: TASKS_PER_DAY }, (_, index) => {
    return tasks[(dayIndex * TASKS_PER_DAY + index) % tasks.length];
  });
}
