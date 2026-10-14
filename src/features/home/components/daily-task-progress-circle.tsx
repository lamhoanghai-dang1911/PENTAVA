import { CircularProgress } from '@/src/components/ui/circular-progress';
import { FontFamily } from '@/src/constants/design';
import { getCurrentUserId } from '@/src/services/authStorage';
import { getCachedDailyStatus } from '@/src/services/taskCacheStorage';
import { taskService } from '@/src/services/taskService';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { memo, useCallback, useState } from 'react';
import { Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type DailyTaskProgressCircleProps = {
  goalId: number | null;
  isNight?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const DailyTaskProgressCircle = memo(function DailyTaskProgressCircle({
  goalId,
  isNight = false,
  onPress,
  style,
}: DailyTaskProgressCircleProps) {
  const [percentage, setPercentage] = useState(0);

  const fetchStatus = useCallback(() => {
    if (!goalId) {
      setPercentage(0);
      return;
    }

    let isMounted = true;

    // SWR: Kiểm tra cache trước để hiện tiến độ ngay lập tức (0ms)
    void getCurrentUserId()
      .then((userId) => {
        if (!isMounted || !userId) return;
        return getCachedDailyStatus(userId, goalId);
      })
      .then((cached) => {
        if (!isMounted || !cached) return;
        const tasks = cached.todayTasks ?? [];
        const completed = tasks.filter((t) => t.isCompleted).length;
        const total = tasks.length > 0 ? tasks.length : 5;
        const computedPercent = Math.min(100, Math.round((completed / (total || 5)) * 100));
        setPercentage(computedPercent);
      })
      .catch(() => {});

    taskService
      .getDailyTaskStatus(goalId)
      .then((response) => {
        if (!isMounted) return;
        const tasks = response.dailyTaskStatus?.todayTasks ?? [];
        const completed = tasks.filter((t) => t.isCompleted).length;
        const total = tasks.length > 0 ? tasks.length : 5;
        // 5 task hoàn thành = 100%
        const computedPercent = Math.min(100, Math.round((completed / (total || 5)) * 100));
        setPercentage(computedPercent);
      })
      .catch(() => {
        if (!isMounted) return;
      });

    return () => {
      isMounted = false;
    };
  }, [goalId]);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [fetchStatus]),
  );

  const handlePress = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // ignore
    }
    onPress?.();
  };

  return (
    <Pressable
      accessibilityLabel={`Tiến độ nhiệm vụ hôm nay: ${percentage}%. Nhấn để xem danh sách nhiệm vụ`}
      accessibilityRole="button"
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        style,
        pressed && { transform: [{ scale: 0.94 }], opacity: 0.9 },
      ]}>
      <CircularProgress
        backgroundColor={isNight ? 'rgba(255, 255, 255, 0.22)' : 'rgba(173, 173, 173, 1)'}
        duration={650}
        fill={percentage}
        lineCap="round"
        rotation={0}
        size={84}
        tintColor={isNight ? '#FFFFFF' : '#9cffbcff'}
        width={7.5}>
        {() => (
          <View style={styles.centerTextRow}>
            <Text
              style={[
                styles.numberText,
                percentage >= 100 && styles.numberTextLarge,
                isNight && styles.numberTextNight,
              ]}>
              {percentage}
            </Text>
            <Text style={[styles.symbolText, isNight && styles.symbolTextNight]}>%</Text>
          </View>
        )}
      </CircularProgress>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  numberText: {
    color: '#000000',
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 24,
    lineHeight: 28,
  },
  numberTextLarge: {
    fontSize: 21,
    lineHeight: 25,
  },
  numberTextNight: {
    color: '#FFFFFF',
  },
  symbolText: {
    color: '#000000',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
    marginLeft: 1,
  },
  symbolTextNight: {
    color: '#FFFFFF',
  },
});
