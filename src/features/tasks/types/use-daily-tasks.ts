export type UseDailyTasksOptions = {
    onOpenMoodSelection: (goalId: number) => void;
    onOpenTask: (taskId: number, weekNumber: number, taskIndex: number) => void;
};
