import { TASK_WEEKS } from "@/src/features/tasks/constants";
import { buildDateStrip } from "@/src/features/tasks/task-utils";
import type { UseDailyTasksOptions } from "@/src/features/tasks/types/use-daily-tasks";
import { getCurrentUserId } from "@/src/services/authStorage";
import { onboardingService } from "@/src/services/onboardingService";
import {
    cacheDailyStatus,
    cacheTaskHistory,
    getCachedDailyStatus,
    getCachedTaskHistory,
} from "@/src/services/taskCacheStorage";
import { taskService } from "@/src/services/taskService";
import type { CurrentStreak } from "@/src/types/api/onboarding";
import type {
    DailyTaskStatus,
    Task,
    TaskHistoryEntry,
} from "@/src/types/api/task";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Đã có lỗi xảy ra.";
}

export function useDailyTasks({
  onOpenMoodSelection,
  onOpenTask,
}: UseDailyTasksOptions) {
  const [weekNumber, setWeekNumber] = useState(1);
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    (new Date().getDay() + 6) % 7,
  );
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
  const [isDailyStatusLoaded, setIsDailyStatusLoaded] = useState(false);
  const [isDailyStatusLoading, setIsDailyStatusLoading] = useState(false);
  const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
  const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
  const [swapTask, setSwapTask] = useState<Task | null>(null);
  const [swapCandidates, setSwapCandidates] = useState<Task[]>([]);
  const [isSwapLoading, setIsSwapLoading] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [completedStreak, setCompletedStreak] = useState<CurrentStreak | null>(
    null,
  );
  const [isStreakVisible, setIsStreakVisible] = useState(false);
  const dates = useMemo(() => buildDateStrip(weekNumber), [weekNumber]);
  const todayKey = getDateKey(new Date());
  const selectedDate = dates[selectedDayIndex]?.dateKey;
  const isTodaySelected = selectedDate === todayKey;
  const isFutureSelected = Boolean(selectedDate && selectedDate > todayKey);
  const selectedTasks = isTodaySelected
    ? (dailyStatus?.todayTasks ?? [])
    : isFutureSelected
      ? []
      : (taskHistory.find((entry) => entry.taskDate === selectedDate)?.tasks ??
        []);

  useEffect(() => {
    let isActive = true;

    const loadTaskHistory = async () => {
      setIsLoading(true);
      try {
        const userId = await getCurrentUserId();
        const startDate = dates[0].dateKey;
        const endDate = dates[dates.length - 1].dateKey;
        const cachedHistory = await getCachedTaskHistory(
          userId,
          startDate,
          endDate,
        );
        if (isActive && cachedHistory) {
          setTaskHistory(cachedHistory);
          setIsLoading(false);
          return;
        }

        const response = await taskService.getTaskHistory(startDate, endDate);
        const history = response.taskHistory ?? [];
        if (isActive)
          await cacheTaskHistory(userId, startDate, endDate, history);
        if (isActive) setTaskHistory(history);
      } catch (error) {
        if (isActive)
          Alert.alert("Không thể tải lịch sử nhiệm vụ", getErrorMessage(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadTaskHistory();
    return () => {
      isActive = false;
    };
  }, [dates]);

  useEffect(() => {
    let isActive = true;

    const loadDailyStatus = async () => {
      try {
        const goalResponse = await onboardingService.getCurrentGoal();
        const goalId = goalResponse.currentGoal?.goalId ?? null;
        if (!goalId || !isActive) return;

        const userId = await getCurrentUserId();
        const cachedStatus = await getCachedDailyStatus(userId, goalId);
        if (isActive && cachedStatus) {
          setCurrentGoalId(goalId);
          setDailyStatus(cachedStatus);
          setIsDailyStatusLoaded(true);
          return;
        }

        const statusResponse = await taskService.getDailyTaskStatus(goalId);
        if (isActive) {
          setCurrentGoalId(goalId);
          setDailyStatus(statusResponse.dailyTaskStatus);
          setIsDailyStatusLoaded(true);
        }
        if (isActive)
          await cacheDailyStatus(
            userId,
            goalId,
            statusResponse.dailyTaskStatus,
          );
      } catch (error) {
        if (isActive)
          Alert.alert(
            "Không thể tải trạng thái nhiệm vụ",
            getErrorMessage(error),
          );
      }
    };

    void loadDailyStatus();
    return () => {
      isActive = false;
    };
  }, []);

  const openMoodSelection = () => {
    if (!currentGoalId) {
      Alert.alert(
        "Không thể thực thi",
        "Không tìm thấy mục tiêu hiện tại của bạn.",
      );
      return;
    }

    setIsDailyStatusVisible(false);
    onOpenMoodSelection(currentGoalId);
  };

  const handleExecuteToday = async () => {
    if (!currentGoalId) {
      Alert.alert(
        "Không thể thực thi",
        "Không tìm thấy mục tiêu hiện tại của bạn.",
      );
      return;
    }

    setIsDailyStatusLoading(true);
    try {
      const response = await taskService.getDailyTaskStatus(currentGoalId);
      const status = response.dailyTaskStatus;
      if (!status)
        throw new Error(
          response.message || "Không nhận được trạng thái nhiệm vụ trong ngày.",
        );

      setDailyStatus(status);
      await cacheDailyStatus(await getCurrentUserId(), currentGoalId, status);
      if (status.hasConfirmedToday) return;
      if (status.yesterdayTasks.length > 0) setIsDailyStatusVisible(true);
      else openMoodSelection();
    } catch (error) {
      Alert.alert("Không thể tải nhiệm vụ", getErrorMessage(error));
    } finally {
      setIsDailyStatusLoading(false);
    }
  };

  const handleKeepYesterdayTasks = async () => {
    if (!currentGoalId || !dailyStatus?.yesterdayTasks.length) return;

    setIsConfirmingDailyTasks(true);
    try {
      await taskService.confirmDailyTasks({
        goalId: currentGoalId,
        selectedTaskIds: dailyStatus.yesterdayTasks.map((task) => task.id),
      });
      const response = await taskService.getDailyTaskStatus(currentGoalId);
      setDailyStatus(response.dailyTaskStatus);
      await cacheDailyStatus(
        await getCurrentUserId(),
        currentGoalId,
        response.dailyTaskStatus,
      );
      setIsDailyStatusVisible(false);
    } catch (error) {
      Alert.alert("Không thể giữ nhiệm vụ", getErrorMessage(error));
    } finally {
      setIsConfirmingDailyTasks(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (task.isCompleted) return;

    setCompletingTaskId(task.id);
    try {
      await taskService.completeTask(task.id);
      const updatedTasks = (dailyStatus?.todayTasks ?? []).map((item) =>
        item.id === task.id ? { ...item, isCompleted: true } : item,
      );
      setDailyStatus((current) =>
        current ? { ...current, todayTasks: updatedTasks } : current,
      );
      if (currentGoalId && dailyStatus) {
        await cacheDailyStatus(await getCurrentUserId(), currentGoalId, {
          ...dailyStatus,
          todayTasks: updatedTasks,
        });
      }

      if (
        updatedTasks.length === 5 &&
        updatedTasks.every((item) => item.isCompleted)
      ) {
        const streakResponse = await onboardingService.getCurrentStreak();
        setCompletedStreak(streakResponse.streak);
        setIsStreakVisible(true);
      }
    } catch (error) {
      Alert.alert("Không thể hoàn thành nhiệm vụ", getErrorMessage(error));
    } finally {
      setCompletingTaskId(null);
    }
  };

  const openSwap = async (task: Task) => {
    if (!currentGoalId) return;

    setSwapTask(task);
    setIsSwapLoading(true);
    try {
      const responses = await Promise.all(
        TASK_WEEKS.map((week) => taskService.getTasksByWeek(week)),
      );
      const allTasks = Array.from(
        new Map(
          responses
            .flatMap((response) => response.tasks)
            .map((item) => [item.id, item]),
        ).values(),
      );
      const selectedIds = new Set(selectedTasks.map((item) => item.id));
      setSwapCandidates(
        allTasks.filter(
          (item) =>
            !selectedIds.has(item.id) &&
            (!task.moodType ||
              !item.moodType ||
              item.moodType === task.moodType),
        ),
      );
    } catch (error) {
      setSwapTask(null);
      Alert.alert("Không thể tải task thay thế", getErrorMessage(error));
    } finally {
      setIsSwapLoading(false);
    }
  };

  const handleSwapTask = async (newTask: Task) => {
    if (!currentGoalId || !swapTask) return;

    setIsSwapping(true);
    try {
      const response = await taskService.swapDailyTask({
        goalId: currentGoalId,
        oldTaskId: swapTask.id,
        newTaskId: newTask.id,
      });
      if (response.tasks?.length) {
        const updatedStatus = dailyStatus
          ? { ...dailyStatus, todayTasks: response.tasks }
          : null;
        setDailyStatus(updatedStatus);
        await cacheDailyStatus(
          await getCurrentUserId(),
          currentGoalId,
          updatedStatus,
        );
      } else {
        const statusResponse =
          await taskService.getDailyTaskStatus(currentGoalId);
        setDailyStatus(statusResponse.dailyTaskStatus);
        await cacheDailyStatus(
          await getCurrentUserId(),
          currentGoalId,
          statusResponse.dailyTaskStatus,
        );
      }
      setSwapTask(null);
    } catch (error) {
      Alert.alert("Không thể đổi nhiệm vụ", getErrorMessage(error));
    } finally {
      setIsSwapping(false);
    }
  };

  const changeWeek = (nextWeek: number) => {
    if (nextWeek < 1) return;
    setWeekNumber(nextWeek);
    setSelectedDayIndex(0);
  };

  return {
    dates,
    todayKey,
    selectedDayIndex,
    setSelectedDayIndex,
    weekNumber,
    changeWeek,
    isTodaySelected,
    isFutureSelected,
    selectedTasks,
    isLoading,
    isDailyStatusLoaded,
    dailyStatus,
    isDailyStatusLoading,
    isDailyStatusVisible,
    setIsDailyStatusVisible,
    isConfirmingDailyTasks,
    completingTaskId,
    swapTask,
    setSwapTask,
    swapCandidates,
    isSwapLoading,
    isSwapping,
    completedStreak,
    isStreakVisible,
    setIsStreakVisible,
    openMoodSelection,
    handleExecuteToday,
    handleKeepYesterdayTasks,
    handleCompleteTask,
    openSwap,
    handleSwapTask,
    openTask: onOpenTask,
  };
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
