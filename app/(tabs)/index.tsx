import DayNightBackground from '@/src/components/home/day-night-background';
import { AnimatedTogglePill } from '@/src/components/home/animated-toggle-pill';
import {
  InsufficientRubyModal,
  PurchaseSuccessModal,
} from '@/src/components/home/purchase-success-modal';
import RoutineTodayCard from '@/src/components/home/routinetodaycard';
import { ShopSheet } from '@/src/components/home/shop-sheet';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import { authService } from '@/src/services/authService';
import { onboardingService } from '@/src/services/onboardingService';
import { shopService } from '@/src/services/shopService';
import { skinService } from '@/src/services/skinService';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { taskService } from '@/src/services/taskService';
import type { ShopItem } from '@/src/types/api/shop';
import type { AvatarLayer } from '@/src/types/api/skin';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, Vibration, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

function getNotificationMessage(notification: SocialNotification) {
  if (notification.message) return notification.message;

  const actorName = notification.actorName || 'Ai đó';
  switch (notification.eventType) {
    case 'HIGH_FIVE':
      return `${actorName} đã thả High-Five cho bài viết của bạn.`;
    case 'COMMENT':
      return `${actorName} đã bình luận bài viết của bạn.`;
    case 'FRIEND_REQUEST':
      return `${actorName} đã gửi cho bạn lời mời kết bạn.`;
    case 'FRIEND_ACCEPTED':
      return `${actorName} đã đồng ý lời mời kết bạn của bạn.`;
    default:
      return 'Bạn có thông báo mới.';
  }
}

function getNotificationKey(notification: SocialNotification) {
  if (notification.id !== undefined && notification.id !== null) {
    return `id-${notification.id}`;
  }

  const identity = [
    notification.eventType ?? '',
    notification.actorId ?? '',
    notification.targetUserId ?? '',
    notification.postId ?? '',
    notification.commentId ?? '',
  ].join('|');

  if (notification.eventType || notification.actorId !== undefined ||
    notification.targetUserId !== undefined || notification.postId !== undefined ||
    notification.commentId !== undefined) {
    return identity;
  }

  return `${identity}|${getNotificationMessage(notification)}`;
}


