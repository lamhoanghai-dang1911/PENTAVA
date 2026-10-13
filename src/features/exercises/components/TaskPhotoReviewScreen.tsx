import { Design, FontFamily } from '@/src/constants/design';
import { checkinService } from '@/src/services/checkinService';
import { toAndroidSafeUri } from '@/src/services/fileUri';
import type { TaskCameraRouteParams } from '@/src/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { cameraStyles, TaskCameraScaffold } from './TaskCameraScaffold';

// Chuẩn hóa imageUri nhận từ expo-router.
// KHÔNG gọi decodeURIComponent: đường dẫn cache của Expo Go chứa tên thư mục
// có ký tự %, decode sẽ ra đường dẫn không tồn tại.
function normalizeImageUri(uri?: string | string[]): string | undefined {
  if (!uri) return undefined;
  const raw = Array.isArray(uri) ? uri[0] : uri;
  if (!raw || typeof raw !== 'string') return undefined;

  if (
    !raw.startsWith('file://') &&
    !raw.startsWith('content://') &&
    !raw.startsWith('http://') &&
    !raw.startsWith('https://') &&
    raw.startsWith('/')
  ) {
    return `file://${raw}`;
  }
  return raw;
}



export function TaskPhotoReviewScreen() {
  const router = useRouter();
  const { imageUri: rawImageUri, progressId: progressIdParam } =
    useLocalSearchParams<TaskCameraRouteParams & { imageUri?: string }>();
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // URI gốc: dùng cho upload/nén
  const imageUri = useMemo(() => {
    const normalized = normalizeImageUri(rawImageUri);
    console.log('[ReviewScreen] rawImageUri:', rawImageUri);
    console.log('[ReviewScreen] normalized imageUri:', normalized);
    return normalized;
  }, [rawImageUri]);

  // URI dùng để hiển thị trong <Image>
  const displayUri = useMemo(() => {
    if (!imageUri) return undefined;
    const uri = toAndroidSafeUri(imageUri);
    console.log('[ReviewScreen] displayUri:', uri);
    return uri;
  }, [imageUri]);

  const usePhoto = async () => {
    const progressId = Number(progressIdParam);
    if (!imageUri || !Number.isInteger(progressId) || progressId <= 0) {
      Alert.alert('Thiếu dữ liệu check-in', 'Vui lòng mở lại nhiệm vụ từ danh sách.');
      return;
    }

    setIsSaving(true);
    // Nén và upload chạy ngầm (không chặn UI), dùng URI gốc
    checkinService.uploadAndSaveInBackground(imageUri, progressId);

    // Hiện modal thành công ngay để người dùng tiếp tục
    setIsSuccessModalVisible(true);
  };

  return (
    <>
      <TaskCameraScaffold
        background={
          displayUri ? (
            <View style={StyleSheet.absoluteFill}>
              <Image
                source={{ uri: displayUri }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
                onLoad={() => {
                  console.log('[ReviewScreen] Image loaded');
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.log('[ReviewScreen] Image load error:', e.nativeEvent.error);
                  setImageLoaded(true); // ẩn overlay, tránh hiện "Đang tải" mãi
                }}
              />

              {!imageLoaded && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay]}>
                  <Text style={styles.loadingText}>Đang tải ảnh...</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[StyleSheet.absoluteFill, cameraStyles.emptyPreview]} />
          )
        }
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

      <Modal
        animationType="fade"
        onRequestClose={() => {
          setIsSuccessModalVisible(false);
          setIsSaving(false);
        }}
        transparent
        visible={isSuccessModalVisible}
      >
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
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
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