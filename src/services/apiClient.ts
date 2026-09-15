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
  const isAuthRequest = config.url?.startsWith("/api/auth/");

  if (!isAuthRequest && !accessToken) {
    accessToken = await getStoredAccessToken();
  }

  if (!isAuthRequest && accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (__DEV__) {
    console.log("API REQUEST:", config.method?.toUpperCase(), `${config.baseURL ?? ""}${config.url ?? ""}`);
  }

  return config;
});

export default apiClient;
