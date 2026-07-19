import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { ReactNode, useEffect, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

type TaskCameraScaffoldProps = {
  background: ReactNode;
  footer: ReactNode;
  onBack: () => void;
};

type ReviewPathname = '/page5' | '/task2/page5';

type TaskCameraCaptureScreenProps = {
  reviewPathname: ReviewPathname;
};

function TaskCameraScaffold({
  background,
  footer,
  onBack,
}: TaskCameraScaffoldProps) {
  return (
    <View style={styles.cameraContainer}>
      {background}

      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.camBack} onPress={onBack}>
          <Text style={styles.camBackText}>❮</Text>
        </TouchableOpacity>

        <View style={styles.cameraOverlayContainer}>
          <View style={styles.cameraFrame} />
        </View>

        {footer}
      </SafeAreaView>
    </View>
  );
}

function CameraPermissionFallback({
  onRequestPermission,
}: {
  onRequestPermission: () => void;
}) {
  return (
    <View style={styles.centerFallback}>
      <Text style={styles.permissionText}>Cần cấp quyền truy cập Camera để tiếp tục</Text>
      <TouchableOpacity style={styles.reqBtn} onPress={onRequestPermission}>
        <Text style={styles.reqBtnText}>Cấp quyền</Text>
      </TouchableOpacity>
    </View>
  );
}

export function TaskCameraCaptureScreen({
  reviewPathname,
}: TaskCameraCaptureScreenProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (!hasRequestedPermission.current && permission && !permission.granted) {
      hasRequestedPermission.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) {
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

      if (!photo?.uri) {
        Alert.alert('Lỗi chụp ảnh', 'Không lấy được ảnh vừa chụp.');
        return;
      }

      router.push({
        pathname: reviewPathname,
        params: { imageUri: photo.uri },
      });
    } catch {
      Alert.alert('Lỗi chụp ảnh', 'Không thể chụp ảnh lúc này.');
    }
  };

  if (!permission || !permission.granted) {
    return <CameraPermissionFallback onRequestPermission={requestPermission} />;
  }

  return (
    <TaskCameraScaffold
      background={<CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef} />}
      onBack={() => router.back()}
      footer={
        <View style={styles.cameraActions}>
          <TouchableOpacity style={styles.uploadBtn}>
            <Text style={styles.uploadText}>Tải lên từ điện thoại 📤</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureOuter} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}

export function TaskPhotoReviewScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  const completeTask = () => {
    Alert.alert('Hoàn thành nhiệm vụ!');
    router.dismissAll();
  };

  return (
    <TaskCameraScaffold
      background={
        imageUri ? (
          <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} />
        ) : (
          <View style={[StyleSheet.absoluteFillObject, styles.emptyPreview]} />
        )
      }
      onBack={() => router.back()}
      footer={
        <View style={styles.finalActionsRow}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => router.back()}>
            <Text style={styles.retakeText}>↻ CHỤP LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePhotoBtn} onPress={completeTask}>
            <Text style={styles.usePhotoText}>SỬ DỤNG ẢNH</Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  centerFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { textAlign: 'center', marginBottom: 16 },
  reqBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12 },
  reqBtnText: { color: '#fff' },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 20 },
  camBackText: { color: '#FFF', fontSize: 18 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.75, height: height * 0.45, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  cameraActions: { paddingBottom: 40, alignItems: 'center' },
  uploadBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  uploadText: { color: '#FFF', fontSize: 13 },
  captureOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  emptyPreview: { backgroundColor: '#222' },
  finalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  retakeBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 16, borderRadius: 24, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  retakeText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  usePhotoBtn: { flex: 1, backgroundColor: '#34A853', paddingVertical: 16, borderRadius: 24, marginLeft: 12, alignItems: 'center' },
  usePhotoText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});
