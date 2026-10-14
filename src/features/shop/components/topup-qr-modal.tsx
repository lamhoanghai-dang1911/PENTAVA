import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import type { TopupQrModalProps } from "../types/shop";
import { formatVnd, formatTopupStatus } from "../utils/shop-utils";
import { styles } from "../topup-qr-modal.styles";

export function TopupQrModal({
  visible,
  transaction,
  rubyBalance,
  isCheckingStatus,
  statusError,
  onCheckStatus,
  onClose,
}: TopupQrModalProps) {
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 720;
  const qrSize = isSmallScreen ? 140 : 170;

  if (!visible || !transaction) return null;

  const isSuccess = transaction.status === "SUCCESS";
  const statusLabel = formatTopupStatus(transaction.status);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* 1. Header cố định phía trên */}
          <ModalHeader
            onClose={onClose}
            rubyAmount={transaction.rubyAmount}
          />

          {/* 2. Nội dung cuộn mượt mà ở giữa */}
          <ScrollView
            bounces={false}
            contentContainerStyle={[
              styles.scrollContent,
              isSmallScreen && styles.scrollContentCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            {/* QR Code Container */}
            <QrCodeSection qrCodeUrl={transaction.qrCodeUrl} qrSize={qrSize} />

            {/* Trạng thái giao dịch */}
            <StatusBadgeSection
              isSuccess={isSuccess}
              statusLabel={statusLabel}
            />

            {/* Số dư ví sau khi nạp thành công */}
            {isSuccess && rubyBalance !== null && (
              <WalletBalanceSection rubyBalance={rubyBalance} />
            )}

            {/* Khung nổi bật: Số tiền & Nội dung CK quan trọng */}
            <TransferHighlightCard
              amountVnd={transaction.amountVnd}
              transferContent={transaction.transferContent}
            />

            {/* Chi tiết thông tin ngân hàng */}
            <TransferDetailsSection transaction={transaction} />

            {/* Lưu ý chuyển khoản */}
            <TransferAlertNote />

            {/* Thông báo lỗi / trạng thái nếu có */}
            {statusError ? (
              <StatusErrorMessage message={statusError} />
            ) : null}
          </ScrollView>

          {/* 3. Nút hành động cố định ở chân modal (Sticky Footer) */}
          <ActionButtonsSection
            isCheckingStatus={isCheckingStatus}
            isSuccess={isSuccess}
            onCheckStatus={onCheckStatus}
            onClose={onClose}
          />
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ModalHeaderProps {
  rubyAmount: number;
  onClose: () => void;
}

function ModalHeader({ rubyAmount, onClose }: ModalHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleBox}>
        <Text style={styles.headerTitle}>Thanh toán nạp Ruby</Text>
        <Text style={styles.headerSubtitle}>Nhận +{rubyAmount} Ruby</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={onClose}
        style={styles.closeButton}
      >
        <Ionicons color={Design.colors.black} name="close" size={18} />
      </Pressable>
    </View>
  );
}

function QrCodeSection({
  qrCodeUrl,
  qrSize,
}: {
  qrCodeUrl?: string;
  qrSize: number;
}) {
  return (
    <View style={styles.qrContainer}>
      {qrCodeUrl ? (
        <Image
          contentFit="contain"
          source={{ uri: qrCodeUrl }}
          style={{ width: qrSize, height: qrSize, borderRadius: 10 }}
        />
      ) : (
        <View style={[styles.qrPlaceholder, { width: qrSize, height: qrSize }]}>
          <ActivityIndicator color={Design.colors.primaryGreen} />
        </View>
      )}
      <Text style={styles.qrHint}>
        Mở ứng dụng Ngân hàng để quét mã QR VietQR
      </Text>
    </View>
  );
}

interface StatusBadgeSectionProps {
  isSuccess: boolean;
  statusLabel: string;
}

