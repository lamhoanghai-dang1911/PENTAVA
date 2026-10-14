import { Design, FontFamily } from '@/src/constants/design';
import { useAppTheme } from '@/src/context/theme-context';
import { cacheManager } from '@/src/services/cacheManager';
import { shopService, ShopServiceError } from '@/src/services/shopService';
import type { ShopItem } from '@/src/types/api/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { InsufficientRubyModal, PurchaseSuccessModal } from './purchase-success-modal';
import { ShopSheetSkeleton } from './shop-sheet-skeleton';

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

function sanitizeThumbnailUrl(url: string | undefined, code?: string): string | undefined {
    if (!url) return url;
    if (url.includes('crown_background.png')) {
        return url.replace('crown_background.png', 'crown_background_replace.png');
    }
    if (code === 'crown' && !url.includes('crown_background_replace.png') && !url.includes('crown.png')) {
        return 'https://olgtvgfgpaydkopjhern.supabase.co/storage/v1/object/public/shop_thumbnail/crown_background_replace.png';
    }
    return url;
}

function getShopThumbnailLayers(item: ShopItem): string[] {
    const sanitizedLayers = (item.thumbnailLayers ?? []).map((layer) => sanitizeThumbnailUrl(layer, item.code)!);
    const fallbackUrl = sanitizeThumbnailUrl(item.thumbnailUrl, item.code) ?? item.imageUrl;

    const rawLayers = [
        ...sanitizedLayers,
        fallbackUrl,
    ].filter(
        (imageUrl): imageUrl is string =>
            Boolean(imageUrl) && imageUrl !== item.itemBackgroundUrl,
    );

    if (rawLayers.length === 0 && item.imageUrl) {
        rawLayers.push(item.imageUrl);
    }

    return Array.from(new Set(rawLayers));
}

// ⚡ Component thẻ sản phẩm riêng lẻ, bọc React.memo để chỉ re-render card bị thay đổi
type ShopItemCardProps = {
    item: ShopItem;
    isPurchasing: boolean;
    onBuy: (item: ShopItem) => void;
};

