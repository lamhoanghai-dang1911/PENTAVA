import { Design, FontFamily } from '@/src/constants/design';
import { checkinService } from '@/src/services/checkinService';
import type { TaskCameraRouteParams } from '@/src/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cameraFrameHeight, cameraFrameWidth, cameraStyles, TaskCameraScaffold } from './TaskCameraScaffold';

function normalizeImageUri(uri?: string | string[]): string | undefined {
  if (!uri) return undefined;
  const rawUri = Array.isArray(uri) ? uri[0] : uri;
  if (!rawUri || typeof rawUri !== 'string') return undefined;

  let decoded = rawUri;
  try {
    decoded = decodeURIComponent(rawUri);
  } catch {
    decoded = rawUri;
  }

  if (
    !decoded.startsWith('file://') &&
    !decoded.startsWith('content://') &&
    !decoded.startsWith('http://') &&
    !decoded.startsWith('https://') &&
    !decoded.startsWith('data:') &&
    decoded.startsWith('/')
  ) {
    return `file://${decoded}`;
  }

  return decoded;
}

export function TaskPhotoReviewScreen() {
  const router = useRouter();
  const { imageUri: rawImageUri, progressId: progressIdParam } = useLocalSearchParams<TaskCameraRouteParams & { imageUri?: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const imageUri = useMemo(() => normalizeImageUri(rawImageUri), [rawImageUri]);

  const usePhoto = async () => {
    const progressId = Number(progressIdParam);
    if (!imageUri || !Number.isInteger(progressId) || progressId <= 0) {
      Alert.alert('Thiếu dữ liệu check-in', 'Vui lòng mở lại nhiệm vụ từ danh sách.');
      return;
    }

    try {
      setIsSaving(true);
      const uploadResult = await checkinService.uploadImage(imageUri, progressId);
      await checkinService.saveImage(progressId, uploadResult.publicUrl, uploadResult.fileSizeBytes);
      setIsSuccessModalVisible(true);
    } catch (error) {
      Alert.alert('Không thể lưu check-in', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <TaskCameraScaffold
        background={imageUri ? (
          <View style={styles.reviewBackground}>
            <View style={styles.reviewImageContainer}>
              <Image
                cachePolicy="none"
                contentFit="cover"
                source={{ uri: imageUri }}
                style={styles.reviewImage}
              />
            </View>
          </View>
        ) : <View style={[StyleSheet.absoluteFill, cameraStyles.emptyPreview]} />}
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

      <Modal animationType="fade" onRequestClose={() => setIsSuccessModalVisible(false)} transparent visible={isSuccessModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.successModal}>
            <View style={styles.successIcon}>
              <Ionicons color={Design.colors.white} name="checkmark" size={32} />
            </View>
            <Text style={styles.successTitle}>Check-in thành công</Text>
            <Text style={styles.successDescription}>Ảnh check-in đã được lưu.</Text>
            <Pressable onPress={() => router.replace('/daily-tasks')} style={styles.successButton}>
              <Text style={styles.successButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  reviewBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewImageContainer: {
    width: cameraFrameWidth,
    height: cameraFrameHeight + 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  reviewImage: {
    width: cameraFrameWidth,
    height: cameraFrameHeight + 30,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 24,
  },
  successModal: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: Design.colors.white,
    padding: 24,
  },
  successIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: Design.colors.primaryGreen,
    marginBottom: 14,
  },
  successTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    textAlign: 'center',
  },
  successDescription: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.body - 1,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  successButton: {
    width: '100%',
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: Design.colors.primaryGreen,
  },
  successButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body - 1,
  },
});
