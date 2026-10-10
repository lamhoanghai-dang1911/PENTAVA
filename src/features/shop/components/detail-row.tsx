import React from "react";
import { View, Text } from "react-native";
import { styles } from "../shop.styles";
import type { DetailRowProps } from "../types/shop";

export function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>{value}</Text>
    </View>
  );
}
