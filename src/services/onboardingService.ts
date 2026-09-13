import type { OnboardingData } from "@/src/context/onboarding-context";
import apiClient from "@/src/services/apiClient";
import type {
    GoalProgressionRequestDTO,
    OnboardingRequestDTO,
    OnboardingSubmitResponse,
} from "@/src/types/api/onboarding";

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

};
