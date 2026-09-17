import type { Task } from "@/src/types/api/task";

export type TaskCardProps = {
  task: Task;
  index: number;
  isTodaySelected: boolean;
  weekNumber: number;
  completingTaskId: number | null;
  onOpenTask: (taskId: number, weekNumber: number, taskIndex: number) => void;
  onStartCheckIn: (task: Task) => void;
  onSwap: (task: Task) => void;
};
