import type { FeedPost, FriendSuggestion, SocialComment } from "@/src/types/api/cinema";

export type CommunityPost = FeedPost & {
  comments: SocialComment[];
};

export type FeedTab = "for-you" | "friends";

export type ImageAvatarProps = {
  source: string;
  fallback: string;
};

export type FriendSuggestionCardProps = {
  suggestion: FriendSuggestion;
  onPress: () => void;
  onAddFriend: () => void;
  isSending: boolean;
};

export type FeedPostCardProps = {
  post: CommunityPost;
  displayName: string;
  openCommentPostId: string | null;
  commentDraft: string;
  onToggleHiFive: (postId: string) => void;
  isHighFivePending: boolean;
  onToggleCommentBox: (postId: string) => void;
  onCommentDraftChange: (value: string) => void;
  onSubmitComment: (postId: string) => void;
  onDeleteComment: (postId: string, commentId: number) => void;
  isCommentsLoading: boolean;
  pendingCommentId: number | null;
};

export type CommunityHeaderProps = {
  onBack: () => void;
  onFriendRequestsPress: () => void;
};

export type FeedTabsProps = {
  activeTab: FeedTab;
  onTabChange: (tab: FeedTab) => void;
};

export type FriendSuggestionsSectionProps = {
  suggestions: FriendSuggestion[];
  isLoading: boolean;
  sendingFriendRequestId: number | null;
  onSuggestionPress: (userId: number) => void;
  onAddFriend: (userId: number) => void;
};

export type ErrorModalProps = {
  visible: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onRetry: () => void;
};

export type DeleteCommentModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
