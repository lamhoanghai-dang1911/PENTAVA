import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { styles } from "../subscription.styles";
import type { SubscriptionHeaderProps } from "../types/subscription";

export function SubscriptionHeader({ onBack }: SubscriptionHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Pressable
        accessibilityRole="button"
        onPress={onBack}
        style={styles.closeButton}
      >
        <Ionicons name="close" size={24} color={Design.colors.primaryGreen} />
      </Pressable>
    </View>
  );
}
