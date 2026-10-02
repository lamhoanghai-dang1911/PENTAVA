import { Design, FontFamily } from '@/src/constants/design';
import { shopService } from '@/src/services/shopService';
import type {
  InitTopupRequest,
  InitTopupResponse,
  TopupPackagesResponse,
} from '@/src/types/api/shop';
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

function formatVnd(amount: number) {
  return `${amount.toLocaleString('vi-VN')} VNĐ`;
}

export default function RubyTopupScreen() {
  const [topupPricing, setTopupPricing] = useState<TopupPackagesResponse | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [pricingRetryCount, setPricingRetryCount] = useState(0);
  const [rubyInput, setRubyInput] = useState('');
  const [transaction, setTransaction] = useState<InitTopupResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPackageCode, setSubmittingPackageCode] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const isCheckingStatusRef = useRef(false);

  const rubyAmount = Number(rubyInput);
  const amountVnd = rubyAmount * (topupPricing?.baseRateVndPerRuby ?? 0);
  const maxRubyAmount = topupPricing
    ? Math.floor(Number.MAX_SAFE_INTEGER / topupPricing.baseRateVndPerRuby)
    : 0;
  const isValidAmount =
    topupPricing !== null &&
    Number.isSafeInteger(rubyAmount) &&
    rubyAmount >= topupPricing.minCustomTopupRuby &&
    rubyAmount <= maxRubyAmount;

  const handleRubyInputChange = (value: string) => {
    setRubyInput(value.replace(/\D/g, ''));
    setErrorMessage(null);
  };

  useEffect(() => {
    let isMounted = true;

    void shopService.getTopupPackages()
      .then((pricing) => {
        if (isMounted) setTopupPricing(pricing);
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setPricingError(
            error instanceof Error ? error.message : 'Không thể tải bảng giá nạp Ruby.',
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingPricing(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pricingRetryCount]);

  const retryLoadingPricing = () => {
    setIsLoadingPricing(true);
    setPricingError(null);
    setPricingRetryCount((count) => count + 1);
  };

  const handleCreateTopup = async (request: InitTopupRequest) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmittingPackageCode(request.packageCode ?? null);
    setErrorMessage(null);
    setTransaction(null);
    try {
      const result = await shopService.initTopup(request);
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
      setSubmittingPackageCode(null);
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
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              }}
              style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
              <Ionicons color="#0F172A" name="chevron-back" size={24} />
            </Pressable>
            <Text style={styles.title}>Nạp Ruby ✨</Text>
            <View style={styles.headerSpacer} />
          </View>

          <View style={styles.rateCard}>
            <Text style={styles.rateText}>Tỷ lệ quy đổi</Text>
            {isLoadingPricing ? (
              <ActivityIndicator color="#E11D48" />
            ) : topupPricing ? (
              <>
                <View style={styles.rateValueRow}>
                  <Text style={styles.rateValue}>1</Text>
                  <Image
                    contentFit="contain"
                    source={require('@/assets/images/ruby.png')}
                    style={styles.rubyIcon}
                  />
                  <Text style={styles.rateValue}>
                    = {formatVnd(topupPricing.baseRateVndPerRuby)}
                  </Text>
                </View>
                <Text style={styles.rateHint}>{topupPricing.customTopupRule}</Text>
              </>
            ) : (
              <View style={styles.pricingError}>
                <Text accessibilityRole="alert" style={styles.errorText}>
                  {pricingError}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retryLoadingPricing}
                  style={styles.retryButton}>
                  <Text style={styles.retryButtonText}>Thử tải lại</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Bảng giá các gói Ruby</Text>
            {isLoadingPricing ? (
              <ActivityIndicator color={Design.colors.primaryGreen} style={styles.packagesLoading} />
            ) : topupPricing ? (
              topupPricing.packages.map((pack) => (
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
                      onPress={() => void handleCreateTopup({
                        packageCode: pack.code,
                        rubyAmount: pack.rubyAmount,
                        amountVnd: pack.priceVnd,
                      })}
                      style={({ pressed }) => [
                        styles.packageBuyButton,
                        isSubmitting && styles.disabledButton,
                        pressed && !isSubmitting && styles.pressedButton,
                      ]}>
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

          <Text style={styles.inputLabel}>Số Ruby muốn nạp</Text>
          <View style={styles.inputWrap}>
            <TextInput
              accessibilityLabel="Số Ruby muốn nạp"
              editable={topupPricing !== null}
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
          {topupPricing ? (
            <Text style={styles.minimumHint}>
              Nạp lẻ tối thiểu {topupPricing.minCustomTopupRuby} Ruby
              {' '}({formatVnd(topupPricing.minCustomTopupVnd)}).
            </Text>
          ) : null}

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: !isValidAmount || isSubmitting }}
            disabled={!isValidAmount || isSubmitting}
            onPress={() => void handleCreateTopup({ amountVnd })}
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
    backgroundColor: '#F8FAF7',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 20,
  },
  rateCard: {
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderRadius: 18,
    borderWidth: 1.5,
    marginBottom: 24,
    padding: 18,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  rateText: {
    color: '#9F1239',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    marginBottom: 6,
  },
  rateValueRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  rateValue: {
    color: '#E11D48',
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.body + 2,
  },
  rateHint: {
    color: '#9F1239',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginTop: 6,
    textAlign: 'center',
  },
  rubyIcon: {
    height: 26,
    width: 26,
  },
  pricingError: {
    alignItems: 'center',
  },
  retryButton: {
    borderColor: '#E11D48',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  retryButtonText: {
    color: '#BE123C',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
  },
  packagesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    marginBottom: 12,
  },
  packagesLoading: {
    paddingVertical: 20,
  },
  packageCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 14,
  },
  packageInfo: {
    flex: 1,
    paddingRight: 8,
  },
  packageNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  packageName: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  packageTag: {
    borderRadius: 8,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 10,
    overflow: 'hidden',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  popularTag: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  bestValueTag: {
    backgroundColor: '#D1FAE5',
    color: '#047857',
  },
  packageRuby: {
    color: '#475569',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    marginTop: 4,
  },
  packageBonus: {
    color: '#059669',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    marginTop: 2,
  },
  packagePrice: {
    alignItems: 'flex-end',
  },
  packageBuyButton: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 34,
    minWidth: 76,
    paddingHorizontal: 14,
  },
  packageBuyLabel: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  packageCurrentPrice: {
    color: '#BE123C',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  packageOriginalPrice: {
    color: '#94A3B8',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption - 1,
    textDecorationLine: 'line-through',
  },
  packageDiscount: {
    color: '#059669',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 10,
    marginTop: 2,
  },
  packageLoadHint: {
    color: '#64748B',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
  },
  inputLabel: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 2,
    marginBottom: 8,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1FAE5',
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    color: '#0F172A',
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
    color: '#64748B',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  amountValue: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  minimumHint: {
    color: '#64748B',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginBottom: 14,
    marginTop: -10,
  },
  errorText: {
    color: '#E11D48',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginBottom: 12,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 18,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 3,
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
