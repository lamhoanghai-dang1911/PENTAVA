import axios from "axios";

const apiClient = axios.create({
  // baseURL: process.env.EXPO_PUBLIC_API_URL,
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null =
  "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJoYWl0aGFuaHZ1MDUwMUBnbWFpbC5jb20iLCJpYXQiOjE3ODkyMDA3OTQsImV4cCI6MTc4OTI4NzE5NH0.aHejRBYaQZTGBzRUw5AlDQiS0-rq1fQjo9CnVpBVIb9yyEmgRkIhcXr-XGHB1qct";

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
