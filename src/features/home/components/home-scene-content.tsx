import React from 'react';
import { AnimatedTogglePill } from '@/src/components/home/animated-toggle-pill';
import type { AvatarLayer } from '@/src/types/api/skin';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../home-screen.styles';
import { DailyTaskProgressCircle } from './daily-task-progress-circle';
import { HomeAvatar } from './home-avatar';

type HomeSceneContentProps = {
  avatarLayers: AvatarLayer[] | null;
  currentGoalId: number | null;
  isNight: boolean;
  isImmersiveView: boolean;
  toggleKey: number;
  onOpenCustomRoadmap: () => void;
  onOpenCinema: () => void;
  onOpenTasks: () => void;
  onExitImmersiveView: () => void;
};

// Chiều cao ước lượng của hàng icon trên cùng (lửa, kim cương, mắt, mặt trời, chuông)
const TOP_ICON_ROW_OFFSET = 60;

export const HomeSceneContent = React.memo(function HomeSceneContent({
  avatarLayers,
  currentGoalId,
  isNight,
  isImmersiveView,
  toggleKey,
  onOpenCustomRoadmap,
  onOpenCinema,
  onOpenTasks,
  onExitImmersiveView,
}: HomeSceneContentProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <HomeAvatar
        avatarLayers={avatarLayers}
        isImmersiveView={isImmersiveView}
      />

      {!isImmersiveView ? (
        <>
          {/* Vòng tròn tiến độ: góc phải trên, nằm dưới hàng icon */}
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: insets.top + TOP_ICON_ROW_OFFSET,
              right: 16,
              zIndex: 10,
            }}>
            <DailyTaskProgressCircle
              goalId={currentGoalId}
              isNight={isNight}
              onPress={onOpenTasks}
            />
          </View>

          <View style={styles.bottomCardSection}>
            {/* Chỉ còn nút Bản đồ */}
            <View style={[styles.progressRow, { justifyContent: 'flex-end' }]}>
              <Pressable
                accessibilityLabel="Lộ trình tùy chỉnh & Cộng đồng"
                accessibilityRole="button"
                onPress={onOpenCustomRoadmap}
                style={({ pressed }) => [
                  styles.wardrobeIconButton,
                  styles.mapFloatingButton,
                  isNight && styles.wardrobeIconButtonNight,
                  pressed && { transform: [{ scale: 0.9 }], opacity: 0.8 },
                ]}>
                <Ionicons
                  color={isNight ? '#38BDF8' : '#0284C7'}
                  name="map-outline"
                  size={22}
                />
              </Pressable>
            </View>

            {/* Toggle Nhiệm vụ ngày / PENTA-CINEMA */}
            <View style={styles.toggleRow}>
              <AnimatedTogglePill
                key={toggleKey}
                activeTab="tasks"
                isNight={isNight}
                onSelectCinema={onOpenCinema}
                onSelectTasks={onOpenTasks}
                style={styles.togglePillElevated}
              />
            </View>
          </View>
        </>
      ) : (
        <Pressable
          accessibilityLabel="Chạm để thoát chế độ toàn cảnh"
          onPress={onExitImmersiveView}
          style={({ pressed }) => [
            styles.immersiveHintPill,
            isNight && styles.immersiveHintPillNight,
            pressed && { opacity: 0.8 },
          ]}>
          <Ionicons
            color={isNight ? '#93C5FD' : '#15803D'}
            name="sparkles"
            size={15}
          />
          <Text style={[styles.immersiveHintText, isNight && styles.immersiveHintTextNight]}>
            Đang xem toàn cảnh • Chạm để hiện lại menu
          </Text>
        </Pressable>
      )}
    </>
  );
});