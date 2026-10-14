import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { styles } from '../home-screen.styles';

type HomeBottomBarProps = {
  isNight: boolean;
  onOpenShop: () => void;
  onOpenWardrobe: () => void;
  onOpenHome?: () => void;
  onOpenCommunity: () => void;
  onOpenSettings: () => void;
};

export const HomeBottomBar = memo(function HomeBottomBar({
  isNight,
  onOpenShop,
  onOpenWardrobe,
  onOpenHome,
  onOpenCommunity,
  onOpenSettings,
}: HomeBottomBarProps) {
  const triggerHaptic = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
  };

  const activeColor = isNight ? '#34D399' : '#10B981';
  const inactiveColor = isNight ? '#94A3B8' : '#64748B';

  return (
    <View style={[styles.fixedBottomBar, isNight && styles.fixedBottomBarNight]}>
      {/* 1. Shop */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cửa hàng"
        onPress={() => {
          triggerHaptic();
          onOpenShop();
        }}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons color={inactiveColor} name="storefront-outline" size={22} />
        </View>
        <Text style={[styles.bottomNavLabel, isNight && styles.bottomNavLabelNight]}>Shop</Text>
      </Pressable>

      {/* 2. Kho đồ */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kho đồ"
        onPress={() => {
          triggerHaptic();
          onOpenWardrobe();
        }}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons color={inactiveColor} name="shirt-outline" size={22} />
        </View>
        <Text style={[styles.bottomNavLabel, isNight && styles.bottomNavLabelNight]}>Kho đồ</Text>
      </Pressable>

      {/* 3. Home (Active) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Trang chủ"
        onPress={() => {
          triggerHaptic();
          onOpenHome?.();
        }}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.85, transform: [{ scale: 0.94 }] },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons color={activeColor} name="home" size={23} />
        </View>
        <Text
          style={[
            styles.bottomNavLabel,
            styles.bottomNavLabelActive,
            isNight && styles.bottomNavLabelActiveNight,
          ]}>
          Home
        </Text>
      </Pressable>

      {/* 4. Social */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cộng đồng"
        onPress={() => {
          triggerHaptic();
          onOpenCommunity();
        }}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons color={inactiveColor} name="globe-outline" size={22} />
        </View>
        <Text style={[styles.bottomNavLabel, isNight && styles.bottomNavLabelNight]}>Social</Text>
      </Pressable>

      {/* 5. Cài đặt (Setting) */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cài đặt"
        onPress={() => {
          triggerHaptic();
          onOpenSettings();
        }}
        style={({ pressed }) => [
          styles.bottomNavItem,
          pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] },
        ]}>
        <View style={styles.bottomNavIconWrap}>
          <Ionicons color={inactiveColor} name="settings-outline" size={22} />
        </View>
        <Text style={[styles.bottomNavLabel, isNight && styles.bottomNavLabelNight]}>Cài đặt</Text>
      </Pressable>
    </View>
  );
});
