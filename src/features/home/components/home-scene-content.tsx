import { AnimatedTogglePill } from '@/src/components/home/animated-toggle-pill';
import type { AvatarLayer } from '@/src/types/api/skin';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { DailyTaskProgressCircle } from './daily-task-progress-circle';
import { HomeAvatar } from './home-avatar';
import { styles } from '../home-screen.styles';

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

export function HomeSceneContent({
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
  return (
    <>
      <HomeAvatar
        avatarLayers={avatarLayers}
        isImmersiveView={isImmersiveView}
      />

      {!isImmersiveView ? (
        <View style={styles.bottomCardSection}>
          {/* Vòng tròn tiến độ hoàn thành task trong ngày (thay thế khung Routine) & Nút Bản đồ */}
          <View style={styles.progressRow}>
            <DailyTaskProgressCircle
              goalId={currentGoalId}
              isNight={isNight}
              onPress={onOpenTasks}
            />

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

          {/* Toggle Nhiệm vụ ngày / PENTA-CINEMA được đẩy lên */}
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
}