import type { CurrentStreak } from "@/src/types/api/onboarding";
import type { Task } from "@/src/types/api/task";

export type DailyTaskModalsProps = {
  dailyStatusVisible: boolean;
  yesterdayTasks: Task[];
  isConfirmingDailyTasks: boolean;
  swapTask: Task | null;
  swapCandidates: Task[];
  isSwapLoading: boolean;
  isSwapping: boolean;
  streakVisible: boolean;
  completedStreak: CurrentStreak | null;
  onCloseDailyStatus: () => void;
  onOpenMoodSelection: () => void;
  onKeepYesterdayTasks: () => void;
  onCloseSwap: () => void;
  onCancelStreak: () => void;
  onConfirmSwap: (task: Task) => void;
};
