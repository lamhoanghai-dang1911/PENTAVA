import type { TaskCameraCaptureScreenProps } from '@/src/types/camera';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { FlipType, manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { CameraPermissionFallback } from './CameraPermissionFallback';
import { cameraStyles, TaskCameraScaffold } from './TaskCameraScaffold';

export function TaskCameraCaptureScreen({ reviewPathname, routeParams }: TaskCameraCaptureScreenProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = React.useState<CameraType>('back');
  const [zoom, setZoom] = React.useState(0);
  const cameraRef = useRef<CameraView>(null);
  const hasRequestedPermission = useRef(false);
  const pinchStartZoom = useSharedValue(0);
  const zoomValue = useSharedValue(0);

  const updateZoom = (value: number) => {
    const nextZoom = Math.max(0, Math.min(1, Number(value.toFixed(2))));
    zoomValue.value = nextZoom;
    setZoom(nextZoom);
  };

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStartZoom.value = zoomValue.value;
    })
    .onUpdate((event) => {
      const nextZoom = Math.max(
        0,
        Math.min(1, pinchStartZoom.value + (event.scale - 1) * 0.5),
      );
      if (Math.abs(nextZoom - zoomValue.value) >= 0.01) {
        zoomValue.value = nextZoom;
        runOnJS(setZoom)(nextZoom);
      }
    });

  useEffect(() => {
    if (!hasRequestedPermission.current && permission && !permission.granted) {
      hasRequestedPermission.current = true;
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (!photo?.uri) {
        Alert.alert('Lỗi chụp ảnh', 'Không lấy được ảnh vừa chụp.');
        return;
      }

      let imageUri = photo.uri;

      // Camera trước -> flip ngang để ảnh Review không bị mirror
      if (facing === 'front') {
        const result = await manipulateAsync(
          photo.uri,
          [
            {
              flip: FlipType.Horizontal,
            },
          ],
          {
            compress: 0.8,
            format: SaveFormat.JPEG,
          },
        );

        imageUri = result.uri;
      }

      // Camera sau: dùng nguyên ảnh gốc
      // Camera trước: dùng ảnh đã flip
      router.push({
        pathname: reviewPathname,
        params: {
          ...routeParams,
          imageUri,
        },
      });
    } catch {
      Alert.alert('Lỗi chụp ảnh', 'Không thể chụp ảnh lúc này.');
    }
  };

  if (!permission || !permission.granted) {
    return <CameraPermissionFallback onRequestPermission={requestPermission} />;
  }

  return (
    <GestureDetector gesture={pinchGesture}>
      <View collapsable={false} style={StyleSheet.absoluteFill}>
        <TaskCameraScaffold
          background={
            <CameraView
              style={StyleSheet.absoluteFill}
              facing={facing}
              ref={cameraRef}
              zoom={zoom}
            />
          }
          headerRight={
            <View style={cameraStyles.headerActions}>
              <TouchableOpacity
                style={cameraStyles.flipButton}
                onPress={() => setFacing((current) => current === 'back' ? 'front' : 'back')}>
                <Text style={cameraStyles.flipButtonText}>↻</Text>
              </TouchableOpacity>
            </View>
          }
          onBack={() => router.back()}
          footer={
            <View>
              <View style={cameraStyles.zoomControls}>
                <TouchableOpacity
                  accessibilityLabel="Thu nhỏ"
                  disabled={zoom === 0}
                  onPress={() => updateZoom(zoom - 0.1)}
                  style={[cameraStyles.zoomButton, zoom === 0 && cameraStyles.disabledControl]}>
                  <Text style={cameraStyles.zoomButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={cameraStyles.zoomLabel}>{`${Math.round(zoom * 100)}%`}</Text>
                <TouchableOpacity
                  accessibilityLabel="Phóng to"
                  disabled={zoom === 1}
                  onPress={() => updateZoom(zoom + 0.1)}
                  style={[cameraStyles.zoomButton, zoom === 1 && cameraStyles.disabledControl]}>
                  <Text style={cameraStyles.zoomButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={cameraStyles.cameraActions}>
                <TouchableOpacity style={cameraStyles.uploadBtn}>
                  <Text style={cameraStyles.uploadText}>Tải lên từ điện thoại</Text>
                </TouchableOpacity>
                <TouchableOpacity style={cameraStyles.captureOuter} onPress={takePicture}>
                  <View style={cameraStyles.captureInner} />
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      </View>
    </GestureDetector>
  );
}
