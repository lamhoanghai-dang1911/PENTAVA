import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate, WEEK_COLORS } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { WeekCardProps } from "../types/cinema";

export function WeekCard({ week, index, onPress }: WeekCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tuần ${week.weekNumber}`}
      onPress={onPress}
      style={[
        styles.weekCard,
        { backgroundColor: WEEK_COLORS[week.weekNumber - 1] ?? WEEK_COLORS[0] },
        index > 0 && styles.weekCardOverlap,
      ]}
    >
      <View style={styles.weekInfo}>
        <Text style={styles.weekTitle}>WEEK {week.weekNumber}</Text>
        <Text style={styles.weekDate}>
          {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
        </Text>
        <Text style={styles.weekProgress}>
          {week.photoCount} ảnh
          {week.eligible ? " · Đủ điều kiện" : ` · Cần thêm ${week.photosNeeded} ảnh`}
        </Text>
      </View>
      <View style={styles.weekAction}>
        {week.current ? <Text style={styles.currentLabel}>ĐANG DIỄN RA</Text> : null}
        <Ionicons color={Design.colors.white} name="chevron-forward" size={24} />
      </View>
    </Pressable>
  );
}
