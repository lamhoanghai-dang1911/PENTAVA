import DayNightBackground from '@/src/components/home/day-night-background';
import { useOnboarding } from '@/src/context/onboarding-context';
import { HomeBottomBar } from '@/src/features/home/components/home-bottom-bar';
import { HomeHeader } from '@/src/features/home/components/home-header';
import { HomeSceneContent } from '@/src/features/home/components/home-scene-content';
import { HomeShopAndTaskModals } from '@/src/features/home/components/home-shop-and-task-modals';
import { StreakFreezeModal } from '@/src/features/home/components/streak-freeze-modal';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { authService } from '@/src/services/authService';
import { onboardingService } from '@/src/services/onboardingService';
import { shopService } from '@/src/services/shopService';
import { skinService } from '@/src/services/skinService';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { taskService } from '@/src/services/taskService';
import type { CurrentStreak } from '@/src/types/api/onboarding';
import type { ShopItem } from '@/src/types/api/shop';
import type { AvatarLayer } from '@/src/types/api/skin';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { HomeNotificationsModal } from '@/src/features/home/components/home-notifications-modal';
import { getNotificationKey } from '@/src/features/home/utils/home-notifications';
import { router, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './home-screen.styles';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const { mode: themeMode, isNight, toggleDayNight, cycleMode } = useDayNightTheme();
  const [isImmersiveView, setIsImmersiveView] = useState(false);
  const [profileName, setProfileName] = useState('');
  const displayName = profileName.trim() || data.name.trim() || 'bạn';
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
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

  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedShopItem, setPurchasedShopItem] = useState<ShopItem | null>(null);
  const [insufficientRubyItem, setInsufficientRubyItem] = useState<ShopItem | null>(null);
  const [insufficientRubyMessage, setInsufficientRubyMessage] = useState('');
  const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
  const [notifications, setNotifications] = useState<SocialNotification[]>([]);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const isLoadingNotificationsRef = useRef(false);

  const [toggleKey, setToggleKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isFocused = true;
      setToggleKey((prev) => prev + 1);

      void skinService
        .getMyAvatar()
        .then((avatar) => {
          if (isFocused) {
            setAvatarLayers(avatar.layers ?? []);
          }
        })
        .catch(() => {
          if (isFocused) {
            setAvatarLayers(null);
          }
        });

      return () => {
        isFocused = false;
      };
    }, []),
  );

  useEffect(() => {
    let isMounted = true;
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
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleNotifications = async () => {
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
          setStreakData(streakResponse.streak ?? null);
          if (streakResponse.streak?.streakFrozenYesterday) {
            Alert.alert(
              'Khiên Bảo Vệ Đã Kích Hoạt ❄️',
              'Chuỗi Streak của bạn đã được đóng băng và bảo vệ thành công cho ngày hôm qua!',
            );
          }
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

    // Background prefetch shop catalog & images so shop opens instantaneously
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
      .catch(() => {});

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
          contentContainerStyle={[styles.scrollContent, isImmersiveView && styles.scrollContentImmersive]}
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
            onOpenRubyTopup={() => router.push('/ruby-topup' as any)}
            onOpenSettings={() => router.push('/settings' as any)}
            onOpenStreakFreeze={() => setIsStreakFreezeVisible(true)}
            onToggleDayNight={toggleDayNight}
            onToggleImmersiveView={() => setIsImmersiveView((prev) => !prev)}
            onToggleNotifications={() => void toggleNotifications()}
            rubyBalance={rubyBalance}
            themeMode={themeMode}
            unreadNotificationCount={unreadNotificationCount}
          />

          <HomeSceneContent
            avatarLayers={avatarLayers}
            currentGoalId={currentGoalId}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            onExitImmersiveView={() => setIsImmersiveView(false)}
            onOpenCinema={() => router.push('/cinema')}
            onOpenCustomRoadmap={() => router.push('/custom-roadmap' as any)}
            onOpenTasks={handleExecuteGoal}
            toggleKey={toggleKey}
          />
        </ScrollView>

        <HomeNotificationsModal
          isVisible={isNotificationsVisible}
          notificationError={notificationError}
          notifications={notifications}
          onMarkAllAsRead={() => void markAllNotificationsAsRead()}
          onMarkAsRead={(notification) => void markNotificationAsRead(notification)}
          onOpenFriendRequests={() => {
            setIsNotificationsVisible(false);
            router.push('/friend-requests');
          }}
          onToggle={() => void toggleNotifications()}
          unreadNotificationCount={unreadNotificationCount}
        />

        {!isImmersiveView && (
          <HomeBottomBar
            isNight={isNight}
            onOpenCommunity={() => router.push('/community')}
            onOpenHome={() => {}}
            onOpenSettings={() => router.push('/settings' as any)}
            onOpenShop={() => setIsShopVisible(true)}
            onOpenWardrobe={() => router.push('/wardrobe' as any)}
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
          onCloseDailyStatus={() => setIsDailyStatusVisible(false)}
          onCloseInsufficientRuby={() => setInsufficientRubyItem(null)}
          onClosePurchaseSuccess={() => setPurchasedShopItem(null)}
          onCloseShop={() => setIsShopVisible(false)}
          onInsufficientRuby={handleInsufficientRuby}
          onKeepYesterdayTasks={handleKeepYesterdayTasks}
          onPurchaseSuccess={handleShopPurchaseSuccess}
          onTopUpRuby={() => {
            setInsufficientRubyItem(null);
            router.push('/ruby-topup');
          }}
          purchasedShopItem={purchasedShopItem}
          rubyBalance={rubyBalance}
          yesterdayTasks={dailyStatus?.yesterdayTasks ?? []}
        />

        <StreakFreezeModal
          freezesUsedThisMonth={streakData?.freezesUsedThisMonth ?? 0}
          hasStreakProtection={Boolean(streakData?.hasStreakProtection)}
          maxFreezesPerMonth={
            streakData?.hasStreakProtection
              ? (streakData?.maxFreezesPerMonth ?? 2)
              : 0
          }
          onClose={() => setIsStreakFreezeVisible(false)}
          streakFrozenYesterday={streakData?.streakFrozenYesterday}
          visible={isStreakFreezeVisible}
        />
      </SafeAreaView>
    </View>
  );
}