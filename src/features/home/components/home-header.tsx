import { Design } from '@/src/constants/design';
import type { ThemeMode } from '@/src/hooks/use-day-night-theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { styles } from '../home-screen.styles';

type HomeHeaderProps = {
  displayName: string;
  currentStreak: number;
  rubyBalance: number | null;
  isRubyBalanceLoading: boolean;
  unreadNotificationCount: number;
  isNight: boolean;
  isImmersiveView: boolean;
  themeMode: ThemeMode;
  onToggleImmersiveView: () => void;
  onToggleDayNight: () => void;
  onCycleTheme: () => void;
  onToggleNotifications: () => void;
  onOpenSettings: () => void;
  onOpenRubyTopup: () => void;
};

export function HomeHeader({
  displayName,
  currentStreak,
  rubyBalance,
  isRubyBalanceLoading,
  unreadNotificationCount,
  isNight,
  isImmersiveView,
  themeMode,
  onToggleImmersiveView,
  onToggleDayNight,
  onCycleTheme,
  onToggleNotifications,
  onOpenSettings,
  onOpenRubyTopup,
}: HomeHeaderProps) {
  const flameScale = useSharedValue(1);

  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [flameScale]);

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  return (
    <View style={styles.headerContainer}>
      <View style={[styles.headerRow, isImmersiveView && { justifyContent: 'flex-end' }]}>
        {!isImmersiveView && (
          <Text
            numberOfLines={1}
            style={[styles.greeting, isNight && styles.greetingNight]}>
            Chào {displayName}
          </Text>
        )}
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel={
              isImmersiveView
                ? 'Đang bật xem toàn cảnh. Bấm để hiện lại các chức năng'
                : 'Bấm để ẩn các thẻ, xem toàn cảnh nhân vật và thiên nhiên'
            }
            accessibilityRole="button"
            onPress={onToggleImmersiveView}
            style={({ pressed }) => [
              styles.iconHeaderButton,
              isNight && styles.iconHeaderButtonNight,
              isImmersiveView && (isNight ? styles.immersiveButtonActiveNight : styles.immersiveButtonActive),
              pressed && { opacity: 0.8 },
            ]}>
            <Ionicons
              color={
                isImmersiveView
                  ? (isNight ? '#38BDF8' : '#15803D')
                  : (isNight ? '#FFFFFF' : '#1E293B')
              }
              name={isImmersiveView ? 'eye-off-outline' : 'eye-outline'}
              size={20}
            />
          </Pressable>

          <Pressable
            accessibilityLabel={
              themeMode === 'auto'
                ? `Chế độ tự động (${isNight ? 'Đêm' : 'Ngày'}). Bấm để chuyển`
                : `Chế độ ${isNight ? 'Ban đêm' : 'Ban ngày'}. Bấm để chuyển`
            }
            accessibilityRole="button"
            onPress={onToggleDayNight}
            onLongPress={onCycleTheme}
            style={({ pressed }) => [
              styles.iconHeaderButton,
              isNight && styles.iconHeaderButtonNight,
              pressed && { opacity: 0.8 },
            ]}>
            <Ionicons
              color={isNight ? '#FDE047' : '#F59E0B'}
              name={isNight ? 'moon' : 'sunny'}
              size={19}
            />
          </Pressable>

          {!isImmersiveView && (
            <>
              <Pressable
                accessibilityLabel="Thông báo"
                onPress={onToggleNotifications}
                style={[styles.notificationButton, isNight && styles.notificationButtonNight]}>
                <Ionicons
                  color={isNight ? Design.colors.white : Design.colors.black}
                  name="notifications-outline"
                  size={21}
                />
                {unreadNotificationCount > 0 ? <View style={styles.notificationBadge} /> : null}
              </Pressable>
              <Pressable
                onPress={onOpenSettings}
                style={[styles.avatar, isNight && styles.avatarNight]}>
                <Text style={[styles.avatarText, isNight && styles.avatarTextNight]}>
                  {displayName.charAt(0).toUpperCase()}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      {!isImmersiveView && (
        <View style={styles.headerStatsRow}>
          <View style={[styles.statPill, isNight && styles.statPillNight]}>
            <Animated.View style={animatedFlameStyle}>
              <Image
                contentFit="contain"
                source={
                  currentStreak > 0
                    ? require('@/assets/images/streak.png')
                    : require('@/assets/images/gray_streak.png')
                }
                style={styles.statIcon}
              />
            </Animated.View>
            <Text style={[styles.statValue, styles.streakValue, isNight && styles.streakValueNight]}>
              {currentStreak}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={
              isRubyBalanceLoading
                ? 'Đang tải số dư Ruby'
                : rubyBalance === null
                  ? 'Không thể tải số dư Ruby'
                  : `Số dư Ruby: ${rubyBalance}. Nhấn để nạp thêm Ruby`
            }
            accessibilityRole="button"
            onPress={onOpenRubyTopup}
            style={({ pressed }) => [
              styles.statPill,
              styles.rubyPill,
              isNight && styles.statPillNight,
              pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
            ]}>
            <Image
              contentFit="contain"
              source={require('@/assets/images/ruby.png')}
              style={styles.statIcon}
            />
            <Text style={[styles.statValue, styles.rubyValue, isNight && styles.rubyValueNight]}>
              {isRubyBalanceLoading ? '...' : rubyBalance ?? '—'}
            </Text>
            <View style={styles.plusButtonCircle}>
              <Ionicons color="#FFFFFF" name="add" size={14} />
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
