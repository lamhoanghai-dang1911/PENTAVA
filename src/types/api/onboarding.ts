import type {
  DailyTaskStatus,
  MoodTaskResponse,
  Task,
  TaskHistoryEntry,
} from "@/src/types/api/task";

export type OnboardingRequestDTO = {
  name: string;
  gender: string;
  age: string;
  primaryGoal: string;
  routineType: string;
  sleepHours: string;
  exerciseFrequency: string;
  stressFrequency: string;
  screenTime: string;
  habitDuration: string;
  freeTimes: string[];
};

export type GoalProgressionRequestDTO = {
  currentGoalName: string;
  nextGoalName: string;
};

export type OnboardingMoodTaskPlan = {
  goal: string;
  description: string;
  badTasks: string[];
  neutralTasks: string[];
  goodTasks: string[];
};

export type OnboardingDiagnostic = {
  overallScore: number;
  healthStatus: string;
  topIssues: string[];
  recommendedGoals: string[];
  summary: string;
  moodTaskPlan: OnboardingMoodTaskPlan | null;
};

export type OnboardingSubmitResponse = {
  message: string;
  diagnostic: OnboardingDiagnostic;
  tasks: Task[] | null;
  taskProgress: unknown | null;
  moodTaskResponse: MoodTaskResponse | null;
  goalId: number | null;
  dailyTaskStatus: DailyTaskStatus | null;
  currentGoal: CurrentGoal | null;
  streak: CurrentStreak | null;
  taskHistory: TaskHistoryEntry[] | null;
};

export type CurrentGoal = {
  goalId: number;
  goalName: string;
  status: string;
  createdAt: string;
  expiresAt: string;
};

export type CurrentGoalResponse = {
  message: string;
  currentGoal: CurrentGoal | null;
};

export type CurrentStreak = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
};

export type CurrentStreakResponse = {
  message: string;
  streak: CurrentStreak | null;
};
