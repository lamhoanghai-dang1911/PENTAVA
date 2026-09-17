import type { DailyTaskStatus, TaskHistoryEntry } from "@/src/types/api/task";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASK_HISTORY_PREFIX = "@pentava/task-history";
const DAILY_STATUS_PREFIX = "@pentava/daily-status";

function getKey(prefix: string, userId: string, identifier: string) {
  return `${prefix}:${userId}:${identifier}`;
}

export async function getCachedTaskHistory(
  userId: string,
  startDate: string,
  endDate: string,
) {
  if (userId === "anonymous") return null;

  const value = await AsyncStorage.getItem(
    getKey(TASK_HISTORY_PREFIX, userId, `${startDate}:${endDate}`),
  );
  return value ? (JSON.parse(value) as TaskHistoryEntry[]) : null;
}

export async function cacheTaskHistory(
  userId: string,
  startDate: string,
  endDate: string,
  history: TaskHistoryEntry[],
) {
  if (userId === "anonymous") return;

  await AsyncStorage.setItem(
    getKey(TASK_HISTORY_PREFIX, userId, `${startDate}:${endDate}`),
    JSON.stringify(history),
  );
}

export async function getCachedDailyStatus(userId: string, goalId: number) {
  if (userId === "anonymous") return null;

  const value = await AsyncStorage.getItem(
    getKey(DAILY_STATUS_PREFIX, userId, String(goalId)),
  );
  return value ? (JSON.parse(value) as DailyTaskStatus) : null;
}

export async function cacheDailyStatus(
  userId: string,
  goalId: number,
  status: DailyTaskStatus | null,
) {
  if (userId === "anonymous" || !status) return;

  await AsyncStorage.setItem(
    getKey(DAILY_STATUS_PREFIX, userId, String(goalId)),
    JSON.stringify(status),
  );
}
