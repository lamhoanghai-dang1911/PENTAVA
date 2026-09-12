import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken: string | null =
  "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJoYWl0aGFuaHZ1MDUwMUBnbWFpbC5jb20iLCJpYXQiOjE3ODkxOTI1MjMsImV4cCI6MTc4OTI3ODkyM30.eiP3aKbap4MWJHIyqw5Cxe3p1rpwmFs2KUob5BSc1WGvAXaaGEBRnfIU0w2Bz2JQ";

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
