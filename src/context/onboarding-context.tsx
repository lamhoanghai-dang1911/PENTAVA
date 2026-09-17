import { getCurrentUserId, subscribeAuthState } from '@/src/services/authStorage';
import type { OnboardingSubmitResponse } from '@/src/types/api/onboarding';
import type { OnboardingContextValue, OnboardingData } from '@/src/types/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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

const ONBOARDING_STORAGE_PREFIX = '@pentava/onboarding-data';
const ONBOARDING_RESPONSE_STORAGE_PREFIX = '@pentava/onboarding-response';

function getUserStorageKey(prefix: string, userId: string) {
  return `${prefix}:${userId}`;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitResponse, setSubmitResponse] = useState<OnboardingSubmitResponse | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);

  useEffect(() => {
    let isActive = true;

    const loadUserData = async (userId: string | null) => {
      if (!userId || userId === 'anonymous') {
        if (isActive) {
          setCurrentUserId(null);
          setData(initialData);
          setSubmitResponse(null);
          setHasLoadedStorage(true);
        }
        return;
      }

      setHasLoadedStorage(false);
      try {
        const [storedData, storedResponse] = await Promise.all([
          AsyncStorage.getItem(getUserStorageKey(ONBOARDING_STORAGE_PREFIX, userId)),
          AsyncStorage.getItem(getUserStorageKey(ONBOARDING_RESPONSE_STORAGE_PREFIX, userId)),
        ]);

        if (!isActive) return;

        setCurrentUserId(userId);
        setData(storedData ? { ...initialData, ...JSON.parse(storedData) } : initialData);
        setSubmitResponse(storedResponse ? JSON.parse(storedResponse) : null);
      } catch (error) {
        console.warn('Không thể đọc dữ liệu onboarding trên thiết bị.', error);
      } finally {
        if (isActive) setHasLoadedStorage(true);
      }
    };

    void getCurrentUserId().then(loadUserData);
    const unsubscribe = subscribeAuthState((userId) => {
      void loadUserData(userId);
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedStorage || !currentUserId) return;

    AsyncStorage.setItem(
      getUserStorageKey(ONBOARDING_STORAGE_PREFIX, currentUserId),
      JSON.stringify(data),
    ).catch((error) => {
      console.warn('Không thể lưu dữ liệu onboarding trên thiết bị.', error);
    });
  }, [data, hasLoadedStorage, currentUserId]);

  useEffect(() => {
    if (!hasLoadedStorage || !currentUserId || !submitResponse) return;

    AsyncStorage.setItem(
      getUserStorageKey(ONBOARDING_RESPONSE_STORAGE_PREFIX, currentUserId),
      JSON.stringify(submitResponse),
    ).catch((error) => {
      console.warn('Không thể lưu kết quả onboarding trên thiết bị.', error);
    });
  }, [submitResponse, hasLoadedStorage, currentUserId]);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      data,
      submitResponse,
      setSubmitResponse,
      setName: (name) => setData((prev) => ({ ...prev, name })),
      setGender: (gender) => setData((prev) => ({ ...prev, gender })),
      setAge: (age) => setData((prev) => ({ ...prev, age })),
      toggleGoal: (goal) => setData((prev) => ({
        ...prev,
        goals: prev.goals.includes(goal)
          ? prev.goals.filter((item) => item !== goal)
          : [...prev.goals, goal],
      })),
      setRoutine: (routine) => setData((prev) => ({ ...prev, routine })),
      setSleepHours: (sleepHours) => setData((prev) => ({ ...prev, sleepHours })),
      setExerciseFrequency: (exerciseFrequency) => setData((prev) => ({ ...prev, exerciseFrequency })),
      setStressFrequency: (stressFrequency) => setData((prev) => ({ ...prev, stressFrequency })),
      setScreenTime: (screenTime) => setData((prev) => ({ ...prev, screenTime })),
      setHabitDuration: (habitDuration) => setData((prev) => ({ ...prev, habitDuration })),
      toggleFreeTime: (freeTime) => setData((prev) => ({
        ...prev,
        freeTimes: prev.freeTimes.includes(freeTime)
          ? prev.freeTimes.filter((item) => item !== freeTime)
          : [...prev.freeTimes, freeTime],
      })),
      reset: () => {
        setData(initialData);
        setSubmitResponse(null);
        if (!currentUserId) return;

        void Promise.all([
          AsyncStorage.removeItem(getUserStorageKey(ONBOARDING_STORAGE_PREFIX, currentUserId)),
          AsyncStorage.removeItem(getUserStorageKey(ONBOARDING_RESPONSE_STORAGE_PREFIX, currentUserId)),
        ]).catch((error) => {
          console.warn('Không thể xóa dữ liệu onboarding trên thiết bị.', error);
        });
      },
    }),
    [currentUserId, data, submitResponse],
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
