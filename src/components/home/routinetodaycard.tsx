import { Design, FontFamily } from '@/src/constants/design';
import { useDayNightTheme } from '@/src/hooks/use-day-night-theme';
import { taskService } from '@/src/services/taskService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type RoutineTodayCardProps = {
  goalId: number | null;
  message?: string;
  isNight?: boolean;
  onPress?: () => void;
};

export default function RoutineTodayCard({
  goalId,
  message,
  isNight: isNightProp,
  onPress,
}: RoutineTodayCardProps) {
  const theme = useDayNightTheme();
  const isNight = isNightProp ?? theme.isNight;

  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!goalId) return;

    let isMounted = true;

    taskService
      .getDailyTaskStatus(goalId)
      .then((response) => {
        if (!isMounted) return;
        const tasks = response.dailyTaskStatus?.todayTasks ?? [];
        setTotal(tasks.length);
        setCompleted(tasks.filter((task) => task.isCompleted).length);
      })
      .catch(() => {
        if (!isMounted) return;
        setTotal(0);
        setCompleted(0);
      });

    return () => {
      isMounted = false;
    };
  }, [goalId]);

  const ratio = total > 0 ? Math.min(1, Math.max(0, completed / total)) : 0;
  const percentage = Math.round(ratio * 100);
  const isAllDone = total > 0 && completed === total;

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 650 });
  }, [ratio, progress]);

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/daily-tasks');
    }
  };

  // Thông điệp tạo động lực theo trạng thái thực tế
  // const getMotivationalMessage = () => {
  //   if (message) return message;
  //   if (total === 0) return 'Khám phá các nhiệm vụ hôm nay';
  //   if (isAllDone) return 'Tuyệt vời! Bạn đã hoàn thành toàn bộ mục tiêu 🎉';
  //   if (completed === 0) return 'Bắt đầu nhiệm vụ đầu tiên thôi nào! ✨';
  //   const remaining = total - completed;
  //   return `Chỉ còn ${remaining} nhiệm vụ nữa để hoàn thành ngày! 💪`;
  // };

  return (
    <Pressable
      accessibilityLabel={`Routine hôm nay: ${completed} trên ${total} nhiệm vụ hoàn thành. Chạm để xem chi tiết`}
      accessibilityRole="button"
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        isNight && styles.cardNight,
        pressed && styles.cardPressed,
      ]}>
      {/* Hàng tiêu đề: Badge Routine + Tỉ lệ % & mũi tên */}
      <View style={styles.headerRow}>
        <View style={[styles.badge, isNight && styles.badgeNight]}>
          <Text style={styles.badgeEmoji}>🌱</Text>
          <Text style={[styles.badgeText, isNight && styles.badgeTextNight]}>
            Routine hôm nay
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View
            style={[
              styles.percentPill,
              isNight && styles.percentPillNight,
              isAllDone && (isNight ? styles.percentPillDoneNight : styles.percentPillDone),
            ]}>
            {isAllDone && <Ionicons color={isNight ? '#FDE047' : '#D97706'} name="sparkles" size={12} />}
            <Text
              style={[
                styles.percentText,
                isNight && styles.percentTextNight,
                isAllDone && (isNight ? styles.percentTextDoneNight : styles.percentTextDone),
              ]}>
              {isAllDone ? '100% Hoàn thành' : `${percentage}%`}
            </Text>
          </View>
          <Ionicons
            color={isNight ? '#94A3B8' : '#9CA3AF'}
            name="chevron-forward"
            size={18}
          />
        </View>
      </View>

      {/* Số lượng nhiệm vụ hoàn thành */}
      <View style={styles.statsRow}>
        <View style={styles.counterGroup}>
          <Text style={[styles.completedNumber, isNight && styles.completedNumberNight]}>
            {completed}
          </Text>
          <Text style={[styles.slash, isNight && styles.slashNight]}>/</Text>
          <Text style={[styles.totalNumber, isNight && styles.totalNumberNight]}>
            {total}
          </Text>
          <Text style={[styles.taskUnit, isNight && styles.taskUnitNight]}>
            Task
          </Text>
        </View>

        {total > 0 && (
          <View style={[styles.statusTag, isNight && styles.statusTagNight]}>
            <View
              style={[
                styles.statusDot,
                isAllDone
                  ? styles.statusDotDone
                  : completed > 0
                    ? styles.statusDotProgress
                    : styles.statusDotStart,
              ]}
            />
            <Text style={[styles.statusTagText, isNight && styles.statusTagTextNight]}>
              {isAllDone ? 'Đã hoàn thành' : completed > 0 ? 'Đang tiến hành' : 'Chưa bắt đầu'}
            </Text>
          </View>
        )}
      </View>

      {/* Thanh tiến độ rực rỡ sắc màu */}
      <View style={[styles.progressTrack, isNight && styles.progressTrackNight]}>
        <Animated.View
          style={[
            styles.progressFill,
            isNight && styles.progressFillNight,
            isAllDone && styles.progressFillDone,
            animatedProgressStyle,
          ]}
        />
      </View>

      {/* Thông điệp động lực */}
      <View style={styles.footerRow}>
        <Ionicons
          color={isAllDone ? '#F59E0B' : isNight ? '#34D399' : Design.colors.primaryGreen}
          name={isAllDone ? 'ribbon-outline' : 'bulb-outline'}
          size={14}
        />
        {/* <Text
          numberOfLines={1}
          style={[
            styles.messageText,
            isNight && styles.messageTextNight,
            isAllDone && (isNight ? styles.messageTextDoneNight : styles.messageTextDone),
          ]}>
          {getMotivationalMessage()}
        </Text> */}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#D1FAE5',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    shadowColor: '#059669',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardNight: {
    backgroundColor: 'rgba(20, 30, 50, 0.92)',
    borderColor: 'rgba(52, 211, 153, 0.28)',
    shadowColor: '#34D399',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 5,
  },
  badgeNight: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  badgeEmoji: {
    fontSize: 13,
  },
  badgeText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 12,
    color: '#065F46',
  },
  badgeTextNight: {
    color: '#6EE7B7',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  percentPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  percentPillNight: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  percentPillDone: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  percentPillDoneNight: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  percentText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 11,
    color: '#15803D',
  },
  percentTextNight: {
    color: '#86EFAC',
  },
  percentTextDone: {
    color: '#B45309',
  },
  percentTextDoneNight: {
    color: '#FDE047',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  completedNumber: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 28,
    color: '#10B981',
    lineHeight: 34,
  },
  completedNumberNight: {
    color: '#34D399',
  },
  slash: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 20,
    color: '#CBD5E1',
    marginHorizontal: 3,
  },
  slashNight: {
    color: '#475569',
  },
  totalNumber: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 22,
    color: '#1E293B',
  },
  totalNumberNight: {
    color: '#F1F5F9',
  },
  taskUnit: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
    color: '#64748B',
    marginLeft: 4,
  },
  taskUnitNight: {
    color: '#94A3B8',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusTagNight: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotStart: {
    backgroundColor: '#94A3B8',
  },
  statusDotProgress: {
    backgroundColor: '#3B82F6',
  },
  statusDotDone: {
    backgroundColor: '#10B981',
  },
  statusTagText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 11,
    color: '#64748B',
  },
  statusTagTextNight: {
    color: '#CBD5E1',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressTrackNight: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  progressFillNight: {
    backgroundColor: '#34D399',
  },
  progressFillDone: {
    backgroundColor: '#059669',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  messageText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
    color: '#475569',
    flex: 1,
  },
  messageTextNight: {
    color: '#94A3B8',
  },
  messageTextDone: {
    color: '#047857',
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  messageTextDoneNight: {
    color: '#6EE7B7',
    fontFamily: FontFamily.beVietnamSemiBold,
  },
});