import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { styles } from "../community.styles";
import type { CommunityHeaderProps } from "../types/community";

export function CommunityHeader({ onBack, onFriendRequestsPress }: CommunityHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        hitSlop={8}
        onPress={onBack}
        style={styles.backButton}
      >
        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
      </Pressable>
      <Text style={styles.headerTitle}>Cộng đồng</Text>
      <Pressable
        accessibilityLabel="Xem lời mời kết bạn"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onFriendRequestsPress}
        style={styles.friendRequestsButton}
      >
        <Ionicons
          color={Design.colors.primaryGreen}
          name="person-add-outline"
          size={22}
        />
      </Pressable>
    </View>
  );
}
