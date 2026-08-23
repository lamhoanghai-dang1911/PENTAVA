import { TaskInstructionScreen } from '@/src/features/exercises/components/TaskInstructionScreen';
import { taskContent } from '@/src/features/exercises/data/task-content';

export default function Task4Page1() {
  return <TaskInstructionScreen task={taskContent.task4} nextRoute={taskContent.task4.nextRoute} />;
}
