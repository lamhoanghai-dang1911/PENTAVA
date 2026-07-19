import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Page4() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission || !permission.granted) {
      requestPermission();
    }
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
        // Truyền URI ảnh qua params tới Page 5 để hiển thị review
        router.push({
          pathname: '/task2/page5',
          params: { imageUri: photo.uri }
        });
      } catch (e) {
        console.log("Lỗi chụp ảnh:", e);
      }
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.centerFallback}>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>Cần cấp quyền truy cập Camera để tiếp tục</Text>
        <TouchableOpacity style={styles.reqBtn} onPress={requestPermission}>
          <Text style={{ color: '#fff' }}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.camBack} onPress={() => router.back()}>
            <Text style={styles.camBackText}>❮</Text>
          </TouchableOpacity>

          <View style={styles.cameraOverlayContainer}>
            <View style={styles.cameraFrame} />
          </View>

          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={styles.uploadText}>Tải lên từ điện thoại 📤</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureOuter} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  centerFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  reqBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12 },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 20 },
  camBackText: { color: '#FFF', fontSize: 18 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.75, height: height * 0.45, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  cameraActions: { paddingBottom: 40, alignItems: 'center' },
  uploadBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  uploadText: { color: '#FFF', fontSize: 13 },
  captureOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
});