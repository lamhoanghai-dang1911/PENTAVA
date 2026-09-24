import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { getAccessToken as getStoredAccessToken } from "./authStorage";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null = null;

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

apiClient.interceptors.request.use(async (config) => {
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
  const isPublicAuthRequest = publicAuthEndpoints.includes(config.url ?? "");

  if (!isPublicAuthRequest && !accessToken) {
    accessToken = await getStoredAccessToken();
  }

  if (!isPublicAuthRequest && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (!isPublicAuthRequest && !accessToken) {
    throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  }

  return config;
});

export default apiClient;
