import { taskContent } from '@/src/features/exercises/data/task-content';
import type { ExerciseTask } from '@/src/features/exercises/types';
import { useLocalSearchParams } from 'expo-router';
import { TaskInstructionScreen } from './TaskInstructionScreen';

type TaskInstructionRouteProps = {
  taskId: ExerciseTask['id'];
};

export function TaskInstructionRoute({ taskId }: TaskInstructionRouteProps) {
  const { taskId: routeTaskId, week } = useLocalSearchParams<{
    taskId?: string;
    week?: string;
  }>();
  const task = taskContent[taskId];

  return (
    <TaskInstructionScreen
      task={task}
      nextRoute={task.nextRoute}
      nextRouteParams={routeTaskId ? { taskId: routeTaskId, ...(week ? { week } : {}) } : undefined}
    />
  );
}
