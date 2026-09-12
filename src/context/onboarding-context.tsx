import type { OnboardingSubmitResponse } from '@/src/types/api/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type OnboardingData = {
  name: string;
  gender: string | null;
  age: string | null;
  goals: string[];
  routine: string | null;
  sleepHours: string | null;
  exerciseFrequency: string | null;
  stressFrequency: string | null;
  screenTime: string | null;
  habitDuration: string | null;
  freeTimes: string[];
};

type OnboardingContextValue = {
  data: OnboardingData;
  submitResponse: OnboardingSubmitResponse | null;
  setSubmitResponse: (response: OnboardingSubmitResponse | null) => void;
  setName: (name: string) => void;
  setGender: (gender: string | null) => void;
  setAge: (age: string | null) => void;
  toggleGoal: (goal: string) => void;
  setRoutine: (routine: string | null) => void;
  setSleepHours: (sleepHours: string | null) => void;
  setExerciseFrequency: (exerciseFrequency: string | null) => void;
  setStressFrequency: (stressFrequency: string | null) => void;
  setScreenTime: (screenTime: string | null) => void;
  setHabitDuration: (habitDuration: string | null) => void;
  toggleFreeTime: (freeTime: string) => void;
  reset: () => void;
};

const initialData: OnboardingData = {
  name: '',
  gender: null,
  age: null,
  goals: [],
  routine: null,
  sleepHours: null,
  exerciseFrequency: null,
  stressFrequency: null,
  screenTime: null,
  habitDuration: null,
  freeTimes: [],
};

const ONBOARDING_STORAGE_KEY = '@pentava/onboarding-data';
const ONBOARDING_RESPONSE_STORAGE_KEY = '@pentava/onboarding-response';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitResponse, setSubmitResponse] = useState<OnboardingSubmitResponse | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        if (storedData) {
          setData({ ...initialData, ...JSON.parse(storedData) });
        }
        const storedResponse = await AsyncStorage.getItem(ONBOARDING_RESPONSE_STORAGE_KEY);
        if (storedResponse) {
          setSubmitResponse(JSON.parse(storedResponse));
        }
      } catch (error) {
        console.warn('Không thể đọc dữ liệu onboarding trên thiết bị.', error);
      } finally {
        setHasLoadedStorage(true);
      }
    };

    void loadData();
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(data)).catch((error) => {
      console.warn('Không thể lưu dữ liệu onboarding trên thiết bị.', error);
    });
  }, [data, hasLoadedStorage]);

  useEffect(() => {
    if (!hasLoadedStorage || !submitResponse) {
      return;
    }

    AsyncStorage.setItem(
      ONBOARDING_RESPONSE_STORAGE_KEY,
      JSON.stringify(submitResponse),
    ).catch((error) => {
      console.warn('Không thể lưu kết quả onboarding trên thiết bị.', error);
    });
  }, [submitResponse, hasLoadedStorage]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      data,
      submitResponse,
      setSubmitResponse,
      setName: (name) => setData((prev) => ({ ...prev, name })),
      setGender: (gender) => setData((prev) => ({ ...prev, gender })),
      setAge: (age) => setData((prev) => ({ ...prev, age })),
      toggleGoal: (goal) =>
        setData((prev) => ({
          ...prev,
          goals: prev.goals.includes(goal)
            ? prev.goals.filter((item) => item !== goal)
            : [...prev.goals, goal],
        })),
      setRoutine: (routine) => setData((prev) => ({ ...prev, routine })),
      setSleepHours: (sleepHours) => setData((prev) => ({ ...prev, sleepHours })),
      setExerciseFrequency: (exerciseFrequency) =>
        setData((prev) => ({ ...prev, exerciseFrequency })),
      setStressFrequency: (stressFrequency) =>
        setData((prev) => ({ ...prev, stressFrequency })),
      setScreenTime: (screenTime) => setData((prev) => ({ ...prev, screenTime })),
      setHabitDuration: (habitDuration) => setData((prev) => ({ ...prev, habitDuration })),
      toggleFreeTime: (freeTime) =>
        setData((prev) => ({
          ...prev,
          freeTimes: prev.freeTimes.includes(freeTime)
            ? prev.freeTimes.filter((item) => item !== freeTime)
            : [...prev.freeTimes, freeTime],
        })),
      reset: () => {
        setData(initialData);
        setSubmitResponse(null);
        AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY).catch((error) => {
          console.warn('Không thể xóa dữ liệu onboarding trên thiết bị.', error);
        });
        AsyncStorage.removeItem(ONBOARDING_RESPONSE_STORAGE_KEY).catch((error) => {
          console.warn('Không thể xóa kết quả onboarding trên thiết bị.', error);
        });
      },
    }),
    [data, submitResponse],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
