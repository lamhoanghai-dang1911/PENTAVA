import { API_ENDPOINTS } from "@/src/constants/api";
import type { OnboardingData } from "@/src/context/onboarding-context";
import apiClient from "@/src/services/apiClient";
import type {
  CurrentGoalResponse,
  CurrentStreakResponse,
  GoalProgressionRequestDTO,
  OnboardingRequestDTO,
  OnboardingSubmitResponse,
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
      !data.goals[0] ||
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
      primaryGoal: data.goals[0],
      routineType: data.routine,
      sleepHours: data.sleepHours,
      exerciseFrequency: data.exerciseFrequency,
      stressFrequency: data.stressFrequency,
      screenTime: data.screenTime,
      habitDuration: data.habitDuration,
      freeTimes: data.freeTimes,
    });
  },

  //cái này là sau khi nhập xong hết vào thì nó sẽ gọi cái này
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

};
