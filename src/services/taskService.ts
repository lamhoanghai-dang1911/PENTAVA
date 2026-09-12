import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
    TaskListResponse,
    TaskProgressRequestDTO,
    TaskResponse,
} from "@/src/types/api/task";

export const taskService = {
  async getTasksByWeek(week: number): Promise<TaskListResponse> {
    const response = await apiClient.get(API_ENDPOINTS.TASK.GET_BY_WEEK, {
      params: { week },
    });
    return response.data;
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
