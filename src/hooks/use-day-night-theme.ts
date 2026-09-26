import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type ThemeMode = 'auto' | 'day' | 'night';

const STORAGE_KEY = '@pentava_home_theme_mode';

function checkIsNightTime(): boolean {
  const currentHour = new Date().getHours();
  // Ban đêm từ 18:00 (6 PM) đến trước 6:00 (6 AM)
  return currentHour >= 18 || currentHour < 6;
}

export function useDayNightTheme() {
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [isNightTimeReal, setIsNightTimeReal] = useState<boolean>(() => checkIsNightTime());

  // Load saved preference on mount
  useEffect(() => {
    let isMounted = true;
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (!isMounted || !saved) return;
      if (saved === 'day' || saved === 'night' || saved === 'auto') {
        setModeState(saved as ThemeMode);
      }
    });

    // Cập nhật lại thời gian thực mỗi phút
    const interval = setInterval(() => {
      setIsNightTimeReal(checkIsNightTime());
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const setMode = useCallback(async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
    } catch {
      // Ignored
    }
  }, []);

  // Chuyển đổi qua lại: Tự động -> Ngày -> Đêm -> Tự động
  const cycleMode = useCallback(() => {
    setModeState((current) => {
      let next: ThemeMode;
      if (current === 'auto') {
        next = 'day';
      } else if (current === 'day') {
        next = 'night';
      } else {
        next = 'auto';
      }
      void AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  // Chuyển nhanh giữa Ngày và Đêm
  const toggleDayNight = useCallback(() => {
    setModeState((current) => {
      const activeIsNight = current === 'auto' ? isNightTimeReal : current === 'night';
      const next: ThemeMode = activeIsNight ? 'day' : 'night';
      void AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, [isNightTimeReal]);

  const resetToAuto = useCallback(async () => {
    await setMode('auto');
  }, [setMode]);

  const isNight = mode === 'auto' ? isNightTimeReal : mode === 'night';

  return {
    mode,
    isNight,
    setMode,
    cycleMode,
    toggleDayNight,
    resetToAuto,
  };
}
