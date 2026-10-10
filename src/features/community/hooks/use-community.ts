import { useOnboarding } from "@/src/context/onboarding-context";
import { socialService } from "@/src/services/socialService";
import type { FriendSuggestion } from "@/src/types/api/cinema";
import { useCallback, useEffect, useState } from "react";
import type { CommunityPost, FeedTab } from "../types/community";
import { getErrorMessage, toCommunityPost } from "../utils/community-utils";

export function useCommunity() {
  const { data } = useOnboarding();
  const displayName = data.name.trim() || "Bạn";

  const [activeTab, setActiveTab] = useState<FeedTab>("for-you");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highFivePendingPostId, setHighFivePendingPostId] = useState<string | null>(null);
  const [commentsLoadingPostId, setCommentsLoadingPostId] = useState<string | null>(null);
  const [pendingCommentId, setPendingCommentId] = useState<number | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<{
    postId: string;
    commentId: number;
  } | null>(null);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false);
  const [sendingFriendRequestId, setSendingFriendRequestId] = useState<number | null>(null);

  const loadFeed = useCallback(
    async (
      cursor: string | null,
      append: boolean,
      tab: FeedTab = activeTab,
    ) => {
      if (append) setIsLoadingMore(true);
      else setIsInitialLoading(true);

      try {
        const response = await socialService.getFeed(tab, cursor);
        const detailedItems = await Promise.all(
          response.items.map((item) => socialService.getPost(item.id)),
        );
        setPosts((current) =>
          append
            ? [...current, ...detailedItems.map(toCommunityPost)]
            : detailedItems.map(toCommunityPost),
        );
        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadFeed(null, false, activeTab);
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadFeed]);

  useEffect(() => {
    if (activeTab !== "friends") return;
    const timer = setTimeout(() => {
      setIsSuggestionsLoading(true);
      void socialService
        .getFriendSuggestions()
        .then(setSuggestions)
        .catch((error) => setErrorMessage(getErrorMessage(error)))
        .finally(() => setIsSuggestionsLoading(false));
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabChange = (tab: FeedTab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
    setOpenCommentPostId(null);
    setErrorMessage(null);
  };

  const sendFriendRequest = async (userId: number) => {
    if (sendingFriendRequestId !== null) return;
    setSendingFriendRequestId(userId);
    try {
      await socialService.sendFriendRequest(userId);
      setSuggestions((current) =>
        current.filter((suggestion) => suggestion.userId !== userId),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSendingFriendRequestId(null);
    }
  };

  const toggleHiFive = async (postId: string) => {
    if (highFivePendingPostId !== null) return;
    setHighFivePendingPostId(postId);
    try {
      const response = await socialService.toggleHighFive(Number(postId));
      setPosts((current) =>
        current.map((post) =>
          String(post.id) === postId
            ? {
                ...post,
                highFivedByMe: response.highFived,
                highFiveCount: response.totalHighFives,
              }
            : post,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setHighFivePendingPostId(null);
    }
  };

  const toggleCommentBox = (postId: string) => {
    setCommentDraft("");
    const isClosing = openCommentPostId === postId;
    setOpenCommentPostId(isClosing ? null : postId);
    if (isClosing) return;

    setCommentsLoadingPostId(postId);
    void socialService
      .getComments(Number(postId))
      .then((comments) => {
        setPosts((current) =>
          current.map((post) =>
            String(post.id) === postId ? { ...post, comments } : post,
          ),
        );
      })
      .catch((error) => setErrorMessage(getErrorMessage(error)))
      .finally(() => setCommentsLoadingPostId(null));
  };

  const submitComment = async (postId: string) => {
    const text = commentDraft.trim();
    if (!text) return;
    try {
      const comment = await socialService.addComment(Number(postId), {
        content: text,
      });
      setPosts((current) =>
        current.map((post) =>
          String(post.id) === postId
            ? {
                ...post,
                comments: [...post.comments, comment],
                commentCount: post.commentCount + 1,
              }
            : post,
        ),
      );
      setCommentDraft("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const deleteComment = async (postId: string, commentId: number) => {
    setPendingCommentId(commentId);
    try {
      await socialService.deleteComment(commentId);
      setPosts((current) =>
        current.map((post) =>
          String(post.id) === postId
            ? {
                ...post,
                comments: post.comments.filter((comment) => comment.id !== commentId),
                commentCount: Math.max(0, post.commentCount - 1),
              }
            : post,
        ),
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setPendingCommentId(null);
    }
  };

  const requestDeleteComment = (postId: string, commentId: number) => {
    setCommentToDelete({ postId, commentId });
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;
    const { postId, commentId } = commentToDelete;
    setCommentToDelete(null);
    await deleteComment(postId, commentId);
  };

  const handleLoadMore = () => {
    if (hasMore && nextCursor && !isLoadingMore) {
      void loadFeed(nextCursor, true, activeTab);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    void loadFeed(null, false, activeTab);
  };

  return {
    displayName,
    activeTab,
    posts,
    suggestions,
    openCommentPostId,
    commentDraft,
    hasMore,
    isInitialLoading,
    isLoadingMore,
    isSuggestionsLoading,
    errorMessage,
    highFivePendingPostId,
    commentsLoadingPostId,
    pendingCommentId,
    commentToDelete,
    sendingFriendRequestId,
    loadFeed,
    handleTabChange,
    sendFriendRequest,
    toggleHiFive,
    toggleCommentBox,
    submitComment,
    requestDeleteComment,
    confirmDeleteComment,
    handleLoadMore,
    handleRetry,
    setCommentDraft,
    setErrorMessage,
    setCommentToDelete,
  };
}
