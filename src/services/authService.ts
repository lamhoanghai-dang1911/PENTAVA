import { API_ENDPOINTS } from "../constants/api";
import apiClient, { setAccessToken } from "./apiClient";

type RegisterData = {
  email: string;
  password: string;
  name: string;
};

type LoginData = {
  email: string;
  password: string;
};

type VerifyOtpData = {
  email: string;
  otpCode: string;
};

function getErrorMessage(error: any, fallback: string) {
  const responseData = error?.response?.data;
  const validationErrors = responseData?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join("\n");
  }

  return (
    responseData?.message ||
    responseData?.error ||
    error?.message ||
    fallback
  );
}

export const authService = {
  // Đăng ký
  async register(data: RegisterData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: data.email,
        password: data.password,
        name: data.name,
      });

    // 2. Xác thực OTP
    async verifyOtp(data: { email: string; otpCode: string }) {
        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Xác thực OTP thất bại');
        return result;
    },

    // 2.1. Gửi lại mã OTP
    async resendOtp(email: string) {
        const response = await fetch(`${API_BASE_URL}/resend-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Không thể gửi lại mã OTP');
        return result;
    },

    // 3. Đăng nhập
    async login(data: { email: string; password: string }) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Đăng nhập thất bại');
        return result;
    },

  // Gửi lại OTP
  async resendOtp(email: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_OTP, {
        email,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, `Không thể gửi lại mã OTP (${error?.response?.status || 500})`)
      );
    }
  },

  // Đăng nhập
  async login(data: LoginData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        email: data.email,
        password: data.password,
      });

      setAccessToken(response.data?.data?.accessToken ?? null);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, `Đăng nhập thất bại (${error?.response?.status || 500})`)
      );
    }
  },

  // Google Login
  async googleLogin(idToken: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        idToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, `Đăng nhập Google thất bại`)
      );
    }
  },
};