import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../shop.styles";
import type { TopupHeaderProps } from "../types/shop";

export function TopupHeader({ onBack }: TopupHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      >
        <Ionicons color="#0F172A" name="chevron-back" size={24} />
      </Pressable>
      <Text style={styles.title}>Nạp Ruby ✨</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}
