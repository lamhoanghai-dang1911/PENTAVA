import { Design } from "@/src/constants/design";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./community.styles";
import { CommunityHeader } from "./components/community-header";
import { DeleteCommentModal, ErrorModal } from "./components/community-modals";
import { FeedPostCard } from "./components/feed-post-card";
import { FeedTabs } from "./components/feed-tabs";
import { FriendSuggestionsSection } from "./components/friend-suggestions-section";
import { useCommunity } from "./hooks/use-community";

export default function CommunityScreen() {
  const {
    displayName,
    activeTab,
    posts,
    suggestions,
    openCommentPostId,
    commentDraft,
    isInitialLoading,
    isLoadingMore,
    isSuggestionsLoading,
    errorMessage,
    highFivePendingPostId,
    commentsLoadingPostId,
    pendingCommentId,
    commentToDelete,
    sendingFriendRequestId,
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
  } = useCommunity();

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <CommunityHeader
          onBack={() => router.replace("/(tabs)")}
          onFriendRequestsPress={() => router.push("/friend-requests")}
        />

        <View style={styles.content}>
          <FeedTabs activeTab={activeTab} onTabChange={handleTabChange} />

          {activeTab === "friends" ? (
            <FriendSuggestionsSection
              isLoading={isSuggestionsLoading}
              onAddFriend={(userId) => void sendFriendRequest(userId)}
              onSuggestionPress={(userId) =>
                router.push({
                  pathname: "/social-profile",
                  params: { userId: String(userId) },
                })
              }
              sendingFriendRequestId={sendingFriendRequestId}
              suggestions={suggestions}
            />
          ) : null}

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
                  <Ionicons
                    color={Design.colors.disabled}
                    name="newspaper-outline"
                    size={40}
                  />
                  <Text style={styles.emptyTitle}>
                    {activeTab === "friends"
                      ? "Chưa có bài đăng từ bạn bè"
                      : "Chưa có bài đăng"}
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
                  <ActivityIndicator
                    color={Design.colors.primaryGreen}
                    style={styles.footerLoader}
                  />
                ) : null
              }
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              renderItem={({ item }) => (
                <FeedPostCard
                  commentDraft={commentDraft}
                  displayName={displayName}
                  isCommentsLoading={commentsLoadingPostId === String(item.id)}
                  isHighFivePending={highFivePendingPostId === String(item.id)}
                  onCommentDraftChange={setCommentDraft}
                  onDeleteComment={requestDeleteComment}
                  onSubmitComment={submitComment}
                  onToggleCommentBox={toggleCommentBox}
                  onToggleHiFive={toggleHiFive}
                  openCommentPostId={openCommentPostId}
                  pendingCommentId={pendingCommentId}
                  post={item}
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <ErrorModal
        errorMessage={errorMessage}
        onClose={() => setErrorMessage(null)}
        onRetry={handleRetry}
        visible={errorMessage !== null}
      />

      <DeleteCommentModal
        onCancel={() => setCommentToDelete(null)}
        onConfirm={() => void confirmDeleteComment()}
        visible={commentToDelete !== null}
      />
    </SafeAreaView>
  );
}
