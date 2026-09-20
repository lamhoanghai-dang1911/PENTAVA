import { TaskCameraCaptureScreen } from '@/src/features/exercises/components/TaskCameraFlow';
import { useLocalSearchParams } from 'expo-router';

export default function Page4() {
  const routeParams = useLocalSearchParams<{ taskId?: string; progressId?: string; week?: string; selectedItems?: string }>();
  return <TaskCameraCaptureScreen reviewPathname="/task5/page4" routeParams={routeParams} />;
}
