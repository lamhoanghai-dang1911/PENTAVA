export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.89:8080";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESEND_OTP: "/api/auth/resend-otp",
    LOGIN: "/api/auth/login",
    GOOGLE_LOGIN: "/api/auth/google",
  },
  TASK: {
    GET_BY_WEEK: "/api/onboarding/tasks",
    GET_PROGRESS: (taskId: number) =>
      `/api/onboarding/tasks/${taskId}/progress`,
    SAVE_PROGRESS_ITEMS: (taskId: number) =>
      `/api/onboarding/tasks/${taskId}/progress/items`,
    COMPLETE: (taskId: number) => `/api/onboarding/tasks/${taskId}/complete`,
  },
};