import React from "react";
import { View, Text, Pressable } from "react-native";
import { formatVnd, getPlanVisuals } from "../utils/subscription-utils";
import { styles } from "../subscription.styles";
import type { SubscriptionPlanCardProps } from "../types/subscription";

export function SubscriptionPlanCard({
  plan,
  selected,
  isCurrentActivePlan,
  onSelect,
}: SubscriptionPlanCardProps) {
  const visuals = getPlanVisuals(plan.code);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSelect(plan.code)}
      style={({ pressed }) => [
        styles.packageCard,
        selected && styles.packageCardSelected,
        pressed && styles.packageCardPressed,
      ]}
    >
      {/* Selection Radio Circle at Top Right */}
      <View style={styles.radioContainer}>
        <View
          style={[
            styles.radioCircle,
            selected && styles.radioCircleSelected,
          ]}
        >
          {selected && <View style={styles.radioInnerDot} />}
        </View>
      </View>

      <View style={styles.packageContentRow}>
        <View style={styles.packageLeftCol}>
          <View
            style={[
              styles.crownIconContainer,
              { backgroundColor: visuals.crownBg },
            ]}
          >
            <Text style={styles.crownEmoji}>{visuals.crownEmoji}</Text>
          </View>
          <View style={styles.packageTitleRow}>
            <Text style={styles.packageTitle}>{plan.name}</Text>
            {plan.badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{plan.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.packagePrice}>
            {formatVnd(plan.priceVnd)}
            <Text style={styles.packageDuration}>
              {" "}/{plan.durationDays} ngày
            </Text>
          </Text>
          {isCurrentActivePlan ? (
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>Đang sử dụng</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.featuresBox}>
          {plan.features.map((feature) => {
            const isFeatureEnabled =
              (feature as any).isEnabled ?? (feature as any).enabled ?? false;
            return (
              <View
                key={feature.featureId || feature.featureCode}
                style={styles.featureRow}
              >
                <Text
                  style={[
                    styles.featureText,
                    !isFeatureEnabled && styles.featureTextDisabled,
                  ]}
                >
                  {feature.displayLabel || feature.name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}
