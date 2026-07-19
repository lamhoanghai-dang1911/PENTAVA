import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Page5() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View style={styles.cameraContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} />
      ) : (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#222' }]} />
      )}
      
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.camBack} onPress={() => router.back()}>
          <Text style={styles.camBackText}>❮</Text>
        </TouchableOpacity>

        <View style={styles.cameraOverlayContainer}>
          <View style={styles.cameraFrame} />
        </View>

        <View style={styles.finalActionsRow}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => router.back()}>
            <Text style={styles.retakeText}>↻ CHỤP LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePhotoBtn} onPress={() => { alert('Hoàn thành nhiệm vụ!'); router.dismissAll(); }}>
            <Text style={styles.usePhotoText}>SỬ DỤNG ẢNH</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 20 },
  camBackText: { color: '#FFF', fontSize: 18 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.75, height: height * 0.45, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  finalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  retakeBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 16, borderRadius: 24, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  retakeText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  usePhotoBtn: { flex: 1, backgroundColor: '#34A853', paddingVertical: 16, borderRadius: 24, marginLeft: 12, alignItems: 'center' },
  usePhotoText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});