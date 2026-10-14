import { Design, FontFamily } from '@/src/constants/design';
import type { ShopItem } from '@/src/types/api/shop';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type ShopItemCardProps = {
  item: ShopItem;
  isPurchasing: boolean;
  isNight?: boolean;
  onBuy: (item: ShopItem) => void;
};

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

export const ShopItemCard = React.memo(function ShopItemCard({
  item,
  isPurchasing,
  isNight = false,
  onBuy,
}: ShopItemCardProps) {
  const thumbnailLayers = useMemo(() => getShopThumbnailLayers(item), [item]);

  return (
    <View style={[styles.productCard, isNight && styles.productCardNight]}>
      {/* Badge trạng thái */}
      <View
        style={[
          styles.productBadge,
          item.owned ? styles.ownedBadge : styles.notOwnedBadge,
          isNight && (item.owned ? styles.ownedBadgeNight : styles.notOwnedBadgeNight),
        ]}>
        <Ionicons
          color={item.owned ? '#059669' : '#D97706'}
          name={item.owned ? 'checkmark-circle' : 'sparkles'}
          size={11}
        />
        <Text
          style={[
            styles.productBadgeText,
            item.owned ? styles.ownedBadgeText : styles.notOwnedBadgeText,
          ]}>
          {item.owned ? 'Đã có' : 'Mới'}
        </Text>
      </View>

      {/* Khung hiển thị linh vật mang trang phục */}
      <View style={[styles.imageShowcase, isNight && styles.imageShowcaseNight]}>
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

      {/* Thông tin tên & mô tả */}
      <Text
        numberOfLines={1}
        style={[styles.productName, isNight && styles.productNameNight]}>
        {item.name}
      </Text>
      <Text
        numberOfLines={2}
        style={[styles.productDescription, isNight && styles.productDescriptionNight]}>
        {item.description || 'Trang phục thời trang độc đáo'}
      </Text>

      {/* Dòng giá Ruby và Nút Mua */}
      <View style={styles.productBottomRow}>
        <View style={styles.productPriceWrap}>
          <Image
            contentFit="contain"
            source={require('@/assets/images/ruby.png')}
            style={styles.productRubyIcon}
          />
          <Text style={[styles.productPrice, isNight && styles.productPriceNight]}>
            {item.priceRuby}
          </Text>
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
          ]}>
          {isPurchasing ? (
            <ActivityIndicator color={Design.colors.white} size="small" />
          ) : (
            <Text
              style={[
                styles.buyButtonText,
                item.owned && styles.buyButtonOwnedText,
              ]}>
              {item.owned ? 'Đã có' : 'Mua ngay'}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2EFE6',
    borderRadius: 18,
    borderWidth: 1.5,
    elevation: 2,
    padding: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: '48.5%',
  },
  productCardNight: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    shadowOpacity: 0,
  },
  productBadge: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 3,
    left: 10,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    position: 'absolute',
    top: 10,
    zIndex: 2,
  },
  productBadgeText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 10,
  },
  ownedBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
  },
  ownedBadgeNight: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  ownedBadgeText: {
    color: '#059669',
  },
  notOwnedBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  notOwnedBadgeNight: {
    backgroundColor: '#451A03',
    borderColor: '#B45309',
  },
  notOwnedBadgeText: {
    color: '#D97706',
  },
  imageShowcase: {
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderRadius: 14,
    height: 100,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 18,
    overflow: 'hidden',
    width: '100%',
  },
  imageShowcaseNight: {
    backgroundColor: '#0F172A',
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
    color: '#0F291E',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
    marginBottom: 2,
  },
  productNameNight: {
    color: '#F8FAFC',
  },
  productDescription: {
    color: '#64748B',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 10.5,
    lineHeight: 14,
    marginBottom: 8,
    minHeight: 28,
  },
  productDescriptionNight: {
    color: '#94A3B8',
  },
  productBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  buyButton: {
    alignItems: 'center',
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 10,
    elevation: 2,
    justifyContent: 'center',
    minHeight: 30,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buyButtonOwned: {
    backgroundColor: '#F1F5F9',
    elevation: 0,
    shadowOpacity: 0,
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
    color: '#E11D48',
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 13,
  },
  productPriceNight: {
    color: '#FDA4AF',
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
