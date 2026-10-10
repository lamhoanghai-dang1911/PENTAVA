import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatDate } from "../utils/subscription-utils";
import { styles } from "../subscription.styles";
import type { SubscriptionActiveCardProps } from "../types/subscription";

export function SubscriptionActiveCard({ subscription }: SubscriptionActiveCardProps) {
  if (!subscription.hasActiveSubscription) {
    return null;
  }

  return (
    <View style={styles.activeSubCard}>
      <View style={styles.activeSubHeader}>
        <View style={styles.activeSubTitleRow}>
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <Text style={styles.activeSubTitle}>Gói cước đang kích hoạt</Text>
        </View>
        {subscription.badge ? (
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>{subscription.badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.activeSubPlanName}>{subscription.planName}</Text>
      <Text style={styles.activeSubMetaText}>
        Còn lại {subscription.daysRemaining} ngày
        {subscription.endDate ? ` (hạn đến ${formatDate(subscription.endDate)})` : ""}
      </Text>
    </View>
  );
}
