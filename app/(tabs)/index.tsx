import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DayNightBackground from '@/src/components/home/day-night-background';
import {
  InsufficientRubyModal,
  PurchaseSuccessModal,
} from '@/src/components/home/purchase-success-modal';
import { ShopSheet } from '@/src/components/home/shop-sheet';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { useOnboarding } from '@/src/context/onboarding-context';
import { HomeAvatarStage } from '@/src/features/home/components/home-avatar-stage';
import { HomeBottomNavigation } from '@/src/features/home/components/home-bottom-navigation';
import { HomeHeader } from '@/src/features/home/components/home-header';
import { HomeNotificationsModal } from '@/src/features/home/components/home-notifications-modal';
import { HomeRoutineSection } from '@/src/features/home/components/home-routine-section';
import { useHomeAvatar } from '@/src/features/home/hooks/use-home-avatar';
import { useHomeDailyTasks } from '@/src/features/home/hooks/use-home-daily-tasks';
import { useHomeDashboard } from '@/src/features/home/hooks/use-home-dashboard';
import { useHomeNotifications } from '@/src/features/home/hooks/use-home-notifications';
import { styles } from '@/src/features/home/home.styles';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import type { ShopItem } from '@/src/types/api/shop';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const { mode: themeMode, isNight, toggleDayNight, cycleMode } = useDayNightTheme();
  const avatarLayers = useHomeAvatar();
  const {
    profileName,
    currentGoalId,
    currentStreak,
    rubyBalance,
    isRubyBalanceLoading,
    setRubyBalance,
  } = useHomeDashboard();
  const {
    dailyStatus,
    isDailyStatusVisible,
    isConfirmingDailyTasks,
    setIsDailyStatusVisible,
    handleChooseNewTasks,
    handleKeepYesterdayTasks,
  } = useHomeDailyTasks(currentGoalId);
  const {
    isNotificationsVisible,
    setIsNotificationsVisible,
    notifications,
    notificationError,
    unreadNotificationCount,
    toggleNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useHomeNotifications();

  const [isImmersiveView, setIsImmersiveView] = useState(false);
  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedShopItem, setPurchasedShopItem] = useState<ShopItem | null>(null);
  const [insufficientRubyItem, setInsufficientRubyItem] = useState<ShopItem | null>(null);
  const [insufficientRubyMessage, setInsufficientRubyMessage] = useState('');
  const displayName = profileName.trim() || data.name.trim() || 'bạn';

  const handleShopPurchaseSuccess = (item: ShopItem, remainingRuby: number) => {
    setRubyBalance(remainingRuby);
    setPurchasedShopItem(item);
    setIsShopVisible(false);
  };

  const handleInsufficientRuby = (item: ShopItem, message: string) => {
    setInsufficientRubyMessage(message);
    setInsufficientRubyItem(item);
    setIsShopVisible(false);
  };

  return (
    <View style={[styles.rootContainer, { backgroundColor: isNight ? '#0B132B' : '#68B6F2' }]}>
      <DayNightBackground isNight={isNight} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isImmersiveView && styles.scrollContentImmersive,
          ]}
          showsVerticalScrollIndicator={false}>
          <HomeHeader
            currentStreak={currentStreak}
            displayName={displayName}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            isRubyBalanceLoading={isRubyBalanceLoading}
            onCycleTheme={cycleMode}
            onOpenSettings={() => router.push('/settings' as any)}
            onToggleImmersive={() => setIsImmersiveView((previous) => !previous)}
            onToggleNotifications={() => void toggleNotifications()}
            onToggleTheme={toggleDayNight}
            rubyBalance={rubyBalance}
            themeMode={themeMode}
            unreadNotificationCount={unreadNotificationCount}
          />
          <HomeAvatarStage
            avatarLayers={avatarLayers}
            isImmersiveView={isImmersiveView}
          />
          <HomeRoutineSection
            goalId={currentGoalId}
            isImmersiveView={isImmersiveView}
            isNight={isNight}
            onExitImmersive={() => setIsImmersiveView(false)}
          />
        </ScrollView>

        <HomeNotificationsModal
          error={notificationError}
          notifications={notifications}
          onClose={() => setIsNotificationsVisible(false)}
          onMarkAllAsRead={() => void markAllNotificationsAsRead()}
          onMarkAsRead={(notification) => void markNotificationAsRead(notification)}
          onOpenFriendRequests={() => {
            setIsNotificationsVisible(false);
            router.push('/friend-requests');
          }}
          unreadCount={unreadNotificationCount}
          visible={isNotificationsVisible}
        />

        <HomeBottomNavigation
          isNight={isNight}
          onOpenShop={() => setIsShopVisible(true)}
        />

        <ShopSheet
          balance={rubyBalance}
          onBalanceChange={setRubyBalance}
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
