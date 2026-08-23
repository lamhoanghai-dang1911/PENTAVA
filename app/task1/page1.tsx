import { TaskInstructionScreen } from '@/src/features/exercises/components/TaskInstructionScreen';
import { taskContent } from '@/src/features/exercises/data/task-content';

export default function Page1() {
  return <TaskInstructionScreen task={taskContent.task1} nextRoute={taskContent.task1.nextRoute} />;
}
