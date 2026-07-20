import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';

export default function PaymentSuccessScreen() {
    const router = useRouter();

    return (
        <ScreenContainer scrollable contentStyle={styles.container}>
            {/* Header Close Button */}
            <View style={styles.headerRow}>
                <Pressable
                    accessibilityRole="button"
                    onPress={() => router.replace('/(tabs)' as any)}
                    style={styles.closeButton}
                >
                    <Ionicons name="close" size={24} color={Design.colors.primaryGreen} />
                </Pressable>
            </View>

            {/* Illustration / Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/onboarding/luna-smile.jpg')}
                    style={styles.illustrationImage}
                    resizeMode="contain"
                />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>Thanh toán thành công</Text>
            <Text style={styles.subtitle}>
                Chúc mừng{'\n'}Bạn đã đăng ký thành công{'\n'}gói Premium
            </Text>

            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
                <Text style={styles.sectionTitle}>Bạn nhận được</Text>
                <View style={styles.benefitRow}>
                    <Ionicons name="checkmark" size={16} color={Design.colors.primaryGreen} />
                    <Text style={styles.benefitItem}>Nhận 100 Ruby mỗi tháng</Text>
                </View>
                <View style={styles.benefitRow}>
                    <Ionicons name="checkmark" size={16} color={Design.colors.primaryGreen} />
                    <Text style={styles.benefitItem}>Mở khóa tất cả phụ kiện</Text>
                </View>
                <View style={styles.benefitRow}>
                    <Ionicons name="checkmark" size={16} color={Design.colors.primaryGreen} />
                    <Text style={styles.benefitItem}>Thử thách độc quyền</Text>
                </View>
                <View style={styles.benefitRow}>
                    <Ionicons name="checkmark" size={16} color={Design.colors.primaryGreen} />
                    <Text style={styles.benefitItem}>Không quảng cáo</Text>
                </View>
                <View style={styles.benefitRow}>
                    <Ionicons name="checkmark" size={16} color={Design.colors.primaryGreen} />
                    <Text style={styles.benefitItem}>Hỗ trợ ưu tiên</Text>
                </View>
            </View>

            {/* Footer / Action */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Bắt đầu trải nghiệm"
                    onPress={() => router.replace('/(tabs)' as any)}
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
        marginBottom: 10,
    },
    closeButton: {
        padding: 4,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    illustrationImage: {
        width: 220,
        height: 180,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 22,
        color: Design.colors.black,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 13,
        color: Design.colors.mutedText,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    benefitsCard: {
        width: '100%',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#F0F7F2',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2EFE5',
        gap: 10,
    },
    sectionTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.black,
        marginBottom: 2,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    benefitItem: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 13,
        color: Design.colors.black,
    },
    footer: {
        gap: 12,
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
    },
    secureText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: Design.colors.mutedText,
    },
});