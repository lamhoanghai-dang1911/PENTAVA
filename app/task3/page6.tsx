import { TaskCameraCaptureScreen } from '@/src/features/exercises/components/TaskCameraFlow';
import { useLocalSearchParams } from 'expo-router';

export default function Task3Page6() {
  const routeParams = useLocalSearchParams<{ taskId?: string; week?: string; selectedItems?: string }>();
  return <TaskCameraCaptureScreen reviewPathname="/task3/page7" routeParams={routeParams} />;
}
