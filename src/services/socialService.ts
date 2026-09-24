import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL, API_ENDPOINTS } from "@/src/constants/api";
import { getCurrentUserId } from "@/src/services/authStorage";
import apiClient, { getAccessToken } from "@/src/services/apiClient";
import type {
  ForYouFeedResponse,
  HighFiveResponse,
  AddCommentRequest,
  FriendSuggestion,
  UpdateSocialPostRequest,
  SocialProfile,
  SocialComment,
  SocialPost,
  FriendRequest,
} from "@/src/types/api/cinema";

const FEED_LIMIT = 10;
const PENDING_FRIEND_REQUESTS_KEY = "@pentava/pending-friend-requests";

export type SocialNotification = {
  id?: number;
  userId?: number;
  eventType?: "CONNECTED" | "HIGH_FIVE" | "COMMENT" | "FRIEND_REQUEST" | "FRIEND_ACCEPTED" | string;
  actorId?: number;
  actorName?: string;
  actorAvatar?: string;
  targetUserId?: number;
  postId?: number;
  commentId?: number | null;
  message?: string;
  timestamp?: string;
  createdAt?: string;
  read?: boolean;
  [key: string]: unknown;
};

async function getPendingFriendRequestIds() {
  const currentUserId = await getCurrentUserId();
  const value = await AsyncStorage.getItem(`${PENDING_FRIEND_REQUESTS_KEY}/${currentUserId}`);
  if (!value) return [];

  try {
    const ids = JSON.parse(value) as unknown;
    return Array.isArray(ids) && ids.every((id) => typeof id === "number")
      ? ids
      : [];
  } catch {
    return [];
  }
}

