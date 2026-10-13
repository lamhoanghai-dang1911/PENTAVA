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
  isCustom?: boolean;
  isPublic?: boolean;
  description?: string;
};

export type CurrentGoalResponse = {
  message: string;
  currentGoal: CurrentGoal | null;
};

export type CurrentStreak = {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  freezesUsedThisMonth?: number;
  maxFreezesPerMonth?: number;
  hasStreakProtection?: boolean;
  streakFrozenYesterday?: boolean;
};

export type CurrentStreakResponse = {
  message: string;
  streak: CurrentStreak | null;
};

export type PastTaskCatalogItem = {
  taskId: number;
  weekNumber: number;
  title: string;
  content: string;
  moodType: string | null;
  isCompleted: boolean;
};

export type PastGoalCatalog = {
  goalId: number;
  goalName: string;
  isCustom: boolean;
  tasks: PastTaskCatalogItem[];
};

export type PastTasksCatalogResponse = {
  message: string;
  pastTaskCatalog: PastGoalCatalog[];
};

export type CustomTaskItem = {
  title: string;
  content?: string;
  sourceTaskId?: number;
};

export type CustomWeek = {
  weekNumber: number;
  tasks: CustomTaskItem[];
};

export type CreateCustomGoalRequest = {
  goalName: string;
  description?: string;
  isPublic?: boolean;
  badTasks?: CustomTaskItem[];
  neutralTasks?: CustomTaskItem[];
  goodTasks?: CustomTaskItem[];
  weeks?: CustomWeek[];
};

export type PublicGoalSummary = {
  goalId: number;
  goalName: string;
  description: string;
  authorName: string;
  createdAt: string;
  weeks?: CustomWeek[];
  badTasks?: CustomTaskItem[];
  neutralTasks?: CustomTaskItem[];
  goodTasks?: CustomTaskItem[];
};

export type PublicGoalsResponse = {
  message: string;
  publicGoals: PublicGoalSummary[];
};

// ==========================================
// ĐÁNH GIÁ ĐẦU RA (OUTBOARDING ASSESSMENT)
// ==========================================

export type GoalAssessmentContext = {
  goalId: number;
  goalName: string;
  isCustom: boolean;
  startDate: string;
  endDate: string;
  daysElapsed: number;
  isCompleted: boolean;
  alreadyAssessed: boolean;
  baseSleepHours: string | null;
  baseExerciseFrequency: string | null;
  baseStressFrequency: string | null;
  baseHabitDuration: string | null;
  baseRoutine: string | null;
  baseSleepScore: number;
  baseExerciseScore: number;
  baseStressScore: number;
  baseDisciplineScore: number;
  baseOverallScore: number;
};

export type GoalAssessmentContextResponse = {
  message: string;
  assessmentContext: GoalAssessmentContext;
};

export type GoalAssessmentRequest = {
  sleepAnswer: string;
  exerciseAnswer: string;
  stressAnswer: string;
  disciplineAnswer: string;
  goalQuestionAnswer: number;
  goalQuestionText?: string;
  goalQuestionAnswerLabel?: string;
  selfPerceptionPercent: number;
};

export type GoalAssessmentReport = {
  goalId: number;
  goalName: string;
  completedAt: string;
  baseSleepScore: number;
  baseExerciseScore: number;
  baseStressScore: number;
  baseDisciplineScore: number;
  baseOverallScore: number;
  postSleepAnswer: string;
  postSleepScore: number;
  postExerciseAnswer: string;
  postExerciseScore: number;
  postStressAnswer: string;
  postStressScore: number;
  postDisciplineAnswer: string;
  postDisciplineScore: number;
  postOverallScore: number;
  deltaScore: number;
  goalQuestionText: string;
  goalQuestionAnswer: number;
  goalQuestionAnswerLabel: string;
  selfPerceptionPercent: number;
};

export type GoalAssessmentReportResponse = {
  message: string;
  assessmentReport: GoalAssessmentReport;
};

export type GoalRenewalRequest = {
  primaryGoal: string;
  routineType: string;
  sleepHours: string;
  exerciseFrequency: string;
  stressFrequency: string;
  screenTime: string;
  habitDuration: string;
  freeTimes: string[];
};
