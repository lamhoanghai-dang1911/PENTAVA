export type TaskProgressRequestDTO = {
  selectedItems: string[];
};

export type Task = {
  id: number;
  title: string;
  content: string;
  weekNumber: number | null;
  isAiGenerated: boolean;
  isCompleted: boolean;
};

export type TaskResponse = Record<string, unknown>;

export type TaskListResponse = {
  message: string;
  diagnostic: unknown | null;
  tasks: Task[];
  taskProgress: unknown | null;
};