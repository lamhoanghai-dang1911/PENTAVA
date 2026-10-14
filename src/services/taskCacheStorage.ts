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

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type CachedDailyStatusPayload = {
  date: string;
  status: DailyTaskStatus;
};

export async function getCachedDailyStatus(userId: string, goalId: number) {
  if (userId === "anonymous") return null;

  const value = await AsyncStorage.getItem(
    getKey(DAILY_STATUS_PREFIX, userId, String(goalId)),
  );
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    // Nếu cache có bọc date
    if (parsed && typeof parsed === "object" && "date" in parsed && "status" in parsed) {
      const payload = parsed as CachedDailyStatusPayload;
      if (payload.date !== getLocalDateString()) {
        // Cache của ngày cũ -> Không dùng để tránh nhầm đã xác nhận nhiệm vụ hôm nay
        return null;
      }
      return payload.status;
    }

    // Dữ liệu cache cũ chưa có date: nếu đã có confirmedToday thì bỏ qua vì có thể là ngày cũ
    const legacy = parsed as DailyTaskStatus;
    if (legacy?.hasConfirmedToday) {
      return null;
    }
    return legacy;
  } catch {
    return null;
  }
}

export async function cacheDailyStatus(
  userId: string,
  goalId: number,
  status: DailyTaskStatus | null,
) {
  if (userId === "anonymous" || !status) return;

  const payload: CachedDailyStatusPayload = {
    date: getLocalDateString(),
    status,
  };

  await AsyncStorage.setItem(
    getKey(DAILY_STATUS_PREFIX, userId, String(goalId)),
    JSON.stringify(payload),
  );
}
