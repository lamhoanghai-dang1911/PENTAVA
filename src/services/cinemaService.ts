import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import type {
  CreateSocialPostRequest,
  GoalSummary,
  GoalWeeksResponse,
  Clip,
  SocialPost,
  WeekPhotosResponse,
} from "@/src/types/api/cinema";

export const cinemaService = {
  async getGoals(): Promise<GoalSummary[]> {
    const response = await apiClient.get<GoalSummary[]>(
      API_ENDPOINTS.CINEMA.GOALS,
    );
    return response.data;
  },

  async getGoalWeeks(goalId: number): Promise<GoalWeeksResponse> {
    const response = await apiClient.get<GoalWeeksResponse>(
      API_ENDPOINTS.CINEMA.GOAL_WEEKS(goalId),
    );
    return response.data;
  },

  async getGoalWeekPhotos(
    goalId: number,
    weekNumber: number,
  ): Promise<WeekPhotosResponse> {
    const response = await apiClient.get<WeekPhotosResponse>(
      API_ENDPOINTS.CINEMA.GOAL_WEEK_PHOTOS(goalId, weekNumber),
    );
    return response.data;
  },

  async createClip(
    goalId: number,
    weekNumber: number,
    photoIds: number[],
  ): Promise<Clip> {
    const response = await apiClient.post<Clip>(
      API_ENDPOINTS.CINEMA.CREATE_CLIP(goalId, weekNumber),
      { photoIds },
    );
    return response.data;
  },

  async getClip(clipId: number): Promise<Clip> {
    const response = await apiClient.get<Clip>(API_ENDPOINTS.CINEMA.GET_CLIP(clipId));
    return response.data;
  },

  async getClips(goalId: number, weekNumber: number): Promise<Clip[]> {
    const response = await apiClient.get<Clip[]>(
      API_ENDPOINTS.CINEMA.GET_CLIPS(goalId, weekNumber),
    );
    return response.data;
  },

  async createSocialPost(request: CreateSocialPostRequest): Promise<SocialPost> {
    const response = await apiClient.post<SocialPost>(
      API_ENDPOINTS.SOCIAL.CREATE_POST,
      request,
    );
    return response.data;
  },
};