export const socialService = {
  async getNotifications(page = 0, size = 20): Promise<SocialNotification[]> {
    const response = await apiClient.get<SocialNotification[]>(
      API_ENDPOINTS.SOCIAL.GET_NOTIFICATIONS,
      { params: { page, size } },
    );
    return response.data;
  },

  async getAllNotifications(): Promise<SocialNotification[]> {
    const size = 20;
    const notifications: SocialNotification[] = [];
    const seenIds = new Set<number>();
    let page = 0;
    const MAX_PAGES = 10;

    while (page < MAX_PAGES) {
      const batch = await socialService.getNotifications(page, size);
      if (!Array.isArray(batch) || batch.length === 0) break;

      let hasNew = false;
      for (const item of batch) {
        if (item.id !== undefined && item.id !== null) {
          if (!seenIds.has(item.id)) {
            seenIds.add(item.id);
            notifications.push(item);
            hasNew = true;
          }
        } else {
          notifications.push(item);
          hasNew = true;
        }
      }

      if (!hasNew || batch.length < size) {
        break;
      }
      page += 1;
    }

    return notifications;
  },

  async markNotificationAsRead(id: number): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.SOCIAL.MARK_NOTIFICATION_READ(id));
  },

  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.SOCIAL.MARK_ALL_NOTIFICATIONS_READ);
  },

  async getUnreadNotificationCount(): Promise<number> {
    const response = await apiClient.get<Record<string, unknown>>(
      API_ENDPOINTS.SOCIAL.GET_UNREAD_NOTIFICATION_COUNT,
    );
    const count = Object.values(response.data).find((value) => typeof value === "number");
    return typeof count === "number" ? count : 0;
  },

  async openNotificationStream(
    onNotification: (notification: SocialNotification) => void,
    onError: (error: Error) => void,
  ): Promise<() => void> {
    const controller = new AbortController();
    const token = getAccessToken();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let closed = false;

    if (!token) {
      throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }

    const connect = async (): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.SOCIAL.NOTIFICATION_STREAM}`, {
          headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`Không thể kết nối thông báo (${response.status}).`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split(/\r?\n\r?\n/);
          buffer = events.pop() ?? "";

          events.forEach((event) => {
            const eventType = event
              .split(/\r?\n/)
              .find((line) => line.startsWith("event:"))
              ?.slice(6)
              .trim();
            const data = event
              .split(/\r?\n/)
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim())
              .join("\n");
            if (!data) return;
            try {
              const parsed: unknown = JSON.parse(data);
              if (typeof parsed === "object" && parsed !== null) {
                const notification = parsed as SocialNotification;
                if (!notification.eventType && eventType) notification.eventType = eventType;
                if (notification.eventType !== "CONNECTED") onNotification(notification);
              }
            } catch {
              if (eventType !== "CONNECTED") onNotification({ eventType, message: data });
            }
          });
        }
        if (!closed) {
          reconnectTimer = setTimeout(() => void connect(), 2000);
        }
      } catch (error: unknown) {
        if (!closed && !controller.signal.aborted) {
          onError(error instanceof Error ? error : new Error("Kết nối thông báo bị gián đoạn."));
          reconnectTimer = setTimeout(() => void connect(), 2000);
        }
      }
    };

    void connect();

    return () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      controller.abort();
    };
  },

  async getFeed(
    feed: "for-you" | "friends",
    cursor?: string | null,
  ): Promise<ForYouFeedResponse> {
    const response = await apiClient.get<ForYouFeedResponse>(
      feed === "friends"
        ? API_ENDPOINTS.SOCIAL.FRIENDS_FEED
        : API_ENDPOINTS.SOCIAL.FOR_YOU_FEED,
      {
        params: {
          ...(cursor ? { cursor } : {}),
          limit: FEED_LIMIT,
        },
      },
    );
    return response.data;
  },

  async getForYouFeed(cursor?: string | null): Promise<ForYouFeedResponse> {
    return socialService.getFeed("for-you", cursor);
  },

  async getFriendsFeed(cursor?: string | null): Promise<ForYouFeedResponse> {
    return socialService.getFeed("friends", cursor);
  },

  async getFriendSuggestions(limit = 10): Promise<FriendSuggestion[]> {
    const response = await apiClient.get<FriendSuggestion[]>(
      API_ENDPOINTS.SOCIAL.FRIEND_SUGGESTIONS,
      { params: { limit } },
    );
    return response.data;
  },

  async getFriends(): Promise<FriendRequest[]> {
    const response = await apiClient.get<FriendRequest[]>(
      API_ENDPOINTS.SOCIAL.GET_FRIENDS,
    );
    return response.data;
  },

  async getFriendRequests(): Promise<FriendRequest[]> {
    const response = await apiClient.get<FriendRequest[]>(
      API_ENDPOINTS.SOCIAL.GET_FRIEND_REQUESTS,
    );
    return response.data;
  },

  async acceptFriendRequest(friendshipId: number): Promise<FriendRequest> {
    const response = await apiClient.post<FriendRequest>(
      API_ENDPOINTS.SOCIAL.ACCEPT_FRIEND_REQUEST(friendshipId),
    );
    return response.data;
  },

  async rejectFriendRequest(friendshipId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.SOCIAL.REJECT_FRIEND_REQUEST(friendshipId));
  },

  async getProfile(userId: number): Promise<SocialProfile> {
    const response = await apiClient.get<SocialProfile>(
      API_ENDPOINTS.SOCIAL.GET_PROFILE(userId),
    );
    return response.data;
  },

  async getMyProfile(): Promise<SocialProfile> {
    const response = await apiClient.get<SocialProfile>(
      API_ENDPOINTS.SOCIAL.GET_MY_PROFILE,
    );
    return response.data;
  },

  async getUserPosts(userId: number): Promise<SocialPost[]> {
    const response = await apiClient.get<SocialPost[]>(
      API_ENDPOINTS.SOCIAL.GET_USER_POSTS(userId),
    );
    return response.data;
  },

  async getPost(postId: number): Promise<SocialPost> {
    const response = await apiClient.get<SocialPost>(
      API_ENDPOINTS.SOCIAL.GET_POST(postId),
    );
    return response.data;
  },

  async updatePost(
    postId: number,
    request: UpdateSocialPostRequest,
  ): Promise<SocialPost> {
    const response = await apiClient.put<SocialPost>(
      API_ENDPOINTS.SOCIAL.UPDATE_POST(postId),
      request,
    );
    return response.data;
  },

  async deletePost(postId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SOCIAL.DELETE_POST(postId));
  },

  async sendFriendRequest(userId: number): Promise<void> {
    await apiClient.post(API_ENDPOINTS.SOCIAL.SEND_FRIEND_REQUEST(userId));
    const ids = await getPendingFriendRequestIds();
    if (!ids.includes(userId)) {
      const currentUserId = await getCurrentUserId();
      await AsyncStorage.setItem(
        `${PENDING_FRIEND_REQUESTS_KEY}/${currentUserId}`,
        JSON.stringify([...ids, userId]),
      );
    }
  },

  async hasPendingFriendRequest(userId: number): Promise<boolean> {
    const ids = await getPendingFriendRequestIds();
    return ids.includes(userId);
  },

  async toggleHighFive(postId: number): Promise<HighFiveResponse> {
    const response = await apiClient.post<HighFiveResponse>(
      API_ENDPOINTS.SOCIAL.TOGGLE_HIGH_FIVE(postId),
    );
    return response.data;
  },

  async getComments(postId: number): Promise<SocialComment[]> {
    const response = await apiClient.get<SocialComment[]>(
      API_ENDPOINTS.SOCIAL.GET_COMMENTS(postId),
    );
    return response.data;
  },

  async addComment(
    postId: number,
    request: AddCommentRequest,
  ): Promise<SocialComment> {
    const response = await apiClient.post<SocialComment>(
      API_ENDPOINTS.SOCIAL.ADD_COMMENT(postId),
      request,
    );
    return response.data;
  },

  async deleteComment(commentId: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SOCIAL.DELETE_COMMENT(commentId));
  },
};
