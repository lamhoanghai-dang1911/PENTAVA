import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { memo } from 'react';
import { DeviceEventEmitter, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../home-screen.styles';

export type BottomBarTab = 'shop' | 'wardrobe' | 'home' | 'community' | 'settings' | null;

type HomeBottomBarProps = {
  isNight?: boolean;
  activeTab?: BottomBarTab;
  onOpenShop?: () => void;
  onOpenWardrobe?: () => void;
  onOpenHome?: () => void;
  onOpenCommunity?: () => void;
  onOpenSettings?: () => void;
};

export const HomeBottomBar = memo(function HomeBottomBar({
  isNight = false,
  activeTab = 'home',
  onOpenShop,
  onOpenWardrobe,
  onOpenHome,
  onOpenCommunity,
  onOpenSettings,
}: HomeBottomBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 10);

  const triggerHaptic = () => {
    requestAnimationFrame(() => {
      try {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // ignore
      }
    });
  };

  const TAB_INDEX_MAP: Record<string, number> = {
    shop: 0,
    wardrobe: 1,
    home: 2,
    community: 3,
    settings: 4,
  };

  const navigateToTab = (
    targetTab: 'shop' | 'wardrobe' | 'home' | 'community' | 'settings',
    targetPath: string,
    customCallback?: () => void,
  ) => {
    triggerHaptic();
    if (customCallback) {
      customCallback();
      return;
    }
    if (activeTab === targetTab) return;

    const currentIdx = activeTab ? (TAB_INDEX_MAP[activeTab] ?? 2) : 2;
    const targetIdx = TAB_INDEX_MAP[targetTab];
    // Trang bên trái -> slide qua trái ('slide_from_left')
    // Trang bên phải -> slide qua phải ('slide_from_right')
    const slide = targetIdx < currentIdx ? 'slide_from_left' : 'slide_from_right';

    // Dùng router.replace để thay thế màn hình thay vì chồng chất stack vô hạn gây tràn RAM/out app
    router.replace({
      pathname: targetPath,
      params: { slide },
    } as any);
  };

  const handleOpenShop = () => navigateToTab('shop', '/shop', onOpenShop);
  const handleOpenWardrobe = () => navigateToTab('wardrobe', '/wardrobe', onOpenWardrobe);
  const handleOpenHome = () => navigateToTab('home', '/(tabs)', onOpenHome);
  const handleOpenCommunity = () => navigateToTab('community', '/community', onOpenCommunity);
  const handleOpenSettings = () => navigateToTab('settings', '/settings', onOpenSettings);

  const activeColor = isNight ? '#34D399' : '#10B981';
  const inactiveColor = isNight ? '#94A3B8' : '#64748B';

  const isShopActive = activeTab === 'shop';
  const isWardrobeActive = activeTab === 'wardrobe';
  const isHomeActive = activeTab === 'home';
  const isCommunityActive = activeTab === 'community';
  const isSettingsActive = activeTab === 'settings';

  return (
    <View
      style={[
        styles.fixedBottomBar,
        isNight && styles.fixedBottomBarNight,
        { paddingBottom: bottomPadding },
      ]}>
      {/* 1. Shop */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cửa hàng"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={handleOpenShop}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.55 },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons
            color={isShopActive ? activeColor : inactiveColor}
            name={isShopActive ? 'storefront' : 'storefront-outline'}
            size={22}
          />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            isNight && styles.bottomNavLabelNight,
            isShopActive && styles.bottomNavLabelActive,
            isShopActive && isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Shop
        </Text>
      </Pressable>

      {/* 2. Kho đồ */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kho đồ"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={handleOpenWardrobe}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.55 },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons
            color={isWardrobeActive ? activeColor : inactiveColor}
            name={isWardrobeActive ? 'shirt' : 'shirt-outline'}
            size={22}
          />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            isNight && styles.bottomNavLabelNight,
            isWardrobeActive && styles.bottomNavLabelActive,
            isWardrobeActive && isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Kho đồ
        </Text>
      </Pressable>

      {/* 3. Home */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Trang chủ"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={handleOpenHome}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.55 },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons
            color={isHomeActive ? activeColor : inactiveColor}
            name={isHomeActive ? 'home' : 'home-outline'}
            size={23}
          />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            isNight && styles.bottomNavLabelNight,
            isHomeActive && styles.bottomNavLabelActive,
            isHomeActive && isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Home
        </Text>
      </Pressable>

      {/* 4. Social */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cộng đồng"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={handleOpenCommunity}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.55 },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons
            color={isCommunityActive ? activeColor : inactiveColor}
            name={isCommunityActive ? 'globe' : 'globe-outline'}
            size={22}
          />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            isNight && styles.bottomNavLabelNight,
            isCommunityActive && styles.bottomNavLabelActive,
            isCommunityActive && isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Social
        </Text>
      </Pressable>

      {/* 5. Cài đặt (Setting) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cài đặt"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={handleOpenSettings}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.55 },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons
            color={isSettingsActive ? activeColor : inactiveColor}
            name={isSettingsActive ? 'settings' : 'settings-outline'}
            size={22}
          />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            isNight && styles.bottomNavLabelNight,
            isSettingsActive && styles.bottomNavLabelActive,
            isSettingsActive && isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Cài đặt
        </Text>
      </Pressable>
    </View>
  );
});
