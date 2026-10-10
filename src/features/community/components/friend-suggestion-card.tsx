import React from "react";
import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { styles } from "../community.styles";
import type { FriendSuggestionCardProps } from "../types/community";

export function FriendSuggestionCard({
  suggestion,
  onPress,
  onAddFriend,
  isSending,
}: FriendSuggestionCardProps) {
  const displayName = suggestion.name.trim() || suggestion.email.split("@")[0] || "Thành viên";
  const fallback = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.suggestionCard}>
      <Pressable
        accessibilityLabel={`Xem trang cá nhân của ${displayName}`}
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => [styles.suggestionProfileButton, pressed && styles.cardPressed]}
      >
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
        <Text numberOfLines={1} style={styles.suggestionName}>
          {displayName}
        </Text>
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
        style={styles.addFriendButton}
      >
        <Ionicons color={Design.colors.white} name="person-add-outline" size={14} />
        <Text style={styles.addFriendButtonText}>
          {isSending ? "Đang gửi..." : "Thêm bạn"}
        </Text>
      </Pressable>
    </View>
  );
}
