import { Design, FontFamily } from '@/src/constants/design';
import type { CurrentGoal } from '@/src/types/api/onboarding';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

type EndGoalSectionProps = {
  currentGoalId: number | null;
  currentGoal: CurrentGoal | null;
  weekNumber: number;
};

export function EndGoalSection({
  currentGoalId,
  currentGoal,
  weekNumber,
}: EndGoalSectionProps) {
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

  if (!currentGoalId) return null;

  const isFinalStage = weekNumber >= 4;

  const handlePressEndGoal = () => {
    if (isFinalStage) {
      router.push({
        pathname: '/goal-assessment',
        params: { goalId: String(currentGoalId) },
      });
    } else {
      setIsConfirmModalVisible(true);
    }
  };

  const handleConfirmEarlyEnd = () => {
    setIsConfirmModalVisible(false);
    router.push({
      pathname: '/goal-assessment',
      params: { goalId: String(currentGoalId) },
    });
  };

  return (
    <>
      <View style={[styles.container, isFinalStage ? styles.finalContainer : styles.earlyContainer]}>
        <View style={styles.headerRow}>
          <View style={[styles.badge, isFinalStage ? styles.finalBadge : styles.earlyBadge]}>
            <Ionicons
              color={isFinalStage ? '#92400E' : '#475569'}
              name={isFinalStage ? 'trophy' : 'flag-outline'}
              size={13}
            />
            <Text style={[styles.badgeText, isFinalStage ? styles.finalBadgeText : styles.earlyBadgeText]}>
              {isFinalStage ? 'CHẶNG CUỐI 4 TUẦN' : 'LỘ TRÌNH HIỆN TẠI'}
            </Text>
          </View>
          {currentGoal?.goalName ? (
            <Text numberOfLines={1} style={styles.goalNameText}>
              {currentGoal.goalName}
            </Text>
          ) : null}
        </View>

        <Text style={styles.title}>
          {isFinalStage
            ? 'Đã đến lúc thu hoạch trái ngọt! 🌟'
            : 'Bạn muốn khép lại mục tiêu này?'}
        </Text>

        <Text style={styles.description}>
          {isFinalStage
            ? 'Bạn đã đồng hành trọn vẹn 4 tuần. Hãy nhìn lại sự chuyển hóa và tự chấm điểm cho phiên bản tốt hơn của mình.'
            : 'Đánh giá lại 4 chỉ số cốt lõi và mức độ tiến bộ trước khi bắt đầu một mục tiêu mới.'}
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={handlePressEndGoal}
          style={({ pressed }) => [
            styles.actionButton,
            isFinalStage ? styles.finalButton : styles.earlyButton,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}>
          <Text style={[styles.actionButtonText, isFinalStage ? styles.finalButtonText : styles.earlyButtonText]}>
            {isFinalStage ? 'TỔNG KẾT & KẾT THÚC MỤC TIÊU ➔' : 'Kết thúc mục tiêu & Làm khảo sát'}
          </Text>
        </Pressable>
      </View>

      {/* Confirmation Modal khi kết thúc sớm */}
      <Modal
        animationType="none"
        onRequestClose={() => setIsConfirmModalVisible(false)}
        transparent
        visible={isConfirmModalVisible}>
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(120)} style={styles.modalOverlay}>
          <Animated.View
            entering={ZoomIn.springify().damping(18).stiffness(280)}
            style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Ionicons color="#D97706" name="alert-circle" size={36} />
            </View>

            <Text style={styles.modalTitle}>Xác nhận kết thúc sớm?</Text>

            <Text style={styles.modalMessage}>
              Bạn đang ở <Text style={{ fontFamily: FontFamily.beVietnamSemiBold, color: Design.colors.black }}>Tuần {weekNumber}</Text> của mục tiêu "{currentGoal?.goalName || 'hiện tại'}".
              {'\n\n'}
              Khi kết thúc sớm, chu kỳ này sẽ được chốt lại và chuyển bạn sang bài khảo sát đánh giá chuyển hóa đầu ra.
            </Text>

            <View style={styles.modalButtonGroup}>
              <Pressable
                onPress={() => setIsConfirmModalVisible(false)}
                style={({ pressed }) => [styles.cancelBtn, pressed && { opacity: 0.7 }]}>
                <Text style={styles.cancelBtnText}>Tiếp tục cố gắng</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirmEarlyEnd}
                style={({ pressed }) => [styles.confirmBtn, pressed && { opacity: 0.85 }]}>
                <Text style={styles.confirmBtnText}>Xác nhận kết thúc</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 36,
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    borderColor: '#000000',
  },
  finalContainer: {
    backgroundColor: '#FEF3C7',
    shadowColor: '#3A8157',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  earlyContainer: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  finalBadge: {
    backgroundColor: '#FDE68A',
  },
  earlyBadge: {
    backgroundColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FontFamily.beVietnamSemiBold,
    letterSpacing: 0.4,
  },
  finalBadgeText: {
    color: '#92400E',
  },
  earlyBadgeText: {
    color: '#475569',
  },
  goalNameText: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#64748B',
    maxWidth: 160,
  },
  title: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  actionButton: {
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },
  finalButton: {
    backgroundColor: Design.colors.primaryGreen,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  finalButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  earlyButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#94A3B8',
  },
  earlyButtonText: {
    color: '#334155',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 22,
    shadowColor: '#FFC857',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  modalIconWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#4B5563',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#475569',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#FFFFFF',
  },
});
