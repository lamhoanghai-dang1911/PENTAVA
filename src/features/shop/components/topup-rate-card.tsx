import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { formatVnd } from "../utils/shop-utils";
import { styles } from "../shop.styles";
import type { TopupRateCardProps } from "../types/shop";

export function TopupRateCard({
  isLoading,
  pricing,
  error,
  onRetry,
}: TopupRateCardProps) {
  return (
    <View style={styles.rateCard}>
      <Text style={styles.rateText}>Tỷ lệ quy đổi</Text>
      {isLoading ? (
        <ActivityIndicator color="#E11D48" />
      ) : pricing ? (
        <>
          <View style={styles.rateValueRow}>
            <Text style={styles.rateValue}>1</Text>
            <Image
              contentFit="contain"
              source={require("@/assets/images/ruby.png")}
              style={styles.rubyIcon}
            />
            <Text style={styles.rateValue}>
              = {formatVnd(pricing.baseRateVndPerRuby)}
            </Text>
          </View>
          <Text style={styles.rateHint}>{pricing.customTopupRule}</Text>
        </>
      ) : (
        <View style={styles.pricingError}>
          <Text accessibilityRole="alert" style={styles.errorText}>
            {error}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Thử tải lại</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
