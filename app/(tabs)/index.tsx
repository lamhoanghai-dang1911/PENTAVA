import { PurchaseSuccessModal } from '@/src/components/home/purchase-success-modal';
import { ShopSheet, type ShopProduct } from '@/src/components/home/shop-sheet';
import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import { onboardingService } from '@/src/services/onboardingService';
import { taskService } from '@/src/services/taskService';
import type { DailyTaskStatus } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { data } = useOnboarding();
  const displayName = data.name.trim() || 'bạn';
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
                <Ionicons color="#F26A3D" name="flame" size={20} />
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
          <Pressable onPress={() => router.push('/settings' as any)} style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          </Pressable>
        </View>

        <View style={styles.mascotCard}>
          <Image
            contentFit="contain"
            source={require('@/assets/images/onboarding/cat-loading.png')}
            style={styles.mascot}
          />
        </View>

        <View style={styles.weekCard}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekEmoji}>🌙</Text>
            <View style={styles.weekTextWrap}>
              <Text style={styles.weekTitle}>{currentGoal ?? 'Đang tải mục tiêu...'}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            disabled={isDailyStatusLoading}
            onPress={handleExecuteGoal}
            style={styles.executeButton}>
            {isDailyStatusLoading ? (
              <ActivityIndicator color={Design.colors.black} />
            ) : (
              <Text style={styles.executeButtonText}>Thực thi</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cửa hàng"
          onPress={() => setIsShopVisible(true)}
          style={styles.roundButton}>
          <Ionicons color={Design.colors.white} name="storefront-outline" size={22} />
        </Pressable>

        <View style={styles.togglePill}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/daily-tasks')}
            style={styles.toggleOption}>
            <Text style={styles.toggleText}>Nhiệm vụ ngày</Text>
          </Pressable>
          <View style={styles.toggleDivider} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/cinema')}
            style={styles.toggleOption}>
            <Text style={styles.toggleText}>PENTA-CINEMA</Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ngôn ngữ"
          onPress={() => router.push('/community')}
          style={[styles.roundButton, styles.roundButtonOutline]}>
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
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    width: 230,
    height: 240,
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
