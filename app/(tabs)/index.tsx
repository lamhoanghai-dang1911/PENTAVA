import { PurchaseSuccessModal } from '@/src/components/home/purchase-success-modal';
import RoutineTodayCard from '@/src/components/home/routinetodaycard';
import { ShopSheet, type ShopProduct } from '@/src/components/home/shop-sheet';
import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import { authService } from '@/src/services/authService';
import { socialService, type SocialNotification } from '@/src/services/socialService';
import { onboardingService } from '@/src/services/onboardingService';
import { taskService } from '@/src/services/taskService';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View, Vibration } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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
  const [profileName, setProfileName] = useState('');
  const displayName = profileName.trim() || data.name.trim() || 'bạn';
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);
  const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
  const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
  const [isDailyStatusLoading, setIsDailyStatusLoading] = useState(false);
  const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);

  const [strawberries, setStrawberries] = useState(15);

  const [isShopVisible, setIsShopVisible] = useState(false);
  const [purchasedProduct, setPurchasedProduct] = useState<ShopProduct | null>(null);
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
          .catch(() => {});
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
          setCurrentGoal(goalResponse.currentGoal?.goalName ?? null);
          setCurrentGoalId(goalResponse.currentGoal?.goalId ?? null);
          setCurrentStreak(streakResponse.streak?.currentStreak ?? 0);
          setLongestStreak(streakResponse.streak?.longestStreak ?? 0);
        }
      })
      .catch((error: Error) => {
        if (isMounted) {
          Alert.alert('Không thể tải mục tiêu', error.message);
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

  const handleBuy = (product: ShopProduct) => {
    if (product.price > strawberries) {
      Alert.alert('Không đủ số dư', 'Bạn chưa đủ 🍓 để mua vật phẩm này.');
      return;
    }
    setStrawberries((prev) => prev - product.price);
    setPurchasedProduct(product);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Chào {displayName}</Text>
            <View style={styles.streakCard}>
              <View style={styles.streakIconWrap}>
                <Animated.View style={animatedFlameStyle}>
                  <Ionicons color="#F26A3D" name="flame" size={20} />
                </Animated.View>
              </View>
              <View style={styles.streakTextWrap}>
                <Text style={styles.streakLabel}>Chuỗi hiện tại</Text>
                <Text style={styles.streakValue}>{currentStreak} ngày</Text>
              </View>
              <View style={styles.streakDivider} />
              <View>
                <Text style={styles.streakLabel}>Kỷ lục</Text>
                <Text style={styles.streakBest}>{longestStreak} ngày</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable accessibilityLabel="Thông báo" onPress={() => void toggleNotifications()} style={styles.notificationButton}>
              <Ionicons color={Design.colors.black} name="notifications-outline" size={24} />
              {unreadNotificationCount > 0 ? <View style={styles.notificationBadge} /> : null}
            </Pressable>
            <Pressable onPress={() => router.push('/settings' as any)} style={styles.avatar}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.mascotCard}>
          <Animated.View style={animatedMascotStyle}>
            <Image
              contentFit="contain"
              source={require('@/assets/images/onboarding/cat-loading.png')}
              style={styles.mascot}
            />
          </Animated.View>
        </View>

        <RoutineTodayCard goalId={currentGoalId} />

        <View style={styles.weekCard}>

          <View style={styles.weekHeader}>
            <Text style={styles.weekEmoji}>🌙</Text>
            <View style={styles.weekTextWrap}>
              <Text style={styles.weekTitle}>{currentGoal ?? 'Đang tải mục tiêu...'}</Text>
            </View>
          </View>

        </View>
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

        <View style={styles.togglePill}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/daily-tasks')}
            style={({ pressed }) => [styles.toggleOption, pressed && { opacity: 0.75 }]}>
            <Text style={styles.toggleText}>Nhiệm vụ ngày</Text>
          </Pressable>
          <View style={styles.toggleDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cinema')}
            style={({ pressed }) => [styles.toggleOption, pressed && { opacity: 0.75 }]}>
            <Text style={styles.toggleText}>PENTA-CINEMA</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cộng đồng"
          onPress={() => router.push('/community')}
          style={({ pressed }) => [styles.roundButton, styles.roundButtonOutline, pressed && { transform: [{ scale: 0.93 }] }]}>
          <Ionicons color={Design.colors.black} name="globe-outline" size={22} />
        </Pressable>
      </View>

      <ShopSheet
        balance={strawberries}
        onBuy={handleBuy}
        onClose={() => setIsShopVisible(false)}
        purchasedProduct={purchasedProduct}
        onCloseSuccess={() => setPurchasedProduct(null)}
        visible={isShopVisible}
      />

      <PurchaseSuccessModal
        balance={strawberries}
        onClose={() => setPurchasedProduct(null)}
        product={purchasedProduct}
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Design.colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16, // hoặc dùng marginBottom riêng cho từng View
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    position: 'relative',
    width: 40,
  },
  notificationBadge: {
    backgroundColor: '#E34D59',
    borderColor: Design.colors.white,
    borderRadius: 5,
    borderWidth: 1,
    height: 10,
    position: 'absolute',
    right: 6,
    top: 5,
    width: 10,
  },
  greeting: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.h2 - 2,
    color: Design.colors.black,
    marginBottom: 8,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F5D8CE',
    paddingHorizontal: 9,
    paddingVertical: 7,
    backgroundColor: '#FFF7F3',
  },
  streakIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE1D5',
  },
  streakTextWrap: {
    marginLeft: 8,
    marginRight: 10,
  },
  streakLabel: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 9,
    color: '#9B6A5B',
  },
  streakValue: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 14,
    color: '#D9552D',
  },
  streakDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F0CFC4',
    marginRight: 10,
  },
  streakBest: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 14,
    color: Design.colors.black,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F3D9C6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    color: Design.colors.black,
  },
  mascotCard: {
    alignItems: 'center',
    marginVertical: 24,
  },
  mascot: {
    width: 330,
    height: 340,
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
    paddingVertical: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Design.colors.optionBorder,
    backgroundColor: Design.colors.white,
    overflow: 'hidden',
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
