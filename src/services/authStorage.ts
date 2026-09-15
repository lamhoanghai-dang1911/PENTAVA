import AsyncStorage from "@react-native-async-storage/async-storage";

const CURRENT_USER_KEY = "@pentava/current-user";
const ACCESS_TOKEN_KEY = "@pentava/access-token";

type AuthResponse = {
  id?: string | number;
  userId?: string | number;
  email?: string;
  user?: {
    id?: string | number;
    email?: string;
  };
};

export async function saveCurrentUser(
  response: AuthResponse,
  fallbackEmail?: string,
) {
  const user = response.user ?? response;
  const userId = user.id ?? response.userId ?? user.email ?? fallbackEmail;

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
