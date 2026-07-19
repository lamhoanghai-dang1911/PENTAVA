import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task3Page7() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View style={styles.cameraContainer}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFillObject} />
      ) : (
        <Image source={require('../../assets/images/onboarding/meo_task3_5.png')} style={StyleSheet.absoluteFillObject} />
      )}
      
      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.camBack} onPress={() => router.back()}>
          <Text style={{ color: '#fff', fontSize: 18 }}>❮</Text>
        </TouchableOpacity>

        <View style={styles.cameraOverlayContainer}>
          <View style={styles.cameraFrame} />
        </View>

        <View style={styles.finalActionsRow}>
          <TouchableOpacity style={styles.retakeBtn} onPress={() => router.back()}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>⟳ CHỤP LẠI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePhotoBtn} onPress={() => { alert('Hoàn thành trọn vẹn Task 3!'); router.dismissAll(); }}>
            <Text style={{ color: '#FFF', fontWeight: '600' }}>SỬ DỤNG ẢNH</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginTop: 20 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.76, height: height * 0.46, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  finalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  retakeBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 15, borderRadius: 24, marginRight: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  usePhotoBtn: { flex: 1, backgroundColor: '#16A34A', paddingVertical: 15, borderRadius: 24, marginLeft: 10, alignItems: 'center' },
});