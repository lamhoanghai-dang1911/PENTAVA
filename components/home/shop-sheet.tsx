import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PurchaseSuccessModal } from '@/components/home/purchase-success-modal';


export type ShopProduct = {
    id: string;
    name: string;
    icon: string; // emoji tạm — thay bằng PNG export từ Figma sau
    price: number;
};

// TODO: danh sách vật phẩm nên lấy từ server
const PRODUCTS: ShopProduct[] = [
    { id: 'streak-shield', name: 'Bảo vệ chuỗi', icon: '🛡️', price: 15 },
    { id: 'glasses', name: 'Mắt kính', icon: '🕶️', price: 20 },
    { id: 'yellow-cap', name: 'Nón vàng', icon: '🧢', price: 11 },
    { id: 'necklace', name: 'Dây chuyền', icon: '📿', price: 12 },
];

type ShopSheetProps = {
    visible: boolean;
    balance: number;
    onClose: () => void;
    onBuy: (product: ShopProduct) => void;
    purchasedProduct: ShopProduct | null;
    onCloseSuccess: () => void;
};

export function ShopSheet({ visible, balance, onClose, onBuy, purchasedProduct, onCloseSuccess }: ShopSheetProps) {
    return (
        <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
            {/* Nhấn vùng tối phía trên để đóng — sheet chỉ chiếm ~3/4 màn hình */}
            <View style={styles.overlay}>
                <Pressable onPress={onClose} style={styles.backdrop} />

                <View style={styles.sheet}>
                    <View style={styles.grabber} />

                    <View style={styles.header}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Đóng cửa hàng"
                            hitSlop={8}
                            onPress={onClose}>
                            <Ionicons color={Design.colors.black} name="chevron-back" size={22} />
                        </Pressable>
                        <Text style={styles.title}>Cửa hàng vật phẩm</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    <View style={styles.balanceChip}>
                        <Text style={styles.balanceText}>🍓 {balance}</Text>
                    </View>

                    <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>

                    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                        {PRODUCTS.map((product) => {
                            const affordable = product.price <= balance;
                            return (
                                <View key={product.id} style={styles.productCard}>
                                    <View style={styles.productBadge}>
                                        <Text style={styles.productBadgeText}>Nổi bật</Text>
                                    </View>
                                    <Text style={styles.productIcon}>{product.icon}</Text>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <View style={styles.productBottomRow}>
                                        <Text style={styles.productPrice}>{product.price} 🍓</Text>
                                        <Pressable
                                            accessibilityRole="button"
                                            onPress={() => onBuy(product)}
                                            style={[styles.buyButton, !affordable && styles.buyButtonDisabled]}>
                                            <Text style={styles.buyButtonText}>Mua ngay</Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>
                <PurchaseSuccessModal
                    balance={balance}
                    onClose={onCloseSuccess}
                    product={purchasedProduct}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheet: {
        height: '75%',
        backgroundColor: Design.colors.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 22,
        paddingTop: 10,
    },
    grabber: {
        alignSelf: 'center',
        width: 42,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#DDDDDD',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
    },
    balanceChip: {
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 14,
    },
    balanceText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
    },
    sectionTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        color: Design.colors.black,
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingBottom: 30,
    },
    productCard: {
        width: '47.5%',
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 12,
        marginBottom: 14,
        backgroundColor: Design.colors.white,
    },
    productBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EAF4EE',
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginBottom: 8,
    },
    productBadgeText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption - 1,
        color: Design.colors.primaryGreen,
    },
    productIcon: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 8,
    },
    productName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        marginBottom: 8,
    },
    productBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    productPrice: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.black,
    },
    buyButton: {
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 8,
        paddingHorizontal: 9,
        paddingVertical: 5,
    },
    buyButtonDisabled: {
        opacity: 0.45,
    },
    buyButtonText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
        color: Design.colors.white,
    },
});