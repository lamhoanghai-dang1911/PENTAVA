import { checkinService } from '@/src/services/checkinService';
import { taskService } from '@/src/services/taskService';
import type { TaskCameraRouteParams } from '@/src/types/camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cameraStyles, TaskCameraScaffold } from './TaskCameraScaffold';

export function TaskPhotoReviewScreen() {
  const router = useRouter();
  const { imageUri, taskId: taskIdParam, selectedItems: selectedItemsParam } = useLocalSearchParams<TaskCameraRouteParams & { imageUri?: string }>();
  const [isSaving, setIsSaving] = useState(false);

  const usePhoto = async () => {
    const taskId = Number(taskIdParam);
    if (!imageUri || !Number.isInteger(taskId) || taskId <= 0) {
      Alert.alert('Thiếu dữ liệu check-in', 'Vui lòng mở lại nhiệm vụ từ danh sách.');
      return;
    }

    let selectedItems: string[] = [];
    try {
      selectedItems = selectedItemsParam ? JSON.parse(selectedItemsParam) as string[] : [];
    } catch {
      Alert.alert('Dữ liệu không hợp lệ', 'Không thể đọc các lựa chọn của nhiệm vụ.');
      return;
    }

    try {
      setIsSaving(true);
      const imageUrl = await checkinService.uploadImage(imageUri, taskId);
      await checkinService.saveImage(taskId, imageUrl);
      await taskService.completeTask(taskId, { selectedItems });
      Alert.alert('Hoàn thành nhiệm vụ!', 'Ảnh check-in đã được lưu.');
      router.replace('/daily-tasks');
    } catch (error) {
      Alert.alert('Không thể lưu check-in', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TaskCameraScaffold
      background={imageUri ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} /> : <View style={[StyleSheet.absoluteFill, cameraStyles.emptyPreview]} />}
      onBack={() => router.back()}
      footer={
        <View style={cameraStyles.finalActionsRow}>
          <TouchableOpacity disabled={isSaving} style={cameraStyles.retakeBtn} onPress={() => router.back()}>
            <Text style={cameraStyles.retakeText}>↻ CHỤP LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={isSaving} style={cameraStyles.usePhotoBtn} onPress={usePhoto}>
            <Text style={cameraStyles.usePhotoText}>{isSaving ? 'ĐANG LƯU...' : 'SỬ DỤNG ẢNH'}</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}
