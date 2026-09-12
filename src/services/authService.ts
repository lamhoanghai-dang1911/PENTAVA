import apiClient from "./apiClient";
import { API_ENDPOINTS } from "../constants/api";

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
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
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

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, `Đăng ký thất bại (${error?.response?.status || 500})`)
      );
    }
  },

  // Xác thực OTP
  async verifyOtp(data: VerifyOtpData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        email: data.email,
        otpCode: data.otpCode,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(error, `Xác thực OTP thất bại (${error?.response?.status || 500})`)
      );
    }
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