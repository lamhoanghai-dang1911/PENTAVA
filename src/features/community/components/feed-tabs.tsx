import React from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "../community.styles";
import type { FeedTabsProps } from "../types/community";

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.feedTabs}>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "for-you" }}
        onPress={() => onTabChange("for-you")}
        style={[styles.feedTab, activeTab === "for-you" && styles.feedTabActive]}
      >
        <Text style={[styles.feedTabText, activeTab === "for-you" && styles.feedTabTextActive]}>
          For You
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === "friends" }}
        onPress={() => onTabChange("friends")}
        style={[styles.feedTab, activeTab === "friends" && styles.feedTabActive]}
      >
        <Text style={[styles.feedTabText, activeTab === "friends" && styles.feedTabTextActive]}>
          Friend
        </Text>
      </Pressable>
    </View>
  );
}
