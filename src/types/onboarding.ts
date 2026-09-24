import type { OnboardingSubmitResponse } from "@/src/types/api/onboarding";

export type OnboardingData = {
  name: string;
  gender: string | null;
  age: string | null;
  goals: string;
  routine: string | null;
  sleepHours: string | null;
  exerciseFrequency: string | null;
  stressFrequency: string | null;
  screenTime: string | null;
  habitDuration: string | null;
  freeTimes: string[];
};

export type OnboardingContextValue = {
  data: OnboardingData;
  submitResponse: OnboardingSubmitResponse | null;
  setSubmitResponse: (response: OnboardingSubmitResponse | null) => void;
  setName: (name: string) => void;
  setGender: (gender: string | null) => void;
  setAge: (age: string | null) => void;
  setGoal: (goal: string) => void;
  setRoutine: (routine: string | null) => void;
  setSleepHours: (sleepHours: string | null) => void;
  setExerciseFrequency: (exerciseFrequency: string | null) => void;
  setStressFrequency: (stressFrequency: string | null) => void;
  setScreenTime: (screenTime: string | null) => void;
  setHabitDuration: (habitDuration: string | null) => void;
  toggleFreeTime: (freeTime: string) => void;
  reset: () => void;
};
