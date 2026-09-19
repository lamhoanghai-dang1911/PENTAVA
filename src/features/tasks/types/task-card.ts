import type { Task } from "@/src/types/api/task";

export type TaskCardProps = {
  task: Task;
  index: number;
  isTodaySelected: boolean;
  weekNumber: number;
  completingTaskId: number | null;

  onOpenTask: (taskId: number, weekNumber: number, taskIndex: number) => void;

  // Gọi API complete task
  onCompleteTask: (task: Task) => Promise<void>;

  // Chuyển sang màn hình check-in
  onStartCheckIn: (task: Task) => void;

  // Đổi task
  onSwap: (task: Task) => void | Promise<void>;
};
