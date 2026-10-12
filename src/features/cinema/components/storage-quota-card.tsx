import { Design, FontFamily } from "@/src/constants/design";
import type { CinemaStorageQuota } from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export type StorageQuotaCardProps = {
  quota: CinemaStorageQuota | null;
  isLoading?: boolean;
  onUpgradePress?: () => void;
};

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 90) return "#EF4444";
  if (percentage >= 70) return "#F59E0B";
  return Design.colors.primaryGreen;
}

export function StorageQuotaCard({
  quota,
  isLoading = false,
  onUpgradePress,
}: StorageQuotaCardProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      router.push("/subscription" as any);
    }
  };

  const percentage = quota?.usagePercentage ?? 0;
  const progressColor = getProgressColor(percentage);

  return (
    <View style={styles.card}>
      {/* Header Row: Title & Plan Badge */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons
              color={Design.colors.primaryGreen}
              name="cloud-outline"
              size={18}
            />
          </View>
          <Text style={styles.titleText}>Dung lượng lưu trữ</Text>
        </View>

        <View
          style={[
            styles.badge,
            quota?.isSubscriptionActive ? styles.badgeActive : styles.badgeFree,
          ]}
        >
          <Ionicons
            color={quota?.isSubscriptionActive ? "#15803D" : "#4B5563"}
            name={quota?.isSubscriptionActive ? "diamond" : "shield-checkmark-outline"}
            size={12}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.badgeText,
              quota?.isSubscriptionActive
                ? styles.badgeTextActive
                : styles.badgeTextFree,
            ]}
          >
            {quota
              ? quota.isSubscriptionActive
                ? quota.planName
                : "Gói Miễn phí"
              : "Đang tải..."}
          </Text>
        </View>
      </View>

      {/* Usage Label Row */}
      <View style={styles.usageRow}>
        <Text style={styles.usageLabel}>
          Đã dùng:{" "}
          <Text style={styles.usageValue}>{quota?.formattedUsed ?? "0 MB"}</Text>
          <Text style={styles.usageDivider}> / </Text>
          <Text style={styles.totalValue}>{quota?.formattedTotal ?? "500 MB"}</Text>
        </Text>
        <Text style={[styles.percentageText, { color: progressColor }]}>
          {percentage}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            {
              width: `${Math.min(Math.max(percentage, 2), 100)}%`,
              backgroundColor: progressColor,
            },
          ]}
        />
      </View>

      {/* Breakdown Details Row (Video vs Ảnh) */}
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Ionicons color="#4B5563" name="film-outline" size={14} style={{ marginRight: 4 }} />
          <Text style={styles.breakdownText}>
            Video: {formatBytes(quota?.usedVideosBytes ?? 0)} ({quota?.totalClipsCount ?? 0})
          </Text>
        </View>

        <View style={styles.breakdownDivider} />

        <View style={styles.breakdownItem}>
          <Ionicons color="#4B5563" name="images-outline" size={14} style={{ marginRight: 4 }} />
          <Text style={styles.breakdownText}>
            Ảnh: {formatBytes(quota?.usedPhotosBytes ?? 0)} ({quota?.totalPhotosCount ?? 0})
          </Text>
        </View>
      </View>

      {/* Upgrade Call-to-action Button */}
      {/* <Pressable
        accessibilityRole="button"
        onPress={handleUpgrade}
        style={({ pressed }) => [
          styles.upgradeBtn,
          pressed && styles.upgradeBtnPressed,
        ]}
      >
        <Ionicons color={Design.colors.primaryGreen} name="sparkles" size={14} />
        <Text style={styles.upgradeBtnText}>
          {quota?.isSubscriptionActive
            ? "Đang áp dụng gói VIP • Nâng cấp thêm"
            : "Nâng cấp lên 5GB dung lượng & mở VIP"}
        </Text>
        <Ionicons
          color={Design.colors.primaryGreen}
          name="chevron-forward"
          size={14}
        />
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Design.colors.white,
    borderColor: "#E9E9E9",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EBF5EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  titleText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  badgeFree: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamMedium,
  },
  badgeTextActive: {
    color: "#15803D",
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  badgeTextFree: {
    color: "#4B5563",
  },
  usageRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
  },
  usageValue: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  usageDivider: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  totalValue: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.mutedText,
  },
  percentageText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    overflow: "hidden",
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  breakdownItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  breakdownText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#374151",
  },
  breakdownDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E5E7EB",
  },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    gap: 6,
  },
  upgradeBtnPressed: {
    opacity: 0.8,
    backgroundColor: "#DCFCE7",
  },
  upgradeBtnText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.primaryGreen,
  },
});
