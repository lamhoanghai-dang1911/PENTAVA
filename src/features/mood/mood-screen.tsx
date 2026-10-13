import { MoodMascot } from '@/src/features/mood/components/MoodMascot';
import { MoodTaskPanel } from '@/src/features/mood/components/mood-task-panel';
import { MOOD_OPTIONS, useMoodSelector } from '@/src/features/mood/hooks/useMoodSelector';
import { styles } from '@/src/features/mood/mood.styles';
import { getCurrentUserId } from '@/src/services/authStorage';
import { onboardingService } from '@/src/services/onboardingService';
import { cacheDailyStatus } from '@/src/services/taskCacheStorage';
import { taskService } from '@/src/services/taskService';
import type { Task } from '@/src/types/api/task';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Slider } from 'react-native-awesome-slider';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

export default function MoodScreen() {
  const router = useRouter();
  const { goalId: goalIdParam } = useLocalSearchParams<{ goalId?: string }>();
  const goalId = Number(goalIdParam);
  const scrollRef = useRef<ScrollView>(null);

  const progress = useSharedValue(0);
  const min = useSharedValue(0);
  const max = useSharedValue(2);

  const { comment, setComment, currentIndex, selectedMood, setMoodBySlider } = useMoodSelector();
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isConfirmingTasks, setIsConfirmingTasks] = useState(false);

  useEffect(() => {
    progress.value = withTiming(currentIndex, { duration: 200 });
  }, [currentIndex, progress]);

  useEffect(() => {
    if (availableTasks.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [availableTasks.length]);

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setIsLoadingTasks(true);
    try {
      const activeGoalId = goalId || (await onboardingService.getCurrentGoal()).currentGoal?.goalId;
      if (!activeGoalId) {
        throw new Error('Không tìm thấy mục tiêu hiện tại.');
      }

      const moodType = ['BAD', 'NEUTRAL', 'GOOD'][currentIndex] as 'BAD' | 'NEUTRAL' | 'GOOD';
      const response = await taskService.selectMood({ goalId: activeGoalId, moodType, comment });
      const tasks = response.moodTaskResponse?.availableTasks ?? [];
      setAvailableTasks(tasks);
      if (tasks.length === 5) {
        // Tự động chọn sẵn 5 task của mood để người dùng xem và bấm xác nhận
        setSelectedTaskIds(tasks.map((t) => t.id));
      } else {
        setSelectedTaskIds([]);
      }
    } catch (error) {
      Alert.alert('Không thể tải task', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const toggleTask = (taskId: number) => {
    setSelectedTaskIds((current) => {
      if (current.includes(taskId)) return current.filter((id) => id !== taskId);
      if (current.length >= 5) return current;
      return [...current, taskId];
    });
  };

  const handleConfirmTasks = async () => {
    if (selectedTaskIds.length !== 5) return;

    setIsConfirmingTasks(true);
    try {
      const activeGoalId = goalId || (await onboardingService.getCurrentGoal()).currentGoal?.goalId;
      if (!activeGoalId) {
        throw new Error('Không tìm thấy mục tiêu hiện tại.');
      }

      await taskService.confirmDailyTasks({ goalId: activeGoalId, selectedTaskIds });
      try {
        const userId = await getCurrentUserId();
        const updatedResponse = await taskService.getDailyTaskStatus(activeGoalId);
        if (updatedResponse.dailyTaskStatus) {
          await cacheDailyStatus(userId, activeGoalId, updatedResponse.dailyTaskStatus);
        }
      } catch {
        // ignore cache update error
      }
      router.replace('/daily-tasks');
    } catch (error) {
      Alert.alert('Không thể xác nhận task', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsConfirmingTasks(false);
    }
  };

  return (
    <TouchableWithoutFeedback accessible={false} onPress={Keyboard.dismiss}>
      <Animated.View style={[styles.container, { backgroundColor: selectedMood.color }]}>
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
            style={styles.keyboardAvoiding}>
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}>
              <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>

              <MoodMascot currentIndex={currentIndex} progress={progress} />

              <Text style={styles.moodLabel}>{selectedMood.label}</Text>

              <View style={styles.sliderWrapper}>
                <View style={styles.sliderTrackLine} />
                <View style={styles.dotsRow}>
                  {MOOD_OPTIONS.map((mood) => (
                    <View key={mood.label} style={[styles.dotNode, { backgroundColor: mood.color }]} />
                  ))}
                </View>

                <Slider
                  maximumValue={max}
                  minimumValue={min}
                  onSlidingComplete={(value) => {
                    setMoodBySlider(value);
                  }}
                  progress={progress}
                  renderThumb={() => <View style={styles.customThumb} />}
                  steps={1}
                  style={styles.actualSlider}
                  theme={{
                    disableMinTrackTintColor: 'transparent',
                    maximumTrackTintColor: 'transparent',
                    minimumTrackTintColor: 'transparent',
                    cacheTrackTintColor: 'transparent',
                    bubbleBackgroundColor: 'transparent',
                    heartbeatColor: 'transparent',
                  }}
                  thumbWidth={26}
                />
              </View>

              <View style={styles.commentBox}>
                <TextInput
                  multiline
                  onChangeText={setComment}
                  placeholder="Comment...."
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={styles.input}
                  value={comment}
                />
                <TouchableOpacity activeOpacity={0.8} onPress={handleSubmit} style={styles.submitBtn}>
                  {isLoadingTasks ? (
                    <ActivityIndicator color={selectedMood.color} />
                  ) : (
                    <Text style={[styles.submitText, { color: selectedMood.color }]}>Chọn task</Text>
                  )}
                </TouchableOpacity>
              </View>

              {availableTasks.length > 0 ? (
                <MoodTaskPanel
                  isConfirmingTasks={isConfirmingTasks}
                  onConfirmTasks={handleConfirmTasks}
                  onToggleTask={toggleTask}
                  selectedTaskIds={selectedTaskIds}
                  tasks={availableTasks}
                />
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
