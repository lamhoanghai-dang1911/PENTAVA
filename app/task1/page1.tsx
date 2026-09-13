import { TaskInstructionScreen } from '@/src/features/exercises/components/TaskInstructionScreen';
import { taskContent } from '@/src/features/exercises/data/task-content';
import { useLocalSearchParams } from 'expo-router';

export default function Page1() {
  const { taskId, week } = useLocalSearchParams<{ taskId?: string; week?: string }>();

  return (
    <TaskInstructionScreen
      task={taskContent.task1}
      nextRoute={taskContent.task1.nextRoute}
      nextRouteParams={taskId ? { taskId, ...(week ? { week } : {}) } : undefined}
    />
  );
}
