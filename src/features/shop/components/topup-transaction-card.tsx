import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import LottieView from "lottie-react-native";
import { Design } from "@/src/constants/design";
import { formatVnd, formatTopupStatus } from "../utils/shop-utils";
import { DetailRow } from "./detail-row";
import { styles } from "../shop.styles";
import type { TopupTransactionCardProps } from "../types/shop";

export function TopupTransactionCard({
  transaction,
  rubyBalance,
  isCheckingStatus,
  statusError,
  onCheckStatus,
  onClose,
}: TopupTransactionCardProps) {
  const isSuccess = transaction.status === "SUCCESS";
  const isFailed = transaction.status === "FAILED" || transaction.status === "EXPIRED";
  const statusLabel = formatTopupStatus(transaction.status);

  if (isSuccess) {
    return (
      <View style={[styles.transactionCard, styles.successCard]}>
        <View style={styles.lottieAnimationWrapper}>
          <LottieView
            autoPlay
            loop={false}
            resizeMode="contain"
            source={require("@/assets/lottie/payment_success.json")}
            style={styles.lottieAnimation}
          />
        </View>

        <Text style={styles.successTitle}>Nạp Ruby thành công!</Text>
        <Text style={styles.successSubtitle}>
          Giao dịch đã được hệ thống ghi nhận và cộng vào ví của bạn.
        </Text>

        <View style={styles.successRubyHighlight}>
          <Image
            contentFit="contain"
            source={require("@/assets/images/ruby.png")}
            style={styles.successRubyIcon}
          />
          <Text style={styles.successRubyNumber}>+{transaction.rubyAmount}</Text>
          <Text style={styles.successRubyUnit}>Ruby</Text>
        </View>

        {rubyBalance !== null ? (
          <View style={styles.successWalletBalanceRow}>
            <Text style={styles.successWalletLabel}>Số dư ví hiện tại:</Text>
            <View style={styles.walletBalanceValue}>
              <Text style={styles.successWalletValue}>{rubyBalance}</Text>
              <Image
                contentFit="contain"
                source={require("@/assets/images/ruby.png")}
                style={styles.smallRubyIcon}
              />
            </View>
          </View>
        ) : null}

        <View style={styles.successDivider} />

        <View style={styles.details}>
          <DetailRow label="Số tiền thanh toán" value={formatVnd(transaction.amountVnd)} />
          <DetailRow label="Mã giao dịch" value={transaction.transactionCode} />
          <DetailRow label="Trạng thái" value="Thành công" />
        </View>

        {onClose ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.successDoneButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.successDoneButtonText}>Hoàn tất</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (isFailed) {
    return (
      <View style={[styles.transactionCard, styles.failedCard]}>
        <View style={styles.lottieAnimationWrapper}>
          <LottieView
            autoPlay
            loop={false}
            resizeMode="contain"
            source={require("@/assets/lottie/payment_failed.json")}
            style={styles.lottieAnimation}
          />
        </View>

        <Text style={styles.failedTitle}>
          {transaction.status === "EXPIRED" ? "Giao dịch đã hết hạn" : "Nạp Ruby thất bại"}
        </Text>
        <Text style={styles.failedSubtitle}>
          Giao dịch chưa được ghi nhận. Vui lòng tạo mã QR mới để thực hiện lại.
        </Text>

        <View style={styles.successDivider} />

        <View style={styles.details}>
          <DetailRow label="Số tiền" value={formatVnd(transaction.amountVnd)} />
          <DetailRow label="Mã giao dịch" value={transaction.transactionCode} />
          <DetailRow label="Trạng thái" value={statusLabel} />
        </View>

        {onClose ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [
              styles.failedActionButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.failedActionButtonText}>Đóng & Thử lại</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.transactionCard}>
      <Text style={styles.transactionTitle}>Quét mã QR để chuyển khoản</Text>
      <Image
        contentFit="contain"
        source={{ uri: transaction.qrCodeUrl }}
        style={styles.qrCode}
      />
      <View style={styles.transactionSummary}>
        <Text style={styles.transactionRuby}>
          Nhận {transaction.rubyAmount} Ruby
        </Text>
        <Text style={styles.transactionAmount}>
          {formatVnd(transaction.amountVnd)}
        </Text>
      </View>
      <View
        accessibilityLiveRegion="polite"
        style={[
          styles.statusBadge,
          styles.pendingStatus,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            styles.pendingStatusText,
          ]}
        >
          {statusLabel}
        </Text>
      </View>

      <View style={styles.statusCheckSection}>
        <View style={styles.autoCheckRow}>
          <View style={styles.autoCheckDot} />
          <Text style={styles.autoCheckText}>
            Hệ thống tự động kiểm tra giao dịch (VietQR 24/7)
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isCheckingStatus }}
          disabled={isCheckingStatus}
          onPress={onCheckStatus}
          style={({ pressed }) => [
            styles.checkStatusButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          {isCheckingStatus ? (
            <View style={styles.checkingRow}>
              <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
              <Text style={styles.checkStatusButtonText}>
                Đang kiểm tra giao dịch...
              </Text>
            </View>
          ) : (
            <Text style={styles.checkStatusButtonText}>
              Tôi đã chuyển khoản · Kiểm tra ngay
            </Text>
          )}
        </Pressable>
        {statusError ? (
          <Text accessibilityRole="alert" style={styles.statusErrorText}>
            {statusError}
          </Text>
        ) : null}
      </View>

      <View style={styles.details}>
        <DetailRow label="Ngân hàng" value={transaction.bankCode} />
        <DetailRow label="Số tài khoản" value={transaction.accountNumber} />
        <DetailRow label="Chủ tài khoản" value={transaction.accountName} />
        <DetailRow label="Nội dung chuyển khoản" value={transaction.transferContent} />
        <DetailRow label="Mã giao dịch" value={transaction.transactionCode} />
        <DetailRow label="Trạng thái" value={statusLabel} />
      </View>
      <Text style={styles.transferHint}>
        Vui lòng chuyển đúng số tiền và nội dung để hệ thống ghi nhận giao dịch.
      </Text>
    </View>
  );
}
