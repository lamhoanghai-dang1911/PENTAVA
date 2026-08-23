import { useCallback, useMemo, useState } from 'react';

export const MOOD_OPTIONS = [
  { label: 'TỆ', color: '#FFC145' },
  { label: 'BÌNH THƯỜNG', color: '#4EA3F7' },
  { label: 'TỐT', color: '#4CD080' },
] as const;

export function useMoodSelector() {
  const [comment, setComment] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const selectedMood = useMemo(() => MOOD_OPTIONS[currentIndex], [currentIndex]);

  const setMoodBySlider = useCallback((value: number) => {
    const rounded = Math.round(value);
    setCurrentIndex(rounded);
  }, []);

  return {
    comment,
    setComment,
    currentIndex,
    selectedMood,
    setMoodBySlider,
  };
}
