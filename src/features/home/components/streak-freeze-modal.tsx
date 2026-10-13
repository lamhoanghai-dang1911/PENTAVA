import { Design, FontFamily } from "@/src/constants/design";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

type StreakFreezeModalProps = {
  visible: boolean;
  onClose: () => void;
  hasStreakProtection: boolean;
  freezesUsedThisMonth: number;
  maxFreezesPerMonth: number;
  streakFrozenYesterday?: boolean;
};

export function StreakFreezeModal({
  visible,
  onClose,
  hasStreakProtection,
  freezesUsedThisMonth,
  maxFreezesPerMonth,
  streakFrozenYesterday,
}: StreakFreezeModalProps) {
  const router = useRouter();

  // Nếu chưa có gói bảo vệ, lượt tối đa và lượt còn lại bắt buộc là 0
  const effectiveMax = hasStreakProtection ? maxFreezesPerMonth : 0;
  const remaining = Math.max(0, effectiveMax - freezesUsedThisMonth);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={[styles.iconCircle, !hasStreakProtection && styles.iconCircleLocked]}>
            <Ionicons
              name={hasStreakProtection ? "snow" : "lock-closed"}
              size={34}
              color={hasStreakProtection ? "#38BDF8" : "#F59E0B"}
            />
          </View>

          <Text style={styles.title}>Đóng Băng Tiến Trình</Text>
          <Text style={[styles.subtitle, !hasStreakProtection && styles.subtitleLocked]}>
            {hasStreakProtection ? "Streak Protection (VIP)" : "Tính Năng Dành Cho Hội Viên (VIP)"}
          </Text>

          {hasStreakProtection && streakFrozenYesterday && (
            <View style={styles.yesterdayBanner}>
              <Ionicons name="shield-checkmark" size={18} color="#059669" />
              <Text style={styles.yesterdayText}>
                Chuỗi Streak hôm qua đã được tự động bảo vệ thành công!
              </Text>
            </View>
          )}

          <View style={styles.statusCard}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Trạng thái bảo vệ:</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: hasStreakProtection ? "#059669" : "#EF4444" },
                ]}
              >
                {hasStreakProtection ? "Đang kích hoạt" : "Chưa kích hoạt"}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Lượt còn lại tháng này:</Text>
              <Text
                style={[
                  styles.statValueHighlight,
                  !hasStreakProtection && styles.statValueLocked,
                ]}
              >
                {hasStreakProtection ? `${remaining} / ${effectiveMax} lượt` : "0 / 0 lượt"}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Đã sử dụng:</Text>
              <Text style={styles.statValue}>
                {hasStreakProtection ? `${freezesUsedThisMonth} lượt` : "0 lượt"}
              </Text>
            </View>
          </View>

          {hasStreakProtection ? (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
              <Text style={styles.infoText}>
                Nếu bạn bận rộn và quên check-in ngày hôm qua, hệ thống sẽ tự động trừ 1 lượt để giữ nguyên ngọn lửa Streak của bạn!
              </Text>
            </View>
          ) : (
            <View style={[styles.infoBox, styles.infoBoxWarning]}>
              <Ionicons name="alert-circle-outline" size={18} color="#D97706" />
              <Text style={[styles.infoText, styles.infoTextWarning]}>
                Tài khoản miễn phí không có lượt bảo vệ. Chuỗi Streak sẽ bị đặt lại nếu bạn bỏ lỡ check-in. Nâng cấp gói để được tự động bảo vệ chuỗi!
              </Text>
            </View>
          )}

          {hasStreakProtection ? (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đã hiểu</Text>
            </Pressable>
          ) : (
            <View style={styles.buttonGroup}>
              <Pressable
                style={styles.upgradeButton}
                onPress={() => {
                  onClose();
                  router.push("/membership");
                }}
              >
                <Ionicons name="diamond-outline" size={18} color="#FFFFFF" />
                <Text style={styles.upgradeButtonText}>Nâng Cấp Gói VIP Ngay</Text>
              </Pressable>

              <Pressable style={styles.dismissButton} onPress={onClose}>
                <Text style={styles.dismissButtonText}>Đã hiểu</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Design.colors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#0284C7",
    marginTop: 2,
    marginBottom: 16,
  },
  yesterdayBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
    width: "100%",
  },
  yesterdayText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#065F46",
  },
  statusCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
  },
  statValue: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.black,
  },
  statValueHighlight: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#0284C7",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: "100%",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#0369A1",
    lineHeight: 18,
  },
  closeButton: {
    width: "100%",
    backgroundColor: Design.colors.primaryGreen,
    paddingVertical: 13,
    borderRadius: 16,
    alignItems: "center",
  },
  closeButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
  },
  iconCircleLocked: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1.5,
    borderColor: "#F59E0B",
  },
  subtitleLocked: {
    color: "#D97706",
  },
  statValueLocked: {
    color: "#9CA3AF",
  },
  infoBoxWarning: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  infoTextWarning: {
    color: "#B45309",
  },
  buttonGroup: {
    width: "100%",
    gap: 10,
  },
  upgradeButton: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A8157",
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#000000",
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
  },
  dismissButton: {
    width: "100%",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButtonText: {
    color: "#6B7280",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 14,
  },
});