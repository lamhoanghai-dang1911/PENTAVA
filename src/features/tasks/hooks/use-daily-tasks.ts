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
import type { CurrentGoal, CurrentStreak } from "@/src/types/api/onboarding";
import type {
  DailyTaskStatus,
  Task,
  TaskHistoryEntry,
} from "@/src/types/api/task";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

function getErrorMessage(error: unknown) {
  const anyError = error as any;
  const responseData = anyError?.response?.data;
  const validationErrors = responseData?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item: any) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join("\n");
  }

  return (
    responseData?.message ||
    responseData?.error ||
    (error instanceof Error ? error.message : "Đã có lỗi xảy ra.")
  );
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
  const [currentGoal, setCurrentGoal] = useState<CurrentGoal | null>(null);
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
  const [swapSuccessVisible, setSwapSuccessVisible] = useState(false);
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
    let goalId: number | null = null;
    let cachedStatus: DailyTaskStatus | null = null;
    let cacheHasProgressIds = false;

    const loadDailyStatus = async () => {
      try {
        const goalResponse = await onboardingService.getCurrentGoal();
        goalId = goalResponse.currentGoal?.goalId ?? null;
        if (!goalId || !isActive) {
          if (isActive) {
            setIsDailyStatusLoaded(true);
          }
          return;
        }

        const userId = await getCurrentUserId();
        cachedStatus = await getCachedDailyStatus(userId, goalId);
        const cachedTasks = cachedStatus
          ? [
            ...cachedStatus.todayTasks,
            ...cachedStatus.yesterdayTasks,
          ]
          : [];
        cacheHasProgressIds = cachedTasks.every(
          (task) => task.progressId != null,
        );

        // SWR: Hiển thị ngay lập tức từ cache trong 0ms trước khi chờ network
        if (isActive && cachedStatus && cacheHasProgressIds) {
          setCurrentGoal(goalResponse.currentGoal ?? null);
          setCurrentGoalId(goalId);
          setDailyStatus(cachedStatus);
          setIsDailyStatusLoaded(true);
        }

        const statusResponse = await taskService.getDailyTaskStatus(goalId);
        if (isActive) {
          setCurrentGoal(goalResponse.currentGoal ?? null);
          setCurrentGoalId(goalId);
          setDailyStatus(statusResponse.dailyTaskStatus);
          setIsDailyStatusLoaded(true);

          if (
            statusResponse.dailyTaskStatus &&
            !statusResponse.dailyTaskStatus.hasConfirmedToday &&
            Boolean(statusResponse.dailyTaskStatus.hasYesterdayTasks) &&
            Boolean(
              statusResponse.dailyTaskStatus.yesterdayTasks &&
                statusResponse.dailyTaskStatus.yesterdayTasks.length > 0,
            )
          ) {
            setIsDailyStatusVisible(true);
          }
        }
        if (isActive)
          await cacheDailyStatus(
            userId,
            goalId,
            statusResponse.dailyTaskStatus,
          );
      } catch (error) {
        if (!isActive) return;

        if (cachedStatus && cacheHasProgressIds) {
          setCurrentGoalId(goalId);
          setDailyStatus(cachedStatus);
          setIsDailyStatusLoaded(true);
          return;
        }

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

  const handleCompleteTask = async (task: Task): Promise<boolean> => {
    if (task.isCompleted) return false;

    if (!task.progressId) {
      Alert.alert(
        "Không thể hoàn thành nhiệm vụ",
        "Nhiệm vụ chưa có thông tin tiến độ.",
      );
      return false;
    }

    // 1. Snapshot previous state for rollback
    const previousStatus = dailyStatus;

    // 2. ⚡ OPTIMISTIC UPDATE: Cập nhật UI ngay lập tức trong 0ms
    const updatedTasks = (dailyStatus?.todayTasks ?? []).map((item) =>
      item.progressId === task.progressId
        ? { ...item, isCompleted: true }
        : item,
    );
    const updatedStatus: DailyTaskStatus | null = dailyStatus
      ? {
          ...dailyStatus,
          todayTasks: updatedTasks,
        }
      : null;

    setDailyStatus(updatedStatus);
    setCompletingTaskId(task.id);

    try {
      // 3. Chỉ gọi duy nhất 1 API completeTask
      await taskService.completeTask(task.progressId);

      // 4. Ghi cache chạy ngầm (không await chặn luồng UI)
      if (currentGoalId && updatedStatus) {
        void getCurrentUserId().then((userId) => {
          void cacheDailyStatus(userId, currentGoalId, updatedStatus);
        });
      }

      // 5. Nếu hoàn thành cả 5 task, fetch streak chạy ngầm để hiển thị ăn mừng
      if (
        updatedTasks.length === 5 &&
        updatedTasks.every((item) => item.isCompleted)
      ) {
        void onboardingService
          .getCurrentStreak()
          .then((streakResponse) => {
            if (streakResponse?.streak) {
              setCompletedStreak(streakResponse.streak);
            }
          })
          .catch(() => {});
      }

      return true;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      if (/đã (được )?hoàn thành trước đó/i.test(errorMessage)) {
        if (currentGoalId && updatedStatus) {
          void getCurrentUserId().then((userId) => {
            void cacheDailyStatus(userId, currentGoalId, updatedStatus);
          });
        }
        return true;
      }

      // 🛡️ Rollback nếu thực sự xảy ra lỗi mạng
      setDailyStatus(previousStatus);
      Alert.alert("Không thể hoàn thành nhiệm vụ", errorMessage);
      return false;
    } finally {
      setCompletingTaskId(null);
    }
  };

  const candidateTasksCacheRef = useRef<Map<number, Task[]>>(new Map());

  const getCandidateTasks = async (goalId: number): Promise<Task[]> => {
    const cached = candidateTasksCacheRef.current.get(goalId);
    if (cached && cached.length > 0) {
      return cached;
    }
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
      candidateTasksCacheRef.current.set(goalId, allTasks);
      return allTasks;
    } catch (error) {
      console.warn("[getCandidateTasks] Không thể tải danh sách nhiệm vụ dự phòng:", error);
      return [];
    }
  };

  useEffect(() => {
    if (currentGoalId) {
      void getCandidateTasks(currentGoalId).catch(() => {});
    }
  }, [currentGoalId]);

  const openSwap = async (task: Task) => {
    if (!currentGoalId) return;

    setSwapTask(task);
    setIsSwapLoading(true);
    try {
      const allTasks = await getCandidateTasks(currentGoalId);
      if (allTasks.length === 0) {
        throw new Error("Không thể kết nối đến máy chủ để tải nhiệm vụ thay thế.");
      }
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
      setSwapTask(null);
      setSwapSuccessVisible(true);

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
    } catch (error) {
      Alert.alert("Không thể đổi nhiệm vụ", getErrorMessage(error));
    } finally {
      setIsSwapping(false);
    }
  };

  const showStreak = () => {
    if (completedStreak) setIsStreakVisible(true);
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
    swapSuccessVisible,
    setSwapSuccessVisible,
    completedStreak,
    isStreakVisible,
    setIsStreakVisible,
    openMoodSelection,
    handleExecuteToday,
    handleKeepYesterdayTasks,
    handleCompleteTask,
    showStreak,
    openSwap,
    handleSwapTask,
    openTask: onOpenTask,
    currentGoalId,
    currentGoal,
    isGoalMissing: isDailyStatusLoaded && !currentGoalId,
  };
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
