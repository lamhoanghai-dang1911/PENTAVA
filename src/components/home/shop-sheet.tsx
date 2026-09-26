import { Design, FontFamily } from '@/src/constants/design';
import { shopService, ShopServiceError } from '@/src/services/shopService';
import type { ShopItem } from '@/src/types/api/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type ShopSheetProps = {
    visible: boolean;
    balance: number | null;
    onBalanceChange: (balance: number) => void;
    onPurchaseSuccess: (item: ShopItem, remainingRuby: number) => void;
    onInsufficientRuby: (item: ShopItem, message: string) => void;
    onClose: () => void;
};

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function ShopSheet({
    visible,
    balance,
    onBalanceChange,
    onPurchaseSuccess,
    onInsufficientRuby,
    onClose,
}: ShopSheetProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [itemsError, setItemsError] = useState<string | null>(null);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [hasLoadedItems, setHasLoadedItems] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);
    const isLoadingItems = visible && !hasLoadedItems && itemsError === null;
    const isLoadingWallet = visible && balance === null && walletError === null;
    const retryLoading = () => {
        setItemsError(null);
        setWalletError(null);
        setHasLoadedItems(false);
        setRetryCount((count) => count + 1);
    };
    const handleBuy = async (item: ShopItem) => {
        if (item.owned || purchasingItemId !== null) return;

        setPurchasingItemId(item.id);
        try {
            const purchase = await shopService.buyItem(item.skinItemId);
            if (!purchase.success) {
                throw new Error(purchase.message || 'Không thể mua skin.');
            }

            onBalanceChange(purchase.remainingRuby);
            setItems((currentItems) =>
                currentItems.map((currentItem) =>
                    currentItem.id === item.id ? { ...currentItem, owned: true } : currentItem,
                ),
            );
            onPurchaseSuccess(item, purchase.remainingRuby);
        } catch (error: unknown) {
            const message = getErrorMessage(error, 'Không thể mua skin.');
            const isInsufficientRuby =
                /không đủ|insufficient|not enough/i.test(message) ||
                (error instanceof ShopServiceError && error.status === 402);

            if (isInsufficientRuby) {
                onInsufficientRuby(item, message);
            } else {
                Alert.alert('Không thể mua vật phẩm', message);
            }
        } finally {
            setPurchasingItemId(null);
        }
    };

    useEffect(() => {
        if (!visible) return;

        let isMounted = true;

        void shopService.getItems()
            .then((catalog) => {
                if (isMounted) {
                    setItems(catalog);
                    setItemsError(null);
                }
            })
            .catch((error: unknown) => {
                if (isMounted) setItemsError(getErrorMessage(error, 'Không thể tải danh sách skin.'));
            })
            .finally(() => {
                if (isMounted) setHasLoadedItems(true);
            });

        void shopService.getMyWallet()
            .then((wallet) => {
                if (isMounted) {
                    onBalanceChange(wallet.rubyBalance);
                    setWalletError(null);
                }
            })
            .catch((error: unknown) => {
                if (isMounted) setWalletError(getErrorMessage(error, 'Không thể tải số dư Ruby.'));
            })
            ;

        return () => {
            isMounted = false;
        };
    }, [visible, retryCount, onBalanceChange]);

    return (
        <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
            <View style={styles.overlay}>
                <Pressable accessibilityLabel="Đóng cửa hàng" onPress={onClose} style={styles.backdrop} />

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
                        <View style={styles.headerSpacer} />
                    </View>

                    <View style={styles.balanceChip}>
                        <Image
                            contentFit="contain"
                            source={require('@/assets/images/ruby.png')}
                            style={styles.rubyImage}
                        />
                        <Text style={styles.balanceText}>
                            {isLoadingWallet && balance === null ? 'Đang tải Ruby...' : `${balance ?? '—'}`}
                        </Text>
                    </View>
                    {walletError ? (
                        <View style={styles.walletErrorRow}>
                            <Text accessibilityRole="alert" style={styles.errorText}>{walletError}</Text>
                            <Pressable accessibilityRole="button" onPress={retryLoading} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Thử lại</Text>
                            </Pressable>
                        </View>
                    ) : null}

                    <Text style={styles.sectionTitle}>Skin cửa hàng</Text>
                    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
                        {isLoadingItems ? (
                            <ActivityIndicator color={Design.colors.primaryGreen} size="large" style={styles.loading} />
                        ) : itemsError ? (
                            <View style={styles.emptyState}>
                                <Text accessibilityRole="alert" style={styles.errorText}>{itemsError}</Text>
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={retryLoading}
                                    style={styles.retryButton}>
                                    <Text style={styles.retryButtonText}>Thử lại</Text>
                                </Pressable>
                            </View>
                        ) : items.length === 0 ? (
                            <Text style={styles.emptyText}>Chưa có skin nào trong cửa hàng.</Text>
                        ) : items.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                entering={FadeInDown.delay(index * 60).springify().damping(14)}
                                style={styles.productCard}>
                                <View style={[
                                    styles.productBadge,
                                    item.owned ? styles.ownedBadge : styles.notOwnedBadge,
                                ]}>
                                    <Text style={[
                                        styles.productBadgeText,
                                        item.owned ? styles.ownedBadgeText : styles.notOwnedBadgeText,
                                    ]}>
                                        {item.owned ? 'Đã sở hữu' : 'Chưa sở hữu'}
                                    </Text>
                                </View>
                                <Image
                                    contentFit="contain"
                                    source={{ uri: item.imageUrl }}
                                    style={styles.productImage}
                                />
                                <Text numberOfLines={2} style={styles.productName}>{item.name}</Text>
                                <Text numberOfLines={2} style={styles.productDescription}>{item.description}</Text>
                                <View style={styles.productBottomRow}>
                                    <View style={styles.productPriceWrap}>
                                        <Text style={styles.productPrice}>{item.priceRuby}</Text>
                                        <Image
                                            contentFit="contain"
                                            source={require('@/assets/images/ruby.png')}
                                            style={styles.productRubyIcon}
                                        />
                                    </View>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityState={{
                                            disabled: item.owned || purchasingItemId !== null,
                                        }}
                                        disabled={item.owned || purchasingItemId !== null}
                                        onPress={() => void handleBuy(item)}
                                        style={({ pressed }) => [
                                            styles.buyButton,
                                            item.owned && styles.buyButtonOwned,
                                            purchasingItemId !== null && styles.buyButtonDisabled,
                                            pressed && purchasingItemId === null && !item.owned && styles.buyButtonPressed,
                                        ]}>
                                        {purchasingItemId === item.id ? (
                                            <ActivityIndicator color={Design.colors.white} size="small" />
                                        ) : (
                                            <Text style={[
                                                styles.buyButtonText,
                                                item.owned && styles.buyButtonOwnedText,
                                            ]}>
                                                {item.owned ? 'Đã sở hữu' : 'Mua'}
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </Animated.View>
                        ))}
                    </ScrollView>
                </View>
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
    headerSpacer: {
        width: 22,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
    },
    balanceChip: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
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
        color: '#D9556D',
    },
    rubyImage: {
        height: 20,
        width: 20,
    },
    errorText: {
        color: '#B33A3A',
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        marginBottom: 8,
        textAlign: 'center',
    },
    walletErrorRow: {
        alignItems: 'center',
        marginBottom: 8,
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
    loading: {
        paddingVertical: 40,
        width: '100%',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 28,
        width: '100%',
    },
    emptyText: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        paddingVertical: 28,
        textAlign: 'center',
        width: '100%',
    },
    retryButton: {
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 8,
        marginTop: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    retryButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
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
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2,
        marginBottom: 8,
    },
    productBadgeText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption - 1,
    },
    ownedBadge: {
        backgroundColor: '#EAF4EE',
    },
    ownedBadgeText: {
        color: Design.colors.primaryGreen,
    },
    notOwnedBadge: {
        backgroundColor: '#FCE8E8',
    },
    notOwnedBadgeText: {
        color: '#C62828',
    },
    productImage: {
        alignSelf: 'center',
        height: 96,
        marginBottom: 8,
        width: '100%',
    },
    productName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        marginBottom: 4,
        minHeight: 36,
    },
    productDescription: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption - 1,
        marginBottom: 8,
        minHeight: 30,
    },
    productBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buyButton: {
        alignItems: 'center',
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 8,
        justifyContent: 'center',
        minHeight: 32,
        minWidth: 60,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    buyButtonOwned: {
        backgroundColor: '#EAF4EE',
    },
    buyButtonDisabled: {
        opacity: 0.6,
    },
    buyButtonPressed: {
        transform: [{ scale: 0.96 }],
    },
    buyButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
    },
    buyButtonOwnedText: {
        color: Design.colors.primaryGreen,
    },
    productPrice: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        color: '#D9556D',
    },
    productPriceWrap: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
    },
    productRubyIcon: {
        height: 18,
        width: 18,
    },
});