const ShopItemCard = React.memo(function ShopItemCard({
    item,
    isPurchasing,
    onBuy,
}: ShopItemCardProps) {
    const thumbnailLayers = useMemo(() => getShopThumbnailLayers(item), [item]);

    return (
        <View style={styles.productCard}>
            <View
                style={[
                    styles.productBadge,
                    item.owned ? styles.ownedBadge : styles.notOwnedBadge,
                ]}
            >
                <Ionicons
                    color={item.owned ? '#059669' : '#D97706'}
                    name={item.owned ? 'checkmark-circle' : 'sparkles'}
                    size={11}
                />
                <Text
                    style={[
                        styles.productBadgeText,
                        item.owned ? styles.ownedBadgeText : styles.notOwnedBadgeText,
                    ]}
                >
                    {item.owned ? 'Đã có' : 'Mới'}
                </Text>
            </View>

            <View style={styles.imageShowcase}>
                {thumbnailLayers.map((imageUrl, layerIndex) => (
                    <Image
                        key={`${item.id}-${layerIndex}`}
                        cachePolicy="memory-disk"
                        contentFit="contain"
                        recyclingKey={imageUrl}
                        source={{ uri: imageUrl }}
                        style={[
                            styles.thumbnailLayer,
                            layerIndex > 0 && styles.thumbnailItemLayer,
                            { zIndex: layerIndex },
                        ]}
                    />
                ))}
            </View>

            <Text numberOfLines={1} style={styles.productName}>
                {item.name}
            </Text>
            <Text numberOfLines={2} style={styles.productDescription}>
                {item.description}
            </Text>

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
                        disabled: item.owned || isPurchasing,
                    }}
                    disabled={item.owned || isPurchasing}
                    onPress={() => onBuy(item)}
                    style={({ pressed }) => [
                        styles.buyButton,
                        item.owned && styles.buyButtonOwned,
                        isPurchasing && styles.buyButtonDisabled,
                        pressed && !isPurchasing && !item.owned && styles.buyButtonPressed,
                    ]}
                >
                    {isPurchasing ? (
                        <ActivityIndicator color={Design.colors.white} size="small" />
                    ) : (
                        <Text
                            style={[
                                styles.buyButtonText,
                                item.owned && styles.buyButtonOwnedText,
                            ]}
                        >
                            {item.owned ? 'Đã sở hữu' : 'Mua ngay'}
                        </Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
});

export const ShopSheet = React.memo(function ShopSheet({
    visible,
    balance,
    onBalanceChange,
    onPurchaseSuccess,
    onInsufficientRuby,
    onClose,
    onTopUpRuby,
}: ShopSheetProps) {
    const { isNight } = useAppTheme();
    // SWR / Memory cache initialization: hiển thị đồ tức thì trong 0ms nếu đã có trong cache
    const [items, setItems] = useState<ShopItem[]>(() => {
        return (
            cacheManager.get<ShopItem[]>('shop:items') ??
            cacheManager.getStale<ShopItem[]>('shop:items') ??
            []
        );
    });
    const [hasLoadedItems, setHasLoadedItems] = useState(() => {
        return (
            (cacheManager.get<ShopItem[]>('shop:items')?.length ?? 0) > 0 ||
            (cacheManager.getStale<ShopItem[]>('shop:items')?.length ?? 0) > 0
        );
    });
    const [itemsError, setItemsError] = useState<string | null>(null);
    const [walletError, setWalletError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);

    const [insufficientItem, setInsufficientItem] = useState<{
        item: ShopItem;
        message: string;
    } | null>(null);
    const [successItem, setSuccessItem] = useState<ShopItem | null>(null);

    const isLoadingItems = visible && !hasLoadedItems && itemsError === null;
    const isLoadingWallet = visible && balance === null && walletError === null;

    const retryLoading = useCallback(() => {
        setItemsError(null);
        setWalletError(null);
        setHasLoadedItems(false);
        setRetryCount((count) => count + 1);
    }, []);

    const handleBuy = useCallback(
        async (item: ShopItem) => {
            if (item.owned || purchasingItemId !== null) return;

            // Kiểm tra tức thì số dư Ruby
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
        },
        [balance, purchasingItemId, onBalanceChange, onInsufficientRuby, onPurchaseSuccess],
    );

    useEffect(() => {
        if (!visible) return;

        let isMounted = true;

        void shopService
            .getItems()
            .then((catalog) => {
                if (isMounted) {
                    setItems(catalog);
                    setItemsError(null);
                }
                // Prefetch ngầm ảnh vào cache
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

        // Chỉ tải lại ví nếu chưa có số dư
        if (balance === null) {
            void shopService
                .getMyWallet()
                .then((wallet) => {
                    if (isMounted) {
                        onBalanceChange(wallet.rubyBalance);
                        setWalletError(null);
                    }
                })
                .catch((error: unknown) => {
                    if (isMounted) setWalletError(getErrorMessage(error, 'Không thể tải số dư Ruby.'));
                });
        }

        return () => {
            isMounted = false;
        };
    }, [visible, retryCount, balance, onBalanceChange]);

    const renderItem = useCallback(
        ({ item }: { item: ShopItem }) => (
            <ShopItemCard
                isPurchasing={purchasingItemId === item.id}
                item={item}
                onBuy={handleBuy}
            />
        ),
        [purchasingItemId, handleBuy],
    );

    const keyExtractor = useCallback((item: ShopItem) => String(item.id), []);

    const renderHeader = useCallback(() => {
        if (!walletError) return null;
        return (
            <View style={styles.walletErrorRow}>
                <Text accessibilityRole="alert" style={styles.errorText}>
                    {walletError}
                </Text>
                <Pressable accessibilityRole="button" onPress={retryLoading} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                </Pressable>
            </View>
        );
    }, [walletError, retryLoading]);

    const renderEmpty = useCallback(() => {
        if (isLoadingItems) {
            return <ShopSheetSkeleton />;
        }
        if (itemsError) {
            return (
                <View style={styles.emptyState}>
                    <Text accessibilityRole="alert" style={styles.errorText}>
                        {itemsError}
                    </Text>
                    <Pressable
                        accessibilityRole="button"
                        onPress={retryLoading}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryButtonText}>Thử lại</Text>
                    </Pressable>
                </View>
            );
        }
        return <Text style={styles.emptyText}>Chưa có skin nào trong cửa hàng.</Text>;
    }, [isLoadingItems, itemsError, retryLoading]);

    return (
        <Modal
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
            transparent
            visible={visible}
        >
            <View style={styles.overlay}>
                <Pressable accessibilityLabel="Đóng cửa hàng" onPress={onClose} style={styles.backdrop} />

                <View style={[styles.sheet, isNight && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                    <View style={[styles.grabber, isNight && { backgroundColor: '#475569' }]} />
                    <View style={styles.header}>
                        <View style={[styles.titleWrap, { marginLeft: 0 }]}>
                            <Text style={[styles.title, isNight && { color: '#F8FAFC' }]}>Cửa hàng PENTAVA</Text>
                            <Text style={[styles.subtitle, isNight && { color: '#94A3B8' }]}>Thời trang cho bé mèo cưng ✨</Text>
                        </View>
                        <View style={[styles.balanceChip, isNight && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                            <Image
                                contentFit="contain"
                                source={require('@/assets/images/ruby.png')}
                                style={styles.rubyImage}
                            />
                            <Text style={[styles.balanceText, isNight && { color: '#F8FAFC' }]}>
                                {isLoadingWallet && balance === null ? '...' : `${balance ?? 0}`}
                            </Text>
                        </View>
                    </View>

                    {/* ⚡ FlatList ảo hóa 2 cột mượt mà 60 FPS, không render dồn dập */}
                    <FlatList
                        ListEmptyComponent={renderEmpty}
                        ListHeaderComponent={renderHeader}
                        columnWrapperStyle={items.length > 1 ? styles.columnWrapper : undefined}
                        contentContainerStyle={styles.grid}
                        data={hasLoadedItems && !itemsError ? items : []}
                        initialNumToRender={6}
                        keyExtractor={keyExtractor}
                        maxToRenderPerBatch={6}
                        numColumns={2}
                        removeClippedSubviews={Platform.OS === 'android'}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        windowSize={5}
                    />
                </View>

                {/* Inline Insufficient Ruby & Purchase Success modals */}
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
            </View>
        </Modal>
    );
});

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
        paddingHorizontal: 16,
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
        paddingBottom: 40,
        paddingTop: 4,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        marginBottom: 12,
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
        width: '48.5%',
        borderWidth: 1.5,
        borderColor: '#E2EFE6',
        borderRadius: 18,
        padding: 12,
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
