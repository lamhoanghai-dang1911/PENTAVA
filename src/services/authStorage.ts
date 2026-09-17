import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "@pentava/current-user";
const ACCESS_TOKEN_KEY = "@pentava/access-token";

//khúc này có thể coi và chỉnh lại việc lưu auth
type AuthResponse = {
  id?: string | number;
  userId?: string | number;
  email?: string;
  data?: {
    id?: string | number;
    userId?: string | number;
    email?: string;
    user?: {
      id?: string | number;
      email?: string;
    };
  };
  user?: {
    id?: string | number;
    email?: string;
  };
};

const authStateListeners = new Set<(userId: string | null) => void>();

export async function saveCurrentUser(
  response: AuthResponse,
  fallbackEmail?: string,
) {
  const source = response.data ?? response;
  const user = source.user ?? source;
  const userId = user.id ?? source.userId ?? user.email ?? fallbackEmail;

  if (!userId) {
    return;
  }

  await AsyncStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      userId: String(userId),
      email: user.email ?? fallbackEmail,
    }),
  );
  authStateListeners.forEach((listener) => listener(String(userId)));
}

export async function getCurrentUserId() {
  const value = await AsyncStorage.getItem(CURRENT_USER_KEY);

  if (!value) {
    return "anonymous";
  }

  try {
    const user = JSON.parse(value) as { userId?: string };
    return user.userId || "anonymous";
  } catch {
    return "anonymous";
  }
}

export async function saveAccessToken(token: string) {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function removeAccessToken() {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function clearCurrentUser() {
  await AsyncStorage.removeItem(CURRENT_USER_KEY);
  authStateListeners.forEach((listener) => listener(null));
}

export function subscribeAuthState(listener: (userId: string | null) => void) {
  authStateListeners.add(listener);
  return () => authStateListeners.delete(listener);
}
