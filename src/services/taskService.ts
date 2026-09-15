import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
  ConfirmDailyTasksRequest,
  DailyTaskStatusResponse,
  MoodSelectionRequest,
  MoodTaskResponseEnvelope,
  SwapDailyTaskRequest,
  TaskHistoryResponse,
  TaskListResponse,
  TaskProgressRequestDTO,
  TaskResponse,
} from "@/src/types/api/task";

function getTaskErrorMessage(error: any, fallback: string) {
  const responseData = error?.response?.data;
  const validationErrors = responseData?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join("\n");
  }

  return responseData?.message || responseData?.error || error?.message || fallback;
}

export const taskService = {
  async getTasksByWeek(week: number): Promise<TaskListResponse> {
    const response = await apiClient.get(API_ENDPOINTS.TASK.GET_BY_WEEK, {
      params: { week },
    });
    return response.data;
  },

  async getTaskHistory(startDate: string, endDate: string): Promise<TaskHistoryResponse> {
    const response = await apiClient.get(API_ENDPOINTS.TASK.HISTORY, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  async getDailyTaskStatus(goalId: number): Promise<DailyTaskStatusResponse> {
    const response = await apiClient.get(API_ENDPOINTS.TASK.DAILY_STATUS, {
      params: { goalId },
    });
    return response.data;
  },

  async selectMood(data: MoodSelectionRequest): Promise<MoodTaskResponseEnvelope> {
    const response = await apiClient.post(API_ENDPOINTS.ONBOARDING.SELECT_MOOD, data);
    return response.data;
  },

  async confirmDailyTasks(data: ConfirmDailyTasksRequest): Promise<TaskResponse> {
    try {
      if (__DEV__) {
        console.log("CONFIRM DAILY PAYLOAD:", data);
      }

      const response = await apiClient.post(API_ENDPOINTS.TASK.CONFIRM_DAILY, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getTaskErrorMessage(error, `Không thể xác nhận task (${error?.response?.status || 500})`),
      );
    }
  },

  async swapDailyTask(data: SwapDailyTaskRequest): Promise<TaskListResponse> {
    try {
      if (__DEV__) {
        console.log("SWAP DAILY PAYLOAD:", data);
      }

      const response = await apiClient.post(API_ENDPOINTS.TASK.SWAP, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getTaskErrorMessage(error, `Không thể đổi nhiệm vụ (${error?.response?.status || 500})`),
      );
    }
  },

  async getProgress(taskId: number): Promise<TaskResponse> {
    const response = await apiClient.get(
      API_ENDPOINTS.TASK.GET_PROGRESS(taskId),
    );
    return response.data;
  },

  async saveProgressItems(
    taskId: number,
    data: TaskProgressRequestDTO,
  ): Promise<TaskResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.TASK.SAVE_PROGRESS_ITEMS(taskId),
      data,
    );
    return response.data;
  },

  async completeTask(
    taskId: number,
    data: TaskProgressRequestDTO = { selectedItems: [] },
  ): Promise<TaskResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.TASK.COMPLETE(taskId),
      data,
    );
    return response.data;
  },
};
