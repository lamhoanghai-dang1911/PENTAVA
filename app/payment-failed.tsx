import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';

export default function PaymentFailedScreen() {
    const router = useRouter();

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

            {/* Title & Illustration */}
            <Text style={styles.title}>Thanh toán thất bại</Text>
            <View style={styles.imageContainer}>
                <Image
                    source={require('@/assets/images/onboarding/luna-cry.jpg')}
                    style={styles.illustrationImage}
                    resizeMode="contain"
                />
            </View>

            {/* Message */}
            <Text style={styles.mainHeading}>Ôi, thanh toán{'\n'}chưa thành công!</Text>
            <Text style={styles.message}>Vui lòng kiểm tra lại phương thức{'\n'}thanh toán và thử lại.</Text>

            {/* Reasons Card */}
            <View style={styles.reasonsCard}>
                <Text style={styles.sectionTitle}>Có thể do</Text>
                <View style={styles.reasonRow}>
                    <Ionicons name="wifi-outline" size={16} color="#E05252" />
                    <Text style={styles.reasonItem}>Kết nối mạng không ổn định</Text>
                </View>
                <View style={styles.reasonRow}>
                    <Ionicons name="card-outline" size={16} color="#E05252" />
                    <Text style={styles.reasonItem}>Phương thức thanh toán bị từ chối</Text>
                </View>
                <View style={styles.reasonRow}>
                    <Ionicons name="time-outline" size={16} color="#E05252" />
                    <Text style={styles.reasonItem}>Phiên thanh toán hết hạn</Text>
                </View>
            </View>

            {/* Order Summary Card */}
            <View style={styles.orderCard}>
                <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
                <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Gói Premium</Text>
                    <Text style={styles.orderValue}>99.000vnd</Text>
                </View>
                <View style={styles.orderRow}>
                    <Text style={styles.orderLabel}>Trạng thái</Text>
                    <Text style={styles.orderStatusFailed}>Thất bại</Text>
                </View>
            </View>

            {/* Footer / Action */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Thử lại"
                    onPress={() => router.back()}
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
        marginBottom: 4,
    },
    closeButton: {
        padding: 4,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 22,
        color: Design.colors.black,
        textAlign: 'center',
        marginBottom: 4,
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 4,
    },
    illustrationImage: {
        width: 190,
        height: 160,
    },
    mainHeading: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        color: Design.colors.black,
        textAlign: 'center',
        marginBottom: 6,
    },
    message: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12,
        color: Design.colors.mutedText,
        textAlign: 'center',
        lineHeight: 16,
        marginBottom: 16,
    },
    reasonsCard: {
        width: '100%',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#FFF2F2',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FAD4D4',
        gap: 10,
    },
    sectionTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
        color: Design.colors.black,
        marginBottom: 2,
    },
    reasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    reasonItem: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 13,
        color: Design.colors.black,
    },
    orderCard: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        backgroundColor: Design.colors.white,
        padding: 16,
        marginBottom: 20,
        gap: 10,
    },
    orderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    orderStatusFailed: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 13,
        color: '#E05252',
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