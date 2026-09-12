import { API_BASE_URL, API_ENDPOINTS } from "../constants/api";

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

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
}

export const authService = {
  // Đăng ký
  async register(data: RegisterData) {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`;

    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("REGISTER URL:", url);
    console.log("REGISTER BODY:", {
      email: data.email,
      password: "******",
      name: data.name,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        name: data.name,
      }),
    });

    const result = await parseResponse(response);

    console.log("REGISTER STATUS:", response.status);
    console.log("REGISTER RESPONSE:", result);

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        `Đăng ký thất bại (${response.status})`
      );
    }

    return result;
  },

  // Xác thực OTP
  async verifyOtp(data: VerifyOtpData) {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.VERIFY_OTP}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          otpCode: data.otpCode,
        }),
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        `Xác thực OTP thất bại (${response.status})`
      );
    }

    return result;
  },

  // Gửi lại OTP
  async resendOtp(email: string) {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.RESEND_OTP}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        `Không thể gửi lại mã OTP (${response.status})`
      );
    }

    return result;
  },

  // Đăng nhập
  async login(data: LoginData) {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        `Đăng nhập thất bại (${response.status})`
      );
    }

    return result;
  },

  // Google Login
  async googleLogin(idToken: string) {
    const response = await fetch(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ idToken }),
      }
    );

    const result = await parseResponse(response);

    if (!response.ok) {
      throw new Error(
        result?.message || "Đăng nhập Google thất bại"
      );
    }

    return result;
  },
};