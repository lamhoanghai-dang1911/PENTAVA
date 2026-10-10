import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Design } from "@/src/constants/design";
import { formatVnd } from "../utils/shop-utils";
import { styles } from "../shop.styles";
import type { TopupPackagesListProps } from "../types/shop";

export function TopupPackagesList({
  isLoading,
  pricing,
  isSubmitting,
  submittingPackageCode,
  onBuyPackage,
}: TopupPackagesListProps) {
  return (
    <View style={styles.packagesSection}>
      <Text style={styles.sectionTitle}>Bảng giá các gói Ruby</Text>
      {isLoading ? (
        <ActivityIndicator color={Design.colors.primaryGreen} style={styles.packagesLoading} />
      ) : pricing ? (
        pricing.packages.map((pack) => (
          <View key={pack.code} style={styles.packageCard}>
            <View style={styles.packageInfo}>
              <View style={styles.packageNameRow}>
                <Text style={styles.packageName}>{pack.name}</Text>
                {pack.popular ? (
                  <Text style={[styles.packageTag, styles.popularTag]}>Phổ biến</Text>
                ) : null}
                {pack.bestValue ? (
                  <Text style={[styles.packageTag, styles.bestValueTag]}>Tốt nhất</Text>
                ) : null}
              </View>
              <Text style={styles.packageRuby}>{pack.rubyAmount} Ruby</Text>
              {pack.bonusRuby > 0 ? (
                <Text style={styles.packageBonus}>Thưởng thêm {pack.bonusRuby} Ruby</Text>
              ) : null}
            </View>
            <View style={styles.packagePrice}>
              <Text style={styles.packageCurrentPrice}>{formatVnd(pack.priceVnd)}</Text>
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
