import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { useState } from 'react';

type PackageId = 'premium' | 'plus' | 'basic';

const PACKAGES: Array<{
    id: PackageId;
    title: string;
    subtitle: string;
    price: string;
    features: { text: string; enabled: boolean }[];
    crownBg: string;
}> = [
        {
            id: 'premium',
            title: 'Gói Premium',
            subtitle: 'Nhận nhiều tính năng hữu ích mỗi ngày',
            price: '99.000đ /tháng',
            features: [
                { text: 'Nhận 100 Ruby mỗi tháng', enabled: true },
                { text: 'Mở khóa tất cả phụ kiện', enabled: true },
                { text: 'Thử thách độc quyền', enabled: true },
                { text: 'Không quảng cáo', enabled: true },
                { text: 'Hỗ trợ ưu tiên', enabled: true },
            ],
            crownBg: '#FFF3CD',
        },
        {
            id: 'plus',
            title: 'Gói Plus',
            subtitle: 'Nhận nhiều tính năng hữu ích mỗi ngày',
            price: '59.000đ /tháng',
            features: [
                { text: 'Nhận 50 Ruby mỗi tháng', enabled: true },
                { text: 'Mở khóa một số phụ kiện', enabled: true },
                { text: 'Thử thách nâng cao', enabled: true },
                { text: 'Không quảng cáo', enabled: true },
                { text: 'Hỗ trợ ưu tiên', enabled: false },
            ],
            crownBg: '#E2E8F0',
        },
        {
            id: 'basic',
            title: 'Gói Basic',
            subtitle: 'Nhận nhiều tính năng hữu ích mỗi ngày',
            price: '19.000đ /tháng',
            features: [
                { text: 'Nhận 50 Ruby mỗi tháng', enabled: true },
                { text: 'Mở khóa một số phụ kiện', enabled: true },
                { text: 'Thử thách nâng cao', enabled: true },
                { text: 'Không quảng cáo', enabled: false },
                { text: 'Hỗ trợ ưu tiên', enabled: false },
            ],
            crownBg: '#FFE4D6',
        },
    ];

export default function MembershipScreen() {
    const router = useRouter();
    const [selectedId, setSelectedId] = useState<PackageId>('premium');

    const selectedPackage = PACKAGES.find((pkg) => pkg.id === selectedId) ?? PACKAGES[0];

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

            {/* Package List */}
            <View style={styles.packageList}>
                {PACKAGES.map((pkg) => {
                    const selected = pkg.id === selectedId;
                    return (
                        <Pressable
                            key={pkg.id}
                            accessibilityRole="button"
                            onPress={() => setSelectedId(pkg.id)}
                            style={({ pressed }) => [
                                styles.packageCard,
                                selected && styles.packageCardSelected,
                                pressed && styles.packageCardPressed,
                            ]}
                        >
                            {/* Selection Radio Circle at Top Right */}
                            <View style={styles.radioContainer}>
                                <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
                                    {selected && <View style={styles.radioInnerDot} />}
                                </View>
                            </View>

                            <View style={styles.packageContentRow}>
                                <View style={styles.packageLeftCol}>
                                    <View style={[styles.crownIconContainer, { backgroundColor: pkg.crownBg }]}>
                                        <Text style={styles.crownEmoji}>👑</Text>
                                    </View>
                                    <Text style={styles.packageTitle}>{pkg.title}</Text>
                                    <Text style={styles.packageSubtitle}>{pkg.subtitle}</Text>
                                    <Text style={styles.packagePrice}>{pkg.price}</Text>
                                </View>

                                <View style={styles.featuresBox}>
                                    {pkg.features.map((feature, index) => (
                                        <View key={index} style={styles.featureRow}>
                                            <Ionicons
                                                name={feature.enabled ? "checkmark" : "remove"}
                                                size={14}
                                                color={feature.enabled ? Design.colors.primaryGreen : Design.colors.mutedText}
                                                style={styles.featureIcon}
                                            />
                                            <Text
                                                style={[
                                                    styles.featureText,
                                                    !feature.enabled && styles.featureTextDisabled
                                                ]}
                                            >
                                                {feature.text}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </Pressable>
                    );
                })}
            </View>

            {/* Footer Notice & Action */}
            <View style={styles.footer}>
                <View style={styles.noticeBox}>
                    <Ionicons name="alert-circle" size={18} color={Design.colors.primaryGreen} />
                    <Text style={styles.noticeText}>Bạn có thể huỷ bất kỳ lúc nào</Text>
                </View>

                <PrimaryButton
                    label="Tiếp tục thanh toán"
                    onPress={() => {
                        router.push({
                            pathname: '/payment',
                            params: {
                                packageName: selectedPackage.title,
                                packagePrice: selectedPackage.price.replace(' /tháng', ''),
                                packageSubtitle: selectedPackage.subtitle,
                            }
                        } as any);
                    }}
                    style={styles.actionButton}
                />

                <View style={styles.secureRow}>
                    <Ionicons name="lock-closed-outline" size={14} color={Design.colors.mutedText} />
                    <Text style={styles.secureText}>Thanh toán an toàn & bảo mật</Text>
                </View>
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
        top: 16,
        right: 16,
        zIndex: 2,
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
        width: '42%',
        paddingRight: 8,
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
        fontSize: 16,
        color: Design.colors.black,
        marginBottom: 4,
    },
    packageSubtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: Design.colors.mutedText,
        lineHeight: 15,
        marginBottom: 10,
    },
    packagePrice: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.primaryGreen,
    },
    featuresBox: {
        width: '58%',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 10,
        gap: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    featureIcon: {
        width: 16,
        textAlign: 'center',
    },
    featureText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: Design.colors.black,
        flex: 1,
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