import React from "react";
import { View } from "react-native";
import { PrimaryButton } from "@/src/components/ui/primary-button";
import { styles } from "../subscription.styles";
import type { SubscriptionFooterProps } from "../types/subscription";

export function SubscriptionFooter({
  selectedPlan,
  isPurchasing,
  onPurchase,
}: SubscriptionFooterProps) {
  return (
    <View style={styles.footer}>
      <PrimaryButton
        label={
          isPurchasing
            ? "Đang khởi tạo..."
            : selectedPlan
              ? "ĐĂNG KÝ GÓI"
              : "Tiếp tục thanh toán"
        }
        loading={isPurchasing}
        onPress={onPurchase}
        style={styles.actionButton}
      />
    </View>
  );
}
