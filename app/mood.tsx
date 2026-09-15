import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Slider } from 'react-native-awesome-slider';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

import { MoodMascot } from '@/src/features/mood/components/MoodMascot';
import { MOOD_OPTIONS, useMoodSelector } from '@/src/features/mood/hooks/useMoodSelector';
import { onboardingService } from '@/src/services/onboardingService';
import { taskService } from '@/src/services/taskService';
import type { Task } from '@/src/types/api/task';

export default function MoodScreen() {
  const router = useRouter();
  const { goalId: goalIdParam } = useLocalSearchParams<{ goalId?: string }>();
  const goalId = Number(goalIdParam);
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
      setAvailableTasks(response.moodTaskResponse?.availableTasks ?? []);
      setSelectedTaskIds([]);
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
      router.replace('/daily-tasks');
    } catch (error) {
      Alert.alert('Không thể xác nhận task', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsConfirmingTasks(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Animated.View style={[styles.container, { backgroundColor: selectedMood.color }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
          style={styles.keyboardAvoiding}
        >
          <Text style={styles.headerTitle}>Hôm nay bạn thế nào?</Text>

          <MoodMascot progress={progress} currentIndex={currentIndex} />

          <Text style={styles.moodLabel}>{selectedMood.label}</Text>

          <View style={styles.sliderWrapper}>
            <View style={styles.sliderTrackLine} />
            <View style={styles.dotsRow}>
              {MOOD_OPTIONS.map((mood) => (
                <View key={mood.label} style={[styles.dotNode, { backgroundColor: mood.color }]} />
              ))}
            </View>

            <Slider
              style={styles.actualSlider}
              progress={progress}
              minimumValue={min}
              maximumValue={max}
              steps={1}
              onSlidingComplete={(value) => {
                setMoodBySlider(value);
              }}
              thumbWidth={26}
              theme={{
                disableMinTrackTintColor: 'transparent',
                maximumTrackTintColor: 'transparent',
                minimumTrackTintColor: 'transparent',
                cacheTrackTintColor: 'transparent',
                bubbleBackgroundColor: 'transparent',
                heartbeatColor: 'transparent',
              }}
              renderThumb={() => <View style={styles.customThumb} />}
            />
          </View>

          <View style={styles.commentBox}>
            <TextInput
              style={styles.input}
              placeholder="Comment...."
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              value={comment}
              onChangeText={setComment}
            />
            <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8} onPress={handleSubmit}>
              {isLoadingTasks ? (
                <ActivityIndicator color={selectedMood.color} />
              ) : (
                <Text style={[styles.submitText, { color: selectedMood.color }]}>Chọn task</Text>
              )}
            </TouchableOpacity>
          </View>

          {availableTasks.length > 0 ? (
            <View style={styles.taskPanel}>
              <View style={styles.taskPanelHeader}>
                <Text style={styles.taskPanelTitle}>Chọn 5 task cho hôm nay</Text>
                <Text style={styles.taskCount}>{selectedTaskIds.length}/5</Text>
              </View>
              <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
                {availableTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  return (
                    <TouchableOpacity
                      key={task.id}
                      activeOpacity={0.8}
                      onPress={() => toggleTask(task.id)}
                      style={[styles.taskItem, isSelected && styles.taskItemSelected]}>
                      <View style={styles.taskItemText}>
                        <Text style={styles.taskContent}>{task.content}</Text>
                      </View>
                      <Text style={styles.taskCheck}>{isSelected ? '✓' : '+'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={selectedTaskIds.length !== 5 || isConfirmingTasks}
                onPress={handleConfirmTasks}
                style={[styles.confirmBtn, selectedTaskIds.length !== 5 && styles.confirmBtnDisabled]}>
                {isConfirmingTasks ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.confirmText}>Xác nhận 5 task</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </Animated.View>
    </TouchableWithoutFeedback>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoiding: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 48,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  moodLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1.5,
    marginVertical: 10,
  },
  sliderWrapper: {
    width: '92%',
    height: 40,
    zIndex: 2,
    elevation: 2,
    marginBottom: 14,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrackLine: {
    position: 'absolute',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    left: 10,
    right: 10,
    borderRadius: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  dotNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actualSlider: {
    position: 'absolute',
    width: '100%',
    height: 40,
    zIndex: 3,
    elevation: 3,
  },
  customThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  commentBox: {
    width: '92%',
    paddingHorizontal: 8,
    marginBottom: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  submitBtn: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontWeight: '700',
    fontSize: 16,
  },
  taskPanel: {
    width: '92%',
    height: 280,
    flexShrink: 0,
    marginTop: 4,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  taskPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskPanelTitle: {
    color: '#202020',
    fontSize: 16,
    fontWeight: '700',
  },
  taskCount: {
    color: '#202020',
    fontSize: 15,
    fontWeight: '700',
  },
  taskList: {
    flex: 1,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F1F1F1',
  },
  taskItemSelected: {
    backgroundColor: '#D8F3E2',
    borderWidth: 1,
    borderColor: '#3B8157',
  },
  taskItemText: {
    flex: 1,
  },
  taskContent: {
    color: '#202020',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  taskCheck: {
    width: 26,
    color: '#3B8157',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
    marginTop: 10,
    borderRadius: 23,
    backgroundColor: '#3B8157',
  },
  confirmBtnDisabled: {
    backgroundColor: '#A5B9AB',
  },
  confirmText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

