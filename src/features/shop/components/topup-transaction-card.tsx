import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Design } from "@/src/constants/design";
import { formatVnd } from "../utils/shop-utils";
import { DetailRow } from "./detail-row";
import { styles } from "../shop.styles";
import type { TopupTransactionCardProps } from "../types/shop";

export function TopupTransactionCard({
  transaction,
  rubyBalance,
  isCheckingStatus,
  statusError,
  onCheckStatus,
}: TopupTransactionCardProps) {
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
          transaction.status === "SUCCESS" ? styles.successStatus : styles.pendingStatus,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            transaction.status === "SUCCESS"
              ? styles.successStatusText
              : styles.pendingStatusText,
          ]}
        >
          {transaction.status === "SUCCESS"
            ? "Nạp Ruby thành công"
            : `Trạng thái: ${transaction.status}`}
        </Text>
      </View>
      {transaction.status === "SUCCESS" && rubyBalance !== null ? (
        <View style={styles.walletBalanceRow}>
          <Text style={styles.detailLabel}>Số dư Ruby hiện tại</Text>
          <View style={styles.walletBalanceValue}>
            <Text style={styles.detailValue}>{rubyBalance}</Text>
            <Image
              contentFit="contain"
              source={require("@/assets/images/ruby.png")}
              style={styles.smallRubyIcon}
            />
          </View>
        </View>
      ) : null}
      {transaction.status === "PENDING" ? (
        <View style={styles.statusCheckSection}>
          <Text style={styles.statusHint}>
            Đang tự động kiểm tra giao dịch sau khi ngân hàng xác nhận.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isCheckingStatus }}
            disabled={isCheckingStatus}
            onPress={onCheckStatus}
            style={styles.checkStatusButton}
          >
            {isCheckingStatus ? (
              <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
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
      ) : null}
      <View style={styles.details}>
        <DetailRow label="Ngân hàng" value={transaction.bankCode} />
        <DetailRow label="Số tài khoản" value={transaction.accountNumber} />
        <DetailRow label="Chủ tài khoản" value={transaction.accountName} />
        <DetailRow label="Nội dung chuyển khoản" value={transaction.transferContent} />
        <DetailRow label="Mã giao dịch" value={transaction.transactionCode} />
        <DetailRow label="Trạng thái" value={transaction.status} />
      </View>
      <Text style={styles.transferHint}>
        Vui lòng chuyển đúng số tiền và nội dung để hệ thống ghi nhận giao dịch.
      </Text>
    </View>
  );
}
