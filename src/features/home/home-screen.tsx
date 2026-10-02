import DayNightBackground from '@/src/components/home/day-night-background';
import { useOnboarding } from '@/src/context/onboarding-context';
import { HomeBottomBar } from '@/src/features/home/components/home-bottom-bar';
import { HomeHeader } from '@/src/features/home/components/home-header';
import { HomeSceneContent } from '@/src/features/home/components/home-scene-content';
import { HomeShopAndTaskModals } from '@/src/features/home/components/home-shop-and-task-modals';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { authService } from '@/src/services/authService';
import { onboardingService } from '@/src/services/onboardingService';
import { shopService } from '@/src/services/shopService';
import { skinService } from '@/src/services/skinService';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { taskService } from '@/src/services/taskService';
import type { ShopItem } from '@/src/types/api/shop';
import type { AvatarLayer } from '@/src/types/api/skin';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { HomeNotificationsModal } from '@/src/features/home/components/home-notifications-modal';
import { getNotificationKey } from '@/src/features/home/utils/home-notifications';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Vibration, View } from 'react-native';
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
          <HomeHeader
            currentStreak={currentStreak}
            displayName={displayName}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            isRubyBalanceLoading={isRubyBalanceLoading}
            onCycleTheme={cycleMode}
            onOpenRubyTopup={() => router.push('/ruby-topup' as any)}
            onOpenSettings={() => router.push('/settings' as any)}
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
            onOpenWardrobe={() => router.push('/wardrobe' as any)}
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

        <HomeBottomBar
          isNight={isNight}
          onOpenCinema={() => router.push('/cinema')}
          onOpenCommunity={() => router.push('/community')}
          onOpenShop={() => setIsShopVisible(true)}
          onOpenTasks={() => router.push('/daily-tasks')}
          toggleKey={toggleKey}
        />

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
      </SafeAreaView>
    </View>
  );
}
