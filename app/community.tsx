import { Design, FontFamily } from "@/src/constants/design";
import { useOnboarding } from "@/src/context/onboarding-context";
import { socialService } from "@/src/services/socialService";
import type { FeedPost, FriendSuggestion, SocialComment } from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CommunityPost = FeedPost & {
    comments: SocialComment[];
};
type FeedTab = "for-you" | "friends";

function getErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const data = (error.response as {
            data?: { message?: string; error?: string };
        } | undefined)?.data;
        if (data?.message) return data.message;
        if (data?.error) return data.error;
    }
    return error instanceof Error ? error.message : "Không thể tải bảng tin.";
}

function formatPostDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Mới đây";
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
    });
}

function toCommunityPost(post: FeedPost): CommunityPost {
    return { ...post, comments: [] };
}

function FriendSuggestionCard({
    suggestion,
    onPress,
    onAddFriend,
    isSending,
}: {
    suggestion: FriendSuggestion;
    onPress: () => void;
    onAddFriend: () => void;
    isSending: boolean;
}) {
    const displayName = suggestion.name.trim() || suggestion.email.split("@")[0] || "Thành viên";
    const fallback = displayName.charAt(0).toUpperCase();

    return (
        <View style={styles.suggestionCard}>
            <Pressable
                accessibilityLabel={`Xem trang cá nhân của ${displayName}`}
                accessibilityRole="button"
                onPress={onPress}
                style={({ pressed }) => [styles.suggestionProfileButton, pressed && styles.cardPressed]}>
                <View style={styles.suggestionAvatar}>
                    {suggestion.avatarUrl ? (
                        <Image
                            accessibilityLabel={`Ảnh đại diện của ${displayName}`}
                            contentFit="cover"
                            source={{ uri: suggestion.avatarUrl }}
                            style={styles.suggestionAvatarImage}
                        />
                    ) : (
                        <Text style={styles.suggestionAvatarText}>{fallback}</Text>
                    )}
                </View>
                <Text numberOfLines={1} style={styles.suggestionName}>{displayName}</Text>
                <Text numberOfLines={2} style={styles.suggestionReason}>
                    {suggestion.reason || "Có thể bạn biết người này"}
                </Text>
                {suggestion.mutualFriendsCount > 0 ? (
                    <Text style={styles.suggestionMutual}>
                        {suggestion.mutualFriendsCount} bạn chung
                    </Text>
                ) : null}
            </Pressable>
            <Pressable
                accessibilityLabel={`Thêm ${displayName} làm bạn`}
                accessibilityRole="button"
                disabled={isSending}
                onPress={onAddFriend}
                style={styles.addFriendButton}>
                <Ionicons color={Design.colors.white} name="person-add-outline" size={14} />
                <Text style={styles.addFriendButtonText}>{isSending ? "Đang gửi..." : "Thêm bạn"}</Text>
            </Pressable>
        </View>
    );
}

