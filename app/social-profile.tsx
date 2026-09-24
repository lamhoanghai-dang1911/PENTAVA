import { Design, FontFamily } from "@/src/constants/design";
import { socialService } from "@/src/services/socialService";
import type {
  PrivacyMode,
  SocialComment,
  SocialPost,
  SocialProfile,
  FriendRequest,
  UpdateSocialPostRequest,
} from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState, type ComponentProps } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error.response as {
      data?: { message?: string; error?: string };
    } | undefined)?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  return error instanceof Error ? error.message : "Không thể tải trang cá nhân.";
}

export default function SocialProfileScreen() {
  const { me: meParam, userId: userIdParam } =
    useLocalSearchParams<{ me?: string; userId?: string }>();
  const isMyProfile = meParam === "true";
  const userId = Number(userIdParam);
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Record<number, SocialComment[]>>({});
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [editDraft, setEditDraft] = useState<UpdateSocialPostRequest | null>(null);
  const [postToDelete, setPostToDelete] = useState<SocialPost | null>(null);
  const [isPostActionLoading, setIsPostActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSendingFriendRequest, setIsSendingFriendRequest] = useState(false);

  useEffect(() => {
    if (!isMyProfile && (!Number.isInteger(userId) || userId <= 0)) {
      const timer = setTimeout(() => {
        setErrorMessage("Không tìm thấy người dùng hợp lệ.");
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const loadProfile = async () => {
      try {
        const profileResponse = isMyProfile
          ? await socialService.getMyProfile()
          : await socialService.getProfile(userId);
        const hasLocalPendingRequest = !isMyProfile
          && await socialService.hasPendingFriendRequest(profileResponse.userId);
        const effectiveProfile = hasLocalPendingRequest
          ? { ...profileResponse, friendshipStatusWithMe: "PENDING" }
          : profileResponse;
        const [postsResponse, friendsResponse] = await Promise.all([
          socialService.getUserPosts(profileResponse.userId),
          isMyProfile ? socialService.getFriends() : Promise.resolve([]),
        ]);
        setProfile(effectiveProfile);
        setPosts(postsResponse);
        setFriends(friendsResponse);
        const comments = await Promise.all(
          postsResponse.map(async (post) => [post.id, await socialService.getComments(post.id)] as const),
        );
        setCommentsByPost(Object.fromEntries(comments));
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
        setIsPostsLoading(false);
      }
    };
    void loadProfile();
  }, [isMyProfile, userId]);

  const displayName = profile?.name.trim() || profile?.email.split("@")[0] || "Thành viên";
  const fallback = displayName.charAt(0).toUpperCase();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Quay lại" accessibilityRole="button" hitSlop={8} onPress={() => router.back()}>
          <Ionicons color={Design.colors.black} name="chevron-back" size={25} />
        </Pressable>
        <Text style={styles.headerTitle}>Trang cá nhân</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
          <Text style={styles.stateText}>Đang tải trang cá nhân...</Text>
        </View>
      ) : profile ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {profile.avatarUrl ? (
                <RemoteAvatar
                  fallback={fallback}
                  label={`Ảnh đại diện của ${displayName}`}
                  source={profile.avatarUrl}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{fallback}</Text>
              )}
            </View>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            {!profile.me ? (
              !["PENDING", "REQUESTED", "SENT", "ACCEPTED", "FRIENDS"].includes(
                profile.friendshipStatusWithMe,
              ) ? (
                <Pressable
                  accessibilityLabel={`Thêm ${displayName} làm bạn`}
                  accessibilityRole="button"
                  disabled={isSendingFriendRequest}
                  onPress={() => {
                    setIsSendingFriendRequest(true);
                    void socialService.sendFriendRequest(profile.userId)
                      .then(() => {
                        setProfile((current) =>
                          current
                            ? { ...current, friendshipStatusWithMe: "PENDING" }
                            : current,
                        );
                        setSuccessMessage("Đã gửi lời mời kết bạn.");
                      })
                      .catch((error) => setErrorMessage(getErrorMessage(error)))
                      .finally(() => setIsSendingFriendRequest(false));
                  }}
                  style={styles.profileFriendButton}>
                  <Ionicons color={Design.colors.white} name="person-add-outline" size={17} />
                  <Text style={styles.profileFriendButtonText}>
                    {isSendingFriendRequest ? "Đang gửi..." : "Thêm bạn bè"}
                  </Text>
                </Pressable>
              ) : ["PENDING", "REQUESTED", "SENT"].includes(profile.friendshipStatusWithMe) ? (
                <View style={styles.profileFriendButtonSent}>
                  <Ionicons color={Design.colors.primaryGreen} name="checkmark-outline" size={17} />
                  <Text style={styles.profileFriendButtonSentText}>Đã gửi lời mời</Text>
                </View>
              ) : null
            ) : null}
          </View>

          <View style={styles.statsRow}>
            <Stat value={profile.totalPosts} label="Bài đăng" />
            <Stat value={profile.totalFriends} label="Bạn bè" />
            <Stat value={profile.totalHighFivesReceived} label="High-Five" />
          </View>
          {isMyProfile ? (
            <View style={styles.friendsSection}>
              <View style={styles.friendsSectionHeader}>
                <Text style={styles.friendsTitle}>Bạn bè</Text>
                <Text style={styles.friendsCount}>{friends.length}</Text>
              </View>
              {friends.length === 0 ? (
                <Text style={styles.emptyFriends}>Bạn chưa có bạn bè nào.</Text>
              ) : (
                friends.map((friend) => {
                  const friendName = friend.friendName.trim()
                    || friend.friendEmail.split("@")[0]
                    || "Thành viên";
                  const friendFallback = friendName.charAt(0).toUpperCase();
                  return (
                    <Pressable
                      key={friend.id}
                      accessibilityLabel={`Xem trang cá nhân của ${friendName}`}
                      accessibilityRole="button"
                      onPress={() => router.push({
                        pathname: "/social-profile",
                        params: { userId: String(friend.friendUserId) },
                      })}
                      style={({ pressed }) => [
                        styles.friendRow,
                        pressed && styles.friendRowPressed,
                      ]}>
                      <View style={styles.friendAvatar}>
                        {friend.friendAvatar ? (
                          <RemoteAvatar
                            fallback={friendFallback}
                            label={`Ảnh đại diện của ${friendName}`}
                            source={friend.friendAvatar}
                            style={styles.friendAvatarImage}
                          />
                        ) : (
                          <Text style={styles.friendAvatarText}>{friendFallback}</Text>
                        )}
                      </View>
                      <View style={styles.friendDetails}>
                        <Text numberOfLines={1} style={styles.friendName}>{friendName}</Text>
                        <Text numberOfLines={1} style={styles.friendEmail}>{friend.friendEmail}</Text>
                      </View>
                      <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={18} />
                    </Pressable>
                  );
                })
              )}
            </View>
          ) : null}
          <Text style={styles.postsTitle}>Bài viết</Text>
          {isPostsLoading ? (
            <ActivityIndicator color={Design.colors.primaryGreen} style={styles.postsLoader} />
          ) : posts.length === 0 ? (
            <Text style={styles.emptyPosts}>Chưa có bài viết nào.</Text>
          ) : (
            posts.map((post) => (
              <ProfilePostCard
                key={post.id}
                comments={commentsByPost[post.id] ?? []}
                isOwnPost={Boolean(profile.me)}
                onDelete={() => setPostToDelete(post)}
                onEdit={() => {
                  setEditingPost(post);
                  setEditDraft({
                    caption: post.caption,
                    tags: post.tags,
                    privacyMode: post.privacyMode,
                  });
                }}
                post={post}
              />
            ))
          )}
        </ScrollView>
      ) : null}

      <Modal
        animationType="fade"
        onRequestClose={() => setErrorMessage(null)}
        transparent
        visible={errorMessage !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons color="#B33A3A" name="alert-circle-outline" size={42} />
            <Text style={styles.modalTitle}>Không thể tải trang cá nhân</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <Pressable onPress={() => { setErrorMessage(null); router.back(); }} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!isPostActionLoading) setEditingPost(null);
        }}
        transparent
        visible={editingPost !== null && editDraft !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chỉnh sửa bài viết</Text>
            <TextInput
              multiline
              onChangeText={(caption) => setEditDraft((draft) => draft && { ...draft, caption })}
              placeholder="Caption"
              style={styles.editInput}
              value={editDraft?.caption ?? ""}
            />
            <TextInput
              onChangeText={(tags) => setEditDraft((draft) => draft && { ...draft, tags })}
              placeholder="Tags"
              style={styles.editInput}
              value={editDraft?.tags ?? ""}
            />
            <View style={styles.privacyRow}>
              {(["PUBLIC", "FRIENDS_ONLY", "PRIVATE"] as PrivacyMode[]).map((mode) => (
                <Pressable
                  key={mode}
                  onPress={() => setEditDraft((draft) => draft && { ...draft, privacyMode: mode })}
                  style={[styles.privacyButton, editDraft?.privacyMode === mode && styles.privacyButtonActive]}>
                  <Text style={styles.privacyButtonText}>
                    {mode === "FRIENDS_ONLY" ? "FRIENDS ONLY" : mode}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable disabled={isPostActionLoading} onPress={() => setEditingPost(null)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={isPostActionLoading || !editingPost || !editDraft}
                onPress={() => {
                  if (!editingPost || !editDraft) return;
                  setIsPostActionLoading(true);
                  void socialService.updatePost(editingPost.id, editDraft)
                    .then((updatedPost) => {
                      setPosts((current) => current.map((post) => post.id === updatedPost.id ? updatedPost : post));
                      setEditingPost(null);
                      setSuccessMessage("Đã cập nhật bài viết thành công.");
                    })
                    .catch((error) => setErrorMessage(getErrorMessage(error)))
                    .finally(() => setIsPostActionLoading(false));
                }}
                style={[styles.modalButton, styles.modalActionButton]}>
                <Text style={styles.modalButtonText}>{isPostActionLoading ? "Đang lưu..." : "Lưu"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        onRequestClose={() => {
          if (!isPostActionLoading) setPostToDelete(null);
        }}
        transparent
        visible={postToDelete !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons color="#B33A3A" name="trash-outline" size={42} />
            <Text style={styles.modalTitle}>Xóa bài viết?</Text>
            <Text style={styles.modalMessage}>Bạn có chắc muốn xóa bài viết này không?</Text>
            <View style={styles.modalActions}>
              <Pressable disabled={isPostActionLoading} onPress={() => setPostToDelete(null)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={isPostActionLoading || !postToDelete}
                onPress={() => {
                  if (!postToDelete) return;
                  setIsPostActionLoading(true);
                  void socialService.deletePost(postToDelete.id)
                    .then(() => {
                      setPosts((current) => current.filter((post) => post.id !== postToDelete.id));
                      setProfile((current) =>
                        current
                          ? { ...current, totalPosts: Math.max(0, current.totalPosts - 1) }
                          : current,
                      );
                      setPostToDelete(null);
                      setSuccessMessage("Đã xóa bài viết thành công.");
                    })
                    .catch((error) => setErrorMessage(getErrorMessage(error)))
                    .finally(() => setIsPostActionLoading(false));
                }}
                style={[styles.deleteButton, styles.modalActionButton]}>
                <Text style={styles.modalButtonText}>{isPostActionLoading ? "Đang xóa..." : "Xóa"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        onRequestClose={() => setSuccessMessage(null)}
        transparent
        visible={successMessage !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle-outline" size={42} />
            <Text style={styles.modalTitle}>Thành công</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <Pressable onPress={() => setSuccessMessage(null)} style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Đóng</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfilePostCard({
  post,
  comments,
  isOwnPost,
  onEdit,
  onDelete,
}: {
  post: SocialPost;
  comments: SocialComment[];
  isOwnPost: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const player = useVideoPlayer(post.videoUrl, (videoPlayer) => {
    videoPlayer.loop = false;
  });

  return (
    <View style={styles.postCard}>
      <View style={styles.postVideo}>
        <VideoView
          contentFit="contain"
          fullscreenOptions={{ enable: true }}
          nativeControls
          player={player}
          style={styles.video}
        />
      </View>
      <Text style={styles.postCaption}>{post.caption || "Một khoảnh khắc từ PENTAVA."}</Text>
      {post.tags ? <Text style={styles.postTags}>{post.tags}</Text> : null}
      <View style={styles.privacyMeta}>
        <Ionicons
          color={Design.colors.mutedText}
          name={getPrivacyIcon(post.privacyMode)}
          size={14}
        />
        <Text style={styles.privacyMetaText}>{getPrivacyLabel(post.privacyMode)}</Text>
      </View>
      <View style={styles.postMeta}>
        <Text style={styles.metaText}>🖐️ {post.highFiveCount}</Text>
        <Text style={styles.metaText}>💬 {post.commentCount}</Text>
      </View>
      {isOwnPost ? (
        <View style={styles.postActions}>
          <Pressable onPress={onEdit} style={styles.postActionButton}>
            <Ionicons color={Design.colors.primaryGreen} name="create-outline" size={17} />
            <Text style={styles.postActionText}>Sửa</Text>
          </Pressable>
          <Pressable onPress={onDelete} style={styles.postActionButton}>
            <Ionicons color="#B33A3A" name="trash-outline" size={17} />
            <Text style={styles.deleteActionText}>Xóa</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Bình luận</Text>
        {comments.length === 0 ? (
          <Text style={styles.emptyComments}>Chưa có bình luận nào.</Text>
        ) : (
          comments.map((comment) => (
            <View key={comment.id} style={styles.commentRow}>
              <View style={styles.commentAvatar}>
                {comment.authorAvatar ? (
                  <RemoteAvatar
                    fallback={(comment.authorName || "T").charAt(0).toUpperCase()}
                    label={`Ảnh đại diện của ${comment.authorName}`}
                    source={comment.authorAvatar}
                    style={styles.commentAvatarImage}
                  />
                ) : (
                  <Text style={styles.commentAvatarText}>
                    {(comment.authorName || "T").charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{comment.authorName || "Thành viên"}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentDate}>{formatCommentDate(comment.createdAt)}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

function getPrivacyLabel(privacyMode: PrivacyMode) {
  switch (privacyMode) {
    case "FRIENDS_ONLY":
      return "Bạn bè";
    case "PRIVATE":
      return "Chỉ mình tôi";
    case "PUBLIC":
    default:
      return "Công khai";
  }
}

function getPrivacyIcon(
  privacyMode: PrivacyMode,
): ComponentProps<typeof Ionicons>["name"] {
  switch (privacyMode) {
    case "PUBLIC":
      return "globe-outline";
    case "FRIENDS_ONLY":
      return "people-outline";
    case "PRIVATE":
    default:
      return "lock-closed";
  }
}

function RemoteAvatar({
  source,
  fallback,
  label,
  style,
}: {
  source: string;
  fallback: string;
  label: string;
  style: object;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[style, styles.avatarFallback]}>
        <Text style={styles.avatarFallbackText}>{fallback}</Text>
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={label}
      cachePolicy="none"
      contentFit="cover"
      onError={() => setHasError(true)}
      source={{ uri: source }}
      style={style}
    />
  );
}

function formatCommentDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Design.colors.white, flex: 1 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  headerTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
  headerSpacer: { width: 25 },
  content: { padding: 24 },
  profileCard: { alignItems: "center", backgroundColor: "#F8FAF8", borderRadius: 20, padding: 24 },
  avatar: { alignItems: "center", backgroundColor: "#F5D6DE", borderRadius: 48, height: 96, justifyContent: "center", overflow: "hidden", width: 96 },
  avatarImage: { height: "100%", width: "100%" },
  avatarText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: 34 },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarFallbackText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: 34 },
  name: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: 22, marginTop: 16 },
  email: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 4 },
  bio: { color: Design.colors.black, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 2, marginTop: 12, textAlign: "center" },
  profileFriendButton: { alignItems: "center", backgroundColor: Design.colors.primaryGreen, borderRadius: 20, flexDirection: "row", gap: 6, marginTop: 12, paddingHorizontal: 16, paddingVertical: 9 },
  profileFriendButtonText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
  profileFriendButtonSent: { alignItems: "center", backgroundColor: "#EAF3ED", borderColor: Design.colors.primaryGreen, borderRadius: 20, borderWidth: 1, flexDirection: "row", gap: 6, marginTop: 12, paddingHorizontal: 16, paddingVertical: 9 },
  profileFriendButtonSentText: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
  statsRow: { borderColor: "#E9E9E9", borderRadius: 16, borderWidth: 1, flexDirection: "row", justifyContent: "space-around", marginTop: 16, paddingVertical: 18 },
  stat: { alignItems: "center", flex: 1 },
  statValue: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: 20 },
  statLabel: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption, marginTop: 4 },
  friendsSection: { borderColor: "#E9E9E9", borderRadius: 16, borderWidth: 1, marginTop: 16, padding: 14 },
  friendsSectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  friendsTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
  friendsCount: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
  friendRow: { alignItems: "center", borderTopColor: "#F0F0F0", borderTopWidth: 1, flexDirection: "row", paddingVertical: 10 },
  friendRowPressed: { opacity: 0.7 },
  friendAvatar: { alignItems: "center", backgroundColor: "#F5D6DE", borderRadius: 22, height: 44, justifyContent: "center", overflow: "hidden", width: 44 },
  friendAvatarImage: { height: "100%", width: "100%" },
  friendAvatarText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
  friendDetails: { flex: 1, marginLeft: 10 },
  friendName: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
  friendEmail: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption, marginTop: 2 },
  emptyFriends: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, paddingVertical: 8 },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  stateText: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 2, marginTop: 8 },
  postsTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.title, marginTop: 24 },
  postsLoader: { marginTop: 18 },
  emptyPosts: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 12 },
  postCard: { borderColor: "#E9E9E9", borderRadius: 16, borderWidth: 1, marginTop: 14, overflow: "hidden", padding: 12 },
  postVideo: { backgroundColor: "#111111", borderRadius: 12, height: 190, overflow: "hidden" },
  video: { height: "100%", width: "100%" },
  postCaption: { color: Design.colors.black, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 2, marginTop: 10 },
  postTags: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 4 },
  privacyMeta: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 8 },
  privacyMetaText: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption },
  postMeta: { flexDirection: "row", gap: 14, marginTop: 8 },
  metaText: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1 },
  postActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  postActionButton: { alignItems: "center", borderColor: "#E9E9E9", borderRadius: 18, borderWidth: 1, flexDirection: "row", gap: 5, paddingHorizontal: 12, paddingVertical: 7 },
  postActionText: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamMedium, fontSize: Design.fontSize.caption },
  deleteActionText: { color: "#B33A3A", fontFamily: FontFamily.beVietnamMedium, fontSize: Design.fontSize.caption },
  commentsSection: { borderTopColor: "#E9E9E9", borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  commentsTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
  emptyComments: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption, marginTop: 8 },
  commentRow: { flexDirection: "row", marginTop: 10 },
  commentAvatar: { alignItems: "center", backgroundColor: "#F5D6DE", borderRadius: 18, height: 36, justifyContent: "center", overflow: "hidden", width: 36 },
  commentAvatarImage: { height: "100%", width: "100%" },
  commentAvatarText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption },
  commentContent: { flex: 1, marginLeft: 10 },
  commentAuthor: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption },
  commentText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 2 },
  commentDate: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption - 1, marginTop: 3 },
  modalOverlay: { alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.45)", flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  modalCard: { alignItems: "center", backgroundColor: Design.colors.white, borderRadius: 22, padding: 26, width: "100%" },
  modalTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body, marginTop: 12, textAlign: "center" },
  modalMessage: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 2, marginTop: 8, textAlign: "center" },
  modalButton: { alignItems: "center", backgroundColor: Design.colors.primaryGreen, borderRadius: 22, marginTop: 22, minWidth: 120, paddingHorizontal: 24, paddingVertical: 11 },
  modalActionButton: { marginTop: 0 },
  modalButtonText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 2 },
  modalActions: { alignItems: "center", flexDirection: "row", gap: 10, marginTop: 22 },
  secondaryButton: { alignItems: "center", borderColor: "#D9D9D9", borderRadius: 22, borderWidth: 1, minWidth: 100, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryButtonText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 2 },
  deleteButton: { alignItems: "center", backgroundColor: "#B33A3A", borderRadius: 22, minWidth: 100, paddingHorizontal: 18, paddingVertical: 11 },
  editInput: { borderColor: "#D9D9D9", borderRadius: 12, borderWidth: 1, color: Design.colors.black, fontFamily: FontFamily.beVietnamRegular, marginTop: 12, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, width: "100%" },
  privacyRow: { flexDirection: "row", gap: 6, marginTop: 12, width: "100%" },
  privacyButton: { borderColor: "#D9D9D9", borderRadius: 14, borderWidth: 1, flex: 1, paddingVertical: 8 },
  privacyButtonActive: { backgroundColor: Design.colors.primaryGreen, borderColor: Design.colors.primaryGreen },
  privacyButtonText: { color: Design.colors.black, fontFamily: FontFamily.beVietnamRegular, fontSize: 10, textAlign: "center" },
});
