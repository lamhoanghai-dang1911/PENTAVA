import { TaskInstructionScreen } from '@/src/features/exercises/components/TaskInstructionScreen';
import { taskContent } from '@/src/features/exercises/data/task-content';

export default function Task3Page1() {
  return <TaskInstructionScreen task={taskContent.task3} nextRoute={taskContent.task3.nextRoute} />;
}
