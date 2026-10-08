import { Design, FontFamily } from "@/src/constants/design";
import type { SubscriptionQrModalProps } from "@/src/features/subscription/types/subscription";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function SubscriptionQrModal({
  visible,
  transaction,
  onClose,
  onCheckStatus,
  isCheckingStatus,
  onMockConfirm,
  isMockConfirming,
  statusMessage,
}: SubscriptionQrModalProps) {
  if (!visible || !transaction) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Thanh toán VietQR</Text>
              <Text style={styles.headerSubtitle}>
                {transaction.planName} · {formatVnd(transaction.amountVnd)}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={22} color={Design.colors.mutedText} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* QR Code Container */}
            <View style={styles.qrContainer}>
              {transaction.qrCodeUrl ? (
                <Image
                  contentFit="contain"
                  source={{ uri: transaction.qrCodeUrl }}
                  style={styles.qrImage}
                />
              ) : (
                <View style={styles.qrPlaceholder}>
                  <ActivityIndicator color={Design.colors.primaryGreen} />
                </View>
              )}
              <Text style={styles.qrHint}>
                Mở ứng dụng Ngân hàng hoặc ví điện tử để quét mã QR
              </Text>
            </View>

            {/* Transfer Details Card */}
            <View style={styles.detailsCard}>
              <Text style={styles.detailsTitle}>Thông tin chuyển khoản</Text>

              <DetailRow label="Ngân hàng" value={transaction.bankCode} />
              <DetailRow label="Số tài khoản" value={transaction.accountNumber} />
              <DetailRow label="Chủ tài khoản" value={transaction.accountName} />
              <DetailRow
                highlight
                label="Số tiền"
                value={formatVnd(transaction.amountVnd)}
              />
              <DetailRow
                highlight
                label="Nội dung CK"
                value={transaction.transferContent}
              />
              <DetailRow label="Mã giao dịch" value={transaction.transactionCode} />
            </View>

            <View style={styles.alertNote}>
              <Ionicons
                color={Design.colors.primaryGreen}
                name="information-circle-outline"
                size={18}
              />
              <Text style={styles.alertText}>
                Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống tự động kích
                hoạt gói cước ngay khi nhận được thanh toán.
              </Text>
            </View>

            {statusMessage ? (
              <View style={styles.statusMessageBox}>
                <Ionicons color="#E11D48" name="alert-circle-outline" size={18} />
                <Text style={styles.statusMessageText}>{statusMessage}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                disabled={isCheckingStatus}
                onPress={() => void onCheckStatus()}
                style={({ pressed }) => [
                  styles.checkButton,
                  isCheckingStatus && styles.buttonDisabled,
                  pressed && styles.buttonPressed,
                ]}
              >
                {isCheckingStatus ? (
                  <ActivityIndicator color={Design.colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons
                      color={Design.colors.white}
                      name="checkmark-circle-outline"
                      size={18}
                    />
                    <Text style={styles.checkButtonText}>
                      Tôi đã chuyển khoản · Kiểm tra ngay
                    </Text>
                  </>
                )}
              </Pressable>

              {onMockConfirm ? (
                <Pressable
                  accessibilityRole="button"
                  disabled={isMockConfirming}
                  onPress={() => void onMockConfirm()}
                  style={({ pressed }) => [
                    styles.mockButton,
                    isMockConfirming && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  {isMockConfirming ? (
                    <ActivityIndicator
                      color={Design.colors.primaryGreen}
                      size="small"
                    />
                  ) : (
                    <>
                      <Ionicons
                        color={Design.colors.primaryGreen}
                        name="flash-outline"
                        size={16}
                      />
                      <Text style={styles.mockButtonText}>
                        Mô phỏng thanh toán (Test Dev)
                      </Text>
                    </>
                  )}
                </Pressable>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text
        selectable
        style={[styles.detailValue, highlight && styles.detailValueHighlight]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: Design.colors.white,
    borderRadius: 24,
    maxHeight: "90%",
    overflow: "hidden",
    width: "100%",
    maxWidth: 420,
  },
  header: {
    alignItems: "center",
    borderBottomColor: "#F1F5F9",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 16,
  },
  headerSubtitle: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
    marginTop: 2,
  },
  closeButton: {
    backgroundColor: "#F1F5F9",
    borderRadius: 18,
    padding: 6,
  },
  scrollContent: {
    padding: 20,
  },
  qrContainer: {
    alignItems: "center",
    backgroundColor: "#F8FAF7",
    borderColor: "#E2EFE5",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  qrImage: {
    borderRadius: 12,
    height: 200,
    width: 200,
  },
  qrPlaceholder: {
    alignItems: "center",
    height: 200,
    justifyContent: "center",
    width: 200,
  },
  qrHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
    marginTop: 10,
    textAlign: "center",
  },
  detailsCard: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 14,
    padding: 14,
  },
  detailsTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 12,
  },
  detailValue: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
  },
  detailValueHighlight: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  alertNote: {
    alignItems: "flex-start",
    backgroundColor: "#F0F7F2",
    borderRadius: 12,
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    padding: 12,
  },
  alertText: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  statusMessageBox: {
    alignItems: "flex-start",
    backgroundColor: "#FFF1F2",
    borderColor: "#FECDD3",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    padding: 12,
  },
  statusMessageText: {
    color: "#BE123C",
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
  checkButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 24,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    paddingVertical: 13,
  },
  checkButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  mockButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: Design.colors.primaryGreen,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingVertical: 11,
  },
  mockButtonText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
