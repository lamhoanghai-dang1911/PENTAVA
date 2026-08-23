import type { ImageSourcePropType } from 'react-native';

export type ExerciseStep = {
  title: string;
  description: string;
};

export type ExerciseTask = {
  id: 'task1' | 'task2' | 'task3' | 'task4' | 'task5';
  slug: 'avoid-food' | 'fruit-veg' | 'workout' | 'bedtime-routine' | 'sleep-time';
  title: string;
  heroImage: ImageSourcePropType;
  accentColor: string;
  buttonColor: string;
  steps: ExerciseStep[];
  nextRoute: string;
};
