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

export type OnboardingActionPlan = {
  goal: string;
  description: string;
  actions: string[];
};

export type OnboardingDiagnostic = {
  overallScore: number;
  healthStatus: string;
  topIssues: string[];
  recommendedGoals: string[];
  summary: string;
  actionPlans: OnboardingActionPlan[];
};

export type OnboardingSubmitResponse = {
  message: string;
  diagnostic: OnboardingDiagnostic;
  tasks: unknown | null;
  taskProgress: unknown | null;
};
