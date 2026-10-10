import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate, STATUS_LABELS } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { GoalCardProps } from "../types/cinema";

export function GoalCard({ goal, onPress }: GoalCardProps) {
  const statusLabel = STATUS_LABELS[goal.status] ?? goal.status;

  return (
    <Pressable
      accessibilityLabel={`Mở mục tiêu ${goal.goalName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.goalCard, pressed && styles.cardPressed]}
    >
      <View style={styles.goalCardHeader}>
        <View style={styles.goalIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="flag-outline" size={20} />
        </View>
        <View style={styles.goalTitleContainer}>
          <Text style={styles.goalName}>{goal.goalName}</Text>
        </View>
      </View>

      <View style={styles.goalDetails}>
        <View style={styles.detailItem}>
          <Ionicons color={Design.colors.mutedText} name="calendar-outline" size={16} />
          <Text style={styles.detailText}>
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons color={Design.colors.mutedText} name="time-outline" size={16} />
          <Text style={styles.detailText}>
            {goal.expired ? "Đã hết hạn" : "Chưa hết hạn"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          goal.expired && styles.statusBadgeExpired,
          goal.status === "COMPLETED" && styles.statusBadgeCompleted,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            goal.expired && styles.statusTextExpired,
            goal.status === "COMPLETED" && styles.statusTextCompleted,
          ]}
        >
          {statusLabel}
        </Text>
      </View>
    </Pressable>
  );
}
