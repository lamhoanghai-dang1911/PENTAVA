export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.89:8080";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    VERIFY_OTP: "/api/auth/verify-otp",
    RESEND_OTP: "/api/auth/resend-otp",
    LOGIN: "/api/auth/login",
    GOOGLE_LOGIN: "/api/auth/google",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    VERIFY_RESET_OTP: "/api/auth/verify-reset-otp",
    RESET_PASSWORD: "/api/auth/reset-password",
    ME: "/api/auth/me",
    PROFILE: "/api/auth/profile",
  },
  TASK: {
    GET_BY_WEEK: "/api/onboarding/tasks",
    HISTORY: "/api/onboarding/tasks/history",
    DAILY_STATUS: "/api/onboarding/tasks/daily-status",
    CONFIRM_DAILY: "/api/onboarding/tasks/confirm-daily",
    SWAP: "/api/onboarding/tasks/swap",
    GET_PROGRESS: (taskId: number) =>
      `/api/onboarding/tasks/${taskId}/progress`,
    SAVE_PROGRESS_ITEMS: (taskId: number) =>
      `/api/onboarding/tasks/${taskId}/progress/items`,
    COMPLETE: (progressId: number) =>
      `/api/onboarding/tasks/daily/${progressId}/complete`,
  },
  ONBOARDING: {
    CURRENT_GOAL: "/api/onboarding/goals/current",
    CURRENT_STREAK: "/api/onboarding/streak/current",
    SELECT_MOOD: "/api/onboarding/mood/select",
  },
  SHOP: {
    ITEMS: "/api/shop/items",
    BUY_ITEM: (skinItemId: number) => `/api/shop/items/${skinItemId}/buy`,
    MY_WALLET: "/api/shop/wallet/me",
    INIT_TOPUP: "/api/shop/topup/init",
    TOPUP_HISTORY: "/api/shop/topup/history",
  },
  SKIN: {
    MY_AVATAR: "/api/skin/avatar/my-avatar",
    INVENTORY: "/api/skin/inventory",
    EQUIP: "/api/skin/equip",
    UNEQUIP: "/api/skin/unequip",
  },
  CINEMA: {
    GOALS: "/api/cinema/goals",
    GOAL_WEEKS: (goalId: number) => `/api/cinema/goals/${goalId}/weeks`,
    GOAL_WEEK_PHOTOS: (goalId: number, weekNumber: number) =>
      `/api/cinema/goals/${goalId}/weeks/${weekNumber}/photos`,
    CREATE_CLIP: (goalId: number, weekNumber: number) =>
      `/api/cinema/goals/${goalId}/weeks/${weekNumber}/clips`,
    GET_CLIPS: (goalId: number, weekNumber: number) =>
      `/api/cinema/goals/${goalId}/weeks/${weekNumber}/clips`,
    GET_CLIP: (clipId: number) => `/api/cinema/clips/${clipId}`,
  },
  SOCIAL: {
    CREATE_POST: "/api/social/posts",
    FOR_YOU_FEED: "/api/social/feed/for-you",
    FRIENDS_FEED: "/api/social/feed/friends",
    FRIEND_SUGGESTIONS: "/api/social/friends/suggestions",
    GET_PROFILE: (userId: number) => `/api/social/profile/${userId}`,
    GET_MY_PROFILE: "/api/social/profile/me",
    GET_USER_POSTS: (userId: number) => `/api/social/users/${userId}/posts`,
    GET_POST: (postId: number) => `/api/social/posts/${postId}`,
    UPDATE_POST: (postId: number) => `/api/social/posts/${postId}`,
    DELETE_POST: (postId: number) => `/api/social/posts/${postId}`,
    SEND_FRIEND_REQUEST: (userId: number) => `/api/social/friends/request/${userId}`,
    GET_FRIENDS: "/api/social/friends",
    TOGGLE_HIGH_FIVE: (postId: number) => `/api/social/posts/${postId}/high-five`,
    GET_COMMENTS: (postId: number) => `/api/social/posts/${postId}/comments`,
    ADD_COMMENT: (postId: number) => `/api/social/posts/${postId}/comments`,
    DELETE_COMMENT: (commentId: number) => `/api/social/comments/${commentId}`,
    NOTIFICATION_STREAM: "/api/social/notifications/stream",
    GET_NOTIFICATIONS: "/api/social/notifications",
    MARK_NOTIFICATION_READ: (id: number) => `/api/social/notifications/${id}/read`,
    MARK_ALL_NOTIFICATIONS_READ: "/api/social/notifications/read-all",
    GET_UNREAD_NOTIFICATION_COUNT: "/api/social/notifications/unread-count",
    GET_FRIEND_REQUESTS: "/api/social/friends/requests",
    ACCEPT_FRIEND_REQUEST: (friendshipId: number) =>
      `/api/social/friends/accept/${friendshipId}`,
    REJECT_FRIEND_REQUEST: (friendshipId: number) =>
      `/api/social/friends/reject/${friendshipId}`,
  },
  CHECKIN: {
    GET_IMAGE: (taskProgressId: number) =>
      `/api/checkin/task-progress/${taskProgressId}`,
    SAVE_IMAGE: (taskProgressId: number) =>
      `/api/checkin/task-progress/${taskProgressId}`,
  },
};