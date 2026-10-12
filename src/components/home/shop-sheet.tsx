import { Design, FontFamily } from '@/src/constants/design';
import { cacheManager } from '@/src/services/cacheManager';
import { shopService, ShopServiceError } from '@/src/services/shopService';
import type { ShopItem } from '@/src/types/api/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { InsufficientRubyModal, PurchaseSuccessModal } from './purchase-success-modal';

type ShopSheetProps = {
    visible: boolean;
    balance: number | null;
    onBalanceChange: (balance: number) => void;
    onPurchaseSuccess?: (item: ShopItem, remainingRuby: number) => void;
    onInsufficientRuby?: (item: ShopItem, message: string) => void;
    onClose: () => void;
    onTopUpRuby?: () => void;
};

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function getShopThumbnailLayers(item: ShopItem) {
    return Array.from(new Set([
        ...(item.thumbnailLayers ?? []),
        item.thumbnailUrl ?? item.imageUrl,
    ].filter((imageUrl): imageUrl is string =>
        Boolean(imageUrl) && imageUrl !== item.itemBackgroundUrl)));
}

export function ShopSheet({
    visible,
    balance,
    onBalanceChange,
    onPurchaseSuccess,
    onInsufficientRuby,
    onClose,
    onTopUpRuby,
}: ShopSheetProps) {
    // Fast cache-first initialization to eliminate loading spinner whenever cached
    const [items, setItems] = useState<ShopItem[]>(() => {
        return cacheManager.get<ShopItem[]>('shop:items') ?? [];
    });
    const [hasLoadedItems, setHasLoadedItems] = useState(() => {
        return (cacheManager.get<ShopItem[]>('shop:items')?.length ?? 0) > 0;
    });
    const [itemsError, setItemsError] = useState<string | null>(null);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);

    // Inline modals to prevent conflicting modal slide transitions and double-jank
    const [insufficientItem, setInsufficientItem] = useState<{
        item: ShopItem;
        message: string;
    } | null>(null);
    const [successItem, setSuccessItem] = useState<ShopItem | null>(null);

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

        // Instant check: if user already has insufficient ruby, show immediately without waiting for server 402
        if (balance !== null && balance < item.priceRuby) {
            const diff = item.priceRuby - balance;
            const message = `Bạn cần thêm ${diff} Ruby để mua ${item.name}.`;
            setInsufficientItem({ item, message });
            onInsufficientRuby?.(item, message);
            return;
        }

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
            setSuccessItem(item);
            onPurchaseSuccess?.(item, purchase.remainingRuby);
        } catch (error: unknown) {
            const message = getErrorMessage(error, 'Không thể mua skin.');
            const isInsufficientRuby =
                /không đủ|insufficient|not enough/i.test(message) ||
                (error instanceof ShopServiceError && error.status === 402);

            if (isInsufficientRuby) {
                setInsufficientItem({ item, message });
                onInsufficientRuby?.(item, message);
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
                // Background prefetch all images so they are ready instantly
                const urls: string[] = [];
                catalog.forEach((item) => {
                    if (item.imageUrl) urls.push(item.imageUrl);
                    if (item.thumbnailUrl) urls.push(item.thumbnailUrl);
                    if (item.itemBackgroundUrl) urls.push(item.itemBackgroundUrl);
                    item.thumbnailLayers?.forEach((layer) => {
                        if (layer) urls.push(layer);
                    });
                });
                if (urls.length > 0) {
                    void Image.prefetch(Array.from(new Set(urls)));
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
            });

        return () => {
            isMounted = false;
        };
    }, [visible, retryCount, onBalanceChange]);

    return (
        <Modal animationType="fade" onRequestClose={onClose} transparent visible={visible}>
            <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(100)} style={styles.overlay}>
                <Pressable accessibilityLabel="Đóng cửa hàng" onPress={onClose} style={styles.backdrop} />

                <View style={styles.sheet}>
                    <View style={styles.grabber} />
                    <View style={styles.header}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Đóng cửa hàng"
                            hitSlop={10}
                            onPress={onClose}
                            style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
                            <Ionicons color="#1E293B" name="chevron-back" size={22} />
                        </Pressable>
                        <View style={styles.titleWrap}>
                            <Text style={styles.title}>Cửa hàng PENTAVA</Text>
                            <Text style={styles.subtitle}>Thời trang cho bé mèo cưng ✨</Text>
                        </View>
                        <View style={styles.balanceChip}>
                            <Image
                                contentFit="contain"
                                source={require('@/assets/images/ruby.png')}
                                style={styles.rubyImage}
                            />
                            <Text style={styles.balanceText}>
                                {isLoadingWallet && balance === null ? '...' : `${balance ?? 0}`}
                            </Text>
                        </View>
                    </View>

                    {walletError ? (
                        <View style={styles.walletErrorRow}>
                            <Text accessibilityRole="alert" style={styles.errorText}>{walletError}</Text>
                            <Pressable accessibilityRole="button" onPress={retryLoading} style={styles.retryButton}>
                                <Text style={styles.retryButtonText}>Thử lại</Text>
                            </Pressable>
                        </View>
                    ) : null}

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
                        ) : (
                            <Animated.View entering={FadeIn.duration(150)} style={styles.cardsContainer}>
                                {items.map((item) => (
                                    <View key={item.id} style={styles.productCard}>
                                        <View style={[
                                            styles.productBadge,
                                            item.owned ? styles.ownedBadge : styles.notOwnedBadge,
                                        ]}>
                                            <Ionicons
                                                color={item.owned ? '#059669' : '#D97706'}
                                                name={item.owned ? 'checkmark-circle' : 'sparkles'}
                                                size={11}
                                            />
                                            <Text style={[
                                                styles.productBadgeText,
                                                item.owned ? styles.ownedBadgeText : styles.notOwnedBadgeText,
                                            ]}>
                                                {item.owned ? 'Đã có' : 'Mới'}
                                            </Text>
                                        </View>
                                        <View style={styles.imageShowcase}>
                                            {getShopThumbnailLayers(item).map((imageUrl, layerIndex) => (
                                                <Image
                                                    key={`${item.id}-${layerIndex}`}
                                                    cachePolicy="memory-disk"
                                                    contentFit="contain"
                                                    priority="high"
                                                    source={{ uri: imageUrl }}
                                                    style={[
                                                        styles.thumbnailLayer,
                                                        layerIndex > 0 && styles.thumbnailItemLayer,
                                                        { zIndex: layerIndex },
                                                    ]}
                                                />
                                            ))}
                                        </View>
                                        <Text numberOfLines={1} style={styles.productName}>{item.name}</Text>
                                        <Text numberOfLines={2} style={styles.productDescription}>{item.description}</Text>
                                        <View style={styles.productBottomRow}>
                                            <View style={styles.productPriceWrap}>
                                                <Image
                                                    contentFit="contain"
                                                    source={require('@/assets/images/ruby.png')}
                                                    style={styles.productRubyIcon}
                                                />
                                                <Text style={styles.productPrice}>{item.priceRuby}</Text>
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
                                                        {item.owned ? 'Đã sở hữu' : 'Mua ngay'}
                                                    </Text>
                                                )}
                                            </Pressable>
                                        </View>
                                    </View>
                                ))}
                            </Animated.View>
                        )}
                    </ScrollView>
                </View>

                {/* Inline Insufficient Ruby & Purchase Success modals to prevent modal conflict */}
                <InsufficientRubyModal
                    balance={balance}
                    message={insufficientItem?.message ?? ''}
                    onClose={() => setInsufficientItem(null)}
                    onTopUp={() => {
                        setInsufficientItem(null);
                        onClose();
                        if (onTopUpRuby) {
                            onTopUpRuby();
                        } else {
                            router.push('/ruby-topup');
                        }
                    }}
                    product={insufficientItem?.item ?? null}
                    visible={insufficientItem !== null}
                />
                <PurchaseSuccessModal
                    balance={balance ?? 0}
                    onClose={() => setSuccessItem(null)}
                    product={successItem}
                />
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    sheet: {
        height: '78%',
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    grabber: {
        alignSelf: 'center',
        width: 44,
        height: 5,
        borderRadius: 3,
        backgroundColor: '#E2E8F0',
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleWrap: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 17,
        color: '#0F291E',
    },
    subtitle: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 11,
        color: '#64748B',
        marginTop: 1,
    },
    balanceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1.5,
        borderColor: '#FDA4AF',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        backgroundColor: '#FFF1F2',
    },
    balanceText: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: 13,
        color: '#E11D48',
    },
    rubyImage: {
        height: 18,
        width: 18,
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
    grid: {
        paddingBottom: 54,
        paddingTop: 4,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
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
        borderRadius: 12,
        marginTop: 8,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    retryButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
    },
    productCard: {
        width: '48%',
        borderWidth: 1.5,
        borderColor: '#E2EFE6',
        borderRadius: 18,
        padding: 12,
        marginBottom: 14,
        backgroundColor: '#FFFFFF',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    productBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        borderRadius: 8,
        paddingHorizontal: 7,
        paddingVertical: 2.5,
    },
    productBadgeText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 10,
    },
    ownedBadge: {
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    ownedBadgeText: {
        color: '#059669',
    },
    notOwnedBadge: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    notOwnedBadgeText: {
        color: '#D97706',
    },
    imageShowcase: {
        width: '100%',
        height: 100,
        borderRadius: 14,
        backgroundColor: '#F8FAF8',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 18,
        marginBottom: 8,
        overflow: 'hidden',
    },
    productImage: {
        height: 84,
        width: '84%',
    },
    thumbnailLayer: {
        height: '100%',
        position: 'absolute',
        width: '100%',
    },
    thumbnailItemLayer: {
        transform: [{ scale: 2.1 }],
    },
    productName: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 13,
        color: '#0F291E',
        marginBottom: 2,
    },
    productDescription: {
        color: '#64748B',
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 10.5,
        lineHeight: 14,
        marginBottom: 8,
        minHeight: 28,
    },
    productBottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 2,
    },
    buyButton: {
        alignItems: 'center',
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 10,
        justifyContent: 'center',
        minHeight: 30,
        paddingHorizontal: 12,
        paddingVertical: 5,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
    },
    buyButtonOwned: {
        backgroundColor: '#F1F5F9',
        shadowOpacity: 0,
        elevation: 0,
    },
    buyButtonDisabled: {
        opacity: 0.6,
    },
    buyButtonPressed: {
        transform: [{ scale: 0.95 }],
    },
    buyButtonText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 11,
    },
    buyButtonOwnedText: {
        color: '#94A3B8',
    },
    productPrice: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: 13,
        color: '#E11D48',
    },
    productPriceWrap: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 3,
    },
    productRubyIcon: {
        height: 16,
        width: 16,
    },
});
