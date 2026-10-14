import {
  InsufficientRubyModal,
  PurchaseSuccessModal,
} from '@/src/components/home/purchase-success-modal';
import { ShopSheetSkeleton } from '@/src/components/home/shop-sheet-skeleton';
import { useAppTheme } from '@/src/context/theme-context';
import { cacheManager } from '@/src/services/cacheManager';
import { shopService } from '@/src/services/shopService';
import type { ShopItem } from '@/src/types/api/shop';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShopHeader } from './components/shop-header';
import { ShopItemCard } from './components/shop-item-card';
import { styles } from './shop-screen.styles';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function ShopScreen() {
  const { isNight } = useAppTheme();

  // 1. SWR / Cache: nạp dữ liệu tức thì 0ms nếu đã có trong memory
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
  const [rubyBalance, setRubyBalance] = useState<number | null>(() => {
    return cacheManager.get<number>('wallet:rubyBalance') ?? null;
  });
  const [isRubyLoading, setIsRubyLoading] = useState(rubyBalance === null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [purchasingItemId, setPurchasingItemId] = useState<number | null>(null);

  const [insufficientItem, setInsufficientItem] = useState<{
    item: ShopItem;
    message: string;
  } | null>(null);
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null);

  const isLoadingItems = !hasLoadedItems && itemsError === null;

  // Tải dữ liệu shop và ví Ruby
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setItemsError(null);
    setWalletError(null);

    // 1. Tải ví
    setIsRubyLoading(true);
    shopService
      .getMyWallet()
      .then((wallet) => {
        setRubyBalance(wallet.rubyBalance);
        cacheManager.set('wallet:rubyBalance', wallet.rubyBalance);
        setWalletError(null);
      })
      .catch((error: unknown) => {
        setWalletError(getErrorMessage(error, 'Không thể tải số dư Ruby.'));
      })
      .finally(() => {
        setIsRubyLoading(false);
      });

    // 2. Tải danh sách skin
    shopService
      .getItems()
      .then((shopItems: ShopItem[]) => {
        setItems(shopItems);
        cacheManager.set('shop:items', shopItems);
        setItemsError(null);

        // Prefetch ảnh skin
        const urls: string[] = [];
        shopItems.forEach((item: ShopItem) => {
          if (item.imageUrl) urls.push(item.imageUrl);
          if (item.thumbnailUrl) urls.push(item.thumbnailUrl);
          if (item.itemBackgroundUrl) urls.push(item.itemBackgroundUrl);
          item.thumbnailLayers?.forEach((layer: string) => {
            if (layer) urls.push(layer);
          });
        });
        if (urls.length > 0) {
          void Image.prefetch(Array.from(new Set(urls)));
        }
      })
      .catch((error: unknown) => {
        setItemsError(getErrorMessage(error, 'Không thể tải danh sách skin.'));
      })
      .finally(() => {
        setHasLoadedItems(true);
        if (isManualRefresh) {
          setIsRefreshing(false);
        }
      });
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData, retryCount]);

  const handleRetry = useCallback(() => {
    setHasLoadedItems(false);
    setRetryCount((count) => count + 1);
  }, []);

  const handleBuy = useCallback(
    async (item: ShopItem) => {
      if (item.owned || purchasingItemId !== null) return;

      // Kiểm tra số dư Ruby tức thì
      if (rubyBalance !== null && rubyBalance < item.priceRuby) {
        const diff = item.priceRuby - rubyBalance;
        const message = `Bạn cần thêm ${diff} Ruby để mua ${item.name}.`;
        setInsufficientItem({ item, message });
        return;
      }

      setPurchasingItemId(item.id);
      try {
        const purchase = await shopService.buyItem(item.skinItemId);
        if (!purchase.success) {
          throw new Error(purchase.message || 'Không thể mua skin.');
        }

        setRubyBalance(purchase.remainingRuby);
        cacheManager.set('wallet:rubyBalance', purchase.remainingRuby);

        // Cập nhật trạng thái sở hữu tức thì
        const updatedItems = items.map((i) =>
          i.id === item.id ? { ...i, owned: true } : i,
        );
        setItems(updatedItems);
        cacheManager.set('shop:items', updatedItems);

        setSuccessItem(item);
      } catch (err: unknown) {
        setItemsError(getErrorMessage(err, 'Lỗi khi mua sản phẩm.'));
      } finally {
        setPurchasingItemId(null);
      }
    },
    [rubyBalance, purchasingItemId, items],
  );

  const renderItem = useCallback(
    ({ item }: { item: ShopItem }) => (
      <ShopItemCard
        isNight={isNight}
        isPurchasing={purchasingItemId === item.id}
        item={item}
        onBuy={handleBuy}
      />
    ),
    [isNight, purchasingItemId, handleBuy],
  );

  const keyExtractor = useCallback((item: ShopItem) => String(item.id), []);

  const renderHeader = useCallback(() => {
    if (!walletError) return null;
    return (
      <View style={styles.walletErrorRow}>
        <Text accessibilityRole="alert" style={[styles.errorText, isNight && styles.errorTextNight]}>
          {walletError}
        </Text>
        <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }, [walletError, isNight, handleRetry]);

  const renderEmpty = useCallback(() => {
    if (isLoadingItems) {
      return <ShopSheetSkeleton />;
    }
    if (itemsError) {
      return (
        <View style={styles.emptyState}>
          <Text accessibilityRole="alert" style={[styles.errorText, isNight && styles.errorTextNight]}>
            {itemsError}
          </Text>
          <Pressable accessibilityRole="button" onPress={handleRetry} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <Text style={[styles.emptyText, isNight && styles.emptyTextNight]}>
        Chưa có skin nào trong cửa hàng.
      </Text>
    );
  }, [isLoadingItems, itemsError, isNight, handleRetry]);

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, isNight && styles.safeAreaNight]}>
      {/* 1. Header Cửa Hàng PENTAVA */}
      <ShopHeader
        isNight={isNight}
        isRubyLoading={isRubyLoading}
        onTopUpPress={() => router.navigate('/ruby-topup' as any)}
        rubyBalance={rubyBalance}
      />

      {/* 2. Danh sách sản phẩm 2 cột, mượt mà và không che Menu */}
      <View style={styles.container}>
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
          refreshControl={
            <RefreshControl
              colors={['#10B981']}
              onRefresh={() => void loadData(true)}
              refreshing={isRefreshing}
              tintColor={isNight ? '#34D399' : '#10B981'}
            />
          }
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          windowSize={5}
        />
      </View>

      {/* 3. Modal thông báo khi thiếu Ruby */}
      <InsufficientRubyModal
        balance={rubyBalance}
        message={insufficientItem?.message ?? ''}
        onClose={() => setInsufficientItem(null)}
        onTopUp={() => {
          setInsufficientItem(null);
          router.navigate('/ruby-topup' as any);
        }}
        product={insufficientItem?.item ?? null}
        visible={insufficientItem !== null}
      />

      {/* 4. Modal thông báo mua thành công */}
      <PurchaseSuccessModal
        balance={rubyBalance ?? 0}
        onClose={() => setSuccessItem(null)}
        product={successItem}
      />
    </SafeAreaView>
  );
}
