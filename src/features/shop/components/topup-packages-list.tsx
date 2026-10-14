import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Design } from "@/src/constants/design";
import { formatVnd } from "../utils/shop-utils";
import { styles } from "../shop.styles";
import { TopupPackagesSkeleton } from "./topup-skeleton";
import type { TopupPackagesListProps } from "../types/shop";

import { useAppTheme } from "@/src/context/theme-context";

export function TopupPackagesList({
  isLoading,
  pricing,
  isSubmitting,
  submittingPackageCode,
  onBuyPackage,
}: TopupPackagesListProps) {
  const { isNight } = useAppTheme();

  return (
    <View style={styles.packagesSection}>
      <Text style={[styles.sectionTitle, isNight && { color: '#F8FAFC' }]}>Bảng giá các gói Ruby</Text>
      {isLoading ? (
        <TopupPackagesSkeleton />
      ) : pricing ? (
        pricing.packages.map((pack) => (
          <View key={pack.code} style={[styles.packageCard, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.packageInfo}>
              <View style={styles.packageNameRow}>
                <Text style={[styles.packageName, isNight && { color: '#F8FAFC' }]}>{pack.name}</Text>
                {pack.popular ? (
                  <Text style={[styles.packageTag, styles.popularTag]}>Phổ biến</Text>
                ) : null}
                {pack.bestValue ? (
                  <Text style={[styles.packageTag, styles.bestValueTag]}>Tốt nhất</Text>
                ) : null}
              </View>
              <Text style={[styles.packageRuby, isNight && { color: '#94A3B8' }]}>{pack.rubyAmount} Ruby</Text>
              {pack.bonusRuby > 0 ? (
                <Text style={styles.packageBonus}>Thưởng thêm {pack.bonusRuby} Ruby</Text>
              ) : null}
            </View>
            <View style={styles.packagePrice}>
              <Text style={[styles.packageCurrentPrice, isNight && { color: '#34D399' }]}>{formatVnd(pack.priceVnd)}</Text>
              {pack.discountVnd > 0 ? (
                <>
                  <Text style={styles.packageOriginalPrice}>
                    {formatVnd(pack.originalPriceVnd)}
                  </Text>
                  <Text style={styles.packageDiscount}>
                    Tiết kiệm {formatVnd(pack.discountVnd)}
                  </Text>
                </>
              ) : null}
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isSubmitting }}
                disabled={isSubmitting}
                onPress={() => onBuyPackage(pack)}
                style={({ pressed }) => [
                  styles.packageBuyButton,
                  isSubmitting && styles.disabledButton,
                  pressed && !isSubmitting && styles.pressedButton,
                ]}
              >
                {submittingPackageCode === pack.code ? (
                  <ActivityIndicator color={Design.colors.white} size="small" />
                ) : (
                  <Text style={styles.packageBuyLabel}>Mua</Text>
                )}
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.packageLoadHint}>Bảng giá sẽ hiển thị khi tải lại thành công.</Text>
      )}
    </View>
  );
}
