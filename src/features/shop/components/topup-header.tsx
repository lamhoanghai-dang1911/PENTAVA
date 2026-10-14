import React from "react";
import { View, Text } from "react-native";
import { styles } from "../shop.styles";
import type { TopupHeaderProps } from "../types/shop";

export function TopupHeader({ onBack: _onBack }: TopupHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Nạp Ruby ✨</Text>
    </View>
  );
}
