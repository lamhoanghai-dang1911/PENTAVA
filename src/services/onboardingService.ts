import { API_ENDPOINTS } from "@/src/constants/api";
import type { OnboardingData } from "@/src/types/onboarding";
import apiClient from "@/src/services/apiClient";
import type {
  CreateCustomGoalRequest,
  CurrentGoalResponse,
  CurrentStreakResponse,
  GoalAssessmentContextResponse,
  GoalAssessmentReportResponse,
  GoalAssessmentRequest,
  GoalProgressionRequestDTO,
  GoalRenewalRequest,
  OnboardingRequestDTO,
  OnboardingSubmitResponse,
  PastGoalCatalog,
  PastTasksCatalogResponse,
  PublicGoalSummary,
  PublicGoalsResponse,
} from "@/src/types/api/onboarding";

function getErrorMessage(error: any, fallback: string) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export const onboardingService = {
  async submit(data: OnboardingRequestDTO): Promise<OnboardingSubmitResponse> {
    const response = await apiClient.post("/api/onboarding/submit", data);
    return response.data;
  },

  async submitFromContext(data: OnboardingData) {
    if (
      !data.gender ||
      !data.age ||
      !data.goals ||
      !data.routine ||
      !data.sleepHours ||
      !data.exerciseFrequency ||
      !data.stressFrequency ||
      !data.screenTime ||
      !data.habitDuration
    ) {
      console.log("Thông tin onboarding chưa đầy đủ.");
      return null;
    }

    return onboardingService.submit({
      name: data.name,
      gender: data.gender,
      age: data.age,
      primaryGoal: data.goals,
      routineType: data.routine,
      sleepHours: data.sleepHours,
      exerciseFrequency: data.exerciseFrequency,
      stressFrequency: data.stressFrequency,
      screenTime: data.screenTime,
      habitDuration: data.habitDuration,
      freeTimes: data.freeTimes,
    });
  },

  async progressGoal(data: GoalProgressionRequestDTO) {
    const response = await apiClient.post("/api/onboarding/next-goal", data);
    return response.data;
  },

  async getCurrentGoal(): Promise<CurrentGoalResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ONBOARDING.CURRENT_GOAL);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Không thể lấy mục tiêu hiện tại (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  async getCurrentStreak(): Promise<CurrentStreakResponse> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ONBOARDING.CURRENT_STREAK);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Không thể lấy chuỗi ngày hiện tại (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  async getPastTasksCatalog(): Promise<PastGoalCatalog[]> {
    try {
      const response = await apiClient.get<PastTasksCatalogResponse>(
        API_ENDPOINTS.ONBOARDING.PAST_CATALOG
      );
      return response.data.pastTaskCatalog ?? [];
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể tải danh mục nhiệm vụ quá khứ.")
      );
    }
  },

  async createCustomGoal(data: CreateCustomGoalRequest): Promise<{ goalId: number; message: string }> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ONBOARDING.CUSTOM_GOAL,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể tạo lộ trình tự thiết kế.")
      );
    }
  },

  async updateGoalVisibility(goalId: number, isPublic: boolean): Promise<any> {
    try {
      const response = await apiClient.put(
        API_ENDPOINTS.ONBOARDING.GOAL_VISIBILITY(goalId),
        { isPublic }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể cập nhật trạng thái công khai.")
      );
    }
  },

  async getPublicGoals(): Promise<PublicGoalSummary[]> {
    try {
      const response = await apiClient.get<PublicGoalsResponse>(
        API_ENDPOINTS.ONBOARDING.PUBLIC_GOALS
      );
      return response.data.publicGoals ?? [];
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể tải danh sách lộ trình cộng đồng.")
      );
    }
  },

  async clonePublicGoal(publicGoalId: number): Promise<{ goalId: number; message: string }> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ONBOARDING.CLONE_PUBLIC_GOAL(publicGoalId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể sao chép lộ trình cộng đồng.")
      );
    }
  },

  // ==========================================
  // ĐÁNH GIÁ ĐẦU RA & BÁO CÁO CHUYỂN HÓA
  // ==========================================

  async getAssessmentContext(goalId: number): Promise<GoalAssessmentContextResponse> {
    try {
      const response = await apiClient.get<GoalAssessmentContextResponse>(
        API_ENDPOINTS.ONBOARDING.ASSESSMENT_CONTEXT(goalId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể lấy thông tin đánh giá mục tiêu.")
      );
    }
  },

  async submitAssessment(
    goalId: number,
    data: GoalAssessmentRequest
  ): Promise<GoalAssessmentReportResponse> {
    try {
      const response = await apiClient.post<GoalAssessmentReportResponse>(
        API_ENDPOINTS.ONBOARDING.SUBMIT_ASSESSMENT(goalId),
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể nộp kết quả đánh giá mục tiêu.")
      );
    }
  },

  async getAssessmentReport(goalId: number): Promise<GoalAssessmentReportResponse> {
    try {
      const response = await apiClient.get<GoalAssessmentReportResponse>(
        API_ENDPOINTS.ONBOARDING.ASSESSMENT_REPORT(goalId)
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể tải báo cáo đánh giá mục tiêu.")
      );
    }
  },

  async renewGoal(data: GoalRenewalRequest): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.ONBOARDING.RENEWAL,
        data
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, "Không thể thiết lập mục tiêu mới.")
      );
    }
  },
};
