import { NotificationModal } from '@/src/components/ui/notification-modal';
import { PrimaryButton } from '@/src/components/ui/primary-button';
import { ScreenContainer } from '@/src/components/ui/screen-container';
import { SelectionCard } from '@/src/components/ui/selection-card';
import { Design, FontFamily } from '@/src/constants/design';
import { AssessmentReportView } from '@/src/features/assessment/components/assessment-report-view';
import { AssessmentTopBar } from '@/src/features/assessment/components/assessment-top-bar';
import {
  DISCIPLINE_QUESTION,
  EXERCISE_QUESTION,
  SLEEP_QUESTION,
  STRESS_QUESTION,
  getDynamicGoalConfig,
  getPerceptionMilestone,
} from '@/src/features/assessment/constants/assessment-data';
import { onboardingService } from '@/src/services/onboardingService';
import type {
  GoalAssessmentContext,
  GoalAssessmentReport,
} from '@/src/types/api/onboarding';
import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function GoalAssessmentScreen() {
  const params = useLocalSearchParams<{ goalId: string }>();
  const goalId = Number(params.goalId);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingNewGoal, setIsSubmittingNewGoal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Context & Report data
  const [context, setContext] = useState<GoalAssessmentContext | null>(null);
  const [report, setReport] = useState<GoalAssessmentReport | null>(null);

  // Questionnaire form states (Steps 1 to 6)
  const [step, setStep] = useState<number>(1);
  const [sleepAnswer, setSleepAnswer] = useState<string>('');
  const [exerciseAnswer, setExerciseAnswer] = useState<string>('');
  const [stressAnswer, setStressAnswer] = useState<string>('');
  const [disciplineAnswer, setDisciplineAnswer] = useState<string>('');
  const [goalQuestionAnswer, setGoalQuestionAnswer] = useState<number>(0);
  const [selfPerceptionPercent, setSelfPerceptionPercent] = useState<number>(75);

  useEffect(() => {
    if (!goalId) {
      setErrorMessage('Không tìm thấy mã mục tiêu hợp lệ.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadAssessmentData = async () => {
      try {
        setIsLoading(true);
        const contextRes = await onboardingService.getAssessmentContext(goalId);
        if (!isMounted) return;

        const ctx = contextRes.assessmentContext;
        setContext(ctx);

        // Nếu đã hoàn thành bài đánh giá trước đó, tải thẳng báo cáo kết quả
        if (ctx.alreadyAssessed) {
          try {
            const reportRes = await onboardingService.getAssessmentReport(goalId);
            if (!isMounted) return;
            setReport(reportRes.assessmentReport);
            setStep(7); // Bước báo cáo
          } catch (e: any) {
            console.warn('Không thể tải báo cáo đánh giá cũ:', e);
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error?.message || 'Không thể tải thông tin mục tiêu.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadAssessmentData();

    return () => {
      isMounted = false;
    };
  }, [goalId]);

  // Dynamic question config
  const dynamicGoalConfig = getDynamicGoalConfig(context?.goalName);

  // Validation logic per step
  const canContinue = (() => {
    switch (step) {
      case 1:
        return Boolean(sleepAnswer);
      case 2:
        return Boolean(exerciseAnswer);
      case 3:
        return Boolean(stressAnswer);
      case 4:
        return Boolean(disciplineAnswer);
      case 5:
        return goalQuestionAnswer > 0;
      case 6:
        return true;
      default:
        return false;
    }
  })();

  const handleNextStep = () => {
    if (step < 6) {
      setStep((prev) => prev + 1);
    } else if (step === 6) {
      void handleSubmitAssessment();
    }
  };

  const handleBackStep = () => {
    if (step > 1 && step < 7) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmitAssessment = async () => {
    if (!goalId) return;

    try {
      setIsSubmitting(true);
      const chosenLabel = dynamicGoalConfig.options[goalQuestionAnswer - 1] || '';

      const submitRes = await onboardingService.submitAssessment(goalId, {
        sleepAnswer,
        exerciseAnswer,
        stressAnswer,
        disciplineAnswer,
        goalQuestionAnswer,
        goalQuestionText: dynamicGoalConfig.question,
        goalQuestionAnswerLabel: chosenLabel,
        selfPerceptionPercent,
      });

      setReport(submitRes.assessmentReport);
      setStep(7); // Chuyển sang màn hình Báo Cáo Chuyển Hóa
    } catch (error: any) {
      setErrorMessage(error?.message || 'Có lỗi xảy ra khi nộp bài khảo sát.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewGoal = async (
    method: 'inherit' | 'new_lifestyle',
    selectedGoalName?: string
  ) => {
    if (method === 'new_lifestyle') {
      // Chuyển sang làm lại khảo sát lối sống từ /onboarding/goals
      router.replace('/onboarding/goals');
      return;
    }

    // Method: 'inherit' -> Gọi API renewGoal với data vừa đánh giá
    try {
      setIsSubmittingNewGoal(true);
      await onboardingService.renewGoal({
        primaryGoal: selectedGoalName || 'Ngủ Tốt Hơn',
        routineType: context?.baseRoutine || 'Cân bằng',
        sleepHours: sleepAnswer || '7-8 tiếng',
        exerciseFrequency: exerciseAnswer || '3-4 lần/tuần',
        stressFrequency: stressAnswer || 'Thỉnh thoảng',
        screenTime: 'Dưới 3 tiếng',
        habitDuration: disciplineAnswer || '2-3 tuần',
        freeTimes: ['Tối (20:00 - 22:00)'],
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Không thể tạo mục tiêu mới từ dữ liệu kế thừa.');
    } finally {
      setIsSubmittingNewGoal(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
          <Text style={styles.loadingText}>Đang tải thông tin đánh giá...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Bước 7: Màn hình Báo Cáo Chuyển Hóa
  if (step === 7 && report) {
    return (
      <ScreenContainer scrollable>
        <AssessmentTopBar
          currentStep={7}
          totalSteps={6}
          onClose={() => router.replace('/(tabs)')}
        />
        <AssessmentReportView
          isSubmittingNewGoal={isSubmittingNewGoal}
          onNavigateCinema={() => router.push('/cinema')}
          onStartNewGoal={handleStartNewGoal}
          report={report}
        />

        {/* Modal hiển thị lỗi nếu có */}
        <NotificationModal
          message={errorMessage || ''}
          onConfirm={() => setErrorMessage(null)}
          title="Thông báo lỗi"
          visible={Boolean(errorMessage)}
        />
      </ScreenContainer>
    );
  }

  const milestone = getPerceptionMilestone(selfPerceptionPercent);

  return (
    <ScreenContainer scrollable={step === 5 || step === 6} contentStyle={styles.container}>
      <AssessmentTopBar
        currentStep={step}
        totalSteps={6}
        showBack={step > 1}
        onBack={handleBackStep}
        onClose={() => router.back()}
      />

      {/* ======================================================== */}
      {/* BƯỚC 1: GIẤC NGỦ */}
      {/* ======================================================== */}
      {step === 1 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>{SLEEP_QUESTION.title}</Text>
          <View style={styles.optionGroup}>
            {SLEEP_QUESTION.options.map((option) => (
              <SelectionCard
                key={option}
                label={option}
                onPress={() => setSleepAnswer(option)}
                selected={sleepAnswer === option}
              />
            ))}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BƯỚC 2: VẬN ĐỘNG */}
      {/* ======================================================== */}
      {step === 2 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>{EXERCISE_QUESTION.title}</Text>
          <View style={styles.optionGroup}>
            {EXERCISE_QUESTION.options.map((option) => (
              <SelectionCard
                key={option}
                label={option}
                onPress={() => setExerciseAnswer(option)}
                selected={exerciseAnswer === option}
              />
            ))}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BƯỚC 3: CĂNG THẲNG */}
      {/* ======================================================== */}
      {step === 3 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>{STRESS_QUESTION.title}</Text>
          <View style={styles.optionGroup}>
            {STRESS_QUESTION.options.map((option) => (
              <SelectionCard
                key={option}
                label={option}
                onPress={() => setStressAnswer(option)}
                selected={stressAnswer === option}
              />
            ))}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BƯỚC 4: KỶ LUẬT */}
      {/* ======================================================== */}
      {step === 4 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>{DISCIPLINE_QUESTION.title}</Text>
          <View style={styles.optionGroup}>
            {DISCIPLINE_QUESTION.options.map((option) => (
              <SelectionCard
                key={option}
                label={option}
                onPress={() => setDisciplineAnswer(option)}
                selected={disciplineAnswer === option}
              />
            ))}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BƯỚC 5: TIẾN ĐỘ THEO MỤC TIÊU BAN ĐẦU (DYNAMIC) */}
      {/* ======================================================== */}
      {step === 5 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>{dynamicGoalConfig.question}</Text>
          <Text style={styles.goalNameTag}>Mục tiêu: {context?.goalName || 'Lộ trình'}</Text>
          <View style={styles.optionGroup}>
            {dynamicGoalConfig.options.map((option, idx) => {
              const scoreIndex = idx + 1;
              return (
                <SelectionCard
                  key={option}
                  label={option}
                  onPress={() => setGoalQuestionAnswer(scoreIndex)}
                  selected={goalQuestionAnswer === scoreIndex}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* BƯỚC 6: TỰ CHẤM ĐIỂM TỔNG KẾT (SLIDER) */}
      {/* ======================================================== */}
      {step === 6 && (
        <View style={styles.stepContent}>
          <Text style={styles.title}>
            Nhìn lại 4 tuần qua, bạn tự chấm mình đã tiến gần đến phiên bản mong muốn bao nhiêu %?
          </Text>

          {/* Slider Container */}
          <View style={styles.sliderContainer}>
            <View style={styles.sliderHeader}>
              <Text style={styles.sliderPercentText}>{selfPerceptionPercent}%</Text>
            </View>

            <Slider
              maximumTrackTintColor="#CBD5E1"
              maximumValue={100}
              minimumTrackTintColor={milestone.color}
              minimumValue={0}
              onValueChange={setSelfPerceptionPercent}
              step={1}
              style={styles.slider}
              thumbTintColor={milestone.color}
              value={selfPerceptionPercent}
            />

            <View style={styles.sliderTicksRow}>
              <Text style={styles.tickText}>0%</Text>
              <Text style={styles.tickText}>25%</Text>
              <Text style={styles.tickText}>50%</Text>
              <Text style={styles.tickText}>75%</Text>
              <Text style={styles.tickText}>100%</Text>
            </View>

            {/* Dynamic Mood Card */}
            <View
              style={[
                styles.moodFeedbackCard,
                { backgroundColor: milestone.bgColor, borderColor: milestone.borderColor },
              ]}>
              <Text style={styles.moodEmoji}>{milestone.emoji}</Text>
              <Text style={[styles.moodLabel, { color: milestone.color }]}>
                {milestone.label}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Footer Button */}
      <View style={styles.footer}>
        <PrimaryButton
          disabled={!canContinue || isSubmitting}
          label={
            isSubmitting
              ? 'Đang tổng kết...'
              : step === 6
                ? 'Hoàn thành & Xem kết quả'
                : 'Tiếp tục'
          }
          onPress={handleNextStep}
        />
      </View>

      {/* Modal hiển thị lỗi nếu có */}
      <NotificationModal
        message={errorMessage || ''}
        onConfirm={() => {
          setErrorMessage(null);
          if (!context) router.back();
        }}
        title="Thông báo lỗi"
        visible={Boolean(errorMessage)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingHorizontal: Design.spacing.screenHorizontal,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#64748B',
  },
  stepContent: {
    flex: 1,
    paddingTop: 16,
  },
  title: {
    marginTop: 12,
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    color: Design.colors.black,
    lineHeight: 30,
  },
  goalNameTag: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: FontFamily.beVietnamMedium,
    color: '#059669',
    marginTop: -16,
    marginBottom: 20,
  },
  optionGroup: {
    gap: 13,
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 36,
    paddingTop: 16,
  },

  // Slider styles
  sliderContainer: {
    paddingHorizontal: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  sliderHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  sliderPercentText: {
    fontSize: 48,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  sliderTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  tickText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: '#94A3B8',
  },
  moodFeedbackCard: {
    marginTop: 28,
    width: '100%',
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 34,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    textAlign: 'center',
  },
});
