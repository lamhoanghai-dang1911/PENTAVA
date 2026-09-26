import type { ShopItem } from '@/src/types/api/shop';
import { Design, FontFamily } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

type PurchaseSuccessModalProps = {
    product: ShopItem | null;
    balance: number;
    onClose: () => void;
};

export function PurchaseSuccessModal({ product, balance, onClose }: PurchaseSuccessModalProps) {
    if (!product) return null;

    return (
        <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
            <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.card}>
                <Animated.View entering={ZoomIn.springify().damping(10).delay(120)} style={styles.checkWrap}>
                    <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={44} />
                </Animated.View>

                <Text style={styles.title}>Mua thành công!</Text>
                <Text style={styles.subtitle}>
                    Vật phẩm {product?.name ?? ''} đã được thêm vào túi của bạn. Cùng xem nó phù hợp thế
                    nào với bé mèo nhé!
                </Text>

                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                    <View style={styles.balanceValueRow}>
                        <Text style={styles.balanceValue}>{balance}</Text>
                        <Image
                            contentFit="contain"
                            source={require('@/assets/images/ruby.png')}
                            style={styles.rubyIcon}
                        />
                    </View>
                </View>

                <Pressable
                    accessibilityRole="button"
                    onPress={onClose}
                    style={({ pressed }) => [
                        styles.closeButton,
                        pressed && { transform: [{ scale: 0.96 }] },
                        pressed && styles.closeButtonPressed,
                    ]}>
                    <Text style={styles.closeLabel}>Đóng</Text>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 36,
    },
    card: {
        width: '100%',
        backgroundColor: Design.colors.white,
        borderRadius: 20,
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 20,
        alignItems: 'center',
    },
    checkWrap: {
        marginBottom: 4,
    },
    warningWrap: {
        marginBottom: 4,
    },
    mascotEmoji: {
        fontSize: 52,
        marginBottom: 8,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
        marginBottom: 8,
    },
    subtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.mutedText,
        textAlign: 'center',
        lineHeight: 17,
        marginBottom: 16,
    },
    balanceRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        marginBottom: 16,
    },
    balanceLabel: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.mutedText,
    },
    balanceValue: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
    },
    balanceValueRow: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
    },
    rubyIcon: {
        height: 18,
        width: 18,
    },
    closeButton: {
        width: '100%',
        height: 44,
        borderRadius: 22,
        backgroundColor: Design.colors.primaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonPressed: {
        opacity: 0.8,
    },
    warningButton: {
        backgroundColor: '#C62828',
    },
    topUpButton: {
        backgroundColor: Design.colors.primaryGreen,
        marginBottom: 10,
    },
    closeLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.white,
    },
});

type InsufficientRubyModalProps = {
    visible: boolean;
    product: ShopItem | null;
    balance: number | null;
    message: string;
    onClose: () => void;
    onTopUp: () => void;
};

export function InsufficientRubyModal({
    visible,
    product,
    balance,
    message,
    onClose,
    onTopUp,
}: InsufficientRubyModalProps) {
    if (!visible || !product) return null;

    return (
        <Animated.View entering={FadeIn.duration(180)} style={styles.overlay}>
            <Animated.View entering={ZoomIn.springify().damping(15)} style={styles.card}>
                <Animated.View entering={ZoomIn.springify().damping(10).delay(120)} style={styles.warningWrap}>
                    <Ionicons color="#C62828" name="close-circle" size={44} />
                </Animated.View>
                <Text style={styles.title}>Không đủ Ruby</Text>
                <Text style={styles.subtitle}>
                    {message || `Bạn chưa đủ Ruby để mua ${product.name}.`}
                </Text>
                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                    <View style={styles.balanceValueRow}>
                        <Text style={styles.balanceValue}>{balance ?? '—'}</Text>
                        <Image
                            contentFit="contain"
                            source={require('@/assets/images/ruby.png')}
                            style={styles.rubyIcon}
                        />
                    </View>
                </View>
                <Pressable
                    accessibilityRole="button"
                    onPress={onTopUp}
                    style={({ pressed }) => [
                        styles.closeButton,
                        styles.topUpButton,
                        pressed && { transform: [{ scale: 0.96 }] },
                    ]}>
                    <Text style={styles.closeLabel}>Nạp Ruby</Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    onPress={onClose}
                    style={({ pressed }) => [
                        styles.closeButton,
                        styles.warningButton,
                        pressed && { transform: [{ scale: 0.96 }] },
                    ]}>
                    <Text style={styles.closeLabel}>Đã hiểu</Text>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}