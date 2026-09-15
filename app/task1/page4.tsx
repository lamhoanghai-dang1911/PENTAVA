import { TaskCameraCaptureScreen } from '@/src/features/exercises/components/TaskCameraFlow';
import { useLocalSearchParams } from 'expo-router';

export default function Page4() {
  const routeParams = useLocalSearchParams<{ taskId?: string; week?: string; selectedItems?: string }>();
  return <TaskCameraCaptureScreen reviewPathname="/task1/page5" routeParams={routeParams} />;
}
