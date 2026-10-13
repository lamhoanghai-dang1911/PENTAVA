import type { Task } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../mood.styles';

type MoodTaskItemProps = {
  task: Task;
  isSelected: boolean;
  onToggle: (taskId: number) => void;
};

export const MoodTaskItem = React.memo(function MoodTaskItem({
  task,
  isSelected,
  onToggle,
}: MoodTaskItemProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onToggle(task.id)}
      style={[styles.taskItem, isSelected && styles.taskItemSelected]}>
      <View style={styles.taskItemText}>
        <Text style={[styles.taskContent, isSelected && styles.taskContentSelected]}>
          {task.content}
        </Text>
      </View>
      <View style={[styles.taskCheckWrap, isSelected && styles.taskCheckWrapSelected]}>
        {isSelected ? (
          <Ionicons color="#FFFFFF" name="checkmark" size={14} />
        ) : (
          <Ionicons color="#94A3B8" name="add" size={16} />
        )}
      </View>
    </TouchableOpacity>
  );
});
