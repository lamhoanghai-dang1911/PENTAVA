import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { taskService } from '@/src/services/taskService';
import type { DailyTaskStatus } from '@/src/types/api/task';

export function useHomeDailyTasks(goalId: number | null) {
  const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
  const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
  const [isDailyStatusLoading, setIsDailyStatusLoading] = useState(false);
  const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);

  const handleChooseNewTasks = useCallback(() => {
    if (!goalId) return;
    setIsDailyStatusVisible(false);
    router.push({ pathname: '/mood', params: { goalId: String(goalId) } } as any);
  }, [goalId]);

  const handleExecuteGoal = useCallback(async () => {
    if (!goalId) {
      Alert.alert('Không thể thực thi', 'Không tìm thấy mục tiêu hiện tại của bạn.');
      return;
    }

    setIsDailyStatusLoading(true);
    try {
      const response = await taskService.getDailyTaskStatus(goalId);
      const status = response.dailyTaskStatus;
      if (!status) {
        throw new Error(response.message || 'Không nhận được trạng thái nhiệm vụ trong ngày.');
      }

      setDailyStatus(status);
      if (status.yesterdayTasks.length > 0) setIsDailyStatusVisible(true);
      else handleChooseNewTasks();
    } catch (error) {
      Alert.alert(
        'Không thể tải nhiệm vụ',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      );
    } finally {
      setIsDailyStatusLoading(false);
    }
  }, [goalId, handleChooseNewTasks]);

  const handleKeepYesterdayTasks = useCallback(async () => {
    if (!goalId || !dailyStatus?.yesterdayTasks.length) return;

    setIsConfirmingDailyTasks(true);
    try {
      await taskService.confirmDailyTasks({
        goalId,
        selectedTaskIds: dailyStatus.yesterdayTasks.map((task) => task.id),
      });
      setIsDailyStatusVisible(false);
      router.push('/daily-tasks');
    } catch (error) {
      Alert.alert(
        'Không thể giữ nhiệm vụ',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      );
    } finally {
      setIsConfirmingDailyTasks(false);
    }
  }, [dailyStatus, goalId]);

  return {
    dailyStatus,
    isDailyStatusVisible,
    isDailyStatusLoading,
    isConfirmingDailyTasks,
    setIsDailyStatusVisible,
    handleChooseNewTasks,
    handleExecuteGoal,
    handleKeepYesterdayTasks,
  };
}
