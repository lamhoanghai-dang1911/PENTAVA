import type { TaskDate } from "@/src/features/tasks/task-utils";

export type DailyTasksHeaderProps = {
  dates: TaskDate[];
  todayKey: string;
  selectedDayIndex: number;
  weekNumber: number;
  onSelectDay: (index: number) => void;
  onChangeWeek: (week: number) => void;
};
