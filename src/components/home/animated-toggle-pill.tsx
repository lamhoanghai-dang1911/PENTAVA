import { Design, FontFamily } from '@/src/constants/design';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export type ToggleTab = 'tasks' | 'cinema';

type AnimatedTogglePillProps = {
  activeTab?: ToggleTab | null;
  onSelectTasks: () => void;
  onSelectCinema: () => void;
  isNight?: boolean;
  style?: StyleProp<ViewStyle>;
};

const PADDING = 3;

const springConfig = {
  damping: 18,
  stiffness: 220,
  mass: 0.65,
};

export function AnimatedTogglePill({
  activeTab = 'tasks',
  onSelectTasks,
  onSelectCinema,
  isNight = false,
  style,
}: AnimatedTogglePillProps) {
  const initialActive = activeTab ?? 'tasks';
  const [selectedTab, setSelectedTab] = useState<ToggleTab>(initialActive);

  const progress = useSharedValue(initialActive === 'cinema' ? 1 : 0);
  const tabWidth = useSharedValue(142);
  const pillScale = useSharedValue(1);
  const isNavigatingRef = useRef(false);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0) {
      tabWidth.value = (width - PADDING * 2) / 2;
    }
  };

  const handlePress = (tab: ToggleTab) => {
    if (isNavigatingRef.current) return;
    if (activeTab === tab) return;

    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback on web/unsupported devices
    }

    setSelectedTab(tab);
    progress.value = withSpring(tab === 'cinema' ? 1 : 0, springConfig);

    isNavigatingRef.current = true;
    const isSameTab = activeTab === tab;

    setTimeout(
      () => {
        isNavigatingRef.current = false;
        if (tab === 'tasks') {
          onSelectTasks();
        } else {
          onSelectCinema();
        }
      },
      isSameTab ? 60 : 140,
    );
  };

  const handlePressIn = () => {
    pillScale.value = withTiming(0.96, { duration: 100 });
  };

  const handlePressOut = () => {
    pillScale.value = withSpring(1, { damping: 15, stiffness: 260 });
  };

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    width: tabWidth.value,
    transform: [
      { translateX: progress.value * tabWidth.value },
      { scale: pillScale.value },
    ],
  }));

  return (
    <View
      onLayout={onLayout}
      style={[
        styles.container,
        isNight && styles.containerNight,
        style,
      ]}>
      {/* Thanh trượt chỉ báo nền (Sliding Indicator) */}
      <Animated.View
        style={[
          styles.indicator,
          isNight && styles.indicatorNight,
          animatedIndicatorStyle,
        ]}
      />

      {/* Tùy chọn 1: Nhiệm vụ ngày */}
      <Pressable
        accessibilityLabel="Nhiệm vụ ngày"
        accessibilityRole="button"
        onPress={() => handlePress('tasks')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.option}>
        <Text
          style={[
            styles.optionText,
            isNight && styles.optionTextNight,
            selectedTab === 'tasks' && styles.optionTextActive,
            selectedTab === 'tasks' && isNight && styles.optionTextActiveNight,
          ]}>
          Nhiệm vụ ngày
        </Text>
      </Pressable>

      {/* Tùy chọn 2: PENTA-CINEMA */}
      <Pressable
        accessibilityLabel="PENTA-CINEMA"
        accessibilityRole="button"
        onPress={() => handlePress('cinema')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.option}>
        <Text
          style={[
            styles.optionText,
            isNight && styles.optionTextNight,
            selectedTab === 'cinema' && styles.optionTextActive,
            selectedTab === 'cinema' && isNight && styles.optionTextActiveNight,
          ]}>
          PENTA-CINEMA
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E5E9',
    backgroundColor: '#F1F3F5',
    padding: PADDING,
    position: 'relative',
  },
  containerNight: {
    backgroundColor: 'rgba(26, 36, 54, 0.85)',
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  indicatorNight: {
    backgroundColor: 'rgba(51, 65, 85, 0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  option: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  optionText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    color: '#6B7280',
  },
  optionTextNight: {
    color: '#94A3B8',
  },
  optionTextActive: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  optionTextActiveNight: {
    color: '#FFFFFF',
    fontFamily: FontFamily.beVietnamSemiBold,
  },
});