function StatusBadgeSection({ isSuccess, statusLabel }: StatusBadgeSectionProps) {
  return (
    <View
      style={[
        styles.statusBadge,
        isSuccess ? styles.successStatus : styles.pendingStatus,
      ]}
    >
      <Ionicons
        color={isSuccess ? "#047857" : "#B45309"}
        name={isSuccess ? "checkmark-circle" : "time-outline"}
        size={14}
      />
      <Text
        style={[
          styles.statusText,
          isSuccess ? styles.successStatusText : styles.pendingStatusText,
        ]}
      >
        {isSuccess ? "Nạp Ruby thành công!" : statusLabel}
      </Text>
    </View>
  );
}

function WalletBalanceSection({ rubyBalance }: { rubyBalance: number }) {
  return (
    <View style={styles.walletBalanceCard}>
      <Text style={styles.walletBalanceLabel}>Số dư ví hiện tại</Text>
      <View style={styles.walletBalanceValueRow}>
        <Text style={styles.walletBalanceValue}>{rubyBalance}</Text>
        <Image
          contentFit="contain"
          source={require("@/assets/images/ruby.png")}
          style={styles.smallRubyIcon}
        />
      </View>
    </View>
  );
}

function TransferHighlightCard({
  amountVnd,
  transferContent,
}: {
  amountVnd: number;
  transferContent: string;
}) {
  return (
    <View style={styles.highlightCard}>
      <View style={styles.highlightCol}>
        <Text style={styles.highlightLabel}>Số tiền</Text>
        <Text selectable style={styles.highlightValue}>
          {formatVnd(amountVnd)}
        </Text>
      </View>
      <View style={[styles.highlightCol, { alignItems: "flex-end" }]}>
        <Text style={styles.highlightLabel}>Nội dung CK</Text>
        <Text selectable style={styles.highlightCode}>
          {transferContent}
        </Text>
      </View>
    </View>
  );
}

interface TransferDetailsProps {
  transaction: NonNullable<TopupQrModalProps["transaction"]>;
}

function TransferDetailsSection({ transaction }: TransferDetailsProps) {
  return (
    <View style={styles.detailsCard}>
      <Text style={styles.detailsTitle}>Thông tin thụ hưởng</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Ngân hàng</Text>
        <Text selectable style={styles.detailValue}>
          {transaction.bankCode}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Số tài khoản</Text>
        <Text selectable style={styles.detailValue}>
          {transaction.accountNumber}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Chủ tài khoản</Text>
        <Text selectable style={styles.detailValue}>
          {transaction.accountName}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Mã giao dịch</Text>
        <Text selectable style={styles.detailValue}>
          {transaction.transactionCode}
        </Text>
      </View>
    </View>
  );
}

function TransferAlertNote() {
  return (
    <View style={styles.alertNote}>
      <Ionicons
        color={Design.colors.primaryGreen}
        name="information-circle-outline"
        size={16}
      />
      <Text style={styles.alertText}>
        Vui lòng chuyển đúng số tiền & nội dung để hệ thống tự động cộng Ruby.
      </Text>
    </View>
  );
}

function StatusErrorMessage({ message }: { message: string }) {
  return (
    <View style={styles.statusMessageBox}>
      <Ionicons color="#E11D48" name="alert-circle-outline" size={16} />
      <Text style={styles.statusMessageText}>{message}</Text>
    </View>
  );
}

interface ActionButtonsSectionProps {
  isSuccess: boolean;
  isCheckingStatus: boolean;
  onCheckStatus: () => void;
  onClose: () => void;
}

function ActionButtonsSection({
  isSuccess,
  isCheckingStatus,
  onCheckStatus,
  onClose,
}: ActionButtonsSectionProps) {
  return (
    <View style={styles.actionsFooter}>
      {isSuccess ? (
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.doneButtonText}>Hoàn tất</Text>
        </Pressable>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={isCheckingStatus}
          onPress={onCheckStatus}
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
                Tôi đã chuyển khoản • Kiểm tra ngay
              </Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}
