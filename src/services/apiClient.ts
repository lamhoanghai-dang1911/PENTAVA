import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null =
  "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJoYWl0aGFuaHZ1MDUwMUBnbWFpbC5jb20iLCJpYXQiOjE3ODkyODMwNjMsImV4cCI6MTc4OTM2OTQ2M30.AZRaEzQ0BLMXv7LsaDgEdcb5N4lIU_99kYYz7yJ52Qpc8ySlQvXDaVKrlqg-h4eR";

export function setAccessToken(token: string | null) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default apiClient;