export default function HomeScreen() {
  const { data } = useOnboarding();
  const { mode: themeMode, isNight, toggleDayNight, cycleMode } = useDayNightTheme();
  const [isImmersiveView, setIsImmersiveView] = useState(false);
  const [profileName, setProfileName] = useState('');
  const displayName = profileName.trim() || data.name.trim() || 'bạn';
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isRubyBalanceLoading, setIsRubyBalanceLoading] = useState(true);
  const [avatarLayers, setAvatarLayers] = useState<AvatarLayer[] | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
  const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
  const [, setIsDailyStatusLoading] = useState(false);
  const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);

  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedShopItem, setPurchasedShopItem] = useState<ShopItem | null>(null);
  const [insufficientRubyItem, setInsufficientRubyItem] = useState<ShopItem | null>(null);
  const [insufficientRubyMessage, setInsufficientRubyMessage] = useState('');
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isLoadingNotificationsRef = useRef(false);

  const mascotFloatY = useSharedValue(0);
  const mascotScale = useSharedValue(1);
  const flameScale = useSharedValue(1);

  useEffect(() => {
    mascotFloatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    mascotScale.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 1800, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 900, easing: Easing.inOut(Easing.quad) }),
        withTiming(1.0, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    );
  }, [mascotFloatY, mascotScale, flameScale]);

  const animatedMascotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: mascotFloatY.value },
      { scale: mascotScale.value },
    ],
  }));

  const animatedFlameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;

      void skinService
        .getMyAvatar()
        .then((avatar) => {
          if (isFocused) {
            setAvatarLayers(
              [...avatar.layers].sort(
                (left, right) => left.layerOrder - right.layerOrder,
              ),
            );
          }
        })
        .catch((error: unknown) => {
          if (isFocused) {
            Alert.alert(
              'Không thể tải trang phục avatar',
              error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
            );
          }
        });

      return () => {
        isFocused = false;
      };
    }, []),
  );

  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(() => {
      void authService
        .getProfile()
        .then((profile) => {
          if (isMounted) {
            setProfileName(profile.name);
          }
        })
        .catch((error: Error) => {
          if (isMounted) {
            Alert.alert('Không thể tải thông tin tài khoản', error.message);
          }
        });
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    let disposed = false;
    let closeStream: (() => void) | null = null;

    void socialService.openNotificationStream(
      () => {
        if (disposed) return;
        Vibration.vibrate([0, 220, 100, 220]);
        // Tăng ngay số lượng chưa đọc để chuông hiện chấm đỏ
        setUnreadNotificationCount((count) => count + 1);
        // Đồng bộ lại số lượng chưa đọc chuẩn từ server
        void socialService.getUnreadNotificationCount()
          .then((count) => {
            if (!disposed) setUnreadNotificationCount(count);
          })
          .catch(() => { });
      },
      (error) => {
        if (!disposed) setNotificationError(error.message);
      },
    ).then((close) => {
      if (disposed) close();
      else closeStream = close;
    }).catch((error: unknown) => {
      if (!disposed) {
        setNotificationError(error instanceof Error ? error.message : "Không thể kết nối thông báo.");
      }
    });

    return () => {
      disposed = true;
      closeStream?.();
    };
  }, []);

  useEffect(() => {
    void socialService.getUnreadNotificationCount()
      .then(setUnreadNotificationCount)
      .catch((error: unknown) => {
        setNotificationError(error instanceof Error ? error.message : 'Không thể tải số thông báo chưa đọc.');
      });
  }, []);

  const toggleNotifications = async () => {
    if (isNotificationsVisible) {
      setIsNotificationsVisible(false);
      return;
    }

    if (isLoadingNotificationsRef.current) {
      return;
    }

    isLoadingNotificationsRef.current = true;
    setNotificationError(null);
    setIsNotificationsVisible(true);
    try {
      const [storedNotifications, unreadCount] = await Promise.all([
        socialService.getAllNotifications(),
        socialService.getUnreadNotificationCount(),
      ]);
      setUnreadNotificationCount(unreadCount);

      // Loại bỏ trùng lặp từ kết quả API get
      const uniqueMap = new Map<string, SocialNotification>();
      storedNotifications.forEach((notification) => {
        const key = getNotificationKey(notification);
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, notification);
        }
      });

      const sorted = [...uniqueMap.values()].sort((left, right) =>
        new Date(right.createdAt ?? right.timestamp ?? 0).getTime()
        - new Date(left.createdAt ?? left.timestamp ?? 0).getTime()
      );
      setNotifications(sorted);
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Không thể kết nối thông báo.');
    } finally {
      isLoadingNotificationsRef.current = false;
    }
  };

  const markNotificationAsRead = async (notification: SocialNotification) => {
    if (notification.id === undefined || notification.read !== false) return;
    try {
      await socialService.markNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ));
      setUnreadNotificationCount((count) => Math.max(0, count - 1));
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Không thể đánh dấu thông báo đã đọc.');
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await socialService.markAllNotificationsAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Không thể đánh dấu tất cả thông báo đã đọc.');
    }
  };

  useEffect(() => {
    let isMounted = true;

    Promise.all([onboardingService.getCurrentGoal(), onboardingService.getCurrentStreak()])
      .then(([goalResponse, streakResponse]) => {
        if (isMounted) {
          setCurrentGoalId(goalResponse.currentGoal?.goalId ?? null);
          setCurrentStreak(streakResponse.streak?.currentStreak ?? 0);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          Alert.alert('Không thể tải mục tiêu', error.message);
        }
      });

    void shopService
      .getMyWallet()
      .then((wallet) => {
        if (isMounted) {
          setRubyBalance(wallet.rubyBalance);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          Alert.alert('Không thể tải số dư Ruby', error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRubyBalanceLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleExecuteGoal = async () => {
    if (!currentGoalId) {
      Alert.alert('Không thể thực thi', 'Không tìm thấy mục tiêu hiện tại của bạn.');
      return;
    }

    setIsDailyStatusLoading(true);
    try {
      const response = await taskService.getDailyTaskStatus(currentGoalId);
      const status = response.dailyTaskStatus;

      if (!status) {
        throw new Error(response.message || 'Không nhận được trạng thái nhiệm vụ trong ngày.');
      }

      setDailyStatus(status);
      if (status.yesterdayTasks.length > 0) {
        setIsDailyStatusVisible(true);
      } else {
        handleChooseNewTasks();
      }
    } catch (error) {
      Alert.alert(
        'Không thể tải nhiệm vụ',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      );
    } finally {
      setIsDailyStatusLoading(false);
    }
  };

  const handleKeepYesterdayTasks = async () => {
    if (!currentGoalId || !dailyStatus?.yesterdayTasks.length) return;

    setIsConfirmingDailyTasks(true);
    try {
      await taskService.confirmDailyTasks({
        goalId: currentGoalId,
        selectedTaskIds: dailyStatus.yesterdayTasks.map((task) => task.id),
      });
      setIsDailyStatusVisible(false);
      router.push('/daily-tasks');
    } catch (error) {
      Alert.alert(
        'Không thể giữ nhiệm vụ',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      );
    } finally {
      setIsConfirmingDailyTasks(false);
    }
  };

  const handleChooseNewTasks = () => {
    if (!currentGoalId) return;
    setIsDailyStatusVisible(false);
    router.push({ pathname: '/mood', params: { goalId: String(currentGoalId) } } as any);
  };

  const handleWalletBalanceChange = useCallback((balance: number) => {
    setRubyBalance(balance);
  }, []);
  const handleShopPurchaseSuccess = useCallback((item: ShopItem, remainingRuby: number) => {
    setRubyBalance(remainingRuby);
    setPurchasedShopItem(item);
    setIsShopVisible(false);
  }, []);
  const handleInsufficientRuby = useCallback((item: ShopItem, message: string) => {
    setInsufficientRubyMessage(message);
    setInsufficientRubyItem(item);
    setIsShopVisible(false);
  }, []);

  return (
    <View style={[styles.rootContainer, { backgroundColor: isNight ? '#0B132B' : '#68B6F2' }]}>
      <DayNightBackground isNight={isNight} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isImmersiveView && styles.scrollContentImmersive]}
          showsVerticalScrollIndicator={false}>
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
                {/* Nút bật/tắt toàn cảnh (ẩn/hiện các element) */}
                <Pressable
                  accessibilityLabel={
                    isImmersiveView
                      ? 'Đang bật xem toàn cảnh. Bấm để hiện lại các chức năng'
                      : 'Bấm để ẩn các thẻ, xem toàn cảnh nhân vật và thiên nhiên'
                  }
                  accessibilityRole="button"
                  onPress={() => setIsImmersiveView((prev) => !prev)}
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

                {/* Nút chuyển đổi Ngày / Đêm (chỉ giữ icon) */}
                <Pressable
                  accessibilityLabel={
                    themeMode === 'auto'
                      ? `Chế độ tự động (${isNight ? 'Đêm' : 'Ngày'}). Bấm để chuyển`
                      : `Chế độ ${isNight ? 'Ban đêm' : 'Ban ngày'}. Bấm để chuyển`
                  }
                  accessibilityRole="button"
                  onPress={toggleDayNight}
                  onLongPress={cycleMode}
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
                      onPress={() => void toggleNotifications()}
                      style={[styles.notificationButton, isNight && styles.notificationButtonNight]}>
                      <Ionicons
                        color={isNight ? Design.colors.white : Design.colors.black}
                        name="notifications-outline"
                        size={21}
                      />
                      {unreadNotificationCount > 0 ? <View style={styles.notificationBadge} /> : null}
                    </Pressable>
                    <Pressable
                      onPress={() => router.push('/settings' as any)}
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
                {/* Streak flame & value */}
                <View style={styles.statPill}>
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

                {/* Ruby icon & value */}
                <View
                  accessibilityLabel={
                    isRubyBalanceLoading
                      ? 'Đang tải số dư Ruby'
                      : rubyBalance === null
                        ? 'Không thể tải số dư Ruby'
                        : `Số dư Ruby: ${rubyBalance}`
                  }
                  style={styles.statPill}>
                  <Image
                    contentFit="contain"
                    source={require('@/assets/images/ruby.png')}
                    style={styles.statIcon}
                  />
                  <Text style={[styles.statValue, styles.rubyValue, isNight && styles.rubyValueNight]}>
                    {isRubyBalanceLoading ? '...' : rubyBalance ?? '—'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Linh vật mèo nằm chính giữa màn hình */}
          <View style={[styles.mascotCard, isImmersiveView && styles.mascotCardImmersive]}>
            <Animated.View style={animatedMascotStyle}>
              <View accessibilityLabel="Avatar hiện tại" style={styles.mascot}>
                {avatarLayers ? (
                  avatarLayers.map((layer) => (
                    <Image
                      key={`${layer.layerOrder}-${layer.code}`}
                      contentFit="contain"
                      source={{ uri: layer.imageUrl }}
                      style={[
                        StyleSheet.absoluteFill,
                        {
                          transform: [
                            { translateY: layer.slot === 'BASE' ? 0 : -19 },
                          ],
                          zIndex: layer.layerOrder,
                        },
                      ]}
                    />
                  ))
                ) : (
                  <Image
                    contentFit="contain"
                    source={require('@/assets/images/onboarding/cat-loading.png')}
                    style={StyleSheet.absoluteFill}
                  />
                )}
              </View>
            </Animated.View>
            {/* Đổ bóng nhẹ chân linh vật trên thảm cỏ */}
            <View style={[styles.mascotShadow, isNight && styles.mascotShadowNight]} />
          </View>

          {!isImmersiveView ? (
            <View style={styles.bottomCardSection}>
              {/* Nút Kho trang phục ngay sát bên trên Routine hôm nay */}
              <Pressable
                accessibilityLabel="Kho trang phục"
                accessibilityRole="button"
                onPress={() => router.push('/wardrobe' as any)}
                style={({ pressed }) => [
                  styles.wardrobeIconButton,
                  isNight && styles.wardrobeIconButtonNight,
                  pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 },
                ]}>
                <Ionicons
                  color={isNight ? '#34D399' : Design.colors.primaryGreen}
                  name="shirt-outline"
                  size={22}
                />
              </Pressable>

              {/* Routine hôm nay nằm ngay sát bên trên thanh toggle */}
              <RoutineTodayCard goalId={currentGoalId} />
            </View>
          ) : (
            <Pressable
              accessibilityLabel="Chạm để thoát chế độ toàn cảnh"
              onPress={() => setIsImmersiveView(false)}
              style={({ pressed }) => [
                styles.immersiveHintPill,
                isNight && styles.immersiveHintPillNight,
                pressed && { opacity: 0.8 },
              ]}>
              <Ionicons
                color={isNight ? '#93C5FD' : '#15803D'}
                name="sparkles"
                size={15}
              />
              <Text style={[styles.immersiveHintText, isNight && styles.immersiveHintTextNight]}>
                Đang xem toàn cảnh • Chạm để hiện lại menu
              </Text>
            </Pressable>
          )}
        </ScrollView>

      <Modal
        animationType="fade"
        onRequestClose={() => void toggleNotifications()}
        presentationStyle="fullScreen"
        statusBarTranslucent={false}
        visible={isNotificationsVisible}>
        <SafeAreaView edges={['right', 'bottom', 'left']} style={styles.notificationModal}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>Thông báo</Text>
            <View style={styles.notificationHeaderActions}>
              <Pressable
                accessibilityLabel="Xem lời mời kết bạn"
                onPress={() => {
                  setIsNotificationsVisible(false);
                  router.push('/friend-requests');
                }}
                style={styles.friendRequestsLink}>
                <Ionicons color={Design.colors.primaryGreen} name="people-outline" size={18} />
                <Text style={styles.friendRequestsLinkText}>Lời mời</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
                disabled={unreadNotificationCount === 0}
                onPress={() => void markAllNotificationsAsRead()}
                style={styles.markAllLink}>
                <Text style={styles.markAllLinkText}>Đã đọc hết</Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Đóng thông báo"
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => void toggleNotifications()}
                style={styles.notificationCloseButton}>
                <Ionicons color={Design.colors.black} name="close" size={24} />
              </Pressable>
            </View>
          </View>
          {notificationError ? <Text style={styles.notificationError}>{notificationError}</Text> : null}
          {notifications.length === 0 ? (
            <Text style={styles.emptyNotifications}>Đang chờ thông báo mới...</Text>
          ) : (
            <ScrollView>
              {notifications.map((notification, index) => (
                <Pressable
                  key={getNotificationKey(notification)}
                  accessibilityRole="button"
                  onPress={() => void markNotificationAsRead(notification)}
                  style={styles.notificationItem}>
                  <Ionicons color={Design.colors.primaryGreen} name="notifications-outline" size={20} />
                  <Text style={[styles.notificationText, notification.read === false && styles.unreadNotificationText]}>
                    {getNotificationMessage(notification)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      <View style={styles.bottomBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cửa hàng"
          onPress={() => setIsShopVisible(true)}
          style={({ pressed }) => [styles.roundButton, pressed && { transform: [{ scale: 0.93 }] }]}>
          <Ionicons color={Design.colors.white} name="storefront-outline" size={22} />
        </Pressable>

        <AnimatedTogglePill
          activeTab="tasks"
          isNight={isNight}
          onSelectCinema={() => router.push('/cinema')}
          onSelectTasks={() => router.push('/daily-tasks')}
          style={styles.togglePill}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cộng đồng"
          onPress={() => router.push('/community')}
          style={({ pressed }) => [styles.roundButton, styles.roundButtonOutline, pressed && { transform: [{ scale: 0.93 }] }]}>
          <Ionicons color={Design.colors.black} name="globe-outline" size={22} />
        </Pressable>
      </View>

      <ShopSheet
        balance={rubyBalance}
        onBalanceChange={handleWalletBalanceChange}
        onInsufficientRuby={handleInsufficientRuby}
        onClose={() => setIsShopVisible(false)}
        onPurchaseSuccess={handleShopPurchaseSuccess}
        visible={isShopVisible}
      />
      <PurchaseSuccessModal
        balance={rubyBalance ?? 0}
        onClose={() => setPurchasedShopItem(null)}
        product={purchasedShopItem}
      />
      <InsufficientRubyModal
        balance={rubyBalance}
        message={insufficientRubyMessage}
        onClose={() => setInsufficientRubyItem(null)}
        onTopUp={() => {
          setInsufficientRubyItem(null);
          router.push('/ruby-topup');
        }}
        product={insufficientRubyItem}
        visible={insufficientRubyItem !== null}
      />

      <DailyTaskModals
        completedStreak={null}
        dailyStatusVisible={isDailyStatusVisible}
        isConfirmingDailyTasks={isConfirmingDailyTasks}
        isSwapping={false}
        isSwapLoading={false}
        onCancelStreak={() => undefined}
        onCloseDailyStatus={() => setIsDailyStatusVisible(false)}
        onCloseSwap={() => undefined}
        onCloseSwapSuccess={() => undefined}
        onConfirmSwap={() => undefined}
        onKeepYesterdayTasks={handleKeepYesterdayTasks}
        onOpenMoodSelection={handleChooseNewTasks}
        streakVisible={false}
        swapCandidates={[]}
        swapTask={null}
        swapSuccessVisible={false}
        yesterdayTasks={dailyStatus?.yesterdayTasks ?? []}
      />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 4,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContainer: {
    gap: 4,
  },
  headerStatsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scrollContentImmersive: {
    justifyContent: 'space-between',
    paddingBottom: 32,
  },
  iconHeaderButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    width: 36,
  },
  iconHeaderButtonNight: {
    backgroundColor: 'rgba(30, 41, 59, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    elevation: 3,
    shadowOpacity: 0.25,
  },
  immersiveButtonActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#4ADE80',
  },
  immersiveButtonActiveNight: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8',
  },
  immersiveHintPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderColor: '#86EFAC',
    borderRadius: 20,
    borderWidth: 1,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  immersiveHintPillNight: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    shadowOpacity: 0.35,
  },
  immersiveHintText: {
    color: '#15803D',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
  },
  immersiveHintTextNight: {
    color: '#BAE6FD',
  },
  mascotCardImmersive: {
    marginTop: 36,
    marginBottom: 16,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 18,
    borderWidth: 1,
    elevation: 2,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    width: 36,
  },
  notificationButtonNight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  notificationBadge: {
    backgroundColor: '#E34D59',
    borderColor: Design.colors.white,
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    position: 'absolute',
    right: 5,
    top: 4,
    width: 10,
  },
  greeting: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.h2 - 2,
    color: '#0F291E',
    marginBottom: 4,
    flexShrink: 1,
  },
  greetingNight: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'transparent',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  statIcon: {
    height: 22,
    width: 22,
  },
  statValue: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
  },
  streakValue: {
    color: '#EA580C',
  },
  streakValueNight: {
    color: '#FB923C',
  },
  rubyValue: {
    color: '#E11D48',
  },
  rubyValueNight: {
    color: '#FB7185',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3D9C6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarNight: {
    borderColor: 'rgba(255, 255, 255, 0.65)',
  },
  avatarText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
  },
  avatarTextNight: {
    color: Design.colors.black,
  },
  mascotCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  mascot: {
    width: 290,
    height: 300,
  },
  mascotShadow: {
    width: 175,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(15, 60, 30, 0.2)',
    alignSelf: 'center',
    marginTop: -14,
  },
  mascotShadowNight: {
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  bottomCardSection: {
    width: '100%',
    marginBottom: 4,
  },
  wardrobeIconButton: {
    alignSelf: 'flex-end',
    marginBottom: 6,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderWidth: 1,
    borderColor: '#D6E8D3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  wardrobeIconButtonNight: {
    backgroundColor: 'rgba(26, 36, 54, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0.25,
  },
  routineCard: {
    borderWidth: 1,
    borderColor: '#E9E9E9',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 14,
    backgroundColor: Design.colors.white,
  },
  routineLabel: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    color: Design.colors.mutedText,
    marginBottom: 4,
  },
  routineValue: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.h2,
    color: Design.colors.black,
  },
  routineValueMuted: {
    color: Design.colors.mutedText,
    fontSize: Design.fontSize.title,
  },
  weekCard: {
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  executeButton: {
    alignSelf: 'flex-start',
    backgroundColor: Design.colors.white,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 14,
  },
  executeButtonText: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  weekEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  weekTextWrap: {
    flex: 1,
  },
  weekTitle: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body - 2,
    color: Design.colors.white,
  },
  weekSubtitle: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    color: Design.colors.white,
    opacity: 0.85,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#F2B544',
  },
  progressPercent: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    color: Design.colors.white,
    alignSelf: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  notificationModal: {
    backgroundColor: Design.colors.white,
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
  },
  notificationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 14,
  },
  notificationHeaderActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  friendRequestsLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  friendRequestsLinkText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  markAllLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markAllLinkText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  notificationCloseButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notificationTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
  },
  notificationError: {
    color: '#B33A3A',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginVertical: 12,
  },
  emptyNotifications: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    paddingVertical: 24,
    textAlign: 'center',
  },
  notificationItem: {
    alignItems: 'center',
    borderBottomColor: '#E9E9E9',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  notificationText: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  unreadNotificationText: {
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  dailyStatusModal: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    backgroundColor: Design.colors.white,
  },
  modalTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    marginBottom: 6,
  },
  modalSubtitle: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginBottom: 16,
  },
  yesterdayTaskList: {
    marginBottom: 16,
  },
  yesterdayTaskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    paddingVertical: 12,
  },
  yesterdayTaskText: {
    flex: 1,
    marginLeft: 10,
  },
  yesterdayTaskTitle: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body + 1,
    lineHeight: 23,
  },
  yesterdayTaskContent: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 4,
  },
  modalActions: {
    gap: 10,
  },
  primaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: Design.colors.primaryGreen,
    paddingHorizontal: 16,
  },
  primaryActionText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  secondaryAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Design.colors.primaryGreen,
    paddingHorizontal: 16,
  },
  secondaryActionText: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  roundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundButtonOutline: {
    backgroundColor: Design.colors.white,
    borderWidth: 1,
    borderColor: Design.colors.black,
  },
  togglePill: {
    flex: 1,
    marginHorizontal: 12,
  },
  toggleOption: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleDivider: {
    width: 1,
    height: '55%',
    backgroundColor: Design.colors.optionBorder,
  },
  toggleText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    color: Design.colors.black,
  },
});
