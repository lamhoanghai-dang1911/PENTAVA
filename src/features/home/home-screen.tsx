import DayNightBackground from '@/src/components/home/day-night-background';
import { useOnboarding } from '@/src/context/onboarding-context';
import { HomeBottomBar } from '@/src/features/home/components/home-bottom-bar';
import { HomeHeader } from '@/src/features/home/components/home-header';
import { HomeNotificationsModal } from '@/src/features/home/components/home-notifications-modal';
import { HomeSceneContent } from '@/src/features/home/components/home-scene-content';
import { HomeShopAndTaskModals } from '@/src/features/home/components/home-shop-and-task-modals';
import { StreakFreezeModal } from '@/src/features/home/components/streak-freeze-modal';
import { getNotificationKey } from '@/src/features/home/utils/home-notifications';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { authService } from '@/src/services/authService';
import { getCurrentUserId } from '@/src/services/authStorage';
import { onboardingService } from '@/src/services/onboardingService';
import { shopService } from '@/src/services/shopService';
import { skinService } from '@/src/services/skinService';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { cacheDailyStatus, getCachedDailyStatus } from '@/src/services/taskCacheStorage';
import { taskService } from '@/src/services/taskService';
import type { CurrentGoal, CurrentStreak } from '@/src/types/api/onboarding';
import type { ShopItem } from '@/src/types/api/shop';
import type { AvatarLayer } from '@/src/types/api/skin';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './home-screen.styles';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const { mode: themeMode, isNight, toggleDayNight, cycleMode } = useDayNightTheme();
  const [isImmersiveView, setIsImmersiveView] = useState(false);
  const [profileName, setProfileName] = useState('');
  const displayName = profileName.trim() || data.name.trim() || 'bạn';
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [currentGoal, setCurrentGoal] = useState<CurrentGoal | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakData, setStreakData] = useState<CurrentStreak | null>(null);
  const [isStreakFreezeVisible, setIsStreakFreezeVisible] = useState(false);
  const [rubyBalance, setRubyBalance] = useState<number | null>(null);
  const [isRubyBalanceLoading, setIsRubyBalanceLoading] = useState(true);
  const [avatarLayers, setAvatarLayers] = useState<AvatarLayer[] | null>(null);
  const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
  const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
  const [, setIsDailyStatusLoading] = useState(false);
  const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);
  const [isNoGoalModalVisible, setIsNoGoalModalVisible] = useState(false);

  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedShopItem, setPurchasedShopItem] = useState<ShopItem | null>(null);
  const [insufficientRubyItem, setInsufficientRubyItem] = useState<ShopItem | null>(null);
  const [insufficientRubyMessage, setInsufficientRubyMessage] = useState('');
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isLoadingNotificationsRef = useRef(false);
  const hasShownStreakFrozenAlertRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const [toggleKey, setToggleKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setToggleKey((prev) => prev + 1);
      let isFocused = true;
      const now = Date.now();
      // Không gọi lại dồn dập 4 API nếu vừa mới focus trong vòng 15 giây
      if (now - lastFetchTimeRef.current < 15000 && lastFetchTimeRef.current > 0) {
        return;
      }
      lastFetchTimeRef.current = now;

      // Gộp các API chính vào 1 luồng song song duy nhất (Goal, Streak, Avatar, Wallet)
      void Promise.allSettled([
        onboardingService.getCurrentGoal(),
        onboardingService.getCurrentStreak(),
        skinService.getMyAvatar(),
        shopService.getMyWallet(),
      ]).then(([goalRes, streakRes, avatarRes, walletRes]) => {
        if (!isFocused) return;

        if (goalRes.status === 'fulfilled' && goalRes.value) {
          setCurrentGoalId(goalRes.value.currentGoal?.goalId ?? null);
          setCurrentGoal(goalRes.value.currentGoal ?? null);
        }

        if (streakRes.status === 'fulfilled' && streakRes.value?.streak) {
          const streak = streakRes.value.streak;
          setCurrentStreak(streak.currentStreak ?? 0);
          setStreakData(streak);
          if (streak.streakFrozenYesterday && !hasShownStreakFrozenAlertRef.current) {
            hasShownStreakFrozenAlertRef.current = true;
            Alert.alert(
              'Khiên Bảo Vệ Đã Kích Hoạt ❄️',
              'Chuỗi Streak của bạn đã được đóng băng và bảo vệ thành công cho ngày hôm qua!',
            );
          }
        }

        if (avatarRes.status === 'fulfilled') {
          setAvatarLayers(avatarRes.value.layers ?? []);
        } else {
          setAvatarLayers(null);
        }

        if (walletRes.status === 'fulfilled' && walletRes.value) {
          setRubyBalance(walletRes.value.rubyBalance);
          setIsRubyBalanceLoading(false);
        }
      });

      return () => {
        isFocused = false;
      };
    }, []),
  );

  useEffect(() => {
    let isMounted = true;

    // 1. Tải tên hiển thị profile
    void authService
      .getProfile()
      .then((profile) => {
        if (isMounted && profile?.name) {
          setProfileName(profile.name);
        }
      })
      .catch(() => {
        // Fallback silently to onboarding name
      });

    // 2. Chuyển prefetch Shop sang chế độ Idle sau khi mở màn hình
    const idleTimer = setTimeout(() => {
      if (!isMounted) return;
      void shopService
        .getItems()
        .then((catalog) => {
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
        .catch(() => { });
    }, 1500);

    return () => {
      isMounted = false;
      clearTimeout(idleTimer);
    };
  }, []);

  const toggleNotifications = useCallback(async () => {
    const nextState = !isNotificationsVisible;
    setIsNotificationsVisible(nextState);
    if (!nextState) return;

    if (isLoadingNotificationsRef.current) return;
    isLoadingNotificationsRef.current = true;
    setNotificationError(null);

    try {
      const storedNotifications = await socialService.getNotifications();
      const unreadCount = storedNotifications.filter((item) => item.read === false).length;
      setUnreadNotificationCount(unreadCount);

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
  }, [isNotificationsVisible]);

  const markNotificationAsRead = useCallback(async (notification: SocialNotification) => {
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
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await socialService.markAllNotificationsAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
      setUnreadNotificationCount(0);
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Không thể đánh dấu tất cả thông báo đã đọc.');
    }
  }, []);

  const handleChooseNewTasks = useCallback(() => {
    if (!currentGoalId) return;
    setIsDailyStatusVisible(false);
    router.push({ pathname: '/mood', params: { goalId: String(currentGoalId) } } as any);
  }, [currentGoalId]);

  const handleExecuteGoal = useCallback(async () => {
    let goalId = currentGoalId;
    if (!goalId) {
      try {
        const goalResponse = await onboardingService.getCurrentGoal();
        goalId = goalResponse.currentGoal?.goalId ?? null;
        if (goalId) {
          setCurrentGoalId(goalId);
        }
      } catch {
        // ignore
      }
    }

    if (!goalId) {
      setIsNoGoalModalVisible(true);
      return;
    }

    // ⚡ Fast path 1: Nếu state đã có nhiệm vụ -> Chuyển màn hình ngay trong 0ms!
    if (dailyStatus?.hasConfirmedToday || (dailyStatus?.todayTasks && dailyStatus.todayTasks.length > 0)) {
      router.push('/daily-tasks');
      return;
    }

    // ⚡ Fast path 2: Kiểm tra nhanh cache local
    try {
      const userId = await getCurrentUserId();
      const cached = await getCachedDailyStatus(userId, goalId);
      if (cached && (cached.hasConfirmedToday || (cached.todayTasks && cached.todayTasks.length > 0))) {
        setDailyStatus(cached);
        router.push('/daily-tasks');
        return;
      }
    } catch {
      // ignore
    }

    setIsDailyStatusLoading(true);
    try {
      const userId = await getCurrentUserId();
      const response = await taskService.getDailyTaskStatus(goalId);
      const status = response.dailyTaskStatus;

      if (!status) {
        throw new Error(response.message || 'Không nhận được trạng thái nhiệm vụ trong ngày.');
      }

      setDailyStatus(status);
      await cacheDailyStatus(userId, goalId, status);

      // 1. Nếu hôm nay đã có dữ liệu / đã xác nhận nhiệm vụ -> Chuyển vào Daily Tasks
      if (status.hasConfirmedToday || (status.todayTasks && status.todayTasks.length > 0)) {
        router.push('/daily-tasks');
        return;
      }

      // 2. Nếu hôm nay chưa xác nhận nhiệm vụ:
      // Mục tiêu mới tạo hôm nay thì chắc chắn không có nhiệm vụ hôm qua
      const isGoalCreatedToday =
        currentGoal?.createdAt &&
        new Date(currentGoal.createdAt).toDateString() === new Date().toDateString();

      const hasValidYesterdayTasks =
        !isGoalCreatedToday &&
        Boolean(status.hasYesterdayTasks) &&
        Boolean(status.yesterdayTasks && status.yesterdayTasks.length === 5) &&
        status.yesterdayTasks.every((t) => !t.goalId || t.goalId === goalId);

      if (hasValidYesterdayTasks) {
        setIsDailyStatusVisible(true);
      } else {
        // Mục tiêu mới bắt đầu hoặc chưa có nhiệm vụ hôm qua -> Vào Mood để chọn cảm xúc & xem 5 task mới
        handleChooseNewTasks();
      }
    } catch (error) {
      // Fallback kiểm tra cache local nếu mất kết nối
      try {
        const userId = await getCurrentUserId();
        const cached = await getCachedDailyStatus(userId, goalId);
        if (cached) {
          setDailyStatus(cached);
          if (cached.hasConfirmedToday || (cached.todayTasks && cached.todayTasks.length > 0)) {
            router.push('/daily-tasks');
            return;
          }
          const isGoalCreatedToday =
            currentGoal?.createdAt &&
            new Date(currentGoal.createdAt).toDateString() === new Date().toDateString();
          const hasValidYesterdayTasks =
            !isGoalCreatedToday &&
            Boolean(cached.hasYesterdayTasks) &&
            Boolean(cached.yesterdayTasks && cached.yesterdayTasks.length === 5) &&
            cached.yesterdayTasks.every((t) => !t.goalId || t.goalId === goalId);

          if (hasValidYesterdayTasks) {
            setIsDailyStatusVisible(true);
            return;
          }
          handleChooseNewTasks();
          return;
        }
      } catch {
        // ignore fallback error
      }

      Alert.alert(
        'Không thể tải nhiệm vụ',
        error instanceof Error ? error.message : 'Đã có lỗi xảy ra.',
      );
    } finally {
      setIsDailyStatusLoading(false);
    }
  }, [currentGoal, currentGoalId, handleChooseNewTasks]);

  const handleKeepYesterdayTasks = useCallback(async () => {
    if (!currentGoalId || !dailyStatus?.yesterdayTasks.length) return;

    setIsConfirmingDailyTasks(true);
    try {
      await taskService.confirmDailyTasks({
        goalId: currentGoalId,
        selectedTaskIds: dailyStatus.yesterdayTasks.map((task) => task.id),
      });
      const userId = await getCurrentUserId();
      const updatedResponse = await taskService.getDailyTaskStatus(currentGoalId);
      if (updatedResponse.dailyTaskStatus) {
        setDailyStatus(updatedResponse.dailyTaskStatus);
        await cacheDailyStatus(userId, currentGoalId, updatedResponse.dailyTaskStatus);
      }
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
  }, [currentGoalId, dailyStatus?.yesterdayTasks]);

  const handleOpenRubyTopup = useCallback(() => {
    router.push('/ruby-topup' as any);
  }, []);

  const handleOpenSettings = useCallback(() => {
    router.push('/settings' as any);
  }, []);

  const handleOpenStreakFreeze = useCallback(() => {
    setIsStreakFreezeVisible(true);
  }, []);

  const handleCloseStreakFreeze = useCallback(() => {
    setIsStreakFreezeVisible(false);
  }, []);

  const handleToggleImmersiveView = useCallback(() => {
    setIsImmersiveView((prev) => !prev);
  }, []);

  const handleExitImmersiveView = useCallback(() => {
    setIsImmersiveView(false);
  }, []);

  const handleOpenCinema = useCallback(() => {
    router.push('/cinema');
  }, []);

  const handleOpenCustomRoadmap = useCallback(() => {
    router.push('/custom-roadmap' as any);
  }, []);

  const handleOpenCommunity = useCallback(() => {
    router.push('/community');
  }, []);

  const handleOpenWardrobe = useCallback(() => {
    router.push('/wardrobe' as any);
  }, []);

  const handleOpenShop = useCallback(() => {
    setIsShopVisible(true);
  }, []);

  const handleCloseShop = useCallback(() => {
    setIsShopVisible(false);
  }, []);

  const handleCloseDailyStatus = useCallback(() => {
    setIsDailyStatusVisible(false);
  }, []);

  const handleCloseInsufficientRuby = useCallback(() => {
    setInsufficientRubyItem(null);
  }, []);

  const handleClosePurchaseSuccess = useCallback(() => {
    setPurchasedShopItem(null);
  }, []);

  const handleTopUpRuby = useCallback(() => {
    setInsufficientRubyItem(null);
    router.push('/ruby-topup');
  }, []);

  const handleOpenFriendRequests = useCallback(() => {
    setIsNotificationsVisible(false);
    router.push('/friend-requests');
  }, []);

  const handleNoop = useCallback(() => {}, []);

  const handleWalletBalanceChange = useCallback((balance: number) => {
    setRubyBalance(balance);
  }, []);

  const handleShopPurchaseSuccess = useCallback((item: ShopItem, remainingRuby: number) => {
    setRubyBalance(remainingRuby);
    setPurchasedShopItem(item);
  }, []);

  const handleInsufficientRuby = useCallback((item: ShopItem, message: string) => {
    setInsufficientRubyMessage(message);
    setInsufficientRubyItem(item);
  }, []);

  return (
    <View style={[styles.rootContainer, { backgroundColor: isNight ? '#0B132B' : '#68B6F2' }]}>
      <DayNightBackground isNight={isNight} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.scrollContent, isImmersiveView && styles.scrollContentImmersive]}
          keyboardShouldPersistTaps="handled"
          overScrollMode="never"
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            currentStreak={currentStreak}
            displayName={displayName}
            freezesUsedThisMonth={streakData?.freezesUsedThisMonth}
            hasStreakProtection={Boolean(streakData?.hasStreakProtection)}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            isRubyBalanceLoading={isRubyBalanceLoading}
            maxFreezesPerMonth={
              streakData?.hasStreakProtection
                ? (streakData?.maxFreezesPerMonth ?? 2)
                : 0
            }
            onCycleTheme={cycleMode}
            onOpenRubyTopup={handleOpenRubyTopup}
            onOpenSettings={handleOpenSettings}
            onOpenStreakFreeze={handleOpenStreakFreeze}
            onToggleDayNight={toggleDayNight}
            onToggleImmersiveView={handleToggleImmersiveView}
            onToggleNotifications={toggleNotifications}
            rubyBalance={rubyBalance}
            themeMode={themeMode}
            unreadNotificationCount={unreadNotificationCount}
          />

          <HomeSceneContent
            avatarLayers={avatarLayers}
            currentGoalId={currentGoalId}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            onExitImmersiveView={handleExitImmersiveView}
            onOpenCinema={handleOpenCinema}
            onOpenCustomRoadmap={handleOpenCustomRoadmap}
            onOpenTasks={handleExecuteGoal}
            toggleKey={toggleKey}
          />
        </ScrollView>

        {isNotificationsVisible && (
          <HomeNotificationsModal
            isVisible={isNotificationsVisible}
            notificationError={notificationError}
            notifications={notifications}
            onMarkAllAsRead={markAllNotificationsAsRead}
            onMarkAsRead={markNotificationAsRead}
            onOpenFriendRequests={handleOpenFriendRequests}
            onToggle={toggleNotifications}
            unreadNotificationCount={unreadNotificationCount}
          />
        )}

        {!isImmersiveView && (
          <HomeBottomBar
            isNight={isNight}
            onOpenCommunity={handleOpenCommunity}
            onOpenHome={handleNoop}
            onOpenSettings={handleOpenSettings}
            onOpenShop={handleOpenShop}
            onOpenWardrobe={handleOpenWardrobe}
          />
        )}

        <HomeShopAndTaskModals
          insufficientRubyItem={insufficientRubyItem}
          insufficientRubyMessage={insufficientRubyMessage}
          isConfirmingDailyTasks={isConfirmingDailyTasks}
          isDailyStatusVisible={isDailyStatusVisible}
          isShopVisible={isShopVisible}
          onBalanceChange={handleWalletBalanceChange}
          onChooseNewTasks={handleChooseNewTasks}
          onCloseDailyStatus={handleCloseDailyStatus}
          onCloseInsufficientRuby={handleCloseInsufficientRuby}
          onClosePurchaseSuccess={handleClosePurchaseSuccess}
          onCloseShop={handleCloseShop}
          onInsufficientRuby={handleInsufficientRuby}
          onKeepYesterdayTasks={handleKeepYesterdayTasks}
          onPurchaseSuccess={handleShopPurchaseSuccess}
          onTopUpRuby={handleTopUpRuby}
          purchasedShopItem={purchasedShopItem}
          rubyBalance={rubyBalance}
          yesterdayTasks={dailyStatus?.yesterdayTasks ?? []}
        />

        {isStreakFreezeVisible && (
          <StreakFreezeModal
            freezesUsedThisMonth={streakData?.freezesUsedThisMonth ?? 0}
            hasStreakProtection={Boolean(streakData?.hasStreakProtection)}
            maxFreezesPerMonth={
              streakData?.hasStreakProtection
                ? (streakData?.maxFreezesPerMonth ?? 2)
                : 0
            }
            onClose={handleCloseStreakFreeze}
            streakFrozenYesterday={streakData?.streakFrozenYesterday}
            visible={isStreakFreezeVisible}
          />
        )}

        {/* Modal: Bạn Chưa Có Mục Tiêu Hiện Tại */}
        {isNoGoalModalVisible && (
          <Modal
            animationType="fade"
            onRequestClose={() => setIsNoGoalModalVisible(false)}
            transparent
            visible={isNoGoalModalVisible}
          >
            <Pressable style={styles.noGoalModalOverlay} onPress={() => setIsNoGoalModalVisible(false)}>
              <Pressable style={styles.noGoalModalCard} onPress={(e) => e.stopPropagation()}>
                <View style={styles.noGoalIconCircle}>
                  <Ionicons color="#3A8157" name="compass-outline" size={36} />
                </View>
                <Text style={styles.noGoalModalTitle}>Bạn Chưa Có Mục Tiêu Hiện Tại</Text>
                <Text style={styles.noGoalModalDesc}>
                  Hiện tại bạn chưa có mục tiêu rèn luyện nào đang thực hiện. Hãy chọn mục tiêu mới để cùng Luna bắt đầu rèn luyện mỗi ngày nhé!
                </Text>
                <Pressable
                  style={styles.noGoalConfirmBtn}
                  onPress={() => {
                    setIsNoGoalModalVisible(false);
                    router.push('/onboarding/goals');
                  }}
                >
                  <Text style={styles.noGoalConfirmBtnText}>Khảo Sát & Chọn Mục Tiêu</Text>
                </Pressable>
                <Pressable
                  style={styles.noGoalCancelBtn}
                  onPress={() => setIsNoGoalModalVisible(false)}
                >
                  <Text style={styles.noGoalCancelBtnText}>Để sau</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}