import { Design, FontFamily } from '@/src/constants/design';
import { shopService } from '@/src/services/shopService';
import type { InitTopupResponse } from '@/src/types/api/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const VND_PER_RUBY = 1000;
const MAX_RUBY_AMOUNT = Math.floor(Number.MAX_SAFE_INTEGER / VND_PER_RUBY);

function formatVnd(amount: number) {
  return `${amount.toLocaleString('vi-VN')} VND`;
}

export default function RubyTopupScreen() {
  const [rubyInput, setRubyInput] = useState('');
  const [transaction, setTransaction] = useState<InitTopupResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const isCheckingStatusRef = useRef(false);

  const rubyAmount = Number(rubyInput);
  const amountVnd = rubyAmount * VND_PER_RUBY;
  const isValidAmount =
    Number.isSafeInteger(rubyAmount) &&
    rubyAmount > 0 &&
    rubyAmount <= MAX_RUBY_AMOUNT;

  const handleRubyInputChange = (value: string) => {
    setRubyInput(value.replace(/\D/g, ''));
    setErrorMessage(null);
  };

  const handleCreateTopup = async () => {
    if (!isValidAmount || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setTransaction(null);
    try {
      const result = await shopService.initTopup({ amountVnd });
      setTransaction(result);
      setStatusError(null);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không thể khởi tạo giao dịch nạp Ruby.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkTransactionStatus = useCallback(async () => {
    const transactionCode = transaction?.transactionCode;
    if (
      !transactionCode ||
      transaction.status !== 'PENDING' ||
      isCheckingStatusRef.current
    ) {
      return;
    }

    isCheckingStatusRef.current = true;
    setIsCheckingStatus(true);
    try {
      const history = await shopService.getTopupHistory();
      const updatedTransaction = history.find(
        (item) => item.transactionCode === transactionCode,
      );

      if (!updatedTransaction) {
        setStatusError('Chưa tìm thấy giao dịch trong lịch sử. Hệ thống sẽ tiếp tục kiểm tra.');
        return;
      }

      setStatusError(null);
      if (updatedTransaction.status !== transaction.status) {
        setTransaction((current) =>
          current?.transactionCode === transactionCode
            ? {
                ...current,
                status: updatedTransaction.status,
              }
            : current,
        );
      }

      if (updatedTransaction.status === 'SUCCESS') {
        const wallet = await shopService.getMyWallet();
        setRubyBalance(wallet.rubyBalance);
      }
    } catch (error: unknown) {
      setStatusError(
        error instanceof Error
          ? error.message
          : 'Không thể kiểm tra trạng thái giao dịch.',
      );
    } finally {
      isCheckingStatusRef.current = false;
      setIsCheckingStatus(false);
    }
  }, [transaction]);

  useEffect(() => {
    if (!transaction || transaction.status !== 'PENDING') return;

    const initialCheck = setTimeout(() => {
      void checkTransactionStatus();
    }, 0);
    const interval = setInterval(() => {
      void checkTransactionStatus();
    }, 5000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [transaction, checkTransactionStatus]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              hitSlop={8}
              onPress={() => router.back()}
              style={styles.backButton}>
              <Ionicons color={Design.colors.black} name="chevron-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Nạp Ruby</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.rateCard}>
            <Text style={styles.rateText}>Tỷ lệ quy đổi</Text>
            <View style={styles.rateValueRow}>
              <Text style={styles.rateValue}>1</Text>
              <Image
                contentFit="contain"
                source={require('@/assets/images/ruby.png')}
                style={styles.rubyIcon}
              />
              <Text style={styles.rateValue}>= 1.000 VND</Text>
            </View>
          </View>

          <Text style={styles.inputLabel}>Số Ruby muốn nạp</Text>
          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel="Số Ruby muốn nạp"
              keyboardType="number-pad"
              onChangeText={handleRubyInputChange}
              placeholder="Nhập số Ruby"
              placeholderTextColor={Design.colors.mutedText}
              style={styles.input}
              value={rubyInput}
            />
            <Image
              contentFit="contain"
              source={require('@/assets/images/ruby.png')}
              style={styles.rubyIcon}
            />
          </View>

          <View style={styles.amountPreview}>
            <Text style={styles.amountLabel}>Số tiền cần chuyển</Text>
            <Text style={styles.amountValue}>
              {isValidAmount ? formatVnd(amountVnd) : '—'}
            </Text>
          </View>

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValidAmount || isSubmitting }}
            disabled={!isValidAmount || isSubmitting}
            onPress={() => void handleCreateTopup()}
            style={({ pressed }) => [
              styles.submitButton,
              (!isValidAmount || isSubmitting) && styles.disabledButton,
              pressed && isValidAmount && !isSubmitting && styles.pressedButton,
            ]}>
            {isSubmitting ? (
              <ActivityIndicator color={Design.colors.white} />
            ) : (
              <Text style={styles.submitLabel}>Tạo mã QR nạp tiền</Text>
            )}
          </Pressable>

          {transaction ? (
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
                  transaction.status === 'SUCCESS' ? styles.successStatus : styles.pendingStatus,
                ]}>
                <Text
                  style={[
                    styles.statusText,
                    transaction.status === 'SUCCESS' ? styles.successStatusText : styles.pendingStatusText,
                  ]}>
                  {transaction.status === 'SUCCESS'
                    ? 'Nạp Ruby thành công'
                    : `Trạng thái: ${transaction.status}`}
                </Text>
              </View>
              {transaction.status === 'SUCCESS' && rubyBalance !== null ? (
                <View style={styles.walletBalanceRow}>
                  <Text style={styles.detailLabel}>Số dư Ruby hiện tại</Text>
                  <View style={styles.walletBalanceValue}>
                    <Text style={styles.detailValue}>{rubyBalance}</Text>
                    <Image
                      contentFit="contain"
                      source={require('@/assets/images/ruby.png')}
                      style={styles.smallRubyIcon}
                    />
                  </View>
                </View>
              ) : null}
              {transaction.status === 'PENDING' ? (
                <View style={styles.statusCheckSection}>
                  <Text style={styles.statusHint}>
                    Đang tự động kiểm tra giao dịch sau khi ngân hàng xác nhận.
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isCheckingStatus }}
                    disabled={isCheckingStatus}
                    onPress={() => void checkTransactionStatus()}
                    style={styles.checkStatusButton}>
                    {isCheckingStatus ? (
                      <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
                    ) : (
                      <Text style={styles.checkStatusButtonText}>Tôi đã chuyển khoản · Kiểm tra ngay</Text>
                    )}
                  </Pressable>
                  {statusError ? (
                    <Text accessibilityRole="alert" style={styles.statusErrorText}>{statusError}</Text>
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
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text selectable style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Design.colors.white,
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  backButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
  },
  rateCard: {
    alignItems: 'center',
    backgroundColor: '#FFF4F6',
    borderColor: '#F3D3DA',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  rateText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginBottom: 6,
  },
  rateValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rateValue: {
    color: '#D9556D',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body + 2,
  },
  rubyIcon: {
    height: 22,
    width: 22,
  },
  inputLabel: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 2,
    marginBottom: 8,
  },
  inputWrap: {
    alignItems: 'center',
    borderColor: Design.colors.optionBorder,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  input: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.body,
    minHeight: 50,
  },
  amountPreview: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountLabel: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  amountValue: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  errorText: {
    color: '#B33A3A',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginBottom: 12,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 24,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pressedButton: {
    transform: [{ scale: 0.98 }],
  },
  submitLabel: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  transactionCard: {
    alignItems: 'center',
    backgroundColor: Design.colors.white,
    borderColor: '#E9E9E9',
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 24,
    padding: 16,
  },
  transactionTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCode: {
    height: 240,
    width: 240,
  },
  transactionSummary: {
    alignItems: 'center',
    marginVertical: 12,
  },
  transactionRuby: {
    color: '#D9556D',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  transactionAmount: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pendingStatus: {
    backgroundColor: '#FFF4E5',
  },
  successStatus: {
    backgroundColor: '#EAF4EE',
  },
  statusText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  pendingStatusText: {
    color: '#A15C00',
  },
  successStatusText: {
    color: Design.colors.primaryGreen,
  },
  walletBalanceRow: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  walletBalanceValue: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  smallRubyIcon: {
    height: 18,
    width: 18,
  },
  statusCheckSection: {
    alignItems: 'center',
    alignSelf: 'stretch',
    marginBottom: 10,
  },
  statusHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  checkStatusButton: {
    alignItems: 'center',
    borderColor: Design.colors.primaryGreen,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: 14,
  },
  checkStatusButtonText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
  },
  statusErrorText: {
    color: '#B33A3A',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginTop: 8,
    textAlign: 'center',
  },
  details: {
    alignSelf: 'stretch',
    borderTopColor: '#E9E9E9',
    borderTopWidth: 1,
    marginTop: 4,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 7,
  },
  detailLabel: {
    color: Design.colors.mutedText,
    flexShrink: 0,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
  },
  detailValue: {
    color: Design.colors.black,
    flexShrink: 1,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    textAlign: 'right',
  },
  transferHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
});
