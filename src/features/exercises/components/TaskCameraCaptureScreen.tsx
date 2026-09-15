import type { TaskCameraCaptureScreenProps } from '@/src/types/camera';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraPermissionFallback } from './CameraPermissionFallback';
import { cameraStyles, TaskCameraScaffold } from './TaskCameraScaffold';

export function TaskCameraCaptureScreen({ reviewPathname, routeParams }: TaskCameraCaptureScreenProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = React.useState<CameraType>('back');
  const cameraRef = useRef<CameraView>(null);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (!hasRequestedPermission.current && permission && !permission.granted) {
      hasRequestedPermission.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) {
        Alert.alert('Lỗi chụp ảnh', 'Không lấy được ảnh vừa chụp.');
        return;
      }
      router.push({ pathname: reviewPathname, params: { ...routeParams, imageUri: photo.uri } });
    } catch {
      Alert.alert('Lỗi chụp ảnh', 'Không thể chụp ảnh lúc này.');
    }
  };

  if (!permission || !permission.granted) {
    return <CameraPermissionFallback onRequestPermission={requestPermission} />;
  }

  return (
    <TaskCameraScaffold
      background={<CameraView style={StyleSheet.absoluteFill} facing={facing} ref={cameraRef} />}
      headerRight={
        <TouchableOpacity style={cameraStyles.flipButton} onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')}>
          <Text style={cameraStyles.flipButtonText}>↻</Text>
        </TouchableOpacity>
      }
      onBack={() => router.back()}
      footer={
        <View style={cameraStyles.cameraActions}>
          <TouchableOpacity style={cameraStyles.uploadBtn}>
            <Text style={cameraStyles.uploadText}>Tải lên từ điện thoại</Text>
          </TouchableOpacity>
          <TouchableOpacity style={cameraStyles.captureOuter} onPress={takePicture}>
            <View style={cameraStyles.captureInner} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
