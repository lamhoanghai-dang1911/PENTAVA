import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { useState } from 'react';

const PAYMENT_METHODS = [
    {
        id: 'momo',
        label: 'Momo',
        iconBg: '#A50064',
        iconText: 'Mo',
        isCustomText: true
    },
    {
        id: 'paypal',
        label: 'Paypal',
        iconName: 'logo-paypal',
        iconColor: '#003087'
    },
    {
        id: 'apple',
        label: 'Apple pay',
        iconName: 'logo-apple',
        iconColor: '#000000'
    },
    {
        id: 'google',
        label: 'Google pay',
        iconName: 'logo-google',
        iconColor: '#4285F4'
    },
];

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [selectedMethod, setSelectedMethod] = useState('momo');

    // Nhận dữ liệu gói từ trang Membership truyền sang (mặc định Gói Premium - 99.000đ)
    const packageName = (params.packageName as string) || 'Gói Premium';
    const packagePrice = (params.packagePrice as string) || '99.000vnd';
    const packageSubtitle = (params.packageSubtitle as string) || 'Nhận nhiều tính năng hữu ích mỗi ngày';

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

            {/* Banner Section matching Figma */}
            <View style={styles.bannerCard}>
                <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerPackageTitle}>{packageName}</Text>
                    <Text style={styles.bannerSubtitle}>{packageSubtitle}</Text>
                    <Text style={styles.bannerPriceText}>{packagePrice}/tháng</Text>
                </View>
                <Image
                    source={require('@/assets/images/onboarding/luna-smile.jpg')}
                    style={styles.bannerImage}
                    resizeMode="contain"
                />
            </View>

            {/* Payment Methods Section */}
            <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>
                {PAYMENT_METHODS.map((method) => {
                    const selected = method.id === selectedMethod;
                    return (
                        <Pressable
                            key={method.id}
                            accessibilityRole="button"
                            onPress={() => setSelectedMethod(method.id)}
                            style={[styles.methodItem, selected && styles.methodItemSelected]}
                        >
                            <View style={styles.methodLeft}>
                                <View style={styles.iconWrapper}>
                                    {method.isCustomText ? (
                                        <View style={[styles.customBrandIcon, { backgroundColor: method.iconBg }]}>
                                            <Text style={styles.customBrandText}>{method.iconText}</Text>
                                        </View>
                                    ) : (
                                        <Ionicons name={method.iconName as any} size={22} color={method.iconColor} />
                                    )}
                                </View>
                                <Text style={styles.methodLabel}>{method.label}</Text>
                            </View>

                            <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                                {selected && <View style={styles.radioInnerDot} />}
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Order Details Card */}
            <View style={styles.orderCard}>
                <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
                <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>{packageName}</Text>
                    <Text style={styles.orderValue}>{packagePrice}</Text>
                </View>
                <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Thời hạn</Text>
                    <Text style={styles.orderValue}>1 tháng</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                    <Text style={styles.totalValue}>{packagePrice}</Text>
                </View>
            </View>

            {/* Footer Secure Note & Action Button */}
            <View style={styles.footer}>
                <View style={styles.secureRow}>
                    <Ionicons name="lock-closed-outline" size={14} color={Design.colors.mutedText} />
                    <Text style={styles.secureText}>Giao dịch được mã hoá và bảo mật tuyệt đối</Text>
                </View>

                <PrimaryButton
                    label={`Thanh toán ${packagePrice}`}
                    onPress={() => router.push('/payment-success' as any)}
                    style={styles.actionButton}
                />
            </View>
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
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E2EFE5',
    },
    bannerTextContainer: {
        flex: 1,
        paddingRight: 8,
    },
    bannerPackageTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 16,
        color: Design.colors.black,
        marginBottom: 2,
    },
    bannerSubtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 10,
        color: Design.colors.mutedText,
        lineHeight: 14,
        marginBottom: 6,
    },
    bannerPriceText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.primaryGreen,
    },
    bannerImage: {
        width: 110,
        height: 100,
    },
    sectionContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 15,
        color: Design.colors.black,
        marginBottom: 12,
    },
    methodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        borderRadius: 16,
        backgroundColor: Design.colors.white,
        marginBottom: 10,
    },
    methodItemSelected: {
        borderColor: Design.colors.primaryGreen,
        backgroundColor: '#FCFCFC',
    },
    methodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconWrapper: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customBrandIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customBrandText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 11,
        color: '#FFFFFF',
    },
    methodLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.black,
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
    orderCard: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        backgroundColor: Design.colors.white,
        padding: 16,
        marginBottom: 16,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    orderLabel: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 13,
        color: Design.colors.mutedText,
    },
    orderValue: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 13,
        color: Design.colors.black,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    totalLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.black,
    },
    totalValue: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 15,
        color: Design.colors.primaryGreen,
    },
    footer: {
        gap: 12,
    },
    secureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    secureText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: Design.colors.mutedText,
    },
    actionButton: {
        width: '100%',
        borderRadius: 24,
    },
});