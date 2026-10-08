import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { SubscriptionQrModal } from '@/src/features/subscription/components/subscription-qr-modal';
import { useSubscription } from '@/src/features/subscription/hooks/use-subscription';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

function formatVnd(amount: number): string {
    return `${amount.toLocaleString('vi-VN')}đ`;
}

function getPlanVisuals(code: string) {
    const upper = code.toUpperCase();
    if (upper === 'PREMIUM') {
        return { crownBg: '#FFF3CD', crownEmoji: '👑' };
    }
    if (upper === 'GOLD') {
        return { crownBg: '#FFE4D6', crownEmoji: '⭐' };
    }
    return { crownBg: '#E2E8F0', crownEmoji: '🌱' };
}

function formatDate(dateStr?: string | null): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN');
    } catch {
        return dateStr;
    }
}

export default function MembershipScreen() {
    const router = useRouter();
    const {
        plans,
        selectedPlanCode,
        selectedPlan,
        mySubscription,
        isLoading,
        isPurchasing,
        isCheckingStatus,
        isMockConfirming,
        activeTransaction,
        errorModal,
        notificationModal,
        statusMessage,
        setSelectedPlanCode,
        initPurchase,
        checkStatus,
        mockConfirm,
        closeQrModal,
        closeErrorModal,
        closeNotificationModal,
    } = useSubscription();

    return (
        <ScreenContainer scrollable contentStyle={styles.container}>
            {/* Header Close Button */}
            <View style={styles.headerRow}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.back()}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={24} color={Design.colors.primaryGreen} />
                </Pressable>
            </View>

            {/* Banner Section */}
            <View style={styles.bannerCard}>
                <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerTitle}>
                        Trở thành hội viên nhận nhiều đặc quyền siêu hấp dẫn!
                    </Text>
                </View>
                <Image
                    source={require('@/assets/images/onboarding/luna-smile.jpg')}
                    style={styles.bannerImage}
                    resizeMode="contain"
                />
            </View>

            {/* Current Active Subscription Banner (if any) */}
            {mySubscription?.hasActiveSubscription ? (
                <View style={styles.activeSubCard}>
                    <View style={styles.activeSubHeader}>
                        <View style={styles.activeSubTitleRow}>
                            <Ionicons name="sparkles" size={18} color="#D97706" />
                            <Text style={styles.activeSubTitle}>Gói cước đang kích hoạt</Text>
                        </View>
                        {mySubscription.badge ? (
                            <View style={styles.badgePill}>
                                <Text style={styles.badgeText}>{mySubscription.badge}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={styles.activeSubPlanName}>{mySubscription.planName}</Text>
                    <Text style={styles.activeSubMetaText}>
                        Còn lại {mySubscription.daysRemaining} ngày
                        {mySubscription.endDate ? ` (hạn đến ${formatDate(mySubscription.endDate)})` : ''}
                    </Text>
                </View>
            ) : null}

            {/* Package List */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Design.colors.primaryGreen} />
                    <Text style={styles.loadingText}>Đang tải các gói cước...</Text>
                </View>
            ) : (
                <View style={styles.packageList}>
                    {plans.map((pkg) => {
                        const selected = pkg.code.toUpperCase() === selectedPlanCode?.toUpperCase();
                        const isCurrentActivePlan =
                            mySubscription?.hasActiveSubscription &&
                            mySubscription.planCode?.toUpperCase() === pkg.code.toUpperCase();
                        const visuals = getPlanVisuals(pkg.code);

                        return (
                            <Pressable
                                key={pkg.code}
                                accessibilityRole="button"
                                onPress={() => setSelectedPlanCode(pkg.code)}
                                style={({ pressed }) => [
                                    styles.packageCard,
                                    selected && styles.packageCardSelected,
                                    pressed && styles.packageCardPressed,
                                ]}
                            >
                                {/* Selection Radio Circle at Top Right */}
                                <View style={styles.radioContainer}>
                                    <View
                                        style={[
                                            styles.radioCircle,
                                            selected && styles.radioCircleSelected,
                                        ]}
                                    >
                                        {selected && <View style={styles.radioInnerDot} />}
                                    </View>
                                </View>

                                <View style={styles.packageContentRow}>
                                    <View style={styles.packageLeftCol}>
                                        <View
                                            style={[
                                                styles.crownIconContainer,
                                                { backgroundColor: visuals.crownBg },
                                            ]}
                                        >
                                            <Text style={styles.crownEmoji}>{visuals.crownEmoji}</Text>
                                        </View>
                                        <View style={styles.packageTitleRow}>
                                            <Text style={styles.packageTitle}>{pkg.name}</Text>
                                            {pkg.badge ? (
                                                <View style={styles.badgePill}>
                                                    <Text style={styles.badgeText}>{pkg.badge}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <Text style={styles.packagePrice}>
                                            {formatVnd(pkg.priceVnd)}
                                            <Text style={styles.packageDuration}>
                                                {' '}
                                                /{pkg.durationDays} ngày
                                            </Text>
                                        </Text>
                                        {isCurrentActivePlan ? (
                                            <View style={styles.activeTag}>
                                                <Text style={styles.activeTagText}>Đang sử dụng</Text>
                                            </View>
                                        ) : null}
                                    </View>

                                    <View style={styles.featuresBox}>
                                        {pkg.features.map((feature) => (
                                            <View
                                                key={feature.featureId || feature.featureCode}
                                                style={styles.featureRow}
                                            >
                                                <Text
                                                    style={[
                                                        styles.featureText,
                                                        !feature.isEnabled && styles.featureTextDisabled,
                                                    ]}
                                                >
                                                    {feature.displayLabel || feature.name}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {/* Footer Notice & Action */}
            <View style={styles.footer}>
                {/* <View style={styles.noticeBox}>
                    <Ionicons name="alert-circle" size={18} color={Design.colors.primaryGreen} />
                    <Text style={styles.noticeText}>Hỗ trợ kích hoạt tự động qua VietQR SePay</Text>
                </View> */}

                <PrimaryButton
                    label={
                        isPurchasing
                            ? 'Đang khởi tạo...'
                            : selectedPlan
                                ? `ĐĂNG KÝ GÓI`
                                : 'Tiếp tục thanh toán'
                    }
                    loading={isPurchasing}
                    onPress={() => void initPurchase()}
                    style={styles.actionButton}
                />

                {/* <View style={styles.secureRow}>
                    <Ionicons name="lock-closed-outline" size={14} color={Design.colors.mutedText} />
                    <Text style={styles.secureText}>Thanh toán an toàn & bảo mật</Text>
                </View> */}
            </View>

            {/* VietQR SePay Modal */}
            <SubscriptionQrModal
                visible={activeTransaction !== null}
                transaction={activeTransaction}
                onClose={closeQrModal}
                onCheckStatus={checkStatus}
                isCheckingStatus={isCheckingStatus}
                onMockConfirm={mockConfirm}
                isMockConfirming={isMockConfirming}
                statusMessage={statusMessage}
            />

            {/* Error Notification Modal */}
            <NotificationModal
                visible={errorModal.visible}
                title={errorModal.title}
                message={errorModal.message}
                onConfirm={closeErrorModal}
            />

            {/* Success Notification Modal */}
            <NotificationModal
                visible={notificationModal.visible}
                title={notificationModal.title}
                message={notificationModal.message}
                onConfirm={closeNotificationModal}
            />
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 36,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    closeButton: {
        padding: 4,
    },
    bannerCard: {
        backgroundColor: '#F0F7F2',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2EFE5',
    },
    bannerTextContainer: {
        flex: 1,
        paddingRight: 8,
    },
    bannerTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 15,
        color: Design.colors.black,
        lineHeight: 22,
    },
    bannerImage: {
        width: 110,
        height: 100,
    },
    activeSubCard: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FDE68A',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
    },
    activeSubHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    activeSubTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeSubTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 13,
        color: '#92400E',
    },
    activeSubPlanName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 16,
        color: Design.colors.black,
        marginVertical: 2,
    },
    activeSubMetaText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: '#78350F',
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 13,
        color: Design.colors.mutedText,
    },
    packageList: {
        gap: 14,
    },
    packageCard: {
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        borderRadius: 20,
        padding: 16,
        backgroundColor: Design.colors.white,
        position: 'relative',
    },
    packageCardPressed: {
        opacity: 0.95,
    },
    packageCardSelected: {
        borderColor: Design.colors.primaryGreen,
        backgroundColor: '#FCFCFC',
    },
    radioContainer: {
        position: 'absolute',
        top: 14,
        right: 14,
        zIndex: 2,
    },
    badgePill: {
        backgroundColor: '#DCFCE7',
        borderColor: '#86EFAC',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 1,
        alignSelf: 'center',
    },
    badgeText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 10,
        color: '#166534',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: Design.colors.mutedText,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Design.colors.white,
    },
    radioCircleSelected: {
        borderColor: Design.colors.primaryGreen,
    },
    radioInnerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Design.colors.primaryGreen,
    },
    packageContentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    packageLeftCol: {
        width: '45%',
        paddingRight: 6,
    },
    packageTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 6,
    },
    crownIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    crownEmoji: {
        fontSize: 22,
    },
    packageTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 15,
        color: Design.colors.black,
    },
    packagePrice: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.primaryGreen,
    },
    packageDuration: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: Design.colors.mutedText,
    },
    activeTag: {
        alignSelf: 'flex-start',
        backgroundColor: '#E0F2FE',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginTop: 6,
    },
    activeTagText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 10,
        color: '#0369A1',
    },
    featuresBox: {
        width: '55%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 10,
        paddingRight: 20,
        gap: 7,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: Design.colors.black,
        flex: 1,
        lineHeight: 16,
    },
    featureTextDisabled: {
        color: Design.colors.mutedText,
    },
    footer: {
        marginTop: 20,
        gap: 12,
    },
    noticeBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F7F2',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 14,
        gap: 10,
    },
    noticeText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 13,
        color: Design.colors.black,
    },
    actionButton: {
        width: '100%',
        borderRadius: 24,
    },
    secureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 4,
    },
    secureText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: Design.colors.mutedText,
    },
});