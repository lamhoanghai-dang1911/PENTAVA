import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { WeekOptionsContentProps } from "../types/cinema";

export function WeekOptionsContent({
  week,
  onPhotosPress,
  onClipsPress,
}: WeekOptionsContentProps) {
  return (
    <View style={styles.weekOptionsContent}>
      <Text style={styles.weeksGoalName}>WEEK {week.weekNumber}</Text>
      <Text style={styles.goalHint}>
        {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPhotosPress}
        style={({ pressed }) => [styles.weekOption, pressed && styles.cardPressed]}
      >
        <View style={styles.weekOptionIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="images-outline" size={26} />
        </View>
        <View style={styles.weekOptionText}>
          <Text style={styles.weekOptionTitle}>Danh sách ảnh</Text>
          <Text style={styles.weekOptionHint}>Xem và chọn ảnh check-in để tạo video</Text>
        </View>
        <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={22} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onClipsPress}
        style={({ pressed }) => [styles.weekOption, pressed && styles.cardPressed]}
      >
        <View style={styles.weekOptionIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="film-outline" size={26} />
        </View>
        <View style={styles.weekOptionText}>
          <Text style={styles.weekOptionTitle}>Danh sách PENTA-CINEMA</Text>
          <Text style={styles.weekOptionHint}>Xem các video đã tạo trong tuần</Text>
        </View>
        <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={22} />
      </Pressable>
    </View>
  );
}
