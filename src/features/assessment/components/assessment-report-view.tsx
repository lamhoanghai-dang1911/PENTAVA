import { Design, FontFamily } from '@/src/constants/design';
import {
  NEW_GOAL_OPTIONS,
  getPerceptionMilestone,
} from '@/src/features/assessment/constants/assessment-data';
import type { GoalAssessmentReport } from '@/src/types/api/onboarding';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

type AssessmentReportViewProps = {
  report: GoalAssessmentReport;
  onNavigateCinema: () => void;
  onStartNewGoal: (method: 'inherit' | 'new_lifestyle', selectedGoalName?: string) => Promise<void>;
  isSubmittingNewGoal: boolean;
};

export function AssessmentReportView({
  report,
  onNavigateCinema,
  onStartNewGoal,
  isSubmittingNewGoal,
}: AssessmentReportViewProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'choose_method' | 'pick_goal'>('choose_method');
  const [selectedNewGoal, setSelectedNewGoal] = useState<string>('Ngủ Tốt Hơn');

  const delta = report.deltaScore ?? 0;
  const isPositive = delta >= 0;
  const milestone = getPerceptionMilestone(report.selfPerceptionPercent ?? 50);

  const metrics = [
    {
      title: 'Giấc ngủ',
      icon: 'moon',
      base: report.baseSleepScore ?? 0,
      post: report.postSleepScore ?? 0,
      answer: report.postSleepAnswer,
    },
    {
      title: 'Vận động',
      icon: 'fitness',
      base: report.baseExerciseScore ?? 0,
      post: report.postExerciseScore ?? 0,
      answer: report.postExerciseAnswer,
    },
    {
      title: 'Căng thẳng',
      icon: 'heart-half',
      base: report.baseStressScore ?? 0,
      post: report.postStressScore ?? 0,
      answer: report.postStressAnswer,
    },
    {
      title: 'Kỷ luật',
      icon: 'shield-checkmark',
      base: report.baseDisciplineScore ?? 0,
      post: report.postDisciplineScore ?? 0,
      answer: report.postDisciplineAnswer,
    },
  ];

  const handleOpenNewGoalModal = () => {
    setModalStep('choose_method');
    setIsModalVisible(true);
  };

  const handleSelectInherit = () => {
    setModalStep('pick_goal');
  };

  const handleSelectNewLifestyle = async () => {
    setIsModalVisible(false);
    await onStartNewGoal('new_lifestyle');
  };

  const handleConfirmInheritGoal = async () => {
    await onStartNewGoal('inherit', selectedNewGoal);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.celebrationCard}>
        <View style={styles.trophyIconWrap}>
          <Text style={{ fontSize: 36 }}>🏆</Text>
        </View>

        <Text style={styles.celebrationTitle}>TỔNG KẾT HÀNH TRÌNH</Text>
        <Text style={styles.goalPill}>{report.goalName}</Text>

        <Text style={styles.celebrationSubtitle}>
          Chúc mừng bạn đã khép lại chu kỳ 28 ngày! Dưới đây là bức tranh chuyển hóa toàn diện giữa ngày đầu và hiện tại.
        </Text>

        {/* Big Delta Score */}
        <View style={styles.deltaBox}>
          <View style={styles.scoreCompareRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Lúc bắt đầu</Text>
              <Text style={styles.scoreValueOld}>{report.baseOverallScore?.toFixed(1) || '0'}đ</Text>
            </View>

            <View style={styles.arrowWrap}>
              <Ionicons color="#15803D" name="arrow-forward" size={22} />
            </View>

            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>Sau 4 tuần</Text>
              <Text style={styles.scoreValueNew}>{report.postOverallScore?.toFixed(1) || '0'}đ</Text>
            </View>
          </View>

          <View style={[styles.deltaBadge, isPositive ? styles.deltaPositive : styles.deltaNegative]}>
            <Ionicons
              color={isPositive ? '#15803D' : '#DC2626'}
              name={isPositive ? 'trending-up' : 'trending-down'}
              size={18}
            />
            <Text style={[styles.deltaText, isPositive ? styles.deltaTextPositive : styles.deltaTextNegative]}>
              {isPositive ? `Tăng trưởng +${delta.toFixed(1)}đ` : `Thay đổi ${delta.toFixed(1)}đ`}
            </Text>
          </View>
        </View>
      </View>

      {/* 4 Core Metrics Comparison */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>TÁI ĐO LƯỜNG 4 CHỈ SỐ CỐT LÕI</Text>
        <Text style={styles.sectionSubtitle}>So sánh trực tiếp điểm số với lúc khởi tạo Onboarding</Text>

        <View style={styles.metricsList}>
          {metrics.map((m) => {
            const mDelta = m.post - m.base;
            return (
              <View key={m.title} style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <View style={styles.metricTitleRow}>
                    <Ionicons color={Design.colors.primaryGreen} name={m.icon as any} size={16} />
                    <Text style={styles.metricName}>{m.title}</Text>
                  </View>
                  <Text style={[styles.metricDeltaText, mDelta >= 0 ? styles.positiveText : styles.negativeText]}>
                    {mDelta >= 0 ? `+${mDelta}đ` : `${mDelta}đ`}
                  </Text>
                </View>

                {/* Bar representation */}
                <View style={styles.barContainer}>
                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Đầu vào</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillBase, { width: `${Math.min(100, Math.max(8, m.base))}%` }]} />
                    </View>
                    <Text style={styles.barNumber}>{m.base}đ</Text>
                  </View>

                  <View style={styles.barRow}>
                    <Text style={styles.barLabel}>Hiện tại</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFillPost, { width: `${Math.min(100, Math.max(8, m.post))}%` }]} />
                    </View>
                    <Text style={[styles.barNumber, { color: '#15803D', fontFamily: FontFamily.beVietnamSemiBold }]}>
                      {m.post}đ
                    </Text>
                  </View>
                </View>

                {m.answer ? (
                  <Text numberOfLines={1} style={styles.metricAnswerSnippet}>
                    "{m.answer}"
                  </Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>

      {/* Dynamic Goal & Self-Perception */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>MỨC ĐỘ ĐẠT MỤC TIÊU & TỰ ĐÁNH GIÁ</Text>

        {report.goalQuestionText ? (
          <View style={styles.questionBlock}>
            <Text style={styles.questionPrompt}>{report.goalQuestionText}</Text>
            <View style={styles.answerBox}>
              <Ionicons color="#15803D" name="checkmark-circle" size={18} />
              <Text style={styles.answerLabel}>
                {report.goalQuestionAnswerLabel || `Mức ${report.goalQuestionAnswer}/4`}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Self Perception Slider Result */}
        <View
          style={[
            styles.milestoneBox,
            { backgroundColor: milestone.bgColor, borderColor: milestone.borderColor },
          ]}>
          <View style={styles.milestoneHeader}>
            <Text style={styles.milestonePercent}>{report.selfPerceptionPercent ?? 50}%</Text>
            <Text style={styles.milestoneEmoji}>{milestone.emoji}</Text>
          </View>
          <Text style={[styles.milestoneLabel, { color: milestone.color }]}>
            {milestone.label}
          </Text>
          <Text style={styles.milestoneSub}>
            Tiến độ tiệm cận phiên bản mong muốn mà bạn tự chấm cho bản thân.
          </Text>
        </View>
      </View>

      {/* 2 Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable
          accessibilityRole="button"
          onPress={onNavigateCinema}
          style={({ pressed }) => [styles.cinemaButton, pressed && { opacity: 0.85 }]}>
          <Ionicons color="#92400E" name="film-outline" size={18} />
          <Text style={styles.cinemaButtonText}>Xem Clip Hành Trình</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleOpenNewGoalModal}
          style={({ pressed }) => [styles.newGoalButton, pressed && { transform: [{ scale: 0.98 }] }]}>
          <Ionicons color="#FFFFFF" name="sparkles" size={18} />
          <Text style={styles.newGoalButtonText}>Bắt đầu mục tiêu mới</Text>
        </Pressable>
      </View>

      {/* Modal Lựa chọn phương thức bắt đầu mục tiêu mới */}
      <Modal
        animationType="none"
        onRequestClose={() => setIsModalVisible(false)}
        transparent
        visible={isModalVisible}>
        <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(120)} style={styles.modalOverlay}>
          <Animated.View
            entering={ZoomIn.springify().damping(18).stiffness(280)}
            style={styles.modalCard}>
            {modalStep === 'choose_method' ? (
              <>
                <Text style={styles.modalTitle}>Bắt đầu chu kỳ tiếp theo 🌱</Text>
                <Text style={styles.modalSubtitle}>
                  Bạn muốn chuẩn bị cho mục tiêu mới theo cách nào?
                </Text>

                {/* Option 1: Inherit data */}
                <Pressable
                  onPress={handleSelectInherit}
                  style={({ pressed }) => [styles.optionCard, pressed && { transform: [{ scale: 0.98 }] }]}>
                  <View style={[styles.optionIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons color="#B45309" name="flash" size={22} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Kế thừa dữ liệu đánh giá</Text>
                    <Text style={styles.optionDesc}>
                      Dùng các chỉ số vừa đánh giá làm xuất phát điểm mới. Chỉ cần chọn mục tiêu tiếp theo!
                    </Text>
                  </View>
                  <Ionicons color="#94A3B8" name="chevron-forward" size={18} />
                </Pressable>

                {/* Option 2: New lifestyle questionnaire */}
                <Pressable
                  onPress={handleSelectNewLifestyle}
                  style={({ pressed }) => [styles.optionCard, pressed && { transform: [{ scale: 0.98 }] }]}>
                  <View style={[styles.optionIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Ionicons color="#0284C7" name="refresh" size={22} />
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>Cập nhật lối sống mới</Text>
                    <Text style={styles.optionDesc}>
                      Làm lại bài khảo sát lối sống để điều chỉnh thói quen (bỏ qua nhập thông tin cá nhân).
                    </Text>
                  </View>
                  <Ionicons color="#94A3B8" name="chevron-forward" size={18} />
                </Pressable>

                <Pressable
                  onPress={() => setIsModalVisible(false)}
                  style={styles.modalCloseBtn}>
                  <Text style={styles.modalCloseText}>Đóng</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Chọn mục tiêu tiếp theo 🎯</Text>
                <Text style={styles.modalSubtitle}>
                  Chọn mục tiêu bạn muốn tập trung phát triển trong 4 tuần tới:
                </Text>

                <View style={styles.goalsGrid}>
                  {NEW_GOAL_OPTIONS.map((g) => {
                    const isSelected = selectedNewGoal === g;
                    return (
                      <Pressable
                        key={g}
                        onPress={() => setSelectedNewGoal(g)}
                        style={[styles.goalChoicePill, isSelected && styles.goalChoicePillSelected]}>
                        <Ionicons
                          color={isSelected ? Design.colors.primaryGreen : '#94A3B8'}
                          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                          size={18}
                        />
                        <Text style={[styles.goalChoiceText, isSelected && styles.goalChoiceTextSelected]}>
                          {g}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <View style={styles.modalActionRow}>
                  <Pressable
                    disabled={isSubmittingNewGoal}
                    onPress={() => setModalStep('choose_method')}
                    style={styles.modalBackBtn}>
                    <Text style={styles.modalBackText}>Quay lại</Text>
                  </Pressable>

                  <Pressable
                    disabled={isSubmittingNewGoal}
                    onPress={handleConfirmInheritGoal}
                    style={styles.modalConfirmBtn}>
                    {isSubmittingNewGoal ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Bắt đầu ngay</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: Design.spacing.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 48,
  },
  celebrationCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#3A8157',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  trophyIconWrap: {
    marginBottom: 8,
  },
  celebrationTitle: {
    fontSize: 18,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#92400E',
    letterSpacing: 0.5,
  },
  goalPill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FDE68A',
    borderRadius: 999,
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#78350F',
  },
  celebrationSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  deltaBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#000000',
    padding: 16,
    alignItems: 'center',
  },
  scoreCompareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  scoreCol: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    marginBottom: 4,
  },
  scoreValueOld: {
    fontSize: 22,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#64748B',
  },
  scoreValueNew: {
    fontSize: 24,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#15803D',
  },
  arrowWrap: {
    paddingHorizontal: 10,
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  deltaPositive: {
    backgroundColor: '#DCFCE7',
  },
  deltaNegative: {
    backgroundColor: '#FEE2E2',
  },
  deltaText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  deltaTextPositive: {
    color: '#15803D',
  },
  deltaTextNegative: {
    color: '#DC2626',
  },

  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  metricsList: {
    gap: 14,
  },
  metricItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricName: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  metricDeltaText: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  positiveText: {
    color: '#15803D',
  },
  negativeText: {
    color: '#DC2626',
  },
  barContainer: {
    gap: 6,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabel: {
    width: 48,
    fontSize: 10,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFillBase: {
    height: '100%',
    backgroundColor: '#94A3B8',
    borderRadius: 999,
  },
  barFillPost: {
    height: '100%',
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 999,
  },
  barNumber: {
    width: 32,
    fontSize: 11,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#475569',
    textAlign: 'right',
  },
  metricAnswerSnippet: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },

  questionBlock: {
    marginBottom: 16,
  },
  questionPrompt: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 18,
  },
  answerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 10,
    borderRadius: 12,
  },
  answerLabel: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#15803D',
  },
  milestoneBox: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  milestonePercent: {
    fontSize: 28,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  milestoneEmoji: {
    fontSize: 28,
  },
  milestoneLabel: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    marginBottom: 4,
  },
  milestoneSub: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    lineHeight: 16,
  },

  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  cinemaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#B45309',
    borderRadius: 18,
    paddingVertical: 14,
    shadowColor: '#B45309',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  cinemaButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#78350F',
  },
  newGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Design.colors.primaryGreen,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 18,
    paddingVertical: 15,
    shadowColor: '#FFC857',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  newGoalButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000000',
    padding: 22,
    shadowColor: '#3A8157',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  optionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#64748B',
    lineHeight: 15,
  },
  modalCloseBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 6,
  },
  modalCloseText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#64748B',
  },

  goalsGrid: {
    gap: 8,
    marginBottom: 20,
  },
  goalChoicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  goalChoicePillSelected: {
    borderColor: Design.colors.primaryGreen,
    backgroundColor: '#F0FDF4',
  },
  goalChoiceText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#334155',
  },
  goalChoiceTextSelected: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBackBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Design.colors.primaryGreen,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: '#FFFFFF',
  },
});
