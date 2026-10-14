import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { styles } from "../community.styles";
import type { CommunityHeaderProps } from "../types/community";

export function CommunityHeader({ onFriendRequestsPress, isNight }: CommunityHeaderProps & { isNight?: boolean }) {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, isNight && { color: '#F8FAFC' }]}>Cộng đồng</Text>
      <Pressable
        accessibilityLabel="Xem lời mời kết bạn"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onFriendRequestsPress}
        style={[styles.friendRequestsButton, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
      >
        <Ionicons
          color={isNight ? '#34D399' : Design.colors.primaryGreen}
          name="person-add-outline"
          size={22}
        />
      </Pressable>
    </View>
  );
}
