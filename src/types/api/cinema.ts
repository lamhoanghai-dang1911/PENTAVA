export type GoalSummary = {
  goalId: number;
  goalName: string;
  status: string;
  startDate: string;
  endDate: string;
  expired: boolean;
};

export type WeekSummary = {
  goalId: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  photoCount: number;
  eligible: boolean;
  photosNeeded: number;
  current: boolean;
};

export type GoalWeeksResponse = {
  goalId: number;
  goalName: string;
  minPhotos: number;
  weeks: WeekSummary[];
};

export type WeekPhoto = {
  photoId: number;
  taskProgressId: number;
  checkinDate: string;
  imageUrl: string;
  createdAt: string;
};

export type WeekPhotosResponse = {
  goalId: number;
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  photos: WeekPhoto[];
};

export type ClipStatus = "PENDING" | "PROCESSING" | "UPLOADING" | "COMPLETED" | "FAILED";

export type Clip = {
  clipId: number;
  goalId: number;
  weekNumber: number;
  status: ClipStatus;
  videoUrl: string | null;
  errorMessage: string | null;
  photoCount: number;
  createdAt: string;
};

export type PrivacyMode = "PUBLIC" | "FRIENDS_ONLY" | "PRIVATE";

export type CreateSocialPostRequest = {
  clipId: number;
  caption: string;
  tags: string;
  privacyMode: PrivacyMode;
};

export type UpdateSocialPostRequest = Pick<
  CreateSocialPostRequest,
  "caption" | "tags" | "privacyMode"
>;

export type SocialPost = CreateSocialPostRequest & {
  id: number;
  userId: number;
  authorName: string;
  authorAvatar: string | null;
  goalId: number;
  weekNumber: number;
  videoUrl: string;
  highFiveCount: number;
  commentCount: number;
  createdAt: string;
  highFivedByMe: boolean;
};

export type FeedPost = SocialPost;

export type ForYouFeedResponse = {
  items: FeedPost[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type HighFiveResponse = {
  postId: number;
  highFived: boolean;
  totalHighFives: number;
};

export type SocialComment = {
  id: number;
  postId: number;
  userId: number;
  authorName: string;
  authorAvatar: string | null;
  parentId: number | null;
  content: string;
  createdAt: string;
};

export type AddCommentRequest = {
  content: string;
  parentId?: number | null;
};

export type FriendSuggestion = {
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  mutualFriendsCount: number;
  mutualFriendNames: string[];
  totalPosts: number;
  reason: string;
};

export type FriendRequest = {
  id: number;
  requesterId: number;
  addresseeId: number;
  friendUserId: number;
  friendName: string;
  friendEmail: string;
  friendAvatar: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | string;
  createdAt: string;
};

export type SocialProfile = {
  userId: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  totalPosts: number;
  totalHighFivesReceived: number;
  totalFriends: number;
  friendshipStatusWithMe: string;
  me: boolean;
};