function FeedPostCard({
    post,
    displayName,
    openCommentPostId,
    commentDraft,
    onToggleHiFive,
    isHighFivePending,
    onToggleCommentBox,
    onCommentDraftChange,
    onSubmitComment,
    onDeleteComment,
    isCommentsLoading,
    pendingCommentId,
}: {
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
}) {
    const player = useVideoPlayer(post.videoUrl, (videoPlayer) => {
        videoPlayer.loop = false;
    });
    const postId = String(post.id);

    return (
        <View style={styles.postCard}>
            <View style={styles.postHeader}>
                <View style={styles.avatar}>
                    {post.authorAvatar ? (
                        <ImageAvatar
                            fallback={post.authorName.charAt(0).toUpperCase()}
                            source={post.authorAvatar}
                        />
                    ) : (
                        <Text style={styles.avatarText}>{post.authorName.charAt(0).toUpperCase()}</Text>
                    )}
                </View>
                <View style={styles.postAuthorWrap}>
                    <Text style={styles.postAuthor}>{post.authorName}</Text>
                    <Text style={styles.postTimestamp}>{formatPostDate(post.createdAt)}</Text>
                </View>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tùy chọn bài viết"
                    hitSlop={8}
                    onPress={() => undefined}>
                    <Ionicons color={Design.colors.mutedText} name="ellipsis-horizontal" size={18} />
                </Pressable>
            </View>

            <View style={styles.postImageWrap}>
                <VideoView
                    contentFit="contain"
                    fullscreenOptions={{ enable: true }}
                    nativeControls
                    player={player}
                    style={styles.postVideo}
                />
            </View>

            <Text style={styles.postCaption}>{post.caption || "Một khoảnh khắc từ PENTAVA."}</Text>
            {post.tags ? <Text style={styles.postTags}>{post.tags}</Text> : null}

            <View style={styles.actionRow}>
                <Pressable
                    accessibilityRole="button"
                    disabled={isHighFivePending}
                    onPress={() => onToggleHiFive(postId)}
                    style={[
                        styles.actionChip,
                        post.highFivedByMe && styles.actionChipActive,
                        isHighFivePending && styles.actionChipDisabled,
                    ]}>
                    <Text style={styles.actionEmoji}>🖐️</Text>
                    {post.highFiveCount > 0 ? (
                        <Text style={[styles.actionCount, post.highFivedByMe && styles.actionCountActive]}>
                            {post.highFiveCount}
                        </Text>
                    ) : null}
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => onToggleCommentBox(postId)}
                    style={[styles.actionChip, openCommentPostId === postId && styles.actionChipActive]}>
                    <Ionicons color={Design.colors.black} name="chatbubble-outline" size={15} />
                    {post.commentCount > 0 ? (
                        <Text style={styles.actionCount}>{post.commentCount}</Text>
                    ) : null}
                </Pressable>
            </View>

            {isCommentsLoading ? (
                <ActivityIndicator color={Design.colors.primaryGreen} style={styles.commentsLoader} />
            ) : post.comments.length > 0 ? (
                <View style={styles.commentList}>
                    {post.comments.map((comment) => (
                        <View key={`${postId}-comment-${comment.id}`} style={styles.commentRow}>
                            <Text style={styles.commentAuthor}>{comment.authorName}: </Text>
                            <Text style={styles.commentText}>{comment.content}</Text>
                            <Pressable
                                accessibilityLabel="Xóa bình luận"
                                accessibilityRole="button"
                                disabled={pendingCommentId === comment.id}
                                hitSlop={8}
                                onPress={() => onDeleteComment(postId, comment.id)}>
                                <Ionicons
                                    color={Design.colors.mutedText}
                                    name="trash-outline"
                                    size={15}
                                />
                            </Pressable>
                        </View>
                    ))}
                </View>
            ) : null}

            {openCommentPostId === postId ? (
                <View style={styles.commentComposer}>
                    <TextInput
                        autoFocus
                        onChangeText={onCommentDraftChange}
                        onSubmitEditing={() => onSubmitComment(postId)}
                        placeholder="Viết bình luận..."
                        placeholderTextColor={Design.colors.disabled}
                        returnKeyType="send"
                        style={styles.commentInput}
                        value={commentDraft}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Gửi bình luận"
                        hitSlop={8}
                        onPress={() => onSubmitComment(postId)}>
                        <Ionicons color={Design.colors.primaryGreen} name="send" size={18} />
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

function ImageAvatar({ source, fallback }: { source: string; fallback: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <Image
                accessibilityLabel={`Ảnh đại diện của ${fallback}`}
                contentFit="cover"
                source={require("@/assets/images/onboarding/cat-luna.png")}
                style={styles.avatarImage}
            />
        );
    }

    return (
        <Image
            accessibilityLabel="Ảnh đại diện"
            cachePolicy="none"
            contentFit="cover"
            onError={() => setHasError(true)}
            source={{ uri: source }}
            style={styles.avatarImage}
        />
    );
}

export default function CommunityScreen() {
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

    const loadFeed = useCallback(async (
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
    }, [activeTab]);

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
            void socialService.getFriendSuggestions()
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
            setSuggestions((current) => current.filter((suggestion) => suggestion.userId !== userId));
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
        void socialService.getComments(Number(postId))
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
            const comment = await socialService.addComment(Number(postId), { content: text });
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

    return (
        <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.flex}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                        hitSlop={8}
                        onPress={() => router.replace("/(tabs)")}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Cộng đồng</Text>
                    <Pressable
                        accessibilityLabel="Xem lời mời kết bạn"
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => router.push("/friend-requests")}
                        style={styles.friendRequestsButton}>
                        <Ionicons
                            color={Design.colors.primaryGreen}
                            name="person-add-outline"
                            size={22}
                        />
                    </Pressable>
                </View>

                <View style={styles.content}>
                    <View accessibilityRole="tablist" style={styles.feedTabs}>
                        <Pressable
                            accessibilityRole="tab"
                            accessibilityState={{ selected: activeTab === "for-you" }}
                            onPress={() => handleTabChange("for-you")}
                            style={[styles.feedTab, activeTab === "for-you" && styles.feedTabActive]}>
                            <Text style={[styles.feedTabText, activeTab === "for-you" && styles.feedTabTextActive]}>
                                For You
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="tab"
                            accessibilityState={{ selected: activeTab === "friends" }}
                            onPress={() => handleTabChange("friends")}
                            style={[styles.feedTab, activeTab === "friends" && styles.feedTabActive]}>
                            <Text style={[styles.feedTabText, activeTab === "friends" && styles.feedTabTextActive]}>
                            Friend
                            </Text>
                        </Pressable>
                    </View>
                    {activeTab === "friends" ? (
                        <View style={styles.suggestionsSection}>
                            <View style={styles.suggestionsHeader}>
                                <View>
                                    <Text style={styles.suggestionsTitle}>Gợi ý kết bạn</Text>
                                    <Text style={styles.suggestionsSubtitle}>People you may know</Text>
                                </View>
                                {isSuggestionsLoading ? (
                                    <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
                                ) : null}
                            </View>
                            {!isSuggestionsLoading && suggestions.length > 0 ? (
                                <ScrollView
                                    contentContainerStyle={styles.suggestionsList}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}>
                                    {suggestions.map((suggestion) => (
                                        <FriendSuggestionCard
                                            key={suggestion.userId}
                                            onPress={() => router.push({
                                                pathname: "/social-profile",
                                                params: { userId: String(suggestion.userId) },
                                            })}
                                            onAddFriend={() => void sendFriendRequest(suggestion.userId)}
                                            isSending={sendingFriendRequestId === suggestion.userId}
                                            suggestion={suggestion}
                                        />
                                    ))}
                                </ScrollView>
                            ) : !isSuggestionsLoading ? (
                                <Text style={styles.noSuggestionsText}>
                                    Hiện chưa có gợi ý kết bạn mới.
                                </Text>
                            ) : null}
                        </View>
                    ) : null}
                    {/* <View style={styles.composer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            {/* <TextInput
              onChangeText={setThought}
              placeholder="Suy nghĩ của bạn ..."
              placeholderTextColor={Design.colors.disabled}
              style={styles.composerInput}
              value={thought}
            /> */}
                    {/* <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thêm ảnh"
              hitSlop={8}
              onPress={() => setErrorMessage("Tính năng đăng ảnh sẽ được cập nhật sau.")}>
              <Ionicons color={Design.colors.mutedText} name="image-outline" size={20} />
            </Pressable> */}
                    {/* </View> */}

                    {isInitialLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
                            <Text style={styles.stateText}>Đang tải bảng tin...</Text>
                        </View>
                    ) : (
                        <FlatList
                            contentContainerStyle={styles.scrollContent}
                            data={posts}
                            keyExtractor={(post) => String(post.id)}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={
                                <View style={styles.centerState}>
                                    <Ionicons color={Design.colors.disabled} name="newspaper-outline" size={40} />
                                    <Text style={styles.emptyTitle}>
                                        {activeTab === "friends" ? "Chưa có bài đăng từ bạn bè" : "Chưa có bài đăng"}
                                    </Text>
                                    <Text style={styles.stateText}>
                                        {activeTab === "friends"
                                            ? "Hãy kết bạn để xem những video mới nhất của họ."
                                            : "Hãy quay lại sau để khám phá nội dung mới."}
                                    </Text>
                                </View>
                            }
                            ListFooterComponent={
                                isLoadingMore ? (
                                    <ActivityIndicator color={Design.colors.primaryGreen} style={styles.footerLoader} />
                                ) : null
                            }
                            onEndReached={() => {
                                if (hasMore && nextCursor && !isLoadingMore) {
                                    void loadFeed(nextCursor, true, activeTab);
                                }
                            }}
                            onEndReachedThreshold={0.5}
                            renderItem={({ item }) => (
                                <FeedPostCard
                                    commentDraft={commentDraft}
                                    displayName={displayName}
                                    onCommentDraftChange={setCommentDraft}
                                    onSubmitComment={submitComment}
                                    onDeleteComment={requestDeleteComment}
                                    onToggleCommentBox={toggleCommentBox}
                                    onToggleHiFive={toggleHiFive}
                                    isHighFivePending={highFivePendingPostId === String(item.id)}
                                    isCommentsLoading={commentsLoadingPostId === String(item.id)}
                                    pendingCommentId={pendingCommentId}
                                    openCommentPostId={openCommentPostId}
                                    post={item}
                                />
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>

            <Modal
                animationType="fade"
                onRequestClose={() => setErrorMessage(null)}
                transparent
                visible={errorMessage !== null}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.errorIcon}>
                            <Ionicons color="#B33A3A" name="alert-circle-outline" size={28} />
                        </View>
                        <Text style={styles.modalTitle}>Không thể thực hiện thao tác</Text>
                        <Text style={styles.modalMessage}>{errorMessage}</Text>
                        <Pressable
                            onPress={() => {
                                setErrorMessage(null);
                                void loadFeed(null, false);
                            }}
                            style={styles.modalButton}>
                            <Text style={styles.modalButtonText}>Thử lại</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                onRequestClose={() => setCommentToDelete(null)}
                transparent
                visible={commentToDelete !== null}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.warningIcon}>
                            <Ionicons color="#B33A3A" name="trash-outline" size={28} />
                        </View>
                        <Text style={styles.modalTitle}>Xóa bình luận?</Text>
                        <Text style={styles.modalMessage}>
                            Bạn có chắc chắn muốn xóa bình luận này không? Thao tác này không thể hoàn tác.
                        </Text>
                        <View style={styles.confirmActions}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => setCommentToDelete(null)}
                                style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </Pressable>
                            <Pressable
                                accessibilityRole="button"
                                onPress={() => void confirmDeleteComment()}
                                style={styles.deleteButton}>
                                <Text style={styles.modalButtonText}>Xóa</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: Design.colors.white, flex: 1 },
    flex: { flex: 1 },
    content: { flex: 1 },
    feedTabs: {
      borderBottomColor: "#E9E9E9",
      borderBottomWidth: 1,
      flexDirection: "row",
      marginBottom: 12,
      marginHorizontal: 20,
    },
    feedTab: {
      alignItems: "center",
      flex: 1,
      paddingBottom: 11,
      paddingTop: 4,
    },
    feedTabActive: {
      borderBottomColor: Design.colors.primaryGreen,
      borderBottomWidth: 2,
    },
    feedTabText: {
      color: Design.colors.mutedText,
      fontFamily: FontFamily.beVietnamMedium,
      fontSize: Design.fontSize.caption + 2,
    },
    feedTabTextActive: {
      color: Design.colors.primaryGreen,
      fontFamily: FontFamily.beVietnamSemiBold,
    },
    suggestionsSection: {
        backgroundColor: "#F8FAF8",
        borderColor: "#EAF3ED",
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 14,
        marginHorizontal: 20,
        padding: 14,
    },
    suggestionsHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    suggestionsTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
    },
    suggestionsSubtitle: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        marginTop: 2,
    },
    suggestionsList: { gap: 10 },
    suggestionCard: {
        backgroundColor: Design.colors.white,
        borderColor: "#E9E9E9",
        borderRadius: 12,
        borderWidth: 1,
        minHeight: 145,
        padding: 10,
        width: 130,
    },
    suggestionProfileButton: {
        alignItems: "center",
    },
    suggestionAvatar: {
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#F5D6DE",
        borderRadius: 24,
        height: 48,
        justifyContent: "center",
        marginBottom: 8,
        overflow: "hidden",
        width: 48,
    },
    suggestionAvatarImage: { height: "100%", width: "100%" },
    suggestionAvatarText: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
    },
    suggestionName: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
        textAlign: "center",
    },
    suggestionReason: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption - 1,
        lineHeight: 15,
        marginTop: 4,
        textAlign: "center",
    },
    suggestionMutual: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption - 1,
        marginTop: 4,
        textAlign: "center",
    },
    addFriendButton: {
        alignItems: "center",
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 16,
        flexDirection: "row",
        gap: 4,
        justifyContent: "center",
        marginTop: 8,
        paddingHorizontal: 8,
        paddingVertical: 7,
    },
    addFriendButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption - 1,
    },
    noSuggestionsText: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    backButton: { width: 32 },
    friendRequestsButton: {
        alignItems: "center",
        justifyContent: "center",
        width: 32,
    },
    headerTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
    },
    composer: {
        alignItems: "center",
        borderColor: "#E9E9E9",
        borderRadius: 14,
        borderWidth: 1,
        flexDirection: "row",
        gap: 10,
        height: 52,
        marginBottom: 16,
        marginHorizontal: 20,
        paddingHorizontal: 12,
    },
    composerInput: {
        color: Design.colors.black,
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        paddingVertical: 0,
    },
    avatar: {
        alignItems: "center",
        backgroundColor: "#F5D6DE",
        borderRadius: 16,
        height: 32,
        justifyContent: "center",
        overflow: "hidden",
        width: 32,
    },
    avatarImage: { backgroundColor: "#E6E6E6", height: "100%", width: "100%" },
    avatarImageOverlay: { alignItems: "center", flex: 1, justifyContent: "center" },
    avatarText: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
    },
    scrollContent: { paddingBottom: 28, paddingHorizontal: 20 },
    postCard: {
        backgroundColor: Design.colors.white,
        borderColor: "#EDEDED",
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
        padding: 12,
    },
    postHeader: { alignItems: "center", flexDirection: "row", marginBottom: 10 },
    postAuthorWrap: { flex: 1, marginLeft: 10 },
    postAuthor: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
    },
    postTimestamp: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption - 1,
    },
    postImageWrap: {
        backgroundColor: "#111111",
        borderRadius: 12,
        height: 210,
        marginBottom: 10,
        overflow: "hidden",
    },
    postVideo: { height: "100%", width: "100%" },
    postCaption: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        lineHeight: 18,
        marginBottom: 4,
    },
    postTags: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        marginBottom: 8,
    },
    actionRow: { flexDirection: "row", gap: 8 },
    actionChip: {
        alignItems: "center",
        borderColor: Design.colors.optionBorder,
        borderRadius: 16,
        borderWidth: 1,
        flexDirection: "row",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    actionChipActive: { backgroundColor: "#EAF4EE", borderColor: Design.colors.primaryGreen },
    actionChipDisabled: { opacity: 0.55 },
    actionEmoji: { fontSize: 13 },
    actionCount: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
    },
    actionCountActive: { color: Design.colors.primaryGreen },
    commentList: { gap: 5, marginTop: 10 },
    commentRow: { flexDirection: "row", flexWrap: "wrap" },
    commentAuthor: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },
    commentText: {
        color: Design.colors.black,
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
    },
    commentComposer: {
        alignItems: "center",
        borderColor: "#E9E9E9",
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        gap: 8,
        height: 40,
        marginTop: 10,
        paddingHorizontal: 12,
    },
    commentInput: {
        color: Design.colors.black,
        flex: 1,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        paddingVertical: 0,
    },
    centerState: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
    emptyTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        marginTop: 14,
        textAlign: "center",
    },
    stateText: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        marginTop: 8,
        textAlign: "center",
    },
    footerLoader: { paddingVertical: 12 },
    modalOverlay: {
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    modalCard: {
        alignItems: "center",
        backgroundColor: Design.colors.white,
        borderRadius: 22,
        maxWidth: 380,
        padding: 26,
        width: "100%",
    },
    errorIcon: {
        alignItems: "center",
        backgroundColor: "#FDEAEA",
        borderRadius: 30,
        height: 58,
        justifyContent: "center",
        width: 58,
    },
    warningIcon: {
        alignItems: "center",
        backgroundColor: "#FDEAEA",
        borderRadius: 30,
        height: 58,
        justifyContent: "center",
        width: 58,
    },
    modalTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        marginTop: 14,
        textAlign: "center",
    },
    modalMessage: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        lineHeight: 20,
        marginTop: 8,
        textAlign: "center",
    },
    modalButton: {
        alignItems: "center",
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 22,
        marginTop: 22,
        minWidth: 140,
        paddingHorizontal: 24,
        paddingVertical: 11,
    },
    modalButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
    },
    confirmActions: {
        flexDirection: "row",
        gap: 10,
        marginTop: 22,
        width: "100%",
    },
    cancelButton: {
        alignItems: "center",
        borderColor: "#D8D8D8",
        borderRadius: 22,
        borderWidth: 1,
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 11,
    },
    cancelButtonText: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
    },
    deleteButton: {
        alignItems: "center",
        backgroundColor: "#B33A3A",
        borderRadius: 22,
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 11,
    },
});
