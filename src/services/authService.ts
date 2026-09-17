import { API_ENDPOINTS } from "../constants/api";
import apiClient, { setAccessToken } from "./apiClient";
import { saveAccessToken, saveCurrentUser } from "./authStorage";

type RegisterData = {
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginData = {
  email: string;
  password: string;
};

type VerifyOtpData = {
  email: string;
  otpCode: string;
};

type VerifyResetOtpData = VerifyOtpData;

type ResetPasswordData = {
  resetToken: string;
  newPassword: string;
};

function getErrorMessage(error: any, fallback: string) {
  if (error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT") {
    return "Kết nối máy chủ quá thời gian. Hãy kiểm tra điện thoại và máy tính cùng Wi-Fi, sau đó thử lại.";
  }

  if (!error?.response && error?.request) {
    return "Không thể kết nối đến máy chủ. Hãy kiểm tra địa chỉ API và mạng Wi-Fi.";
  }

  const responseData = error?.response?.data;
  const validationErrors = responseData?.errors;

  if (Array.isArray(validationErrors) && validationErrors.length > 0) {
    return validationErrors
      .map((item) => (typeof item === "string" ? item : item?.message))
      .filter(Boolean)
      .join("\n");
  }

  return (
    responseData?.message || responseData?.error || error?.message || fallback
  );
}

function getAccessTokenFromResponse(responseData: any) {
  return (
    responseData?.data?.accessToken ??
    responseData?.accessToken ??
    responseData?.data?.token ??
    responseData?.token ??
    null
  );
}

export const authService = {
  // Đăng ký
  async register(data: RegisterData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Đăng ký thất bại (${error?.response?.status || 500})`,
        ),
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
        getErrorMessage(
          error,
          `Xác thực OTP thất bại (${error?.response?.status || 500})`,
        ),
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
        getErrorMessage(
          error,
          `Không thể gửi lại mã OTP (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  // Gửi OTP đặt lại mật khẩu
  async forgotPassword(email: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Không thể gửi OTP đặt lại mật khẩu (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  // Xác thực OTP đặt lại mật khẩu
  async verifyResetOtp(data: VerifyResetOtpData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.VERIFY_RESET_OTP, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Xác thực OTP đặt lại mật khẩu thất bại (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  // Đặt mật khẩu mới
  async resetPassword(data: ResetPasswordData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Đặt lại mật khẩu thất bại (${error?.response?.status || 500})`,
        ),
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

      const accessToken = getAccessTokenFromResponse(response.data);
      setAccessToken(accessToken ?? null);
      if (accessToken) {
        await saveAccessToken(accessToken);
      }
      await saveCurrentUser(response.data, data.email);
      return response.data;
    } catch (error: any) {
      throw new Error(
        getErrorMessage(
          error,
          `Đăng nhập thất bại (${error?.response?.status || 500})`,
        ),
      );
    }
  },

  // Google Login
  async googleLogin(idToken: string) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        idToken,
      });

      const accessToken = getAccessTokenFromResponse(response.data);
      setAccessToken(accessToken ?? null);
      if (accessToken) {
        await saveAccessToken(accessToken);
      }

      await saveCurrentUser(response.data);

      return response.data;
    } catch (error: any) {
      throw new Error(getErrorMessage(error, `Đăng nhập Google thất bại`));
    }
  },
};
