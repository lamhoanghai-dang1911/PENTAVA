import { create, isAxiosError } from "axios";
import { API_BASE_URL } from "../constants/api";
import {
  clearCurrentUser,
  getAccessToken as getStoredAccessToken,
  removeAccessToken,
} from "./authStorage";

const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

const publicAuthEndpoints = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/google",
  "/api/auth/verify-otp",
  "/api/auth/resend-otp",
  "/api/auth/forgot-password",
  "/api/auth/verify-reset-otp",
  "/api/auth/reset-password",
];

function isPublicAuthRequest(url?: string) {
  return publicAuthEndpoints.includes(url ?? "");
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export async function restoreAccessToken() {
  accessToken = await getStoredAccessToken();
  return accessToken;
}

export async function clearAuthenticationSession() {
  accessToken = null;
  await Promise.all([removeAccessToken(), clearCurrentUser()]);
}

apiClient.interceptors.request.use(async (config) => {
  const isPublic = isPublicAuthRequest(config.url);

  if (!isPublic && !accessToken) {
    accessToken = await getStoredAccessToken();
  }

  if (!isPublic && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (!isPublic && !accessToken) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      !isPublicAuthRequest(error.config?.url)
    ) {
      try {
        await clearAuthenticationSession();
      } catch (storageError) {
        console.error("Unable to clear the expired authentication session.", storageError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
