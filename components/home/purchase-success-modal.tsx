import type { ShopProduct } from '@/components/home/shop-sheet';
import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type PurchaseSuccessModalProps = {
    product: ShopProduct | null;
    balance: number;
    onClose: () => void;
};

export function PurchaseSuccessModal({ product, balance, onClose }: PurchaseSuccessModalProps) {
    if (!product) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.checkWrap}>
                    <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={44} />
                </View>

                <Text style={styles.title}>Mua thành công!</Text>
                <Text style={styles.subtitle}>
                    Vật phẩm {product?.name ?? ''} đã được thêm vào túi của bạn. Cùng xem nó phù hợp thế
                    nào với bé mèo nhé!
                </Text>

                <View style={styles.balanceRow}>
                    <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
                    <Text style={styles.balanceValue}>{balance} 🍓</Text>
                </View>

                <Pressable
                    accessibilityRole="button"
                    onPress={onClose}
                    style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
                    <Text style={styles.closeLabel}>Đóng</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
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
    closeLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.white,
    },
});