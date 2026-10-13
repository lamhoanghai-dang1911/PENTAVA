import type { Task } from '@/src/types/api/task';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../mood.styles';
import { MoodTaskItem } from './mood-task-item';

type MoodTaskPanelProps = {
  tasks: Task[];
  selectedTaskIds: number[];
  onToggleTask: (taskId: number) => void;
  onConfirmTasks: () => void;
  isConfirmingTasks: boolean;
};

export function MoodTaskPanel({
  tasks,
  selectedTaskIds,
  onToggleTask,
  onConfirmTasks,
  isConfirmingTasks,
}: MoodTaskPanelProps) {
  return (
    <View style={styles.taskPanel}>
      <View style={styles.taskPanelHeader}>
        <Text style={styles.taskPanelTitle}>Chọn 5 task cho hôm nay</Text>
        <Text style={styles.taskCount}>{selectedTaskIds.length}/5</Text>
      </View>
      <ScrollView
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
        style={styles.taskList}>
        {tasks.map((task) => (
          <MoodTaskItem
            key={task.id}
            isSelected={selectedTaskIds.includes(task.id)}
            onToggle={onToggleTask}
            task={task}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={selectedTaskIds.length !== 5 || isConfirmingTasks}
        onPress={onConfirmTasks}
        style={[styles.confirmBtn, selectedTaskIds.length !== 5 && styles.confirmBtnDisabled]}>
        {isConfirmingTasks ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.confirmText}>Xác nhận 5 task</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
