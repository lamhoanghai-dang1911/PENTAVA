import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task3Page6() {
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
        router.push({
          pathname: '/(task3)/page7',
          params: { imageUri: photo.uri }
        });
      } catch (e) {
        console.log("Error taking photo:", e);
      }
    }
  };

  if (!permission || !permission.granted) {
    return (
      <View style={styles.centerFallback}>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>Cấp quyền Camera để check-in vận động nhé</Text>
        <TouchableOpacity style={styles.reqBtn} onPress={requestPermission}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Cấp quyền</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef}>
        <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
          <TouchableOpacity style={styles.camBack} onPress={() => router.back()}>
            <Text style={{ color: '#fff', fontSize: 18 }}>❮</Text>
          </TouchableOpacity>

          <View style={styles.cameraOverlayContainer}>
            <View style={styles.cameraFrame} />
          </View>

          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.uploadBtn}>
              <Text style={{ color: '#FFF', fontSize: 13 }}>Tải lên từ điện thoại 📤</Text>
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
  reqBtn: { backgroundColor: '#15803D', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 24 },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 20 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.76, height: height * 0.46, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  cameraActions: { paddingBottom: 40, alignItems: 'center' },
  uploadBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  captureOuter: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF' },
});