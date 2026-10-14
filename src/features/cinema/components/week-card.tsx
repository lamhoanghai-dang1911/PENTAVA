import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate, WEEK_COLORS } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { WeekCardProps } from "../types/cinema";

export function WeekCard({ week, index, onPress, minPhotos = 3 }: WeekCardProps) {
  const requiredPhotos = minPhotos > 0 ? minPhotos : 3;
  const progressRatio = Math.min(1, Math.max(0, week.photoCount / requiredPhotos));
  const progressPercent = Math.round(progressRatio * 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tuần ${week.weekNumber}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.weekCard,
        { backgroundColor: WEEK_COLORS[week.weekNumber - 1] ?? WEEK_COLORS[0] },
        pressed && styles.weekCardPressed,
      ]}
    >
      {/* Top Header: Week Title & Status Badges & Action Arrow */}
      <View style={styles.weekCardTop}>
        <View style={styles.weekTitleWrap}>
          <Text style={styles.weekTitle}>WEEK {week.weekNumber}</Text>
          {week.current && (
            <View style={styles.currentBadge}>
              <View style={styles.currentDot} />
              <Text style={styles.currentText}>ĐANG DIỄN RA</Text>
            </View>
          )}
        </View>

        <View style={styles.actionCircle}>
          <Ionicons color={Design.colors.white} name="chevron-forward" size={18} />
        </View>
      </View>

      {/* Date Range */}
      <View style={styles.weekMetaRow}>
        <Ionicons color="rgba(255, 255, 255, 0.9)" name="calendar-outline" size={14} />
        <Text style={styles.weekDate}>
          {formatDate(week.weekStart)} – {formatDate(week.weekEnd)}
        </Text>
      </View>

      {/* Photo count & Eligibility Badge */}
      <View style={styles.weekProgressRow}>
        <View style={styles.photoCountWrap}>
          <Ionicons color="rgba(255, 255, 255, 0.95)" name="images-outline" size={14} />
          <Text style={styles.weekProgressText}>
            {week.photoCount} ảnh check-in
          </Text>
        </View>

        <View
          style={[
            styles.eligibilityBadge,
            week.eligible ? styles.eligibilityBadgeSuccess : styles.eligibilityBadgePending,
          ]}
        >
          <Ionicons
            color={Design.colors.white}
            name={week.eligible ? "checkmark-circle" : "time-outline"}
            size={13}
          />
          <Text style={styles.eligibilityText}>
            {week.eligible ? "Đủ điều kiện" : `Cần thêm ${week.photosNeeded} ảnh`}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.weekProgressTrack}>
        <View
          style={[
            styles.weekProgressFill,
            { width: `${progressPercent}%` },
          ]}
        />
      </View>
    </Pressable>
  );
}
