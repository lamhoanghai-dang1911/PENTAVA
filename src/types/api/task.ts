export type TaskProgressRequestDTO = {
  selectedItems: string[];
};

export type Task = {
  id: number;
  progressId?: number;
  title: string;
  content: string;
  weekNumber: number | null;
  isAiGenerated: boolean;
  isCompleted: boolean;
  moodType?: 'BAD' | 'NEUTRAL' | 'GOOD';
};

export type TaskResponse = Record<string, unknown>;

export type TaskListResponse = {
  message: string;
  diagnostic: unknown | null;
  tasks: Task[];
  taskProgress: unknown | null;
};

export type DailyTaskStatus = {
  hasConfirmedToday: boolean;
  todayTasks: Task[];
  hasYesterdayTasks: boolean;
  yesterdayTasks: Task[];
};

export type DailyTaskStatusResponse = {
  message: string;
  dailyTaskStatus: DailyTaskStatus | null;
};

export type MoodSelectionRequest = {
  goalId: number;
  moodType: 'BAD' | 'NEUTRAL' | 'GOOD';
  comment: string;
};

export type MoodTaskResponse = {
  moodType: MoodSelectionRequest['moodType'];
  availableTasks: Task[];
  yesterdayTaskIds: number[];
};

export type MoodTaskResponseEnvelope = {
  message: string;
  moodTaskResponse: MoodTaskResponse | null;
};

export type ConfirmDailyTasksRequest = {
  goalId: number;
  selectedTaskIds: number[];
};

export type TaskHistoryEntry = {
  taskDate: string;
  tasks: Task[];
};

export type TaskHistoryResponse = {
  message: string;
  taskHistory: TaskHistoryEntry[];
};

export type SwapDailyTaskRequest = {
  goalId: number;
  oldTaskId: number;
  newTaskId: number;
};