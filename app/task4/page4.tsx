import { TaskCameraCaptureScreen } from '@/src/components/task-camera-flow';
import { useLocalSearchParams } from 'expo-router';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Task4Page4() {
  const routeParams = useLocalSearchParams<{
    taskId?: string;
    progressId?: string;
    week?: string;
    selectedItems?: string;
  }>();

  return (
    <TaskCameraCaptureScreen
      reviewPathname="/task4/page5"   // <-- IMPORTANT
      routeParams={routeParams}
    />
  );
}

/* style definitions … */
