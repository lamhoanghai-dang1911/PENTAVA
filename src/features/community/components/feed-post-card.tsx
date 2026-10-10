import React from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatPostDate } from "../utils/community-utils";
import { ImageAvatar } from "./image-avatar";
import { styles } from "../community.styles";
import type { FeedPostCardProps } from "../types/community";

export function FeedPostCard({
  post,
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
}: FeedPostCardProps) {
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
          onPress={() => undefined}
        >
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
          ]}
        >
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
          style={[styles.actionChip, openCommentPostId === postId && styles.actionChipActive]}
        >
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
                onPress={() => onDeleteComment(postId, comment.id)}
              >
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
            onPress={() => onSubmitComment(postId)}
          >
            <Ionicons color={Design.colors.primaryGreen} name="send" size={18} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
