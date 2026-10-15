import { FontFamily } from '@/src/constants/design';
import { getCurrentUserId } from '@/src/services/authStorage';
import { getCachedDailyStatus } from '@/src/services/taskCacheStorage';
import { taskService } from '@/src/services/taskService';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import LottieView from 'lottie-react-native';
import { memo, useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCLE_SIZE = 144;
const CIRCLE_RADIUS = 40;
const CIRCUMFERENCE = 251.327; // 2 * Math.PI * 40 ≈ 251.3274

type DailyTaskProgressBarProps = {
  goalId: number | null;
  isNight?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const DailyTaskProgressBar = memo(function DailyTaskProgressBar({
  goalId,
  isNight = false,
  onPress,
  style,
}: DailyTaskProgressBarProps) {
  const [percentage, setPercentage] = useState(0);
  const [isFocused, setIsFocused] = useState(true);

  // Reanimated shared value for smooth stroke dashoffset transition
  const animatedFill = useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, []),
  );

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
      .catch(() => { });

    taskService
      .getDailyTaskStatus(goalId)
      .then((response) => {
        if (!isMounted) return;
        const tasks = response.dailyTaskStatus?.todayTasks ?? [];
        const completed = tasks.filter((t) => t.isCompleted).length;
        const total = tasks.length > 0 ? tasks.length : 5;
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

  // Sync percentage to animatedFill smoothly
  useEffect(() => {
    animatedFill.value = withTiming(percentage, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage, animatedFill]);

  const animatedCircleProps = useAnimatedProps(() => {
    const clampedFill = Math.min(100, Math.max(0, animatedFill.value));
    const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * clampedFill) / 100;
    return {
      strokeDashoffset,
    };
  });

  const handlePress = () => {
    try {
      void Haptics.impactAsync(
        percentage >= 100
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light,
      );
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
        styles.outerContainer,
        style,
        pressed && { transform: [{ scale: 0.96 }], opacity: 0.92 },
      ]}>
      {/* Pill Badge: Tiến độ hôm nay */}
      <View style={[styles.pillBadge, isNight && styles.pillBadgeNight]}>
        <Text style={[styles.pillBadgeText, isNight && styles.pillBadgeTextNight]}>
          Tiến độ hôm nay
        </Text>
      </View>

      {/* Circular Progress & Lottie Moon / Sun Container */}
      <View style={styles.circleWidgetContainer}>
        {/* Lottie Mặt trăng / Mặt trời neo theo góc 2h */}
        <View pointerEvents="none" style={styles.lottieAnchor}>
          <LottieView
            key={isNight ? 'lottie-sun' : 'lottie-moon'}
            autoPlay={isFocused}
            hardwareAccelerationAndroid
            loop={false}
            renderMode="HARDWARE"
            resizeMode="contain"
            source={
              isNight
                ? require('@/assets/animations/progress-sun.json')
                : require('@/assets/animations/progress-moon.json')
            }
            speed={1}
            style={styles.lottieView}
          />
        </View>

        {/* Vòng tròn SVG Responsive (viewBox 0 0 100 100) */}
        <Svg
          height={CIRCLE_SIZE}
          style={styles.svgRing}
          viewBox="0 0 100 100"
          width={CIRCLE_SIZE}>
          <Defs>
            <SvgLinearGradient id="moonGold" x1="0%" x2="100%" y1="0%" y2="100%">
              <Stop offset="0%" stopColor="#FEF08A" />
              <Stop offset="100%" stopColor="#F59E0B" />
            </SvgLinearGradient>
          </Defs>

          {/* Vòng nền */}
          <Circle
            cx="50"
            cy="50"
            fill="none"
            r={CIRCLE_RADIUS}
            stroke={isNight ? 'rgba(23, 34, 55, 0.75)' : 'rgba(160, 174, 192, 0.45)'}
            strokeLinecap="round"
            strokeWidth="7.5"
          />

          {/* Vạch tiến độ */}
          <AnimatedCircle
            animatedProps={animatedCircleProps}
            cx="50"
            cy="50"
            fill="none"
            origin="50, 50"
            r={CIRCLE_RADIUS}
            rotation="-90"
            stroke="url(#moonGold)"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeLinecap="round"
            strokeWidth="7.5"
          />
        </Svg>

        {/* Chữ hiển thị số % và Nhiệm vụ ở trung tâm */}
        <View pointerEvents="none" style={styles.centerTextOverlay}>
          <View style={styles.percentageRow}>
            <Text
              style={[
                styles.percentageNumber,
                percentage >= 100 && styles.percentageNumberCompleted,
                isNight && styles.textNight,
              ]}>
              {percentage}
            </Text>
            <Text
              style={[
                styles.percentageSymbol,
                percentage >= 100 && styles.percentageSymbolCompleted,
                isNight && styles.textNight,
              ]}>
              %
            </Text>
          </View>
          <Text style={[styles.taskSubLabel, isNight && styles.taskSubLabelNight]}>
            Nhiệm vụ
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    top: 50,
  },
  pillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 4.5,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  pillBadgeNight: {
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0.3,
  },
  pillBadgeText: {
    color: '#0F172A',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  pillBadgeTextNight: {
    color: '#F8FAFC',
  },
  circleWidgetContainer: {
    position: 'relative',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieAnchor: {
    position: 'absolute',
    top: -14,
    right: -2,
    width: 48,
    height: 48,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottieView: {
    width: '200%',
    height: '200%',
  },
  svgRing: {
    overflow: 'visible',
  },
  centerTextOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  percentageNumber: {
    color: '#000000',
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 32,
    lineHeight: 36,
  },
  percentageNumberCompleted: {
    color: '#F59E0B',
  },
  percentageSymbol: {
    color: '#000000',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 1,
    marginTop: 2,
  },
  percentageSymbolCompleted: {
    color: '#F59E0B',
  },
  textNight: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  taskSubLabel: {
    color: '#64748B',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: -1,
  },
  taskSubLabelNight: {
    color: '#94A3B8',
  },
});
